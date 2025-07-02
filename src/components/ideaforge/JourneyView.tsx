
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
  Plus,
  Calendar,
  Clock,
  Brain,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Circle,
  Edit,
  Trash2,
  Filter,
  Search,
  BookOpen,
  Heart,
  Zap,
  Target,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MessageSquare
} from "lucide-react";

// Journey Types
type EntryType = 'insight' | 'pivot' | 'validation' | 'blocked' | 'breakthrough' | 'reflection';
type EmotionType = 'excited' | 'confident' | 'worried' | 'frustrated' | 'motivated' | 'uncertain';

interface JourneyEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  type: EntryType;
  emotion?: EmotionType;
  tags: string[];
  linkedToBlueprint?: string;
  aiGenerated?: boolean;
}

interface ReflectionPrompt {
  id: string;
  question: string;
  category: 'learning' | 'progress' | 'challenges' | 'vision' | 'reflection';
  frequency: 'daily' | 'weekly' | 'monthly';
}

interface JourneyViewProps {
  ideaId: string;
}

const JourneyView: React.FC<JourneyViewProps> = ({ ideaId }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('timeline');
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [filterType, setFilterType] = useState<EntryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Sample journey entries
  const [journeyEntries, setJourneyEntries] = useState<JourneyEntry[]>([
    {
      id: '1',
      date: new Date().toISOString(),
      title: 'Initial Idea Validation',
      content: 'Spoke with 5 potential users today. 4 out of 5 confirmed they struggle with food waste and would use an app to track expiry dates. Key insight: people want recipe suggestions based on what they have.',
      type: 'validation',
      emotion: 'excited',
      tags: ['user-research', 'validation', 'food-waste'],
      aiGenerated: false
    },
    {
      id: '2',
      date: new Date(Date.now() - 86400000).toISOString(),
      title: 'Competitor Analysis Complete',
      content: 'Analyzed 8 competitors in the food management space. Found that most focus on basic tracking but lack AI-powered recipe suggestions. This could be our key differentiator.',
      type: 'insight',
      emotion: 'confident',
      tags: ['competition', 'differentiation', 'ai-features'],
      aiGenerated: false
    },
    {
      id: '3',
      date: new Date(Date.now() - 172800000).toISOString(),
      title: 'Technical Architecture Concerns',
      content: 'Realized that OCR for receipt scanning might be more complex than initially thought. Need to research existing APIs and consider MVP scope.',
      type: 'blocked',
      emotion: 'worried',
      tags: ['technical', 'ocr', 'mvp-scope'],
      aiGenerated: false
    },
    {
      id: '4',
      date: new Date(Date.now() - 259200000).toISOString(),
      title: 'Pivot from Web to Mobile',
      content: 'After user interviews, decided to focus on mobile-first approach. Users want to scan items while shopping and get notifications on their phones.',
      type: 'pivot',
      emotion: 'motivated',
      tags: ['platform-decision', 'mobile-first', 'user-feedback'],
      aiGenerated: false
    }
  ]);

  // Reflection prompts
  const reflectionPrompts: ReflectionPrompt[] = [
    {
      id: '1',
      question: 'What did I learn about my customers this week?',
      category: 'learning',
      frequency: 'weekly'
    },
    {
      id: '2',
      question: 'What assumptions did I validate or invalidate?',
      category: 'learning',
      frequency: 'weekly'
    },
    {
      id: '3',
      question: 'What progress did I make toward my goals?',
      category: 'progress',
      frequency: 'weekly'
    },
    {
      id: '4',
      question: 'What obstacles am I facing and how can I overcome them?',
      category: 'challenges',
      frequency: 'weekly'
    },
    {
      id: '5',
      question: 'How has my vision for the product evolved?',
      category: 'vision',
      frequency: 'monthly'
    },
    {
      id: '6',
      question: 'What would I do differently if I started over today?',
      category: 'reflection',
      frequency: 'monthly'
    }
  ];

  // Helper functions
  const entryTypes = [
    { value: 'insight', label: 'Insight', icon: Lightbulb, color: 'bg-yellow-500' },
    { value: 'pivot', label: 'Pivot', icon: TrendingUp, color: 'bg-blue-500' },
    { value: 'validation', label: 'Validation', icon: CheckCircle, color: 'bg-green-500' },
    { value: 'blocked', label: 'Blocked', icon: AlertTriangle, color: 'bg-red-500' },
    { value: 'breakthrough', label: 'Breakthrough', icon: Zap, color: 'bg-purple-500' },
    { value: 'reflection', label: 'Reflection', icon: BookOpen, color: 'bg-gray-500' }
  ];

  const emotions = [
    { value: 'excited', label: 'Excited', emoji: '🚀' },
    { value: 'confident', label: 'Confident', emoji: '💪' },
    { value: 'worried', label: 'Worried', emoji: '😰' },
    { value: 'frustrated', label: 'Frustrated', emoji: '😤' },
    { value: 'motivated', label: 'Motivated', emoji: '🔥' },
    { value: 'uncertain', label: 'Uncertain', emoji: '🤔' }
  ];

  const getEntryTypeConfig = (type: EntryType) => {
    return entryTypes.find(t => t.value === type) || entryTypes[0];
  };

  const getEmotionConfig = (emotion: EmotionType) => {
    return emotions.find(e => e.value === emotion);
  };

  const filteredEntries = journeyEntries.filter(entry => {
    const matchesType = filterType === 'all' || entry.type === filterType;
    const matchesSearch = searchQuery === '' ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const addJourneyEntry = (entry: Omit<JourneyEntry, 'id'>) => {
    const newEntry: JourneyEntry = {
      ...entry,
      id: Date.now().toString()
    };
    setJourneyEntries([newEntry, ...journeyEntries]);
    setShowNewEntryModal(false);
    toast({
      title: "Entry Added",
      description: "Your journey entry has been saved."
    });
  };

  const generateAIReflection = async (prompt: string) => {
    setIsGeneratingAI(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const aiReflection = `Based on your recent journey entries, here are some insights:

**Key Patterns I Notice:**
• You're making strong progress on user validation - 4/5 users confirmed the problem
• Technical challenges around OCR are a common hurdle - consider starting with manual entry for MVP
• Your pivot to mobile-first shows good responsiveness to user feedback

**Recommendations:**
• Continue user interviews to validate the recipe suggestion feature
• Research existing OCR APIs like Google Vision or AWS Textract for future iterations
• Consider partnering with grocery stores for product database access

**Questions to Explore:**
• How might users discover new recipes they wouldn't normally try?
• What's the minimum viable feature set for launch?
• How can you measure food waste reduction impact?

This reflection shows you're building something users actually want. Keep iterating based on their feedback!`;

      const newEntry: JourneyEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        title: 'AI Weekly Reflection',
        content: aiReflection,
        type: 'reflection',
        emotion: 'motivated',
        tags: ['ai-generated', 'weekly-reflection', 'insights'],
        aiGenerated: true
      };

      setJourneyEntries([newEntry, ...journeyEntries]);
      setShowAIAssist(false);

      toast({
        title: "AI Reflection Generated",
        description: "Your AI-powered reflection has been added to your journey."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI reflection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const askAIQuestion = async (question: string) => {
    setIsGeneratingAI(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      let aiResponse = "";
      if (question.toLowerCase().includes('next steps')) {
        aiResponse = `Based on your journey so far, here are your recommended next steps:

1. **Validate Recipe Feature** - Test recipe suggestions with your 5 validated users
2. **Technical MVP Planning** - Start with manual entry, add OCR later
3. **Competitive Positioning** - Document your AI-powered differentiation
4. **User Flow Design** - Map out the core user experience
5. **Partnership Research** - Explore grocery store API partnerships

Focus on #1 and #4 this week to maintain momentum on user validation.`;
      } else if (question.toLowerCase().includes('risks')) {
        aiResponse = `Key risks I see in your journey:

**Technical Risks:**
• OCR complexity could delay launch
• Recipe API costs might be high
• Mobile app store approval process

**Market Risks:**
• Large competitors entering the space
• User adoption of new habits
• Monetization challenges

**Mitigation Strategies:**
• Start simple, add complexity later
• Build strong user relationships early
• Focus on unique AI-powered value prop`;
      } else {
        aiResponse = `Based on your question "${question}", here are some thoughts:

Your journey shows strong validation signals and good adaptability. The pivot to mobile-first was smart based on user feedback. Consider focusing on your core differentiator (AI recipe suggestions) while keeping the technical scope manageable for MVP.

Would you like me to elaborate on any specific aspect?`;
      }

      const newEntry: JourneyEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        title: `AI Response: ${question}`,
        content: aiResponse,
        type: 'insight',
        emotion: 'motivated',
        tags: ['ai-generated', 'q-and-a'],
        aiGenerated: true
      };

      setJourneyEntries([newEntry, ...journeyEntries]);
      setShowAIAssist(false);

      toast({
        title: "AI Response Added",
        description: "The AI's insights have been added to your journey."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">📍 Founder's Journey</h2>
          <p className="text-muted-foreground">
            Track your thinking evolution, pivots, and key decisions over time
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIAssist(true)}
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Assist
          </Button>
          <Button
            size="sm"
            onClick={() => setShowNewEntryModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="reflections">Reflection Prompts</TabsTrigger>
        </TabsList>

        {/* Timeline View */}
        <TabsContent value="timeline" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search entries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={(value) => setFilterType(value as EntryType | 'all')}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {entryTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <div className="space-y-4">
            {filteredEntries.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No entries found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterType !== 'all'
                      ? 'Try adjusting your filters or search terms'
                      : 'Start documenting your founder journey'
                    }
                  </p>
                  <Button onClick={() => setShowNewEntryModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Entry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredEntries.map((entry, index) => {
                const typeConfig = getEntryTypeConfig(entry.type);
                const emotionConfig = getEmotionConfig(entry.emotion!);

                return (
                  <Card key={entry.id} className="relative">
                    {/* Timeline connector */}
                    {index < filteredEntries.length - 1 && (
                      <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-border -mb-4"></div>
                    )}

                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Timeline dot */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${typeConfig.color} flex items-center justify-center`}>
                          <typeConfig.icon className="h-4 w-4 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{entry.title}</h3>
                              {entry.aiGenerated && (
                                <Badge variant="secondary" className="text-xs">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  AI
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {emotionConfig && (
                                <span className="flex items-center gap-1">
                                  {emotionConfig.emoji} {emotionConfig.label}
                                </span>
                              )}
                              <span>{new Date(entry.date).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className={`${typeConfig.color} text-white border-0`}>
                              {typeConfig.label}
                            </Badge>
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="prose dark:prose-invert max-w-none mb-4">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {entry.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
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

        {/* Reflection Prompts */}
        <TabsContent value="reflections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Reflection Prompts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Regular reflection helps you learn from your journey and make better decisions.
                Choose a prompt below to guide your thinking.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reflectionPrompts.map((prompt) => (
                  <Card key={prompt.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="outline" className="text-xs">
                          {prompt.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {prompt.frequency}
                        </Badge>
                      </div>
                      <p className="font-medium mb-3">{prompt.question}</p>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          // Pre-fill new entry modal with this prompt
                          setShowNewEntryModal(true);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-2" />
                        Reflect on This
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Entry Modal */}
      <Dialog open={showNewEntryModal} onOpenChange={setShowNewEntryModal}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              New Journey Entry
            </DialogTitle>
          </DialogHeader>
          <NewEntryForm onSubmit={addJourneyEntry} onCancel={() => setShowNewEntryModal(false)} />
        </DialogContent>
      </Dialog>

      {/* AI Assistant Modal */}
      <Dialog open={showAIAssist} onOpenChange={setShowAIAssist}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Journey Assistant
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Let me help you reflect on your journey and provide insights based on your entries.
            </p>

            <Tabs defaultValue="reflection" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="reflection">Weekly Reflection</TabsTrigger>
                <TabsTrigger value="questions">Ask Questions</TabsTrigger>
              </TabsList>

              <TabsContent value="reflection" className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">AI Weekly Reflection</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    I'll analyze your recent entries and provide insights about patterns, progress, and recommendations.
                  </p>
                  <Button
                    onClick={() => generateAIReflection("weekly reflection")}
                    disabled={isGeneratingAI}
                    className="w-full"
                  >
                    {isGeneratingAI ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Reflection...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate AI Reflection
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="questions" className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left justify-start"
                    onClick={() => askAIQuestion("What should my next steps be?")}
                    disabled={isGeneratingAI}
                  >
                    <Target className="h-4 w-4 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium">What should my next steps be?</div>
                      <div className="text-xs text-muted-foreground">Get AI recommendations based on your progress</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left justify-start"
                    onClick={() => askAIQuestion("What risks should I be aware of?")}
                    disabled={isGeneratingAI}
                  >
                    <AlertTriangle className="h-4 w-4 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium">What risks should I be aware of?</div>
                      <div className="text-xs text-muted-foreground">Identify potential challenges and mitigation strategies</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left justify-start"
                    onClick={() => askAIQuestion("How is my thinking evolving?")}
                    disabled={isGeneratingAI}
                  >
                    <TrendingUp className="h-4 w-4 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium">How is my thinking evolving?</div>
                      <div className="text-xs text-muted-foreground">Analyze patterns in your decision-making</div>
                    </div>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// New Entry Form Component
const NewEntryForm: React.FC<{
  onSubmit: (entry: Omit<JourneyEntry, 'id'>) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<EntryType>('insight');
  const [emotion, setEmotion] = useState<EmotionType>('motivated');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const entryTypes = [
    { value: 'insight', label: 'Insight', icon: Lightbulb },
    { value: 'pivot', label: 'Pivot', icon: TrendingUp },
    { value: 'validation', label: 'Validation', icon: CheckCircle },
    { value: 'blocked', label: 'Blocked', icon: AlertTriangle },
    { value: 'breakthrough', label: 'Breakthrough', icon: Zap },
    { value: 'reflection', label: 'Reflection', icon: BookOpen }
  ];

  const emotions = [
    { value: 'excited', label: 'Excited', emoji: '🚀' },
    { value: 'confident', label: 'Confident', emoji: '💪' },
    { value: 'worried', label: 'Worried', emoji: '😰' },
    { value: 'frustrated', label: 'Frustrated', emoji: '😤' },
    { value: 'motivated', label: 'Motivated', emoji: '🔥' },
    { value: 'uncertain', label: 'Uncertain', emoji: '🤔' }
  ];

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    onSubmit({
      date: new Date().toISOString(),
      title: title.trim(),
      content: content.trim(),
      type,
      emotion,
      tags,
      aiGenerated: false
    });

    // Reset form
    setTitle('');
    setContent('');
    setType('insight');
    setEmotion('motivated');
    setTags([]);
    setNewTag('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Entry Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What happened today?"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Entry Type</label>
          <Select value={type} onValueChange={(value) => setType(value as EntryType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {entryTypes.map((entryType) => (
                <SelectItem key={entryType.value} value={entryType.value}>
                  <div className="flex items-center gap-2">
                    <entryType.icon className="h-4 w-4" />
                    {entryType.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">How are you feeling?</label>
        <Select value={emotion} onValueChange={(value) => setEmotion(value as EmotionType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {emotions.map((emotionOption) => (
              <SelectItem key={emotionOption.value} value={emotionOption.value}>
                <div className="flex items-center gap-2">
                  <span>{emotionOption.emoji}</span>
                  {emotionOption.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Content</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe what happened, what you learned, or what you're thinking about..."
          rows={6}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Tags</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button onClick={() => removeTag(tag)}>
                <Trash2 className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag..."
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
          />
          <Button size="sm" onClick={addTag}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim()}
        >
          Save Entry
        </Button>
      </div>
    </div>
  );
};

export default JourneyView;
