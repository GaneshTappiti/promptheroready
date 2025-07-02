
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Plus,
  Brain,
  Users,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Link,
  Archive,
  Star,
  TrendingUp,
  Target,
  Lightbulb,
  Mail,
  Phone,
  User,
  Calendar,
  Tag,
  BarChart3,
  PieChart,
  Sparkles,
  ExternalLink,
  Copy,
  Share2
} from "lucide-react";
import NewFeedbackForm from "./NewFeedbackForm";

// Feedback Types
type FeedbackSource = 'user-interview' | 'mentor' | 'ai' | 'survey' | 'discord' | 'email' | 'form';
type FeedbackType = 'positive' | 'negative' | 'feature-request' | 'confusion' | 'validation' | 'concern';
type FeedbackStatus = 'new' | 'reviewed' | 'actioned' | 'archived' | 'rejected';

interface FeedbackItem {
  id: string;
  source: FeedbackSource;
  type: FeedbackType;
  status: FeedbackStatus;
  title: string;
  content: string;
  author: string;
  authorEmail?: string;
  date: string;
  tags: string[];
  linkedFeature?: string;
  priority: 'high' | 'medium' | 'low';
  sentiment: number; // -1 to 1
  aiGenerated?: boolean;
}

interface FeedbackCluster {
  id: string;
  theme: string;
  description: string;
  feedbackIds: string[];
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

interface ValidationInsight {
  id: string;
  category: 'market-fit' | 'feature-validation' | 'pricing' | 'user-experience';
  insight: string;
  confidence: number; // 0-100
  supportingFeedback: string[];
  recommendation: string;
}

interface FeedbackViewProps {
  ideaId: string;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({ ideaId }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('inbox');
  const [showNewFeedbackModal, setShowNewFeedbackModal] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [filterSource, setFilterSource] = useState<FeedbackSource | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Sample feedback data
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([
    {
      id: '1',
      source: 'user-interview',
      type: 'validation',
      status: 'new',
      title: 'Love the recipe suggestion feature!',
      content: 'I interviewed Sarah, a busy mom of 3. She said the AI recipe suggestions based on expiring ingredients would save her 2-3 hours per week of meal planning. She\'s willing to pay $9.99/month for this feature alone.',
      author: 'Sarah M.',
      authorEmail: 'sarah.m@email.com',
      date: new Date().toISOString(),
      tags: ['recipe-feature', 'pricing', 'time-saving'],
      linkedFeature: 'recipe-suggestions',
      priority: 'high',
      sentiment: 0.9,
      aiGenerated: false
    },
    {
      id: '2',
      source: 'mentor',
      type: 'concern',
      status: 'reviewed',
      title: 'OCR complexity might delay launch',
      content: 'During our mentorship session, John raised concerns about the receipt scanning feature. He suggests starting with manual entry for MVP and adding OCR later. Focus on core value prop first.',
      author: 'John D. (Mentor)',
      date: new Date(Date.now() - 86400000).toISOString(),
      tags: ['technical-risk', 'mvp-scope', 'mentor-advice'],
      linkedFeature: 'receipt-scanning',
      priority: 'high',
      sentiment: -0.3,
      aiGenerated: false
    },
    {
      id: '3',
      source: 'ai',
      type: 'feature-request',
      status: 'new',
      title: 'Consider social sharing features',
      content: 'Based on market analysis, 73% of food apps with social features have higher retention rates. Consider adding recipe sharing, cooking achievements, or family meal planning collaboration.',
      author: 'AI Analysis',
      date: new Date(Date.now() - 172800000).toISOString(),
      tags: ['social-features', 'retention', 'market-research'],
      priority: 'medium',
      sentiment: 0.6,
      aiGenerated: true
    },
    {
      id: '4',
      source: 'survey',
      type: 'positive',
      status: 'actioned',
      title: 'Mobile-first approach is perfect',
      content: 'Survey results from 50 potential users: 89% prefer mobile app over web for grocery management. 67% would use it while shopping. This validates our mobile-first decision.',
      author: 'Survey Results',
      date: new Date(Date.now() - 259200000).toISOString(),
      tags: ['mobile-first', 'user-preference', 'validation'],
      linkedFeature: 'mobile-app',
      priority: 'high',
      sentiment: 0.8,
      aiGenerated: false
    },
    {
      id: '5',
      source: 'discord',
      type: 'confusion',
      status: 'new',
      title: 'Unclear value proposition',
      content: 'User in #startup-feedback channel said: "I don\'t understand how this is different from existing apps like Yuka or HowGood. What makes your AI special?" Need clearer differentiation.',
      author: 'Discord User @foodie_dev',
      date: new Date(Date.now() - 345600000).toISOString(),
      tags: ['value-prop', 'differentiation', 'messaging'],
      priority: 'medium',
      sentiment: -0.2,
      aiGenerated: false
    }
  ]);

  // AI-generated clusters
  const [feedbackClusters, setFeedbackClusters] = useState<FeedbackCluster[]>([
    {
      id: 'cluster-1',
      theme: 'Recipe Feature Validation',
      description: 'Strong positive feedback on AI-powered recipe suggestions',
      feedbackIds: ['1', '4'],
      priority: 'high',
      actionable: true
    },
    {
      id: 'cluster-2',
      theme: 'Technical Complexity Concerns',
      description: 'Multiple sources suggest simplifying MVP scope',
      feedbackIds: ['2'],
      priority: 'high',
      actionable: true
    },
    {
      id: 'cluster-3',
      theme: 'Messaging & Differentiation',
      description: 'Users need clearer understanding of unique value',
      feedbackIds: ['5'],
      priority: 'medium',
      actionable: true
    }
  ]);

  // Validation insights
  const [validationInsights, setValidationInsights] = useState<ValidationInsight[]>([
    {
      id: 'insight-1',
      category: 'market-fit',
      insight: 'Strong product-market fit signals for recipe suggestion feature',
      confidence: 85,
      supportingFeedback: ['1', '4'],
      recommendation: 'Prioritize recipe AI as core differentiator for MVP launch'
    },
    {
      id: 'insight-2',
      category: 'feature-validation',
      insight: 'Mobile-first approach validated by user preferences',
      confidence: 89,
      supportingFeedback: ['4'],
      recommendation: 'Continue mobile-first development, consider web version later'
    },
    {
      id: 'insight-3',
      category: 'user-experience',
      insight: 'OCR complexity may hurt user experience in MVP',
      confidence: 75,
      supportingFeedback: ['2'],
      recommendation: 'Start with manual entry, add OCR in v2 after core validation'
    }
  ]);

  // Helper functions
  const feedbackSources = [
    { value: 'user-interview', label: 'User Interview', icon: Users },
    { value: 'mentor', label: 'Mentor', icon: Star },
    { value: 'ai', label: 'AI Analysis', icon: Brain },
    { value: 'survey', label: 'Survey', icon: BarChart3 },
    { value: 'discord', label: 'Discord', icon: MessageSquare },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'form', label: 'Form', icon: Target }
  ];

  const feedbackTypes = [
    { value: 'positive', label: 'Positive', color: 'bg-green-500' },
    { value: 'negative', label: 'Negative', color: 'bg-red-500' },
    { value: 'feature-request', label: 'Feature Request', color: 'bg-blue-500' },
    { value: 'confusion', label: 'Confusion', color: 'bg-orange-500' },
    { value: 'validation', label: 'Validation', color: 'bg-purple-500' },
    { value: 'concern', label: 'Concern', color: 'bg-yellow-500' }
  ];

  const getSourceConfig = (source: FeedbackSource) => {
    return feedbackSources.find(s => s.value === source) || feedbackSources[0];
  };

  const getTypeConfig = (type: FeedbackType) => {
    return feedbackTypes.find(t => t.value === type) || feedbackTypes[0];
  };

  const getSentimentEmoji = (sentiment: number) => {
    if (sentiment > 0.5) return '😍';
    if (sentiment > 0) return '😊';
    if (sentiment > -0.5) return '😐';
    return '😞';
  };

  const filteredFeedback = feedbackItems.filter(item => {
    const matchesSource = filterSource === 'all' || item.source === filterSource;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSource && matchesStatus && matchesSearch;
  });

  const generateAIAnalysis = async () => {
    setIsGeneratingAI(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate new clusters
      const newCluster: FeedbackCluster = {
        id: `cluster-${Date.now()}`,
        theme: 'Pricing Sensitivity Analysis',
        description: 'Users show willingness to pay for time-saving features',
        feedbackIds: ['1'],
        priority: 'high',
        actionable: true
      };

      // Generate new insight
      const newInsight: ValidationInsight = {
        id: `insight-${Date.now()}`,
        category: 'pricing',
        insight: 'Users value time-saving over cost - premium pricing viable',
        confidence: 78,
        supportingFeedback: ['1'],
        recommendation: 'Test $9.99/month pricing with recipe feature as premium tier'
      };

      setFeedbackClusters([...feedbackClusters, newCluster]);
      setValidationInsights([...validationInsights, newInsight]);

      toast({
        title: "AI Analysis Complete",
        description: "New insights and clusters have been generated from your feedback."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const addFeedback = (feedback: Omit<FeedbackItem, 'id'>) => {
    const newFeedback: FeedbackItem = {
      ...feedback,
      id: Date.now().toString()
    };
    setFeedbackItems([newFeedback, ...feedbackItems]);
    setShowNewFeedbackModal(false);
    toast({
      title: "Feedback Added",
      description: "Your feedback has been added to the inbox."
    });
  };

  const updateFeedbackStatus = (feedbackId: string, status: FeedbackStatus) => {
    setFeedbackItems(items =>
      items.map(item =>
        item.id === feedbackId ? { ...item, status } : item
      )
    );
    toast({
      title: "Status Updated",
      description: `Feedback marked as ${status}.`
    });
  };

  const linkToBlueprint = (feedbackId: string, featureId: string) => {
    setFeedbackItems(items =>
      items.map(item =>
        item.id === feedbackId ? { ...item, linkedFeature: featureId } : item
      )
    );
    toast({
      title: "Linked to Blueprint",
      description: "Feedback has been linked to blueprint feature."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">💬 Feedback & Validation</h2>
          <p className="text-muted-foreground">
            Collect, analyze, and act on feedback to validate your startup idea
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIAnalysis(true)}
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Analysis
          </Button>
          <Button
            size="sm"
            onClick={() => setShowNewFeedbackModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Feedback
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inbox">Feedback Inbox</TabsTrigger>
          <TabsTrigger value="clusters">AI Clusters</TabsTrigger>
          <TabsTrigger value="insights">Validation Insights</TabsTrigger>
        </TabsList>

        {/* Feedback Inbox */}
        <TabsContent value="inbox" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search feedback..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={filterSource} onValueChange={(value) => setFilterSource(value as FeedbackSource | 'all')}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {feedbackSources.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as FeedbackStatus | 'all')}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="actioned">Actioned</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Feedback List */}
          <div className="space-y-4">
            {filteredFeedback.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No feedback found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterSource !== 'all' || filterStatus !== 'all'
                      ? 'Try adjusting your filters or search terms'
                      : 'Start collecting feedback to validate your idea'
                    }
                  </p>
                  <Button onClick={() => setShowNewFeedbackModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Feedback
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredFeedback.map((feedback) => {
                const sourceConfig = getSourceConfig(feedback.source);
                const typeConfig = getTypeConfig(feedback.type);

                return (
                  <Card key={feedback.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Source Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <sourceConfig.icon className="h-5 w-5 text-primary" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{feedback.title}</h3>
                              {feedback.aiGenerated && (
                                <Badge variant="secondary" className="text-xs">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  AI
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{getSentimentEmoji(feedback.sentiment)}</span>
                              <span>{new Date(feedback.date).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className={`${typeConfig.color} text-white border-0`}>
                              {typeConfig.label}
                            </Badge>
                            <Badge variant="outline">
                              {sourceConfig.label}
                            </Badge>
                            <Badge
                              variant={feedback.status === 'new' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {feedback.status}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                feedback.priority === 'high' ? 'border-red-500 text-red-500' :
                                feedback.priority === 'medium' ? 'border-yellow-500 text-yellow-500' :
                                'border-green-500 text-green-500'
                              }
                            >
                              {feedback.priority} priority
                            </Badge>
                          </div>

                          <div className="prose dark:prose-invert max-w-none mb-4">
                            <p className="text-sm leading-relaxed">{feedback.content}</p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {feedback.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              {feedback.linkedFeature && (
                                <Badge variant="outline" className="text-xs">
                                  <Link className="h-3 w-3 mr-1" />
                                  Linked to Blueprint
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-4 pt-4 border-t">
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">{feedback.author}</span>
                              {feedback.authorEmail && (
                                <span className="ml-2">• {feedback.authorEmail}</span>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Select
                                value={feedback.status}
                                onValueChange={(value) => updateFeedbackStatus(feedback.id, value as FeedbackStatus)}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="reviewed">Reviewed</SelectItem>
                                  <SelectItem value="actioned">Actioned</SelectItem>
                                  <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                              </Select>

                              <Button size="sm" variant="outline">
                                <Link className="h-3 w-3 mr-1" />
                                Link to Blueprint
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* AI Clusters */}
        <TabsContent value="clusters" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI-Generated Feedback Clusters
                </CardTitle>
                <Button
                  size="sm"
                  onClick={generateAIAnalysis}
                  disabled={isGeneratingAI}
                >
                  {isGeneratingAI ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Re-analyze
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                AI automatically groups similar feedback to identify patterns and themes.
              </p>

              <div className="space-y-4">
                {feedbackClusters.map((cluster) => (
                  <Card key={cluster.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{cluster.theme}</h3>
                          <p className="text-sm text-muted-foreground">{cluster.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant="outline"
                            className={
                              cluster.priority === 'high' ? 'border-red-500 text-red-500' :
                              cluster.priority === 'medium' ? 'border-yellow-500 text-yellow-500' :
                              'border-green-500 text-green-500'
                            }
                          >
                            {cluster.priority} priority
                          </Badge>
                          {cluster.actionable && (
                            <Badge variant="default">
                              <Target className="h-3 w-3 mr-1" />
                              Actionable
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {cluster.feedbackIds.length} feedback item(s) in this cluster
                        </div>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Related Feedback
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Insights */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Validation Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                AI-powered insights about your product-market fit and validation progress.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {validationInsights.map((insight) => (
                  <Card key={insight.id} className="h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="capitalize">
                          {insight.category.replace('-', ' ')}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className="font-medium">{insight.confidence}%</span>
                        </div>
                      </div>

                      <h3 className="font-semibold mb-2">{insight.insight}</h3>

                      <div className="mb-4">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${insight.confidence}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-muted/50 p-3 rounded-lg mb-4">
                        <h4 className="font-medium text-sm mb-1">Recommendation:</h4>
                        <p className="text-sm">{insight.recommendation}</p>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Based on {insight.supportingFeedback.length} feedback item(s)
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Summary Stats */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Validation Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {feedbackItems.filter(f => f.type === 'validation').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Validations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {feedbackItems.filter(f => f.type === 'positive').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Positive</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {feedbackItems.filter(f => f.type === 'concern').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Concerns</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(feedbackItems.reduce((acc, f) => acc + f.sentiment, 0) / feedbackItems.length * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Sentiment</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Feedback Modal */}
      <Dialog open={showNewFeedbackModal} onOpenChange={setShowNewFeedbackModal}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Feedback
            </DialogTitle>
          </DialogHeader>
          <NewFeedbackForm onSubmit={addFeedback} onCancel={() => setShowNewFeedbackModal(false)} />
        </DialogContent>
      </Dialog>

      {/* AI Analysis Modal */}
      <Dialog open={showAIAnalysis} onOpenChange={setShowAIAnalysis}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Feedback Analysis
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Let me analyze your feedback to identify patterns, clusters, and validation insights.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Cluster Analysis</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Group similar feedback to identify common themes and patterns.
                </p>
                <Button
                  onClick={generateAIAnalysis}
                  disabled={isGeneratingAI}
                  className="w-full"
                >
                  {isGeneratingAI ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Clusters
                    </>
                  )}
                </Button>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-2">Validation Insights</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Extract actionable insights about product-market fit and user needs.
                </p>
                <Button
                  onClick={generateAIAnalysis}
                  disabled={isGeneratingAI}
                  variant="outline"
                  className="w-full"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Generate Insights
                </Button>
              </Card>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Current Analysis Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Feedback Items:</span>
                  <span className="font-medium">{feedbackItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Clusters:</span>
                  <span className="font-medium">{feedbackClusters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Validation Insights:</span>
                  <span className="font-medium">{validationInsights.length}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbackView;
