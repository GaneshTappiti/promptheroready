import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionService, {
  UserSubscription,
  UsageStats,
  SubscriptionPlan
} from '@/services/subscriptionService';
import { useToast } from '@/hooks/use-toast';

interface UseSubscriptionReturn {
  subscription: UserSubscription | null;
  usage: UsageStats | null;
  currentPlan: SubscriptionPlan | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  canPerformAction: (action: 'create_idea' | 'generate_prompt' | 'make_ai_call') => Promise<{
    allowed: boolean;
    reason?: string;
    upgradeRequired?: boolean;
  }>;
  trackUsage: (action: 'create_idea' | 'generate_prompt' | 'make_ai_call', amount?: number) => Promise<boolean>;
  startFreeTrial: () => Promise<boolean>;
  cancelSubscription: (immediate?: boolean) => Promise<boolean>;
  
  // Computed properties
  isFreeTier: boolean;
  isProTier: boolean;
  isEnterpriseTier: boolean;
  isOnTrial: boolean;
  trialDaysRemaining: number;
  hasActiveSubscription: boolean;
  
  // Refresh data
  refresh: () => Promise<void>;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnTrial, setIsOnTrial] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);

  const fetchSubscriptionData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [subscriptionData, usageData] = await Promise.all([
        SubscriptionService.getUserSubscription(user.id),
        SubscriptionService.getUserUsage(user.id)
      ]);

      setSubscription(subscriptionData);
      setUsage(usageData);

      // Set current plan
      if (subscriptionData) {
        const plan = SubscriptionService.getPlan(subscriptionData.planId);
        setCurrentPlan(plan);
      } else {
        // Default to free plan
        const freePlan = SubscriptionService.getPlan('free');
        setCurrentPlan(freePlan);
      }

      // Check trial status
      const trialStatus = await SubscriptionService.isOnTrial(user.id);
      setIsOnTrial(trialStatus);

      if (trialStatus) {
        const daysRemaining = await SubscriptionService.getTrialDaysRemaining(user.id);
        setTrialDaysRemaining(daysRemaining);
      }

    } catch (err) {
      console.error('Error fetching subscription data:', err);
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  const canPerformAction = useCallback(async (
    action: 'create_idea' | 'generate_prompt' | 'make_ai_call'
  ) => {
    if (!user?.id) {
      return { allowed: false, reason: 'User not authenticated' };
    }

    return await SubscriptionService.canPerformAction(user.id, action);
  }, [user?.id]);

  const trackUsage = useCallback(async (
    action: 'create_idea' | 'generate_prompt' | 'make_ai_call',
    amount: number = 1
  ) => {
    if (!user?.id) return false;

    const success = await SubscriptionService.trackUsage(user.id, action, amount);
    if (success) {
      // Refresh usage data
      const updatedUsage = await SubscriptionService.getUserUsage(user.id);
      setUsage(updatedUsage);
    }
    return success;
  }, [user?.id]);

  const startFreeTrial = useCallback(async () => {
    if (!user?.id) return false;

    const success = await SubscriptionService.startFreeTrial(user.id);
    if (success) {
      toast({
        title: "Trial Started!",
        description: "Your 7-day Pro trial has begun. Enjoy unlimited access!",
      });
      await fetchSubscriptionData();
    } else {
      toast({
        title: "Error",
        description: "Failed to start trial. Please try again.",
        variant: "destructive"
      });
    }
    return success;
  }, [user?.id, toast, fetchSubscriptionData]);

  const cancelSubscription = useCallback(async (immediate: boolean = false) => {
    if (!user?.id) return false;

    const success = await SubscriptionService.cancelSubscription(user.id, immediate);
    if (success) {
      toast({
        title: immediate ? "Subscription Cancelled" : "Cancellation Scheduled",
        description: immediate 
          ? "Your subscription has been cancelled immediately."
          : "Your subscription will be cancelled at the end of the current period.",
      });
      await fetchSubscriptionData();
    } else {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive"
      });
    }
    return success;
  }, [user?.id, toast, fetchSubscriptionData]);

  // Computed properties
  const isFreeTier = currentPlan?.tier === 'free' || !subscription;
  const isProTier = currentPlan?.tier === 'pro';
  const isEnterpriseTier = currentPlan?.tier === 'enterprise';
  const hasActiveSubscription = subscription?.status === 'active' || subscription?.status === 'trial';

  return {
    subscription,
    usage,
    currentPlan,
    loading,
    error,
    
    // Actions
    canPerformAction,
    trackUsage,
    startFreeTrial,
    cancelSubscription,
    
    // Computed properties
    isFreeTier,
    isProTier,
    isEnterpriseTier,
    isOnTrial,
    trialDaysRemaining,
    hasActiveSubscription,
    
    // Refresh
    refresh: fetchSubscriptionData
  };
};

export default useSubscription;
