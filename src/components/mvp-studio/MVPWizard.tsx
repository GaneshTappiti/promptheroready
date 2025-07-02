import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Globe,
  Zap,
  Chrome,
  Brain,
  Palette,
  Monitor,
  Moon,
  Sun,
  Briefcase,
  Smile,
  Building,
  Copy,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Layers,
  Link,
  Sparkles,
  Play
} from "lucide-react";
import {
  MVPWizardData,
  AppType,
  UITheme,
  DesignStyle,
  Platform,
  MVPAnalysisResult,
  PagePrompt,
  BuilderTool
} from "@/types/ideaforge";
import { aiProviderService } from "@/services/aiProviderService";
import { MVPPromptTemplateService, EnhancedWizardData } from "@/services/mvpPromptTemplates";
import { FrameworkGeneratorService, FrameworkGenerationRequest, GeneratedFramework } from "@/services/frameworkGenerator";
import PagePromptGenerator from "./PagePromptGenerator";
import ExportablePromptsSystem from "./ExportablePromptsSystem";
import { useAnalytics } from "@/services/mvpStudioAnalytics";
import { AIRequest } from "@/types/aiProvider";
import { useAuth } from "@/contexts/AuthContext";

interface MVPWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: MVPAnalysisResult) => void;
}

const MVPWizard: React.FC<MVPWizardProps> = ({ isOpen, onClose, onComplete }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const analytics = useAnalytics();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [wizardData, setWizardData] = useState<MVPWizardData>({
    step1: { appName: "", appType: "web-app" },
    step2: { theme: "dark", designStyle: "minimal" },
    step3: { platforms: ["web"] },
    step4: { selectedAI: "" },
    userPrompt: ""
  });

  // Enhanced wizard state for better UX
  const [enhancedData, setEnhancedData] = useState({
    description: "",
    colorPreference: "",
    targetAudience: "",
    promptStyle: "detailed",
    keyFeatures: [] as string[],
    targetUsers: "",
    currentStepValid: false
  });

  // Enhanced prompt-by-prompt state for sequential delivery
  const [promptFlow, setPromptFlow] = useState<'setup' | 'framework' | 'pages' | 'linking' | 'complete'>('setup');
  const [frameworkPrompt, setFrameworkPrompt] = useState<string>('');
  const [pagePrompts, setPagePrompts] = useState<PagePrompt[]>([]);
  const [linkingPrompt, setLinkingPrompt] = useState<string>('');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [recommendedTools, setRecommendedTools] = useState<BuilderTool[]>([]);
  const [generatedFramework, setGeneratedFramework] = useState<GeneratedFramework | null>(null);

  // Sequential prompt delivery state
  const [promptStage, setPromptStage] = useState<'framework' | 'page' | 'linking' | 'complete'>('framework');
  const [completedPrompts, setCompletedPrompts] = useState<{
    framework: boolean;
    pages: boolean[];
    linking: boolean;
  }>({
    framework: false,
    pages: [],
    linking: false
  });
  const [focusedPrompt, setFocusedPrompt] = useState<string>('');
  const [promptHistory, setPromptHistory] = useState<Array<{
    type: 'framework' | 'page' | 'linking';
    title: string;
    prompt: string;
    timestamp: Date;
    pageIndex?: number;
  }>>([]);

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  // Enhanced step configuration
  const stepConfig = [
    {
      id: 1,
      title: "Project Foundation",
      description: "Define your app's core identity and purpose",
      icon: <Building className="h-5 w-5" />,
      fields: ["appName", "appType", "description"]
    },
    {
      id: 2,
      title: "Visual Identity",
      description: "Choose your app's look and feel",
      icon: <Palette className="h-5 w-5" />,
      fields: ["theme", "designStyle", "colorPreference"]
    },
    {
      id: 3,
      title: "Platform Strategy",
      description: "Select where your app will live",
      icon: <Globe className="h-5 w-5" />,
      fields: ["platforms", "targetAudience"]
    },
    {
      id: 4,
      title: "AI Engine Setup",
      description: "Choose your AI assistant for generation",
      icon: <Brain className="h-5 w-5" />,
      fields: ["selectedAI", "promptStyle"]
    },
    {
      id: 5,
      title: "Vision & Requirements",
      description: "Describe your complete app vision",
      icon: <Sparkles className="h-5 w-5" />,
      fields: ["userPrompt", "keyFeatures", "targetUsers"]
    }
  ];

  const appTypes: { value: AppType; label: string; icon: React.ReactNode; description: string }[] = [
    { value: "web-app", label: "Web App", icon: <Globe className="h-5 w-5" />, description: "Browser-based application" },
    { value: "mobile-app", label: "Mobile App", icon: <Smartphone className="h-5 w-5" />, description: "iOS/Android application" },
    { value: "saas-tool", label: "SaaS Tool", icon: <Zap className="h-5 w-5" />, description: "Software as a Service platform" },
    { value: "chrome-extension", label: "Chrome Extension", icon: <Chrome className="h-5 w-5" />, description: "Browser extension" },
    { value: "ai-app", label: "AI App", icon: <Brain className="h-5 w-5" />, description: "AI-powered application" }
  ];

  const themes: { value: UITheme; label: string; icon: React.ReactNode }[] = [
    { value: "dark", label: "Dark", icon: <Moon className="h-5 w-5" /> },
    { value: "light", label: "Light", icon: <Sun className="h-5 w-5" /> }
  ];

  const designStyles: { value: DesignStyle; label: string; icon: React.ReactNode; description: string }[] = [
    { value: "minimal", label: "Minimal & Clean", icon: <Monitor className="h-5 w-5" />, description: "Simple, focused design" },
    { value: "playful", label: "Playful & Animated", icon: <Smile className="h-5 w-5" />, description: "Fun, engaging interface" },
    { value: "business", label: "Business & Professional", icon: <Building className="h-5 w-5" />, description: "Corporate, formal look" }
  ];

  const platforms: { value: Platform; label: string; description: string }[] = [
    { value: "web", label: "Web", description: "Browser-based" },
    { value: "android", label: "Android", description: "Google Play Store" },
    { value: "ios", label: "iOS", description: "Apple App Store" },
    { value: "cross-platform", label: "Cross-platform", description: "Flutter/React Native" }
  ];

  const builderTools: BuilderTool[] = [
    {
      name: "Framer",
      type: "web",
      description: "AI-powered website builder with advanced design capabilities and animations",
      url: "https://framer.com",
      openUrl: "https://framer.com/projects/new",
      icon: "🎨",
      bestFor: ["Landing pages", "Web apps", "Portfolios", "Interactive prototypes"]
    },
    {
      name: "FlutterFlow",
      type: "mobile",
      description: "Visual app builder for Flutter with Firebase integration and native performance",
      url: "https://flutterflow.io",
      openUrl: "https://app.flutterflow.io/create",
      icon: "📱",
      bestFor: ["Mobile apps", "Cross-platform", "Firebase apps", "Real-time features"]
    },
    {
      name: "Webflow",
      type: "web",
      description: "Professional web design tool with CMS, hosting, and e-commerce capabilities",
      url: "https://webflow.com",
      openUrl: "https://webflow.com/dashboard/sites/new",
      icon: "🌐",
      bestFor: ["Professional websites", "CMS", "E-commerce", "SEO-optimized sites"]
    },
    {
      name: "Bubble",
      type: "web",
      description: "Full-stack no-code platform for complex web applications with database",
      url: "https://bubble.io",
      openUrl: "https://bubble.io/build",
      icon: "🫧",
      bestFor: ["SaaS platforms", "Complex workflows", "Database-driven apps", "User authentication"]
    },
    {
      name: "Glide",
      type: "mobile",
      description: "Turn spreadsheets into beautiful mobile apps with AI assistance",
      url: "https://glideapps.com",
      openUrl: "https://go.glideapps.com/",
      icon: "✨",
      bestFor: ["Data-driven apps", "Quick MVPs", "Internal tools", "Spreadsheet integration"]
    },
    {
      name: "Adalo",
      type: "mobile",
      description: "Native mobile app builder with custom actions and integrations",
      url: "https://adalo.com",
      openUrl: "https://app.adalo.com/apps/new",
      icon: "📲",
      bestFor: ["Native mobile apps", "Custom actions", "Third-party integrations", "Marketplace apps"]
    },
    {
      name: "Softr",
      type: "web",
      description: "Build web apps from Airtable with pre-built blocks and templates",
      url: "https://softr.io",
      openUrl: "https://studio.softr.io/",
      icon: "🧱",
      bestFor: ["Airtable integration", "Client portals", "Internal tools", "Directory sites"]
    },
    {
      name: "Retool",
      type: "web",
      description: "Build internal tools and admin panels with drag-and-drop components",
      url: "https://retool.com",
      openUrl: "https://retool.com/products/apps",
      icon: "🔧",
      bestFor: ["Internal tools", "Admin panels", "Data dashboards", "CRUD operations"]
    },
    {
      name: "Figma + Dev Mode",
      type: "web",
      description: "Design in Figma and use Dev Mode for handoff to developers",
      url: "https://figma.com",
      openUrl: "https://figma.com/files/recent",
      icon: "🎯",
      bestFor: ["Design handoff", "Prototyping", "Design systems", "Developer collaboration"]
    }
  ];

  // Enhanced prompt generation functions
  const generateFrameworkPrompt = (data: MVPWizardData): string => {
    const { step1, step2, step3, userPrompt } = data;
    const platformText = step3.platforms.join(", ");

    return `You are an expert app designer and UX architect. I want to build a ${step1.appType.replace('-', ' ')} called "${step1.appName}" for ${platformText} platform(s).

**Project Vision:**
${userPrompt}

${enhancedData.description ? `**Additional Context:**
${enhancedData.description}` : ''}

**Design Requirements:**
- Theme: ${step2.theme} mode
- Design Style: ${step2.designStyle}
- Target Platform(s): ${platformText}
${enhancedData.colorPreference ? `- Color Preference: ${enhancedData.colorPreference}` : ''}
${enhancedData.targetAudience ? `- Target Audience: ${enhancedData.targetAudience}` : ''}
${enhancedData.targetUsers ? `- Target Users: ${enhancedData.targetUsers}` : ''}
${enhancedData.keyFeatures.length > 0 ? `- Key Features: ${enhancedData.keyFeatures.join(', ')}` : ''}

**Prompt Style:** ${enhancedData.promptStyle === 'detailed' ? 'Provide comprehensive, detailed analysis' : 'Keep analysis concise and focused'}

**Please create a complete framework including:**

1. **Page Structure** (5-8 pages maximum):
   - Page name and purpose
   - Key components needed
   - Layout type (sidebar, vertical, centered, etc.)
   - User interactions

2. **Navigation Flow:**
   - Navigation type (sidebar, tabs, bottom nav, etc.)
   - Page hierarchy and relationships
   - User journey mapping

3. **Technical Recommendations:**
   - Best tech stack for this type of app
   - Recommended no-code/AI builders
   - Integration requirements

4. **User Experience:**
   - Primary user actions
   - Key user flows
   - Success metrics

**Output Format:**
Provide a structured JSON response with:
\`\`\`json
{
  "pages": [{"name": "", "description": "", "components": [], "layout": "", "interactions": []}],
  "navigation": {"type": "", "structure": [], "userFlow": []},
  "techStack": {"recommended": "", "alternatives": []},
  "builderTools": [{"name": "", "reason": "", "bestFor": []}],
  "userJourney": ["step1", "step2", "..."],
  "keyFeatures": ["feature1", "feature2", "..."]
}
\`\`\``;
  };

  const generatePagePrompt = (pageName: string, pageData: any, data: MVPWizardData): string => {
    const platformSpecific = data.step3.platforms.includes('web') ?
      'Include responsive design for mobile, tablet, and desktop viewports.' :
      (data.step3.platforms.includes('android') || data.step3.platforms.includes('ios')) ?
      'Focus on mobile-first design with touch-friendly interactions.' :
      'Optimize for the target platform requirements.';

    return `Design the complete UI for the "${pageName}" page of "${data.step1.appName}".

**Design Specifications:**
- Theme: ${data.step2.theme} mode with ${data.step2.designStyle} aesthetic
- App Type: ${data.step1.appType.replace('-', ' ')}
- Platform: ${data.step3.platforms.join(', ')}

**Page Details:**
- Purpose: ${pageData.description}
- Layout Style: ${pageData.layout}
- Key Components: ${pageData.components.join(', ')}

**Design Requirements:**
1. **Layout & Structure:**
   - Component hierarchy and positioning
   - Spacing and grid system
   - ${platformSpecific}

2. **Visual Design:**
   - Color scheme for ${data.step2.theme} theme
   - Typography and font sizes
   - Icons and visual elements
   - ${data.step2.designStyle} design patterns

3. **Interactions & Animations:**
   - Button states and hover effects
   - Loading states and feedback
   - Micro-interactions and transitions
   - User flow within the page

4. **Content Structure:**
   - Placeholder text and copy
   - Image placeholders and sizes
   - Data display patterns

**Output for AI Builder:**
Provide a detailed, copy-paste ready prompt that includes:
- Exact component descriptions
- Styling specifications
- Layout instructions
- Interactive behavior
- Responsive considerations

Format this as a comprehensive prompt that can be directly used in tools like Framer, FlutterFlow, Webflow, or other AI builders.`;
  };

  const generateLinkingPrompt = (pages: any[], data: MVPWizardData): string => {
    const pageNames = pages.map(p => p.pageName).join(', ');
    const appType = data.step1.appType.replace('-', ' ');

    return `Create the complete navigation and linking system for "${data.step1.appName}" (${appType}).

**Pages to Connect:**
${pageNames}

**Navigation Requirements:**

1. **Navigation Structure:**
   - Primary navigation method (sidebar, tabs, bottom nav, header menu)
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
   ${data.step3.platforms.includes('web') ?
     '- Browser navigation (back/forward buttons)\n   - URL sharing and bookmarking\n   - Tab management' :
     '- Mobile navigation patterns\n   - Gesture-based navigation\n   - Hardware back button handling'}

5. **State Management:**
   - Navigation state persistence
   - User context across pages
   - Data passing between pages
   - Session management

**Builder Implementation:**
Provide specific instructions for implementing this navigation in:
- Route configuration code/settings
- Navigation component setup
- State management setup
- Conditional rendering logic

**Output Format:**
Structure this as actionable implementation steps that can be directly applied in no-code builders like FlutterFlow, Framer, or traditional development frameworks.`;
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleStartPromptFlow();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartPromptFlow = () => {
    setPromptFlow('framework');
    toast({
      title: "Starting Prompt Flow",
      description: "Let's build your MVP step by step!"
    });
  };

  const handleGenerateFramework = async () => {
    setIsGenerating(true);
    const startTime = Date.now();

    try {
      // Create framework generation request
      const frameworkRequest: FrameworkGenerationRequest = {
        appName: wizardData.step1.appName,
        appType: wizardData.step1.appType,
        description: enhancedData.description,
        platforms: wizardData.step3.platforms,
        theme: wizardData.step2.theme,
        designStyle: wizardData.step2.designStyle,
        targetAudience: enhancedData.targetAudience,
        keyFeatures: enhancedData.keyFeatures,
        complexity: enhancedData.keyFeatures.length > 5 ? 'complex' :
                   enhancedData.keyFeatures.length > 2 ? 'medium' : 'simple'
      };

      // Generate comprehensive framework
      const framework = await FrameworkGeneratorService.generateFramework(frameworkRequest);
      setGeneratedFramework(framework);

      // Set the generated prompts
      setFrameworkPrompt(framework.prompts.framework);
      setPagePrompts(framework.prompts.pages);
      setLinkingPrompt(framework.prompts.linking);

      // Initialize sequential prompt delivery state
      setCompletedPrompts({
        framework: true,
        pages: new Array(framework.prompts.pages.length).fill(false),
        linking: false
      });

      // Add framework prompt to history
      setPromptHistory(prev => [...prev, {
        type: 'framework',
        title: 'Project Framework',
        prompt: framework.prompts.framework,
        timestamp: new Date()
      }]);

      // Set focused prompt for sequential delivery
      setFocusedPrompt(framework.prompts.framework);
      setPromptStage('framework');

      // Set recommended tools from framework
      const toolsForRecommendation: BuilderTool[] = framework.builderTools.map(bt => ({
        name: bt.tool.name,
        type: (wizardData.step1.appType === 'mobile-app' ? 'mobile' : 'web') as 'web' | 'mobile' | 'cross-platform',
        description: bt.tool.description,
        url: bt.tool.officialUrl,
        openUrl: bt.tool.officialUrl,
        icon: "🛠️",
        bestFor: bt.tool.bestFor
      }));
      setRecommendedTools(toolsForRecommendation);

      // Track successful framework generation
      analytics.trackFrameworkGeneration(
        wizardData.step1.appType,
        frameworkRequest.complexity,
        startTime,
        true
      );

      // Track tool recommendations
      analytics.trackToolRecommendation(
        wizardData.step1.appType,
        framework.builderTools.map(bt => bt.tool.name)
      );

      setPromptFlow('pages');
      toast({
        title: "🚀 Framework Generated!",
        description: `Created ${framework.pages.length} pages with ${framework.builderTools.length} tool recommendations. Ready for page-by-page prompts!`
      });
    } catch (error) {
      console.error("Framework generation error:", error);

      // Track failed framework generation
      analytics.trackFrameworkGeneration(
        wizardData.step1.appType,
        enhancedData.keyFeatures.length > 5 ? 'complex' :
        enhancedData.keyFeatures.length > 2 ? 'medium' : 'simple',
        startTime,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );

      toast({
        title: "Generation Failed",
        description: "Failed to generate framework. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Sequential prompt flow handlers
  const handleNextPrompt = () => {
    if (promptStage === 'framework') {
      // Move to first page prompt
      setPromptStage('page');
      setCurrentPageIndex(0);
      if (pagePrompts.length > 0) {
        setFocusedPrompt(pagePrompts[0].prompt);
        // Add page prompt to history
        setPromptHistory(prev => [...prev, {
          type: 'page',
          title: pagePrompts[0].pageName,
          prompt: pagePrompts[0].prompt,
          timestamp: new Date(),
          pageIndex: 0
        }]);
      }
    } else if (promptStage === 'page') {
      const nextPageIndex = currentPageIndex + 1;
      if (nextPageIndex < pagePrompts.length) {
        // Move to next page
        setCurrentPageIndex(nextPageIndex);
        setFocusedPrompt(pagePrompts[nextPageIndex].prompt);
        // Mark current page as completed
        const updatedCompleted = { ...completedPrompts };
        updatedCompleted.pages[currentPageIndex] = true;
        setCompletedPrompts(updatedCompleted);
        // Add page prompt to history
        setPromptHistory(prev => [...prev, {
          type: 'page',
          title: pagePrompts[nextPageIndex].pageName,
          prompt: pagePrompts[nextPageIndex].prompt,
          timestamp: new Date(),
          pageIndex: nextPageIndex
        }]);
      } else {
        // Move to linking stage
        setPromptStage('linking');
        setFocusedPrompt(linkingPrompt);
        // Mark last page as completed
        const updatedCompleted = { ...completedPrompts };
        updatedCompleted.pages[currentPageIndex] = true;
        setCompletedPrompts(updatedCompleted);
        // Add linking prompt to history
        setPromptHistory(prev => [...prev, {
          type: 'linking',
          title: 'Navigation & Linking',
          prompt: linkingPrompt,
          timestamp: new Date()
        }]);
      }
    } else if (promptStage === 'linking') {
      // Complete the flow
      setPromptStage('complete');
      const updatedCompleted = { ...completedPrompts };
      updatedCompleted.linking = true;
      setCompletedPrompts(updatedCompleted);
    }
  };

  const handlePreviousPrompt = () => {
    if (promptStage === 'page' && currentPageIndex > 0) {
      const prevPageIndex = currentPageIndex - 1;
      setCurrentPageIndex(prevPageIndex);
      setFocusedPrompt(pagePrompts[prevPageIndex].prompt);
    } else if (promptStage === 'page' && currentPageIndex === 0) {
      setPromptStage('framework');
      setFocusedPrompt(frameworkPrompt);
    } else if (promptStage === 'linking') {
      setPromptStage('page');
      setCurrentPageIndex(pagePrompts.length - 1);
      setFocusedPrompt(pagePrompts[pagePrompts.length - 1].prompt);
    }
  };

  const handleGeneratePagePrompt = (pageIndex: number) => {
    const updatedPrompts = [...pagePrompts];
    updatedPrompts[pageIndex].generated = true;
    setPagePrompts(updatedPrompts);

    toast({
      title: "Page Prompt Ready!",
      description: `UI prompt for ${updatedPrompts[pageIndex].pageName} is ready to copy.`
    });
  };

  const handleGenerateLinking = () => {
    // Use enhanced template system for navigation
    const prompt = MVPPromptTemplateService.generateNavigationPrompt(
      pagePrompts,
      wizardData,
      'sidebar', // Default navigation type - could be dynamic based on app type
      recommendedTools[0]?.name.toLowerCase() || 'framer'
    );
    setLinkingPrompt(prompt);
    setPromptFlow('linking');

    toast({
      title: "Navigation Prompt Generated!",
      description: "Your comprehensive navigation and linking prompt is ready with builder-specific instructions."
    });
  };

  const handleComplete = () => {
    const result: MVPAnalysisResult = {
      pages: pagePrompts.map(p => ({
        name: p.pageName,
        description: `${p.pageName} page`,
        components: p.components,
        layout: p.layout
      })),
      navigation: { type: "sidebar", structure: pagePrompts.map(p => ({ name: p.pageName })) },
      components: [],
      styling: {
        theme: wizardData.step2.theme,
        designStyle: wizardData.step2.designStyle,
        colorScheme: ["#000000", "#ffffff", "#22c55e"],
        typography: "Inter, sans-serif",
        spacing: "8px grid system"
      },
      recommendedTools: recommendedTools.map(tool => ({
        name: tool.name,
        description: tool.description,
        pros: tool.bestFor,
        cons: [],
        bestFor: tool.bestFor,
        pricing: "freemium",
        url: tool.url,
        priority: 1
      })),
      uiPrompt: frameworkPrompt,
      launchPath: [],
      frameworkPrompt,
      pagePrompts,
      linkingPrompt,
      currentStep: 'complete'
    };

    onComplete(result);
    onClose();

    toast({
      title: "MVP Blueprint Complete!",
      description: "Your step-by-step prompts are ready to use with AI builders."
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard. Ready to paste into your AI builder!`
    });
  };

  const getCurrentPromptTitle = () => {
    if (promptStage === 'framework') return 'Project Framework';
    if (promptStage === 'page') return `${pagePrompts[currentPageIndex]?.pageName || 'Page'} UI`;
    if (promptStage === 'linking') return 'Navigation & Linking';
    return 'Complete';
  };

  const getCurrentPromptDescription = () => {
    if (promptStage === 'framework') return 'Copy this prompt to generate your app structure and page list';
    if (promptStage === 'page') return `Copy this prompt to generate the UI for ${pagePrompts[currentPageIndex]?.pageName || 'this page'}`;
    if (promptStage === 'linking') return 'Copy this prompt to generate navigation and routing logic';
    return 'All prompts generated successfully!';
  };

  const getRecommendedBuilderForCurrentPrompt = () => {
    if (recommendedTools.length === 0) return null;

    // Return the most suitable tool based on current stage
    if (promptStage === 'framework') {
      return recommendedTools.find(tool =>
        tool.name.toLowerCase().includes('framer') ||
        tool.name.toLowerCase().includes('figma')
      ) || recommendedTools[0];
    }

    if (promptStage === 'page') {
      return recommendedTools.find(tool =>
        tool.name.toLowerCase().includes('flutterflow') ||
        tool.name.toLowerCase().includes('framer')
      ) || recommendedTools[0];
    }

    return recommendedTools[0];
  };

  const openInBuilder = (tool: BuilderTool) => {
    if (tool.openUrl) {
      window.open(tool.openUrl, '_blank');
      toast({
        title: `Opening ${tool.name}`,
        description: "Paste your prompts to start building!"
      });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return wizardData.step1.appName.trim().length > 0 &&
               wizardData.step1.appType.length > 0;
      case 2:
        return wizardData.step2.theme.length > 0 &&
               wizardData.step2.designStyle.length > 0;
      case 3:
        return wizardData.step3.platforms.length > 0;
      case 4:
        return wizardData.step4.selectedAI.length > 0;
      case 5:
        return wizardData.userPrompt.trim().length > 20; // Minimum meaningful description
      default:
        return false;
    }
  };

  // Enhanced validation with helpful feedback
  const getStepValidationMessage = () => {
    switch (currentStep) {
      case 1:
        if (!wizardData.step1.appName.trim()) return "Please enter your app name";
        if (!wizardData.step1.appType) return "Please select an app type";
        return "";
      case 2:
        return "";
      case 3:
        if (wizardData.step3.platforms.length === 0) return "Please select at least one platform";
        return "";
      case 4:
        if (!wizardData.step4.selectedAI) return "Please select an AI engine";
        return "";
      case 5:
        if (wizardData.userPrompt.trim().length < 20) return "Please provide a more detailed description (at least 20 characters)";
        return "";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto workspace-card-solid">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {promptFlow === 'setup' ? (
              <div className="flex flex-col">
                <span>AI MVP Wizard</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {stepConfig[currentStep - 1]?.title} - Step {currentStep} of {totalSteps}
                </span>
              </div>
            ) : promptFlow === 'framework' ? 'Generate Project Framework' :
             promptFlow === 'pages' ? 'Generate Page UI Prompts' :
             promptFlow === 'linking' ? 'Generate Navigation & Linking' : 'MVP Blueprint Complete'}
          </DialogTitle>
          {promptFlow === 'setup' && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {stepConfig[currentStep - 1]?.description}
              </p>
            </div>
          )}
        </DialogHeader>

        <div className="py-6">
          {/* Setup Flow */}
          {promptFlow === 'setup' && (
            <div>
          {/* Step 1: Project Foundation */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-3">
                  {stepConfig[0].icon}
                  <h3 className="text-lg font-semibold ml-2">{stepConfig[0].title}</h3>
                </div>
                <p className="text-muted-foreground">{stepConfig[0].description}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="app-name" className="text-base font-medium">App Name *</Label>
                  <Input
                    id="app-name"
                    placeholder="e.g., TaskMaster, FoodieHub, StudyBuddy"
                    value={wizardData.step1.appName}
                    onChange={(e) => setWizardData({
                      ...wizardData,
                      step1: { ...wizardData.step1, appName: e.target.value }
                    })}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Choose a memorable name for your app</p>
                </div>

                <div>
                  <Label className="text-base font-medium">What type of app are you building? *</Label>
                  <RadioGroup
                    value={wizardData.step1.appType}
                    onValueChange={(value: AppType) => setWizardData({
                      ...wizardData,
                      step1: { ...wizardData.step1, appType: value }
                    })}
                    className="grid grid-cols-1 gap-3 mt-3"
                  >
                    {appTypes.map((type) => (
                      <div key={type.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value={type.value} id={type.value} />
                        <Label htmlFor={type.value} className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="p-2 bg-primary/10 rounded-md">
                            {type.icon}
                          </div>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-muted-foreground">{type.description}</div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="app-description" className="text-base font-medium">Brief Description (Optional)</Label>
                  <Textarea
                    id="app-description"
                    placeholder="A quick summary of what your app does..."
                    value={enhancedData.description}
                    onChange={(e) => setEnhancedData({
                      ...enhancedData,
                      description: e.target.value
                    })}
                    className="mt-2"
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground mt-1">This helps us understand your app better</p>
                </div>

                {/* Validation message */}
                {getStepValidationMessage() && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      {getStepValidationMessage()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Visual Identity */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-3">
                  {stepConfig[1].icon}
                  <h3 className="text-lg font-semibold ml-2">{stepConfig[1].title}</h3>
                </div>
                <p className="text-muted-foreground">{stepConfig[1].description}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Theme Preference</Label>
                  <RadioGroup
                    value={wizardData.step2.theme}
                    onValueChange={(value: UITheme) => setWizardData({
                      ...wizardData,
                      step2: { ...wizardData.step2, theme: value }
                    })}
                    className="grid grid-cols-2 gap-4 mt-3"
                  >
                    {themes.map((theme) => (
                      <div key={theme.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value={theme.value} id={`theme-${theme.value}`} />
                        <Label htmlFor={`theme-${theme.value}`} className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="p-2 bg-primary/10 rounded-md">
                            {theme.icon}
                          </div>
                          <div className="font-medium">{theme.label}</div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-medium">Design Style</Label>
                  <RadioGroup
                    value={wizardData.step2.designStyle}
                    onValueChange={(value: DesignStyle) => setWizardData({
                      ...wizardData,
                      step2: { ...wizardData.step2, designStyle: value }
                    })}
                    className="grid grid-cols-1 gap-3 mt-3"
                  >
                    {designStyles.map((style) => (
                      <div key={style.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value={style.value} id={`style-${style.value}`} />
                        <Label htmlFor={`style-${style.value}`} className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="p-2 bg-primary/10 rounded-md">
                            {style.icon}
                          </div>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-sm text-muted-foreground">{style.description}</div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="color-preference" className="text-base font-medium">Color Preference (Optional)</Label>
                  <Input
                    id="color-preference"
                    placeholder="e.g., Blue and white, Warm earth tones, Vibrant and colorful"
                    value={enhancedData.colorPreference}
                    onChange={(e) => setEnhancedData({
                      ...enhancedData,
                      colorPreference: e.target.value
                    })}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Describe your preferred color scheme</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Platform Strategy */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-3">
                  {stepConfig[2].icon}
                  <h3 className="text-lg font-semibold ml-2">{stepConfig[2].title}</h3>
                </div>
                <p className="text-muted-foreground">{stepConfig[2].description}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Where will your app be available? *</Label>
                  <p className="text-sm text-muted-foreground mb-3">Select all platforms you want to target</p>
                  <div className="grid grid-cols-1 gap-3">
                    {platforms.map((platform) => (
                      <div key={platform.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <Checkbox
                          id={`platform-${platform.value}`}
                          checked={wizardData.step3.platforms.includes(platform.value)}
                          onCheckedChange={(checked) => {
                            const currentPlatforms = wizardData.step3.platforms;
                            const newPlatforms = checked
                              ? [...currentPlatforms, platform.value]
                              : currentPlatforms.filter(p => p !== platform.value);
                            setWizardData({
                              ...wizardData,
                              step3: { ...wizardData.step3, platforms: newPlatforms }
                            });
                          }}
                        />
                        <Label htmlFor={`platform-${platform.value}`} className="cursor-pointer flex-1">
                          <div>
                            <div className="font-medium">{platform.label}</div>
                            <div className="text-sm text-muted-foreground">{platform.description}</div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="target-audience" className="text-base font-medium">Target Audience (Optional)</Label>
                  <Input
                    id="target-audience"
                    placeholder="e.g., Small business owners, College students, Fitness enthusiasts"
                    value={enhancedData.targetAudience}
                    onChange={(e) => setEnhancedData({
                      ...enhancedData,
                      targetAudience: e.target.value
                    })}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Who is your primary user?</p>
                </div>

                {/* Validation message */}
                {getStepValidationMessage() && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      {getStepValidationMessage()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: AI Engine Setup */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-3">
                  {stepConfig[3].icon}
                  <h3 className="text-lg font-semibold ml-2">{stepConfig[3].title}</h3>
                </div>
                <p className="text-muted-foreground">{stepConfig[3].description}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Choose your AI assistant *</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select the AI engine that will generate your MVP blueprint
                  </p>
                  <RadioGroup
                    value={wizardData.step4.selectedAI}
                    onValueChange={(value) => setWizardData({
                      ...wizardData,
                      step4: { ...wizardData.step4, selectedAI: value }
                    })}
                    className="grid grid-cols-1 gap-3"
                  >
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="openai" id="ai-openai" />
                      <Label htmlFor="ai-openai" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <Brain className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium">OpenAI GPT-4</div>
                          <div className="text-sm text-muted-foreground">Most versatile for MVP planning and creative solutions</div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="gemini" id="ai-gemini" />
                      <Label htmlFor="ai-gemini" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Brain className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium">Google Gemini</div>
                          <div className="text-sm text-muted-foreground">Great for technical analysis and data processing</div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="claude" id="ai-claude" />
                      <Label htmlFor="ai-claude" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <Brain className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium">Claude</div>
                          <div className="text-sm text-muted-foreground">Excellent for detailed planning and thorough analysis</div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="deepseek" id="ai-deepseek" />
                      <Label htmlFor="ai-deepseek" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                          <Brain className="h-5 w-5 text-orange-400" />
                        </div>
                        <div>
                          <div className="font-medium">DeepSeek</div>
                          <div className="text-sm text-muted-foreground">Cost-effective option with strong coding capabilities</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-medium">Prompt Style</Label>
                  <RadioGroup
                    value={enhancedData.promptStyle}
                    onValueChange={(value) => setEnhancedData({
                      ...enhancedData,
                      promptStyle: value
                    })}
                    className="grid grid-cols-2 gap-3 mt-3"
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="detailed" id="style-detailed" />
                      <Label htmlFor="style-detailed" className="cursor-pointer">
                        <div className="font-medium">Detailed</div>
                        <div className="text-xs text-muted-foreground">Comprehensive prompts</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="concise" id="style-concise" />
                      <Label htmlFor="style-concise" className="cursor-pointer">
                        <div className="font-medium">Concise</div>
                        <div className="text-xs text-muted-foreground">Brief, focused prompts</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    💡 Don't have an API key? Configure your AI providers in{" "}
                    <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400 underline">
                      Settings → AI Engine
                    </Button>
                  </p>
                </div>

                {/* Validation message */}
                {getStepValidationMessage() && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      {getStepValidationMessage()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Vision & Requirements */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-3">
                  {stepConfig[4].icon}
                  <h3 className="text-lg font-semibold ml-2">{stepConfig[4].title}</h3>
                </div>
                <p className="text-muted-foreground">{stepConfig[4].description}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="user-prompt" className="text-base font-medium">Describe your app vision *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Tell us about your app idea. Be as detailed as possible - what problem does it solve, who are your users, what features do you need?
                  </p>
                  <Textarea
                    id="user-prompt"
                    placeholder="I want to build a meal planning app that helps busy professionals plan their weekly meals, track nutrition, and generate shopping lists. The app should have a clean interface where users can browse recipes, save favorites, and get personalized recommendations based on dietary preferences..."
                    value={wizardData.userPrompt}
                    onChange={(e) => setWizardData({
                      ...wizardData,
                      userPrompt: e.target.value
                    })}
                    className="min-h-[150px]"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-muted-foreground">
                      {wizardData.userPrompt.length}/500 characters
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {wizardData.userPrompt.length < 20 ? 'Need more detail' : 'Good detail level'}
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="key-features" className="text-base font-medium">Key Features (Optional)</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    List the most important features for your MVP
                  </p>
                  <Input
                    id="key-features"
                    placeholder="e.g., User login, Recipe search, Shopping list, Meal calendar"
                    value={enhancedData.keyFeatures.join(', ')}
                    onChange={(e) => setEnhancedData({
                      ...enhancedData,
                      keyFeatures: e.target.value.split(',').map(f => f.trim()).filter(f => f.length > 0)
                    })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="target-users" className="text-base font-medium">Target Users (Optional)</Label>
                  <Input
                    id="target-users"
                    placeholder="e.g., Busy professionals aged 25-40, Health-conscious individuals"
                    value={enhancedData.targetUsers}
                    onChange={(e) => setEnhancedData({
                      ...enhancedData,
                      targetUsers: e.target.value
                    })}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Who will use your app?</p>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    What happens next:
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Step 1: Generate project framework & page structure</li>
                    <li>• Step 2: Create UI prompts for each page individually</li>
                    <li>• Step 3: Generate navigation & linking prompts</li>
                    <li>• Step 4: Get AI tool recommendations with direct links</li>
                    <li>• Copy-paste each prompt into your chosen AI builder</li>
                  </ul>
                </div>

                {/* Validation message */}
                {getStepValidationMessage() && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      {getStepValidationMessage()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
            </div>
          )}

          {/* Sequential Prompt Delivery Flow */}
          {promptFlow === 'framework' && (
            <div className="space-y-6">
              {!frameworkPrompt ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <Layers className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">Generate Your MVP Framework</h3>
                    <p className="text-muted-foreground mb-6">
                      Let's start with the foundation. We'll generate prompts one by one, so you can focus on each step.
                    </p>
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={handleGenerateFramework}
                      disabled={isGenerating}
                      size="lg"
                      className="w-full max-w-md"
                    >
                      {isGenerating ? (
                        <>
                          <Brain className="h-4 w-4 mr-2 animate-spin" />
                          Generating Framework...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Start Sequential Prompt Flow
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Sequential Prompt Display */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Step-by-Step Prompt Flow</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{getCurrentPromptTitle()}</h3>
                    <p className="text-muted-foreground mb-6">
                      {getCurrentPromptDescription()}
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <div className={`w-3 h-3 rounded-full ${promptStage === 'framework' ? 'bg-primary' : completedPrompts.framework ? 'bg-green-500' : 'bg-muted'}`} />
                    <div className="w-8 h-0.5 bg-muted" />
                    <div className={`w-3 h-3 rounded-full ${promptStage === 'page' ? 'bg-primary' : completedPrompts.pages.some(p => p) ? 'bg-green-500' : 'bg-muted'}`} />
                    <div className="w-8 h-0.5 bg-muted" />
                    <div className={`w-3 h-3 rounded-full ${promptStage === 'linking' ? 'bg-primary' : completedPrompts.linking ? 'bg-green-500' : 'bg-muted'}`} />
                  </div>

                  {/* Current Prompt Display */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Prompt Ready!
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(focusedPrompt, getCurrentPromptTitle())}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Prompt
                        </Button>
                        {getRecommendedBuilderForCurrentPrompt() && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(getRecommendedBuilderForCurrentPrompt()?.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open {getRecommendedBuilderForCurrentPrompt()?.name}
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm max-h-60 overflow-y-auto border">
                      {focusedPrompt}
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        onClick={handlePreviousPrompt}
                        disabled={promptStage === 'framework'}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          {promptStage === 'framework' && 'Framework Structure'}
                          {promptStage === 'page' && `Page ${currentPageIndex + 1} of ${pagePrompts.length}`}
                          {promptStage === 'linking' && 'Navigation & Routing'}
                          {promptStage === 'complete' && 'All Done!'}
                        </p>
                      </div>

                      <Button
                        onClick={handleNextPrompt}
                        disabled={promptStage === 'complete'}
                      >
                        {promptStage === 'linking' ? 'Complete' : 'Next'}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pages Generation Flow */}
          {promptFlow === 'pages' && generatedFramework && (
            <PagePromptGenerator
              pagePrompts={pagePrompts}
              builderTools={generatedFramework.builderTools}
              currentPageIndex={currentPageIndex}
              onPageChange={setCurrentPageIndex}
              onPromptUpdate={(index, prompt) => {
                const updatedPrompts = [...pagePrompts];
                updatedPrompts[index] = { ...updatedPrompts[index], prompt };
                setPagePrompts(updatedPrompts);
              }}
              onComplete={handleGenerateLinking}
            />
          )}

          {/* Linking Generation Flow */}
          {promptFlow === 'linking' && (
            <div className="space-y-6">
              <div className="text-center">
                <Link className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Navigation & Linking</h3>
                <p className="text-muted-foreground mb-6">
                  Connect all your pages with navigation and routing logic.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Linking Prompt Ready!</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(linkingPrompt, "Linking prompt")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Prompt
                  </Button>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm max-h-40 overflow-y-auto">
                  {linkingPrompt}
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">🚀 Recommended AI Builder Tools</h4>
                  <div className="grid gap-3">
                    {recommendedTools.map((tool, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{tool.icon}</span>
                            <div>
                              <h5 className="font-medium">{tool.name}</h5>
                              <p className="text-sm text-muted-foreground">{tool.description}</p>
                              <div className="flex gap-1 mt-1">
                                {tool.bestFor.map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(tool.url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Learn More
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openInBuilder(tool)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Open Builder
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="text-center pt-4">
                  <Button onClick={() => setPromptFlow('complete')} size="lg">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete MVP Blueprint
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Complete Flow - Enhanced Summary */}
          {(promptFlow === 'complete' || promptStage === 'complete') && generatedFramework && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-semibold mb-2">MVP Blueprint Complete!</h3>
                <p className="text-muted-foreground mb-6">
                  All your prompts are ready! You can now build your MVP using AI builders.
                </p>
              </div>

              {/* Prompt Summary */}
              <div className="space-y-4">
                <h4 className="font-medium">📋 Your Generated Prompts:</h4>

                <div className="grid gap-3">
                  {promptHistory.map((prompt, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{prompt.title}</h5>
                          <p className="text-sm text-muted-foreground">
                            {prompt.type === 'framework' && '🏗️ App Structure & Pages'}
                            {prompt.type === 'page' && `🎨 UI Design for ${prompt.title}`}
                            {prompt.type === 'linking' && '🔗 Navigation & Routing'}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(prompt.prompt, prompt.title)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Export System */}
              <ExportablePromptsSystem
                framework={generatedFramework}
                pagePrompts={pagePrompts}
                linkingPrompt={linkingPrompt}
                appName={wizardData.step1.appName}
              />
            </div>
          )}

          {/* Setup Navigation buttons */}
          {promptFlow === 'setup' && (
            <div className="pt-6 border-t">
              {/* Step indicator */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center space-x-2">
                  {stepConfig.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        currentStep === step.id
                          ? 'bg-primary text-primary-foreground'
                          : currentStep > step.id
                            ? 'bg-green-500 text-white'
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {currentStep > step.id ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                      </div>
                      {index < stepConfig.length - 1 && (
                        <div className={`w-8 h-0.5 mx-2 transition-colors ${
                          currentStep > step.id ? 'bg-green-500' : 'bg-muted'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Step {currentStep} of {totalSteps}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stepConfig[currentStep - 1]?.title}
                  </p>
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || isGenerating}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Brain className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : currentStep === totalSteps ? (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Start AI Generation
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MVPWizard;
