
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Pencil,
  Save,
  X,
  Plus,
  Brain,
  History,
  Tag,
  Lightbulb,
  Users,
  Target,
  TrendingUp,
  Eye,
  Sparkles,
  FileText,
  Clock,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from "lucide-react";

interface WikiSection {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
  isExpanded: boolean;
}

interface WikiVersion {
  id: string;
  timestamp: string;
  changes: string;
  author: string;
}

interface WikiViewProps {
  idea: {
    id: string;
    title: string;
    description: string;
    tags?: string[];
  };
}

const WikiView: React.FC<WikiViewProps> = ({ idea }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [wikiTags, setWikiTags] = useState<string[]>(idea.tags || []);
  const [newTag, setNewTag] = useState("");

  // Wiki sections with structured content
  const [sections, setSections] = useState<WikiSection[]>([
    {
      id: "overview",
      title: "📋 Overview",
      content: `# ${idea.title}\n\n${idea.description}\n\n## Problem Statement\n\n*What specific problem does this idea solve?*\n\n## Solution Overview\n\n*How does your idea address this problem?*\n\n## Unique Value Proposition\n\n*What makes this solution unique and valuable?*`,
      lastUpdated: new Date().toISOString(),
      isExpanded: true
    },
    {
      id: "market",
      title: "🎯 Market Research",
      content: "## Target Market\n\n*Who are your primary customers?*\n\n## Market Size\n\n*What's the total addressable market (TAM)?*\n\n## Market Trends\n\n*What trends support your idea?*\n\n## Customer Segments\n\n*Break down your customer base into segments*",
      lastUpdated: new Date().toISOString(),
      isExpanded: false
    },
    {
      id: "competitors",
      title: "🏢 Competitive Analysis",
      content: "## Direct Competitors\n\n*Who are your main competitors?*\n\n## Indirect Competitors\n\n*What alternative solutions exist?*\n\n## Competitive Advantages\n\n*How will you differentiate?*\n\n## SWOT Analysis\n\n### Strengths\n- \n\n### Weaknesses\n- \n\n### Opportunities\n- \n\n### Threats\n- ",
      lastUpdated: new Date().toISOString(),
      isExpanded: false
    },
    {
      id: "customer-pain",
      title: "😣 Customer Pain Points",
      content: "## Primary Pain Points\n\n*What are the main problems customers face?*\n\n## Pain Point Severity\n\n*How severe are these problems?*\n\n## Current Solutions\n\n*How do customers currently solve these problems?*\n\n## Pain Point Validation\n\n*How have you validated these pain points?*",
      lastUpdated: new Date().toISOString(),
      isExpanded: false
    },
    {
      id: "vision",
      title: "🚀 Vision & Strategy",
      content: "## Long-term Vision\n\n*Where do you see this idea in 5 years?*\n\n## Mission Statement\n\n*What's your core mission?*\n\n## Strategic Goals\n\n### Year 1\n- \n\n### Year 2\n- \n\n### Year 3\n- \n\n## Success Metrics\n\n*How will you measure success?*",
      lastUpdated: new Date().toISOString(),
      isExpanded: false
    }
  ]);

  // Sample version history
  const [versionHistory] = useState<WikiVersion[]>([
    {
      id: "v1",
      timestamp: new Date().toISOString(),
      changes: "Initial wiki structure created",
      author: "You"
    },
    {
      id: "v2",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      changes: "Added market research section",
      author: "You"
    },
    {
      id: "v3",
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      changes: "Updated competitive analysis",
      author: "You"
    }
  ]);

  const updateSection = (sectionId: string, newContent: string) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? { ...section, content: newContent, lastUpdated: new Date().toISOString() }
        : section
    ));
    setActiveSection(null);
    setIsEditing(false);
    toast({
      title: "Section Updated",
      description: "Your changes have been saved successfully."
    });
  };

  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? { ...section, isExpanded: !section.isExpanded }
        : section
    ));
  };

  const generateAIInsight = async () => {
    if (!aiPrompt.trim()) return;

    setIsGeneratingAI(true);
    try {
      // Simulate AI response (replace with actual AI call)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const aiResponse = `Based on your prompt "${aiPrompt}", here are some insights:\n\n• Consider researching similar solutions in adjacent markets\n• Look into regulatory requirements for your industry\n• Validate assumptions with potential customers\n• Analyze pricing strategies of competitors\n\nWould you like me to help you expand on any of these points?`;

      // Add AI insight to the current section or create a new one
      if (activeSection) {
        const currentSection = sections.find(s => s.id === activeSection);
        if (currentSection) {
          const updatedContent = currentSection.content + `\n\n## AI Insight\n\n${aiResponse}`;
          updateSection(activeSection, updatedContent);
        }
      }

      setAiPrompt("");
      setShowAIAssist(false);

      toast({
        title: "AI Insight Generated",
        description: "AI suggestions have been added to your wiki."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI insight. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !wikiTags.includes(newTag.trim())) {
      setWikiTags([...wikiTags, newTag.trim()]);
      setNewTag("");
      toast({
        title: "Tag Added",
        description: `"${newTag.trim()}" has been added to your wiki.`
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setWikiTags(wikiTags.filter(tag => tag !== tagToRemove));
  };

  const autoFillWithAI = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    setIsGeneratingAI(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      let aiContent = "";
      switch (sectionId) {
        case "market":
          aiContent = `## Target Market\n\nPrimary customers: Busy professionals and families aged 25-45 who value convenience and sustainability.\n\n## Market Size\n\nTotal Addressable Market (TAM): $50B+ grocery and food management market\nServiceable Addressable Market (SAM): $5B smart home and food tech segment\n\n## Market Trends\n\n• Growing awareness of food waste (30% of food is wasted globally)\n• Increased adoption of smart home technologies\n• Rising interest in sustainable living practices\n• Post-pandemic focus on home cooking and meal planning\n\n## Customer Segments\n\n1. **Eco-conscious families**: Motivated by sustainability\n2. **Busy professionals**: Need convenience and time-saving\n3. **Health-conscious individuals**: Want fresh, healthy food\n4. **Tech enthusiasts**: Early adopters of smart home solutions`;
          break;
        case "competitors":
          aiContent = `## Direct Competitors\n\n• **Fridgely**: Basic expiry tracking, limited AI features\n• **NoWaste**: Food waste tracking, no recipe suggestions\n• **FoodKeeper**: USDA app, basic storage tips\n\n## Indirect Competitors\n\n• Meal planning apps (Mealime, PlateJoy)\n• Recipe apps (Yummly, Allrecipes)\n• Smart fridges with built-in tracking\n• Traditional pen-and-paper lists\n\n## Competitive Advantages\n\n• AI-powered recipe suggestions based on available ingredients\n• OCR receipt scanning for automatic inventory\n• Predictive expiry notifications\n• Integration with grocery delivery services\n• Sustainability impact tracking\n\n## SWOT Analysis\n\n### Strengths\n• Unique AI-driven approach\n• Comprehensive feature set\n• Strong sustainability angle\n\n### Weaknesses\n• New brand with no market presence\n• Requires user behavior change\n• Dependent on accurate data input\n\n### Opportunities\n• Growing smart home market\n• Increasing environmental awareness\n• Partnership opportunities with grocery stores\n\n### Threats\n• Large tech companies entering the space\n• Privacy concerns with food data\n• Economic downturns affecting discretionary spending`;
          break;
        default:
          aiContent = `AI-generated content for ${section.title} section would appear here based on your idea: "${idea.title}".`;
      }

      updateSection(sectionId, section.content + `\n\n${aiContent}`);

      toast({
        title: "AI Content Generated",
        description: `${section.title} section has been enhanced with AI insights.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI content. Please try again.",
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
          <h2 className="text-2xl font-bold mb-2">📚 Knowledge Base</h2>
          <p className="text-muted-foreground">
            Document everything you learn about your startup idea
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowVersionHistory(true)}
          >
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIAssist(true)}
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Assist
          </Button>
        </div>
      </div>

      {/* Tags Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {wikiTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              className="flex-1"
            />
            <Button size="sm" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wiki Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center gap-2 text-left hover:text-primary transition-colors"
                >
                  {section.isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Updated {new Date(section.lastUpdated).toLocaleDateString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => autoFillWithAI(section.id)}
                    disabled={isGeneratingAI}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActiveSection(section.id);
                      setIsEditing(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {section.isExpanded && (
              <CardContent>
                {activeSection === section.id && isEditing ? (
                  <div className="space-y-4">
                    <Textarea
                      value={section.content}
                      onChange={(e) => {
                        setSections(prev => prev.map(s =>
                          s.id === section.id
                            ? { ...s, content: e.target.value }
                            : s
                        ));
                      }}
                      rows={15}
                      className="font-mono text-sm"
                      placeholder="Write your content in Markdown format..."
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setActiveSection(null);
                          setIsEditing(false);
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={() => updateSection(section.id, section.content)}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    {section.content.split('\n').map((line, index) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={index} className="text-2xl font-bold mb-4 mt-6">{line.substring(2)}</h1>;
                      } else if (line.startsWith('## ')) {
                        return <h2 key={index} className="text-xl font-bold mb-3 mt-5">{line.substring(3)}</h2>;
                      } else if (line.startsWith('### ')) {
                        return <h3 key={index} className="text-lg font-semibold mb-2 mt-4">{line.substring(4)}</h3>;
                      } else if (line.startsWith('• ') || line.startsWith('- ')) {
                        return <li key={index} className="ml-4 mb-1">{line.substring(2)}</li>;
                      } else if (line.startsWith('*') && line.endsWith('*') && line.length > 2) {
                        return <p key={index} className="italic text-muted-foreground mb-2">{line.slice(1, -1)}</p>;
                      } else if (line === '') {
                        return <div key={index} className="h-2"></div>;
                      } else {
                        return <p key={index} className="mb-2">{line}</p>;
                      }
                    })}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* AI Assistant Modal */}
      <Dialog open={showAIAssist} onOpenChange={setShowAIAssist}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Wiki Assistant
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Ask me anything about your idea and I'll help you research and document it.
            </p>

            <Tabs defaultValue="insights" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="insights">Get Insights</TabsTrigger>
                <TabsTrigger value="research">Research Help</TabsTrigger>
                <TabsTrigger value="structure">Structure Guide</TabsTrigger>
              </TabsList>

              <TabsContent value="insights" className="space-y-4">
                <Textarea
                  placeholder="What would you like to know about your idea? e.g., 'Help me understand the competitive landscape' or 'What are potential customer pain points?'"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                />
                <Button
                  onClick={generateAIInsight}
                  disabled={isGeneratingAI || !aiPrompt.trim()}
                  className="w-full"
                >
                  {isGeneratingAI ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Insights...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Generate AI Insights
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="research" className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <Users className="h-5 w-5 mb-2" />
                    <span className="font-medium">Find Competitors</span>
                    <span className="text-xs text-muted-foreground">Research similar solutions</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <Target className="h-5 w-5 mb-2" />
                    <span className="font-medium">Identify Market</span>
                    <span className="text-xs text-muted-foreground">Define target audience</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <TrendingUp className="h-5 w-5 mb-2" />
                    <span className="font-medium">Market Trends</span>
                    <span className="text-xs text-muted-foreground">Analyze industry trends</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <Eye className="h-5 w-5 mb-2" />
                    <span className="font-medium">Validate Idea</span>
                    <span className="text-xs text-muted-foreground">Get validation tips</span>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="structure" className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-1">📋 Overview</h4>
                    <p className="text-sm text-muted-foreground">Start with problem, solution, and value proposition</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-1">🎯 Market Research</h4>
                    <p className="text-sm text-muted-foreground">Define target market, size, and trends</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-1">🏢 Competitive Analysis</h4>
                    <p className="text-sm text-muted-foreground">Identify competitors and differentiation</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-1">😣 Customer Pain Points</h4>
                    <p className="text-sm text-muted-foreground">Document problems and current solutions</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-1">🚀 Vision & Strategy</h4>
                    <p className="text-sm text-muted-foreground">Long-term vision and strategic goals</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version History Modal */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {versionHistory.map((version) => (
              <div key={version.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{version.changes}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(version.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">by {version.author}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WikiView;
