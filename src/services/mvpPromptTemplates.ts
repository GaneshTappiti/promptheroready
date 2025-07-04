import { MVPWizardData, MVPAnalysisResult, AppType, UITheme, DesignStyle, Platform, PagePrompt } from "@/types/ideaforge";

// Enhanced prompt template types
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: 'framework' | 'page' | 'component' | 'navigation' | 'styling' | 'integration';
  template: string;
  variables: string[];
  builderCompatibility: string[];
}

export interface EnhancedWizardData {
  description?: string;
  colorPreference?: string;
  targetAudience?: string;
  promptStyle?: 'detailed' | 'concise';
  keyFeatures?: string[];
  targetUsers?: string;
}

export class MVPPromptTemplateService {
  // Prompt template library
  private static promptTemplates: PromptTemplate[] = [
    {
      id: 'framework-comprehensive',
      name: 'Comprehensive Framework Generator',
      description: 'Generates complete app framework with detailed page structure and navigation',
      category: 'framework',
      template: `You are an expert app designer and UX architect. Create a comprehensive framework for {{appType}} called "{{appName}}" targeting {{platforms}}.

**Project Vision:**
{{userPrompt}}

{{#if description}}
**Additional Context:**
{{description}}
{{/if}}

**Design Requirements:**
- Theme: {{theme}} mode
- Design Style: {{designStyle}}
- Target Platform(s): {{platforms}}
{{#if colorPreference}}
- Color Preference: {{colorPreference}}
{{/if}}
{{#if targetAudience}}
- Target Audience: {{targetAudience}}
{{/if}}

**Framework Requirements:**
1. **Page Architecture** (5-8 pages max):
   - Page hierarchy and relationships
   - Core functionality per page
   - User flow between pages
   - Component requirements

2. **Navigation Design:**
   - Navigation pattern selection
   - Menu structure and organization
   - User journey optimization

3. **Technical Stack:**
   - Recommended technologies
   - No-code/AI builder suggestions
   - Integration requirements

**Output as structured JSON with pages, navigation, components, and recommendations.**`,
      variables: ['appName', 'appType', 'platforms', 'userPrompt', 'theme', 'designStyle', 'description', 'colorPreference', 'targetAudience'],
      builderCompatibility: ['framer', 'webflow', 'bubble', 'flutterflow']
    },
    {
      id: 'page-ui-detailed',
      name: 'Detailed Page UI Generator',
      description: 'Creates comprehensive UI prompts for individual pages',
      category: 'page',
      template: `Design the complete UI for the "{{pageName}}" page of "{{appName}}".

**Page Context:**
- App Type: {{appType}}
- Theme: {{theme}} with {{designStyle}} aesthetic
- Platform: {{platforms}}
- Page Purpose: {{pageDescription}}
- Layout Style: {{pageLayout}}

**Component Requirements:**
{{#each components}}
- {{this}}
{{/each}}

**Design Specifications:**
1. **Layout & Structure:**
   - Component hierarchy and positioning
   - Responsive grid system
   - Spacing and alignment

2. **Visual Design:**
   - Color scheme for {{theme}} theme
   - Typography hierarchy
   - Icon and imagery guidelines
   - {{designStyle}} design patterns

3. **Interactions:**
   - Button states and animations
   - Loading states and feedback
   - Micro-interactions
   - User flow within page

4. **Content Strategy:**
   - Placeholder content and copy
   - Image specifications
   - Data display patterns

**Builder-Ready Output:**
Provide detailed, copy-paste ready instructions for {{preferredBuilder}} including exact styling, layout, and interactive behavior specifications.`,
      variables: ['pageName', 'appName', 'appType', 'theme', 'designStyle', 'platforms', 'pageDescription', 'pageLayout', 'components', 'preferredBuilder'],
      builderCompatibility: ['framer', 'webflow', 'bubble', 'flutterflow', 'figma']
    },
    {
      id: 'navigation-linking',
      name: 'Navigation & Linking System',
      description: 'Generates comprehensive navigation and routing logic',
      category: 'navigation',
      template: `Create the complete navigation and linking system for "{{appName}}" ({{appType}}).

**Pages to Connect:**
{{#each pages}}
- {{this.name}}: {{this.description}}
{{/each}}

**Navigation Requirements:**
1. **Navigation Structure:**
   - Primary navigation method ({{navType}})
   - Secondary navigation patterns
   - Breadcrumb requirements
   - Back button behavior

2. **Routing & Paths:**
   - URL structure and routing paths
   - Deep linking capabilities
   - Route parameters and dynamic routes
   - Default/home page routing

3. **User Flow Logic:**
   - Authentication-gated pages
   - Onboarding flow sequence
   - Error page handling (404, 500)
   - Loading states between pages

4. **Platform-Specific Navigation:**
{{#if isWeb}}
   - Browser navigation (back/forward buttons)
   - URL sharing and bookmarking
   - Tab management
{{else}}
   - Mobile navigation patterns
   - Gesture-based navigation
   - Hardware back button handling
{{/if}}

**Implementation Instructions:**
Provide specific setup instructions for {{preferredBuilder}} including route configuration, navigation components, and state management.`,
      variables: ['appName', 'appType', 'pages', 'navType', 'isWeb', 'preferredBuilder'],
      builderCompatibility: ['framer', 'webflow', 'bubble', 'flutterflow']
    },
    {
      id: 'component-library',
      name: 'Component Library Generator',
      description: 'Creates reusable component specifications',
      category: 'component',
      template: `Design a comprehensive component library for "{{appName}}" with {{designStyle}} aesthetic.

**Design System:**
- Theme: {{theme}} mode
- Color Palette: {{colorScheme}}
- Typography: {{typography}}
- Spacing System: {{spacing}}

**Component Specifications:**
{{#each components}}

## {{this.name}} Component
**Type:** {{this.type}}
**Purpose:** {{this.description}}

**Design Specs:**
- Layout: {{this.layout}}
- States: Default, Hover, Active, Disabled
- Responsive behavior
- Accessibility requirements

**Props/Configuration:**
{{#each this.props}}
- {{@key}}: {{this}}
{{/each}}

{{/each}}

**Builder Implementation:**
Create these components in {{preferredBuilder}} with consistent styling, proper state management, and reusability across pages.`,
      variables: ['appName', 'designStyle', 'theme', 'colorScheme', 'typography', 'spacing', 'components', 'preferredBuilder'],
      builderCompatibility: ['framer', 'webflow', 'bubble', 'figma']
    },
    {
      id: 'framer-specific',
      name: 'Framer-Optimized Prompt',
      description: 'Specialized prompt for Framer with animations and interactions',
      category: 'page',
      template: `Create a stunning {{pageName}} page in Framer for "{{appName}}".

**Framer Project Setup:**
1. Create new Framer project
2. Set up design system with:
   - Color variables: {{colorScheme}}
   - Typography scale: {{typography}}
   - Spacing tokens: {{spacing}}

**Page Design:**
**Layout:** {{pageLayout}}
**Components needed:**
{{#each components}}
- {{this}} (with Framer interactions)
{{/each}}

**Framer-Specific Features:**
1. **Animations & Transitions:**
   - Page load animations
   - Hover effects and micro-interactions
   - Scroll-triggered animations
   - Component state transitions

2. **Interactive Elements:**
   - Smart components with variants
   - Auto-layout and responsive behavior
   - Interactive prototyping
   - Component overrides

3. **Advanced Features:**
   - Code components if needed
   - CMS integration for dynamic content
   - Form handling and validation
   - Third-party integrations

**Responsive Design:**
- Desktop (1440px+)
- Tablet (768px-1439px)
- Mobile (320px-767px)

**Implementation Steps:**
1. Set up the page structure with auto-layout
2. Create component variants for different states
3. Add animations and transitions
4. Configure responsive breakpoints
5. Test interactions and publish

Make it visually stunning with smooth animations that enhance the {{designStyle}} aesthetic.`,
      variables: ['pageName', 'appName', 'pageLayout', 'components', 'colorScheme', 'typography', 'spacing', 'designStyle'],
      builderCompatibility: ['framer']
    }
  ];

  /**
   * Generate enhanced MVP analysis prompt with template system
   */
  static generateEnhancedMVPPrompt(wizardData: MVPWizardData, enhancedData: EnhancedWizardData): string {
    const template = this.promptTemplates.find(t => t.id === 'framework-comprehensive');
    if (!template) return this.generateMVPAnalysisPrompt(wizardData);

    return this.processTemplate(template.template, {
      appName: wizardData.step1.appName,
      appType: wizardData.step1.appType.replace('-', ' '),
      platforms: wizardData.step3.platforms.join(', '),
      userPrompt: wizardData.userPrompt,
      theme: wizardData.step2.theme,
      designStyle: wizardData.step2.designStyle,
      description: enhancedData.description || '',
      colorPreference: enhancedData.colorPreference || '',
      targetAudience: enhancedData.targetAudience || ''
    });
  }

  /**
   * Generate page-specific UI prompt
   */
  static generatePageUIPrompt(
    pageName: string,
    pageData: unknown,
    wizardData: MVPWizardData,
    enhancedData: EnhancedWizardData,
    preferredBuilder: string = 'framer'
  ): string {
    const template = this.promptTemplates.find(t => t.id === 'page-ui-detailed');
    if (!template) return this.generateGenericPrompt(`Create UI for ${pageName}`, { pages: [{ name: pageName, description: (pageData as any).description, components: (pageData as any).components, layout: (pageData as any).layout }] } as any);

    return this.processTemplate(template.template, {
      pageName,
      appName: wizardData.step1.appName,
      appType: wizardData.step1.appType.replace('-', ' '),
      theme: wizardData.step2.theme,
      designStyle: wizardData.step2.designStyle,
      platforms: wizardData.step3.platforms.join(', '),
      pageDescription: (pageData as any).description,
      pageLayout: (pageData as any).layout,
      components: (pageData as any).components,
      preferredBuilder
    });
  }

  /**
   * Simple template processor (basic Handlebars-like syntax)
   */
  private static processTemplate(template: string, data: Record<string, any>): string {
    let processed = template;

    // Replace simple variables {{variable}}
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, data[key] || '');
    });

    // Handle conditional blocks {{#if variable}}...{{/if}}
    processed = processed.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match, variable, content) => {
      return data[variable] ? content : '';
    });

    // Handle each loops {{#each array}}...{{/each}}
    processed = processed.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g, (match, variable, content) => {
      const array = data[variable];
      if (!Array.isArray(array)) return '';
      return array.map(item => content.replace(/{{this}}/g, item)).join('\n');
    });

    return processed;
  }

  /**
   * Generate the main MVP analysis prompt based on wizard data
   */
  static generateMVPAnalysisPrompt(wizardData: MVPWizardData): string {
    const { step1, step2, step3, userPrompt } = wizardData;
    
    const systemPrompt = this.getSystemPrompt();
    const contextPrompt = this.buildContextPrompt(step1, step2, step3);
    const structurePrompt = this.getStructurePrompt();
    const outputFormatPrompt = this.getOutputFormatPrompt();
    
    return `${systemPrompt}

${contextPrompt}

USER IDEA:
${userPrompt}

${structurePrompt}

${outputFormatPrompt}`;
  }

  /**
   * System prompt that defines the AI's role and expertise
   */
  private static getSystemPrompt(): string {
    return `You are an expert app designer and startup strategist with deep knowledge of:
- UI/UX design principles and modern design systems
- No-code and AI-powered development tools
- MVP development strategies and lean startup methodology
- Platform-specific design patterns (web, mobile, cross-platform)
- Component-based architecture and design systems

Your task is to analyze a startup idea and create a comprehensive MVP blueprint that includes:
1. Detailed page-by-page UI structure
2. Navigation flow and user experience design
3. Component descriptions and layout recommendations
4. Styling guide based on modern design principles
5. Recommended no-code/AI tools with specific reasoning
6. Copy-paste UI prompts optimized for the recommended tools
7. Step-by-step launch roadmap with time estimates`;
  }

  /**
   * Build context prompt based on wizard selections
   */
  private static buildContextPrompt(
    step1: { appName: string; appType: AppType },
    step2: { theme: UITheme; designStyle: DesignStyle },
    step3: { platforms: Platform[] }
  ): string {
    const appTypeDescriptions = {
      "web-app": "a browser-based web application",
      "mobile-app": "a native mobile application",
      "saas-tool": "a Software-as-a-Service platform",
      "chrome-extension": "a browser extension for Chrome",
      "ai-app": "an AI-powered application"
    };

    const designStyleDescriptions = {
      "minimal": "clean, simple, and focused design with plenty of whitespace",
      "playful": "fun, engaging, and animated interface with vibrant colors",
      "business": "professional, corporate, and formal appearance"
    };

    const platformRequirements = step3.platforms.map(platform => {
      switch (platform) {
        case "web": return "responsive web design";
        case "android": return "Android Material Design guidelines";
        case "ios": return "iOS Human Interface Guidelines";
        case "cross-platform": return "cross-platform compatibility (Flutter/React Native)";
        default: return platform;
      }
    }).join(", ");

    return `PROJECT CONTEXT:
- App Name: ${step1.appName}
- App Type: ${appTypeDescriptions[step1.appType]}
- Theme: ${step2.theme} theme
- Design Style: ${designStyleDescriptions[step2.designStyle]}
- Target Platforms: ${platformRequirements}`;
  }

  /**
   * Structure prompt that guides the analysis framework
   */
  private static getStructurePrompt(): string {
    return `ANALYSIS FRAMEWORK:

1. USER JOURNEY ANALYSIS:
   - Identify the core user problem and solution
   - Map the primary user flow from entry to goal completion
   - Define key user personas and their needs

2. MVP SCOPE DEFINITION:
   - Determine essential features for the minimum viable product
   - Identify features to exclude from MVP (save for later versions)
   - Prioritize features based on user value and development complexity

3. INFORMATION ARCHITECTURE:
   - Design the app's page hierarchy and navigation structure
   - Plan content organization and user flow between pages
   - Consider responsive design and mobile-first approach

4. UI/UX DESIGN STRATEGY:
   - Apply the selected theme and design style consistently
   - Choose appropriate design patterns for the app type
   - Plan component reusability and design system consistency

5. TECHNICAL RECOMMENDATIONS:
   - Match the best no-code/AI tools based on requirements
   - Consider platform constraints and capabilities
   - Evaluate tool pricing, learning curve, and feature set`;
  }

  /**
   * Output format prompt that ensures structured JSON response
   */
  private static getOutputFormatPrompt(): string {
    return `REQUIRED OUTPUT FORMAT:

Provide your analysis as a JSON object with this exact structure:

{
  "pages": [
    {
      "name": "Page Name",
      "description": "Detailed description of the page purpose and content",
      "components": ["Component1", "Component2", "Component3"],
      "layout": "Layout description (e.g., 'sidebar', 'vertical', 'grid')"
    }
  ],
  "navigation": {
    "type": "sidebar|bottom-tabs|top-tabs|drawer",
    "structure": [
      {"name": "Nav Item", "icon": "icon-name", "children": []}
    ]
  },
  "components": [
    {
      "name": "Component Name",
      "type": "component type",
      "description": "Detailed component description and functionality"
    }
  ],
  "styling": {
    "theme": "${this.getThemeValue()}",
    "designStyle": "${this.getDesignStyleValue()}",
    "colorScheme": ["#color1", "#color2", "#color3"],
    "typography": "Font family and sizing strategy",
    "spacing": "Spacing system description"
  },
  "recommendedTools": [
    {
      "name": "Tool Name",
      "description": "Brief tool description",
      "pros": ["Advantage 1", "Advantage 2"],
      "cons": ["Limitation 1", "Limitation 2"],
      "bestFor": ["Use case 1", "Use case 2"],
      "pricing": "free|freemium|paid",
      "url": "https://tool-website.com",
      "priority": 1
    }
  ],
  "uiPrompt": "Detailed, copy-paste ready prompt for the top recommended tool, including specific styling, layout, and component instructions",
  "launchPath": [
    {
      "step": 1,
      "title": "Step Title",
      "description": "Detailed step description",
      "estimatedTime": "Time estimate",
      "tools": ["Tool1", "Tool2"]
    }
  ]
}

IMPORTANT GUIDELINES:
- Make the uiPrompt extremely detailed and specific to the recommended tool
- Include actual color codes in the colorScheme array
- Prioritize tools by how well they match the project requirements
- Provide realistic time estimates in the launch path
- Focus on MVP features only - avoid feature creep
- Consider the user's technical skill level (assume beginner-friendly approach)`;
  }

  private static getThemeValue(): string {
    return "dark|light";
  }

  private static getDesignStyleValue(): string {
    return "minimal|playful|business";
  }

  /**
   * Generate tool-specific UI prompts
   */
  static generateToolSpecificPrompt(
    toolName: string,
    mvpData: MVPWizardData,
    analysisResult: MVPAnalysisResult
  ): string {
    const basePrompt = `Create a ${mvpData.step2.theme} themed ${mvpData.step1.appType} called "${mvpData.step1.appName}" with a ${mvpData.step2.designStyle} design style.`;
    
    switch (toolName.toLowerCase()) {
      case 'framer':
        return this.generateFramerPrompt(basePrompt, analysisResult);
      case 'flutterflow':
        return this.generateFlutterFlowPrompt(basePrompt, analysisResult);
      case 'webflow':
        return this.generateWebflowPrompt(basePrompt, analysisResult);
      case 'bubble':
        return this.generateBubblePrompt(basePrompt, analysisResult);
      default:
        return this.generateGenericPrompt(basePrompt, analysisResult);
    }
  }

  private static generateFramerPrompt(basePrompt: string, result: MVPAnalysisResult): string {
    return `${basePrompt}

FRAMER-SPECIFIC INSTRUCTIONS:
1. Create a new Framer project with these pages: ${result.pages.map(p => p.name).join(', ')}

2. Design System Setup:
   - Use color variables: ${result.styling.colorScheme.join(', ')}
   - Typography: ${result.styling.typography}
   - Spacing: ${result.styling.spacing}

3. Page Structure:
${result.pages.map(page => `
   ${page.name} Page:
   - Layout: ${page.layout}
   - Components: ${page.components.join(', ')}
   - Description: ${page.description}
`).join('')}

4. Navigation: Implement ${result.navigation.type} navigation with: ${result.navigation.structure.map(item => item.name).join(', ')}

5. Components to create: ${result.components.map(comp => `${comp.name} (${comp.type})`).join(', ')}

6. Make it responsive and interactive with Framer's animation capabilities.`;
  }

  private static generateFlutterFlowPrompt(basePrompt: string, result: MVPAnalysisResult): string {
    return `${basePrompt}

FLUTTERFLOW-SPECIFIC INSTRUCTIONS:
1. Create a new FlutterFlow project with these screens: ${result.pages.map(p => p.name).join(', ')}

2. Theme Configuration:
   - Primary Color: ${result.styling.colorScheme[0]}
   - Secondary Color: ${result.styling.colorScheme[1]}
   - Background: ${result.styling.colorScheme[2]}
   - Text Theme: ${result.styling.typography}

3. Screen Layouts:
${result.pages.map(page => `
   ${page.name} Screen:
   - Use ${page.layout} layout
   - Add widgets: ${page.components.join(', ')}
   - Purpose: ${page.description}
`).join('')}

4. Navigation: Set up ${result.navigation.type} with routes to: ${result.navigation.structure.map(item => item.name).join(', ')}

5. Custom Widgets: Create reusable widgets for: ${result.components.map(comp => comp.name).join(', ')}

6. Configure Firebase backend if needed for data storage and authentication.`;
  }

  private static generateWebflowPrompt(basePrompt: string, result: MVPAnalysisResult): string {
    return `${basePrompt}

WEBFLOW-SPECIFIC INSTRUCTIONS:
1. Create a new Webflow project with these pages: ${result.pages.map(p => p.name).join(', ')}

2. Style Guide Setup:
   - Color Palette: ${result.styling.colorScheme.join(', ')}
   - Typography: ${result.styling.typography}
   - Spacing Scale: ${result.styling.spacing}

3. Page Structure:
${result.pages.map(page => `
   ${page.name} Page:
   - Layout: ${page.layout} using Webflow's flexbox/grid
   - Sections: ${page.components.join(', ')}
   - Content: ${page.description}
`).join('')}

4. Navigation: Create ${result.navigation.type} navigation with links to: ${result.navigation.structure.map(item => item.name).join(', ')}

5. Components: Build reusable symbols for: ${result.components.map(comp => comp.name).join(', ')}

6. Make it fully responsive with Webflow's breakpoint system.`;
  }

  private static generateBubblePrompt(basePrompt: string, result: MVPAnalysisResult): string {
    return `${basePrompt}

BUBBLE-SPECIFIC INSTRUCTIONS:
1. Create a new Bubble app with these pages: ${result.pages.map(p => p.name).join(', ')}

2. Design System:
   - Color Scheme: ${result.styling.colorScheme.join(', ')}
   - Font: ${result.styling.typography}
   - Spacing: ${result.styling.spacing}

3. Page Layouts:
${result.pages.map(page => `
   ${page.name} Page:
   - Layout: ${page.layout} using Bubble's responsive engine
   - Elements: ${page.components.join(', ')}
   - Functionality: ${page.description}
`).join('')}

4. Navigation: Set up ${result.navigation.type} with menu items: ${result.navigation.structure.map(item => item.name).join(', ')}

5. Reusable Elements: Create for: ${result.components.map(comp => comp.name).join(', ')}

6. Database: Design data types and workflows for app functionality.`;
  }

  private static generateGenericPrompt(basePrompt: string, result: MVPAnalysisResult): string {
    return `${basePrompt}

GENERIC TOOL INSTRUCTIONS:
1. Create pages: ${result.pages.map(p => p.name).join(', ')}
2. Use colors: ${result.styling.colorScheme.join(', ')}
3. Typography: ${result.styling.typography}
4. Navigation: ${result.navigation.type} with ${result.navigation.structure.map(item => item.name).join(', ')}
5. Components: ${result.components.map(comp => comp.name).join(', ')}

Page Details:
${result.pages.map(page => `- ${page.name}: ${page.description}`).join('\n')}`;
  }

  /**
   * Get all available prompt templates
   */
  static getAllTemplates(): PromptTemplate[] {
    return this.promptTemplates;
  }

  /**
   * Get templates by category
   */
  static getTemplatesByCategory(category: PromptTemplate['category']): PromptTemplate[] {
    return this.promptTemplates.filter(template => template.category === category);
  }

  /**
   * Get templates compatible with a specific builder
   */
  static getTemplatesByBuilder(builder: string): PromptTemplate[] {
    return this.promptTemplates.filter(template =>
      template.builderCompatibility.includes(builder.toLowerCase())
    );
  }

  /**
   * Get a specific template by ID
   */
  static getTemplateById(id: string): PromptTemplate | undefined {
    return this.promptTemplates.find(template => template.id === id);
  }

  /**
   * Generate navigation prompt using template system
   */
  static generateNavigationPrompt(
    pages: unknown[],
    wizardData: MVPWizardData,
    navType: string = 'sidebar',
    preferredBuilder: string = 'framer'
  ): string {
    const template = this.getTemplateById('navigation-linking');
    if (!template) return this.generateLinkingPrompt(pages, wizardData);

    return this.processTemplate(template.template, {
      appName: wizardData.step1.appName,
      appType: wizardData.step1.appType.replace('-', ' '),
      pages: pages.map(p => ({ name: (p as any).pageName || (p as any).name, description: (p as any).description || `${(p as any).pageName || (p as any).name} page` })),
      navType,
      isWeb: wizardData.step3.platforms.includes('web'),
      preferredBuilder
    });
  }

  /**
   * Generate component library prompt
   */
  static generateComponentLibraryPrompt(
    components: unknown[],
    wizardData: MVPWizardData,
    enhancedData: EnhancedWizardData,
    preferredBuilder: string = 'framer'
  ): string {
    const template = this.getTemplateById('component-library');
    if (!template) return this.generateGenericPrompt('Create component library', { components } as any);

    return this.processTemplate(template.template, {
      appName: wizardData.step1.appName,
      designStyle: wizardData.step2.designStyle,
      theme: wizardData.step2.theme,
      colorScheme: enhancedData.colorPreference || 'Modern color palette',
      typography: 'Inter, system fonts',
      spacing: '8px grid system',
      components: components.map(comp => ({
        name: (comp as any).name,
        type: (comp as any).type,
        description: (comp as any).description,
        layout: (comp as any).layout || 'flexible',
        props: (comp as any).props || {}
      })),
      preferredBuilder
    });
  }

  /**
   * Generate builder-specific prompt
   */
  static generateBuilderSpecificPrompt(
    pageName: string,
    pageData: unknown,
    wizardData: MVPWizardData,
    enhancedData: EnhancedWizardData,
    builder: string
  ): string {
    const builderTemplateId = `${builder.toLowerCase()}-specific`;
    const template = this.getTemplateById(builderTemplateId);

    if (template) {
      return this.processTemplate(template.template, {
        pageName,
        appName: wizardData.step1.appName,
        pageLayout: (pageData as any).layout,
        components: (pageData as any).components,
        colorScheme: enhancedData.colorPreference || 'Modern color palette',
        typography: 'Inter, system fonts',
        spacing: '8px grid system',
        designStyle: wizardData.step2.designStyle
      });
    }

    // Fallback to generic tool-specific prompt
    return this.generateToolSpecificPrompt(builder, wizardData, {
      pages: [{ name: pageName, description: (pageData as any).description, components: (pageData as any).components, layout: (pageData as any).layout }],
      styling: {
        theme: wizardData.step2.theme,
        designStyle: wizardData.step2.designStyle,
        colorScheme: ['#000000', '#ffffff', '#22c55e'],
        typography: 'Inter, system fonts',
        spacing: '8px grid system'
      }
    } as MVPAnalysisResult);
  }

  // Keep the original method for backward compatibility
  private static generateLinkingPrompt(pages: unknown[], wizardData: MVPWizardData): string {
    const pageNames = pages.map(p => (p as any).pageName || (p as any).name).join(', ');
    const appType = wizardData.step1.appType.replace('-', ' ');

    return `Create the complete navigation and linking system for "${wizardData.step1.appName}" (${appType}).

**Pages to Connect:**
${pageNames}

**Navigation Requirements:**
1. Navigation structure and routing
2. User flow logic and authentication
3. Platform-specific considerations
4. State management and data passing

Provide implementation instructions for your chosen builder.`;
  }
}
