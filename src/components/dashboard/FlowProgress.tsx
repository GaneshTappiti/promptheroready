import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Lightbulb,
  Target,
  Rocket,
  ArrowRight,
  CheckCircle2,
  Clock,
  Lock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useActiveIdea, useIdeaStore, usePromptHistory } from "@/stores/ideaStore";

const FlowProgress = () => {
  const navigate = useNavigate();
  const { activeIdea } = useActiveIdea();
  const hasActiveIdea = useIdeaStore((state) => state.hasActiveIdea);
  const canAccessFeature = useIdeaStore((state) => state.canAccessFeature);
  const { promptHistory } = usePromptHistory();

  const flowSteps = [
    {
      id: 'workshop',
      title: 'Workshop',
      description: 'Validate your startup idea with AI',
      icon: <Brain className="h-5 w-5" />,
      path: '/workspace/workshop',
      color: 'bg-blue-600',
      isCompleted: hasActiveIdea,
      isAccessible: true,
      requirement: null
    },
    {
      id: 'idea-vault',
      title: 'Idea Vault',
      description: 'Store and manage your ideas',
      icon: <Lightbulb className="h-5 w-5" />,
      path: '/workspace/idea-vault',
      color: 'bg-green-600',
      isCompleted: hasActiveIdea,
      isAccessible: true,
      requirement: null
    },
    {
      id: 'ideaforge',
      title: 'IdeaForge',
      description: 'Research and structure your idea',
      icon: <Target className="h-5 w-5" />,
      path: '/workspace/ideaforge',
      color: 'bg-purple-600',
      isCompleted: Object.keys(promptHistory.ideaforge).length > 0,
      isAccessible: canAccessFeature('ideaforge'),
      requirement: 'Active idea required'
    },
    {
      id: 'mvp-studio',
      title: 'MVP Studio',
      description: 'Generate buildable prompts',
      icon: <Rocket className="h-5 w-5" />,
      path: '/workspace/mvp-studio',
      color: 'bg-orange-600',
      isCompleted: Object.keys(promptHistory.mvpStudio).length > 0,
      isAccessible: canAccessFeature('mvp-studio'),
      requirement: 'Active idea required'
    }
  ];

  const completedSteps = flowSteps.filter(step => step.isCompleted).length;
  const progressPercentage = (completedSteps / flowSteps.length) * 100;

  const getNextStep = () => {
    return flowSteps.find(step => !step.isCompleted && step.isAccessible);
  };

  const nextStep = getNextStep();

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="workspace-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg md:text-xl">Your Progress</CardTitle>
            <Badge className="bg-green-600/20 text-green-400 border border-green-500/20 px-3 py-1">
              {completedSteps}/{flowSteps.length} Complete
            </Badge>
          </div>
        </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Overall Progress</span>
            <span className="text-white font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Active Idea Info */}
        {activeIdea && (
          <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-green-400" />
              <span className="text-green-400 font-medium">Active Idea</span>
            </div>
            <h4 className="text-white font-semibold">{activeIdea.title}</h4>
            <p className="text-gray-300 text-sm mt-1">{activeIdea.description}</p>
            {activeIdea.validation_score && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-400">Validation Score:</span>
                <Badge className="bg-green-600/20 text-green-400">
                  {activeIdea.validation_score}/100
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Flow Steps */}
        <div className="space-y-3">
          {flowSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                step.isCompleted
                  ? 'bg-green-600/10 border-green-600/20'
                  : step.isAccessible
                  ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 cursor-pointer'
                  : 'bg-gray-900/50 border-gray-800'
              }`}
              onClick={() => step.isAccessible && navigate(step.path)}
            >
              {/* Step Icon */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step.isCompleted
                  ? 'bg-green-600 text-white'
                  : step.isAccessible
                  ? `${step.color} text-white`
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {step.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : step.isAccessible ? (
                  step.icon
                ) : (
                  <Lock className="h-5 w-5" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className={`font-medium ${
                    step.isAccessible ? 'text-white' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h4>
                  {step.isCompleted && (
                    <Badge className="bg-green-600/20 text-green-400 text-xs">
                      Complete
                    </Badge>
                  )}
                </div>
                <p className={`text-sm ${
                  step.isAccessible ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {step.description}
                </p>
                {!step.isAccessible && step.requirement && (
                  <p className="text-xs text-gray-500 mt-1">
                    {step.requirement}
                  </p>
                )}
              </div>

              {/* Action Button */}
              {step.isAccessible && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Next Step Suggestion */}
        {nextStep && (
          <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-blue-400 font-medium">Next Step</span>
            </div>
            <p className="text-white text-sm mb-3">
              Continue with <strong>{nextStep.title}</strong> to keep building your startup.
            </p>
            <Button
              onClick={() => navigate(nextStep.path)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continue to {nextStep.title}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Completion Message */}
        {completedSteps === flowSteps.length && (
          <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <h4 className="text-white font-semibold mb-1">Flow Complete!</h4>
            <p className="text-gray-300 text-sm">
              You've completed the full startup building flow. Your prompts are ready to use with AI builders.
            </p>
          </div>
        )}
      </CardContent>
      </Card>
    </div>
  );
};

export default FlowProgress;
