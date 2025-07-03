/**
 * Real-time Features Testing Utility
 * Comprehensive testing for WebSocket connections and team collaboration
 */

import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeTestResult {
  success: boolean;
  message: string;
  duration: number;
  data?: any;
  error?: string;
}

export interface ConnectionTest {
  name: string;
  description: string;
  testFunction: () => Promise<RealtimeTestResult>;
  category: 'connection' | 'messaging' | 'presence' | 'collaboration';
  priority: 'high' | 'medium' | 'low';
}

export class RealtimeTester {
  private testUserId: string;
  private testTeamId: string;
  private activeChannels: RealtimeChannel[] = [];

  constructor(userId: string, teamId: string = 'test-team') {
    this.testUserId = userId;
    this.testTeamId = teamId;
  }

  /**
   * Test basic WebSocket connection
   */
  async testBasicConnection(): Promise<RealtimeTestResult> {
    const startTime = Date.now();
    
    try {
      const channel = supabase.channel('connection_test');
      
      const connectionPromise = new Promise<boolean>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout after 5 seconds'));
        }, 5000);

        channel.subscribe((status) => {
          clearTimeout(timeout);
          if (status === 'SUBSCRIBED') {
            resolve(true);
          } else if (status === 'CHANNEL_ERROR') {
            reject(new Error(`Connection failed with status: ${status}`));
          }
        });
      });

      await connectionPromise;
      this.activeChannels.push(channel);

      return {
        success: true,
        message: 'WebSocket connection established successfully',
        duration: Date.now() - startTime,
        data: { status: 'SUBSCRIBED' }
      };
    } catch (error) {
      return {
        success: false,
        message: 'WebSocket connection failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test global chat messaging
   */
  async testGlobalMessaging(): Promise<RealtimeTestResult> {
    const startTime = Date.now();
    
    try {
      const testMessage = `Test message ${Date.now()}`;
      let messageReceived = false;

      // Subscribe to messages
      const channel = supabase
        .channel('global_messages_test')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        }, (payload) => {
          if (payload.new.text === testMessage) {
            messageReceived = true;
          }
        })
        .subscribe();

      this.activeChannels.push(channel);

      // Wait for subscription to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Send test message
      const { error: insertError } = await supabase
        .from('messages')
        .insert([{
          text: testMessage,
          username: `test_user_${this.testUserId}`,
          country: 'Test',
          is_authenticated: true
        }]);

      if (insertError) throw insertError;

      // Wait for real-time update
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!messageReceived) {
        throw new Error('Message was sent but not received via real-time subscription');
      }

      return {
        success: true,
        message: 'Global messaging working correctly',
        duration: Date.now() - startTime,
        data: { messageReceived: true, testMessage }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Global messaging test failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test team-specific messaging
   */
  async testTeamMessaging(): Promise<RealtimeTestResult> {
    const startTime = Date.now();

    try {
      const testMessage = `Team test message ${Date.now()}`;
      let messageReceived = false;

      // First ensure team exists
      const { error: teamError } = await supabase
        .from('teams')
        .upsert([{
          id: this.testTeamId,
          name: 'Test Team',
          description: 'Test team for real-time testing',
          created_by: this.testUserId
        }], { onConflict: 'id' });

      if (teamError) console.warn('Team creation warning:', teamError);

      // Subscribe to team messages
      const channel = supabase
        .channel(`team_messages_${this.testTeamId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'team_messages',
          filter: `team_id=eq.${this.testTeamId}`
        }, (payload) => {
          if (payload.new.content === testMessage) {
            messageReceived = true;
          }
        })
        .subscribe();

      this.activeChannels.push(channel);

      // Wait for subscription
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Send team message
      const { error: insertError } = await supabase
        .from('team_messages')
        .insert([{
          team_id: this.testTeamId,
          sender_id: this.testUserId,
          sender_name: 'Test User',
          content: testMessage,
          avatar: '',
          country: 'Test',
          is_authenticated: true
        }]);

      if (insertError) throw insertError;

      // Wait for real-time update
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!messageReceived) {
        throw new Error('Team message was sent but not received via real-time subscription');
      }

      return {
        success: true,
        message: 'Team messaging working correctly',
        duration: Date.now() - startTime,
        data: { messageReceived: true, testMessage, teamId: this.testTeamId }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Team messaging test failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test presence tracking
   */
  async testPresenceTracking(): Promise<RealtimeTestResult> {
    const startTime = Date.now();
    
    try {
      let presenceUpdated = false;
      
      const channel = supabase.channel(`team_presence_${this.testTeamId}`, {
        config: {
          presence: {
            key: this.testUserId,
          },
        },
      });

      // Track presence events
      channel.on('presence', { event: 'sync' }, () => {
        presenceUpdated = true;
      });

      // Subscribe and track presence
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Presence subscription timeout'));
        }, 5000);

        channel.subscribe(async (status) => {
          clearTimeout(timeout);
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user_id: this.testUserId,
              user_name: 'Test User',
              online_at: new Date().toISOString(),
            });
            resolve();
          } else {
            reject(new Error(`Presence subscription failed: ${status}`));
          }
        });
      });

      this.activeChannels.push(channel);

      // Wait for presence sync
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        success: true,
        message: 'Presence tracking working correctly',
        duration: Date.now() - startTime,
        data: { presenceUpdated, userId: this.testUserId }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Presence tracking test failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test typing indicators
   */
  async testTypingIndicators(): Promise<RealtimeTestResult> {
    const startTime = Date.now();
    
    try {
      let typingReceived = false;
      let stopTypingReceived = false;

      const channel = supabase
        .channel(`typing_${this.testTeamId}`)
        .on('broadcast', { event: 'typing' }, (payload) => {
          if (payload.payload.user_id === this.testUserId) {
            typingReceived = true;
          }
        })
        .on('broadcast', { event: 'stop_typing' }, (payload) => {
          if (payload.payload.user_id === this.testUserId) {
            stopTypingReceived = true;
          }
        })
        .subscribe();

      this.activeChannels.push(channel);

      // Wait for subscription
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Send typing indicator
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: this.testUserId,
          user_name: 'Test User',
          team_id: this.testTeamId,
          timestamp: new Date().toISOString(),
        },
      });

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 500));

      // Send stop typing
      await channel.send({
        type: 'broadcast',
        event: 'stop_typing',
        payload: {
          user_id: this.testUserId,
          user_name: 'Test User',
          team_id: this.testTeamId,
        },
      });

      // Wait for events
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!typingReceived || !stopTypingReceived) {
        throw new Error('Typing indicators not received properly');
      }

      return {
        success: true,
        message: 'Typing indicators working correctly',
        duration: Date.now() - startTime,
        data: { typingReceived, stopTypingReceived }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Typing indicators test failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test multiple concurrent connections
   */
  async testConcurrentConnections(): Promise<RealtimeTestResult> {
    const startTime = Date.now();
    
    try {
      const connectionPromises = [];
      const channelCount = 5;

      for (let i = 0; i < channelCount; i++) {
        const promise = new Promise<boolean>((resolve, reject) => {
          const channel = supabase.channel(`concurrent_test_${i}`);
          
          const timeout = setTimeout(() => {
            reject(new Error(`Channel ${i} connection timeout`));
          }, 5000);

          channel.subscribe((status) => {
            clearTimeout(timeout);
            if (status === 'SUBSCRIBED') {
              this.activeChannels.push(channel);
              resolve(true);
            } else {
              reject(new Error(`Channel ${i} failed: ${status}`));
            }
          });
        });

        connectionPromises.push(promise);
      }

      await Promise.all(connectionPromises);

      return {
        success: true,
        message: `${channelCount} concurrent connections established successfully`,
        duration: Date.now() - startTime,
        data: { channelCount, activeChannels: this.activeChannels.length }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Concurrent connections test failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Run all real-time tests
   */
  async runAllTests(): Promise<{ results: Map<string, RealtimeTestResult>; summary: any }> {
    console.log('🔄 Starting Real-time Features Tests...');
    
    const results = new Map<string, RealtimeTestResult>();

    const tests = [
      { name: 'Basic WebSocket Connection', test: () => this.testBasicConnection() },
      { name: 'Global Messaging', test: () => this.testGlobalMessaging() },
      { name: 'Team Messaging', test: () => this.testTeamMessaging() },
      { name: 'Presence Tracking', test: () => this.testPresenceTracking() },
      { name: 'Typing Indicators', test: () => this.testTypingIndicators() },
      { name: 'Concurrent Connections', test: () => this.testConcurrentConnections() }
    ];

    for (const { name, test } of tests) {
      console.log(`Testing: ${name}...`);
      try {
        const result = await test();
        results.set(name, result);
      } catch (error) {
        results.set(name, {
          success: false,
          message: 'Test execution failed',
          duration: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const summary = this.generateTestSummary(results);
    console.log('🎯 Real-time Tests Complete:', summary);
    
    return { results, summary };
  }

  /**
   * Clean up all test channels
   */
  cleanup(): void {
    console.log(`🧹 Cleaning up ${this.activeChannels.length} test channels...`);
    
    this.activeChannels.forEach(channel => {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.warn('Error removing channel:', error);
      }
    });
    
    this.activeChannels = [];
  }

  private generateTestSummary(results: Map<string, RealtimeTestResult>) {
    const total = results.size;
    const passed = Array.from(results.values()).filter(r => r.success).length;
    const failed = total - passed;
    const avgDuration = Array.from(results.values())
      .reduce((sum, r) => sum + r.duration, 0) / total;

    return {
      total,
      passed,
      failed,
      successRate: ((passed / total) * 100).toFixed(1) + '%',
      avgDuration: Math.round(avgDuration) + 'ms'
    };
  }
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).realtimeTest = {
    RealtimeTester,
    runTests: async (userId: string, teamId?: string) => {
      const tester = new RealtimeTester(userId, teamId);
      const results = await tester.runAllTests();
      tester.cleanup();
      return results;
    }
  };
}
