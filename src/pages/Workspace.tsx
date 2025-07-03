import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  Bell,
  Brain,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileSpreadsheet,
  Globe2,
  History,
  Layers,
  Lightbulb,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  Palette,
  Rocket,
  Search,
  Settings,
  Shield,
  Sparkles,
  User,
  Wallet,
  Clock,
  PlusCircle,
  Target,
  TrendingUp,
  BarChart3,
  CalendarDays,
  Zap,
  X,
  Menu,
  Save
} from "lucide-react";
import StartupBriefGenerator from "@/components/StartupBriefGenerator";
import { supabaseHelpers } from '../lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { aiEngine } from '../services/aiEngine';
import { useToast } from "@/hooks/use-toast";
import FlowProgress from "@/components/dashboard/FlowProgress";
import QuickStats from "@/components/dashboard/QuickStats";
import { useActiveIdea, useIdeaStore } from "@/stores/ideaStore";
import { AISettingsPanel } from '@/components/ai-settings';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WorkspaceContainer, WorkspaceHeader } from '@/components/ui/workspace-layout';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import FeatureGate from '@/components/FeatureGate';
import EnhancedUpgradePrompt from '@/components/EnhancedUpgradePrompt';

interface Project {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  stage?: 'idea' | 'planning' | 'development' | 'testing' | 'launch';
  progress?: number;
}

interface Task {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  status?: 'todo' | 'in-progress' | 'done';
}

interface Module {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: React.ReactNode;
}

interface GPTFeature {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action: string;
  onClick: () => void;
  tooltip: string;
}

interface WeeklyGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  dueDate: string;
}

interface TrendingIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  popularity: number;
}

type Category = 'ideation' | 'planning' | 'execution' | 'validation';

const Workspace = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPromptHistory, setShowPromptHistory] = useState(false);

  // Workshop/Idea validation state
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [showValidationResult, setShowValidationResult] = useState(false);

  // Store hooks
  const { activeIdea, setActiveIdea } = useActiveIdea();
  const canCreateNewIdea = useIdeaStore((state) => state.canCreateNewIdea);
  const setHasActiveIdea = useIdeaStore((state) => state.setHasActiveIdea);
  const setCurrentStep = useIdeaStore((state) => state.setCurrentStep);

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
  const [showTemplates, setShowTemplates] = useState(false);

  const { toast } = useToast();
  const { checkAndExecute } = useFeatureAccess();

  // Idea validation function (from Workshop)
  const validateIdea = async (ideaText: string) => {
    const canProceed = await checkAndExecute(
      'create_idea',
      async () => {
        await performIdeaValidation(ideaText);
      },
      {
        feature: 'Idea Creation',
        description: 'Create and validate new startup ideas',
        showUpgradePrompt: true,
        trackUsage: true
      }
    );

    if (!canProceed) {
      return;
    }
  };

  const performIdeaValidation = async (ideaText: string) => {
    if (!canCreateNewIdea()) {
      toast({
        title: "Cannot Create New Idea",
        description: "You already have an active idea. Archive it first or upgrade to Pro.",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    setShowValidationResult(false);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `
      Analyze this startup idea comprehensively and provide a detailed validation report:

      Idea: "${ideaText}"

      Please provide a structured analysis with:

      1. VALIDATION SCORE (0-100): Overall viability score
      2. MARKET OPPORTUNITY: Market size, demand, and potential
      3. RISK ASSESSMENT: Key risks and challenges
      4. MONETIZATION STRATEGY: Revenue model suggestions
      5. KEY FEATURES: Essential features for MVP
      6. NEXT STEPS: Immediate actionable steps
      7. COMPETITOR ANALYSIS: Similar solutions and differentiation
      8. TARGET MARKET: Primary customer segments
      9. PROBLEM STATEMENT: Core problem being solved

      Format your response as a structured analysis with clear sections.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the response to extract structured data
      const validationScore = extractValidationScore(text);
      const sections = parseValidationResponse(text);

      const validatedIdea = {
        id: Date.now().toString(),
        title: extractIdeaTitle(ideaText),
        description: ideaText,
        status: 'active' as const,
        validation_score: validationScore,
        market_opportunity: sections.marketOpportunity,
        risk_assessment: sections.riskAssessment,
        monetization_strategy: sections.monetizationStrategy,
        key_features: sections.keyFeatures,
        next_steps: sections.nextSteps,
        competitor_analysis: sections.competitorAnalysis,
        target_market: sections.targetMarket,
        problem_statement: sections.problemStatement,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setValidationResult({
        idea: validatedIdea,
        fullResponse: text,
        score: validationScore
      });

      setShowValidationResult(true);

      toast({
        title: "Idea Validated!",
        description: `Your idea scored ${validationScore}/100. Review the analysis below.`,
      });

    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation Failed",
        description: "Could not validate your idea. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Helper functions for parsing validation response
  const extractValidationScore = (text: string): number => {
    const scoreMatch = text.match(/VALIDATION SCORE.*?(\d+)/i);
    return scoreMatch ? parseInt(scoreMatch[1]) : 75;
  };

  const extractIdeaTitle = (description: string): string => {
    const words = description.split(' ').slice(0, 6);
    return words.join(' ') + (description.split(' ').length > 6 ? '...' : '');
  };

  const parseValidationResponse = (text: string) => {
    const sections = {
      marketOpportunity: extractSection(text, 'MARKET OPPORTUNITY'),
      riskAssessment: extractSection(text, 'RISK ASSESSMENT'),
      monetizationStrategy: extractSection(text, 'MONETIZATION STRATEGY'),
      keyFeatures: extractListSection(text, 'KEY FEATURES'),
      nextSteps: extractListSection(text, 'NEXT STEPS'),
      competitorAnalysis: extractSection(text, 'COMPETITOR ANALYSIS'),
      targetMarket: extractSection(text, 'TARGET MARKET'),
      problemStatement: extractSection(text, 'PROBLEM STATEMENT')
    };
    return sections;
  };

  const extractSection = (text: string, sectionName: string): string => {
    const regex = new RegExp(`${sectionName}:?\\s*([\\s\\S]*?)(?=\\n\\d+\\.|\\n[A-Z][A-Z\\s]+:|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  };

  const extractListSection = (text: string, sectionName: string): string[] => {
    const sectionText = extractSection(text, sectionName);
    return sectionText.split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[-*•]\s*/, '').trim())
      .filter(item => item.length > 0);
  };

  const saveValidatedIdea = () => {
    if (!validationResult) return;

    setActiveIdea(validationResult.idea);
    setHasActiveIdea(true);
    setCurrentStep('idea-vault');

    toast({
      title: "Idea Saved!",
      description: "Your validated idea has been saved to your Idea Vault.",
    });

    // Navigate to Idea Vault
    window.location.href = '/workspace/idea-vault';
  };

  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<GPTFeature | null>(null);
  const [showAISettings, setShowAISettings] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('ideation');
  const [gptInput, setGptInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [showResponse, setShowResponse] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [trendingIdeas, setTrendingIdeas] = useState<TrendingIdea[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [showStartupBrief, setShowStartupBrief] = useState(false);
  const [briefPrompt, setBriefPrompt] = useState("");
  const [showQuickStart, setShowQuickStart] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { signOut } = useAuth();



  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      const { data: projectsData, error: projectsError } = await supabaseHelpers.getProjects();
      if (projectsData) {
        setProjects(projectsData);
      }
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
      }

      const { data: tasksData, error: tasksError } = await supabaseHelpers.getTasks();
      if (tasksData) {
        setTasks(tasksData);
      }
      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
      }
    };

    // Initialize with empty data - users will create their own content
    const initializeEnhancedData = () => {
      setWeeklyGoals([]);
      setTrendingIdeas([]);
      setUpcomingEvents([]);
    };

    fetchData();
    initializeEnhancedData();

    // Set up real-time subscriptions
    const projectsSubscription = supabaseHelpers.subscribeToProjects((payload) => {
      if (payload.eventType === 'INSERT') {
        setProjects(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setProjects(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
      } else if (payload.eventType === 'DELETE') {
        setProjects(prev => prev.filter(p => p.id !== payload.old.id));
      }
    });

    const tasksSubscription = supabaseHelpers.subscribeToTasks((payload) => {
      if (payload.eventType === 'INSERT') {
        setTasks(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
      } else if (payload.eventType === 'DELETE') {
        setTasks(prev => prev.filter(t => t.id !== payload.old.id));
      }
    });

    // Cleanup subscriptions
    return () => {
      projectsSubscription.unsubscribe();
      tasksSubscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gptInput.trim()) return;

    setIsLoading(true);
    setShowResponse(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key is not configured. Please check your .env file.");
      }

      // Get the generative model
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Enhanced prompt for better startup analysis
      const enhancedPrompt = `
      As an AI startup consultant, analyze this idea and provide:
      1. A clear problem statement
      2. Target market analysis
      3. Key features for MVP
      4. Monetization strategy
      5. Next steps

      User idea: ${gptInput}

      Format your response in a structured way with clear sections.
      `;

      const result = await model.generateContent({
        contents: [{
          role: "user",
          parts: [{
            text: enhancedPrompt
          }]
        }]
      });

      const response = await result.response;
      const text = response.text();

      setAiResponse(text);

      // Auto-sync to Idea Vault if the response looks like a startup idea
      if (gptInput.toLowerCase().includes('idea') ||
          gptInput.toLowerCase().includes('app') ||
          gptInput.toLowerCase().includes('startup') ||
          gptInput.toLowerCase().includes('build')) {

        setIsGeneratingIdea(true);

        try {
          // Create a new idea in the database
          const ideaTitle = gptInput.length > 50 ? gptInput.substring(0, 50) + '...' : gptInput;
          const { data: newIdea, error } = await supabaseHelpers.createIdea({
            title: ideaTitle,
            description: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
            category: 'ai-generated',
            tags: ['ai-generated', 'workspace']
          });

          if (newIdea && !error) {
            toast({
              title: "💡 Idea Saved!",
              description: "Your AI-generated idea has been automatically saved to Idea Vault",
              duration: 5000,
            });
          }
        } catch (ideaError) {
          console.error('Error saving idea:', ideaError);
        } finally {
          setIsGeneratingIdea(false);
        }
      }

    } catch (error) {
      console.error("Detailed error:", error);
      setAiResponse(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const gptFeatures: GPTFeature[] = [
    {
      icon: <Layers className="h-6 w-6 text-green-400" />,
      title: "Saved Templates",
      desc: "Access and reuse your favorite prompts",
      action: "View Templates",
      tooltip: "Quick access to pre-made prompts for common startup tasks",
      onClick: () => {
        setSelectedFeature(gptFeatures[0]);
        setShowFeatureModal(true);
      }
    },
    {
      icon: <Globe2 className="h-6 w-6 text-green-400" />,
      title: "Language",
      desc: "Switch between languages",
      action: "Change Language",
      tooltip: "Select your preferred language for AI interactions",
      onClick: () => {
        setSelectedFeature(gptFeatures[1]);
        setShowFeatureModal(true);
      }
    },
    {
      icon: <History className="h-6 w-6 text-green-400" />,
      title: "History",
      desc: "View past interactions",
      action: "View History",
      tooltip: "Access your previous prompts and responses",
      onClick: () => {
        setShowPromptHistory(true);
      }
    }
  ];

  const modules: Module[] = [
    {
      id: "workshop",
      name: "Workshop",
      description: "Free playground for idea validation with AI",
      path: "/workspace/workshop",
      icon: "🧠"
    },
    {
      id: "idea-vault",
      name: "Idea Vault",
      description: "Store and manage your startup ideas",
      path: "/workspace/idea-vault",
      icon: "💡"
    },
    {
      id: "ideaforge",
      name: "IdeaForge",
      description: "Turn ideas into actionable product frameworks",
      path: "/workspace/ideaforge",
      icon: "⚙️"
    },
    {
      id: "mvp-studio",
      name: "MVP Studio",
      description: "Design and prototype your MVP",
      path: "/workspace/mvp-studio",
      icon: "🚀"
    },
    {
      id: "docs-decks",
      name: "Docs & Decks",
      description: "Create and manage your startup documents",
      path: "/workspace/docs-decks",
      icon: "📄"
    }
  ];

  const recentProjects = projects.slice(0, 3).map(project => ({
    id: project.id,
    name: project.name,
    description: project.description,
    lastUpdated: new Date(project.updated_at).toLocaleDateString()
  }));

  const taskItems = tasks.map(task => ({
    id: task.id,
    title: task.title,
    priority: task.priority,
    dueDate: new Date(task.due_date).toLocaleDateString()
  }));

  const quickActions = [
    {
      title: "Validate Idea",
      description: "Get AI-powered validation for your startup concept",
      icon: <Lightbulb className="h-5 w-5 text-yellow-400" />,
      category: 'ideation',
      onClick: () => {
        const ideaText = prompt("Enter your startup idea for validation:");
        if (ideaText && ideaText.trim()) {
          validateIdea(ideaText.trim());
        }
      }
    },
    {
      title: "Business Model",
      description: "Create a business model canvas",
      icon: <FileSpreadsheet className="h-5 w-5 text-blue-400" />,
      category: 'planning',
      onClick: () => setGptInput("Help me create a business model for: ")
    },
    {
      title: "MVP Features",
      description: "Define your minimum viable product",
      icon: <Rocket className="h-5 w-5 text-green-400" />,
      category: 'execution',
      onClick: () => setGptInput("Help me define MVP features for: ")
    },
    {
      title: "Market Analysis",
      description: "Analyze your target market",
      icon: <Globe2 className="h-5 w-5 text-purple-400" />,
      category: 'validation',
      onClick: () => setGptInput("Help me analyze the market for: ")
    }
  ];



  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 transition-all duration-300">
        <div className="flex flex-col w-full">
        {/* Enhanced Top Navigation Bar */}
        <div className="workspace-nav-enhanced">
          <div className="flex items-center justify-between w-full px-4 md:px-6 py-3 md:py-4">
            {/* Left Section - Hamburger, Search & Context */}
            <div className="flex items-center gap-2 md:gap-4 flex-1">
              {/* Hamburger Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-black/30"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
              {/* Enhanced Search bar */}
              <div className="relative flex-1 max-w-xs md:max-w-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search workspace..."
                  className="pl-10 pr-4 py-2 w-full md:w-80 workspace-input-enhanced"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden md:block">
                  <kbd className="px-2 py-1 text-xs text-gray-400 bg-black/30 rounded border border-white/10">
                    ⌘K
                  </kbd>
                </div>
              </div>

              {/* Context Switcher - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-black/30 px-3 py-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  Today
                  <ChevronDown className="h-3 w-3 ml-2" />
                </Button>
              </div>
            </div>

            {/* Right Section - Actions & Profile */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* AI Status Indicator - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">AI Ready</span>
              </div>

              {/* Divider - Hidden on mobile */}
              <div className="hidden md:block h-6 w-px bg-white/10"></div>

              {/* Notification Button */}
              <div ref={notificationRef} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-black/30 relative"
                  onClick={() => setShowNotifications((v) => !v)}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full"></span>
                </Button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 p-4 workspace-dropdown">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white">Notifications</h3>
                      <span className="text-xs text-gray-400">2 new</span>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 bg-green-400 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm text-white font-medium">MVP Studio Updated</p>
                            <p className="text-xs text-gray-400 mt-1">New AI prompt templates available</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 bg-blue-400 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm text-white font-medium">IdeaForge Sync</p>
                            <p className="text-xs text-gray-400 mt-1">Your ideas have been backed up</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings Button */}
              <div ref={settingsRef} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-black/30"
                  onClick={() => setShowSettings((v) => !v)}
                >
                  <Settings className="h-5 w-5" />
                </Button>
                {showSettings && (
                  <div className="absolute right-0 mt-2 w-72 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 p-4 workspace-dropdown">
                    <h3 className="font-semibold text-white mb-3">Settings</h3>
                    <div className="space-y-2">
                      <button
                        className="w-full text-left p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-3"
                        onClick={() => {
                          setShowAISettings(true);
                          setShowSettings(false);
                        }}
                      >
                        <Brain className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-gray-300">AI Provider Settings</span>
                      </button>
                      <button className="w-full text-left p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-3">
                        <Palette className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-gray-300">Theme Preferences</span>
                      </button>
                      <button className="w-full text-left p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-3">
                        <Shield className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-gray-300">Privacy & Security</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Button with Avatar */}
              <div ref={profileRef} className="relative">
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-black/30 px-3 py-2 flex items-center gap-2"
                  onClick={() => setShowProfile((v) => !v)}
                >
                  <div className="h-7 w-7 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">U</span>
                  </div>
                  <span className="text-sm font-medium hidden md:inline">User</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
                {showProfile && (
                  <div className="absolute right-0 mt-2 w-64 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 p-4 workspace-dropdown">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                      <div className="h-10 w-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">U</span>
                      </div>
                      <div>
                        <p className="font-semibold text-white">User</p>
                        <p className="text-xs text-gray-400">user@example.com</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Link to="/profile" className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">View Profile</span>
                      </Link>
                      <Link to="/account" className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">Billing & Plans</span>
                      </Link>
                      <button
                        className="w-full flex items-center gap-3 p-2 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4 text-red-400" />
                        <span className="text-sm text-red-400">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <WorkspaceContainer>
          <WorkspaceHeader
            title="Dashboard"
            subtitle="Manage your startup journey with AI-powered tools and insights."
          >
            <div className="flex items-center gap-3">
                {isGeneratingIdea && (
                  <div className="flex items-center gap-2 text-green-400 text-sm px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
                    <span className="font-medium">Saving idea...</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="bg-green-600/20 border-green-500/30 text-green-400 hover:bg-green-600/30 hover:border-green-500/50"
                  onClick={() => setShowQuickStart(true)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Quick Start
                </Button>
            </div>
          </WorkspaceHeader>
          
          {/* Founder's GPT - Redesigned as AI Co-founder */}
          <section className="mb-6 md:mb-8 flex justify-center items-center min-h-[60vh]">
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl shadow-xl p-4 md:p-10 w-full max-w-4xl flex flex-col items-center border border-white/10">
              {/* Header */}
              <div className="flex flex-col items-center mb-6 md:mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-green-400" />
                  <h2 className="text-xl md:text-3xl font-bold text-white">Your AI Co-founder</h2>
                </div>
                <p className="text-gray-400 text-center max-w-md text-sm md:text-base">
                  From ideation to execution — I'm here to help you build your startup faster.
                </p>
              </div>

              {/* Quick Actions Grid */}
              <div className="w-full mb-6 md:mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base md:text-lg font-semibold text-white">Quick Actions</h3>
                  <Button
                    variant="ghost"
                    onClick={() => setShowTemplates(true)}
                    className="text-green-400 hover:text-green-300 text-sm md:text-base"
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    View Templates
                  </Button>
                </div>
                <Tabs 
                  defaultValue="ideation" 
                  value={activeCategory} 
                  onValueChange={(value) => setActiveCategory(value as Category)} 
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-4 mb-4 w-full">
                    <TabsTrigger 
                      value="ideation" 
                      className="text-xs md:text-sm data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400"
                    >
                      Ideation
                    </TabsTrigger>
                    <TabsTrigger 
                      value="planning" 
                      className="text-xs md:text-sm data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400"
                    >
                      Planning
                    </TabsTrigger>
                    <TabsTrigger 
                      value="execution" 
                      className="text-xs md:text-sm data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400"
                    >
                      Execution
                    </TabsTrigger>
                    <TabsTrigger 
                      value="validation" 
                      className="text-xs md:text-sm data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400"
                    >
                      Validation
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value={activeCategory} className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                      {quickActions
                        .filter(action => action.category === activeCategory)
                        .map((action, i) => (
                          <button
                            key={i}
                            onClick={action.onClick}
                            className="group bg-black/20 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10 hover:border-white/20 transition-all hover:bg-black/30 text-left"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-green-600/20 rounded-lg group-hover:scale-110 transition-transform">
                                {action.icon}
                              </div>
                              <div>
                                <h4 className="font-medium text-white mb-1 text-sm md:text-base">{action.title}</h4>
                                <p className="text-xs md:text-sm text-gray-400">{action.description}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Smart Prompt Input */}
              <div className="w-full">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Input
                      value={gptInput}
                      onChange={e => setGptInput(e.target.value)}
                      placeholder="Ask your AI co-founder anything..."
                      className="bg-black/20 backdrop-blur-sm border-white/10 pr-24 text-white placeholder:text-gray-400 h-10 md:h-12 text-sm md:text-base"
                    />
                    <Button 
                      type="submit" 
                      className="absolute right-1 top-1 bg-green-600 hover:bg-green-500 h-8 md:h-10"
                      disabled={isLoading || !gptInput.trim()}
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Rocket className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </form>

                {/* AI Response Section */}
                {showResponse && (
                  <div className="mt-4 md:mt-6 bg-black/20 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
                        <h3 className="text-base md:text-lg font-semibold text-white">AI Response</h3>
                      </div>
                      {!isLoading && aiResponse && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setBriefPrompt(gptInput);
                            setShowStartupBrief(true);
                          }}
                          className="bg-green-600 hover:bg-green-500"
                        >
                          <Rocket className="h-4 w-4 mr-2" />
                          Generate Startup Brief
                        </Button>
                      )}
                    </div>
                    {isLoading ? (
                      <div className="flex items-center gap-2 text-gray-400">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span className="text-sm md:text-base">Thinking...</span>
                      </div>
                    ) : (
                      <div className="prose prose-invert max-w-none">
                        <div className="text-gray-300 whitespace-pre-wrap text-sm md:text-base">
                          {aiResponse}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Quick Stats & Progress - Positioned below AI Co-founder */}
          <div className="mb-8 md:mb-12 space-y-6 md:space-y-8">
            {/* Quick Stats */}
            <div className="px-4 md:px-0">
              <QuickStats />
            </div>

            {/* Flow Progress */}
            <div className="px-4 md:px-0">
              <FlowProgress />
            </div>
          </div>

          {/* Enhanced Dashboard Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Weekly Goals Widget */}
            <Card className="workspace-card col-span-1 md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-400" />
                  Weekly Goals
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Track your startup milestones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {weeklyGoals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-white">{goal.title}</span>
                      <span className="text-xs text-gray-400">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    <p className="text-xs text-gray-500">{goal.description}</p>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full text-green-400 hover:text-green-300 mt-3">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </CardContent>
            </Card>

            {/* Calendar Preview Widget */}
            <Card className="workspace-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-blue-400" />
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{event.title}</p>
                      <p className="text-xs text-gray-400">{event.time}</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full text-blue-400 hover:text-blue-300 mt-3">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Calendar
                </Button>
              </CardContent>
            </Card>

            {/* Trending Ideas Widget */}
            <Card className="workspace-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  Trending
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingIdeas.slice(0, 2).map((idea) => (
                  <div key={idea.id} className="space-y-1">
                    <p className="text-sm font-medium text-white">{idea.title}</p>
                    <p className="text-xs text-gray-400">{idea.category}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-1">
                        <div
                          className="bg-purple-400 h-1 rounded-full"
                          style={{ width: `${idea.popularity}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-400">{idea.popularity}%</span>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full text-purple-400 hover:text-purple-300 mt-3">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Explore Ideas
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Quick Access Modules - 2x2 grid always */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base md:text-xl font-semibold text-white">Quick Access</h2>
                <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {modules.map((module) => (
                  <Link
                    key={module.id}
                    to={module.path}
                    className="group bg-black/20 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-white/10 hover:border-green-500/30 transition-all duration-300 h-[100px] md:h-[120px] flex flex-col justify-center hover:scale-105 hover:bg-black/30"
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className="text-xl md:text-2xl group-hover:scale-110 transition-transform">{module.icon}</span>
                      <div>
                        <h3 className="font-medium text-white text-sm md:text-base group-hover:text-green-400 transition-colors">{module.name}</h3>
                        <p className="text-xs md:text-sm text-gray-400 line-clamp-2">{module.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Projects */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base md:text-xl font-semibold text-white">Recent Projects</h2>
                <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="group bg-black/20 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer hover:bg-black/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-white text-sm md:text-base mb-1 group-hover:text-green-400 transition-colors">{project.name}</h3>
                        <p className="text-xs md:text-sm text-gray-400 mb-2">{project.description}</p>
                        <p className="text-xs text-gray-500">Updated {project.lastUpdated}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {recentProjects.length === 0 && (
                  <div className="text-center py-8">
                    <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                      <Lightbulb className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-400 text-sm">No projects yet</p>
                      <p className="text-gray-500 text-xs mt-1">Start by creating your first idea</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Total Ideas</h3>
                <Lightbulb className="h-4 w-4 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{projects.length || 0}</div>
              <div className="text-xs text-green-400">+{Math.max(0, projects.length - 3)} this week</div>
            </div>

            <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Active Tasks</h3>
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{tasks.filter(t => t.status !== 'done').length || 0}</div>
              <div className="text-xs text-blue-400">{tasks.filter(t => new Date(t.due_date).toDateString() === new Date().toDateString()).length || 0} due today</div>
            </div>

            <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">In Development</h3>
                <Rocket className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{projects.filter(p => p.stage === 'development').length || 0}</div>
              <div className="text-xs text-purple-400">{projects.filter(p => p.stage === 'testing').length || 0} MVPs ready</div>
            </div>

            <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">AI Assists</h3>
                <Zap className="h-4 w-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">0</div>
              <div className="text-xs text-green-400">Ready to assist</div>
            </div>

            <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Success Rate</h3>
                <BarChart3 className="h-4 w-4 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">--</div>
              <div className="text-xs text-orange-400">Start tracking</div>
            </div>
          </div>

          {/* Project Progress Stages */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base md:text-xl font-semibold text-white">Project Pipeline</h2>
              <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {['Idea', 'Planning', 'Development', 'Testing', 'Launch'].map((stage, index) => {
                const stageProjects = projects.filter(p => {
                  if (stage === 'Idea') return p.stage === 'idea' || !p.stage;
                  if (stage === 'Planning') return p.stage === 'planning';
                  if (stage === 'Development') return p.stage === 'development';
                  if (stage === 'Testing') return p.stage === 'testing';
                  if (stage === 'Launch') return p.stage === 'launch';
                  return false;
                }).length;

                return (
                  <Card key={stage} className="workspace-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-white flex items-center justify-between">
                        {stage}
                        <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded-full">
                          {stageProjects}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-700 rounded-full">
                          <div
                            className="h-2 bg-green-400 rounded-full transition-all duration-300"
                            style={{ width: projects.length > 0 ? `${(stageProjects / projects.length) * 100}%` : '0%' }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400">
                          {index === 0 ? 'New ideas' :
                           index === 1 ? 'In planning' :
                           index === 2 ? 'Building MVP' :
                           index === 3 ? 'User testing' : 'Ready to launch'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
            
          {/* Tasks Section */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base md:text-xl font-semibold text-white">Recent Tasks</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Calendar
                </Button>

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {taskItems.slice(0, 6).map((task) => (
                <div
                  key={task.id}
                  className="group bg-black/20 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer hover:bg-black/30"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        task.priority === "High" ? "bg-red-400" :
                        task.priority === "Medium" ? "bg-yellow-400" :
                        "bg-green-400"
                      }`} />
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === "High" ? "bg-red-500/20 text-red-400" :
                        task.priority === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-green-500/20 text-green-400"
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-medium text-white text-sm mb-2 group-hover:text-green-400 transition-colors">
                    {task.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due: {task.dueDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Today
                    </span>
                  </div>
                </div>
              ))}

              {taskItems.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-8">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-400 opacity-50" />
                    <h3 className="text-lg font-medium text-white mb-2">No tasks yet</h3>
                    <p className="text-gray-400 mb-4">Create your first task to get started with project management</p>
                    <Link to="/workspace/task-planner">
                      <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Task
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {taskItems.length > 6 && (
              <div className="text-center mt-4">
                <Link to="/workspace/task-planner">
                  <Button variant="outline">
                    View All Tasks ({taskItems.length})
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions Grid */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-base md:text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/workspace/idea-vault" className="group">
                <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-green-500/30 transition-all duration-300 text-center hover:bg-black/30">
                  <Lightbulb className="h-8 w-8 mx-auto mb-2 text-yellow-400 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium text-white text-sm group-hover:text-green-400 transition-colors">New Idea</h3>
                  <p className="text-xs text-gray-400 mt-1">Capture inspiration</p>
                </div>
              </Link>

              <Link to="/workspace/docs-decks" className="group">
                <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-green-500/30 transition-all duration-300 text-center hover:bg-black/30">
                  <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium text-white text-sm group-hover:text-green-400 transition-colors">New Document</h3>
                  <p className="text-xs text-gray-400 mt-1">Create content</p>
                </div>
              </Link>

              <Link to="/workspace/blueprint-zone" className="group">
                <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-green-500/30 transition-all duration-300 text-center hover:bg-black/30">
                  <Target className="h-8 w-8 mx-auto mb-2 text-green-400 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium text-white text-sm group-hover:text-green-400 transition-colors">Plan Roadmap</h3>
                  <p className="text-xs text-gray-400 mt-1">Strategic planning</p>
                </div>
              </Link>

              <Link to="/workspace/investor-radar" className="group">
                <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-green-500/30 transition-all duration-300 text-center hover:bg-black/30">
                  <Wallet className="h-8 w-8 mx-auto mb-2 text-purple-400 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium text-white text-sm group-hover:text-green-400 transition-colors">Find Investors</h3>
                  <p className="text-xs text-gray-400 mt-1">Raise funding</p>
                </div>
              </Link>
            </div>
          </div>
        </WorkspaceContainer>

        {/* Startup Brief Modal */}
        {showStartupBrief && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Startup Brief Generator</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowStartupBrief(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <StartupBriefGenerator
                  prompt={briefPrompt}
                  onBriefGenerated={(brief) => {
                    console.log('Brief generated:', brief);
                    // Could save to database or navigate to a dedicated page
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Idea Validation Result */}
        {showValidationResult && validationResult && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600/20 rounded-full">
                      <Lightbulb className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Idea Validation Complete</h2>
                      <p className="text-gray-400">Your startup idea has been analyzed</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowValidationResult(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Validation Score */}
                  <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">Validation Score</h3>
                      <div className="text-2xl font-bold text-green-400">
                        {validationResult.score}/100
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${validationResult.score}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Idea Details */}
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2">{validationResult.idea.title}</h3>
                    <p className="text-gray-300 text-sm">{validationResult.idea.description}</p>
                  </div>

                  {/* Full Analysis */}
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-3">Detailed Analysis</h3>
                    <div className="prose prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                        {validationResult.fullResponse}
                      </pre>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={saveValidatedIdea}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save to Idea Vault
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowValidationResult(false)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay for Validation */}
        {isValidating && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
              <h3 className="text-white font-semibold mb-2">Validating Your Idea</h3>
              <p className="text-gray-400">AI is analyzing your startup concept...</p>
            </div>
          </div>
        )}

        </div>
      </main>

      {/* AI Settings Modal */}
      <Dialog open={showAISettings} onOpenChange={setShowAISettings}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Provider Settings</DialogTitle>
          </DialogHeader>
          <AISettingsPanel onClose={() => setShowAISettings(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workspace;
