// Tool Matchmaker System - Intelligent tool recommendation engine
import { ToolRecommendation, StartupAnalysis } from './aiEngine';

export interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  pricing: 'free' | 'freemium' | 'paid';
  cost: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  url: string;
  features: string[];
  pros: string[];
  cons: string[];
  alternatives: string[];
  integrations: string[];
  useCases: string[];
  tags: string[];
  rating: number;
  reviews: number;
  prefillTemplates?: Record<string, any>;
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  essential: boolean;
  tools: Tool[];
}

class ToolMatcher {
  private toolDatabase: ToolCategory[] = [];

  constructor() {
    this.initializeToolDatabase();
  }

  async matchTools(analysis: StartupAnalysis): Promise<ToolRecommendation[]> {
    const recommendations: ToolRecommendation[] = [];
    
    // Essential categories for any startup
    const essentialCategories = [
      'landing-page',
      'mvp-builder',
      'backend',
      'analytics',
      'design'
    ];

    // Match tools based on vertical and requirements
    for (const categoryId of essentialCategories) {
      const category = this.toolDatabase.find(c => c.id === categoryId);
      if (category) {
        const bestTool = this.findBestToolInCategory(category, analysis);
        if (bestTool) {
          recommendations.push(this.convertToRecommendation(bestTool, category.name));
        }
      }
    }

    // Add specialized tools based on vertical
    const specializedTools = this.getSpecializedTools(analysis);
    recommendations.push(...specializedTools);

    return recommendations.slice(0, 8); // Limit to 8 recommendations
  }

  private findBestToolInCategory(category: ToolCategory, analysis: StartupAnalysis): Tool | null {
    const tools = category.tools;
    
    // Score each tool based on analysis
    const scoredTools = tools.map(tool => ({
      tool,
      score: this.calculateToolScore(tool, analysis)
    }));

    // Sort by score and return best match
    scoredTools.sort((a, b) => b.score - a.score);
    return scoredTools[0]?.tool || null;
  }

  private calculateToolScore(tool: Tool, analysis: StartupAnalysis): number {
    let score = tool.rating * 10; // Base score from rating

    // Prefer free/freemium for beginners
    if (tool.pricing === 'free') score += 20;
    if (tool.pricing === 'freemium') score += 15;

    // Prefer beginner-friendly tools
    if (tool.difficulty === 'beginner') score += 15;
    if (tool.difficulty === 'intermediate') score += 10;

    // Match use cases
    const matchingUseCases = tool.useCases.filter(useCase => 
      analysis.vertical.toLowerCase().includes(useCase.toLowerCase()) ||
      analysis.format.toLowerCase().includes(useCase.toLowerCase())
    );
    score += matchingUseCases.length * 5;

    // Match tags
    const matchingTags = tool.tags.filter(tag => 
      analysis.keyFeatures.some(feature => 
        feature.toLowerCase().includes(tag.toLowerCase())
      )
    );
    score += matchingTags.length * 3;

    // Complexity adjustment
    if (analysis.complexity === 'simple' && tool.difficulty === 'beginner') score += 10;
    if (analysis.complexity === 'complex' && tool.difficulty === 'advanced') score += 5;

    return score;
  }

  private getSpecializedTools(analysis: StartupAnalysis): ToolRecommendation[] {
    const specialized: ToolRecommendation[] = [];

    // Add AI/ML tools if needed
    if (analysis.keyFeatures.some(f => f.toLowerCase().includes('ai') || f.toLowerCase().includes('ml'))) {
      const aiTools = this.toolDatabase.find(c => c.id === 'ai-ml')?.tools || [];
      const bestAI = aiTools[0]; // Get top AI tool
      if (bestAI) {
        specialized.push(this.convertToRecommendation(bestAI, 'AI/ML'));
      }
    }

    // Add e-commerce tools if needed
    if (analysis.monetization.model.toLowerCase().includes('ecommerce') || 
        analysis.monetization.model.toLowerCase().includes('marketplace')) {
      const ecommerceTools = this.toolDatabase.find(c => c.id === 'ecommerce')?.tools || [];
      const bestEcommerce = ecommerceTools[0];
      if (bestEcommerce) {
        specialized.push(this.convertToRecommendation(bestEcommerce, 'E-commerce'));
      }
    }

    return specialized;
  }

  private convertToRecommendation(tool: Tool, category: string): ToolRecommendation {
    return {
      category,
      tool: tool.name,
      description: tool.description,
      pricing: tool.pricing,
      cost: tool.cost,
      difficulty: tool.difficulty,
      url: tool.url,
      alternatives: tool.alternatives,
      pros: tool.pros,
      cons: tool.cons,
      prefillData: tool.prefillTemplates
    };
  }

  generatePrefillData(tool: Tool, analysis: StartupAnalysis): Record<string, any> {
    const prefillData: Record<string, any> = {};

    // Common prefill data
    prefillData.projectName = analysis.problemStatement.split(' ').slice(0, 3).join(' ');
    prefillData.description = analysis.problemStatement;
    prefillData.targetAudience = analysis.targetMarket.primary;
    prefillData.industry = analysis.vertical;

    // Tool-specific prefill data
    switch (tool.name.toLowerCase()) {
      case 'framer':
      case 'webflow':
        prefillData.pageTitle = `${prefillData.projectName} - ${analysis.targetMarket.primary}`;
        prefillData.heroText = analysis.problemStatement;
        prefillData.ctaText = 'Get Started';
        break;
      
      case 'glide':
      case 'flutterflow':
        prefillData.appName = prefillData.projectName;
        prefillData.features = analysis.keyFeatures.slice(0, 5);
        break;
      
      case 'supabase':
      case 'firebase':
        prefillData.projectId = prefillData.projectName.toLowerCase().replace(/\s+/g, '-');
        prefillData.tables = this.generateTableStructure(analysis);
        break;
    }

    return prefillData;
  }

  private generateTableStructure(analysis: StartupAnalysis): string[] {
    const tables = ['users', 'profiles'];
    
    // Add domain-specific tables
    if (analysis.vertical.toLowerCase().includes('ecommerce')) {
      tables.push('products', 'orders', 'payments');
    }
    if (analysis.vertical.toLowerCase().includes('social')) {
      tables.push('posts', 'comments', 'likes');
    }
    if (analysis.vertical.toLowerCase().includes('fitness')) {
      tables.push('workouts', 'exercises', 'progress');
    }

    return tables;
  }

  private initializeToolDatabase(): void {
    this.toolDatabase = [
      {
        id: 'landing-page',
        name: 'Landing Page Builders',
        description: 'Tools to create professional landing pages',
        essential: true,
        tools: [
          {
            id: 'framer-ai',
            name: 'Framer AI',
            category: 'Landing Page',
            description: 'AI-powered website builder with advanced design capabilities',
            pricing: 'freemium',
            cost: '$20/month',
            difficulty: 'beginner',
            url: 'https://framer.com',
            features: ['AI design', 'Responsive', 'CMS', 'E-commerce'],
            pros: ['Beautiful designs', 'AI assistance', 'Fast deployment'],
            cons: ['Learning curve for advanced features'],
            alternatives: ['Webflow', 'Typedream', 'Popsy'],
            integrations: ['Stripe', 'Mailchimp', 'Google Analytics'],
            useCases: ['startup', 'portfolio', 'marketing'],
            tags: ['ai', 'design', 'responsive', 'fast'],
            rating: 4.8,
            reviews: 1250,
            prefillTemplates: {
              startup: {
                template: 'startup-landing',
                sections: ['hero', 'features', 'pricing', 'contact']
              }
            }
          },
          {
            id: 'popsy',
            name: 'Popsy',
            category: 'Landing Page',
            description: 'Notion-like website builder with AI features',
            pricing: 'freemium',
            cost: '$12/month',
            difficulty: 'beginner',
            url: 'https://popsy.co',
            features: ['Notion integration', 'AI content', 'SEO optimized'],
            pros: ['Easy to use', 'Notion workflow', 'Good SEO'],
            cons: ['Limited design flexibility'],
            alternatives: ['Framer', 'Super', 'Notion'],
            integrations: ['Notion', 'Google Analytics', 'Stripe'],
            useCases: ['blog', 'portfolio', 'simple-sites'],
            tags: ['notion', 'simple', 'seo', 'content'],
            rating: 4.5,
            reviews: 890
          }
        ]
      },
      {
        id: 'mvp-builder',
        name: 'MVP App Builders',
        description: 'No-code platforms for building app MVPs',
        essential: true,
        tools: [
          {
            id: 'glide',
            name: 'Glide',
            category: 'MVP Builder',
            description: 'Build apps from spreadsheets without code',
            pricing: 'freemium',
            cost: '$25/month',
            difficulty: 'beginner',
            url: 'https://glideapps.com',
            features: ['Spreadsheet-based', 'Native apps', 'Real-time sync'],
            pros: ['Very easy to use', 'Quick setup', 'Good for data apps'],
            cons: ['Limited customization', 'Spreadsheet dependency'],
            alternatives: ['FlutterFlow', 'Adalo', 'Bubble'],
            integrations: ['Google Sheets', 'Airtable', 'Stripe'],
            useCases: ['directory', 'marketplace', 'internal-tools'],
            tags: ['spreadsheet', 'easy', 'data-driven', 'mobile'],
            rating: 4.6,
            reviews: 2100
          },
          {
            id: 'flutterflow',
            name: 'FlutterFlow',
            category: 'MVP Builder',
            description: 'Visual development platform for Flutter apps',
            pricing: 'freemium',
            cost: '$30/month',
            difficulty: 'intermediate',
            url: 'https://flutterflow.io',
            features: ['Visual builder', 'Custom code', 'Firebase integration'],
            pros: ['Native performance', 'Custom code support', 'Professional apps'],
            cons: ['Steeper learning curve', 'Flutter knowledge helpful'],
            alternatives: ['Glide', 'Adalo', 'Bubble'],
            integrations: ['Firebase', 'Supabase', 'Stripe', 'APIs'],
            useCases: ['mobile-app', 'complex-apps', 'custom-features'],
            tags: ['flutter', 'native', 'custom', 'professional'],
            rating: 4.7,
            reviews: 1800
          }
        ]
      },
      {
        id: 'backend',
        name: 'Backend & Database',
        description: 'Backend services and database solutions',
        essential: true,
        tools: [
          {
            id: 'supabase',
            name: 'Supabase',
            category: 'Backend',
            description: 'Open source Firebase alternative with PostgreSQL',
            pricing: 'freemium',
            cost: '$25/month',
            difficulty: 'beginner',
            url: 'https://supabase.com',
            features: ['PostgreSQL', 'Real-time', 'Auth', 'Storage'],
            pros: ['Open source', 'SQL database', 'Real-time features'],
            cons: ['Newer platform', 'Smaller ecosystem'],
            alternatives: ['Firebase', 'PlanetScale', 'Railway'],
            integrations: ['Next.js', 'React', 'Flutter', 'Vue'],
            useCases: ['web-app', 'mobile-app', 'real-time'],
            tags: ['database', 'auth', 'real-time', 'postgresql'],
            rating: 4.7,
            reviews: 1500
          },
          {
            id: 'firebase',
            name: 'Firebase',
            category: 'Backend',
            description: 'Google\'s mobile and web application development platform',
            pricing: 'freemium',
            cost: '$25/month',
            difficulty: 'beginner',
            url: 'https://firebase.google.com',
            features: ['NoSQL database', 'Authentication', 'Hosting', 'Functions'],
            pros: ['Google ecosystem', 'Mature platform', 'Great documentation'],
            cons: ['Vendor lock-in', 'NoSQL limitations'],
            alternatives: ['Supabase', 'AWS Amplify', 'Appwrite'],
            integrations: ['React', 'Flutter', 'iOS', 'Android'],
            useCases: ['mobile-app', 'web-app', 'real-time'],
            tags: ['nosql', 'google', 'mobile', 'serverless'],
            rating: 4.5,
            reviews: 3200
          }
        ]
      },
      {
        id: 'analytics',
        name: 'Analytics & Tracking',
        description: 'User analytics and behavior tracking tools',
        essential: true,
        tools: [
          {
            id: 'mixpanel',
            name: 'Mixpanel',
            category: 'Analytics',
            description: 'Advanced product analytics for mobile and web',
            pricing: 'freemium',
            cost: '$25/month',
            difficulty: 'intermediate',
            url: 'https://mixpanel.com',
            features: ['Event tracking', 'Funnels', 'Cohorts', 'A/B testing'],
            pros: ['Detailed analytics', 'Real-time data', 'Good segmentation'],
            cons: ['Complex setup', 'Can be expensive'],
            alternatives: ['Google Analytics', 'Amplitude', 'PostHog'],
            integrations: ['React', 'iOS', 'Android', 'Node.js'],
            useCases: ['product-analytics', 'user-behavior', 'conversion'],
            tags: ['analytics', 'events', 'funnels', 'cohorts'],
            rating: 4.4,
            reviews: 890
          },
          {
            id: 'google-analytics',
            name: 'Google Analytics',
            category: 'Analytics',
            description: 'Free web analytics service by Google',
            pricing: 'free',
            cost: 'Free',
            difficulty: 'beginner',
            url: 'https://analytics.google.com',
            features: ['Web analytics', 'E-commerce tracking', 'Goals', 'Audiences'],
            pros: ['Free', 'Comprehensive', 'Google integration'],
            cons: ['Complex interface', 'Privacy concerns'],
            alternatives: ['Mixpanel', 'Plausible', 'Simple Analytics'],
            integrations: ['Google Ads', 'Search Console', 'Tag Manager'],
            useCases: ['web-analytics', 'marketing', 'seo'],
            tags: ['free', 'web', 'google', 'marketing'],
            rating: 4.2,
            reviews: 5000
          }
        ]
      },
      {
        id: 'ai-ml',
        name: 'AI & Machine Learning',
        description: 'AI and ML tools for intelligent features',
        essential: false,
        tools: [
          {
            id: 'openai',
            name: 'OpenAI API',
            category: 'AI/ML',
            description: 'GPT models and AI capabilities via API',
            pricing: 'paid',
            cost: '$20/month',
            difficulty: 'intermediate',
            url: 'https://openai.com/api',
            features: ['GPT models', 'Text generation', 'Code generation', 'Embeddings'],
            pros: ['Powerful models', 'Easy integration', 'Good documentation'],
            cons: ['Usage-based pricing', 'Rate limits'],
            alternatives: ['Google Gemini', 'Anthropic Claude', 'Hugging Face'],
            integrations: ['REST API', 'Python', 'Node.js', 'React'],
            useCases: ['chatbots', 'content-generation', 'code-assistance'],
            tags: ['gpt', 'nlp', 'text-generation', 'ai'],
            rating: 4.6,
            reviews: 2100
          },
          {
            id: 'huggingface',
            name: 'Hugging Face',
            category: 'AI/ML',
            description: 'Open source AI models and tools',
            pricing: 'freemium',
            cost: '$9/month',
            difficulty: 'advanced',
            url: 'https://huggingface.co',
            features: ['Pre-trained models', 'Model hosting', 'Datasets', 'Spaces'],
            pros: ['Open source', 'Large model library', 'Community'],
            cons: ['Technical complexity', 'Setup required'],
            alternatives: ['OpenAI', 'Google AI', 'AWS SageMaker'],
            integrations: ['Python', 'PyTorch', 'TensorFlow', 'Transformers'],
            useCases: ['nlp', 'computer-vision', 'research'],
            tags: ['open-source', 'models', 'transformers', 'ml'],
            rating: 4.5,
            reviews: 1200
          }
        ]
      },
      {
        id: 'ecommerce',
        name: 'E-commerce & Payments',
        description: 'Online store and payment processing tools',
        essential: false,
        tools: [
          {
            id: 'stripe',
            name: 'Stripe',
            category: 'Payments',
            description: 'Online payment processing platform',
            pricing: 'paid',
            cost: '2.9% + 30¢',
            difficulty: 'intermediate',
            url: 'https://stripe.com',
            features: ['Payment processing', 'Subscriptions', 'Invoicing', 'Connect'],
            pros: ['Developer-friendly', 'Global coverage', 'Great documentation'],
            cons: ['Transaction fees', 'Complex for simple use'],
            alternatives: ['PayPal', 'Square', 'Razorpay'],
            integrations: ['React', 'Node.js', 'Shopify', 'WooCommerce'],
            useCases: ['payments', 'subscriptions', 'marketplace'],
            tags: ['payments', 'subscriptions', 'api', 'global'],
            rating: 4.7,
            reviews: 3500
          },
          {
            id: 'shopify',
            name: 'Shopify',
            category: 'E-commerce',
            description: 'Complete e-commerce platform',
            pricing: 'paid',
            cost: '$29/month',
            difficulty: 'beginner',
            url: 'https://shopify.com',
            features: ['Online store', 'Inventory', 'Payments', 'Shipping'],
            pros: ['All-in-one solution', 'Easy setup', 'App ecosystem'],
            cons: ['Monthly fees', 'Transaction fees', 'Limited customization'],
            alternatives: ['WooCommerce', 'BigCommerce', 'Squarespace'],
            integrations: ['Stripe', 'PayPal', 'Facebook', 'Google'],
            useCases: ['online-store', 'dropshipping', 'retail'],
            tags: ['ecommerce', 'store', 'inventory', 'payments'],
            rating: 4.4,
            reviews: 4200
          }
        ]
      },
      {
        id: 'design',
        name: 'Design & UI/UX',
        description: 'Design tools for creating beautiful interfaces',
        essential: false,
        tools: [
          {
            id: 'figma',
            name: 'Figma',
            category: 'Design',
            description: 'Collaborative interface design tool',
            pricing: 'freemium',
            cost: '$12/month',
            difficulty: 'intermediate',
            url: 'https://figma.com',
            features: ['UI design', 'Prototyping', 'Collaboration', 'Components'],
            pros: ['Web-based', 'Real-time collaboration', 'Great for teams'],
            cons: ['Learning curve', 'Internet required'],
            alternatives: ['Sketch', 'Adobe XD', 'Canva'],
            integrations: ['Slack', 'Notion', 'Zeplin', 'Principle'],
            useCases: ['ui-design', 'prototyping', 'collaboration'],
            tags: ['design', 'ui', 'prototyping', 'collaboration'],
            rating: 4.8,
            reviews: 2800
          },
          {
            id: 'canva',
            name: 'Canva',
            category: 'Design',
            description: 'Easy graphic design platform',
            pricing: 'freemium',
            cost: '$12.99/month',
            difficulty: 'beginner',
            url: 'https://canva.com',
            features: ['Templates', 'Graphics', 'Presentations', 'Social media'],
            pros: ['Very easy to use', 'Great templates', 'No design skills needed'],
            cons: ['Limited customization', 'Template-based'],
            alternatives: ['Figma', 'Adobe Creative Suite', 'Sketch'],
            integrations: ['Dropbox', 'Google Drive', 'Slack', 'Mailchimp'],
            useCases: ['marketing', 'social-media', 'presentations'],
            tags: ['templates', 'graphics', 'easy', 'marketing'],
            rating: 4.6,
            reviews: 3900
          }
        ]
      }
    ];
  }

  getToolByName(name: string): Tool | null {
    for (const category of this.toolDatabase) {
      const tool = category.tools.find(t => t.name.toLowerCase() === name.toLowerCase());
      if (tool) return tool;
    }
    return null;
  }

  getToolsByCategory(categoryId: string): Tool[] {
    const category = this.toolDatabase.find(c => c.id === categoryId);
    return category?.tools || [];
  }

  getAllCategories(): ToolCategory[] {
    return this.toolDatabase;
  }
}

export const toolMatcher = new ToolMatcher();
export default ToolMatcher;
