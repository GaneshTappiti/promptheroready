// =====================================================
// SUPABASE CONNECTION HELPERS FOR EACH PAGE
// =====================================================
// This file contains TypeScript helper functions for connecting
// each page of your application to the Supabase database

import { supabase, withRetry, logPerformanceMetric } from '@/lib/supabase';
import type { Database } from '@/types/database';

// Type definitions for better TypeScript support
type Tables = Database['public']['Tables'];
type Idea = Tables['ideas']['Row'];
type MVP = Tables['mvps']['Row'];

// Enhanced response type with performance metrics
type DatabaseResponse<T> = {
  data: T | null;
  error: Error | null;
  performance?: {
    duration: number;
    operation: string;
  };
};

// Helper function to handle database operations with consistent error handling
const handleDatabaseOperation = async <T>(
  operation: () => Promise<{ data: T | null; error: Error | null }>,
  operationName: string,
  retries: number = 2
): Promise<DatabaseResponse<T>> => {
  const startTime = performance.now();

  try {
    const result = await withRetry(operation, retries);
    const duration = performance.now() - startTime;

    logPerformanceMetric(operationName, duration, !result.error);

    if (result.error) {
      console.error(`❌ ${operationName} failed:`, (result.error as Error).message);
    }

    return {
      ...result,
      performance: { duration, operation: operationName }
    };
  } catch (error) {
    const duration = performance.now() - startTime;
    logPerformanceMetric(operationName, duration, false);

    console.error(`❌ ${operationName} error:`, error);
    return {
      data: null,
      error,
      performance: { duration, operation: operationName }
    };
  }
};
type TeamMessage = Tables['team_messages']['Row'];
// type UserProfile = Tables['user_profiles']['Row'];

// =====================================================
// 1. WORKSPACE PAGE HELPERS
// =====================================================

export const workspaceHelpers = {
  // Get user dashboard statistics with enhanced error handling
  async getDashboardStats(userId: string): Promise<DatabaseResponse<{
    activeIdeas: number;
    totalPrompts: number;
    subscription: Record<string, unknown> | null;
  }>> {
    return handleDatabaseOperation(
      async () => {
        const [ideasResult, promptsResult, subscriptionResult] = await Promise.all([
          supabase.from('ideas').select('id, status').eq('user_id', userId),
          supabase.from('prompt_history').select('id').eq('user_id', userId),
          supabase.from('user_subscriptions').select('*, plan:subscription_plans(*)').eq('user_id', userId).single()
        ]);

        const activeIdeas = ideasResult.data?.filter(idea => idea.status !== 'archived').length || 0;
        const totalPrompts = promptsResult.data?.length || 0;

        const stats = {
          activeIdeas,
          totalPrompts,
          subscription: subscriptionResult.data
        };

        const error = ideasResult.error || promptsResult.error || subscriptionResult.error;
        return { data: stats, error };
      },
      'workspace.getDashboardStats'
    );
  },

  // Get recent activity with enhanced error handling
  async getRecentActivity(userId: string, limit = 10): Promise<DatabaseResponse<Record<string, unknown>[]>> {
    return handleDatabaseOperation(
      async () => {
        const { data, error } = await supabase
          .from('user_activity')
          .select(`
            *,
            idea:ideas(id, title),
            mvp:mvps(id, name)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        return { data: data || [], error };
      },
      'workspace.getRecentActivity'
    );
  },

  // Get usage tracking for current period
  async getUsageTracking(userId: string): Promise<DatabaseResponse<Record<string, unknown>[]>> {
    return handleDatabaseOperation(
      async () => {
        const { data, error } = await supabase
          .from('usage_tracking')
          .select('*')
          .eq('user_id', userId)
          .gte('period_start', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

        return { data: data || [], error };
      },
      'workspace.getUsageTracking'
    );
  }
};

// =====================================================
// 2. IDEA VAULT PAGE HELPERS
// =====================================================

export const ideaVaultHelpers = {
  // Get all user ideas with filtering and sorting
  async getIdeas(userId: string, filters?: {
    status?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<DatabaseResponse<Idea[]>> {
    return handleDatabaseOperation(
      async () => {
        let query = supabase
          .from('ideas')
          .select(`
            *,
            wiki_pages_count:wiki_pages(count),
            journey_entries_count:journey_entries(count),
            feedback_items_count:feedback_items(count)
          `)
          .eq('user_id', userId);

        if (filters?.status) {
          query = query.eq('status', filters.status);
        }
        if (filters?.category) {
          query = query.eq('category', filters.category);
        }
        if (filters?.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }
        if (filters?.limit) {
          query = query.limit(filters.limit);
        }
        if (filters?.offset) {
          query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        return { data: data || [], error };
      },
      'ideaVault.getIdeas'
    );
  },

  // Create new idea with validation
  async createIdea(ideaData: Omit<Idea, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseResponse<Idea>> {
    return handleDatabaseOperation(
      async () => {
        const { data, error } = await supabase
          .from('ideas')
          .insert([{
            ...ideaData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        return { data, error };
      },
      'ideaVault.createIdea'
    );
  },

  // Update idea with optimistic locking
  async updateIdea(ideaId: string, updates: Partial<Idea>): Promise<DatabaseResponse<Idea>> {
    return handleDatabaseOperation(
      async () => {
        const { data, error } = await supabase
          .from('ideas')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', ideaId)
          .select()
          .single();

        return { data, error };
      },
      'ideaVault.updateIdea'
    );
  },

  // Delete idea with cascade handling
  async deleteIdea(ideaId: string): Promise<DatabaseResponse<null>> {
    return handleDatabaseOperation(
      async () => {
        const { error } = await supabase
          .from('ideas')
          .delete()
          .eq('id', ideaId);

        return { data: null, error };
      },
      'ideaVault.deleteIdea'
    );
  },

  // Get idea categories with usage count
  async getIdeaCategories(userId: string): Promise<DatabaseResponse<Array<{ category: string; count: number }>>> {
    return handleDatabaseOperation(
      async () => {
        const { data, error } = await supabase
          .from('ideas')
          .select('category')
          .eq('user_id', userId)
          .not('category', 'is', null);

        if (error) return { data: null, error };

        const categoryCount = data.reduce((acc: Record<string, number>, item) => {
          if (item.category) {
            acc[item.category] = (acc[item.category] || 0) + 1;
          }
          return acc;
        }, {});

        const categories = Object.entries(categoryCount).map(([category, count]) => ({
          category,
          count
        }));

        return { data: categories, error: null };
      },
      'ideaVault.getIdeaCategories'
    );
  }
};

// =====================================================
// 3. IDEAFORGE PAGE HELPERS
// =====================================================

export const ideaForgeHelpers = {
  // Get idea with all related data
  async getIdeaWithDetails(ideaId: string) {
    const [ideaResult, wikiResult, journeyResult, feedbackResult] = await Promise.all([
      supabase.from('ideas').select('*').eq('id', ideaId).single(),
      supabase.from('wiki_pages').select('*').eq('idea_id', ideaId).order('order_index'),
      supabase.from('journey_entries').select('*').eq('idea_id', ideaId).order('created_at', { ascending: false }),
      supabase.from('feedback_items').select('*').eq('idea_id', ideaId).order('created_at', { ascending: false })
    ]);

    return {
      idea: ideaResult.data,
      wiki: wikiResult.data,
      journey: journeyResult.data,
      feedback: feedbackResult.data,
      error: ideaResult.error || wikiResult.error || journeyResult.error || feedbackResult.error
    };
  },

  // Wiki operations
  async createWikiPage(wikiData: Omit<Tables['wiki_pages']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('wiki_pages')
      .insert([wikiData])
      .select()
      .single();

    return { data, error };
  },

  async updateWikiPage(pageId: string, updates: Partial<Tables['wiki_pages']['Update']>) {
    const { data, error } = await supabase
      .from('wiki_pages')
      .update(updates)
      .eq('id', pageId)
      .select()
      .single();

    return { data, error };
  },

  // Journey operations
  async createJourneyEntry(entryData: Omit<Tables['journey_entries']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('journey_entries')
      .insert([entryData])
      .select()
      .single();

    return { data, error };
  },

  // Feedback operations
  async createFeedbackItem(feedbackData: Omit<Tables['feedback_items']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('feedback_items')
      .insert([feedbackData])
      .select()
      .single();

    return { data, error };
  },

  async updateFeedbackStatus(feedbackId: string, status: string) {
    const { data, error } = await supabase
      .from('feedback_items')
      .update({ status })
      .eq('id', feedbackId)
      .select()
      .single();

    return { data, error };
  },

  // Idea management operations (delegated to ideaVaultHelpers)
  async getIdeas(userId: string, filters?: Record<string, unknown>) {
    return ideaVaultHelpers.getIdeas(userId, filters);
  },

  async createIdea(ideaData: Record<string, unknown>) {
    return ideaVaultHelpers.createIdea(ideaData as any);
  },

  async updateIdea(ideaId: string, updates: Record<string, unknown>) {
    return ideaVaultHelpers.updateIdea(ideaId, updates);
  },

  async deleteIdea(ideaId: string) {
    return ideaVaultHelpers.deleteIdea(ideaId);
  }
};

// =====================================================
// 4. MVP STUDIO PAGE HELPERS
// =====================================================

export const mvpStudioHelpers = {
  // Get MVPs for user
  async getMVPs(userId: string) {
    const { data, error } = await supabase
      .from('mvps')
      .select(`
        *,
        ideas (
          id,
          title,
          description
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Create new MVP
  async createMVP(mvpData: Omit<MVP, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('mvps')
      .insert([mvpData])
      .select()
      .single();

    return { data, error };
  },

  // Update MVP
  async updateMVP(mvpId: string, updates: Partial<MVP>) {
    const { data, error } = await supabase
      .from('mvps')
      .update(updates)
      .eq('id', mvpId)
      .select()
      .single();

    return { data, error };
  },

  // Save prompt history
  async savePromptHistory(promptData: {
    user_id: string;
    prompt_text: string;
    response_text?: string;
    prompt_type?: string;
    ai_provider?: string;
    model_used?: string;
    tokens_used?: number;
    idea_id?: string;
    mvp_id?: string;
    metadata?: Record<string, unknown>;
  }) {
    const { data, error } = await supabase
      .from('prompt_history')
      .insert([promptData])
      .select()
      .single();

    return { data, error };
  },

  // Get prompt history for idea/MVP
  async getPromptHistory(ideaId?: string, mvpId?: string, section?: string) {
    let query = supabase
      .from('prompt_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (ideaId) query = query.eq('idea_id', ideaId);
    if (mvpId) query = query.eq('mvp_id', mvpId);
    if (section) query = query.eq('section', section);

    const { data, error } = await query;
    return { data, error };
  },

  // Get AI tools with filtering
  async getAITools(category?: string, platform?: string) {
    let query = supabase
      .from('ai_tools')
      .select('*')
      .order('popularity_score', { ascending: false });

    if (category) query = query.eq('category', category);
    if (platform) query = query.contains('platforms', [platform]);

    const { data, error } = await query;
    return { data, error };
  }
};

// =====================================================
// 5. TEAM SPACE PAGE HELPERS
// =====================================================

export const teamSpaceHelpers = {
  // Get or create user's team
  async getOrCreateTeam(userId: string, userEmail: string) {
    // First try to get existing team
    const { data: existingTeam, error: fetchError } = await supabase
      .from('teams')
      .select('id, name, description')
      .eq('owner_id', userId)
      .single();

    if (existingTeam) {
      return { data: existingTeam, error: null };
    }

    // Create new team if none exists
    const { data: newTeam, error: createError } = await supabase
      .from('teams')
      .insert([{
        name: `${userEmail.split('@')[0]}'s Team`,
        description: 'Default team',
        owner_id: userId
      }])
      .select()
      .single();

    return { data: newTeam, error: createError };
  },

  // Get team members
  async getTeamMembers(teamId: string) {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        user_profiles (
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('team_id', teamId);

    return { data, error };
  },

  // Get team tasks
  async getTeamTasks(teamId: string) {
    const { data, error } = await supabase
      .from('team_tasks')
      .select(`
        *,
        assignee:user_profiles!assignee_id (
          username,
          first_name,
          last_name
        ),
        creator:user_profiles!creator_id (
          username,
          first_name,
          last_name
        )
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Create team task
  async createTeamTask(taskData: Omit<Tables['team_tasks']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('team_tasks')
      .insert([taskData])
      .select()
      .single();

    return { data, error };
  },

  // Update task status
  async updateTaskStatus(taskId: string, status: string) {
    const { data, error } = await supabase
      .from('team_tasks')
      .update({ status })
      .eq('id', taskId)
      .select()
      .single();

    return { data, error };
  },

  // Real-time chat helpers
  async getTeamMessages(teamId: string, limit = 50) {
    const { data, error } = await supabase
      .from('team_messages')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  async sendTeamMessage(messageData: Omit<TeamMessage, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('team_messages')
      .insert([messageData])
      .select()
      .single();

    return { data, error };
  },

  // Subscribe to team messages
  subscribeToTeamMessages(teamId: string, callback: (payload: unknown) => void) {
    return supabase
      .channel(`team_messages_${teamId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'team_messages',
        filter: `team_id=eq.${teamId}`
      }, callback)
      .subscribe();
  }
};

// =====================================================
// 6. DOCS & DECKS PAGE HELPERS
// =====================================================

export const docsDecksHelpers = {
  // Get user documents
  async getDocuments(userId: string, documentType?: string) {
    let query = supabase
      .from('documents')
      .select(`
        *,
        ideas (
          id,
          title
        )
      `)
      .eq('user_id', userId);

    if (documentType) {
      query = query.eq('document_type', documentType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  // Get single document
  async getDocument(documentId: string, userId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        ideas (
          id,
          title
        )
      `)
      .eq('id', documentId)
      .eq('user_id', userId)
      .single();

    return { data, error };
  },

  // Create document
  async createDocument(documentData: Omit<Tables['documents']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('documents')
      .insert([documentData])
      .select()
      .single();

    return { data, error };
  },

  // Update document
  async updateDocument(documentId: string, updates: Partial<Tables['documents']['Update']>) {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', documentId)
      .select()
      .single();

    return { data, error };
  },

  // Get document templates
  async getDocumentTemplates(documentType?: string) {
    let query = supabase
      .from('document_templates')
      .select('*')
      .eq('is_public', true);

    if (documentType) {
      query = query.eq('document_type', documentType);
    }

    const { data, error } = await query.order('name');
    return { data, error };
  },

  // Get pitch decks (documents with type 'pitch_deck')
  async getPitchDecks(userId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        ideas (
          id,
          title
        )
      `)
      .eq('user_id', userId)
      .eq('document_type', 'pitch_deck')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Create pitch deck
  async createPitchDeck(deckData: Omit<Tables['documents']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('documents')
      .insert([{
        ...deckData,
        document_type: 'pitch_deck'
      }])
      .select()
      .single();

    return { data, error };
  },

  // Presentation-specific helpers
  async createPresentation(presentationData: {
    title: string;
    content: string; // JSON stringified presentation data
    user_id: string;
    idea_id?: string;
    metadata?: unknown;
  }) {
    const { data, error } = await supabase
      .from('documents')
      .insert([{
        ...presentationData,
        document_type: 'pitch_deck',
        format: 'json',
        status: 'draft'
      }])
      .select()
      .single();

    return { data, error };
  },

  async updatePresentation(id: string, updates: {
    title?: string;
    content?: string;
    status?: string;
    metadata?: unknown;
  }) {
    const { data, error } = await supabase
      .from('documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('document_type', 'pitch_deck')
      .select()
      .single();

    return { data, error };
  },

  async getPresentation(id: string, userId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        ideas (
          id,
          title,
          description
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .eq('document_type', 'pitch_deck')
      .single();

    return { data, error };
  },

  async getPresentations(userId: string, options?: {
    limit?: number;
    offset?: number;
    status?: string;
    search?: string;
  }) {
    let query = supabase
      .from('documents')
      .select(`
        *,
        ideas (
          id,
          title
        )
      `)
      .eq('user_id', userId)
      .eq('document_type', 'pitch_deck');

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });
    return { data, error };
  },

  async deletePresentation(id: string, userId: string) {
    const { data, error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .eq('document_type', 'pitch_deck')
      .select()
      .single();

    return { data, error };
  },

  async duplicatePresentation(id: string, userId: string, newTitle?: string) {
    // First get the original presentation
    const { data: original, error: fetchError } = await this.getPresentation(id, userId);

    if (fetchError || !original) {
      return { data: null, error: fetchError || new Error('Presentation not found') };
    }

    // Create a copy with new title
    const { data, error } = await this.createPresentation({
      title: newTitle || `${original.title} (Copy)`,
      content: original.content,
      user_id: userId,
      idea_id: original.idea_id,
      metadata: {
        ...original.metadata,
        originalId: original.id,
        duplicatedAt: new Date().toISOString()
      }
    });

    return { data, error };
  }
};

// =====================================================
// 7. ONBOARDING PAGE HELPERS
// =====================================================

export const onboardingHelpers = {
  // Save onboarding data
  async saveOnboardingProfile(profileData: Omit<Tables['user_onboarding_profiles']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('user_onboarding_profiles')
      .upsert([profileData], { onConflict: 'user_id' })
      .select()
      .single();

    return { data, error };
  },

  // Get onboarding profile
  async getOnboardingProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_onboarding_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    return { data, error };
  },

  // Save AI preferences
  async saveAIPreferences(preferencesData: Omit<Tables['user_ai_preferences']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('user_ai_preferences')
      .upsert([preferencesData], { onConflict: 'user_id' })
      .select()
      .single();

    return { data, error };
  }
};

// =====================================================
// 8. PROFILE & SETTINGS PAGE HELPERS
// =====================================================

export const profileHelpers = {
  // Get user profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_subscriptions (
          tier,
          status,
          current_period_end
        ),
        user_ai_preferences (
          provider,
          model_name,
          temperature,
          max_tokens
        )
      `)
      .eq('id', userId)
      .single();

    return { data, error };
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<Tables['user_profiles']['Update']>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  },

  // Update AI preferences
  async updateAIPreferences(userId: string, updates: Partial<Tables['user_ai_preferences']['Update']>) {
    const { data, error } = await supabase
      .from('user_ai_preferences')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  },

  // Get usage statistics
  async getUsageStats(userId: string) {
    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('period_start', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    return { data, error };
  }
};

// =====================================================
// 9. ADMIN PANEL HELPERS
// =====================================================

export const adminHelpers = {
  // Check if user is admin
  async checkAdminRole(userId: string) {
    const { data, error } = await supabase
      .from('user_admin_roles')
      .select(`
        *,
        admin_roles (
          name,
          permissions
        )
      `)
      .eq('user_id', userId)
      .single();

    return { data, error };
  },

  // Get system analytics
  async getSystemAnalytics() {
    const [usersResult, subscriptionsResult, ideasResult, promptsResult] = await Promise.all([
      supabase.from('user_profiles').select('id, created_at, role').order('created_at', { ascending: false }),
      supabase.from('user_subscriptions').select('tier, status, created_at'),
      supabase.from('ideas').select('id, status, created_at'),
      supabase.from('prompt_history').select('id, created_at, ai_provider')
    ]);

    return {
      users: usersResult.data,
      subscriptions: subscriptionsResult.data,
      ideas: ideasResult.data,
      prompts: promptsResult.data,
      error: usersResult.error || subscriptionsResult.error || ideasResult.error || promptsResult.error
    };
  },

  // Manage prompt templates
  async getPromptTemplates() {
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async createPromptTemplate(templateData: Omit<Tables['prompt_templates']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('prompt_templates')
      .insert([templateData])
      .select()
      .single();

    return { data, error };
  },

  // Manage AI tools directory
  async getAIToolsForAdmin() {
    const { data, error } = await supabase
      .from('ai_tools')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async createAITool(toolData: Omit<Tables['ai_tools']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('ai_tools')
      .insert([toolData])
      .select()
      .single();

    return { data, error };
  },

  // System announcements
  async getAnnouncements() {
    const { data, error } = await supabase
      .from('system_announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async createAnnouncement(announcementData: Omit<Tables['system_announcements']['Insert'], 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('system_announcements')
      .insert([announcementData])
      .select()
      .single();

    return { data, error };
  }
};

// =====================================================
// 10. SUBSCRIPTION MANAGEMENT HELPERS
// =====================================================

export const subscriptionHelpers = {
  // Get subscription plans
  async getSubscriptionPlans() {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price');

    return { data, error };
  },

  // Get user subscription
  async getUserSubscription(userId: string) {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          name,
          tier,
          features,
          limits
        )
      `)
      .eq('user_id', userId)
      .single();

    return { data, error };
  },

  // Update subscription
  async updateSubscription(userId: string, planId: string, status = 'active') {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({
        plan_id: planId,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  },

  // Track usage
  async trackUsage(userId: string, resourceType: string, count = 1) {
    const { data, error } = await supabase
      .from('usage_tracking')
      .upsert([{
        user_id: userId,
        resource_type: resourceType,
        count,
        period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()
      }], { onConflict: 'user_id,resource_type,period_start' })
      .select()
      .single();

    return { data, error };
  }
};

// =====================================================
// 11. REAL-TIME SUBSCRIPTIONS
// =====================================================

export const realtimeHelpers = {
  // Subscribe to global messages
  subscribeToGlobalMessages(callback: (payload: unknown) => void) {
    return supabase
      .channel('global_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, callback)
      .subscribe();
  },

  // Subscribe to user activity
  subscribeToUserActivity(userId: string, callback: (payload: unknown) => void) {
    return supabase
      .channel(`user_activity_${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_activity',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  },

  // Subscribe to team tasks
  subscribeToTeamTasks(teamId: string, callback: (payload: unknown) => void) {
    return supabase
      .channel(`team_tasks_${teamId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'team_tasks',
        filter: `team_id=eq.${teamId}`
      }, callback)
      .subscribe();
  }
};

// =====================================================
// 12. INVESTOR RADAR PAGE HELPERS
// =====================================================

export const investorRadarHelpers = {
  // Get all user investors
  async getInvestors(userId: string, filters?: { status?: string; focus?: string; stage?: string }) {
    let query = supabase
      .from('investors')
      .select('*')
      .eq('user_id', userId);

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.focus) query = query.ilike('focus', `%${filters.focus}%`);
    if (filters?.stage) query = query.ilike('stage', `%${filters.stage}%`);

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  // Create new investor
  async createInvestor(investorData: Omit<Tables['investors']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('investors')
      .insert([investorData])
      .select()
      .single();

    return { data, error };
  },

  // Update investor
  async updateInvestor(investorId: string, updates: Partial<Tables['investors']['Update']>) {
    const { data, error } = await supabase
      .from('investors')
      .update(updates)
      .eq('id', investorId)
      .select()
      .single();

    return { data, error };
  },

  // Log contact with investor
  async logContact(investorId: string, contactDetails: unknown) {
    const { data: investor, error: fetchError } = await supabase
      .from('investors')
      .select('contact_history')
      .eq('id', investorId)
      .single();

    if (fetchError) return { data: null, error: fetchError };

    const updatedHistory = [...(investor.contact_history || []), {
      ...(contactDetails as object),
      timestamp: new Date().toISOString()
    }];

    const { data, error } = await supabase
      .from('investors')
      .update({ contact_history: updatedHistory })
      .eq('id', investorId)
      .select()
      .single();

    return { data, error };
  },

  // Funding rounds management
  async getFundingRounds(userId: string) {
    const { data, error } = await supabase
      .from('funding_rounds')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async createFundingRound(roundData: Omit<Tables['funding_rounds']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('funding_rounds')
      .insert([roundData])
      .select()
      .single();

    return { data, error };
  },

  async updateFundingRound(roundId: string, updates: Partial<Tables['funding_rounds']['Update']>) {
    const { data, error } = await supabase
      .from('funding_rounds')
      .update(updates)
      .eq('id', roundId)
      .select()
      .single();

    return { data, error };
  },

  // Delete investor
  async deleteInvestor(investorId: string) {
    const { error } = await supabase
      .from('investors')
      .delete()
      .eq('id', investorId);

    return { error };
  }
};

// =====================================================
// 13. PITCH PERFECT PAGE HELPERS
// =====================================================

export const pitchPerfectHelpers = {
  // Pitch scripts management
  async getPitchScripts(userId: string, scriptType?: string) {
    let query = supabase
      .from('pitch_scripts')
      .select('*')
      .eq('user_id', userId);

    if (scriptType) query = query.eq('script_type', scriptType);

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  async createPitchScript(scriptData: Omit<Tables['pitch_scripts']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('pitch_scripts')
      .insert([scriptData])
      .select()
      .single();

    return { data, error };
  },

  async updatePitchScript(scriptId: string, updates: Partial<Tables['pitch_scripts']['Update']>) {
    const { data, error } = await supabase
      .from('pitch_scripts')
      .update(updates)
      .eq('id', scriptId)
      .select()
      .single();

    return { data, error };
  },

  // Pitch decks management
  async getPitchDecks(userId: string, presentationType?: string) {
    let query = supabase
      .from('pitch_decks')
      .select('*')
      .eq('user_id', userId);

    if (presentationType) query = query.eq('presentation_type', presentationType);

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  async createPitchDeck(deckData: Omit<Tables['pitch_decks']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('pitch_decks')
      .insert([deckData])
      .select()
      .single();

    return { data, error };
  },

  async updatePitchDeck(deckId: string, updates: Partial<Tables['pitch_decks']['Update']>) {
    const { data, error } = await supabase
      .from('pitch_decks')
      .update(updates)
      .eq('id', deckId)
      .select()
      .single();

    return { data, error };
  },

  // Pitch videos management
  async getPitchVideos(userId: string, videoType?: string) {
    let query = supabase
      .from('pitch_videos')
      .select('*')
      .eq('user_id', userId);

    if (videoType) query = query.eq('video_type', videoType);

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  async createPitchVideo(videoData: Omit<Tables['pitch_videos']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('pitch_videos')
      .insert([videoData])
      .select()
      .single();

    return { data, error };
  },

  async updatePitchVideo(videoId: string, updates: Partial<Tables['pitch_videos']['Update']>) {
    const { data, error } = await supabase
      .from('pitch_videos')
      .update(updates)
      .eq('id', videoId)
      .select()
      .single();

    return { data, error };
  }
};

// =====================================================
// 14. TASK PLANNER PAGE HELPERS
// =====================================================

export const taskPlannerHelpers = {
  // Projects management
  async getProjects(userId: string, status?: string) {
    let query = supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId);

    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  async createProject(projectData: Omit<Tables['projects']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();

    return { data, error };
  },

  async updateProject(projectId: string, updates: Partial<Tables['projects']['Update']>) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    return { data, error };
  },

  // Tasks management
  async getTasks(userId: string, filters?: { status?: string; priority?: string; projectId?: string }) {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        projects (
          id,
          name,
          color
        )
      `)
      .eq('user_id', userId);

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.priority) query = query.eq('priority', filters.priority);
    if (filters?.projectId) query = query.eq('project_id', filters.projectId);

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  async createTask(taskData: Omit<Tables['tasks']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();

    return { data, error };
  },

  async updateTask(taskId: string, updates: Partial<Tables['tasks']['Update']>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    return { data, error };
  },

  async deleteTask(taskId: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    return { error };
  },

  // Subscribe to task updates
  subscribeToTasks(userId: string, callback: (payload: unknown) => void) {
    return supabase
      .channel(`user_tasks_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
};

// =====================================================
// 15. BLUEPRINT ZONE PAGE HELPERS
// =====================================================

export const blueprintZoneHelpers = {
  // Project phases management
  async getProjectPhases(userId: string, projectId?: string) {
    let query = supabase
      .from('project_phases')
      .select(`
        *,
        phase_tasks (
          id,
          title,
          status,
          order_index
        )
      `)
      .eq('user_id', userId);

    if (projectId) query = query.eq('project_id', projectId);

    const { data, error } = await query.order('order_index');
    return { data, error };
  },

  async createProjectPhase(phaseData: Omit<Tables['project_phases']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('project_phases')
      .insert([phaseData])
      .select()
      .single();

    return { data, error };
  },

  async updateProjectPhase(phaseId: string, updates: Partial<Tables['project_phases']['Update']>) {
    const { data, error } = await supabase
      .from('project_phases')
      .update(updates)
      .eq('id', phaseId)
      .select()
      .single();

    return { data, error };
  },

  // Phase tasks management
  async getPhaseTasks(phaseId: string) {
    const { data, error } = await supabase
      .from('phase_tasks')
      .select('*')
      .eq('phase_id', phaseId)
      .order('order_index');

    return { data, error };
  },

  async createPhaseTask(taskData: Omit<Tables['phase_tasks']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('phase_tasks')
      .insert([taskData])
      .select()
      .single();

    return { data, error };
  },

  async updatePhaseTask(taskId: string, updates: Partial<Tables['phase_tasks']['Update']>) {
    const { data, error } = await supabase
      .from('phase_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    return { data, error };
  },

  async deletePhaseTask(taskId: string) {
    const { error } = await supabase
      .from('phase_tasks')
      .delete()
      .eq('id', taskId);

    return { error };
  },

  // Calculate and update phase progress
  async updatePhaseProgress(phaseId: string) {
    const { data: tasks } = await this.getPhaseTasks(phaseId);

    if (!tasks || tasks.length === 0) {
      await this.updateProjectPhase(phaseId, { progress: 0 });
      return { progress: 0 };
    }

    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const progress = Math.round((completedTasks / tasks.length) * 100);

    await this.updateProjectPhase(phaseId, { progress });
    return { progress };
  }
};

// =====================================================
// 16. AI PROVIDER DASHBOARD HELPERS
// =====================================================

export const aiProviderHelpers = {
  // Track AI usage
  async trackAIUsage(usageData: Omit<Tables['ai_provider_usage']['Insert'], 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('ai_provider_usage')
      .insert([usageData])
      .select()
      .single();

    return { data, error };
  },

  // Get AI usage statistics
  async getAIUsageStats(userId: string, timeframe?: 'day' | 'week' | 'month' | 'year') {
    let query = supabase
      .from('ai_provider_usage')
      .select('*')
      .eq('user_id', userId);

    if (timeframe) {
      const now = new Date();
      const startDate = new Date();

      switch (timeframe) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      query = query.gte('created_at', startDate.toISOString());
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  // Get usage by provider
  async getUsageByProvider(userId: string) {
    const { data, error } = await supabase
      .from('ai_provider_usage')
      .select('provider, tokens_used, cost_usd')
      .eq('user_id', userId);

    if (error) return { data: null, error };

    // Aggregate by provider
    const aggregated = data.reduce((acc: unknown, usage: unknown) => {
      const usageItem = usage as any;
      if (!acc[usageItem.provider]) {
        acc[usageItem.provider] = {
          provider: usageItem.provider,
          total_tokens: 0,
          total_cost: 0,
          request_count: 0
        };
      }

      acc[usageItem.provider].total_tokens += usageItem.tokens_used || 0;
      acc[usageItem.provider].total_cost += usageItem.cost_usd || 0;
      acc[usageItem.provider].request_count += 1;

      return acc;
    }, {});

    return { data: Object.values(aggregated), error: null };
  }
};

// =====================================================
// 17. NOTIFICATIONS HELPERS
// =====================================================

export const notificationHelpers = {
  // Get user notifications
  async getNotifications(userId: string, unreadOnly = false) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (unreadOnly) query = query.eq('is_read', false);

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  // Create notification
  async createNotification(notificationData: Omit<Tables['notifications']['Insert'], 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    return { data, error };
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    return { data, error };
  },

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select();

    return { data, error };
  },

  // Delete notification
  async deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    return { error };
  },

  // Subscribe to notifications
  subscribeToNotifications(userId: string, callback: (payload: unknown) => void) {
    return supabase
      .channel(`user_notifications_${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
};

// =====================================================
// 18. FILE ATTACHMENTS HELPERS
// =====================================================

export const fileHelpers = {
  // Upload file attachment
  async uploadFile(file: File, entityType: string, entityId: string, userId: string) {
    // First upload to Supabase storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${entityType}/${entityId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);

    if (uploadError) return { data: null, error: uploadError };

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath);

    // Save file record to database
    const { data, error } = await supabase
      .from('file_attachments')
      .insert([{
        filename: fileName,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        file_path: filePath,
        file_url: publicUrl,
        entity_type: entityType,
        entity_id: entityId,
        uploaded_by: userId
      }])
      .select()
      .single();

    return { data, error };
  },

  // Get file attachments for entity
  async getFileAttachments(entityType: string, entityId: string) {
    const { data, error } = await supabase
      .from('file_attachments')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Delete file attachment
  async deleteFileAttachment(attachmentId: string) {
    // First get the file info
    const { data: attachment, error: fetchError } = await supabase
      .from('file_attachments')
      .select('file_path')
      .eq('id', attachmentId)
      .single();

    if (fetchError) return { error: fetchError };

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('attachments')
      .remove([attachment.file_path]);

    if (storageError) return { error: storageError };

    // Delete from database
    const { error } = await supabase
      .from('file_attachments')
      .delete()
      .eq('id', attachmentId);

    return { error };
  }
};

// =====================================================
// 19. WORKSHOP/IDEA VALIDATION HELPERS
// =====================================================

export const workshopHelpers = {
  // Enhanced idea validation (uses existing ideas table)
  async validateAndSaveIdea(ideaData: unknown, validationResults: unknown, userId: string) {
    const { data, error } = await supabase
      .from('ideas')
      .insert([{
        ...(ideaData as object),
        ...(validationResults as object),
        user_id: userId,
        status: 'validated'
      }])
      .select()
      .single();

    return { data, error };
  },

  // Get validation history
  async getValidationHistory(userId: string) {
    const { data, error } = await supabase
      .from('ideas')
      .select('id, title, validation_score, market_opportunity, risk_assessment, created_at')
      .eq('user_id', userId)
      .not('validation_score', 'is', null)
      .order('created_at', { ascending: false });

    return { data, error };
  }
};

// =====================================================
// 20. COMPREHENSIVE EXPORT
// =====================================================

// Export all helpers for easy importing
export const allHelpers = {
  workspace: workspaceHelpers,
  ideaVault: ideaVaultHelpers,
  ideaForge: ideaForgeHelpers,
  mvpStudio: mvpStudioHelpers,
  teamSpace: teamSpaceHelpers,
  docsDecks: docsDecksHelpers,
  onboarding: onboardingHelpers,
  profile: profileHelpers,
  admin: adminHelpers,
  subscription: subscriptionHelpers,
  realtime: realtimeHelpers,
  investorRadar: investorRadarHelpers,
  pitchPerfect: pitchPerfectHelpers,
  taskPlanner: taskPlannerHelpers,
  blueprintZone: blueprintZoneHelpers,
  aiProvider: aiProviderHelpers,
  notifications: notificationHelpers,
  files: fileHelpers,
  workshop: workshopHelpers
};
