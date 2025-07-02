// AI Prompt Engine - Core AI breakdown system
import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiProviderService } from './aiProviderService';
import { AIRequest } from '@/types/aiProvider';

export interface StartupAnalysis {
  problemStatement: string;
  targetMarket: {
    primary: string;
    secondary: string[];
    size: string;
    demographics: string;
  };
  monetization: {
    model: string;
    pricing: string;
    revenue_streams: string[];
    projected_revenue: string;
  };
  mvpStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    hosting: string[];
    analytics: string[];
  };
  vertical: string;
  format: string;
  complexity: 'simple' | 'medium' | 'complex';
  timeToMarket: string;
  estimatedCost: string;
  keyFeatures: string[];
  competitorAnalysis: {
    direct: string[];
    indirect: string[];
    advantages: string[];
  };
  riskFactors: string[];
  successMetrics: string[];
}

export interface ToolRecommendation {
  category: string;
  tool: string;
  description: string;
  pricing: 'free' | 'freemium' | 'paid';
  cost: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  url: string;
  prefillData?: Record<string, any>;
  alternatives: string[];
  pros: string[];
  cons: string[];
}

export interface StartupBrief {
  analysis: StartupAnalysis;
  tools: ToolRecommendation[];
  roadmap: WeeklyMilestone[];
  launchPath: LaunchStep[];
  estimatedTimeline: string;
  totalCost: string;
  confidenceScore: number;
}

export interface WeeklyMilestone {
  week: number;
  title: string;
  description: string;
  tasks: string[];
  tools: string[];
  deliverables: string[];
  estimatedHours: number;
}

export interface LaunchStep {
  phase: string;
  title: string;
  description: string;
  duration: string;
  prerequisites: string[];
  outcomes: string[];
}

class AIEngine {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private userId?: string;

  constructor(userId?: string) {
    // Keep backward compatibility with hardcoded Gemini
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('VITE_GEMINI_API_KEY is not configured - will use user provider if available');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }

    this.userId = userId;
  }

  /**
   * Generate AI response using user's provider or fallback
   */
  private async generateAIResponse(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      // Try to use user's configured provider first
      if (this.userId) {
        try {
          const request: AIRequest = {
            prompt,
            systemPrompt,
            temperature: 0.7,
            maxTokens: 2000
          };

          const response = await aiProviderService.generateResponse(this.userId, request);
          return response.content;
        } catch (error) {
          console.warn('User provider failed, falling back to default:', error);
        }
      }

      // Fallback to hardcoded Gemini if available
      if (this.model) {
        const fullPrompt = systemPrompt
          ? `${systemPrompt}\n\nUser: ${prompt}`
          : prompt;

        const result = await this.model.generateContent({
          contents: [{
            role: "user",
            parts: [{ text: fullPrompt }]
          }]
        });

        const response = await result.response;
        return response.text();
      }

      throw new Error('No AI provider available');
    } catch (error) {
      console.error('AI response generation failed:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async analyzeStartupIdea(prompt: string): Promise<StartupBrief> {
    try {
      // Step 1: Extract intent and basic analysis
      const intentAnalysis = await this.extractIntent(prompt);
      
      // Step 2: Generate detailed startup analysis
      const analysis = await this.generateStartupAnalysis(prompt, intentAnalysis);
      
      // Step 3: Match tools based on analysis
      const tools = await this.matchTools(analysis);
      
      // Step 4: Generate roadmap and launch path
      const roadmap = await this.generateRoadmap(analysis, tools);
      const launchPath = await this.generateLaunchPath(analysis);
      
      // Step 5: Calculate estimates
      const estimates = this.calculateEstimates(tools, roadmap);
      
      return {
        analysis,
        tools,
        roadmap,
        launchPath,
        estimatedTimeline: estimates.timeline,
        totalCost: estimates.cost,
        confidenceScore: this.calculateConfidenceScore(analysis, tools)
      };
    } catch (error) {
      console.error('AI Engine Error:', error);
      throw new Error('Failed to analyze startup idea');
    }
  }

  private async extractIntent(prompt: string): Promise<any> {
    const systemPrompt = `
    You are an expert startup analyst. Extract the following from the user's idea:
    - Intent (what they want to build)
    - Vertical (industry/market)
    - Format (app, web, service, etc.)
    - Target audience
    - Core functionality

    Return as JSON with these exact keys: intent, vertical, format, audience, functionality
    `;

    try {
      const text = await this.generateAIResponse(prompt, systemPrompt);

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback parsing
      return {
        intent: prompt.split(' ').slice(0, 5).join(' '),
        vertical: 'general',
        format: 'app',
        audience: 'general users',
        functionality: 'basic features'
      };
    } catch (error) {
      console.error('Intent extraction error:', error);
      return {
        intent: prompt,
        vertical: 'general',
        format: 'app',
        audience: 'general users',
        functionality: 'basic features'
      };
    }
  }

  private async generateStartupAnalysis(prompt: string, intent: any): Promise<StartupAnalysis> {
    const systemPrompt = `
    You are a senior startup consultant with expertise in market analysis, business models, and tech stacks.

    Based on the user's idea and intent analysis, provide a comprehensive startup analysis.

    Focus on:
    1. Clear problem statement
    2. Detailed target market analysis
    3. Viable monetization strategies
    4. Appropriate tech stack recommendations
    5. Realistic market positioning

    Return as JSON matching this exact structure:
    {
      "problemStatement": "string",
      "targetMarket": {
        "primary": "string",
        "secondary": ["string"],
        "size": "string",
        "demographics": "string"
      },
      "monetization": {
        "model": "string",
        "pricing": "string",
        "revenue_streams": ["string"],
        "projected_revenue": "string"
      },
      "mvpStack": {
        "frontend": ["string"],
        "backend": ["string"],
        "database": ["string"],
        "hosting": ["string"],
        "analytics": ["string"]
      },
      "vertical": "string",
      "format": "string",
      "complexity": "simple|medium|complex",
      "timeToMarket": "string",
      "estimatedCost": "string",
      "keyFeatures": ["string"],
      "competitorAnalysis": {
        "direct": ["string"],
        "indirect": ["string"],
        "advantages": ["string"]
      },
      "riskFactors": ["string"],
      "successMetrics": ["string"]
    }
    `;

    try {
      const analysisPrompt = `Original idea: "${prompt}"\nIntent analysis: ${JSON.stringify(intent)}\n\nProvide comprehensive startup analysis as JSON.`;
      const text = await this.generateAIResponse(analysisPrompt, systemPrompt);

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback analysis
      return this.generateFallbackAnalysis(prompt, intent);
    } catch (error) {
      console.error('Startup analysis error:', error);
      return this.generateFallbackAnalysis(prompt, intent);
    }
  }

  private generateFallbackAnalysis(prompt: string, intent: any): StartupAnalysis {
    return {
      problemStatement: prompt,
      targetMarket: {
        primary: intent.audience || 'General users',
        secondary: ['Early adopters', 'Tech-savvy users'],
        size: 'Medium market opportunity',
        demographics: 'Ages 25-45, tech-comfortable'
      },
      monetization: {
        model: 'Freemium',
        pricing: '$9.99/month premium',
        revenue_streams: ['Subscription fees', 'Premium features'],
        projected_revenue: '$10K-50K MRR in year 1'
      },
      mvpStack: {
        frontend: ['React', 'Next.js'],
        backend: ['Node.js', 'Express'],
        database: ['PostgreSQL', 'Supabase'],
        hosting: ['Vercel', 'Railway'],
        analytics: ['Google Analytics', 'Mixpanel']
      },
      vertical: intent.vertical || 'General',
      format: intent.format || 'Web App',
      complexity: 'medium',
      timeToMarket: '3-6 months',
      estimatedCost: '$5,000-15,000',
      keyFeatures: [intent.functionality || 'Core functionality', 'User authentication', 'Dashboard'],
      competitorAnalysis: {
        direct: ['Similar apps in market'],
        indirect: ['Alternative solutions'],
        advantages: ['Better UX', 'Lower cost', 'Faster performance']
      },
      riskFactors: ['Market competition', 'Technical challenges', 'User adoption'],
      successMetrics: ['User growth', 'Revenue', 'User engagement']
    };
  }

  private async matchTools(analysis: StartupAnalysis): Promise<ToolRecommendation[]> {
    // Use the tool matcher service instead of AI for now
    const { toolMatcher } = await import('./toolMatcher');
    return await toolMatcher.matchTools(analysis);
  }

  private async generateRoadmap(analysis: StartupAnalysis, tools: ToolRecommendation[]): Promise<WeeklyMilestone[]> {
    // Generate a basic roadmap for now
    return [
      {
        week: 1,
        title: "Project Setup & Planning",
        description: "Initialize project structure and plan development approach",
        tasks: ["Set up development environment", "Create project structure", "Define requirements"],
        tools: tools.slice(0, 2).map(t => t.tool),
        deliverables: ["Project setup", "Requirements document"],
        estimatedHours: 20
      },
      {
        week: 2,
        title: "Design & Architecture",
        description: "Create UI/UX designs and system architecture",
        tasks: ["Create wireframes", "Design system architecture", "Set up database"],
        tools: tools.slice(0, 3).map(t => t.tool),
        deliverables: ["UI designs", "System architecture"],
        estimatedHours: 25
      },
      {
        week: 3,
        title: "Core Development - Phase 1",
        description: "Implement core functionality",
        tasks: ["Build authentication", "Create main dashboard", "Implement core features"],
        tools: tools.map(t => t.tool),
        deliverables: ["Working authentication", "Basic dashboard"],
        estimatedHours: 30
      },
      {
        week: 4,
        title: "Core Development - Phase 2",
        description: "Complete core features and integrations",
        tasks: ["Integrate APIs", "Add data management", "Implement user flows"],
        tools: tools.map(t => t.tool),
        deliverables: ["API integrations", "Data management"],
        estimatedHours: 35
      }
    ];
  }

  private async generateLaunchPath(analysis: StartupAnalysis): Promise<LaunchStep[]> {
    const systemPrompt = `
    Create a comprehensive launch strategy with 5-7 phases:
    1. MVP Development
    2. Beta Testing
    3. Market Validation
    4. Product Launch
    5. Growth & Scaling
    6. Funding (if applicable)

    Return as LaunchStep array with clear phases and outcomes.
    `;

    try {
      const text = await this.generateAIResponse(JSON.stringify(analysis), systemPrompt);

      // Try to parse JSON response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback to default launch path
      return this.getDefaultLaunchPath();
    } catch (error) {
      console.error('Launch path generation failed:', error);
      return this.getDefaultLaunchPath();
    }
  }

  private getDefaultLaunchPath(): LaunchStep[] {
    return [
      {
        phase: "MVP Development",
        title: "Build Minimum Viable Product",
        description: "Develop core features and basic functionality",
        duration: "2-4 months",
        prerequisites: ["Market research", "Technical planning"],
        outcomes: ["Working prototype", "Core features implemented"]
      },
      {
        phase: "Beta Testing",
        title: "Limited User Testing",
        description: "Release to small group of early adopters",
        duration: "4-6 weeks",
        prerequisites: ["MVP completed", "Test user recruitment"],
        outcomes: ["User feedback", "Bug fixes", "Feature refinements"]
      },
      {
        phase: "Market Validation",
        title: "Validate Product-Market Fit",
        description: "Confirm market demand and refine positioning",
        duration: "2-3 months",
        prerequisites: ["Beta feedback", "Market analysis"],
        outcomes: ["Validated assumptions", "Refined value proposition"]
      },
      {
        phase: "Product Launch",
        title: "Public Launch",
        description: "Official product launch to target market",
        duration: "1-2 months",
        prerequisites: ["Market validation", "Marketing strategy"],
        outcomes: ["Public availability", "Initial user acquisition"]
      },
      {
        phase: "Growth & Scaling",
        title: "Scale Operations",
        description: "Focus on user growth and feature expansion",
        duration: "6-12 months",
        prerequisites: ["Successful launch", "User traction"],
        outcomes: ["User growth", "Feature expansion", "Market expansion"]
      }
    ];
  }

  private calculateEstimates(tools: ToolRecommendation[], roadmap: WeeklyMilestone[]): { timeline: string; cost: string } {
    const totalWeeks = roadmap.length;
    const totalHours = roadmap.reduce((sum, week) => sum + week.estimatedHours, 0);
    
    const toolCosts = tools.reduce((sum, tool) => {
      if (tool.pricing === 'free') return sum;
      if (tool.pricing === 'freemium') return sum + 20; // Average freemium cost
      return sum + 50; // Average paid tool cost
    }, 0);

    return {
      timeline: `${totalWeeks} weeks (${totalHours} hours)`,
      cost: `$${toolCosts + 500}-${toolCosts + 2000}` // Including development costs
    };
  }

  private calculateConfidenceScore(analysis: StartupAnalysis, tools: ToolRecommendation[]): number {
    let score = 70; // Base score
    
    // Adjust based on market size
    if (analysis.targetMarket.size.includes('large')) score += 10;
    if (analysis.targetMarket.size.includes('small')) score -= 5;
    
    // Adjust based on complexity
    if (analysis.complexity === 'simple') score += 15;
    if (analysis.complexity === 'complex') score -= 10;
    
    // Adjust based on tool availability
    const freeTools = tools.filter(t => t.pricing === 'free').length;
    score += freeTools * 2;
    
    return Math.min(95, Math.max(40, score));
  }

  private getToolDatabase(): any[] {
    return [
      // Web App MVP Tools
      {
        category: 'Web App MVP',
        tools: [
          {
            name: 'Glide',
            description: 'No-code app builder from spreadsheets',
            pricing: 'freemium',
            cost: '$25/month',
            difficulty: 'beginner',
            url: 'https://glideapps.com',
            pros: ['Easy to use', 'Quick setup', 'Good for data-driven apps'],
            cons: ['Limited customization', 'Spreadsheet dependency']
          },
          {
            name: 'FlutterFlow',
            description: 'Visual app development platform',
            pricing: 'freemium',
            cost: '$30/month',
            difficulty: 'intermediate',
            url: 'https://flutterflow.io',
            pros: ['Native apps', 'Custom code support', 'Firebase integration'],
            cons: ['Learning curve', 'Flutter knowledge helpful']
          }
        ]
      },
      // Add more tool categories...
    ];
  }
}

// Export singleton instance (for backward compatibility)
export const aiEngine = new AIEngine();

// Export factory function for user-specific instances
export const createAIEngine = (userId?: string) => new AIEngine(userId);

// Export class for direct instantiation
export { AIEngine };
export default AIEngine;
