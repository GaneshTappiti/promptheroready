import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Lightbulb,
  ChevronLeft,
  Sparkles,
  Target,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Loader2,
  PlusCircle
} from "lucide-react";
import WorkspaceSidebar, { SidebarToggle } from "@/components/WorkspaceSidebar";
import { useToast } from "@/hooks/use-toast";
import { useActiveIdea, useIdeaStore } from "@/stores/ideaStore";
import { supabaseHelpers } from "@/lib/supabase";
import { useSubscription } from "@/hooks/useSubscription";
import FeatureGate from "@/components/FeatureGate";
import EnhancedUpgradePrompt from "@/components/EnhancedUpgradePrompt";
import BreadcrumbNavigation from "@/components/BreadcrumbNavigation";
import { useNavigation } from "@/contexts/AppStateContext";

// Define IdeaProps interface for export
export interface IdeaProps {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  tags: string[];
  votes: number;
  comments: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const IdeaVault = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Use Zustand store
  const { activeIdea, setActiveIdea } = useActiveIdea();
  const setCurrentStep = useIdeaStore((state) => state.setCurrentStep);
  const hasActiveIdea = useIdeaStore((state) => state.hasActiveIdea);
  const setHasActiveIdea = useIdeaStore((state) => state.setHasActiveIdea);

  // Subscription info
  const { currentPlan, usage, isFreeTier } = useSubscription();

  // Navigation
  const { setCurrentPage, setBreadcrumbs } = useNavigation();

  // Load active idea from database if not in store
  useEffect(() => {
    if (!activeIdea && hasActiveIdea) {
      loadActiveIdea();
    }
  }, []);

  const loadActiveIdea = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseHelpers.getIdeas();
      if (error) {
        console.error('Error loading ideas:', error);
        toast({
          title: "Error Loading Ideas",
          description: "Could not load your ideas. Please try again.",
          variant: "destructive"
        });
      } else if (data && data.length > 0) {
        // Get the most recent idea as active idea
        const latestIdea = data[0];
        setActiveIdea({
          id: latestIdea.id,
          title: latestIdea.title,
          description: latestIdea.description || '',
          status: latestIdea.status as any,
          category: latestIdea.category,
          tags: latestIdea.tags || [],
          validation_score: latestIdea.validation_score,
          market_opportunity: latestIdea.market_opportunity,
          risk_assessment: latestIdea.risk_assessment,
          monetization_strategy: latestIdea.monetization_strategy,
          key_features: latestIdea.key_features,
          next_steps: latestIdea.next_steps,
          competitor_analysis: latestIdea.competitor_analysis,
          target_market: latestIdea.target_market,
          problem_statement: latestIdea.problem_statement,
          created_at: latestIdea.created_at,
          updated_at: latestIdea.updated_at
        });
        setHasActiveIdea(true);
      } else {
        setHasActiveIdea(false);
      }
    } catch (error) {
      console.error('Error loading ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const continueToIdeaForge = () => {
    if (!activeIdea) {
      toast({
        title: "No Active Idea",
        description: "Please create an idea in Workshop first.",
        variant: "destructive"
      });
      return;
    }

    setCurrentStep('ideaforge');
    navigate('/workspace/ideaforge');
    
    toast({
      title: "Moving to IdeaForge",
      description: "Let's turn your idea into a structured plan!",
    });
  };

  const archiveIdea = async () => {
    if (!activeIdea) return;

    try {
      // Update idea status to archived in database
      const { error } = await supabaseHelpers.updateIdea(activeIdea.id, { status: 'archived' });
      
      if (error) throw error;

      // Clear from store
      setActiveIdea(null);
      setHasActiveIdea(false);
      setCurrentStep('workshop');

      toast({
        title: "Idea Archived",
        description: "Your idea has been archived. You can now create a new one!",
      });

      // Navigate back to workshop
      navigate('/workspace/workshop');
      
    } catch (error) {
      console.error('Error archiving idea:', error);
      toast({
        title: "Archive Failed",
        description: "Could not archive idea. Please try again.",
        variant: "destructive"
      });
    }
  };

  const startNewIdea = () => {
    navigate('/workspace/workshop');
  };

  const getValidationColor = (score?: number) => {
    if (!score) return "text-gray-400";
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getValidationBadge = (score?: number) => {
    if (!score) return { text: "Not Validated", color: "bg-gray-600/20 text-gray-400" };
    if (score >= 80) return { text: "High Potential", color: "bg-green-600/20 text-green-400" };
    if (score >= 60) return { text: "Moderate Potential", color: "bg-yellow-600/20 text-yellow-400" };
    return { text: "Needs Refinement", color: "bg-red-600/20 text-red-400" };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return { text: "Validated", color: "bg-green-600/20 text-green-400" };
      case 'exploring':
        return { text: "Exploring", color: "bg-blue-600/20 text-blue-400" };
      case 'draft':
        return { text: "Draft", color: "bg-gray-600/20 text-gray-400" };
      default:
        return { text: status, color: "bg-gray-600/20 text-gray-400" };
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-black via-gray-900 to-green-950">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 transition-all duration-300">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarToggle onClick={() => setSidebarOpen(true)} />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => navigate('/workspace')}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Workspace
                </Button>
              </div>
              {!activeIdea && (
                <FeatureGate
                  feature="Create New Idea"
                  action="create_idea"
                  description="Create and validate new startup ideas"
                  upgradePromptVariant="inline"
                  fallback={
                    <EnhancedUpgradePrompt
                      feature="Create New Idea"
                      description="You've reached your idea limit. Upgrade to Pro for unlimited ideas."
                      variant="inline"
                      action="create_idea"
                      showUsageStats={true}
                    />
                  }
                >
                  <Button
                    onClick={startNewIdea}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create New Idea
                  </Button>
                </FeatureGate>
              )}
            </div>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="px-6 py-2 border-b border-white/10">
          <BreadcrumbNavigation />
        </div>

        {/* Main Content */}
        <div className="px-6 py-8 max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-green-600/20 rounded-full">
                <Lightbulb className="h-8 w-8 text-green-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Idea Vault</h1>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {isFreeTier
                ? "Your startup idea repository. Free plan allows 1 active idea - upgrade to Pro for unlimited ideas."
                : "Your unlimited startup idea repository. Create and manage as many ideas as you want."
              }
            </p>

            {/* Usage Stats for Free Tier */}
            {isFreeTier && usage && currentPlan && (
              <div className="mt-4 max-w-md mx-auto">
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Ideas Created</span>
                    <span className="text-sm text-white">
                      {usage.ideasCreated} / {currentPlan.limits.ideas}
                    </span>
                  </div>
                  <Progress
                    value={(usage.ideasCreated / (currentPlan.limits.ideas as number)) * 100}
                    className="h-2"
                  />
                  {usage.ideasCreated >= (currentPlan.limits.ideas as number) && (
                    <p className="text-xs text-yellow-400 mt-2">
                      You've reached your idea limit. Upgrade to Pro for unlimited ideas.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Active Idea Display */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-400" />
            </div>
          ) : !activeIdea ? (
            /* Empty State */
            <Card className="bg-black/40 backdrop-blur-sm border-white/10 text-center py-12">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-gray-600/20 rounded-full">
                    <Lightbulb className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Active Idea</h3>
                    <p className="text-gray-400 mb-6 max-w-md">
                      Start your startup journey by creating and validating an idea in the Workshop.
                    </p>
                    <Button
                      onClick={startNewIdea}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Go to Workshop
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Active Idea Card */
            <div className="space-y-6">
              {/* Main Idea Card */}
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl text-white">{activeIdea.title}</CardTitle>
                        <Badge className={getStatusBadge(activeIdea.status).color}>
                          {getStatusBadge(activeIdea.status).text}
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-lg leading-relaxed">
                        {activeIdea.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Validation Score */}
                  {activeIdea.validation_score && (
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-2xl font-bold text-white">
                        <span className={getValidationColor(activeIdea.validation_score)}>
                          {activeIdea.validation_score}
                        </span>
                        <span className="text-gray-400 text-lg">/100</span>
                      </div>
                      <div className="flex-1">
                        <Progress value={activeIdea.validation_score} className="h-3" />
                      </div>
                      <Badge className={getValidationBadge(activeIdea.validation_score).color}>
                        {getValidationBadge(activeIdea.validation_score).text}
                      </Badge>
                    </div>
                  )}

                  {/* Tags */}
                  {activeIdea.tags && activeIdea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {activeIdea.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={continueToIdeaForge}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Continue to IdeaForge
                    </Button>
                    <Button
                      onClick={archiveIdea}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Archive
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default IdeaVault;
