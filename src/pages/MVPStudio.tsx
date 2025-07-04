import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import WorkspaceSidebar, { SidebarToggle } from "@/components/WorkspaceSidebar";
import {
  Plus,
  Brain,
  Sparkles,
  Zap,
  Users,
  Star,
  ExternalLink,
  Rocket,

  ChevronLeft,
  Target
} from "lucide-react";
import MVPWizard from "@/components/mvp-studio/MVPWizard";
import MVPResultsDisplay from "@/components/mvp-studio/MVPResultsDisplay";
import AIToolRecommender from "@/components/ai-tools/AIToolRecommender";
import IdeaPromptHistory from "@/components/mvp-studio/IdeaPromptHistory";
import UpgradePrompt from "@/components/UpgradePrompt";
import { MVPAnalysisResult } from "@/types/ideaforge";
import { useAuth } from "@/contexts/AuthContext";
import { aiProviderService } from "@/services/aiProviderService";
import {
  aiToolsDatabase,
  aiToolsCategories,
  AITool
} from "@/data/aiToolsDatabase";
import { useToast } from "@/hooks/use-toast";
import { useActiveIdea, usePromptHistory, useIdeaStore } from "@/stores/ideaStore";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { mvpStudioHelpers } from "@/lib/supabase-connection-helpers";

const MVPStudio = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tool-recommendation");
  const [mvpWizardOpen, setMvpWizardOpen] = useState(false);
  const [showMvpResults, setShowMvpResults] = useState(false);
  const [mvpResult, setMvpResult] = useState<MVPAnalysisResult | null>(null);
  const [isCheckingAI, setIsCheckingAI] = useState(false);
  const [hasAIProvider, setHasAIProvider] = useState(false);
  // const [selectedCategory, setSelectedCategory] = useState('all');
  const [mvps, setMvps] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  // New state for sequential flow
  // const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAppType, setSelectedAppType] = useState<'web' | 'mobile' | 'saas' | null>(null);
  const [selectedTools, setSelectedTools] = useState<AITool[]>([]);

  // Store hooks
  const { activeIdea } = useActiveIdea();
  const { addPrompt, getPrompt } = usePromptHistory();
  const canGeneratePrompts = useIdeaStore((state) => state.canGeneratePrompts);
  const getRemainingPrompts = useIdeaStore((state) => state.getRemainingPrompts);

  // Initialize Gemini AI
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = geminiApiKey && geminiApiKey !== 'your-gemini-api-key'
    ? new GoogleGenerativeAI(geminiApiKey)
    : null;

  // Database helper functions
  const loadMVPs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await mvpStudioHelpers.getMVPs(user.id);

      if (error) throw error;

      setMvps(data || []);
    } catch (error: unknown) {
      console.error('Error loading MVPs:', error);
      toast({
        title: "Error Loading MVPs",
        description: "Failed to load your MVPs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const savePromptToDatabase = async (section: string, sectionKey: string, prompt: string, response: string) => {
    if (!user || !activeIdea) return;

    try {
      await mvpStudioHelpers.savePromptHistory({
        idea_id: activeIdea.id,
        prompt_text: prompt,
        response_text: response,
        prompt_type: section,
        ai_provider: 'gemini',
        model_used: 'gemini-2.0-flash',
        user_id: user.id,
        metadata: {
          section_key: sectionKey,
          app_type: selectedAppType,
          tools: selectedTools.map(t => t.name)
        }
      });
    } catch (error: unknown) {
      console.error('Error saving prompt to database:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadMVPs();
    }
  }, [user]);

  // Sequential prompt generation
  const generatePagePrompt = async (pageName: string, pageDescription: string) => {
    if (!activeIdea) return;

    if (!canGeneratePrompts()) {
      toast({
        title: "Prompt Limit Reached",
        description: "You've reached your free tier prompt limit. Upgrade to Pro for unlimited prompts.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Get context from IdeaForge prompts
      const targetUserPrompt = getPrompt('ideaforge', 'target-user');
      const featuresPrompt = getPrompt('ideaforge', 'features');
      const uiDesignPrompt = getPrompt('ideaforge', 'ui-design');

      const contextPrompt = `
      Based on this startup idea and research:

      Idea: ${activeIdea.title}
      Description: ${activeIdea.description}

      ${targetUserPrompt ? `Target User Research: ${targetUserPrompt.response}` : ''}
      ${featuresPrompt ? `Core Features: ${featuresPrompt.response}` : ''}
      ${uiDesignPrompt ? `UI Design Guidelines: ${uiDesignPrompt.response}` : ''}

      Generate a detailed prompt for building the "${pageName}" page/screen.

      Page Description: ${pageDescription}
      App Type: ${selectedAppType || 'web'}
      Recommended Tools: ${selectedTools.map(t => t.name).join(', ')}

      Create a comprehensive prompt that includes:
      1. Page purpose and user goals
      2. Specific UI components needed
      3. Layout and design specifications
      4. Interactive elements and functionality
      5. Data requirements
      6. Tool-specific implementation hints

      Format this as a ready-to-use prompt for AI builders like ${selectedTools.map(t => t.name).join(', ')}.
      `;

      const result = await model.generateContent(contextPrompt);
      const response = await result.response;
      const text = response.text();

      // Save to prompt history with organized structure
      const promptData = {
        id: Date.now().toString(),
        prompt: `Generate ${pageName} page for ${activeIdea.title}`,
        response: text,
        timestamp: new Date().toISOString(),
        section: `${activeIdea.id}-${pageName.toLowerCase().replace(/\s+/g, '-')}`,
        ideaId: activeIdea.id,
        ideaTitle: activeIdea.title,
        pageType: pageName,
        appType: selectedAppType,
        tools: selectedTools.map(t => t.name)
      };

      // Save to local store for immediate UI updates
      addPrompt('mvpStudio', `${activeIdea.id}-${pageName.toLowerCase().replace(/\s+/g, '-')}`, promptData);

      // Save to database for persistence
      await savePromptToDatabase(
        'mvpstudio',
        `${activeIdea.id}-${pageName.toLowerCase().replace(/\s+/g, '-')}`,
        `Generate ${pageName} page for ${activeIdea.title}`,
        text
      );

      toast({
        title: "Page Prompt Generated!",
        description: `${pageName} prompt has been generated and saved.`,
      });

    } catch (error) {
      console.error('Error generating page prompt:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate page prompt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Enhanced AI Tools data from database
  const categoryStats = aiToolsCategories.map(category => ({
    ...category,
    count: aiToolsDatabase.filter(tool => tool.category === category.id).length,
    avgPopularity: Math.round(
      aiToolsDatabase
        .filter(tool => tool.category === category.id)
        .reduce((sum, tool) => sum + tool.popularity, 0) /
      aiToolsDatabase.filter(tool => tool.category === category.id).length
    )
  }));

  const featuredTools = aiToolsDatabase
    .filter(tool => tool.popularity >= 85)
    .slice(0, 6);

  const freeTools = aiToolsDatabase
    .filter(tool => tool.pricing.model === 'free')
    .slice(0, 4);

  const builderTools = aiToolsDatabase
    .filter(tool => tool.category === 'app-builders')
    .slice(0, 6);

  // Templates will be loaded dynamically based on user preferences and AI recommendations
  const mvpTemplates: unknown[] = [];

  // Check AI provider on component mount
  useEffect(() => {
    const checkAIProvider = async () => {
      setIsCheckingAI(true);
      try {
        const providers = await aiProviderService.getProviders();
        setHasAIProvider(providers.length > 0);
      } catch (error) {
        console.error('Error checking AI providers:', error);
        setHasAIProvider(false);
      } finally {
        setIsCheckingAI(false);
      }
    };

    checkAIProvider();
  }, []);

  const handleStartMVPWizard = () => {
    setMvpWizardOpen(true);
  };

  const handleMvpWizardComplete = (result: MVPAnalysisResult) => {
    setMvpResult(result);
    setMvpWizardOpen(false);
    setShowMvpResults(true);
  };

  const handleCloseMvpResults = () => {
    setShowMvpResults(false);
    setMvpResult(null);
  };

  const handleToolSelect = (tool: AITool) => {
    toast({
      title: "Tool Selected",
      description: `Opening ${tool.name} in a new tab`
    });
    window.open(tool.officialUrl, '_blank');
  };

  const handleTemplateSelect = (template: unknown) => {
    toast({
      title: "Template Selected",
      description: `Starting MVP Wizard with ${(template as any).name} template`
    });
    setMvpWizardOpen(true);
  };

  return (
    <div className="layout-container">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="layout-main transition-all duration-300">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarToggle onClick={() => setSidebarOpen(true)} />
                <Link
                  to="/workspace"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Workspace</span>
                </Link>
              </div>
              <Button
                onClick={() => setMvpWizardOpen(true)}
                className="bg-green-600 hover:bg-green-700"
                disabled={!hasAIProvider}
              >
                <Plus className="h-4 w-4 mr-2" />
                New MVP
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-8 w-8 text-green-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">MVP Studio</h1>
            </div>
            <p className="text-gray-400 text-lg">
              Build your MVP with AI-powered insights and tool recommendations
            </p>
          </div>

          {/* Main Content Container */}
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
            {/* Hero Section */}
            <div className="text-center space-y-6 py-8 mb-8">
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Your AI-powered build orchestrator. Generate prompts, get tool recommendations,
                and build your MVP with the best AI builders in the market.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full border border-white/10">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-white">AI-Generated Prompts</span>
                </div>
                <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full border border-white/10">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-white">{aiToolsDatabase.length}+ Tools</span>
                </div>
                <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full border border-white/10">
                  <Star className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-white">Export Ready</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
              <Button
                onClick={handleStartMVPWizard}
                size="lg"
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                disabled={isCheckingAI}
              >
                {isCheckingAI ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Checking AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Start AI MVP Wizard
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-black/60 border-white/20 hover:bg-black/80"
                onClick={() => setActiveTab('tools')}
              >
                <Target className="h-5 w-5 mr-2" />
                Browse AI Tools
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-black/60 border border-white/20 grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="tool-recommendation" className="data-[state=active]:bg-green-600">Tool Recommendation</TabsTrigger>
                <TabsTrigger value="page-generator" className="data-[state=active]:bg-green-600">Page Generator</TabsTrigger>
                <TabsTrigger value="final-mapping" className="data-[state=active]:bg-green-600">Final Mapping</TabsTrigger>
                <TabsTrigger value="prompt-history" className="data-[state=active]:bg-green-600">Prompt History</TabsTrigger>
              </TabsList>

              {/* Tool Recommendation Tab */}
              <TabsContent value="tool-recommendation" className="space-y-6">
                <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Step 1: Choose Your App Type & Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-white font-medium mb-4">What type of app are you building?</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {['web', 'mobile', 'saas'].map((type) => (
                          <Button
                            key={type}
                            variant={selectedAppType === type ? "default" : "outline"}
                            onClick={() => setSelectedAppType(type as any)}
                            className={selectedAppType === type ? "bg-green-600 hover:bg-green-700" : "border-gray-600 text-gray-300 hover:bg-gray-800"}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {selectedAppType && (
                      <div>
                        <h4 className="text-white font-medium mb-4">Recommended Tools for {selectedAppType} apps:</h4>
                        <AIToolRecommender
                          onToolSelect={(tool) => setSelectedTools(prev => [...prev, tool])}
                        />
                      </div>
                    )}

                    {selectedTools.length > 0 && (
                      <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4">
                        <h5 className="text-green-400 font-medium mb-2">Selected Tools:</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedTools.map((tool, index) => (
                            <Badge key={index} className="bg-green-600/20 text-green-400">
                              {tool.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Page Generator Tab */}
              <TabsContent value="page-generator" className="space-y-6">
                <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Step 2: Generate Page-by-Page Prompts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!selectedAppType ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400">Please select an app type in the Tool Recommendation tab first.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-300">Generate AI prompts for each page of your {selectedAppType} app:</p>
                          <div className="text-sm text-gray-400">
                            {getRemainingPrompts() === -1 ? (
                              <Badge className="bg-green-600/20 text-green-400">Unlimited</Badge>
                            ) : (
                              <span>{getRemainingPrompts()} prompts remaining</span>
                            )}
                          </div>
                        </div>

                        {getRemainingPrompts() === 0 && (
                          <UpgradePrompt
                            feature="More Prompts"
                            description="You've used all your free prompts for this idea. Upgrade to Pro for unlimited AI prompts."
                            variant="alert"
                          />
                        )}

                        {['Homepage', 'Onboarding', 'Dashboard', 'Settings', 'Profile'].map((pageName) => {
                          const existingPrompt = getPrompt('mvpStudio', `${activeIdea?.id}-${pageName.toLowerCase()}`);
                          return (
                            <Card key={pageName} className="bg-gray-900/50 border-gray-700">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h5 className="text-white font-medium">{pageName} Page</h5>
                                    <p className="text-gray-400 text-sm">Generate prompt for {pageName.toLowerCase()} page</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {existingPrompt && (
                                      <Badge className="bg-green-600/20 text-green-400">Generated</Badge>
                                    )}
                                    <Button
                                      onClick={() => generatePagePrompt(pageName, `Create a ${pageName.toLowerCase()} page for the ${selectedAppType} app`)}
                                      disabled={isGenerating}
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      {isGenerating ? "Generating..." : existingPrompt ? "Regenerate" : "Generate"}
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Final Mapping Tab */}
              <TabsContent value="final-mapping" className="space-y-6">
                <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Step 3: Final App Mapping & Architecture</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center py-8">
                      <p className="text-gray-300 mb-4">Generate the final comprehensive prompt that ties all pages together:</p>
                      <Button
                        onClick={() => {/* generateFinalMappingPrompt() */}}
                        disabled={isGenerating}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isGenerating ? "Generating..." : "Generate Final Mapping"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Prompt History Tab */}
              <TabsContent value="prompt-history" className="space-y-6">
                {activeIdea ? (
                  <IdeaPromptHistory
                    ideaId={activeIdea.id}
                    ideaTitle={activeIdea.title}
                  />
                ) : (
                  <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                    <CardContent className="text-center py-8">
                      <p className="text-gray-400">No active idea selected</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* MVP Templates Tab */}
              <TabsContent value="templates" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">MVP Templates</h2>
                  <p className="text-muted-foreground">Pre-configured templates to jumpstart your MVP development</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mvpTemplates.map(template => (
                    <Card key={(template as any).id} className="workspace-card workspace-hover hover:translate-y-[-2px] transition-all cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            {React.createElement((template as any).icon, { className: "h-6 w-6 text-primary" })}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{(template as any).name}</h3>
                            <p className="text-muted-foreground mb-3">{(template as any).description}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {(template as any).tags.map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Complexity:</span>
                            <Badge variant={(template as any).complexity === 'High' ? 'destructive' : (template as any).complexity === 'Medium' ? 'default' : 'secondary'}>
                              {(template as any).complexity}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Est. Time:</span>
                            <span>{(template as any).estimatedTime}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Recommended Tools:</span>
                            <span className="text-right">{(template as any).recommendedTools.slice(0, 2).join(', ')}</span>
                          </div>
                        </div>

                        <Button
                          className="w-full mt-4 workspace-button"
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <Rocket className="h-4 w-4 mr-2" />
                          Use This Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* AI Tools Hub Tab */}
              <TabsContent value="tools" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">AI Tools Hub</h2>
                  <p className="text-muted-foreground">Discover the perfect AI tools to build, design, and deploy your MVP</p>

                  <div className="flex flex-wrap justify-center gap-4 mt-6">
                    <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{aiToolsDatabase.length}+ Tools</span>
                    </div>
                    <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{aiToolsCategories.length} Categories</span>
                    </div>
                    <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full">
                      <Star className="h-4 w-4 text-primary" />
                      <span className="text-sm">INR Pricing</span>
                    </div>
                  </div>
                </div>

                {/* Featured Builder Tools */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">🏗️ Featured App Builders</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {builderTools.map((tool) => (
                      <Card key={tool.id} className="workspace-card group hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{aiToolsCategories.find(c => c.id === tool.category)?.icon}</div>
                              <div>
                                <CardTitle className="text-lg">{tool.name}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={tool.pricing.model === 'free' ? 'default' : 'secondary'}>
                                    {tool.pricing.inr}
                                  </Badge>
                                  {tool.apiCompatible && (
                                    <Badge variant="outline" className="text-xs">API</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-muted-foreground">{tool.popularity}</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {tool.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-4">
                            {tool.bestFor.slice(0, 3).map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleToolSelect(tool)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Open Tool
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Free Tools Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">🆓 Free Tools to Get Started</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {freeTools.map((tool) => (
                      <Card key={tool.id} className="workspace-card hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
                        <CardContent className="pt-6">
                          <div className="text-center space-y-3">
                            <div className="text-2xl">
                              {aiToolsCategories.find(c => c.id === tool.category)?.icon}
                            </div>
                            <h3 className="font-semibold">{tool.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {tool.description}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => handleToolSelect(tool)}
                            >
                              Try Free
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Full AI Tool Recommender */}
                <div className="glass-effect rounded-2xl p-8">
                  <AIToolRecommender
                    onToolSelect={handleToolSelect}
                    showRecommendationFlow={true}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <MVPWizard
        isOpen={mvpWizardOpen}
        onClose={() => setMvpWizardOpen(false)}
        onComplete={handleMvpWizardComplete}
      />

      {showMvpResults && mvpResult && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
          <MVPResultsDisplay
            result={mvpResult}
            onClose={handleCloseMvpResults}
          />
        </div>
      )}
    </div>
  );
};

export default MVPStudio;
