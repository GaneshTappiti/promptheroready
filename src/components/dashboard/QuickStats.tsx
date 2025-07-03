import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  Brain,
  Rocket,
  Zap,
  Crown,
  Infinity,
  Clock,
  TrendingUp
} from "lucide-react";
import { useIdeaStore, usePromptHistory, useUserSettings } from "@/stores/ideaStore";

const QuickStats = () => {
  const { promptHistory } = usePromptHistory();
  const { userSettings } = useUserSettings();
  const hasActiveIdea = useIdeaStore((state) => state.hasActiveIdea);
  const getRemainingPrompts = useIdeaStore((state) => state.getRemainingPrompts);
  const getPromptLimit = useIdeaStore((state) => state.getPromptLimit);

  // Calculate stats
  const totalPrompts = Object.keys(promptHistory.ideaforge).length + Object.keys(promptHistory.mvpStudio).length;
  const ideaforgePrompts = Object.keys(promptHistory.ideaforge).length;
  const mvpStudioPrompts = Object.keys(promptHistory.mvpStudio).length;
  const remainingPrompts = getRemainingPrompts();
  const promptLimit = getPromptLimit();
  const isPro = userSettings.subscriptionTier === 'pro' || userSettings.subscriptionTier === 'enterprise';

  const stats = [
    {
      title: "Active Ideas",
      value: hasActiveIdea ? "1" : "0",
      subtitle: isPro ? "Unlimited available" : "1 max (Free)",
      icon: <Lightbulb className="h-5 w-5" />,
      color: "text-green-400",
      bgColor: "bg-green-600/20"
    },
    {
      title: "Total Prompts",
      value: totalPrompts.toString(),
      subtitle: `${ideaforgePrompts} IdeaForge + ${mvpStudioPrompts} MVP`,
      icon: <Brain className="h-5 w-5" />,
      color: "text-blue-400",
      bgColor: "bg-blue-600/20"
    },
    {
      title: "Remaining Prompts",
      value: remainingPrompts === -1 ? "∞" : remainingPrompts.toString(),
      subtitle: promptLimit === -1 ? "Unlimited (Pro)" : `${promptLimit} limit (Free)`,
      icon: remainingPrompts === -1 ? <Infinity className="h-5 w-5" /> : <Zap className="h-5 w-5" />,
      color: remainingPrompts === -1 ? "text-purple-400" : remainingPrompts > 5 ? "text-green-400" : remainingPrompts > 0 ? "text-yellow-400" : "text-red-400",
      bgColor: remainingPrompts === -1 ? "bg-purple-600/20" : remainingPrompts > 5 ? "bg-green-600/20" : remainingPrompts > 0 ? "bg-yellow-600/20" : "bg-red-600/20"
    },
    {
      title: "Plan",
      value: isPro ? "Pro" : "Free",
      subtitle: isPro ? "All features unlocked" : "Upgrade for more",
      icon: isPro ? <Crown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />,
      color: isPro ? "text-yellow-400" : "text-gray-400",
      bgColor: isPro ? "bg-yellow-600/20" : "bg-gray-600/20"
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="workspace-card hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${stat.bgColor} transition-transform hover:scale-105`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
                {stat.title === "Plan" && !isPro && (
                  <Badge className="bg-yellow-600/20 text-yellow-400 text-xs border border-yellow-500/20">
                    Upgrade
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex flex-col gap-1">
                  <span className="text-2xl md:text-3xl font-bold text-white">{stat.value}</span>
                  <span className="text-sm font-medium text-gray-300">{stat.title}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{stat.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuickStats;
