import { useCallback } from 'react';
import { useSubscription } from './useSubscription';
import { useToast } from './use-toast';
import { ToastAction } from '@/components/ui/toast';

interface UseFeatureAccessReturn {
  checkAndExecute: (
    action: 'create_idea' | 'generate_prompt' | 'make_ai_call',
    callback: () => Promise<void> | void,
    options?: {
      feature?: string;
      description?: string;
      showUpgradePrompt?: boolean;
      trackUsage?: boolean;
    }
  ) => Promise<boolean>;
  
  canAccess: (action: 'create_idea' | 'generate_prompt' | 'make_ai_call') => Promise<{
    allowed: boolean;
    reason?: string;
    upgradeRequired?: boolean;
  }>;
  
  trackAction: (action: 'create_idea' | 'generate_prompt' | 'make_ai_call', amount?: number) => Promise<boolean>;
}

export const useFeatureAccess = (): UseFeatureAccessReturn => {
  const { canPerformAction, trackUsage } = useSubscription();
  const { toast } = useToast();

  const checkAndExecute = useCallback(async (
    action: 'create_idea' | 'generate_prompt' | 'make_ai_call',
    callback: () => Promise<void> | void,
    options: {
      feature?: string;
      description?: string;
      showUpgradePrompt?: boolean;
      trackUsage?: boolean;
    } = {}
  ): Promise<boolean> => {
    const {
      feature = action.replace('_', ' '),
      showUpgradePrompt = true,
      trackUsage: shouldTrackUsage = true
    } = options;

    try {
      // Check if user can perform the action
      const accessResult = await canPerformAction(action);
      
      if (!accessResult.allowed) {
        if (showUpgradePrompt && accessResult.upgradeRequired) {
          toast({
            title: "Upgrade Required",
            description: accessResult.reason || `${feature} requires a Pro subscription. Click here to upgrade.`,
            variant: "destructive",
            action: (
              <ToastAction
                altText="Upgrade to Pro"
                onClick={() => {
                  // This would open the upgrade modal
                  // For now, just show a message
                  toast({
                    title: "Upgrade Coming Soon!",
                    description: "Payment integration will be available soon.",
                  });
                }}
              >
                Upgrade
              </ToastAction>
            )
          });
        } else {
          toast({
            title: "Access Restricted",
            description: accessResult.reason || `Cannot access ${feature}`,
            variant: "destructive"
          });
        }
        return false;
      }

      // Execute the callback
      await callback();

      // Track usage if enabled
      if (shouldTrackUsage) {
        await trackUsage(action);
      }

      return true;
    } catch (error) {
      console.error('Error in checkAndExecute:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    }
  }, [canPerformAction, trackUsage, toast]);

  const canAccess = useCallback(async (
    action: 'create_idea' | 'generate_prompt' | 'make_ai_call'
  ) => {
    return await canPerformAction(action);
  }, [canPerformAction]);

  const trackAction = useCallback(async (
    action: 'create_idea' | 'generate_prompt' | 'make_ai_call',
    amount: number = 1
  ) => {
    return await trackUsage(action, amount);
  }, [trackUsage]);

  return {
    checkAndExecute,
    canAccess,
    trackAction
  };
};

export default useFeatureAccess;
