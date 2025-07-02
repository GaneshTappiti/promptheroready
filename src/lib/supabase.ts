import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Please check your environment variables.');
}

// Database connection string for session pooler - should be set via environment variables
const dbConnectionString = import.meta.env.VITE_DATABASE_URL || '';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'pitch-perfect-auth',
    // Enhanced security configuration
    flowType: 'pkce', // Use PKCE flow for better security
    debug: process.env.NODE_ENV === 'development',
    storage: {
      getItem: (key) => {
        try {
          return JSON.parse(localStorage.getItem(key) || 'null');
        } catch (error) {
          console.error('Error reading from localStorage:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.error('Error writing to localStorage:', error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing from localStorage:', error);
        }
      },
    },
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-connection-pool': 'true',
      'x-client-info': 'pitch-perfect-engine',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Rate limiting for realtime events
    },
  },
});

// Helper functions for common Supabase operations
export const supabaseHelpers = {
  // Auth helpers
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  },

  async signUp(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { data, error };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  },

  // Data helpers
  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true });
    return { data, error };
  },

  async createProject(project: any) {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select();
    return { data, error };
  },

  async createTask(task: any) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select();
    return { data, error };
  },

  // Real-time subscriptions
  subscribeToProjects(callback: (payload: any) => void) {
    return supabase
      .channel('projects_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, callback)
      .subscribe();
  },

  subscribeToTasks(callback: (payload: any) => void) {
    return supabase
      .channel('tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, callback)
      .subscribe();
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

  async createIdea(idea: any) {
    const { data, error } = await supabase
      .from('ideas')
      .insert([idea])
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

  async createMVP(mvp: any) {
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

  async createDocument(document: any) {
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

  async createTeamMember(member: any) {
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

  async createInvestor(investor: any) {
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

  async createWikiPage(page: any) {
    const { data, error } = await supabase
      .from('wiki_pages')
      .insert([page])
      .select();
    return { data, error };
  },

  // Real-time subscriptions for all tables
  subscribeToIdeas(callback: (payload: any) => void) {
    return supabase
      .channel('ideas_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ideas' }, callback)
      .subscribe();
  },

  subscribeToMVPs(callback: (payload: any) => void) {
    return supabase
      .channel('mvps_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mvps' }, callback)
      .subscribe();
  },

  subscribeToDocuments(callback: (payload: any) => void) {
    return supabase
      .channel('documents_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, callback)
      .subscribe();
  },

  subscribeToTeamMembers(callback: (payload: any) => void) {
    return supabase
      .channel('team_members_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, callback)
      .subscribe();
  },

  subscribeToInvestors(callback: (payload: any) => void) {
    return supabase
      .channel('investors_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'investors' }, callback)
      .subscribe();
  },

  subscribeToWikiPages(callback: (payload: any) => void) {
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

  subscribeToTeamMessages(teamId: string, callback: (payload: any) => void) {
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

  subscribeToTypingIndicators(teamId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`typing_${teamId}`)
      .on('broadcast', { event: 'typing' }, callback)
      .on('broadcast', { event: 'stop_typing' }, callback)
      .subscribe();
  },
};

// Test function to verify Supabase connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('projects').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};

// Test data functions removed for production