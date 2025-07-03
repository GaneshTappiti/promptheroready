import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Lightbulb,
  ChevronLeft,
  Sparkles,
  Target,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  Brain,
  Zap,
  Save,
  Loader2
} from "lucide-react";
import WorkspaceSidebar, { SidebarToggle } from "@/components/WorkspaceSidebar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseHelpers } from "@/lib/supabase";
import { useIdeaStore, useActiveIdea } from "@/stores/ideaStore";
import UpgradePrompt from "@/components/UpgradePrompt";

interface IdeaValidation {
  problemStatement: string;
  targetMarket: string;
  keyFeatures: string[];
  monetizationStrategy: string;
  nextSteps: string[];
  validationScore: number;
  marketOpportunity: string;
  riskAssessment: string;
  competitorAnalysis: string;
}

const Workshop = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ideaInput, setIdeaInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<IdeaValidation | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Use Zustand store
  const { activeIdea, setActiveIdea } = useActiveIdea();
  const hasActiveIdea = useIdeaStore((state) => state.hasActiveIdea);
  const setHasActiveIdea = useIdeaStore((state) => state.setHasActiveIdea);
  const setCurrentStep = useIdeaStore((state) => state.setCurrentStep);
  const canCreateNewIdea = useIdeaStore((state) => state.canCreateNewIdea);
  
  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

  // Check if user has an active idea (free tier restriction)
  useEffect(() => {
    checkActiveIdea();
  }, []);

  const checkActiveIdea = async () => {
    try {
      const { data: ideas, error } = await supabaseHelpers.getIdeas();
      if (!error && ideas) {
        // Check if user has any active ideas (not archived)
        const activeIdeas = ideas.filter(idea => idea.status !== 'archived');
        setHasActiveIdea(activeIdeas.length > 0);
      }
    } catch (error) {
      console.error('Error checking active ideas:', error);
    }
  };

  const validateIdea = async () => {
    if (!ideaInput.trim()) {
      toast({
        title: "Please enter your idea",
        description: "Describe your startup idea or problem you want to solve",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `
      As an expert startup consultant, analyze this idea and provide a comprehensive validation:

      Idea: "${ideaInput}"

      Please provide a structured analysis with:
      1. Clear problem statement
      2. Target market analysis (TAM/SAM/SOM if possible)
      3. Key MVP features (3-5 essential features)
      4. Monetization strategy
      5. Next actionable steps
      6. Validation score (1-100)
      7. Market opportunity assessment
      8. Risk assessment
      9. Competitor analysis

      Format your response as JSON with these exact keys:
      {
        "problemStatement": "string",
        "targetMarket": "string", 
        "keyFeatures": ["feature1", "feature2", "feature3"],
        "monetizationStrategy": "string",
        "nextSteps": ["step1", "step2", "step3"],
        "validationScore": number,
        "marketOpportunity": "string",
        "riskAssessment": "string",
        "competitorAnalysis": "string"
      }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const validationData = JSON.parse(jsonMatch[0]);
        setValidation(validationData);
        
        toast({
          title: "Idea Validated!",
          description: `Validation score: ${validationData.validationScore}/100`,
        });
      } else {
        throw new Error("Could not parse AI response");
      }
    } catch (error) {
      console.error('Error validating idea:', error);
      toast({
        title: "Validation Failed",
        description: "Please try again or check your AI configuration",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const saveToIdeaVault = async () => {
    if (!validation || !ideaInput.trim()) return;

    setIsSaving(true);

    try {
      const ideaTitle = ideaInput.length > 50 ? ideaInput.substring(0, 50) + '...' : ideaInput;

      const newIdeaData = {
        title: ideaTitle,
        description: validation.problemStatement,
        status: validation.validationScore >= 70 ? 'validated' : 'exploring',
        category: 'workshop-validated',
        tags: ['workshop', 'ai-validated'],
        validation_score: validation.validationScore,
        market_opportunity: validation.marketOpportunity,
        risk_assessment: validation.riskAssessment,
        monetization_strategy: validation.monetizationStrategy,
        key_features: validation.keyFeatures,
        next_steps: validation.nextSteps,
        competitor_analysis: validation.competitorAnalysis,
        target_market: validation.targetMarket,
        problem_statement: validation.problemStatement,
        user_id: user?.id
      };

      const { data, error } = await supabaseHelpers.createIdea(newIdeaData);

      if (error) throw error;

      // Save to Zustand store as active idea
      if (data && data[0]) {
        const savedIdea = data[0];
        setActiveIdea({
          id: savedIdea.id,
          title: savedIdea.title,
          description: savedIdea.description || '',
          status: savedIdea.status as any,
          category: savedIdea.category,
          tags: savedIdea.tags || [],
          validation_score: savedIdea.validation_score,
          market_opportunity: savedIdea.market_opportunity,
          risk_assessment: savedIdea.risk_assessment,
          monetization_strategy: savedIdea.monetization_strategy,
          key_features: savedIdea.key_features,
          next_steps: savedIdea.next_steps,
          competitor_analysis: savedIdea.competitor_analysis,
          target_market: savedIdea.target_market,
          problem_statement: savedIdea.problem_statement,
          created_at: savedIdea.created_at,
          updated_at: savedIdea.updated_at
        });
        setHasActiveIdea(true);
        setCurrentStep('vault');
      }

      toast({
        title: "💡 Idea Saved!",
        description: "Your validated idea has been saved to Idea Vault",
        duration: 5000,
      });

      // Navigate to Idea Vault
      navigate('/workspace/idea-vault');

    } catch (error) {
      console.error('Error saving idea:', error);
      toast({
        title: "Save Failed",
        description: "Could not save idea to vault. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetWorkshop = () => {
    setIdeaInput("");
    setValidation(null);
    checkActiveIdea(); // Refresh active idea status
  };

  const getValidationColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getValidationBadge = (score: number) => {
    if (score >= 80) return { text: "High Potential", color: "bg-green-600/20 text-green-400" };
    if (score >= 60) return { text: "Moderate Potential", color: "bg-yellow-600/20 text-yellow-400" };
    return { text: "Needs Refinement", color: "bg-red-600/20 text-red-400" };
  };

  return (
    <div className="layout-container bg-gradient-to-br from-black via-gray-900 to-green-950">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="layout-main transition-all duration-300">
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
              {validation && (
                <Button
                  onClick={resetWorkshop}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  New Idea
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8 max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-green-600/20 rounded-full">
                <Brain className="h-8 w-8 text-green-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Workshop</h1>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Your free playground for idea validation. Get AI-powered insights and save promising ideas to your vault.
            </p>
          </div>

          {/* Free Tier Restriction Alert */}
          {!canCreateNewIdea() && (
            <UpgradePrompt
              feature="Multiple Active Ideas"
              description="You have 1 active idea (free tier limit). Archive your current idea or upgrade to Pro to work on multiple ideas simultaneously. You can always view all your ideas in the Idea Vault."
              variant="alert"
              className="mb-6"
            />
          )}

          {!validation ? (
            /* Idea Input Section */
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Lightbulb className="h-5 w-5 text-green-400" />
                  Describe Your Idea
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="What problem are you solving? Describe your startup idea, app concept, or business opportunity..."
                  value={ideaInput}
                  onChange={(e) => setIdeaInput(e.target.value)}
                  className="min-h-32 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400"
                  disabled={hasActiveIdea}
                />
                <Button
                  onClick={validateIdea}
                  disabled={isValidating || !ideaInput.trim() || !canCreateNewIdea()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Validating Idea...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Validate with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Validation Results Section */
            <div className="space-y-6">
              {/* Validation Score */}
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Validation Results</CardTitle>
                    <Badge className={getValidationBadge(validation.validationScore).color}>
                      {getValidationBadge(validation.validationScore).text}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-3xl font-bold text-white">
                      <span className={getValidationColor(validation.validationScore)}>
                        {validation.validationScore}
                      </span>
                      <span className="text-gray-400 text-lg">/100</span>
                    </div>
                    <div className="flex-1">
                      <Progress 
                        value={validation.validationScore} 
                        className="h-3"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                      <Target className="h-5 w-5 text-blue-400" />
                      Problem Statement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{validation.problemStatement}</p>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                      <Users className="h-5 w-5 text-purple-400" />
                      Target Market
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{validation.targetMarket}</p>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                      <DollarSign className="h-5 w-5 text-green-400" />
                      Monetization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{validation.monetizationStrategy}</p>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                      <TrendingUp className="h-5 w-5 text-orange-400" />
                      Market Opportunity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{validation.marketOpportunity}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Key Features */}
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    Key MVP Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {validation.keyFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ArrowRight className="h-5 w-5 text-cyan-400" />
                    Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {validation.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="bg-cyan-600/20 text-cyan-400 text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-300">{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={saveToIdeaVault}
                  disabled={isSaving}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save to Idea Vault
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetWorkshop}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Try Another Idea
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Workshop;
