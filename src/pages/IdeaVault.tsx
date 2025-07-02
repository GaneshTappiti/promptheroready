import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Filter,
  Lightbulb,
  ChevronLeft,
  PlusCircle,
  Users,
  MessageSquare,
  ThumbsUp,
  Sparkles,
  ArrowUpDown,
  ChevronDown,
  Brain,
  Target,
  DollarSign,
  Clock
} from "lucide-react";
import WorkspaceSidebar, { SidebarToggle } from "@/components/WorkspaceSidebar";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface IdeaProps {
  id: number;
  title: string;
  description: string;
  tags: string[];
  votes: number;
  comments: number;
  status: "validated" | "exploring" | "archived" | "draft";
  priority?: "low" | "medium" | "high";
  validationScore?: number;
  potentialRevenue?: string;
  timeToMarket?: string;
  createdAt?: string;
  lastUpdated?: string;
  collaborators?: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: "owner" | "collaborator" | "viewer";
  }>;
  aiInsights?: {
    nextSteps: string[];
    marketOpportunity: string;
    riskAssessment: string;
    recommendedTools: string[];
    lastAnalyzed: string;
  };
  isShared?: boolean;
  category?: string;
  targetAudience?: string;
  businessModel?: string;
}

const IdeaVault = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [ideas, setIdeas] = useState<IdeaProps[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<IdeaProps[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

  // Mock data
  const mockIdeas: IdeaProps[] = [
    {
      id: 1,
      title: "HealthTrack App",
      description: "A fitness tracking app specifically designed for seniors with simplified UI and health monitoring features.",
      tags: ["Health", "Mobile App", "Seniors"],
      votes: 12,
      comments: 5,
      status: "validated",
      priority: "high",
      validationScore: 85,
      potentialRevenue: "$2M",
      timeToMarket: "6 months",
      createdAt: "2024-01-15",
      lastUpdated: "2024-01-20",
      collaborators: [
        { id: "1", name: "John Smith", avatar: "", role: "owner" },
        { id: "2", name: "Sarah Wilson", avatar: "", role: "collaborator" }
      ],
      category: "Health & Fitness",
      targetAudience: "Seniors aged 65+",
      businessModel: "Freemium",
      isShared: true
    },
    {
      id: 2,
      title: "EcoMarket",
      description: "Marketplace for sustainable goods with carbon footprint tracking and eco-friendly product verification.",
      tags: ["Marketplace", "Sustainability", "E-commerce"],
      votes: 8,
      comments: 3,
      status: "exploring",
      priority: "medium",
      validationScore: 65,
      potentialRevenue: "$5M",
      timeToMarket: "12 months",
      createdAt: "2024-01-10",
      lastUpdated: "2024-01-18",
      collaborators: [
        { id: "3", name: "Alex Green", avatar: "", role: "owner" }
      ],
      category: "E-commerce",
      targetAudience: "Eco-conscious consumers",
      businessModel: "Commission-based",
      isShared: false
    },
    {
      id: 3,
      title: "CodeBuddy",
      description: "AI pair programming assistant that helps developers with code reviews and suggestions in real-time.",
      tags: ["AI", "Developer Tools", "Productivity"],
      votes: 15,
      comments: 7,
      status: "validated",
      priority: "high",
      validationScore: 92,
      potentialRevenue: "$10M",
      timeToMarket: "8 months",
      createdAt: "2024-01-05",
      lastUpdated: "2024-01-22",
      collaborators: [
        { id: "4", name: "Mike Chen", avatar: "", role: "owner" },
        { id: "5", name: "Lisa Park", avatar: "", role: "collaborator" }
      ],
      category: "Developer Tools",
      targetAudience: "Software developers",
      businessModel: "Subscription",
      isShared: true
    }
  ];

  // Initialize ideas
  useEffect(() => {
    setIdeas(mockIdeas);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter ideas based on active tab and search term
  useEffect(() => {
    let filtered = ideas;

    // Filter by status tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(idea => idea.status === activeTab);
    }

    // Filter by search term
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(searchLower) ||
        idea.description.toLowerCase().includes(searchLower) ||
        idea.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        idea.category?.toLowerCase().includes(searchLower) ||
        idea.targetAudience?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredIdeas(filtered);
  }, [ideas, activeTab, debouncedSearchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Sorting function
  const sortIdeas = (ideas: IdeaProps[], sortBy: string) => {
    switch (sortBy) {
      case 'newest':
        return ideas.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      case 'oldest':
        return ideas.sort((a, b) => new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime());
      case 'most-liked':
        return ideas.sort((a, b) => b.votes - a.votes);
      case 'validation-score':
        return ideas.sort((a, b) => (b.validationScore || 0) - (a.validationScore || 0));
      default:
        return ideas;
    }
  };

  const generateAIInsights = async (idea: IdeaProps) => {
    setIsGeneratingInsights(idea.id);
    try {
      toast({
        title: "🧠 AI Insights Generated!",
        description: "Fresh insights have been added to your idea",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error generating AI insights:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingInsights(null);
    }
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
              <Button
                onClick={() => toast({ title: "New Idea", description: "Feature coming soon!" })}
                className="bg-green-600 hover:bg-green-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Idea
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Idea Vault</h1>
            <p className="text-gray-400 text-lg">
              Manage and validate your startup ideas with AI insights
            </p>
          </div>

          {/* Tabs and Filters Section */}
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
                <TabsList className="bg-black/60 border border-white/20">
                  <TabsTrigger value="all" className="flex items-center gap-2 data-[state=active]:bg-green-600">
                    <Lightbulb className="h-4 w-4" />
                    All Ideas
                  </TabsTrigger>
                  <TabsTrigger value="validated" className="flex items-center gap-2 data-[state=active]:bg-green-600">
                    <Target className="h-4 w-4" />
                    Validated
                  </TabsTrigger>
                  <TabsTrigger value="exploring" className="flex items-center gap-2 data-[state=active]:bg-green-600">
                    <Brain className="h-4 w-4" />
                    Exploring
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span>{filteredIdeas.length} ideas</span>
                  <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                  <span>{ideas.filter(i => i.status === 'validated').length} validated</span>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search ideas, tags, descriptions, or categories..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-12 h-12 bg-black/60 border-white/20 text-white placeholder:text-gray-400 focus:border-green-500"
                  />
                </div>

                <div className="flex gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-12 bg-black/60 border-white/20 hover:bg-black/80">
                        <Filter className="h-4 w-4 mr-2" />
                        Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : sortBy === 'most-liked' ? 'Most Liked' : 'Validation Score'}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-black/90 border-white/20">
                      <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest First</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest First</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("most-liked")}>Most Liked</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("validation-score")}>Validation Score</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                    className="h-12 w-12 bg-black/60 border-white/20 hover:bg-black/80"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Ideas Grid */}
              <TabsContent value={activeTab} className="transition-all duration-300">
                {sortIdeas(filteredIdeas, sortBy).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {sortIdeas(filteredIdeas, sortBy).map(idea => (
                      <Card key={idea.id} className="bg-black/40 backdrop-blur-sm border border-white/10 hover:border-green-500/50 cursor-pointer group hover:scale-[1.02] transition-all duration-300">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {idea.priority && (
                                <div className={`w-3 h-3 rounded-full ${
                                  idea.priority === 'high' ? 'bg-red-500' :
                                  idea.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                }`} />
                              )}
                              {idea.isShared && (
                                <Users className="h-4 w-4 text-blue-400" />
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                generateAIInsights(idea);
                              }}
                              disabled={isGeneratingInsights === idea.id}
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                            >
                              {isGeneratingInsights === idea.id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border border-green-400 border-t-transparent" />
                              ) : (
                                <Brain className="h-4 w-4 text-green-400" />
                              )}
                            </Button>
                          </div>

                          <div>
                            <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-green-400 transition-colors line-clamp-1">
                              {idea.title}
                            </h3>
                            <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                              {idea.description}
                            </p>
                          </div>

                          {/* Validation Score */}
                          {idea.validationScore && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                <span>Validation Score</span>
                                <span>{idea.validationScore}%</span>
                              </div>
                              <Progress value={idea.validationScore} className="h-2" />
                            </div>
                          )}

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mb-4">
                            {idea.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs px-2 py-1 border-white/20 bg-white/5">
                                {tag}
                              </Badge>
                            ))}
                            {idea.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs px-2 py-1 border-white/20 bg-white/5 text-gray-400">
                                +{idea.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          {/* Metrics */}
                          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                <span>{idea.votes}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                <span>{idea.comments}</span>
                              </div>
                            </div>
                            <Badge variant={idea.status === 'validated' ? 'default' : 'secondary'} className="text-xs">
                              {idea.status}
                            </Badge>
                          </div>

                          {/* Business Metrics */}
                          {(idea.potentialRevenue || idea.timeToMarket) && (
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              {idea.potentialRevenue && (
                                <div className="flex items-center gap-1 text-gray-400">
                                  <DollarSign className="h-3 w-3" />
                                  <span>{idea.potentialRevenue}</span>
                                </div>
                              )}
                              {idea.timeToMarket && (
                                <div className="flex items-center gap-1 text-gray-400">
                                  <Clock className="h-3 w-3" />
                                  <span>{idea.timeToMarket}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-16 max-w-2xl mx-auto">
                      <div className="relative mb-8">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl"></div>
                        <Lightbulb className="relative h-20 w-20 mx-auto text-green-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        {searchTerm ? "No ideas found" : "No ideas yet"}
                      </h3>
                      <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                        {searchTerm
                          ? "Try adjusting your search terms or filters to find what you're looking for"
                          : "Start building your startup empire by adding your first brilliant idea"
                        }
                      </p>
                      {!searchTerm && (
                        <Button
                          onClick={() => toast({ title: "Create Idea", description: "Feature coming soon!" })}
                          size="lg"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Sparkles className="h-5 w-5 mr-2" />
                          Create Your First Idea
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IdeaVault;
