import { supabase } from '@/lib/supabase';

export interface MigrationResult {
  success: boolean;
  message: string;
  migratedCount?: number;
  errors?: string[];
}

export class DataMigrationService {
  /**
   * Migrate user settings to new subscription system
   */
  static async migrateUserSettings(): Promise<MigrationResult> {
    try {
      // Get all users with old settings format
      const { data: users, error: usersError } = await supabase
        .from('user_settings')
        .select('*')
        .is('subscription_tier', null);

      if (usersError) {
        return {
          success: false,
          message: 'Failed to fetch user settings',
          errors: [usersError.message]
        };
      }

      if (!users || users.length === 0) {
        return {
          success: true,
          message: 'No users to migrate',
          migratedCount: 0
        };
      }

      const errors: string[] = [];
      let migratedCount = 0;

      for (const user of users) {
        try {
          // Create default subscription for free users
          const { error: subscriptionError } = await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: user.user_id,
              plan_id: 'free',
              tier: 'free',
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
              cancel_at_period_end: false
            }, { onConflict: 'user_id' });

          if (subscriptionError) {
            errors.push(`Failed to create subscription for user ${user.user_id}: ${subscriptionError.message}`);
            continue;
          }

          // Create default usage stats
          const { error: usageError } = await supabase
            .from('user_usage_stats')
            .upsert({
              user_id: user.user_id,
              ideas_created: 0,
              prompts_generated: 0,
              ai_calls_made: 0,
              storage_used: 0,
              reset_date: new Date().toISOString()
            }, { onConflict: 'user_id' });

          if (usageError) {
            errors.push(`Failed to create usage stats for user ${user.user_id}: ${usageError.message}`);
            continue;
          }

          // Update user settings with subscription tier
          const { error: updateError } = await supabase
            .from('user_settings')
            .update({
              subscription_tier: 'free',
              subscription_status: 'active'
            })
            .eq('user_id', user.user_id);

          if (updateError) {
            errors.push(`Failed to update settings for user ${user.user_id}: ${updateError.message}`);
            continue;
          }

          migratedCount++;
        } catch (error) {
          errors.push(`Unexpected error for user ${user.user_id}: ${error}`);
        }
      }

      return {
        success: errors.length === 0,
        message: `Migration completed. ${migratedCount} users migrated successfully.`,
        migratedCount,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      return {
        success: false,
        message: 'Migration failed with unexpected error',
        errors: [String(error)]
      };
    }
  }

  /**
   * Migrate ideas to include proper relationships
   */
  static async migrateIdeaRelationships(): Promise<MigrationResult> {
    try {
      // Get all ideas that might have relationships based on similar titles or descriptions
      const { data: ideas, error: ideasError } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: true });

      if (ideasError) {
        return {
          success: false,
          message: 'Failed to fetch ideas',
          errors: [ideasError.message]
        };
      }

      if (!ideas || ideas.length === 0) {
        return {
          success: true,
          message: 'No ideas to process',
          migratedCount: 0
        };
      }

      const errors: string[] = [];
      let relationshipsCreated = 0;

      // Group ideas by user
      const userIdeas = ideas.reduce((acc, idea) => {
        if (!acc[idea.user_id]) {
          acc[idea.user_id] = [];
        }
        acc[idea.user_id].push(idea);
        return acc;
      }, {} as Record<string, any[]>);

      // For each user, look for potential relationships
      for (const [userId, userIdeaList] of Object.entries(userIdeas)) {
        const ideaList = userIdeaList as any[];
        for (let i = 0; i < ideaList.length; i++) {
          for (let j = i + 1; j < ideaList.length; j++) {
            const idea1 = ideaList[i];
            const idea2 = ideaList[j];

            // Check if ideas are similar (simple heuristic)
            const similarity = this.calculateSimilarity(idea1.title, idea2.title);
            
            if (similarity > 0.7) {
              try {
                // Create relationship (newer idea derived from older)
                const { error: relationError } = await supabase
                  .from('idea_relationships')
                  .insert({
                    source_idea_id: idea1.id,
                    target_idea_id: idea2.id,
                    relationship_type: 'derived_from'
                  });

                if (relationError && !relationError.message.includes('duplicate')) {
                  errors.push(`Failed to create relationship: ${relationError.message}`);
                } else if (!relationError) {
                  relationshipsCreated++;
                }
              } catch (error) {
                errors.push(`Unexpected error creating relationship: ${error}`);
              }
            }
          }
        }
      }

      return {
        success: true,
        message: `Created ${relationshipsCreated} idea relationships.`,
        migratedCount: relationshipsCreated,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      return {
        success: false,
        message: 'Relationship migration failed',
        errors: [String(error)]
      };
    }
  }

  /**
   * Initialize user onboarding for existing users
   */
  static async initializeUserOnboarding(): Promise<MigrationResult> {
    try {
      // Get all users without onboarding records
      const { data: users, error: usersError } = await supabase
        .from('auth.users')
        .select('id, created_at');

      if (usersError) {
        return {
          success: false,
          message: 'Failed to fetch users',
          errors: [usersError.message]
        };
      }

      if (!users || users.length === 0) {
        return {
          success: true,
          message: 'No users to initialize',
          migratedCount: 0
        };
      }

      const errors: string[] = [];
      let initializedCount = 0;

      for (const user of users) {
        try {
          // Check if onboarding already exists
          const { data: existing } = await supabase
            .from('user_onboarding')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (existing) {
            continue; // Skip if already exists
          }

          // Create onboarding record for existing users (mark as completed)
          const { error: onboardingError } = await supabase
            .from('user_onboarding')
            .insert({
              user_id: user.id,
              completed_steps: ['welcome', 'ai_provider', 'user_type', 'preferences', 'discovery'],
              current_step: 'completed',
              onboarding_data: {
                migrated: true,
                migration_date: new Date().toISOString()
              },
              completed_at: user.created_at
            });

          if (onboardingError) {
            errors.push(`Failed to initialize onboarding for user ${user.id}: ${onboardingError.message}`);
            continue;
          }

          initializedCount++;
        } catch (error) {
          errors.push(`Unexpected error for user ${user.id}: ${error}`);
        }
      }

      return {
        success: errors.length === 0,
        message: `Initialized onboarding for ${initializedCount} users.`,
        migratedCount: initializedCount,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      return {
        success: false,
        message: 'Onboarding initialization failed',
        errors: [String(error)]
      };
    }
  }

  /**
   * Run all migrations
   */
  static async runAllMigrations(): Promise<MigrationResult[]> {
    const results: MigrationResult[] = [];

    console.log('Starting data migrations...');

    // Run migrations in order
    const migrations = [
      { name: 'User Settings', fn: this.migrateUserSettings },
      { name: 'Idea Relationships', fn: this.migrateIdeaRelationships },
      { name: 'User Onboarding', fn: this.initializeUserOnboarding }
    ];

    for (const migration of migrations) {
      console.log(`Running ${migration.name} migration...`);
      try {
        const result = await migration.fn();
        results.push({
          ...result,
          message: `${migration.name}: ${result.message}`
        });
        console.log(`${migration.name} migration completed:`, result);
      } catch (error) {
        const errorResult: MigrationResult = {
          success: false,
          message: `${migration.name}: Failed with error`,
          errors: [String(error)]
        };
        results.push(errorResult);
        console.error(`${migration.name} migration failed:`, error);
      }
    }

    return results;
  }

  /**
   * Simple string similarity calculation
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) {
      return 1.0;
    }
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}

export default DataMigrationService;
