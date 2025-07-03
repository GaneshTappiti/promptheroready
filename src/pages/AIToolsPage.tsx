import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Brain,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  Target,
  Rocket,
  Star,
  ExternalLink,
  ArrowRight,
  Lightbulb,
  Code,
  Palette,
  Database,
  Globe,
  ChevronLeft
} from 'lucide-react';
import WorkspaceSidebar, { SidebarToggle } from '@/components/WorkspaceSidebar';
import AIToolRecommender from '@/components/ai-tools/AIToolRecommender';
import { aiToolsCategories, aiToolsDatabase } from '@/data/aiToolsDatabase';

const AIToolsPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleToolSelect = (tool: any) => {
    toast({
      title: "Tool Selected",
      description: `Opening ${tool.name} in a new tab`
    });
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
                <Link
                  to="/workspace"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Workspace</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-8 w-8 text-green-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">AI Tools Hub</h1>
            </div>
            <p className="text-gray-400 text-lg">
              Discover and explore the best AI tools for your projects
            </p>
          </div>

          {/* Main Content Container */}
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6 space-y-8">
          
          {/* Hero Section */}
          <div className="text-center space-y-6 py-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                AI Tools Hub
              </h1>
            </div>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the perfect AI tools to build, design, and deploy your MVP. 
              From coding assistants to design tools, find everything you need to bring your ideas to life.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
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
                <span className="text-sm">Curated & Updated</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoryStats.slice(0, 4).map((category) => (
              <Card key={category.id} className="workspace-card text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <div className="text-2xl font-bold">{category.count}</div>
                  <div className="text-sm text-muted-foreground">{category.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Featured Tools */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <h2 className="text-2xl font-bold">Featured Tools</h2>
              <Badge variant="secondary">Most Popular</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTools.map((tool) => (
                <Card key={tool.id} className="workspace-card group hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {aiToolsCategories.find(c => c.id === tool.category)?.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={tool.pricing.model === 'free' ? 'default' : 'secondary'}>
                              {tool.pricing.inr}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">{tool.popularity}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{tool.description}</CardDescription>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tool.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      onClick={() => {
                        window.open(tool.officialUrl, '_blank');
                        handleToolSelect(tool);
                      }}
                      className="w-full"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Try {tool.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Free Tools Spotlight */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-green-500" />
              <h2 className="text-2xl font-bold">Free Tools to Get Started</h2>
              <Badge variant="outline" className="text-green-600 border-green-600">
                $0 Budget
              </Badge>
            </div>
            
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
                        onClick={() => {
                          window.open(tool.officialUrl, '_blank');
                          handleToolSelect(tool);
                        }}
                      >
                        Try Free
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Main Tool Recommender */}
          <div className="glass-effect rounded-2xl p-8">
            <AIToolRecommender
              onToolSelect={handleToolSelect}
              showRecommendationFlow={true}
            />
          </div>

          {/* Growth Strategy Section */}
          <div className="glass-effect-strong rounded-2xl p-8">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">Ready to Build Your MVP?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of founders who've used our AI tool recommendations to build successful MVPs. 
                From idea to launch in record time.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center space-y-3">
                  <div className="p-3 glass-effect-light rounded-full w-fit mx-auto">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">1. Get Recommendations</h3>
                  <p className="text-sm text-muted-foreground">
                    Tell us about your MVP and get personalized tool suggestions
                  </p>
                </div>

                <div className="text-center space-y-3">
                  <div className="p-3 glass-effect-light rounded-full w-fit mx-auto">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">2. Build with AI</h3>
                  <p className="text-sm text-muted-foreground">
                    Use recommended tools to design, code, and deploy your MVP
                  </p>
                </div>

                <div className="text-center space-y-3">
                  <div className="p-3 glass-effect-light rounded-full w-fit mx-auto">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">3. Launch & Scale</h3>
                  <p className="text-sm text-muted-foreground">
                    Deploy your MVP and iterate based on user feedback
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start Building Now
                </Button>
                <Button variant="outline" size="lg" className="bg-black/60 border-white/20 hover:bg-black/80">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  View Success Stories
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
};

export default AIToolsPage;
