import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  ExternalLink,
  Star,
  Brain,
  Sparkles,
  Copy,
  CheckCircle,
  ArrowRight,
  Target,
  Rocket
} from 'lucide-react';
import {
  aiToolsDatabase,
  aiToolsCategories,
  AITool
} from '@/data/aiToolsDatabase';
import { aiToolsSyncService } from '@/services/aiToolsSyncService';

interface AIToolRecommenderProps {
  onToolSelect?: (tool: AITool) => void;
  showRecommendationFlow?: boolean;
}

interface RecommendationForm {
  idea: string;
  appType: string;
  platforms: string[];
  designStyle: string;
  budget: 'free' | 'freemium' | 'paid' | 'any';
  experience: string;
  timeline: string;
  primaryGoal: string;
  teamSize: string;
  technicalLevel: string;
}

interface SmartRecommendation {
  tool: AITool;
  score: number;
  reasons: string[];
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export const AIToolRecommender: React.FC<AIToolRecommenderProps> = ({
  onToolSelect,
  showRecommendationFlow = true
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState('any');
  const [filteredTools, setFilteredTools] = useState<AITool[]>([]);
  const [allTools, setAllTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecommendationDialog, setShowRecommendationDialog] = useState(false);
  const [recommendationForm, setRecommendationForm] = useState<RecommendationForm>({
    idea: '',
    appType: '',
    platforms: [],
    designStyle: '',
    budget: 'any',
    experience: '',
    timeline: '',
    primaryGoal: '',
    teamSize: '',
    technicalLevel: ''
  });
  const [recommendedTools, setRecommendedTools] = useState<AITool[]>([]);
  const [smartRecommendations, setSmartRecommendations] = useState<SmartRecommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendationStep, setRecommendationStep] = useState(1);
  const [categoryRecommendations, setCategoryRecommendations] = useState<Record<string, AITool[]>>({});

  useEffect(() => {
    loadTools();
  }, []);

  useEffect(() => {
    filterTools();
  }, [searchQuery, selectedCategory, priceFilter, allTools]);

  const loadTools = async () => {
    try {
      setLoading(true);
      const tools = await aiToolsSyncService.getAllTools();
      setAllTools(tools);
      setFilteredTools(tools);
    } catch (error) {
      console.error('Error loading tools:', error);
      // Fallback to static data
      setAllTools(aiToolsDatabase);
      setFilteredTools(aiToolsDatabase);
    } finally {
      setLoading(false);
    }
  };

  const filterTools = () => {
    let tools = allTools;

    // Filter by search query
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      tools = tools.filter(tool =>
        tool.name.toLowerCase().includes(lowercaseQuery) ||
        tool.description.toLowerCase().includes(lowercaseQuery) ||
        tool.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
        tool.bestFor.some(use => use.toLowerCase().includes(lowercaseQuery))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      tools = tools.filter(tool => tool.category === selectedCategory);
    }

    // Filter by price
    if (priceFilter !== 'any') {
      tools = tools.filter(tool => tool.pricing.model === priceFilter);
    }

    setFilteredTools(tools);
  };

  // Smart recommendation algorithm
  const generateSmartRecommendations = (form: RecommendationForm): SmartRecommendation[] => {
    const recommendations: SmartRecommendation[] = [];

    allTools.forEach(tool => {
      let score = 0;
      const reasons: string[] = [];

      // Budget compatibility
      if (form.budget === 'any' || tool.pricing.model === form.budget) {
        score += 20;
        if (tool.pricing.model === 'free') reasons.push('Free to use');
        else if (tool.pricing.model === 'freemium') reasons.push('Free tier available');
      }

      // Platform compatibility
      if (form.platforms.some(platform => tool.platforms.includes(platform as any))) {
        score += 25;
        reasons.push(`Supports ${form.platforms.join(', ')} platforms`);
      }

      // App type relevance
      const appTypeKeywords = {
        'web-app': ['web', 'website', 'browser'],
        'mobile-app': ['mobile', 'app', 'ios', 'android'],
        'saas': ['saas', 'platform', 'dashboard', 'business'],
        'chrome-extension': ['extension', 'browser', 'chrome'],
        'ai-app': ['ai', 'machine learning', 'chatbot']
      };

      const keywords = appTypeKeywords[form.appType as keyof typeof appTypeKeywords] || [];
      const matchesAppType = keywords.some(keyword =>
        tool.description.toLowerCase().includes(keyword) ||
        tool.bestFor.some(use => use.toLowerCase().includes(keyword))
      );

      if (matchesAppType) {
        score += 30;
        reasons.push(`Perfect for ${form.appType.replace('-', ' ')} development`);
      }

      // Technical level consideration
      if (form.technicalLevel === 'beginner' && tool.category === 'app-builders') {
        score += 15;
        reasons.push('No-code solution, beginner-friendly');
      } else if (form.technicalLevel === 'advanced' && tool.category === 'dev-ides') {
        score += 15;
        reasons.push('Advanced development capabilities');
      }

      // Popularity boost
      if (tool.popularity >= 85) {
        score += 10;
        reasons.push('Highly popular and trusted');
      }

      // Team size consideration
      if (form.teamSize === 'solo' && tool.bestFor.some(use => use.toLowerCase().includes('individual'))) {
        score += 10;
        reasons.push('Great for solo developers');
      }

      // Primary goal alignment
      if (form.primaryGoal === 'speed' && tool.bestFor.some(use => use.toLowerCase().includes('quick'))) {
        score += 15;
        reasons.push('Optimized for rapid development');
      }

      if (score > 30) { // Only include tools with decent relevance
        recommendations.push({
          tool,
          score,
          reasons,
          category: tool.category,
          priority: score >= 70 ? 'high' : score >= 50 ? 'medium' : 'low'
        });
      }
    });

    return recommendations.sort((a, b) => b.score - a.score);
  };

  const handleRecommendationSubmit = () => {
    if (!recommendationForm.idea || !recommendationForm.appType) {
      toast({
        title: "Missing Information",
        description: "Please fill in your idea and app type to get recommendations.",
        variant: "destructive"
      });
      return;
    }

    const smartRecs = generateSmartRecommendations(recommendationForm);
    setSmartRecommendations(smartRecs);

    // Group by category for better organization
    const categoryGroups: Record<string, AITool[]> = {};
    smartRecs.forEach(rec => {
      if (!categoryGroups[rec.category]) {
        categoryGroups[rec.category] = [];
      }
      categoryGroups[rec.category].push(rec.tool);
    });
    setCategoryRecommendations(categoryGroups);

    // Also set the basic recommended tools for backward compatibility
    const topTools = smartRecs.slice(0, 6).map(rec => rec.tool);
    setRecommendedTools(topTools);

    setShowRecommendations(true);
    setShowRecommendationDialog(false);

    toast({
      title: "Smart Recommendations Ready!",
      description: `Found ${smartRecs.length} tools with personalized scoring for your MVP.`
    });
  };

  const copyToolInfo = (tool: AITool) => {
    const info = `${tool.name}\n${tool.description}\nPricing: ${tool.pricing.inr}\nLink: ${tool.officialUrl}`;
    navigator.clipboard.writeText(info);
    toast({
      title: "Copied!",
      description: `${tool.name} information copied to clipboard`
    });
  };

  const openTool = (tool: AITool) => {
    window.open(tool.officialUrl, '_blank');
    onToolSelect?.(tool);
  };

  const SmartToolCard: React.FC<{ recommendation: SmartRecommendation }> = ({ recommendation }) => {
    const { tool, score, reasons, priority } = recommendation;

    return (
      <Card className={`workspace-card group hover:shadow-lg transition-all duration-300 hover:scale-[1.01] ${
        priority === 'high' ? 'ring-2 ring-primary shadow-lg' :
        priority === 'medium' ? 'ring-1 ring-primary/50' : ''
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{aiToolsCategories.find(c => c.id === tool.category)?.icon}</div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {tool.name}
                  <Badge className={`text-xs ${
                    priority === 'high' ? 'bg-green-500/20 text-green-400' :
                    priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {Math.round(score)}% match
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={tool.pricing.model === 'free' ? 'default' : 'secondary'}>
                    {tool.pricing.inr}
                  </Badge>
                  {tool.apiCompatible && (
                    <Badge variant="outline" className="text-xs">API</Badge>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">{tool.popularity}%</span>
                  </div>
                </div>
              </div>
            </div>
            {priority === 'high' && (
              <Badge className="bg-primary/10 text-primary">
                <Sparkles className="h-3 w-3 mr-1" />
                Top Pick
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="text-sm">{tool.description}</CardDescription>

          <div className="space-y-2">
            <div className="text-sm font-medium text-primary">Why this matches your needs:</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {reasons.slice(0, 3).map((reason, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-1">
            {tool.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => openTool(tool)}
              className="flex-1"
              size="sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Start Building
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToolInfo(tool)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ToolCard: React.FC<{ tool: AITool; isRecommended?: boolean }> = ({ tool, isRecommended = false }) => (
    <Card className={`workspace-card group hover:shadow-lg transition-all duration-300 hover:scale-[1.01] ${isRecommended ? 'ring-2 ring-primary' : ''}`}>
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
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">{tool.popularity}%</span>
                </div>
              </div>
            </div>
          </div>
          {isRecommended && (
            <Badge className="bg-primary/10 text-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              Recommended
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-sm">{tool.description}</CardDescription>
        
        <div className="space-y-2">
          <div className="text-sm font-medium text-primary">Why we recommend it:</div>
          <div className="text-sm text-muted-foreground">{tool.whyRecommend}</div>
        </div>

        <div className="flex flex-wrap gap-1">
          {tool.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Best for:</div>
          <div className="text-xs text-muted-foreground">
            {tool.bestFor.slice(0, 3).join(' • ')}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => openTool(tool)}
            className="flex-1"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Use This Tool
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToolInfo(tool)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">🛠️ AI Tool Recommender</h2>
          <p className="text-muted-foreground">Loading AI tools...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="workspace-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-white/10 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">🛠️ AI Tool Recommender</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover the perfect AI tools to build, design, and deploy your MVP. 
          Get personalized recommendations based on your project needs.
        </p>
        
        {showRecommendationFlow && (
          <Dialog open={showRecommendationDialog} onOpenChange={setShowRecommendationDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80">
                <Brain className="h-5 w-5 mr-2" />
                Get AI Recommendations
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto glass-effect">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Smart MVP Tool Recommendations
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Step {recommendationStep} of 3 - Tell us about your project for personalized recommendations
                </p>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Step 1: Basic Info */}
                {recommendationStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="idea">What's your app idea? *</Label>
                      <Textarea
                        id="idea"
                        placeholder="e.g., A fitness tracking SaaS that helps users plan workouts and track nutrition..."
                        value={recommendationForm.idea}
                        onChange={(e) => setRecommendationForm({
                          ...recommendationForm,
                          idea: e.target.value
                        })}
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>App Type *</Label>
                        <Select
                          value={recommendationForm.appType}
                          onValueChange={(value) => setRecommendationForm({
                            ...recommendationForm,
                            appType: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select app type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="web-app">Web App</SelectItem>
                            <SelectItem value="mobile-app">Mobile App</SelectItem>
                            <SelectItem value="saas">SaaS Platform</SelectItem>
                            <SelectItem value="chrome-extension">Chrome Extension</SelectItem>
                            <SelectItem value="ai-app">AI-Powered App</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Primary Goal</Label>
                        <Select
                          value={recommendationForm.primaryGoal}
                          onValueChange={(value) => setRecommendationForm({
                            ...recommendationForm,
                            primaryGoal: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="What's most important?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="speed">Build quickly</SelectItem>
                            <SelectItem value="quality">High quality design</SelectItem>
                            <SelectItem value="cost">Minimize costs</SelectItem>
                            <SelectItem value="scalability">Future scalability</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={() => setRecommendationStep(2)}>
                        Next Step
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Technical Details */}
                {recommendationStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Budget</Label>
                        <Select
                          value={recommendationForm.budget}
                          onValueChange={(value: string) => setRecommendationForm({
                            ...recommendationForm,
                            budget: value as "free" | "freemium" | "paid" | "any"
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any Budget</SelectItem>
                            <SelectItem value="free">Free Only</SelectItem>
                            <SelectItem value="freemium">Freemium</SelectItem>
                            <SelectItem value="paid">Paid Tools</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Technical Level</Label>
                        <Select
                          value={recommendationForm.technicalLevel}
                          onValueChange={(value) => setRecommendationForm({
                            ...recommendationForm,
                            technicalLevel: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Your coding experience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner (No-code preferred)</SelectItem>
                            <SelectItem value="intermediate">Intermediate (Some coding)</SelectItem>
                            <SelectItem value="advanced">Advanced (Full development)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Target Platforms</Label>
                      <div className="flex flex-wrap gap-2">
                        {['web', 'mobile', 'desktop'].map((platform) => (
                          <div key={platform} className="flex items-center space-x-2">
                            <Checkbox
                              id={platform}
                              checked={recommendationForm.platforms.includes(platform)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setRecommendationForm({
                                    ...recommendationForm,
                                    platforms: [...recommendationForm.platforms, platform]
                                  });
                                } else {
                                  setRecommendationForm({
                                    ...recommendationForm,
                                    platforms: recommendationForm.platforms.filter(p => p !== platform)
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={platform} className="capitalize">{platform}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Team Size</Label>
                      <RadioGroup
                        value={recommendationForm.teamSize}
                        onValueChange={(value) => setRecommendationForm({
                          ...recommendationForm,
                          teamSize: value
                        })}
                        className="flex flex-wrap gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="solo" id="solo" />
                          <Label htmlFor="solo">Solo founder</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="small" id="small" />
                          <Label htmlFor="small">Small team (2-5)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="large" id="large" />
                          <Label htmlFor="large">Larger team (5+)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setRecommendationStep(1)}>
                        <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                        Previous
                      </Button>
                      <Button onClick={() => setRecommendationStep(3)}>
                        Next Step
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Timeline & Final */}
                {recommendationStep === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Timeline</Label>
                      <RadioGroup
                        value={recommendationForm.timeline}
                        onValueChange={(value) => setRecommendationForm({
                          ...recommendationForm,
                          timeline: value
                        })}
                        className="grid grid-cols-1 gap-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="asap" id="asap" />
                          <Label htmlFor="asap">ASAP (1-2 weeks)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="month" id="month" />
                          <Label htmlFor="month">Within a month</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="quarter" id="quarter" />
                          <Label htmlFor="quarter">Within 3 months</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="flexible" id="flexible" />
                          <Label htmlFor="flexible">Flexible timeline</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="p-4 bg-primary/10 rounded-lg">
                      <h4 className="font-medium mb-2">Ready for your recommendations!</h4>
                      <p className="text-sm text-muted-foreground">
                        We'll analyze your requirements and suggest the best AI tools for your MVP,
                        ranked by relevance and compatibility.
                      </p>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setRecommendationStep(2)}>
                        <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                        Previous
                      </Button>
                      <Button
                        onClick={handleRecommendationSubmit}
                        size="lg"
                        className="bg-gradient-to-r from-primary to-blue-500"
                      >
                        <Rocket className="h-4 w-4 mr-2" />
                        Get Smart Recommendations
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Smart Recommendations Section */}
      {showRecommendations && smartRecommendations.length > 0 && (
        <div className="space-y-8">
          {/* Top Recommendations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-2xl font-semibold">Smart Recommendations for Your MVP</h3>
              <Badge className="bg-gradient-to-r from-primary to-blue-500 text-white">
                AI-Powered
              </Badge>
            </div>

            {/* High Priority Tools */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Top Picks (High Priority)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {smartRecommendations
                  .filter(rec => rec.priority === 'high')
                  .slice(0, 6)
                  .map((rec) => (
                    <SmartToolCard key={rec.tool.id} recommendation={rec} />
                  ))}
              </div>
            </div>

            {/* Category-based Recommendations */}
            {Object.entries(categoryRecommendations).map(([category, tools]) => {
              const categoryInfo = aiToolsCategories.find(c => c.id === category);
              if (!categoryInfo || tools.length === 0) return null;

              return (
                <div key={category} className="space-y-3">
                  <h4 className="text-lg font-medium flex items-center gap-2">
                    <span className="text-xl">{categoryInfo.icon}</span>
                    {categoryInfo.name}
                    <Badge variant="outline">{tools.length} tools</Badge>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tools.slice(0, 3).map((tool) => {
                      const rec = smartRecommendations.find(r => r.tool.id === tool.id);
                      return rec ? <SmartToolCard key={tool.id} recommendation={rec} /> : null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools by name, category, or use case..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {aiToolsCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.icon} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priceFilter} onValueChange={setPriceFilter}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Price</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="freemium">Freemium</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No tools found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find the perfect tools for your MVP.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIToolRecommender;
