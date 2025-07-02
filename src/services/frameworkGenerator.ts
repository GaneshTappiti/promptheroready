import { MVPWizardData, MVPAnalysisResult, AppType, Platform } from "@/types/ideaforge";
import { AITool, getRecommendedTools } from "@/data/aiToolsDatabase";
import { EnhancedToolRecommenderService, EnhancedRecommendation } from "./enhancedToolRecommender";

export interface FrameworkGenerationRequest {
  appName: string;
  appType: AppType;
  description: string;
  platforms: Platform[];
  theme: 'dark' | 'light';
  designStyle: 'minimal' | 'playful' | 'business';
  targetAudience: string;
  keyFeatures: string[];
  complexity: 'simple' | 'medium' | 'complex';
}

export interface GeneratedFramework {
  appStructure: AppStructure;
  pages: PageDefinition[];
  navigation: NavigationStructure;
  techStack: TechStackRecommendation;
  builderTools: BuilderToolRecommendation[];
  prompts: {
    framework: string;
    pages: PagePrompt[];
    linking: string;
  };
}

export interface AppStructure {
  type: string;
  architecture: string;
  coreModules: string[];
  dataFlow: string;
  userJourney: string[];
}

export interface PageDefinition {
  name: string;
  purpose: string;
  components: string[];
  layout: 'vertical' | 'sidebar' | 'centered' | 'grid' | 'dashboard';
  priority: 'high' | 'medium' | 'low';
  userActions: string[];
  dataRequirements: string[];
}

export interface NavigationStructure {
  type: 'sidebar' | 'topbar' | 'bottom-tabs' | 'drawer';
  structure: NavigationItem[];
  flow: NavigationFlow[];
}

export interface NavigationItem {
  name: string;
  path: string;
  icon?: string;
  children?: NavigationItem[];
}

export interface NavigationFlow {
  from: string;
  to: string;
  trigger: string;
  condition?: string;
}

export interface TechStackRecommendation {
  frontend: string[];
  backend: string[];
  database: string[];
  deployment: string[];
  reasoning: string;
}

export interface BuilderToolRecommendation {
  tool: AITool;
  suitabilityScore: number;
  reasons: string[];
  estimatedTime: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  costAnalysis?: {
    initialCost: string;
    monthlyEstimate: string;
    scalingCost: string;
    freeAlternatives: string[];
  };
  alternativeTools?: AITool[];
  quickStartGuide?: string[];
  integrationTips?: string[];
}

export interface PagePrompt {
  pageName: string;
  prompt: string;
  builderSpecific: Record<string, string>; // Different prompts for different builders
  components: string[];
  layout: string;
}

export class FrameworkGeneratorService {
  /**
   * Generate comprehensive MVP framework based on user requirements
   */
  static async generateFramework(request: FrameworkGenerationRequest): Promise<GeneratedFramework> {
    try {
      // Validate input
      if (!request.appName || !request.appType) {
        throw new Error('App name and type are required');
      }

      // 1. Generate app structure
      const appStructure = this.generateAppStructure(request);

      // 2. Generate pages based on app type and features
      const pages = this.generatePages(request);

      // 3. Generate navigation structure
      const navigation = this.generateNavigation(pages, request.appType);

      // 4. Recommend tech stack
      const techStack = this.recommendTechStack(request);

      // 5. Recommend builder tools
      const builderTools = this.recommendBuilderTools(request);

      // 6. Generate prompts
      const prompts = this.generatePrompts(request, pages, navigation, builderTools);

      return {
        appStructure,
        pages,
        navigation,
        techStack,
        builderTools,
        prompts
      };
    } catch (error) {
      console.error('Framework generation error:', error);

      // Return a fallback framework
      return this.generateFallbackFramework(request);
    }
  }

  private static generateAppStructure(request: FrameworkGenerationRequest): AppStructure {
    const architectureMap: Record<AppType, string> = {
      'web-app': 'Single Page Application (SPA)',
      'mobile-app': 'Native Mobile Architecture',
      'saas-tool': 'Multi-tenant SaaS Architecture',
      'chrome-extension': 'Browser Extension Architecture',
      'ai-app': 'AI-First Application Architecture'
    };

    const moduleMap: Record<AppType, string[]> = {
      'web-app': ['Authentication', 'User Dashboard', 'Core Features', 'Settings'],
      'mobile-app': ['Onboarding', 'Main Navigation', 'Core Features', 'Profile'],
      'saas-tool': ['Authentication', 'Dashboard', 'Workspace', 'Billing', 'Admin'],
      'chrome-extension': ['Popup', 'Content Script', 'Background', 'Options'],
      'ai-app': ['AI Interface', 'Data Processing', 'Results Display', 'Settings']
    };

    return {
      type: request.appType,
      architecture: architectureMap[request.appType],
      coreModules: moduleMap[request.appType],
      dataFlow: this.generateDataFlow(request.appType),
      userJourney: this.generateUserJourney(request.appType, request.keyFeatures)
    };
  }

  private static generatePages(request: FrameworkGenerationRequest): PageDefinition[] {
    const basePages = this.getBasePagesForAppType(request.appType);
    const featurePages = this.generateFeaturePages(request.keyFeatures, request.appType);
    
    return [...basePages, ...featurePages].map(page => ({
      name: page.name || 'Untitled',
      purpose: page.purpose || 'General purpose page',
      layout: page.layout || 'vertical',
      priority: page.priority || 'medium',
      ...page,
      components: this.enhanceComponentsForTheme(page.components || [], request.theme, request.designStyle),
      userActions: this.generateUserActions(page.name || 'Untitled', request.appType),
      dataRequirements: this.generateDataRequirements(page.name || 'Untitled', request.keyFeatures)
    } as PageDefinition));
  }

  private static getBasePagesForAppType(appType: AppType): Partial<PageDefinition>[] {
    const pageTemplates: Record<AppType, Partial<PageDefinition>[]> = {
      'web-app': [
        { name: 'Landing', purpose: 'Welcome users and showcase value proposition', components: ['Hero', 'Features', 'CTA'], layout: 'vertical', priority: 'high' },
        { name: 'Dashboard', purpose: 'Main user interface and navigation hub', components: ['Sidebar', 'Stats', 'Quick Actions'], layout: 'sidebar', priority: 'high' },
        { name: 'Profile', purpose: 'User account management and settings', components: ['Avatar', 'Form', 'Settings'], layout: 'centered', priority: 'medium' }
      ],
      'mobile-app': [
        { name: 'Onboarding', purpose: 'Introduce app features and get user started', components: ['Slides', 'Progress', 'CTA'], layout: 'vertical', priority: 'high' },
        { name: 'Home', purpose: 'Main app interface and navigation', components: ['Header', 'Content', 'Bottom Nav'], layout: 'vertical', priority: 'high' },
        { name: 'Profile', purpose: 'User profile and app settings', components: ['Avatar', 'Menu Items', 'Settings'], layout: 'vertical', priority: 'medium' }
      ],
      'saas-tool': [
        { name: 'Landing', purpose: 'Convert visitors to trial users', components: ['Hero', 'Features', 'Pricing', 'Testimonials'], layout: 'vertical', priority: 'high' },
        { name: 'Dashboard', purpose: 'Main workspace and analytics overview', components: ['Sidebar', 'Charts', 'Widgets', 'Actions'], layout: 'dashboard', priority: 'high' },
        { name: 'Workspace', purpose: 'Core tool functionality and features', components: ['Toolbar', 'Canvas', 'Sidebar', 'Properties'], layout: 'dashboard', priority: 'high' },
        { name: 'Billing', purpose: 'Subscription management and payments', components: ['Plans', 'Payment Form', 'History'], layout: 'centered', priority: 'medium' }
      ],
      'chrome-extension': [
        { name: 'Popup', purpose: 'Quick access to main features', components: ['Header', 'Actions', 'Status'], layout: 'vertical', priority: 'high' },
        { name: 'Options', purpose: 'Extension settings and configuration', components: ['Tabs', 'Forms', 'Save Button'], layout: 'centered', priority: 'medium' }
      ],
      'ai-app': [
        { name: 'Chat Interface', purpose: 'Main AI interaction interface', components: ['Chat Window', 'Input', 'Suggestions'], layout: 'vertical', priority: 'high' },
        { name: 'Results', purpose: 'Display AI-generated results', components: ['Results Grid', 'Export', 'Actions'], layout: 'grid', priority: 'high' },
        { name: 'Settings', purpose: 'AI model and app configuration', components: ['Model Selector', 'Parameters', 'API Keys'], layout: 'centered', priority: 'medium' }
      ]
    };

    return pageTemplates[appType] || pageTemplates['web-app'];
  }

  private static generateFeaturePages(features: string[], appType: AppType): Partial<PageDefinition>[] {
    // Generate additional pages based on specific features mentioned
    const featurePages: Partial<PageDefinition>[] = [];
    
    features.forEach(feature => {
      const featureLower = feature.toLowerCase();
      
      if (featureLower.includes('analytics') || featureLower.includes('report')) {
        featurePages.push({
          name: 'Analytics',
          purpose: 'Data visualization and insights',
          components: ['Charts', 'Filters', 'Export', 'Date Picker'],
          layout: 'dashboard',
          priority: 'medium'
        });
      }
      
      if (featureLower.includes('admin') || featureLower.includes('management')) {
        featurePages.push({
          name: 'Admin',
          purpose: 'Administrative controls and user management',
          components: ['User Table', 'Actions', 'Filters', 'Bulk Operations'],
          layout: 'dashboard',
          priority: 'low'
        });
      }
      
      if (featureLower.includes('chat') || featureLower.includes('message')) {
        featurePages.push({
          name: 'Messages',
          purpose: 'Communication and messaging interface',
          components: ['Chat List', 'Message Thread', 'Input', 'Attachments'],
          layout: 'sidebar',
          priority: 'medium'
        });
      }
    });
    
    return featurePages;
  }

  private static generateNavigation(pages: PageDefinition[], appType: AppType): NavigationStructure {
    const navTypeMap: Record<AppType, NavigationStructure['type']> = {
      'web-app': 'sidebar',
      'mobile-app': 'bottom-tabs',
      'saas-tool': 'sidebar',
      'chrome-extension': 'topbar',
      'ai-app': 'sidebar'
    };

    const structure: NavigationItem[] = pages
      .filter(page => page.priority === 'high' || page.priority === 'medium')
      .map(page => ({
        name: page.name,
        path: `/${page.name.toLowerCase().replace(/\s+/g, '-')}`,
        icon: this.getIconForPage(page.name)
      }));

    const flow: NavigationFlow[] = this.generateNavigationFlow(pages);

    return {
      type: navTypeMap[appType],
      structure,
      flow
    };
  }

  private static recommendTechStack(request: FrameworkGenerationRequest): TechStackRecommendation {
    const stackMap: Record<AppType, TechStackRecommendation> = {
      'web-app': {
        frontend: ['React', 'TypeScript', 'Tailwind CSS'],
        backend: ['Node.js', 'Express', 'PostgreSQL'],
        database: ['PostgreSQL', 'Redis'],
        deployment: ['Vercel', 'Railway'],
        reasoning: 'Modern, scalable stack perfect for web applications'
      },
      'mobile-app': {
        frontend: ['React Native', 'TypeScript', 'NativeWind'],
        backend: ['Firebase', 'Supabase'],
        database: ['Firebase Firestore', 'PostgreSQL'],
        deployment: ['App Store', 'Google Play'],
        reasoning: 'Cross-platform mobile development with cloud backend'
      },
      'saas-tool': {
        frontend: ['Next.js', 'TypeScript', 'Tailwind CSS'],
        backend: ['Next.js API', 'Prisma', 'PostgreSQL'],
        database: ['PostgreSQL', 'Redis'],
        deployment: ['Vercel', 'PlanetScale'],
        reasoning: 'Full-stack solution optimized for SaaS applications'
      },
      'chrome-extension': {
        frontend: ['Vanilla JS', 'TypeScript', 'CSS'],
        backend: ['Chrome APIs', 'Local Storage'],
        database: ['IndexedDB', 'Chrome Storage'],
        deployment: ['Chrome Web Store'],
        reasoning: 'Lightweight stack optimized for browser extensions'
      },
      'ai-app': {
        frontend: ['React', 'TypeScript', 'Tailwind CSS'],
        backend: ['Python', 'FastAPI', 'OpenAI API'],
        database: ['PostgreSQL', 'Vector DB'],
        deployment: ['Vercel', 'Railway'],
        reasoning: 'AI-optimized stack with vector database support'
      }
    };

    return stackMap[request.appType];
  }

  private static recommendBuilderTools(request: FrameworkGenerationRequest): BuilderToolRecommendation[] {
    // Use enhanced tool recommender for better recommendations
    const enhancedRecommendations = EnhancedToolRecommenderService.getEnhancedRecommendations(request, {
      budget: 'any',
      complexity: request.complexity,
      timeline: 'normal',
      teamSize: 'solo',
      experience: 'intermediate'
    });

    // Convert enhanced recommendations to builder tool recommendations
    return enhancedRecommendations.slice(0, 4).map(enhanced => ({
      tool: enhanced.tool,
      suitabilityScore: enhanced.suitabilityScore,
      reasons: enhanced.reasons,
      estimatedTime: enhanced.estimatedTime,
      complexity: enhanced.complexity,
      costAnalysis: enhanced.costAnalysis,
      alternativeTools: enhanced.alternativeTools,
      quickStartGuide: enhanced.quickStartGuide,
      integrationTips: enhanced.integrationTips
    }));
  }

  private static generatePrompts(
    request: FrameworkGenerationRequest,
    pages: PageDefinition[],
    navigation: NavigationStructure,
    builderTools: BuilderToolRecommendation[]
  ): { framework: string; pages: PagePrompt[]; linking: string } {
    const frameworkPrompt = this.generateFrameworkPrompt(request, pages, navigation);
    const pagePrompts = this.generatePagePrompts(request, pages, builderTools);
    const linkingPrompt = this.generateLinkingPrompt(navigation, builderTools[0]?.tool);

    return {
      framework: frameworkPrompt,
      pages: pagePrompts,
      linking: linkingPrompt
    };
  }

  // Helper methods
  private static generateDataFlow(appType: AppType): string {
    const flowMap: Record<AppType, string> = {
      'web-app': 'User → Frontend → API → Database → Response',
      'mobile-app': 'User → Mobile App → Cloud Backend → Database → Sync',
      'saas-tool': 'User → Dashboard → Workspace → API → Multi-tenant DB',
      'chrome-extension': 'User → Extension → Content Script → Web APIs → Storage',
      'ai-app': 'User → Interface → AI Service → Vector DB → Results'
    };
    return flowMap[appType];
  }

  private static generateUserJourney(appType: AppType, features: string[]): string[] {
    const baseJourneys: Record<AppType, string[]> = {
      'web-app': ['Visit Landing', 'Sign Up', 'Onboarding', 'Use Core Features', 'Manage Profile'],
      'mobile-app': ['Download App', 'Onboarding', 'Setup Profile', 'Explore Features', 'Daily Usage'],
      'saas-tool': ['Visit Landing', 'Start Trial', 'Setup Workspace', 'Use Tools', 'Upgrade Plan'],
      'chrome-extension': ['Install Extension', 'Grant Permissions', 'Configure Settings', 'Use Features'],
      'ai-app': ['Access Interface', 'Input Query', 'Review Results', 'Refine Prompts', 'Export Results']
    };
    
    return baseJourneys[appType];
  }

  private static enhanceComponentsForTheme(
    components: string[],
    theme: 'dark' | 'light',
    style: 'minimal' | 'playful' | 'business'
  ): string[] {
    // Add theme and style-specific component variations
    const enhancements: Record<string, string[]> = {
      'dark-minimal': ['Glass Cards', 'Subtle Shadows', 'Monospace Fonts'],
      'dark-playful': ['Gradient Backgrounds', 'Animated Icons', 'Colorful Accents'],
      'dark-business': ['Professional Cards', 'Corporate Colors', 'Clean Typography'],
      'light-minimal': ['Clean Cards', 'Soft Shadows', 'Sans-serif Fonts'],
      'light-playful': ['Bright Colors', 'Fun Animations', 'Rounded Elements'],
      'light-business': ['Professional Layout', 'Business Colors', 'Structured Design']
    };
    
    const key = `${theme}-${style}`;
    return [...components, ...(enhancements[key] || [])];
  }

  private static generateUserActions(pageName: string, appType: AppType): string[] {
    const actionMap: Record<string, string[]> = {
      'Landing': ['Sign Up', 'Learn More', 'View Demo', 'Contact Sales'],
      'Dashboard': ['View Analytics', 'Quick Actions', 'Navigate Sections', 'Search'],
      'Profile': ['Edit Profile', 'Change Password', 'Update Preferences', 'Delete Account'],
      'Onboarding': ['Next Step', 'Skip', 'Complete Setup', 'Get Help'],
      'Workspace': ['Create Project', 'Edit Content', 'Save Changes', 'Share'],
      'Analytics': ['Filter Data', 'Export Report', 'Change Date Range', 'Drill Down']
    };
    
    return actionMap[pageName] || ['View', 'Edit', 'Save', 'Cancel'];
  }

  private static generateDataRequirements(pageName: string, features: string[]): string[] {
    const dataMap: Record<string, string[]> = {
      'Landing': ['Page Content', 'Feature List', 'Testimonials', 'Pricing'],
      'Dashboard': ['User Data', 'Analytics', 'Recent Activity', 'Quick Stats'],
      'Profile': ['User Info', 'Preferences', 'Account Settings', 'Security'],
      'Analytics': ['Time Series Data', 'Metrics', 'Filters', 'Export Data'],
      'Workspace': ['Project Data', 'User Permissions', 'Content', 'History']
    };
    
    return dataMap[pageName] || ['Basic Data', 'User Context'];
  }

  private static getIconForPage(pageName: string): string {
    const iconMap: Record<string, string> = {
      'Landing': 'home',
      'Dashboard': 'dashboard',
      'Profile': 'user',
      'Analytics': 'chart',
      'Settings': 'settings',
      'Messages': 'message',
      'Admin': 'shield',
      'Workspace': 'folder',
      'Billing': 'credit-card'
    };
    
    return iconMap[pageName] || 'circle';
  }

  private static generateNavigationFlow(pages: PageDefinition[]): NavigationFlow[] {
    // Generate logical navigation flows between pages
    const flows: NavigationFlow[] = [];
    
    // Common flows
    const landingPage = pages.find(p => p.name === 'Landing');
    const dashboardPage = pages.find(p => p.name === 'Dashboard' || p.name === 'Home');
    
    if (landingPage && dashboardPage) {
      flows.push({
        from: landingPage.name,
        to: dashboardPage.name,
        trigger: 'Sign Up / Login',
        condition: 'User authenticated'
      });
    }
    
    // Add more flows based on page relationships
    pages.forEach(page => {
      if (page.name !== 'Landing' && dashboardPage) {
        flows.push({
          from: dashboardPage.name,
          to: page.name,
          trigger: 'Navigation Click',
          condition: 'User has access'
        });
      }
    });
    
    return flows;
  }

  private static generateUserJourneyMap(navigation: NavigationStructure): string {
    const journeySteps = navigation.flow.map((flow, index) =>
      `${index + 1}. **${flow.from}** → **${flow.to}**\n   - Trigger: ${flow.trigger}\n   - Context: ${flow.condition || 'Always available'}`
    ).join('\n\n');

    return `
### Primary User Journey:
${journeySteps}

### Navigation Patterns:
- **Entry Point**: ${navigation.structure[0]?.name || 'Landing Page'}
- **Core Flow**: ${navigation.flow.slice(0, 3).map(f => f.from).join(' → ')}
- **Exit Points**: Profile, Settings, Logout
`;
  }

  private static calculateSuitabilityScore(tool: any, request: FrameworkGenerationRequest): number {
    let score = tool.popularity || 50;
    
    // Platform compatibility
    if (request.platforms.some(p => tool.platforms?.includes(p))) {
      score += 20;
    }
    
    // App type compatibility
    if (tool.bestFor?.some((use: string) => 
      use.toLowerCase().includes(request.appType.replace('-', ' '))
    )) {
      score += 15;
    }
    
    // Complexity match
    if (request.complexity === 'simple' && tool.pricing?.model === 'free') {
      score += 10;
    }
    
    return Math.min(score, 100);
  }

  private static generateRecommendationReasons(tool: any, request: FrameworkGenerationRequest): string[] {
    const reasons: string[] = [];
    
    if (tool.pricing?.model === 'free') {
      reasons.push('Free to use - perfect for MVP testing');
    }
    
    if (request.platforms.some(p => tool.platforms?.includes(p))) {
      reasons.push(`Supports ${request.platforms.join(', ')} platforms`);
    }
    
    if (tool.bestFor?.length > 0) {
      reasons.push(`Excellent for ${tool.bestFor.slice(0, 2).join(' and ')}`);
    }
    
    return reasons;
  }

  private static estimateTimeToMVP(tool: any, complexity: string): string {
    const timeMap: Record<string, Record<string, string>> = {
      'simple': { 'app-builders': '1-2 days', 'dev-ides': '3-5 days', 'ui-ux': '1 day' },
      'medium': { 'app-builders': '3-7 days', 'dev-ides': '1-2 weeks', 'ui-ux': '2-3 days' },
      'complex': { 'app-builders': '1-2 weeks', 'dev-ides': '2-4 weeks', 'ui-ux': '1 week' }
    };
    
    return timeMap[complexity]?.[tool.category] || '1-2 weeks';
  }

  private static mapToolComplexity(tool: any, appType: AppType): 'beginner' | 'intermediate' | 'advanced' {
    if (tool.category === 'app-builders') return 'beginner';
    if (tool.category === 'dev-ides') return 'advanced';
    return 'intermediate';
  }

  private static generateFrameworkPrompt(
    request: FrameworkGenerationRequest,
    pages: PageDefinition[],
    navigation: NavigationStructure
  ): string {
    return `You are an expert app architect and MVP specialist. Create a comprehensive, production-ready framework for "${request.appName}", a ${request.appType.replace('-', ' ')} targeting ${request.targetAudience}.

## 🎯 Project Overview
- **App Name**: ${request.appName}
- **Type**: ${request.appType.replace('-', ' ').toUpperCase()}
- **Platforms**: ${request.platforms.join(', ')}
- **Design Theme**: ${request.theme} mode with ${request.designStyle} aesthetic
- **Target Audience**: ${request.targetAudience}
- **Complexity Level**: ${request.complexity}

## 🚀 Core Features & Requirements
${request.keyFeatures.map(f => `✅ ${f}`).join('\n')}

## 📱 Application Architecture

### Page Structure (${pages.length} pages)
${pages.map((p, index) => `
**${index + 1}. ${p.name} Page** (Priority: ${p.priority.toUpperCase()})
- **Purpose**: ${p.purpose}
- **Key Components**: ${p.components.join(' • ')}
- **Layout Pattern**: ${p.layout}
- **User Actions**: ${p.userActions.join(' • ')}
- **Data Requirements**: ${p.dataRequirements.join(' • ')}
`).join('')}

### Navigation & User Flow
- **Navigation Type**: ${navigation.type}
- **User Journey**: ${navigation.flow.map(f => `${f.from} → ${f.to} (${f.trigger})`).join(' → ')}

## 🏗️ Technical Specifications

Please provide a detailed, actionable framework including:

### 1. **Architecture Overview**
- High-level system design
- Component relationships
- Data flow patterns
- Scalability considerations

### 2. **Data Models & Schema**
- Core entities and relationships
- Database structure recommendations
- API data contracts
- State management strategy

### 3. **Component Hierarchy**
- Reusable component library
- Page-specific components
- Shared utilities and hooks
- Design system components

### 4. **API Design**
- RESTful endpoint structure
- Authentication & authorization
- Data validation patterns
- Error handling strategies

### 5. **Security & Performance**
- Authentication implementation
- Data protection measures
- Performance optimization strategies
- SEO and accessibility considerations

### 6. **Development Workflow**
- Recommended folder structure
- Development environment setup
- Testing strategy
- Deployment pipeline

## 🎨 Design System Guidelines
- **Color Palette**: ${request.theme} theme with ${request.designStyle} styling
- **Typography**: Modern, readable font hierarchy
- **Spacing**: Consistent spacing system
- **Components**: Reusable UI component patterns
- **Responsive Design**: Mobile-first approach

## 📊 Success Metrics
- User engagement targets
- Performance benchmarks
- Conversion goals
- Technical KPIs

**Output Requirements**: Provide a comprehensive, copy-paste ready framework that a developer can immediately implement. Include specific code patterns, folder structures, and implementation guidelines. Make this production-ready and scalable from day one.

Focus on creating an MVP that can validate the core hypothesis while being extensible for future growth.`;
  }

  private static generatePagePrompts(
    request: FrameworkGenerationRequest,
    pages: PageDefinition[],
    builderTools: BuilderToolRecommendation[]
  ): PagePrompt[] {
    return pages.map(page => {
      const basePrompt = `You are an expert UI/UX designer specializing in ${request.appType.replace('-', ' ')} development. Create a stunning, conversion-optimized ${page.name} page for "${request.appName}".

## 🎯 Page Mission
**Primary Goal**: ${page.purpose}
**Target Users**: ${request.targetAudience}
**Success Metrics**: ${page.userActions.join(', ')}

## 🎨 Design Specifications
- **Theme**: ${request.theme} mode with high contrast and readability
- **Style**: ${request.designStyle} aesthetic with modern UI patterns
- **Layout Pattern**: ${page.layout} layout optimized for ${request.platforms.join(' and ')}
- **Complexity**: ${request.complexity} - balance features with simplicity

## 🧩 Required Components & Features
${page.components.map(comp => `✅ **${comp}**: Interactive, accessible, and responsive`).join('\n')}

## 👤 User Experience Flow
${page.userActions.map((action, index) => `${index + 1}. **${action}**: Intuitive and frictionless interaction`).join('\n')}

## 📊 Data Integration
${page.dataRequirements.map(data => `🔗 **${data}**: Real-time, accurate, and well-formatted`).join('\n')}

## 🏗️ Technical Excellence
- **Responsive Design**: Mobile-first, tablet-optimized, desktop-enhanced
- **Performance**: Fast loading, optimized images, minimal bundle size
- **Accessibility**: WCAG 2.1 AA compliant, keyboard navigation, screen reader friendly
- **SEO**: Semantic HTML, proper meta tags, structured data
- **Security**: Input validation, XSS protection, secure data handling

## 🎯 Conversion Optimization
- Clear value proposition
- Prominent call-to-action buttons
- Minimal cognitive load
- Trust signals and social proof
- Error prevention and helpful feedback

## 📱 Platform-Specific Considerations
${(request.platforms.includes('android') || request.platforms.includes('ios')) ? '📱 **Mobile**: Touch-friendly interactions, thumb-zone optimization, swipe gestures' : ''}
${request.platforms.includes('web') ? '💻 **Web**: Keyboard shortcuts, hover states, browser compatibility' : ''}

Create a pixel-perfect, production-ready design that converts visitors into users and delivers an exceptional user experience.`;

      const builderSpecific: Record<string, string> = {};
      
      builderTools.forEach(({ tool }) => {
        builderSpecific[tool.name.toLowerCase()] = this.generateBuilderSpecificPrompt(
          basePrompt,
          tool.name,
          page,
          request
        );
      });

      return {
        pageName: page.name,
        prompt: basePrompt,
        builderSpecific,
        components: page.components,
        layout: page.layout
      };
    });
  }

  private static generateBuilderSpecificPrompt(
    basePrompt: string,
    toolName: string,
    page: PageDefinition,
    request: FrameworkGenerationRequest
  ): string {
    const toolSpecificInstructions: Record<string, string> = {
      'framer': `
## Framer-Specific Instructions
- Use Framer's component system
- Implement smooth animations and transitions
- Utilize Framer's responsive breakpoints
- Add interactive hover states and micro-interactions
- Use Framer's built-in CMS if content is dynamic`,
      
      'flutterflow': `
## FlutterFlow-Specific Instructions
- Design for mobile-first approach
- Use FlutterFlow's widget library
- Implement proper navigation between screens
- Add Firebase integration for backend
- Use FlutterFlow's state management
- Ensure cross-platform compatibility`,
      
      'webflow': `
## Webflow-Specific Instructions
- Use Webflow's class-based styling system
- Implement responsive design with Webflow's grid
- Add Webflow CMS for dynamic content
- Use Webflow's interaction system for animations
- Optimize for SEO with Webflow's built-in tools`,
      
      'bubble': `
## Bubble-Specific Instructions
- Design with Bubble's responsive engine
- Use Bubble's database for data storage
- Implement workflows for user interactions
- Add proper privacy rules for data security
- Use Bubble's plugin ecosystem for extended functionality`
    };

    return basePrompt + (toolSpecificInstructions[toolName.toLowerCase()] || '');
  }

  private static generateLinkingPrompt(
    navigation: NavigationStructure,
    primaryTool?: any
  ): string {
    return `Create a comprehensive navigation and linking system for the application.

## Navigation Structure
- **Type**: ${navigation.type}
- **Pages**: ${navigation.structure.map(item => item.name).join(', ')}

## Navigation Flow
${navigation.flow.map(flow =>
  `- **${flow.from} → ${flow.to}**: ${flow.trigger}${flow.condition ? ` (${flow.condition})` : ''}`
).join('\n')}

## User Journey Mapping
${this.generateUserJourneyMap(navigation)}

## Implementation Requirements

### 1. Routing System
- Implement client-side routing with proper URL structure
- Use hash routing for single-page applications
- Support nested routes for complex page hierarchies
- Handle route parameters and query strings

### 2. Navigation Components
- Create reusable navigation bar/sidebar component
- Implement breadcrumb navigation for complex flows
- Add mobile-friendly hamburger menu
- Include search functionality in navigation

### 3. State Management
- Maintain active page state
- Preserve user context during navigation
- Handle authentication state across routes
- Implement proper loading states

### 4. User Experience
- Add smooth page transitions and animations
- Implement back button functionality
- Support keyboard navigation
- Ensure fast navigation performance

### 5. Accessibility & SEO
- Use proper ARIA labels and roles
- Implement semantic HTML structure
- Add meta tags for each page
- Support screen readers and keyboard navigation

## Code Implementation Examples

### Navigation Component Structure:
\`\`\`
Navigation Bar/Sidebar:
${navigation.structure.map(item => `- ${item.name} (${item.path})`).join('\n')}

Mobile Navigation:
- Collapsible menu
- Touch-friendly buttons
- Swipe gestures support
\`\`\`

### Routing Logic:
\`\`\`
Route Definitions:
${navigation.structure.map(item => `${item.path} → ${item.name} Component`).join('\n')}

Protected Routes:
- Authentication required pages
- Role-based access control
- Redirect logic for unauthorized access
\`\`\`

${primaryTool ? `
## ${primaryTool.name}-Specific Implementation
${this.getToolSpecificLinkingInstructions(primaryTool.name)}

### ${primaryTool.name} Navigation Setup:
1. Configure routing system according to platform
2. Implement navigation components using platform widgets
3. Set up state management for navigation
4. Add platform-specific animations and transitions
5. Test navigation flow on target devices/browsers
` : ''}

## Quality Checklist
- ✅ All pages are accessible from navigation
- ✅ Back button works correctly
- ✅ Mobile navigation is touch-friendly
- ✅ Loading states are implemented
- ✅ Error pages are handled gracefully
- ✅ SEO meta tags are properly set
- ✅ Accessibility standards are met

Create a seamless, intuitive navigation experience that guides users through their journey effectively and enhances the overall user experience.`;
  }

  private static getToolSpecificLinkingInstructions(toolName: string): string {
    const instructions: Record<string, string> = {
      'framer': 'Use Framer\'s page linking system and implement smooth page transitions',
      'flutterflow': 'Implement Flutter navigation with proper route management and state persistence',
      'webflow': 'Use Webflow\'s native linking system and implement custom interactions for navigation',
      'bubble': 'Create Bubble workflows for navigation and implement proper page redirects'
    };
    
    return instructions[toolName.toLowerCase()] || 'Follow platform-specific navigation best practices';
  }

  /**
   * Generate a fallback framework when the main generation fails
   */
  private static generateFallbackFramework(request: FrameworkGenerationRequest): GeneratedFramework {
    const fallbackPages: PageDefinition[] = [
      {
        name: 'Landing',
        purpose: 'Welcome users and showcase your app',
        components: ['Header', 'Hero Section', 'Features', 'Call to Action'],
        layout: 'vertical',
        priority: 'high',
        userActions: ['Sign Up', 'Learn More'],
        dataRequirements: ['App Info', 'Features List']
      },
      {
        name: 'Dashboard',
        purpose: 'Main user interface',
        components: ['Navigation', 'Content Area', 'Sidebar'],
        layout: 'sidebar',
        priority: 'high',
        userActions: ['Navigate', 'View Content'],
        dataRequirements: ['User Data', 'App Content']
      }
    ];

    const fallbackNavigation: NavigationStructure = {
      type: 'sidebar',
      structure: [
        { name: 'Landing', path: '/' },
        { name: 'Dashboard', path: '/dashboard' }
      ],
      flow: [
        { from: 'Landing', to: 'Dashboard', trigger: 'Sign Up' }
      ]
    };

    const fallbackTechStack: TechStackRecommendation = {
      frontend: ['React', 'TypeScript', 'Tailwind CSS'],
      backend: ['Node.js', 'Express'],
      database: ['PostgreSQL'],
      deployment: ['Vercel'],
      reasoning: 'Modern, reliable stack for rapid MVP development'
    };

    return {
      appStructure: {
        type: request.appType,
        architecture: 'Simple MVP Architecture',
        coreModules: ['Authentication', 'Core Features', 'User Interface'],
        dataFlow: 'User → Frontend → Backend → Database',
        userJourney: ['Landing', 'Sign Up', 'Dashboard', 'Core Features']
      },
      pages: fallbackPages,
      navigation: fallbackNavigation,
      techStack: fallbackTechStack,
      builderTools: [
        {
          tool: {
            id: 'framer',
            name: 'Framer',
            category: 'app-builders',
            description: 'Design and publish websites with AI-powered design tools',
            pricing: { model: 'freemium', inr: 'Free / ₹1,200+/mo', details: 'AI website generation' },
            features: ['AI website generation', 'Responsive design'],
            bestFor: ['Landing pages', 'Marketing websites'],
            officialUrl: 'https://framer.com',
            tags: ['Website Builder', 'AI Design'],
            apiCompatible: false,
            popularity: 88,
            whyRecommend: 'Perfect for creating stunning MVP landing pages with AI',
            useCases: ['MVP landing pages', 'Portfolio sites'],
            platforms: ['web']
          },
          suitabilityScore: 85,
          reasons: ['Great for rapid prototyping', 'AI-powered design', 'Easy to use'],
          estimatedTime: '1-2 days',
          complexity: 'beginner'
        }
      ],
      prompts: {
        framework: `Create a ${request.appType} called "${request.appName}" with a clean, modern design.`,
        pages: fallbackPages.map(page => ({
          pageName: page.name,
          prompt: `Create a ${page.name} page for ${request.appName}. Include: ${page.components.join(', ')}.`,
          builderSpecific: {},
          components: page.components,
          layout: page.layout
        })),
        linking: `Create navigation between Landing and Dashboard pages with smooth transitions.`
      }
    };
  }
}
