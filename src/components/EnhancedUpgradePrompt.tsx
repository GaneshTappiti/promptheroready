import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { SUBSCRIPTION_PLANS } from '@/services/subscriptionService';
import { 
  Crown, 
  Zap, 
  Star, 
  ArrowRight, 
  Check,
  Sparkles,
  Lock,
  X,
  Gift,
  Clock,
  TrendingUp,
  Users,
  Infinity
} from 'lucide-react';

interface EnhancedUpgradePromptProps {
  feature: string;
  description?: string;
  className?: string;
  variant?: 'card' | 'banner' | 'modal' | 'inline';
  action?: 'create_idea' | 'generate_prompt' | 'make_ai_call';
  showTrialOption?: boolean;
  showUsageStats?: boolean;
}

const EnhancedUpgradePrompt: React.FC<EnhancedUpgradePromptProps> = ({ 
  feature, 
  description, 
  className,
  variant = 'card',
  action,
  showTrialOption = true,
  showUsageStats = true
}) => {
  const { 
    currentPlan, 
    usage, 
    isOnTrial, 
    trialDaysRemaining, 
    startFreeTrial,
    loading 
  } = useSubscription();
  const { toast } = useToast();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [startingTrial, setStartingTrial] = useState(false);

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  const handleStartTrial = async () => {
    setStartingTrial(true);
    const success = await startFreeTrial();
    setStartingTrial(false);
    if (success) {
      setShowUpgradeModal(false);
    }
  };

  const getUsageInfo = () => {
    if (!usage || !currentPlan) return null;

    switch (action) {
      case 'create_idea':
        if (currentPlan.limits.ideas === 'unlimited') return null;
        return {
          used: usage.ideasCreated,
          limit: currentPlan.limits.ideas,
          type: 'ideas',
          percentage: (usage.ideasCreated / (currentPlan.limits.ideas as number)) * 100
        };
      case 'generate_prompt':
        if (currentPlan.limits.prompts === 'unlimited') return null;
        return {
          used: usage.promptsGenerated,
          limit: currentPlan.limits.prompts,
          type: 'prompts',
          percentage: (usage.promptsGenerated / (currentPlan.limits.prompts as number)) * 100
        };
      case 'make_ai_call':
        if (currentPlan.limits.aiCalls === 'unlimited') return null;
        return {
          used: usage.aiCallsMade,
          limit: currentPlan.limits.aiCalls,
          type: 'AI calls',
          percentage: (usage.aiCallsMade / (currentPlan.limits.aiCalls as number)) * 100
        };
      default:
        return null;
    }
  };

  const usageInfo = getUsageInfo();
  const proPlans = SUBSCRIPTION_PLANS.filter(p => p.tier === 'pro');

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-600/30 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-yellow-400" />
            <div>
              <h4 className="font-semibold text-white">{feature} - Pro Feature</h4>
              {description && <p className="text-gray-300 text-sm">{description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOnTrial && (
              <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                <Clock className="h-3 w-3 mr-1" />
                {trialDaysRemaining} days left
              </Badge>
            )}
            <Button onClick={handleUpgrade} size="sm">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <Lock className="h-4 w-4 text-yellow-400" />
        <span className="text-gray-400">{description || `${feature} requires Pro`}</span>
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
    <>
      <Card className={`bg-black/40 backdrop-blur-sm border-yellow-600/20 ${className}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-600/20 rounded-full">
              <Crown className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-white flex items-center gap-2">
                Unlock {feature}
                <Badge className="bg-yellow-600/20 text-yellow-400">Pro</Badge>
              </CardTitle>
              {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Usage Stats */}
          {showUsageStats && usageInfo && (
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Current Usage</span>
                <span className="text-sm text-white">
                  {usageInfo.used} / {usageInfo.limit} {usageInfo.type}
                </span>
              </div>
              <Progress value={usageInfo.percentage} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                You've used {Math.round(usageInfo.percentage)}% of your {usageInfo.type} limit
              </p>
            </div>
          )}

          {/* Trial Status */}
          {isOnTrial && (
            <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-4 w-4 text-blue-400" />
                <span className="text-blue-400 font-medium">Free Trial Active</span>
              </div>
              <p className="text-gray-300 text-sm">
                {trialDaysRemaining} days remaining in your Pro trial
              </p>
            </div>
          )}

          {/* Quick Benefits */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-900/30 rounded-lg">
              <Infinity className="h-5 w-5 text-green-400 mx-auto mb-1" />
              <p className="text-xs text-gray-300">Unlimited Access</p>
            </div>
            <div className="text-center p-3 bg-gray-900/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xs text-gray-300">Advanced Features</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
            {showTrialOption && !isOnTrial && (
              <Button
                variant="outline"
                onClick={handleStartTrial}
                disabled={startingTrial}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                {startingTrial ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Free Trial
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-4xl bg-black/95 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-400" />
              Choose Your Plan
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {proPlans.map((plan) => (
              <Card key={plan.id} className={`bg-gray-900/50 border-gray-700 ${plan.popular ? 'ring-2 ring-yellow-400' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{plan.name}</CardTitle>
                    {plan.popular && (
                      <Badge className="bg-yellow-600/20 text-yellow-400">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400">/{plan.interval}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                        <Check className="h-4 w-4 text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                    onClick={() => {
                      toast({
                        title: "Upgrade Coming Soon!",
                        description: "Payment integration will be available soon.",
                      });
                    }}
                  >
                    Choose {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedUpgradePrompt;
