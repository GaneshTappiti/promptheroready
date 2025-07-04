import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// =====================================================
// SUPABASE CONFIGURATION & CLIENT SETUP
// =====================================================

// Environment variables with validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
// const dbConnectionString = import.meta.env.VITE_DATABASE_URL || '';

// Configuration validation
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please check your environment variables.');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_KEY');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('❌ Invalid Supabase URL format:', supabaseUrl);
}



// Create typed Supabase client
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'promptheroready-auth',
      flowType: 'pkce' as const,
      debug: import.meta.env.DEV,
      storage: {
        getItem: (key: string) => {
          try {
            if (typeof localStorage === 'undefined') return null;
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
          } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
          }
        },
        setItem: (key: string, value: unknown) => {
          try {
            if (typeof localStorage === 'undefined') return;
            localStorage.setItem(key, JSON.stringify(value));
          } catch (error) {
            console.error('Error writing to localStorage:', error);
          }
        },
        removeItem: (key: string) => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.error('Error removing from localStorage:', error);
          }
        },
      },
    },
    db: {
      schema: 'public' as const,
    },
    global: {
      headers: {
        'x-connection-pool': 'true',
        'x-client-info': 'promptheroready-v1.0',
        'x-client-version': '1.0.0',
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// =====================================================
// CONNECTION HEALTH & MONITORING
// =====================================================

// Connection health check
export const checkSupabaseConnection = async (): Promise<{
  isConnected: boolean;
  latency?: number;
  error?: string;
}> => {
  const startTime = performance.now();

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
      .single();

    const latency = performance.now() - startTime;

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      return {
        isConnected: false,
        latency,
        error: (error as Error).message
      };
    }

    return {
      isConnected: true,
      latency
    };
  } catch (error) {
    return {
      isConnected: false,
      latency: performance.now() - startTime,
      error: error instanceof Error ? (error as Error).message : 'Unknown error'
    };
  }
};

// Enhanced error handler with retry logic
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (attempt === maxRetries) {
        console.error(`Operation failed after ${maxRetries} attempts:`, lastError);
        throw lastError;
      }

      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message);
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
};

// Connection pool monitoring
export const getConnectionStats = async () => {
  try {
    const { data, error } = await supabase.rpc('get_connection_stats');

    if (error) {
      console.warn('Could not fetch connection stats:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Connection stats not available:', error);
    return null;
  }
};

// Performance monitoring
export const logPerformanceMetric = (
  operation: string,
  duration: number,
  success: boolean,
  metadata?: Record<string, any>
) => {
  if (import.meta.env.DEV) {
    console.log(`🔍 Performance: ${operation}`, {
      duration: `${duration.toFixed(2)}ms`,
      success,
      ...metadata
    });
  }

  // In production, you might want to send this to an analytics service
  if (!import.meta.env.DEV && duration > 5000) {
    console.warn(`⚠️ Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
  }
};

// =====================================================
// ENHANCED HELPER FUNCTIONS WITH TYPE SAFETY
// =====================================================

// Type definitions for helper responses
type SupabaseResponse<T> = {
  data: T | null;
  error: unknown;
  performance?: {
    duration: number;
    operation: string;
  };
};

// Enhanced helper functions with performance monitoring and error handling
export const supabaseHelpers = {
  // =====================================================
  // AUTHENTICATION HELPERS
  // =====================================================

  async signIn(email: string, password: string): Promise<SupabaseResponse<any>> {
    const startTime = performance.now();
    const operation = 'auth.signIn';

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, !error);

      if (error) {
        console.error('❌ Sign in failed:', (error as Error).message);
      } else {
        console.log('✅ User signed in successfully');
      }

      return {
        data,
        error,
        performance: { duration, operation }
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, false);
      console.error('❌ Sign in error:', error);
      return {
        data: null,
        error,
        performance: { duration, operation }
      };
    }
  },

  async signUp(email: string, password: string, metadata?: Record<string, any>): Promise<SupabaseResponse<any>> {
    const startTime = performance.now();
    const operation = 'auth.signUp';

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: metadata,
        },
      });

      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, !error);

      if (error) {
        console.error('❌ Sign up failed:', (error as Error).message);
      } else {
        console.log('✅ User signed up successfully');
      }

      return {
        data,
        error,
        performance: { duration, operation }
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, false);
      console.error('❌ Sign up error:', error);
      return {
        data: null,
        error,
        performance: { duration, operation }
      };
    }
  },

  async signOut(): Promise<SupabaseResponse<null>> {
    const startTime = performance.now();
    const operation = 'auth.signOut';

    try {
      const { error } = await supabase.auth.signOut();

      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, !error);

      if (error) {
        console.error('❌ Sign out failed:', (error as Error).message);
      } else {
        console.log('✅ User signed out successfully');
      }

      return {
        data: null,
        error,
        performance: { duration, operation }
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, false);
      console.error('❌ Sign out error:', error);
      return {
        data: null,
        error,
        performance: { duration, operation }
      };
    }
  },

  async getCurrentUser() {
    const startTime = performance.now();
    const operation = 'auth.getUser';

    try {
      const { data, error } = await supabase.auth.getUser();

      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, !error);

      return {
        data: data.user,
        error,
        performance: { duration, operation }
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, false);
      console.error('❌ Get user error:', error);
      return {
        data: null,
        error,
        performance: { duration, operation }
      };
    }
  },

  async resetPassword(email: string): Promise<SupabaseResponse<null>> {
    const startTime = performance.now();
    const operation = 'auth.resetPassword';

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, !error);

      return {
        data: null,
        error,
        performance: { duration, operation }
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, false);
      console.error('❌ Reset password error:', error);
      return {
        data: null,
        error,
        performance: { duration, operation }
      };
    }
  },

  // =====================================================
  // DATA HELPERS WITH ENHANCED ERROR HANDLING
  // =====================================================

  async getProjects(userId?: string): Promise<SupabaseResponse<any[]>> {
    const startTime = performance.now();
    const operation = 'projects.getAll';

    try {
      let query = supabase
        .from('projects')
        .select(`
          *,
          owner:user_profiles!projects_owner_id_fkey(id, username, avatar_url),
          team:teams(id, name)
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('owner_id', userId);
      }

      const { data, error } = await query;

      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, !error, { count: data?.length });

      if (error) {
        console.error('❌ Failed to fetch projects:', (error as Error).message);
      }

      return {
        data: data || [],
        error,
        performance: { duration, operation }
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, false);
      console.error('❌ Get projects error:', error);
      return {
        data: [],
        error,
        performance: { duration, operation }
      };
    }
  },

  async getTasks(projectId?: string, userId?: string): Promise<SupabaseResponse<any[]>> {
    const startTime = performance.now();
    const operation = 'tasks.getAll';

    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          project:projects(id, name),
          assignee:user_profiles!tasks_assigned_to_fkey(id, username, avatar_url)
        `)
        .order('due_date', { ascending: true, nullsFirst: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      if (userId) {
        query = query.eq('assigned_to', userId);
      }

      const { data, error } = await query;

      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, !error, { count: data?.length });

      if (error) {
        console.error('❌ Failed to fetch tasks:', (error as Error).message);
      }

      return {
        data: data || [],
        error,
        performance: { duration, operation }
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, false);
      console.error('❌ Get tasks error:', error);
      return {
        data: [],
        error,
        performance: { duration, operation }
      };
    }
  },

  async createProject(project: Database['public']['Tables']['projects']['Insert']): Promise<SupabaseResponse<any>> {
    const startTime = performance.now();
    const operation = 'projects.create';

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...project,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          *,
          owner:user_profiles!projects_owner_id_fkey(id, username, avatar_url)
        `)
        .single();

      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, !error);

      if (error) {
        console.error('❌ Failed to create project:', (error as Error).message);
      } else {
        console.log('✅ Project created successfully:', data.name);
      }

      return {
        data,
        error,
        performance: { duration, operation }
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, false);
      console.error('❌ Create project error:', error);
      return {
        data: null,
        error,
        performance: { duration, operation }
      };
    }
  },

  async createTask(task: Database['public']['Tables']['tasks']['Insert']): Promise<SupabaseResponse<any>> {
    const startTime = performance.now();
    const operation = 'tasks.create';

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...task,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          *,
          project:projects(id, name),
          assignee:user_profiles!tasks_assigned_to_fkey(id, username, avatar_url)
        `)
        .single();

      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, !error);

      if (error) {
        console.error('❌ Failed to create task:', (error as Error).message);
      } else {
        console.log('✅ Task created successfully:', data.title);
      }

      return {
        data,
        error,
        performance: { duration, operation }
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, false);
      console.error('❌ Create task error:', error);
      return {
        data: null,
        error,
        performance: { duration, operation }
      };
    }
  },

  async updateProject(id: string, updates: Database['public']['Tables']['projects']['Update']): Promise<SupabaseResponse<any>> {
    const startTime = performance.now();
    const operation = 'projects.update';

    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          owner:user_profiles!projects_owner_id_fkey(id, username, avatar_url)
        `)
        .single();

      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, !error);

      if (error) {
        console.error('❌ Failed to update project:', (error as Error).message);
      } else {
        console.log('✅ Project updated successfully:', data.name);
      }

      return {
        data,
        error,
        performance: { duration, operation }
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, false);
      console.error('❌ Update project error:', error);
      return {
        data: null,
        error,
        performance: { duration, operation }
      };
    }
  },

  async deleteProject(id: string): Promise<SupabaseResponse<null>> {
    const startTime = performance.now();
    const operation = 'projects.delete';

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, !error);

      if (error) {
        console.error('❌ Failed to delete project:', (error as Error).message);
      } else {
        console.log('✅ Project deleted successfully');
      }

      return {
        data: null,
        error,
        performance: { duration, operation }
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      logPerformanceMetric(operation, duration, false);
      console.error('❌ Delete project error:', error);
      return {
        data: null,
        error,
        performance: { duration, operation }
      };
    }
  },

  // =====================================================
  // REAL-TIME SUBSCRIPTIONS WITH ERROR HANDLING
  // =====================================================

  subscribeToProjects(
    callback: (payload: unknown) => void,
    errorCallback?: (error: unknown) => void
  ) {
    const channel = supabase
      .channel('projects_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects'
      }, (payload) => {
        try {
          callback(payload);
        } catch (error) {
          console.error('❌ Projects subscription callback error:', error);
          errorCallback?.(error);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to projects changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Projects subscription error');
          errorCallback?.(new Error('Subscription failed'));
        }
      });

    return channel;
  },

  subscribeToTasks(
    callback: (payload: unknown) => void,
    errorCallback?: (error: unknown) => void
  ) {
    const channel = supabase
      .channel('tasks_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks'
      }, (payload) => {
        try {
          callback(payload);
        } catch (error) {
          console.error('❌ Tasks subscription callback error:', error);
          errorCallback?.(error);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to tasks changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Tasks subscription error');
          errorCallback?.(new Error('Subscription failed'));
        }
      });

    return channel;
  },

  // Enhanced subscription with user filtering
  subscribeToUserData(
    userId: string,
    tables: string[],
    callback: (payload: unknown) => void,
    errorCallback?: (error: unknown) => void
  ) {
    const channels = tables.map(table => {
      return supabase
        .channel(`${table}_user_${userId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table,
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          try {
            callback({ ...payload, table });
          } catch (error) {
            console.error(`❌ ${table} subscription callback error:`, error);
            errorCallback?.(error);
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`✅ Subscribed to ${table} changes for user ${userId}`);
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`❌ ${table} subscription error for user ${userId}`);
            errorCallback?.(new Error(`${table} subscription failed`));
          }
        });
    });

    return {
      channels,
      unsubscribe: () => {
        channels.forEach(channel => {
          supabase.removeChannel(channel);
        });
      }
    };
  },

  // Additional helper functions for all pages
  // Idea Vault helpers
  async getIdeas() {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createIdea(idea: unknown) {
    const { data, error } = await supabase
      .from('ideas')
      .insert([idea])
      .select();
    return { data, error };
  },

  async updateIdea(ideaId: string, updates: unknown) {
    const { data, error } = await supabase
      .from('ideas')
      .update(updates)
      .eq('id', ideaId)
      .select();
    return { data, error };
  },

  // MVP Studio helpers
  async getMVPs() {
    const { data, error } = await supabase
      .from('mvps')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createMVP(mvp: unknown) {
    const { data, error } = await supabase
      .from('mvps')
      .insert([mvp])
      .select();
    return { data, error };
  },

  // Docs & Decks helpers
  async getDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false });
    return { data, error };
  },

  async createDocument(document: unknown) {
    const { data, error } = await supabase
      .from('documents')
      .insert([document])
      .select();
    return { data, error };
  },

  // Team Space helpers
  async getTeamMembers() {
    const { data, error } = await supabase
      .from('team_members')
      .select('*');
    return { data, error };
  },

  async createTeamMember(member: unknown) {
    const { data, error } = await supabase
      .from('team_members')
      .insert([member])
      .select();
    return { data, error };
  },

  // Investor Radar helpers
  async getInvestors() {
    const { data, error } = await supabase
      .from('investors')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createInvestor(investor: unknown) {
    const { data, error } = await supabase
      .from('investors')
      .insert([investor])
      .select();
    return { data, error };
  },

  // Idea Wiki helpers
  async getWikiPages() {
    const { data, error } = await supabase
      .from('wiki_pages')
      .select('*')
      .order('updated_at', { ascending: false });
    return { data, error };
  },

  async createWikiPage(page: unknown) {
    const { data, error } = await supabase
      .from('wiki_pages')
      .insert([page])
      .select();
    return { data, error };
  },

  // Real-time subscriptions for all tables
  subscribeToIdeas(callback: (payload: unknown) => void) {
    return supabase
      .channel('ideas_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ideas' }, callback)
      .subscribe();
  },

  subscribeToMVPs(callback: (payload: unknown) => void) {
    return supabase
      .channel('mvps_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mvps' }, callback)
      .subscribe();
  },

  subscribeToDocuments(callback: (payload: unknown) => void) {
    return supabase
      .channel('documents_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, callback)
      .subscribe();
  },

  subscribeToTeamMembers(callback: (payload: unknown) => void) {
    return supabase
      .channel('team_members_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, callback)
      .subscribe();
  },

  subscribeToInvestors(callback: (payload: unknown) => void) {
    return supabase
      .channel('investors_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'investors' }, callback)
      .subscribe();
  },

  subscribeToWikiPages(callback: (payload: unknown) => void) {
    return supabase
      .channel('wiki_pages_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wiki_pages' }, callback)
      .subscribe();
  },

  // Enhanced Team Messages helpers
  async getTeamMessages(teamId: string) {
    const { data, error } = await supabase
      .from('team_messages')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: true });
    return { data, error };
  },

  async sendTeamMessage(message: {
    sender_id: string;
    sender_name: string;
    content: string;
    avatar: string;
    country: string;
    is_authenticated: boolean;
    team_id: string;
    is_system_message?: boolean;
  }) {
    const { data, error } = await supabase
      .from('team_messages')
      .insert([message])
      .select();
    return { data, error };
  },

  async deleteTeamMessage(messageId: number) {
    const { data, error } = await supabase
      .from('team_messages')
      .delete()
      .eq('id', messageId);
    return { data, error };
  },

  async updateTeamMessage(messageId: number, content: string) {
    const { data, error } = await supabase
      .from('team_messages')
      .update({ content })
      .eq('id', messageId)
      .select();
    return { data, error };
  },

  subscribeToTeamMessages(teamId: string, callback: (payload: unknown) => void) {
    return supabase
      .channel(`team_messages_${teamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_messages',
          filter: `team_id=eq.${teamId}`
        },
        callback
      )
      .subscribe();
  },

  // Real-time presence for typing indicators
  subscribeToTeamPresence(teamId: string, userId: string, userName: string) {
    const channel = supabase.channel(`team_presence_${teamId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    // Track user presence
    channel.on('presence', { event: 'sync' }, () => {
      const newState = channel.presenceState();
      console.log('Presence sync:', newState);
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    });

    // Subscribe and track this user
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          user_name: userName,
          online_at: new Date().toISOString(),
        });
      }
    });

    return channel;
  },

  // Typing indicators
  async sendTypingIndicator(teamId: string, userId: string, userName: string, isTyping: boolean) {
    const channel = supabase.channel(`typing_${teamId}`);

    if (isTyping) {
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: userId,
          user_name: userName,
          team_id: teamId,
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      await channel.send({
        type: 'broadcast',
        event: 'stop_typing',
        payload: {
          user_id: userId,
          user_name: userName,
          team_id: teamId,
        },
      });
    }

    return channel;
  },

  subscribeToTypingIndicators(teamId: string, callback: (payload: unknown) => void) {
    return supabase
      .channel(`typing_${teamId}`)
      .on('broadcast', { event: 'typing' }, callback)
      .on('broadcast', { event: 'stop_typing' }, callback)
      .subscribe();
  },
};

// =====================================================
// CONNECTION TESTING & VALIDATION
// =====================================================

// Enhanced connection test with detailed diagnostics
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  details: {
    connection: boolean;
    authentication: boolean;
    database: boolean;
    realtime: boolean;
  };
  errors: string[];
  performance: {
    connectionTime: number;
    queryTime: number;
  };
}> => {
  const startTime = performance.now();
  const errors: string[] = [];
  const details = {
    connection: false,
    authentication: false,
    database: false,
    realtime: false
  };

  try {
    // Test 1: Basic connection
    const connectionResult = await checkSupabaseConnection();
    details.connection = connectionResult.isConnected;

    if (!connectionResult.isConnected) {
      errors.push(`Connection failed: ${connectionResult.error}`);
    }

    const connectionTime = performance.now() - startTime;

    // Test 2: Authentication check
    try {
      const { data: user } = await supabase.auth.getUser();
      details.authentication = true;
      console.log('✅ Authentication system working');
    } catch (error) {
      errors.push('Authentication system error');
      console.warn('⚠️ Authentication test failed (this is normal if not logged in)');
    }

    // Test 3: Database query
    const queryStartTime = performance.now();
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (!error) {
        details.database = true;
        console.log('✅ Database queries working');
      } else {
        errors.push(`Database query failed: ${(error as Error).message}`);
      }
    } catch (error) {
      errors.push('Database connection failed');
    }

    const queryTime = performance.now() - queryStartTime;

    // Test 4: Real-time capabilities
    try {
      const channel = supabase.channel('connection_test');
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Real-time connection timeout'));
        }, 5000);

        channel.subscribe((status) => {
          clearTimeout(timeout);
          if (status === 'SUBSCRIBED') {
            details.realtime = true;
            console.log('✅ Real-time subscriptions working');
            resolve(true);
          } else {
            reject(new Error(`Real-time subscription failed: ${status}`));
          }
        });
      });

      supabase.removeChannel(channel);
    } catch (error) {
      errors.push('Real-time connection failed');
      console.warn('⚠️ Real-time test failed:', error);
    }

    const success = details.connection && details.database;

    if (success) {
      console.log('🎉 Supabase connection test passed!');
    } else {
      console.error('❌ Supabase connection test failed');
    }

    return {
      success,
      details,
      errors,
      performance: {
        connectionTime,
        queryTime
      }
    };

  } catch (error) {
    const connectionTime = performance.now() - startTime;
    errors.push(`Connection test failed: ${error instanceof Error ? (error as Error).message : 'Unknown error'}`);

    return {
      success: false,
      details,
      errors,
      performance: {
        connectionTime,
        queryTime: 0
      }
    };
  }
};

// Initialize connection monitoring
export const initializeSupabaseMonitoring = () => {
  if (import.meta.env.DEV) {
    console.log('🔧 Initializing Supabase monitoring...');

    // Test connection on startup
    testSupabaseConnection().then(result => {
      if (result.success) {
        console.log('✅ Supabase initialization successful');
      } else {
        console.error('❌ Supabase initialization failed:', result.errors);
      }
    });

    // Monitor auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.email || 'No user');
    });
  }
};

// Auto-initialize monitoring in development (client-side only)
if (import.meta.env.DEV && typeof window !== 'undefined') {
  initializeSupabaseMonitoring();
}

// Export types for use in other files
export type { Database } from '@/types/database';
export type SupabaseClient = typeof supabase;
