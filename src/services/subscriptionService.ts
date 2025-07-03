import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'expired' | 'cancelled';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    ideas: number | 'unlimited';
    prompts: number | 'unlimited';
    aiCalls: number | 'unlimited';
    teamMembers: number | 'unlimited';
    storage: string;
  };
  popular?: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsageStats {
  ideasCreated: number;
  promptsGenerated: number;
  aiCallsMade: number;
  storageUsed: number;
  resetDate: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      '1 idea in Idea Vault',
      '10 AI prompts per month',
      'Basic templates',
      'Community support',
      'Basic AI tools access'
    ],
    limits: {
      ideas: 1,
      prompts: 10,
      aiCalls: 50,
      teamMembers: 1,
      storage: '100MB'
    }
  },
  {
    id: 'pro-monthly',
    name: 'Pro',
    tier: 'pro',
    price: 29,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited ideas',
      'Unlimited AI prompts',
      'Advanced templates',
      'Priority support',
      'MVP Studio access',
      'Team collaboration (5 members)',
      'Export capabilities',
      'Advanced AI tools'
    ],
    limits: {
      ideas: 'unlimited',
      prompts: 'unlimited',
      aiCalls: 'unlimited',
      teamMembers: 5,
      storage: '10GB'
    },
    popular: true
  },
  {
    id: 'pro-yearly',
    name: 'Pro (Yearly)',
    tier: 'pro',
    price: 290,
    currency: 'USD',
    interval: 'year',
    features: [
      'Everything in Pro Monthly',
      '2 months free',
      'Priority feature requests',
      'Advanced analytics'
    ],
    limits: {
      ideas: 'unlimited',
      prompts: 'unlimited',
      aiCalls: 'unlimited',
      teamMembers: 5,
      storage: '10GB'
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tier: 'enterprise',
    price: 99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Custom AI training',
      'Dedicated support',
      'Advanced analytics',
      'Custom integrations',
      'SSO support',
      'API access'
    ],
    limits: {
      ideas: 'unlimited',
      prompts: 'unlimited',
      aiCalls: 'unlimited',
      teamMembers: 'unlimited',
      storage: '100GB'
    }
  }
];

class SubscriptionService {
  /**
   * Get user's current subscription
   */
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user subscription:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserSubscription:', error);
      return null;
    }
  }

  /**
   * Get user's usage statistics
   */
  static async getUserUsage(userId: string): Promise<UsageStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_usage_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user usage:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserUsage:', error);
      return null;
    }
  }

  /**
   * Check if user can perform an action based on their subscription
   */
  static async canPerformAction(
    userId: string, 
    action: 'create_idea' | 'generate_prompt' | 'make_ai_call'
  ): Promise<{ allowed: boolean; reason?: string; upgradeRequired?: boolean }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      const usage = await this.getUserUsage(userId);

      if (!subscription) {
        // Default to free tier if no subscription found
        return this.checkFreeTierLimits(usage, action);
      }

      const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
      if (!plan) {
        return { allowed: false, reason: 'Invalid subscription plan' };
      }

      // Check if subscription is active
      if (subscription.status !== 'active' && subscription.status !== 'trial') {
        return { 
          allowed: false, 
          reason: 'Subscription is not active', 
          upgradeRequired: true 
        };
      }

      // Check if trial has expired
      if (subscription.status === 'trial' && subscription.trialEndsAt) {
        const trialEnd = new Date(subscription.trialEndsAt);
        if (trialEnd < new Date()) {
          return { 
            allowed: false, 
            reason: 'Trial has expired', 
            upgradeRequired: true 
          };
        }
      }

      return this.checkPlanLimits(plan, usage, action);
    } catch (error) {
      console.error('Error in canPerformAction:', error);
      return { allowed: false, reason: 'Error checking permissions' };
    }
  }

  private static checkFreeTierLimits(
    usage: UsageStats | null, 
    action: string
  ): { allowed: boolean; reason?: string; upgradeRequired?: boolean } {
    const freePlan = SUBSCRIPTION_PLANS.find(p => p.tier === 'free')!;
    return this.checkPlanLimits(freePlan, usage, action);
  }

  private static checkPlanLimits(
    plan: SubscriptionPlan, 
    usage: UsageStats | null, 
    action: string
  ): { allowed: boolean; reason?: string; upgradeRequired?: boolean } {
    if (!usage) {
      // If no usage data, allow action (will be tracked)
      return { allowed: true };
    }

    switch (action) {
      case 'create_idea':
        if (plan.limits.ideas === 'unlimited') return { allowed: true };
        if (usage.ideasCreated >= plan.limits.ideas) {
          return { 
            allowed: false, 
            reason: `You've reached your limit of ${plan.limits.ideas} ideas`, 
            upgradeRequired: true 
          };
        }
        return { allowed: true };

      case 'generate_prompt':
        if (plan.limits.prompts === 'unlimited') return { allowed: true };
        if (usage.promptsGenerated >= plan.limits.prompts) {
          return { 
            allowed: false, 
            reason: `You've reached your limit of ${plan.limits.prompts} prompts this month`, 
            upgradeRequired: true 
          };
        }
        return { allowed: true };

      case 'make_ai_call':
        if (plan.limits.aiCalls === 'unlimited') return { allowed: true };
        if (usage.aiCallsMade >= plan.limits.aiCalls) {
          return { 
            allowed: false, 
            reason: `You've reached your limit of ${plan.limits.aiCalls} AI calls this month`, 
            upgradeRequired: true 
          };
        }
        return { allowed: true };

      default:
        return { allowed: true };
    }
  }

  /**
   * Track usage for a specific action
   */
  static async trackUsage(
    userId: string,
    action: 'create_idea' | 'generate_prompt' | 'make_ai_call',
    amount: number = 1
  ): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('increment_user_usage', {
        user_id: userId,
        action_type: action,
        increment_amount: amount
      });

      if (error) {
        console.error('Error tracking usage:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in trackUsage:', error);
      return false;
    }
  }

  /**
   * Create or update user subscription
   */
  static async updateSubscription(
    userId: string,
    planId: string,
    status: SubscriptionStatus = 'active'
  ): Promise<boolean> {
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        console.error('Invalid plan ID:', planId);
        return false;
      }

      const now = new Date();
      const periodEnd = new Date(now);
      if (plan.interval === 'month') {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      const subscriptionData = {
        user_id: userId,
        plan_id: planId,
        tier: plan.tier,
        status,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
        updated_at: now.toISOString()
      };

      const { error } = await supabase
        .from('user_subscriptions')
        .upsert(subscriptionData, { onConflict: 'user_id' });

      if (error) {
        console.error('Error updating subscription:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateSubscription:', error);
      return false;
    }
  }

  /**
   * Start free trial
   */
  static async startFreeTrial(userId: string): Promise<boolean> {
    try {
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 7); // 7-day trial

      const subscriptionData = {
        user_id: userId,
        plan_id: 'pro-monthly',
        tier: 'pro' as SubscriptionTier,
        status: 'trial' as SubscriptionStatus,
        current_period_start: now.toISOString(),
        current_period_end: trialEnd.toISOString(),
        trial_ends_at: trialEnd.toISOString(),
        cancel_at_period_end: false,
        updated_at: now.toISOString()
      };

      const { error } = await supabase
        .from('user_subscriptions')
        .upsert(subscriptionData, { onConflict: 'user_id' });

      if (error) {
        console.error('Error starting trial:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in startFreeTrial:', error);
      return false;
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(userId: string, immediate: boolean = false): Promise<boolean> {
    try {
      const updateData = immediate
        ? { status: 'cancelled' as SubscriptionStatus, updated_at: new Date().toISOString() }
        : { cancel_at_period_end: true, updated_at: new Date().toISOString() };

      const { error } = await supabase
        .from('user_subscriptions')
        .update(updateData)
        .eq('user_id', userId);

      if (error) {
        console.error('Error cancelling subscription:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in cancelSubscription:', error);
      return false;
    }
  }

  /**
   * Get subscription plan by ID
   */
  static getPlan(planId: string): SubscriptionPlan | null {
    return SUBSCRIPTION_PLANS.find(p => p.id === planId) || null;
  }

  /**
   * Get all available plans
   */
  static getAllPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  /**
   * Get plans for a specific tier
   */
  static getPlansByTier(tier: SubscriptionTier): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS.filter(p => p.tier === tier);
  }

  /**
   * Check if user is on trial
   */
  static async isOnTrial(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) return false;

    if (subscription.status !== 'trial') return false;

    if (subscription.trialEndsAt) {
      const trialEnd = new Date(subscription.trialEndsAt);
      return trialEnd > new Date();
    }

    return false;
  }

  /**
   * Get days remaining in trial
   */
  static async getTrialDaysRemaining(userId: string): Promise<number> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription || subscription.status !== 'trial' || !subscription.trialEndsAt) {
      return 0;
    }

    const trialEnd = new Date(subscription.trialEndsAt);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }
}

export default SubscriptionService;
