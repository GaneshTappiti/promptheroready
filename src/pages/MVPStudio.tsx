import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import WorkspaceSidebar, { SidebarToggle } from "@/components/WorkspaceSidebar";
import {
  Plus,
  Code,
  LayoutGrid,
  Brain,
  Palette,
  Sparkles,
  Zap,
  Users,
  Star,
  ExternalLink,
  Target,
  Rocket,
  TrendingUp,
  ArrowRight,
  Menu,
  ChevronLeft
} from "lucide-react";
import { Layers } from "lucide-react";
import MVPWizard from "@/components/mvp-studio/MVPWizard";
import MVPResultsDisplay from "@/components/mvp-studio/MVPResultsDisplay";
import AIToolRecommender from "@/components/ai-tools/AIToolRecommender";
import { MVPAnalysisResult } from "@/types/ideaforge";
import { useAuth } from "@/contexts/AuthContext";
import { aiProviderService } from "@/services/aiProviderService";
import {
  aiToolsDatabase,
  aiToolsCategories,
  getRecommendedTools,
  AITool
} from "@/data/aiToolsDatabase";
import { useToast } from "@/hooks/use-toast";

const MVPStudio = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("wizard");
  const [mvpWizardOpen, setMvpWizardOpen] = useState(false);
  const [showMvpResults, setShowMvpResults] = useState(false);
  const [mvpResult, setMvpResult] = useState<MVPAnalysisResult | null>(null);
  const [isCheckingAI, setIsCheckingAI] = useState(false);
  const [hasAIProvider, setHasAIProvider] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

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
  const mvpTemplates: any[] = [];

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

  const handleTemplateSelect = (template: any) => {
    toast({
      title: "Template Selected",
      description: `Starting MVP Wizard with ${template.name} template`
    });
    setMvpWizardOpen(true);
  };

  return (
    <div className="min-h-screen flex">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 transition-all duration-300">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarToggle onClick={() => setSidebarOpen(true)} />
                <div className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Workspace</span>
                </div>
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
              <TabsList className="bg-black/60 border border-white/20 grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="wizard" className="data-[state=active]:bg-green-600">AI MVP Wizard</TabsTrigger>
                <TabsTrigger value="templates" className="data-[state=active]:bg-green-600">MVP Templates</TabsTrigger>
                <TabsTrigger value="tools" className="data-[state=active]:bg-green-600">AI Tools Hub</TabsTrigger>
              </TabsList>

              {/* AI MVP Wizard Tab */}
              <TabsContent value="wizard" className="space-y-6">
                <div className="text-center space-y-6 py-8">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Sequential Prompt-by-Prompt Builder</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      Generate AI prompts step-by-step for external builders like Framer, FlutterFlow, and Uizard.
                      No overwhelm, just focused prompts delivered one at a time.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="glass-effect p-6 rounded-xl text-center">
                      <Layers className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <h3 className="font-semibold mb-2">1. Framework</h3>
                      <p className="text-sm text-muted-foreground">Generate app structure, pages, and navigation flow</p>
                    </div>
                    <div className="glass-effect p-6 rounded-xl text-center">
                      <Palette className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <h3 className="font-semibold mb-2">2. Page-by-Page UI</h3>
                      <p className="text-sm text-muted-foreground">Create UI prompts for each screen individually</p>
                    </div>
                    <div className="glass-effect p-6 rounded-xl text-center">
                      <ArrowRight className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <h3 className="font-semibold mb-2">3. Linking & Flow</h3>
                      <p className="text-sm text-muted-foreground">Connect pages with navigation and routing logic</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button
                      onClick={handleStartMVPWizard}
                      size="lg"
                      className="px-8 py-3 text-lg workspace-button"
                      disabled={isCheckingAI}
                    >
                      {isCheckingAI ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Checking AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-3" />
                          Start Sequential MVP Builder
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      ✨ Modular • 🎯 Focused • 🛠️ Builder-Ready • 🚀 Export-Friendly
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* MVP Templates Tab */}
              <TabsContent value="templates" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">MVP Templates</h2>
                  <p className="text-muted-foreground">Pre-configured templates to jumpstart your MVP development</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mvpTemplates.map(template => (
                    <Card key={template.id} className="workspace-card workspace-hover hover:translate-y-[-2px] transition-all cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <template.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                            <p className="text-muted-foreground mb-3">{template.description}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {template.tags.map(tag => (
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
                            <Badge variant={template.complexity === 'High' ? 'destructive' : template.complexity === 'Medium' ? 'default' : 'secondary'}>
                              {template.complexity}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Est. Time:</span>
                            <span>{template.estimatedTime}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Recommended Tools:</span>
                            <span className="text-right">{template.recommendedTools.slice(0, 2).join(', ')}</span>
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
