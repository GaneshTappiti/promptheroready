import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Crown,
  Zap,
  Infinity as InfinityIcon,
  Check,
  Star,
  Rocket,
  Brain
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";

interface UpgradePromptProps {
  feature: string;
  description: string;
  className?: string;
  variant?: 'card' | 'alert' | 'inline';
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ 
  feature, 
  description, 
  className,
  variant = 'card'
}) => {

  const { toast } = useToast();

  const handleUpgrade = () => {
    // TODO: Implement actual upgrade flow
    toast({
      title: "Upgrade Coming Soon!",
      description: "Pro features will be available soon. Stay tuned!",
    });
  };

  const features = {
    free: [
      "Unlimited workspace access",
      "Unlimited idea vault storage",
      "1 active idea at a time",
      "10 AI prompts per idea",
      "Basic prompt history",
      "Manual prompt copying",
      "Community support"
    ],
    pro: [
      "Everything in Free, plus:",
      "Unlimited active ideas",
      "Unlimited AI prompts",
      "Advanced export features",
      "Priority support",
      "Custom AI models",
      "Team collaboration",
      "Advanced analytics"
    ]
  };

  if (variant === 'alert') {
    return (
      <Alert className={`border-yellow-600/20 bg-yellow-600/10 ${className}`}>
        <Crown className="h-4 w-4 text-yellow-400" />
        <AlertDescription className="text-yellow-200">
          <strong>Pro Feature:</strong> {description}
          <Button 
            variant="link" 
            className="text-yellow-400 hover:text-yellow-300 p-0 ml-2"
            onClick={handleUpgrade}
          >
            Upgrade to Pro
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <Crown className="h-4 w-4 text-yellow-400" />
        <span className="text-gray-400">{description}</span>
        <Button 
          variant="link" 
          size="sm"
          className="text-yellow-400 hover:text-yellow-300 p-0"
          onClick={handleUpgrade}
        >
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <Card className={`bg-black/40 backdrop-blur-sm border-yellow-600/20 ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-600/20 rounded-full">
            <Crown className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              Unlock {feature}
              <Badge className="bg-yellow-600/20 text-yellow-400">Pro</Badge>
            </CardTitle>
            <p className="text-gray-400 text-sm mt-1">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Feature Comparison */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-300 flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              Free Plan
            </h4>
            <ul className="space-y-2">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                  <Check className="h-4 w-4 text-gray-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-yellow-400 flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              Pro Plan
            </h4>
            <ul className="space-y-2">
              {features.pro.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="h-4 w-4 text-green-400" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border border-yellow-600/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-white font-semibold">Pro Plan</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">₹999</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-gray-400 text-sm">Everything you need to build faster</p>
            </div>
            <div className="text-right">
              <div className="text-green-400 text-sm font-medium mb-1">
                Save 20% annually
              </div>
              <div className="text-gray-400 text-xs">
                ₹9,990/year
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleUpgrade}
            className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Pro
          </Button>
          <Button
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
            onClick={() => toast({ title: "Trial", description: "7-day free trial coming soon!" })}
          >
            <Zap className="h-4 w-4 mr-2" />
            Start Trial
          </Button>
        </div>

        {/* Benefits Highlight */}
        <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <InfinityIcon className="h-3 w-3" />
            <span>Unlimited</span>
          </div>
          <div className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            <span>AI Powered</span>
          </div>
          <div className="flex items-center gap-1">
            <Rocket className="h-3 w-3" />
            <span>Export Ready</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradePrompt;
