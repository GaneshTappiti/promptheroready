export interface AITool {
  id: string;
  name: string;
  category: string;
  description: string;
  pricing: {
    model: 'free' | 'freemium' | 'paid';
    inr: string;
    details: string;
  };
  features: string[];
  bestFor: string[];
  officialUrl: string;
  logo?: string;
  tags: string[];
  apiCompatible: boolean;
  popularity: number; // 1-100
  whyRecommend: string;
  useCases: string[];
  platforms: ('web' | 'mobile' | 'desktop' | 'api')[];
}

export const aiToolsCategories = [
  { id: 'chatbots', name: 'Chatbots & LLMs', icon: '🤖' },
  { id: 'ui-ux', name: 'UI/UX Tools', icon: '🎨' },
  { id: 'dev-ides', name: 'Dev IDEs & Coding', icon: '💻' },
  { id: 'app-builders', name: 'App Builders', icon: '🏗️' },
  { id: 'backend', name: 'Backend & Database', icon: '🗄️' },
  { id: 'local-tools', name: 'Local & Open Source', icon: '🔓' },
  { id: 'workflow', name: 'Workflow/Automation', icon: '⚡' },
  { id: 'deployment', name: 'Deployment', icon: '🚀' },
  { id: 'knowledge', name: 'Knowledge Assistants', icon: '🧠' }
];

export const aiToolsDatabase: AITool[] = [
  // Chatbots & LLMs
  {
    id: 'chatgpt-pro',
    name: 'ChatGPT Pro',
    category: 'chatbots',
    description: 'Advanced AI assistant with GPT-4o, vision, and web browsing capabilities',
    pricing: {
      model: 'paid',
      inr: '₹1,990/mo',
      details: 'GPT-4o, Vision, Browsing, Priority access'
    },
    features: ['GPT-4o access', 'Vision capabilities', 'Web browsing', 'Priority support'],
    bestFor: ['Complex reasoning', 'Content creation', 'Code generation', 'Research'],
    officialUrl: 'https://chat.openai.com',
    tags: ['AI Chat', 'GPT-4', 'Vision', 'Web Search'],
    apiCompatible: true,
    popularity: 95,
    whyRecommend: 'Most versatile AI for MVP planning, content creation, and complex problem-solving',
    useCases: ['MVP ideation', 'Content writing', 'Code debugging', 'Market research'],
    platforms: ['web', 'api']
  },
  {
    id: 'gemini-pro',
    name: 'Google Gemini Pro',
    category: 'chatbots',
    description: 'Google\'s multimodal AI with advanced reasoning and integration capabilities',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹850 credits/mo',
      details: 'Gemini 1.5 Pro, Vision, Large context window'
    },
    features: ['Multimodal AI', 'Large context', 'Google integration', 'Real-time data'],
    bestFor: ['Technical analysis', 'Data processing', 'Google Workspace integration'],
    officialUrl: 'https://aistudio.google.com',
    tags: ['Multimodal', 'Google', 'Large Context', 'Free Tier'],
    apiCompatible: true,
    popularity: 85,
    whyRecommend: 'Excellent for technical MVPs with Google ecosystem integration',
    useCases: ['Technical documentation', 'Data analysis', 'Google Sheets automation'],
    platforms: ['web', 'api']
  },
  {
    id: 'claude-ai',
    name: 'Claude.ai',
    category: 'chatbots',
    description: 'Anthropic\'s AI assistant focused on helpful, harmless, and honest interactions',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹1,650/mo Pro',
      details: 'Claude 3.5 Sonnet, Long conversations, File uploads'
    },
    features: ['Long conversations', 'File analysis', 'Code generation', 'Safety focused'],
    bestFor: ['Detailed analysis', 'Code review', 'Long-form content', 'Research'],
    officialUrl: 'https://claude.ai',
    tags: ['Safety', 'Long Context', 'Code', 'Analysis'],
    apiCompatible: true,
    popularity: 80,
    whyRecommend: 'Best for detailed MVP planning and thorough analysis',
    useCases: ['Business plan creation', 'Code review', 'Market analysis'],
    platforms: ['web', 'api']
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    category: 'chatbots',
    description: 'Cost-effective AI with strong coding and reasoning capabilities',
    pricing: {
      model: 'free',
      inr: 'Free',
      details: 'DeepSeek-V2, Coder, Chat models'
    },
    features: ['Free access', 'Strong coding', 'Math reasoning', 'Multiple models'],
    bestFor: ['Budget-conscious developers', 'Code generation', 'Math problems'],
    officialUrl: 'https://chat.deepseek.com',
    tags: ['Free', 'Coding', 'Math', 'Open Source'],
    apiCompatible: true,
    popularity: 70,
    whyRecommend: 'Perfect for startups on a budget who need coding assistance',
    useCases: ['Code generation', 'Algorithm design', 'Technical documentation'],
    platforms: ['web', 'api']
  },

  // Dev IDEs & Coding
  {
    id: 'cursor-sh',
    name: 'Cursor.sh',
    category: 'dev-ides',
    description: 'AI-powered IDE with pair programming and code generation',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹1,660/mo Pro',
      details: 'AI IDE with pair programming, unlimited completions'
    },
    features: ['AI pair programming', 'Code completion', 'Chat with codebase', 'VS Code compatible'],
    bestFor: ['Full-stack development', 'Code refactoring', 'Learning to code'],
    officialUrl: 'https://cursor.sh',
    tags: ['IDE', 'Pair Programming', 'VS Code', 'AI Completion'],
    apiCompatible: false,
    popularity: 90,
    whyRecommend: 'Revolutionary AI IDE that makes coding 10x faster for MVP development',
    useCases: ['MVP development', 'Code refactoring', 'Learning new frameworks'],
    platforms: ['desktop']
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    category: 'dev-ides',
    description: 'AI code assistant integrated with popular IDEs',
    pricing: {
      model: 'paid',
      inr: '₹770/mo',
      details: 'GPT-4 powered code suggestions and completions'
    },
    features: ['Code suggestions', 'Multiple IDE support', 'Context-aware', 'GitHub integration'],
    bestFor: ['Professional development', 'Team collaboration', 'Code quality'],
    officialUrl: 'https://github.com/features/copilot',
    tags: ['GitHub', 'Code Assistant', 'IDE Integration', 'Team'],
    apiCompatible: false,
    popularity: 85,
    whyRecommend: 'Industry standard for AI-assisted coding with excellent IDE integration',
    useCases: ['Professional development', 'Code reviews', 'Team projects'],
    platforms: ['desktop']
  },

  // UI/UX Tools
  {
    id: 'gamma-app',
    name: 'Gamma.app',
    category: 'ui-ux',
    description: 'AI-powered presentation and website builder from prompts',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹1,600/mo',
      details: 'Prompt to slide deck, unlimited presentations'
    },
    features: ['Prompt to presentation', 'Web publishing', 'Templates', 'Collaboration'],
    bestFor: ['Pitch decks', 'Landing pages', 'Presentations', 'Quick prototypes'],
    officialUrl: 'https://gamma.app',
    tags: ['Presentations', 'AI Design', 'Templates', 'Quick'],
    apiCompatible: false,
    popularity: 75,
    whyRecommend: 'Perfect for creating MVP pitch decks and landing pages in minutes',
    useCases: ['Investor pitches', 'Product demos', 'Landing pages'],
    platforms: ['web']
  },
  {
    id: 'canva-ai',
    name: 'Canva AI',
    category: 'ui-ux',
    description: 'AI-powered design platform with text-to-design capabilities',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹3,999/yr',
      details: 'Magic Studio, AI animations, brand kit'
    },
    features: ['Text to design', 'AI animations', 'Brand consistency', 'Templates'],
    bestFor: ['Social media', 'Marketing materials', 'Brand design', 'Quick graphics'],
    officialUrl: 'https://www.canva.com/magic-studio',
    tags: ['Design', 'Social Media', 'Branding', 'Templates'],
    apiCompatible: false,
    popularity: 90,
    whyRecommend: 'Essential for creating all visual assets for your MVP marketing',
    useCases: ['Social media posts', 'App store graphics', 'Marketing materials'],
    platforms: ['web', 'mobile']
  },

  // App Builders
  {
    id: 'framer',
    name: 'Framer',
    category: 'app-builders',
    description: 'AI-powered website builder with advanced design and animation capabilities',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹1,200/mo',
      details: 'AI website generation, custom domain, CMS'
    },
    features: ['AI website generation', 'Advanced animations', 'CMS', 'Responsive design'],
    bestFor: ['Landing pages', 'Portfolio sites', 'Interactive prototypes'],
    officialUrl: 'https://framer.com',
    tags: ['Website Builder', 'AI Generation', 'Animations', 'Responsive'],
    apiCompatible: false,
    popularity: 85,
    whyRecommend: 'Best-in-class for creating stunning MVP landing pages with AI',
    useCases: ['MVP landing pages', 'Product showcases', 'Interactive demos'],
    platforms: ['web']
  },
  {
    id: 'bubble',
    name: 'Bubble',
    category: 'app-builders',
    description: 'Full-stack no-code platform for complex web applications',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹2,500/mo',
      details: 'Full-stack development, database, workflows'
    },
    features: ['Visual programming', 'Database', 'User authentication', 'API integrations'],
    bestFor: ['SaaS platforms', 'Complex workflows', 'Database-driven apps'],
    officialUrl: 'https://bubble.io',
    tags: ['No-Code', 'Full-Stack', 'Database', 'SaaS'],
    apiCompatible: true,
    popularity: 80,
    whyRecommend: 'Perfect for building complex MVP SaaS applications without coding',
    useCases: ['SaaS MVPs', 'Marketplace apps', 'Internal tools'],
    platforms: ['web']
  },

  // Backend & Database
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'backend',
    description: 'Open-source Firebase alternative with PostgreSQL database',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹1,000+/mo',
      details: 'PostgreSQL, Auth, Storage, Edge functions'
    },
    features: ['PostgreSQL database', 'Authentication', 'Real-time subscriptions', 'Storage'],
    bestFor: ['Modern web apps', 'Real-time features', 'PostgreSQL projects'],
    officialUrl: 'https://supabase.com',
    tags: ['Database', 'Auth', 'Real-time', 'Open Source'],
    apiCompatible: true,
    popularity: 85,
    whyRecommend: 'Modern, developer-friendly backend that scales with your MVP',
    useCases: ['User authentication', 'Data storage', 'Real-time features'],
    platforms: ['web', 'mobile', 'api']
  },

  // Deployment
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'deployment',
    description: 'Frontend deployment platform optimized for modern frameworks',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹1,650/mo',
      details: 'Unlimited deployments, custom domains, analytics'
    },
    features: ['Instant deployments', 'Global CDN', 'Preview deployments', 'Analytics'],
    bestFor: ['React/Next.js apps', 'Static sites', 'JAMstack'],
    officialUrl: 'https://vercel.com',
    tags: ['Deployment', 'CDN', 'Next.js', 'Fast'],
    apiCompatible: true,
    popularity: 90,
    whyRecommend: 'Fastest way to deploy your MVP with zero configuration',
    useCases: ['MVP deployment', 'Landing pages', 'Web apps'],
    platforms: ['web']
  },

  // Knowledge Assistants
  {
    id: 'perplexity-ai',
    name: 'Perplexity.ai',
    category: 'knowledge',
    description: 'AI-powered search engine with real-time information and citations',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹1,990/mo Pro',
      details: 'Real-time search, citations, unlimited queries'
    },
    features: ['Real-time search', 'Source citations', 'Follow-up questions', 'Multiple models'],
    bestFor: ['Market research', 'Competitive analysis', 'Current trends'],
    officialUrl: 'https://www.perplexity.ai',
    tags: ['Search', 'Real-time', 'Citations', 'Research'],
    apiCompatible: true,
    popularity: 80,
    whyRecommend: 'Essential for MVP market research with up-to-date information',
    useCases: ['Market research', 'Competitor analysis', 'Trend analysis'],
    platforms: ['web', 'mobile', 'api']
  },

  // Dev IDEs & Coding Tools
  {
    id: 'cursor-sh',
    name: 'Cursor.sh',
    category: 'dev-ides',
    description: 'AI-powered IDE with pair programming capabilities',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹1,660/mo Pro',
      details: 'AI IDE with GPT-4 integration, unlimited completions'
    },
    features: ['AI pair programming', 'Code completion', 'Chat with codebase', 'Multi-language support'],
    bestFor: ['Full-stack development', 'AI-assisted coding', 'Rapid prototyping'],
    officialUrl: 'https://cursor.sh',
    tags: ['IDE', 'AI Coding', 'Pair Programming', 'GPT-4'],
    apiCompatible: false,
    popularity: 90,
    whyRecommend: 'Revolutionary AI IDE that accelerates MVP development with intelligent code assistance',
    useCases: ['MVP development', 'Code refactoring', 'Learning new frameworks'],
    platforms: ['desktop']
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    category: 'dev-ides',
    description: 'AI code completion and generation tool integrated with popular IDEs',
    pricing: {
      model: 'paid',
      inr: '₹770/mo',
      details: 'GPT-4 powered code suggestions, chat, and explanations'
    },
    features: ['Code completion', 'AI chat', 'Code explanations', 'Multi-language support'],
    bestFor: ['Code completion', 'Learning programming', 'Productivity boost'],
    officialUrl: 'https://github.com/features/copilot',
    tags: ['Code Completion', 'GitHub', 'AI Assistant', 'IDE Integration'],
    apiCompatible: false,
    popularity: 85,
    whyRecommend: 'Industry-standard AI coding assistant with excellent IDE integration',
    useCases: ['Daily coding', 'Learning new languages', 'Code documentation'],
    platforms: ['desktop']
  },
  {
    id: 'blackbox-ai',
    name: 'Blackbox.ai',
    category: 'dev-ides',
    description: 'AI coding assistant with code extraction and autocomplete features',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹800+/mo',
      details: 'Code extraction, autocomplete, chat with code'
    },
    features: ['Code extraction', 'Autocomplete', 'Code chat', 'Multiple languages'],
    bestFor: ['Code extraction from images', 'Quick coding solutions', 'Learning'],
    officialUrl: 'https://www.blackbox.ai',
    tags: ['Code Extraction', 'Autocomplete', 'AI Chat', 'Learning'],
    apiCompatible: true,
    popularity: 75,
    whyRecommend: 'Unique code extraction capabilities and affordable pricing for startups',
    useCases: ['Converting designs to code', 'Quick prototyping', 'Code learning'],
    platforms: ['web', 'desktop', 'api']
  },

  // App Builders
  {
    id: 'framer',
    name: 'Framer',
    category: 'app-builders',
    description: 'Design and publish websites with AI-powered design tools',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹1,200+/mo',
      details: 'AI website generation, responsive design, CMS'
    },
    features: ['AI website generation', 'Responsive design', 'CMS integration', 'Custom code'],
    bestFor: ['Landing pages', 'Marketing websites', 'Design prototypes'],
    officialUrl: 'https://framer.com',
    tags: ['Website Builder', 'AI Design', 'Responsive', 'No-Code'],
    apiCompatible: false,
    popularity: 88,
    whyRecommend: 'Perfect for creating stunning MVP landing pages and marketing sites with AI',
    useCases: ['MVP landing pages', 'Portfolio sites', 'Marketing campaigns'],
    platforms: ['web']
  },
  {
    id: 'flutterflow',
    name: 'FlutterFlow',
    category: 'app-builders',
    description: 'Visual app builder for creating native mobile and web apps',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹2,500+/mo',
      details: 'Visual app builder, Firebase integration, custom code'
    },
    features: ['Visual app builder', 'Firebase integration', 'Custom widgets', 'Real-time preview'],
    bestFor: ['Mobile apps', 'Cross-platform development', 'Rapid prototyping'],
    officialUrl: 'https://flutterflow.io',
    tags: ['Mobile Apps', 'Flutter', 'Visual Builder', 'Cross-Platform'],
    apiCompatible: false,
    popularity: 82,
    whyRecommend: 'Best for creating professional mobile MVPs without coding',
    useCases: ['Mobile app MVPs', 'Cross-platform apps', 'Startup prototypes'],
    platforms: ['mobile', 'web']
  },
  {
    id: 'webflow',
    name: 'Webflow',
    category: 'app-builders',
    description: 'Professional website builder with design freedom and CMS',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹1,000+/mo',
      details: 'Visual web design, CMS, e-commerce, hosting'
    },
    features: ['Visual web design', 'CMS', 'E-commerce', 'Custom interactions'],
    bestFor: ['Professional websites', 'E-commerce', 'Content management'],
    officialUrl: 'https://webflow.com',
    tags: ['Website Builder', 'CMS', 'E-commerce', 'Professional'],
    apiCompatible: false,
    popularity: 85,
    whyRecommend: 'Professional-grade website builder perfect for SaaS and business MVPs',
    useCases: ['SaaS websites', 'E-commerce stores', 'Business sites'],
    platforms: ['web']
  },
  {
    id: 'bubble',
    name: 'Bubble',
    category: 'app-builders',
    description: 'Full-stack no-code platform for building web applications',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹2,000+/mo',
      details: 'Full-stack development, database, workflows, API'
    },
    features: ['Visual programming', 'Database management', 'API integration', 'User authentication'],
    bestFor: ['Web applications', 'SaaS platforms', 'Complex workflows'],
    officialUrl: 'https://bubble.io',
    tags: ['No-Code', 'Full-Stack', 'Database', 'SaaS'],
    apiCompatible: true,
    popularity: 80,
    whyRecommend: 'Complete no-code solution for building complex SaaS MVPs',
    useCases: ['SaaS applications', 'Marketplaces', 'Internal tools'],
    platforms: ['web']
  },

  // UI/UX Design Tools
  {
    id: 'gamma-app',
    name: 'Gamma.app',
    category: 'ui-ux',
    description: 'AI-powered presentation and website builder',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹1,600/mo',
      details: 'AI content generation, templates, collaboration'
    },
    features: ['AI content generation', 'Beautiful templates', 'Real-time collaboration', 'Export options'],
    bestFor: ['Presentations', 'Pitch decks', 'Landing pages', 'Documentation'],
    officialUrl: 'https://gamma.app',
    tags: ['Presentations', 'AI Content', 'Pitch Decks', 'Templates'],
    apiCompatible: false,
    popularity: 85,
    whyRecommend: 'Perfect for creating stunning pitch decks and presentations for your MVP',
    useCases: ['Investor pitches', 'Product demos', 'Team presentations'],
    platforms: ['web']
  },
  {
    id: 'canva-ai',
    name: 'Canva AI',
    category: 'ui-ux',
    description: 'AI-powered design platform with text-to-design capabilities',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹3,999/yr',
      details: 'AI design generation, templates, brand kit, animations'
    },
    features: ['Text-to-design', 'Brand consistency', 'Animation tools', 'Collaboration'],
    bestFor: ['Social media graphics', 'Marketing materials', 'Brand design'],
    officialUrl: 'https://www.canva.com/magic-studio',
    tags: ['Design', 'AI Generation', 'Brand Kit', 'Social Media'],
    apiCompatible: false,
    popularity: 90,
    whyRecommend: 'Essential for creating all visual assets for your MVP marketing',
    useCases: ['Social media content', 'Marketing materials', 'Brand assets'],
    platforms: ['web', 'mobile']
  },

  // Backend & Database
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'backend',
    description: 'Open-source Firebase alternative with PostgreSQL database',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹1,000+/mo',
      details: 'PostgreSQL database, authentication, real-time, storage'
    },
    features: ['PostgreSQL database', 'Authentication', 'Real-time subscriptions', 'Storage'],
    bestFor: ['Backend as a service', 'Real-time apps', 'Authentication'],
    officialUrl: 'https://supabase.com',
    tags: ['Database', 'Authentication', 'Real-time', 'Open Source'],
    apiCompatible: true,
    popularity: 88,
    whyRecommend: 'Complete backend solution perfect for MVP development with generous free tier',
    useCases: ['SaaS backends', 'Real-time apps', 'User management'],
    platforms: ['web', 'mobile', 'api']
  },
  {
    id: 'firebase',
    name: 'Firebase',
    category: 'backend',
    description: 'Google\'s comprehensive app development platform',
    pricing: {
      model: 'freemium',
      inr: 'Free / Pay-as-you-go',
      details: 'NoSQL database, authentication, hosting, analytics'
    },
    features: ['NoSQL database', 'Authentication', 'Cloud functions', 'Analytics'],
    bestFor: ['Mobile backends', 'Real-time apps', 'Google integration'],
    officialUrl: 'https://firebase.google.com',
    tags: ['Google', 'NoSQL', 'Mobile', 'Real-time'],
    apiCompatible: true,
    popularity: 85,
    whyRecommend: 'Industry-standard backend solution with excellent mobile integration',
    useCases: ['Mobile app backends', 'Real-time features', 'Analytics'],
    platforms: ['web', 'mobile', 'api']
  },

  // Deployment
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'deployment',
    description: 'Frontend deployment platform optimized for modern frameworks',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹1,650+/mo',
      details: 'Unlimited deployments, edge functions, analytics'
    },
    features: ['Instant deployments', 'Edge functions', 'Analytics', 'Preview deployments'],
    bestFor: ['Frontend deployment', 'Next.js apps', 'Static sites'],
    officialUrl: 'https://vercel.com',
    tags: ['Deployment', 'Frontend', 'Edge Functions', 'Next.js'],
    apiCompatible: true,
    popularity: 90,
    whyRecommend: 'Best-in-class deployment platform for modern web MVPs',
    useCases: ['Web app deployment', 'Static sites', 'API hosting'],
    platforms: ['web', 'api']
  },
  {
    id: 'railway',
    name: 'Railway',
    category: 'deployment',
    description: 'Simple deployment platform for full-stack applications',
    pricing: {
      model: 'freemium',
      inr: 'Free / ₹415+/mo',
      details: 'Database hosting, automatic deployments, custom domains'
    },
    features: ['Database hosting', 'Automatic deployments', 'Environment variables', 'Custom domains'],
    bestFor: ['Full-stack deployment', 'Database hosting', 'Simple setup'],
    officialUrl: 'https://railway.app',
    tags: ['Full-Stack', 'Database', 'Simple', 'Affordable'],
    apiCompatible: true,
    popularity: 75,
    whyRecommend: 'Affordable and simple deployment solution perfect for MVP testing',
    useCases: ['Full-stack apps', 'Database hosting', 'MVP deployment'],
    platforms: ['web', 'api']
  },

  // Local & Open Source Tools
  {
    id: 'ollama',
    name: 'Ollama',
    category: 'local-tools',
    description: 'Run large language models locally on your machine',
    pricing: {
      model: 'free',
      inr: 'Free',
      details: 'Open source, run models locally, no API costs'
    },
    features: ['Local LLM hosting', 'Multiple models', 'API compatible', 'Privacy focused'],
    bestFor: ['Local AI development', 'Privacy-sensitive projects', 'Cost optimization'],
    officialUrl: 'https://ollama.com',
    tags: ['Local', 'Open Source', 'Privacy', 'LLM'],
    apiCompatible: true,
    popularity: 70,
    whyRecommend: 'Perfect for cost-effective AI development with complete privacy control',
    useCases: ['Local AI development', 'Privacy-focused apps', 'Cost optimization'],
    platforms: ['desktop', 'api']
  },

  // Workflow/Automation
  {
    id: 'n8n',
    name: 'n8n.io',
    category: 'workflow',
    description: 'Open-source workflow automation platform',
    pricing: {
      model: 'freemium',
      inr: 'Free (self-hosted) / ₹1,650+/mo',
      details: 'Visual workflow builder, 400+ integrations, self-hostable'
    },
    features: ['Visual workflow builder', '400+ integrations', 'Custom nodes', 'Self-hostable'],
    bestFor: ['Workflow automation', 'API integration', 'Data processing'],
    officialUrl: 'https://n8n.io',
    tags: ['Automation', 'Workflows', 'Open Source', 'Integrations'],
    apiCompatible: true,
    popularity: 75,
    whyRecommend: 'Powerful automation platform perfect for connecting MVP tools and services',
    useCases: ['API automation', 'Data synchronization', 'Business workflows'],
    platforms: ['web', 'api']
  },

  // Knowledge Assistants
  {
    id: 'notebooklm',
    name: 'NotebookLM',
    category: 'knowledge',
    description: 'Google\'s AI research assistant that works with your documents',
    pricing: {
      model: 'free',
      inr: 'Free (Beta)',
      details: 'Document analysis, AI chat, source grounding'
    },
    features: ['Document analysis', 'Source-grounded responses', 'Research assistance', 'Citation tracking'],
    bestFor: ['Research', 'Document analysis', 'Knowledge management'],
    officialUrl: 'https://notebooklm.google.com',
    tags: ['Research', 'Documents', 'Google', 'Knowledge'],
    apiCompatible: false,
    popularity: 80,
    whyRecommend: 'Excellent for MVP research and analyzing market documents',
    useCases: ['Market research', 'Competitive analysis', 'Document review'],
    platforms: ['web']
  }
];

export const getToolsByCategory = (categoryId: string): AITool[] => {
  return aiToolsDatabase.filter(tool => tool.category === categoryId);
};

export const searchTools = (query: string): AITool[] => {
  const lowercaseQuery = query.toLowerCase();
  return aiToolsDatabase.filter(tool => 
    tool.name.toLowerCase().includes(lowercaseQuery) ||
    tool.description.toLowerCase().includes(lowercaseQuery) ||
    tool.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    tool.bestFor.some(use => use.toLowerCase().includes(lowercaseQuery))
  );
};

export const getRecommendedTools = (
  appType: string, 
  platform: string[], 
  budget: 'free' | 'freemium' | 'paid' | 'any' = 'any'
): AITool[] => {
  let filtered = aiToolsDatabase;

  // Filter by budget
  if (budget !== 'any') {
    filtered = filtered.filter(tool => tool.pricing.model === budget);
  }

  // Filter by platform compatibility
  if (platform.length > 0) {
    filtered = filtered.filter(tool =>
      platform.some(p => tool.platforms.includes(p as 'mobile' | 'desktop' | 'api' | 'web'))
    );
  }

  // Sort by popularity and relevance
  return filtered
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 6); // Return top 6 recommendations
};
