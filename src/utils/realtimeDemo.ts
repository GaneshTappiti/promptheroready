/**
 * Real-time Features Demonstration
 * Interactive demo for showcasing real-time capabilities
 */

import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface DemoScenario {
  name: string;
  description: string;
  steps: DemoStep[];
  duration: number;
}

export interface DemoStep {
  action: string;
  description: string;
  execute: () => Promise<void>;
  expectedResult: string;
}

export class RealtimeDemo {
  private userId: string;
  private teamId: string;
  private channels: RealtimeChannel[] = [];
  private demoCallbacks: Map<string, (data: any) => void> = new Map();

  constructor(userId: string, teamId: string = 'demo-team') {
    this.userId = userId;
    this.teamId = teamId;
  }

  /**
   * Demo Scenario 1: Global Chat Demonstration
   */
  async demoGlobalChat(onMessage: (message: any) => void): Promise<void> {
    console.log('🌍 Starting Global Chat Demo...');

    // Subscribe to global messages
    const channel = supabase
      .channel('demo_global_chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        onMessage({
          type: 'global_message',
          data: payload.new,
          timestamp: new Date().toISOString()
        });
      })
      .subscribe();

    this.channels.push(channel);

    // Send demo messages
    const demoMessages = [
      'Hello from the global chat! 👋',
      'This message appears in real-time across all connected users',
      'Real-time messaging powered by Supabase WebSockets 🚀'
    ];

    for (let i = 0; i < demoMessages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await supabase.from('messages').insert([{
        text: demoMessages[i],
        username: `demo_user_${this.userId}`,
        country: 'Demo',
        is_authenticated: true
      }]);

      console.log(`📤 Sent: ${demoMessages[i]}`);
    }
  }

  /**
   * Demo Scenario 2: Team Collaboration
   */
  async demoTeamCollaboration(onUpdate: (update: any) => void): Promise<void> {
    console.log('👥 Starting Team Collaboration Demo...');

    // Ensure demo team exists
    await supabase.from('teams').upsert([{
      id: this.teamId,
      name: 'Demo Team',
      description: 'Real-time collaboration demo',
      created_by: this.userId
    }], { onConflict: 'id' });

    // Subscribe to team messages
    const messageChannel = supabase
      .channel(`demo_team_messages_${this.teamId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'team_messages',
        filter: `team_id=eq.${this.teamId}`
      }, (payload) => {
        onUpdate({
          type: 'team_message',
          data: payload.new,
          timestamp: new Date().toISOString()
        });
      })
      .subscribe();

    this.channels.push(messageChannel);

    // Subscribe to team tasks
    const taskChannel = supabase
      .channel(`demo_team_tasks_${this.teamId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'team_tasks',
        filter: `team_id=eq.${this.teamId}`
      }, (payload) => {
        onUpdate({
          type: 'team_task',
          event: payload.eventType,
          data: payload.new || payload.old,
          timestamp: new Date().toISOString()
        });
      })
      .subscribe();

    this.channels.push(taskChannel);

    // Demo team activities
    await this.simulateTeamActivity();
  }

  /**
   * Demo Scenario 3: Presence and Typing Indicators
   */
  async demoPresenceAndTyping(onPresenceUpdate: (update: any) => void): Promise<void> {
    console.log('👀 Starting Presence & Typing Demo...');

    // Presence tracking
    const presenceChannel = supabase.channel(`demo_presence_${this.teamId}`, {
      config: {
        presence: {
          key: this.userId,
        },
      },
    });

    presenceChannel.on('presence', { event: 'sync' }, () => {
      const state = presenceChannel.presenceState();
      onPresenceUpdate({
        type: 'presence_sync',
        data: state,
        timestamp: new Date().toISOString()
      });
    });

    presenceChannel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      onPresenceUpdate({
        type: 'user_joined',
        data: { key, presences: newPresences },
        timestamp: new Date().toISOString()
      });
    });

    presenceChannel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      onPresenceUpdate({
        type: 'user_left',
        data: { key, presences: leftPresences },
        timestamp: new Date().toISOString()
      });
    });

    // Subscribe and track presence
    presenceChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({
          user_id: this.userId,
          user_name: 'Demo User',
          online_at: new Date().toISOString(),
          status: 'active'
        });
      }
    });

    this.channels.push(presenceChannel);

    // Typing indicators
    const typingChannel = supabase
      .channel(`demo_typing_${this.teamId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        onPresenceUpdate({
          type: 'typing_start',
          data: payload.payload,
          timestamp: new Date().toISOString()
        });
      })
      .on('broadcast', { event: 'stop_typing' }, (payload) => {
        onPresenceUpdate({
          type: 'typing_stop',
          data: payload.payload,
          timestamp: new Date().toISOString()
        });
      })
      .subscribe();

    this.channels.push(typingChannel);

    // Simulate typing activity
    await this.simulateTypingActivity(typingChannel);
  }

  /**
   * Demo Scenario 4: Live Notifications
   */
  async demoLiveNotifications(onNotification: (notification: any) => void): Promise<void> {
    console.log('🔔 Starting Live Notifications Demo...');

    // Subscribe to user notifications
    const channel = supabase
      .channel(`demo_notifications_${this.userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${this.userId}`
      }, (payload) => {
        onNotification({
          type: 'notification',
          data: payload.new,
          timestamp: new Date().toISOString()
        });
      })
      .subscribe();

    this.channels.push(channel);

    // Send demo notifications
    const notifications = [
      {
        title: 'Welcome to Real-time Demo!',
        message: 'This notification appeared instantly via WebSocket',
        notification_type: 'info'
      },
      {
        title: 'Task Assignment',
        message: 'You have been assigned a new task in Demo Team',
        notification_type: 'success'
      },
      {
        title: 'System Update',
        message: 'Real-time features are working perfectly!',
        notification_type: 'info'
      }
    ];

    for (let i = 0; i < notifications.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await supabase.from('notifications').insert([{
        user_id: this.userId,
        ...notifications[i]
      }]);

      console.log(`🔔 Sent notification: ${notifications[i].title}`);
    }
  }

  /**
   * Run complete demo sequence
   */
  async runCompleteDemo(callbacks: {
    onMessage?: (data: any) => void;
    onUpdate?: (data: any) => void;
    onPresence?: (data: any) => void;
    onNotification?: (data: any) => void;
    onProgress?: (step: string, progress: number) => void;
  }): Promise<void> {
    const steps = [
      { name: 'Global Chat', demo: () => this.demoGlobalChat(callbacks.onMessage || (() => {})) },
      { name: 'Team Collaboration', demo: () => this.demoTeamCollaboration(callbacks.onUpdate || (() => {})) },
      { name: 'Presence & Typing', demo: () => this.demoPresenceAndTyping(callbacks.onPresence || (() => {})) },
      { name: 'Live Notifications', demo: () => this.demoLiveNotifications(callbacks.onNotification || (() => {})) }
    ];

    console.log('🎬 Starting Complete Real-time Demo...');

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      callbacks.onProgress?.(step.name, (i / steps.length) * 100);
      
      console.log(`\n📍 Demo Step ${i + 1}: ${step.name}`);
      await step.demo();
      
      // Wait between demos
      if (i < steps.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    callbacks.onProgress?.('Complete', 100);
    console.log('✅ Complete Real-time Demo Finished!');
  }

  /**
   * Simulate team activity
   */
  private async simulateTeamActivity(): Promise<void> {
    // Send team message
    await supabase.from('team_messages').insert([{
      team_id: this.teamId,
      sender_id: this.userId,
      sender_name: 'Demo User',
      content: 'Starting team collaboration demo! 🚀',
      avatar: '',
      country: 'Demo',
      is_authenticated: true
    }]);

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create team task
    await supabase.from('team_tasks').insert([{
      team_id: this.teamId,
      title: 'Demo Task: Real-time Updates',
      description: 'This task demonstrates real-time task management',
      status: 'todo',
      priority: 'medium',
      created_by: this.userId
    }]);

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update task status
    const { data: tasks } = await supabase
      .from('team_tasks')
      .select('id')
      .eq('team_id', this.teamId)
      .eq('title', 'Demo Task: Real-time Updates')
      .limit(1);

    if (tasks && tasks.length > 0) {
      await supabase
        .from('team_tasks')
        .update({ status: 'in_progress' })
        .eq('id', tasks[0].id);
    }
  }

  /**
   * Simulate typing activity
   */
  private async simulateTypingActivity(channel: RealtimeChannel): Promise<void> {
    // Start typing
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: this.userId,
        user_name: 'Demo User',
        team_id: this.teamId,
        timestamp: new Date().toISOString(),
      },
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Stop typing
    await channel.send({
      type: 'broadcast',
      event: 'stop_typing',
      payload: {
        user_id: this.userId,
        user_name: 'Demo User',
        team_id: this.teamId,
      },
    });
  }

  /**
   * Cleanup demo channels
   */
  cleanup(): void {
    console.log('🧹 Cleaning up demo channels...');
    
    this.channels.forEach(channel => {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.warn('Error removing demo channel:', error);
      }
    });
    
    this.channels = [];
    this.demoCallbacks.clear();
  }
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).realtimeDemo = {
    RealtimeDemo,
    runDemo: async (userId: string, teamId?: string) => {
      const demo = new RealtimeDemo(userId, teamId);
      
      await demo.runCompleteDemo({
        onMessage: (data) => console.log('📨 Message:', data),
        onUpdate: (data) => console.log('🔄 Update:', data),
        onPresence: (data) => console.log('👥 Presence:', data),
        onNotification: (data) => console.log('🔔 Notification:', data),
        onProgress: (step, progress) => console.log(`📊 Progress: ${step} (${progress}%)`)
      });
      
      // Cleanup after 30 seconds
      setTimeout(() => demo.cleanup(), 30000);
      
      return demo;
    }
  };
}
