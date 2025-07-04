// Onboarding Service - Handle user onboarding data
import { supabase } from '@/lib/supabase';
import type { OnboardingData } from '@/components/onboarding';

export interface UserOnboardingProfile {
  id: string;
  user_id: string;
  user_type: string;
  building_goal?: string;
  experience_level?: string;
  ai_provider?: string;
  ai_configured: boolean;
  ui_style: string;
  theme: string;
  output_format: string;
  discovery_source: string;
  onboarding_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

class OnboardingService {
  /**
   * Save user onboarding data to the database
   */
  async saveOnboardingData(userId: string, data: OnboardingData): Promise<{ success: boolean; error?: string }> {
    try {
      const onboardingProfile: Omit<UserOnboardingProfile, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        user_type: data.userType,
        building_goal: data.buildingGoal,
        experience_level: data.experience,
        ai_provider: data.aiProvider,
        ai_configured: data.aiConfigured,
        ui_style: data.uiStyle,
        theme: data.theme,
        output_format: data.outputFormat,
        discovery_source: data.discoverySource,
        onboarding_completed: true,
        completed_at: data.completedAt.toISOString()
      };

      const { error } = await supabase
        .from('user_onboarding_profiles')
        .upsert(onboardingProfile, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving onboarding data:', error);
        return { success: false, error: (error as Error).message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in saveOnboardingData:', error);
      return { success: false, error: 'Failed to save onboarding data' };
    }
  }

  /**
   * Get user onboarding data
   */
  async getOnboardingData(userId: string): Promise<{ data?: UserOnboardingProfile; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_onboarding_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching onboarding data:', error);
        return { error: (error as Error).message };
      }

      return { data: data || undefined };
    } catch (error) {
      console.error('Error in getOnboardingData:', error);
      return { error: 'Failed to fetch onboarding data' };
    }
  }

  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    try {
      const { data } = await this.getOnboardingData(userId);
      // User must have completed onboarding AND configured AI to be considered fully onboarded
      return !!(data && data.onboarding_completed && data.ai_configured);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Check if user has completed basic onboarding (profile setup)
   */
  async hasCompletedBasicOnboarding(userId: string): Promise<boolean> {
    try {
      const { data } = await this.getOnboardingData(userId);
      return !!(data && data.onboarding_completed);
    } catch (error) {
      console.error('Error checking basic onboarding status:', error);
      return false;
    }
  }

  /**
   * Check if user has configured AI API
   */
  async hasConfiguredAI(userId: string): Promise<boolean> {
    try {
      const { data } = await this.getOnboardingData(userId);
      return !!(data && data.ai_configured);
    } catch (error) {
      console.error('Error checking AI configuration status:', error);
      return false;
    }
  }

  /**
   * Update specific onboarding preferences
   */
  async updateOnboardingPreferences(
    userId: string,
    updates: Partial<Pick<UserOnboardingProfile, 'ui_style' | 'theme' | 'output_format' | 'ai_provider' | 'ai_configured'>>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_onboarding_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating onboarding preferences:', error);
        return { success: false, error: (error as Error).message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateOnboardingPreferences:', error);
      return { success: false, error: 'Failed to update preferences' };
    }
  }

  /**
   * Mark AI as configured for a user
   */
  async markAIConfigured(userId: string, aiProvider: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First check if user has an onboarding profile
      const { data: existingProfile } = await this.getOnboardingData(userId);

      if (!existingProfile) {
        // Create a basic onboarding profile if it doesn't exist
        const basicProfile: Omit<UserOnboardingProfile, 'id' | 'created_at' | 'updated_at'> = {
          user_id: userId,
          user_type: 'entrepreneur', // default
          building_goal: '',
          experience_level: 'beginner',
          ai_provider: aiProvider,
          ai_configured: true,
          ui_style: 'professional',
          theme: 'dark',
          output_format: 'both',
          discovery_source: '',
          onboarding_completed: false, // Still need to complete basic onboarding
          completed_at: undefined
        };

        const { error } = await supabase
          .from('user_onboarding_profiles')
          .insert(basicProfile);

        if (error) {
          console.error('Error creating onboarding profile with AI config:', error);
          return { success: false, error: (error as Error).message };
        }
      } else {
        // Update existing profile
        const { error } = await supabase
          .from('user_onboarding_profiles')
          .update({
            ai_provider: aiProvider,
            ai_configured: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) {
          console.error('Error updating AI configuration:', error);
          return { success: false, error: (error as Error).message };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error in markAIConfigured:', error);
      return { success: false, error: 'Failed to mark AI as configured' };
    }
  }

  /**
   * Get onboarding analytics data (for admin/analytics purposes)
   */
  async getOnboardingAnalytics(): Promise<{
    data?: {
      totalUsers: number;
      userTypes: Record<string, number>;
      buildingGoals: Record<string, number>;
      aiProviders: Record<string, number>;
      discoverySources: Record<string, number>;
      completionRate: number;
    };
    error?: string;
  }> {
    try {
      // Get total onboarded users
      const { count: totalUsers, error: countError } = await supabase
        .from('user_onboarding_profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        return { error: countError.message };
      }

      // Get detailed analytics
      const { data: profiles, error: profilesError } = await supabase
        .from('user_onboarding_profiles')
        .select('user_type, building_goal, ai_provider, discovery_source, ai_configured');

      if (profilesError) {
        return { error: profilesError.message };
      }

      // Process analytics
      const userTypes: Record<string, number> = {};
      const buildingGoals: Record<string, number> = {};
      const aiProviders: Record<string, number> = {};
      const discoverySources: Record<string, number> = {};

      profiles?.forEach(profile => {
        // Count user types
        userTypes[profile.user_type] = (userTypes[profile.user_type] || 0) + 1;
        
        // Count building goals
        buildingGoals[profile.building_goal] = (buildingGoals[profile.building_goal] || 0) + 1;
        
        // Count AI providers
        if (profile.ai_provider) {
          aiProviders[profile.ai_provider] = (aiProviders[profile.ai_provider] || 0) + 1;
        }
        
        // Count discovery sources
        discoverySources[profile.discovery_source] = (discoverySources[profile.discovery_source] || 0) + 1;
      });

      // Get total registered users for completion rate
      const { count: totalRegistered } = await supabase
        .from('profiles') // Assuming you have a profiles table
        .select('*', { count: 'exact', head: true });

      const completionRate = totalRegistered ? (totalUsers || 0) / totalRegistered * 100 : 0;

      return {
        data: {
          totalUsers: totalUsers || 0,
          userTypes,
          buildingGoals,
          aiProviders,
          discoverySources,
          completionRate
        }
      };
    } catch (error) {
      console.error('Error in getOnboardingAnalytics:', error);
      return { error: 'Failed to fetch analytics data' };
    }
  }

  /**
   * Get user preferences for UI customization
   */
  async getUserPreferences(userId: string): Promise<{
    uiStyle?: string;
    theme?: string;
    outputFormat?: string;
    aiProvider?: string;
    aiConfigured?: boolean;
  }> {
    try {
      const { data } = await this.getOnboardingData(userId);
      
      if (!data) {
        return {
          uiStyle: 'professional',
          theme: 'dark',
          outputFormat: 'both',
          aiConfigured: false
        };
      }

      return {
        uiStyle: data.ui_style,
        theme: data.theme,
        outputFormat: data.output_format,
        aiProvider: data.ai_provider,
        aiConfigured: data.ai_configured
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {
        uiStyle: 'professional',
        theme: 'dark',
        outputFormat: 'both',
        aiConfigured: false
      };
    }
  }
}

export const onboardingService = new OnboardingService();
