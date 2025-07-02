import { AITool, aiToolsDatabase, getRecommendedTools } from "@/data/aiToolsDatabase";
import { FrameworkGenerationRequest, BuilderToolRecommendation } from "./frameworkGenerator";

export interface EnhancedRecommendation {
  tool: AITool;
  suitabilityScore: number;
  reasons: string[];
  estimatedTime: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  costAnalysis: CostAnalysis;
  alternativeTools: AITool[];
  quickStartGuide: string[];
  integrationTips: string[];
}

export interface CostAnalysis {
  initialCost: string;
  monthlyEstimate: string;
  scalingCost: string;
  freeAlternatives: string[];
}

export interface RecommendationFilters {
  budget: 'free' | 'freemium' | 'paid' | 'any';
  complexity: 'simple' | 'medium' | 'complex';
  timeline: 'urgent' | 'normal' | 'flexible';
  teamSize: 'solo' | 'small' | 'large';
  experience: 'beginner' | 'intermediate' | 'expert';
}

export class EnhancedToolRecommenderService {
  /**
   * Get enhanced tool recommendations based on framework requirements
   */
  static getEnhancedRecommendations(
    request: FrameworkGenerationRequest,
    filters?: Partial<RecommendationFilters>
  ): EnhancedRecommendation[] {
    try {
      const defaultFilters: RecommendationFilters = {
        budget: 'any',
        complexity: request.complexity,
        timeline: 'normal',
        teamSize: 'solo',
        experience: 'intermediate',
        ...filters
      };

      // Get base recommendations
      const baseTools = this.getFilteredTools(request, defaultFilters);

      if (baseTools.length === 0) {
        // Return fallback recommendations if no tools match
        return this.getFallbackRecommendations(request);
      }

      // Enhance each recommendation
      const enhancedRecommendations = baseTools.map(tool =>
        this.enhanceRecommendation(tool, request, defaultFilters)
      );

      // Sort by suitability score and return top recommendations
      return enhancedRecommendations
        .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
        .slice(0, 6);
    } catch (error) {
      console.error('Tool recommendation error:', error);
      return this.getFallbackRecommendations(request);
    }
  }

  /**
   * Get tools filtered by request and user preferences
   */
  private static getFilteredTools(
    request: FrameworkGenerationRequest,
    filters: RecommendationFilters
  ): AITool[] {
    let filteredTools = aiToolsDatabase;

    // Filter by budget
    if (filters.budget !== 'any') {
      filteredTools = filteredTools.filter(tool => tool.pricing.model === filters.budget);
    }

    // Filter by platform compatibility
    filteredTools = filteredTools.filter(tool => 
      request.platforms.some(platform => tool.platforms.includes(platform as any))
    );

    // Filter by app type relevance
    filteredTools = filteredTools.filter(tool => {
      const appTypeKeywords = request.appType.replace('-', ' ').split(' ');
      return tool.bestFor.some(use => 
        appTypeKeywords.some(keyword => 
          use.toLowerCase().includes(keyword.toLowerCase())
        )
      ) || tool.useCases.some(useCase =>
        appTypeKeywords.some(keyword =>
          useCase.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    });

    return filteredTools;
  }

  /**
   * Enhance a basic tool recommendation with detailed analysis
   */
  private static enhanceRecommendation(
    tool: AITool,
    request: FrameworkGenerationRequest,
    filters: RecommendationFilters
  ): EnhancedRecommendation {
    const suitabilityScore = this.calculateDetailedSuitabilityScore(tool, request, filters);
    const reasons = this.generateDetailedReasons(tool, request, filters);
    const estimatedTime = this.calculateEstimatedTime(tool, request, filters);
    const complexity = this.determineComplexity(tool, request);
    const costAnalysis = this.analyzeCosts(tool, request);
    const alternativeTools = this.findAlternativeTools(tool, request);
    const quickStartGuide = this.generateQuickStartGuide(tool, request);
    const integrationTips = this.generateIntegrationTips(tool, request);

    return {
      tool,
      suitabilityScore,
      reasons,
      estimatedTime,
      complexity,
      costAnalysis,
      alternativeTools,
      quickStartGuide,
      integrationTips
    };
  }

  /**
   * Calculate detailed suitability score with multiple factors
   */
  private static calculateDetailedSuitabilityScore(
    tool: AITool,
    request: FrameworkGenerationRequest,
    filters: RecommendationFilters
  ): number {
    let score = tool.popularity || 50; // Base score from popularity

    // Platform compatibility (25 points)
    if (request.platforms.some(p => tool.platforms.includes(p as any))) {
      score += 25;
    }

    // App type relevance (20 points)
    const appTypeMatch = tool.bestFor.some(use =>
      use.toLowerCase().includes(request.appType.replace('-', ' '))
    );
    if (appTypeMatch) score += 20;

    // Budget compatibility (15 points)
    if (filters.budget === 'any' || tool.pricing.model === filters.budget) {
      score += 15;
      if (tool.pricing.model === 'free') score += 5; // Bonus for free tools
    }

    // Complexity match (15 points)
    const complexityMatch = this.getComplexityScore(tool, request.complexity);
    score += complexityMatch;

    // Feature alignment (10 points)
    const featureMatches = request.keyFeatures.filter(feature =>
      tool.features.some(toolFeature =>
        toolFeature.toLowerCase().includes(feature.toLowerCase()) ||
        feature.toLowerCase().includes(toolFeature.toLowerCase())
      )
    ).length;
    score += Math.min(featureMatches * 2, 10);

    // Timeline compatibility (10 points)
    if (filters.timeline === 'urgent' && tool.category === 'app-builders') {
      score += 10; // No-code tools are faster for urgent projects
    }

    // Experience level match (5 points)
    if (filters.experience === 'beginner' && tool.category === 'app-builders') {
      score += 5;
    } else if (filters.experience === 'expert' && tool.category === 'dev-ides') {
      score += 5;
    }

    return Math.min(score, 100);
  }

  private static getComplexityScore(tool: AITool, projectComplexity: string): number {
    const toolComplexityMap: Record<string, number> = {
      'app-builders': 15, // Great for simple to medium complexity
      'ui-ux': 10,        // Good for design-focused projects
      'dev-ides': 5,      // Better for complex projects
      'backend': 8,       // Moderate complexity handling
      'deployment': 12    // Good for all complexity levels
    };

    const complexityBonus: Record<string, Record<string, number>> = {
      'simple': { 'app-builders': 5, 'ui-ux': 3 },
      'medium': { 'app-builders': 3, 'dev-ides': 2 },
      'complex': { 'dev-ides': 5, 'backend': 3 }
    };

    let score = toolComplexityMap[tool.category] || 5;
    score += complexityBonus[projectComplexity]?.[tool.category] || 0;

    return score;
  }

  /**
   * Generate detailed reasons for recommendation
   */
  private static generateDetailedReasons(
    tool: AITool,
    request: FrameworkGenerationRequest,
    filters: RecommendationFilters
  ): string[] {
    const reasons: string[] = [];

    // Platform compatibility
    if (request.platforms.some(p => tool.platforms.includes(p as any))) {
      reasons.push(`Supports ${request.platforms.join(' and ')} platforms`);
    }

    // Pricing advantage
    if (tool.pricing.model === 'free') {
      reasons.push('Completely free - perfect for MVP testing');
    } else if (tool.pricing.model === 'freemium') {
      reasons.push('Free tier available for getting started');
    }

    // App type alignment
    if (tool.bestFor.some(use => use.toLowerCase().includes(request.appType.replace('-', ' ')))) {
      reasons.push(`Specifically designed for ${request.appType.replace('-', ' ')} development`);
    }

    // Complexity match
    if (request.complexity === 'simple' && tool.category === 'app-builders') {
      reasons.push('No-code solution perfect for simple MVPs');
    } else if (request.complexity === 'complex' && tool.category === 'dev-ides') {
      reasons.push('Advanced development capabilities for complex requirements');
    }

    // Feature alignment
    const matchingFeatures = request.keyFeatures.filter(feature =>
      tool.features.some(toolFeature =>
        toolFeature.toLowerCase().includes(feature.toLowerCase())
      )
    );
    if (matchingFeatures.length > 0) {
      reasons.push(`Built-in support for ${matchingFeatures.slice(0, 2).join(' and ')}`);
    }

    // Popularity and reliability
    if (tool.popularity >= 85) {
      reasons.push('Highly popular and trusted by developers');
    }

    // Timeline benefits
    if (filters.timeline === 'urgent' && tool.category === 'app-builders') {
      reasons.push('Rapid development capabilities for quick MVP launch');
    }

    return reasons.slice(0, 4); // Limit to top 4 reasons
  }

  /**
   * Calculate estimated time to MVP
   */
  private static calculateEstimatedTime(
    tool: AITool,
    request: FrameworkGenerationRequest,
    filters: RecommendationFilters
  ): string {
    const baseTimeMap: Record<string, Record<string, number>> = {
      'simple': {
        'app-builders': 2,   // 2 days
        'ui-ux': 1,         // 1 day
        'dev-ides': 5,      // 5 days
        'backend': 3        // 3 days
      },
      'medium': {
        'app-builders': 7,   // 1 week
        'ui-ux': 3,         // 3 days
        'dev-ides': 14,     // 2 weeks
        'backend': 7        // 1 week
      },
      'complex': {
        'app-builders': 14,  // 2 weeks
        'ui-ux': 7,         // 1 week
        'dev-ides': 28,     // 4 weeks
        'backend': 14       // 2 weeks
      }
    };

    let baseDays = baseTimeMap[request.complexity]?.[tool.category] || 7;

    // Adjust for experience level
    if (filters.experience === 'beginner') {
      baseDays *= 1.5;
    } else if (filters.experience === 'expert') {
      baseDays *= 0.7;
    }

    // Adjust for timeline pressure
    if (filters.timeline === 'urgent') {
      baseDays *= 0.8; // Faster with focused effort
    }

    // Convert to readable format
    if (baseDays <= 1) return '1 day';
    if (baseDays <= 7) return `${Math.ceil(baseDays)} days`;
    if (baseDays <= 14) return `${Math.ceil(baseDays / 7)} week${baseDays > 7 ? 's' : ''}`;
    return `${Math.ceil(baseDays / 7)} weeks`;
  }

  /**
   * Determine complexity level for the user
   */
  private static determineComplexity(
    tool: AITool,
    request: FrameworkGenerationRequest
  ): 'beginner' | 'intermediate' | 'advanced' {
    if (tool.category === 'app-builders') return 'beginner';
    if (tool.category === 'dev-ides') return 'advanced';
    if (tool.category === 'ui-ux') return 'beginner';
    if (tool.category === 'backend') return 'intermediate';
    return 'intermediate';
  }

  /**
   * Analyze costs for the tool
   */
  private static analyzeCosts(tool: AITool, request: FrameworkGenerationRequest): CostAnalysis {
    const monthlyEstimate = this.estimateMonthlyUsage(tool, request);
    const scalingCost = this.estimateScalingCosts(tool, request);
    const freeAlternatives = this.findFreeAlternatives(tool);

    return {
      initialCost: tool.pricing.model === 'free' ? 'Free' : tool.pricing.inr,
      monthlyEstimate,
      scalingCost,
      freeAlternatives
    };
  }

  private static estimateMonthlyUsage(tool: AITool, request: FrameworkGenerationRequest): string {
    if (tool.pricing.model === 'free') return 'Free';
    
    // Extract numeric value from pricing string
    const priceMatch = tool.pricing.inr.match(/₹([\d,]+)/);
    if (!priceMatch) return tool.pricing.inr;
    
    const basePrice = parseInt(priceMatch[1].replace(',', ''));
    
    // Estimate based on app complexity
    const usageMultiplier = {
      'simple': 1,
      'medium': 1.5,
      'complex': 2.5
    };
    
    const estimatedCost = basePrice * (usageMultiplier[request.complexity] || 1);
    return `₹${estimatedCost.toLocaleString()}/mo`;
  }

  private static estimateScalingCosts(tool: AITool, request: FrameworkGenerationRequest): string {
    if (tool.pricing.model === 'free') return 'Always free';
    
    const scalingFactors = {
      'simple': 'Low scaling costs',
      'medium': 'Moderate scaling costs',
      'complex': 'Higher scaling costs as you grow'
    };
    
    return scalingFactors[request.complexity] || 'Moderate scaling costs';
  }

  private static findFreeAlternatives(tool: AITool): string[] {
    const freeTools = aiToolsDatabase
      .filter(t => t.pricing.model === 'free' && t.category === tool.category)
      .map(t => t.name)
      .slice(0, 3);
    
    return freeTools;
  }

  /**
   * Find alternative tools in the same category
   */
  private static findAlternativeTools(tool: AITool, request: FrameworkGenerationRequest): AITool[] {
    return aiToolsDatabase
      .filter(t => 
        t.id !== tool.id && 
        t.category === tool.category &&
        request.platforms.some(p => t.platforms.includes(p as any))
      )
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 3);
  }

  /**
   * Generate quick start guide
   */
  private static generateQuickStartGuide(tool: AITool, request: FrameworkGenerationRequest): string[] {
    const baseSteps = [
      `Sign up at ${tool.officialUrl}`,
      'Complete the onboarding process',
      'Create your first project',
      'Import or create your initial design',
      'Configure settings for your app type',
      'Start building your MVP'
    ];

    // Customize based on tool category
    if (tool.category === 'app-builders') {
      return [
        `Sign up at ${tool.officialUrl}`,
        'Choose a template or start from scratch',
        'Use the visual editor to design your pages',
        'Add functionality with built-in components',
        'Preview and test your app',
        'Publish your MVP'
      ];
    }

    return baseSteps;
  }

  /**
   * Generate integration tips
   */
  private static generateIntegrationTips(tool: AITool, request: FrameworkGenerationRequest): string[] {
    const tips: string[] = [];

    // Platform-specific tips
    if (request.platforms.includes('android') || request.platforms.includes('ios')) {
      tips.push('Test on both iOS and Android devices regularly');
      tips.push('Optimize for mobile performance and battery usage');
    }

    if (request.platforms.includes('web')) {
      tips.push('Ensure responsive design across different screen sizes');
      tips.push('Optimize for web performance and SEO');
    }

    // Tool-specific tips
    if (tool.category === 'app-builders') {
      tips.push('Start with pre-built templates to save time');
      tips.push('Use the platform\'s component library for consistency');
    }

    if (tool.category === 'backend') {
      tips.push('Set up proper authentication and security from the start');
      tips.push('Plan your database schema before implementation');
    }

    // General tips
    tips.push('Deploy early and iterate based on user feedback');
    tips.push('Keep your MVP scope minimal and focused');

    return tips.slice(0, 4);
  }

  /**
   * Get tool recommendations by category
   */
  static getToolsByCategory(
    category: string,
    request: FrameworkGenerationRequest,
    limit: number = 5
  ): EnhancedRecommendation[] {
    const categoryTools = aiToolsDatabase.filter(tool => tool.category === category);
    
    return categoryTools
      .map(tool => this.enhanceRecommendation(tool, request, {
        budget: 'any',
        complexity: request.complexity,
        timeline: 'normal',
        teamSize: 'solo',
        experience: 'intermediate'
      }))
      .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
      .slice(0, limit);
  }

  /**
   * Get personalized tool recommendations based on user preferences
   */
  static getPersonalizedRecommendations(
    request: FrameworkGenerationRequest,
    userPreferences: {
      preferredTools?: string[];
      avoidedTools?: string[];
      budgetLimit?: number;
      experienceLevel?: 'beginner' | 'intermediate' | 'expert';
    }
  ): EnhancedRecommendation[] {
    let tools = aiToolsDatabase;

    // Filter out avoided tools
    if (userPreferences.avoidedTools?.length) {
      tools = tools.filter(tool => !userPreferences.avoidedTools!.includes(tool.id));
    }

    // Boost preferred tools
    const recommendations = tools.map(tool => {
      const enhanced = this.enhanceRecommendation(tool, request, {
        budget: 'any',
        complexity: request.complexity,
        timeline: 'normal',
        teamSize: 'solo',
        experience: userPreferences.experienceLevel || 'intermediate'
      });

      // Boost score for preferred tools
      if (userPreferences.preferredTools?.includes(tool.id)) {
        enhanced.suitabilityScore += 20;
      }

      return enhanced;
    });

    return recommendations
      .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
      .slice(0, 8);
  }

  /**
   * Get fallback recommendations when main recommendation fails
   */
  private static getFallbackRecommendations(request: FrameworkGenerationRequest): EnhancedRecommendation[] {
    const fallbackTools = [
      {
        id: 'framer',
        name: 'Framer',
        category: 'app-builders',
        description: 'Design and publish websites with AI-powered design tools',
        pricing: { model: 'freemium' as const, inr: 'Free / ₹1,200+/mo', details: 'AI website generation' },
        features: ['AI website generation', 'Responsive design'],
        bestFor: ['Landing pages', 'Marketing websites'],
        officialUrl: 'https://framer.com',
        tags: ['Website Builder', 'AI Design'],
        apiCompatible: false,
        popularity: 88,
        whyRecommend: 'Perfect for creating stunning MVP landing pages with AI',
        useCases: ['MVP landing pages', 'Portfolio sites'],
        platforms: ['web' as const]
      },
      {
        id: 'bubble',
        name: 'Bubble',
        category: 'app-builders',
        description: 'Full-stack no-code platform for building web applications',
        pricing: { model: 'freemium' as const, inr: 'Free / ₹2,000+/mo', details: 'Full-stack development' },
        features: ['Visual programming', 'Database management'],
        bestFor: ['Web applications', 'SaaS platforms'],
        officialUrl: 'https://bubble.io',
        tags: ['No-Code', 'Full-Stack'],
        apiCompatible: true,
        popularity: 80,
        whyRecommend: 'Complete no-code solution for building complex SaaS MVPs',
        useCases: ['SaaS applications', 'Marketplaces'],
        platforms: ['web' as const]
      }
    ];

    return fallbackTools.map(tool => ({
      tool,
      suitabilityScore: 75,
      reasons: ['Reliable fallback option', 'Good for MVP development'],
      estimatedTime: '1-2 weeks',
      complexity: 'beginner' as const,
      costAnalysis: {
        initialCost: 'Free',
        monthlyEstimate: tool.pricing.inr,
        scalingCost: 'Moderate scaling costs',
        freeAlternatives: ['Other free tools available']
      },
      alternativeTools: [],
      quickStartGuide: [
        `Sign up at ${tool.officialUrl}`,
        'Complete the onboarding process',
        'Create your first project',
        'Start building your MVP'
      ],
      integrationTips: [
        'Start with pre-built templates',
        'Focus on core features first',
        'Test regularly during development'
      ]
    }));
  }
}
