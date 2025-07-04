import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Brain,
  Target,
  AlertTriangle,
  Wrench,
  TrendingUp,
  Clock,
  X,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { AIGenerationLoader } from '@/components/common/LoadingSpinner';

interface AIInsightsPanelProps {
  idea: {
    id: number;
    title: string;
    description: string;
    aiInsights?: {
      nextSteps: string[];
      marketOpportunity: string;
      riskAssessment: string;
      recommendedTools: string[];
      lastAnalyzed: string;
    };
    validationScore?: number;
    category?: string;
    targetAudience?: string;
    businessModel?: string;
  };
  onClose: () => void;
  onRefreshInsights: (idea: unknown) => void;
  isGenerating?: boolean;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  idea,
  onClose,
  onRefreshInsights,
  isGenerating = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getValidationColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-black/90 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">AI Insights</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRefreshInsights(idea)}
              disabled={isGenerating}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Idea Overview */}
        <Card className="bg-black/20 backdrop-blur-xl border-white/10 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">{idea.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-400">{idea.description}</p>
            
            {/* Validation Score */}
            {idea.validationScore && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Validation Score</span>
                  <span className={`text-sm font-medium ${getValidationColor(idea.validationScore)}`}>
                    {idea.validationScore}%
                  </span>
                </div>
                <Progress value={idea.validationScore} className="h-2" />
              </div>
            )}
            
            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {idea.category && (
                <div>
                  <span className="text-gray-500">Category</span>
                  <p className="text-gray-300">{idea.category}</p>
                </div>
              )}
              {idea.businessModel && (
                <div>
                  <span className="text-gray-500">Model</span>
                  <p className="text-gray-300">{idea.businessModel}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        {isGenerating ? (
          <Card className="bg-black/20 backdrop-blur-xl border-white/10">
            <CardContent className="p-2">
              <AIGenerationLoader
                text="Generating AI insights..."
                size="md"
              />
            </CardContent>
          </Card>
        ) : idea.aiInsights ? (
          <div className="space-y-4">
            {/* Market Opportunity */}
            <Card className="bg-black/20 backdrop-blur-xl border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  Market Opportunity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-300">{idea.aiInsights.marketOpportunity}</p>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card className="bg-black/20 backdrop-blur-xl border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-300">{idea.aiInsights.riskAssessment}</p>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="bg-black/20 backdrop-blur-xl border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-400" />
                  Recommended Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {idea.aiInsights.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-600/20 flex items-center justify-center mt-0.5">
                      <span className="text-xs text-green-400">{index + 1}</span>
                    </div>
                    <p className="text-xs text-gray-300 flex-1">{step}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recommended Tools */}
            <Card className="bg-black/20 backdrop-blur-xl border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-purple-400" />
                  Recommended Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {idea.aiInsights.recommendedTools.map((tool, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-purple-600/30 text-purple-400">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button className="w-full bg-green-600 hover:bg-green-500 text-white">
                <ArrowRight className="h-4 w-4 mr-2" />
                Start Implementation
              </Button>
              <Button variant="outline" className="w-full border-white/20 text-gray-300">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in IdeaForge
              </Button>
            </div>

            {/* Last Analyzed */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Last analyzed: {formatDate(idea.aiInsights.lastAnalyzed)}
              </p>
            </div>
          </div>
        ) : (
          <Card className="bg-black/20 backdrop-blur-xl border-white/10">
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <Sparkles className="h-8 w-8 mx-auto text-gray-400" />
                <div>
                  <h3 className="text-sm font-medium text-white mb-2">No AI Insights Yet</h3>
                  <p className="text-xs text-gray-400 mb-4">
                    Generate AI-powered insights to get personalized recommendations for this idea.
                  </p>
                  <Button 
                    onClick={() => onRefreshInsights(idea)}
                    className="bg-green-600 hover:bg-green-500"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Insights
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AIInsightsPanel;
