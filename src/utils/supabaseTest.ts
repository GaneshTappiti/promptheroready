// Test utility to verify Supabase connection and chat functionality
import { supabase } from '@/lib/supabase';

export interface TestResult {
  test: string;
  success: boolean;
  message: string;
  data?: any;
}

export class SupabaseTestSuite {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    this.results = [];
    
    console.log('🧪 Starting Supabase Test Suite...');
    
    await this.testConnection();
    await this.testMessagesTable();
    await this.testInsertMessage();
    await this.testRealtimeSubscription();
    await this.testAuth();
    
    console.log('✅ Test Suite Complete!');
    return this.results;
  }

  private addResult(test: string, success: boolean, message: string, data?: any) {
    this.results.push({ test, success, message, data });
    console.log(`${success ? '✅' : '❌'} ${test}: ${message}`);
  }

  async testConnection(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      
      this.addResult(
        'Supabase Connection',
        true,
        'Successfully connected to Supabase',
        data
      );
    } catch (error: any) {
      this.addResult(
        'Supabase Connection',
        false,
        `Connection failed: ${error.message}`,
        error
      );
    }
  }

  async testMessagesTable(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .limit(5);
      
      if (error) throw error;
      
      this.addResult(
        'Messages Table',
        true,
        `Messages table accessible. Found ${data?.length || 0} messages`,
        data
      );
    } catch (error: any) {
      this.addResult(
        'Messages Table',
        false,
        `Table access failed: ${error.message}`,
        error
      );
    }
  }

  async testInsertMessage(): Promise<void> {
    try {
      const testMessage = {
        username: '@test-user',
        text: `Test message ${Date.now()}`,
        country: 'US',
        is_authenticated: false
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([testMessage])
        .select();
      
      if (error) throw error;
      
      this.addResult(
        'Insert Message',
        true,
        'Successfully inserted test message',
        data
      );

      // Clean up test message
      if (data && data[0]) {
        await supabase
          .from('messages')
          .delete()
          .eq('id', data[0].id);
      }
    } catch (error: any) {
      this.addResult(
        'Insert Message',
        false,
        `Insert failed: ${error.message}`,
        error
      );
    }
  }

  async testRealtimeSubscription(): Promise<void> {
    try {
      const channel = supabase
        .channel('test-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            console.log('Realtime test received:', payload);
          }
        );

      const subscribeResult = await channel.subscribe();
      
      if (subscribeResult === 'SUBSCRIBED') {
        this.addResult(
          'Realtime Subscription',
          true,
          'Successfully subscribed to realtime updates'
        );
        
        // Clean up
        supabase.removeChannel(channel);
      } else {
        throw new Error(`Subscription failed with status: ${subscribeResult}`);
      }
    } catch (error: any) {
      this.addResult(
        'Realtime Subscription',
        false,
        `Realtime subscription failed: ${error.message}`,
        error
      );
    }
  }

  async testAuth(): Promise<void> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      this.addResult(
        'Authentication',
        true,
        session ? 'User is authenticated' : 'No active session (anonymous mode)',
        { hasSession: !!session, user: session?.user?.email }
      );
    } catch (error: any) {
      this.addResult(
        'Authentication',
        false,
        `Auth check failed: ${error.message}`,
        error
      );
    }
  }

  getFailedTests(): TestResult[] {
    return this.results.filter(result => !result.success);
  }

  getSuccessfulTests(): TestResult[] {
    return this.results.filter(result => result.success);
  }

  hasFailures(): boolean {
    return this.getFailedTests().length > 0;
  }
}

// Export a singleton instance
export const supabaseTestSuite = new SupabaseTestSuite();
