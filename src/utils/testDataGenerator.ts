/**
 * Test Data Generator
 * Generates large datasets for performance testing
 */

import { supabase } from '@/lib/supabase';

export interface DataGenerationConfig {
  recordCount: number;
  batchSize: number;
  includeRelations: boolean;
  cleanup: boolean;
}

export interface GenerationResult {
  success: boolean;
  recordsCreated: number;
  duration: number;
  error?: string;
}

export class TestDataGenerator {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Generate test ideas
   */
  async generateIdeas(config: DataGenerationConfig): Promise<GenerationResult> {
    const startTime = performance.now();
    let recordsCreated = 0;

    try {
      const { recordCount, batchSize } = config;
      
      for (let i = 0; i < recordCount; i += batchSize) {
        const batch = [];
        const currentBatchSize = Math.min(batchSize, recordCount - i);

        for (let j = 0; j < currentBatchSize; j++) {
          batch.push({
            title: `Test Idea ${i + j + 1}`,
            description: `This is a test idea generated for performance testing. Idea number ${i + j + 1} with detailed description to simulate real data.`,
            category: this.getRandomCategory(),
            status: this.getRandomStatus(),
            user_id: this.userId,
            tags: this.getRandomTags(),
            priority: this.getRandomPriority(),
            estimated_effort: Math.floor(Math.random() * 100) + 1,
            market_size: Math.floor(Math.random() * 1000000) + 10000,
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          });
        }

        const { error } = await supabase.from('ideas').insert(batch);
        if (error) throw error;

        recordsCreated += currentBatchSize;
        
        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return {
        success: true,
        recordsCreated,
        duration: performance.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        recordsCreated,
        duration: performance.now() - startTime,
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      };
    }
  }

  /**
   * Generate test messages
   */
  async generateMessages(config: DataGenerationConfig): Promise<GenerationResult> {
    const startTime = performance.now();
    let recordsCreated = 0;

    try {
      const { recordCount, batchSize } = config;
      
      for (let i = 0; i < recordCount; i += batchSize) {
        const batch = [];
        const currentBatchSize = Math.min(batchSize, recordCount - i);

        for (let j = 0; j < currentBatchSize; j++) {
          batch.push({
            text: this.generateRandomMessage(i + j + 1),
            username: `test_user_${Math.floor(Math.random() * 100)}`,
            country: this.getRandomCountry(),
            is_authenticated: Math.random() > 0.3,
            created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          });
        }

        const { error } = await supabase.from('messages').insert(batch);
        if (error) throw error;

        recordsCreated += currentBatchSize;
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      return {
        success: true,
        recordsCreated,
        duration: performance.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        recordsCreated,
        duration: performance.now() - startTime,
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      };
    }
  }

  /**
   * Generate test tasks
   */
  async generateTasks(config: DataGenerationConfig): Promise<GenerationResult> {
    const startTime = performance.now();
    let recordsCreated = 0;

    try {
      const { recordCount, batchSize } = config;
      
      for (let i = 0; i < recordCount; i += batchSize) {
        const batch = [];
        const currentBatchSize = Math.min(batchSize, recordCount - i);

        for (let j = 0; j < currentBatchSize; j++) {
          const taskNumber = i + j + 1;
          batch.push({
            title: `Test Task ${taskNumber}`,
            description: `Performance test task ${taskNumber} with detailed description and requirements.`,
            status: this.getRandomTaskStatus(),
            priority: this.getRandomPriority(),
            user_id: this.userId,
            assigned_to: Math.random() > 0.5 ? this.userId : null,
            due_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            estimated_hours: Math.floor(Math.random() * 40) + 1,
            created_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString()
          });
        }

        const { error } = await supabase.from('tasks').insert(batch);
        if (error) throw error;

        recordsCreated += currentBatchSize;
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return {
        success: true,
        recordsCreated,
        duration: performance.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        recordsCreated,
        duration: performance.now() - startTime,
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      };
    }
  }

  /**
   * Generate test notifications
   */
  async generateNotifications(config: DataGenerationConfig): Promise<GenerationResult> {
    const startTime = performance.now();
    let recordsCreated = 0;

    try {
      const { recordCount, batchSize } = config;
      
      for (let i = 0; i < recordCount; i += batchSize) {
        const batch = [];
        const currentBatchSize = Math.min(batchSize, recordCount - i);

        for (let j = 0; j < currentBatchSize; j++) {
          batch.push({
            user_id: this.userId,
            title: this.getRandomNotificationTitle(),
            message: this.getRandomNotificationMessage(i + j + 1),
            notification_type: this.getRandomNotificationType(),
            is_read: Math.random() > 0.6,
            created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          });
        }

        const { error } = await supabase.from('notifications').insert(batch);
        if (error) throw error;

        recordsCreated += currentBatchSize;
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      return {
        success: true,
        recordsCreated,
        duration: performance.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        recordsCreated,
        duration: performance.now() - startTime,
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      };
    }
  }

  /**
   * Clean up test data
   */
  async cleanupTestData(): Promise<{
    ideas: number;
    messages: number;
    tasks: number;
    notifications: number;
  }> {
    const results = { ideas: 0, messages: 0, tasks: 0, notifications: 0 };

    try {
      // Clean up test ideas
      const { data: deletedIdeas } = await supabase
        .from('ideas')
        .delete()
        .like('title', 'Test Idea %')
        .select('id');
      results.ideas = deletedIdeas?.length || 0;

      // Clean up test messages
      const { data: deletedMessages } = await supabase
        .from('messages')
        .delete()
        .like('username', 'test_user_%')
        .select('id');
      results.messages = deletedMessages?.length || 0;

      // Clean up test tasks
      const { data: deletedTasks } = await supabase
        .from('tasks')
        .delete()
        .like('title', 'Test Task %')
        .select('id');
      results.tasks = deletedTasks?.length || 0;

      // Clean up test notifications
      const { data: deletedNotifications } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', this.userId)
        .like('message', '%performance test%')
        .select('id');
      results.notifications = deletedNotifications?.length || 0;

    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }

    return results;
  }

  /**
   * Generate all test data types
   */
  async generateAllTestData(config: DataGenerationConfig): Promise<{
    ideas: GenerationResult;
    messages: GenerationResult;
    tasks: GenerationResult;
    notifications: GenerationResult;
  }> {
    console.log('🏗️ Generating test data...');

    const results = {
      ideas: await this.generateIdeas({ ...config, recordCount: Math.floor(config.recordCount * 0.3) }),
      messages: await this.generateMessages({ ...config, recordCount: Math.floor(config.recordCount * 0.4) }),
      tasks: await this.generateTasks({ ...config, recordCount: Math.floor(config.recordCount * 0.2) }),
      notifications: await this.generateNotifications({ ...config, recordCount: Math.floor(config.recordCount * 0.1) })
    };

    console.log('✅ Test data generation complete');
    return results;
  }

  // Helper methods for generating random data
  private getRandomCategory(): string {
    const categories = ['Technology', 'Business', 'Health', 'Education', 'Entertainment', 'Finance', 'Travel', 'Food'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  private getRandomStatus(): string {
    const statuses = ['draft', 'active', 'completed', 'archived'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private getRandomTaskStatus(): string {
    const statuses = ['todo', 'in_progress', 'completed', 'cancelled'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private getRandomPriority(): string {
    const priorities = ['low', 'medium', 'high', 'urgent'];
    return priorities[Math.floor(Math.random() * priorities.length)];
  }

  private getRandomTags(): string[] {
    const allTags = ['startup', 'mvp', 'saas', 'mobile', 'web', 'ai', 'blockchain', 'iot', 'fintech', 'healthtech'];
    const tagCount = Math.floor(Math.random() * 4) + 1;
    const shuffled = allTags.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, tagCount);
  }

  private getRandomCountry(): string {
    const countries = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP', 'IN', 'BR', 'MX'];
    return countries[Math.floor(Math.random() * countries.length)];
  }

  private getRandomNotificationType(): string {
    const types = ['info', 'success', 'warning', 'error'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private generateRandomMessage(index: number): string {
    const messages = [
      `This is a performance test message ${index} to simulate real chat activity.`,
      `Testing message throughput with message number ${index}.`,
      `Performance testing in progress - message ${index} of many.`,
      `Simulating user activity with test message ${index}.`,
      `Load testing the chat system with message ${index}.`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getRandomNotificationTitle(): string {
    const titles = [
      'Task Assignment',
      'System Update',
      'New Message',
      'Deadline Reminder',
      'Performance Alert',
      'Team Invitation',
      'Project Update'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  private getRandomNotificationMessage(index: number): string {
    return `This is a performance test notification ${index} to simulate real notification activity.`;
  }
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testDataGenerator = {
    TestDataGenerator,
    generateTestData: async (userId: string, recordCount: number = 1000) => {
      const generator = new TestDataGenerator(userId);
      return await generator.generateAllTestData({
        recordCount,
        batchSize: 50,
        includeRelations: true,
        cleanup: false
      });
    },
    cleanupTestData: async (userId: string) => {
      const generator = new TestDataGenerator(userId);
      return await generator.cleanupTestData();
    }
  };
}
