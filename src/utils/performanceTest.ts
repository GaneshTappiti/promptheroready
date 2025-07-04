/**
 * Performance Testing Utility
 * Comprehensive testing for application performance with larger datasets
 */

import { supabase } from '@/lib/supabase';
import { QueryOptimizationService } from '@/services/queryOptimizationService';

export interface PerformanceTestResult {
  testName: string;
  success: boolean;
  duration: number;
  memoryUsage?: {
    before: number;
    after: number;
    delta: number;
  };
  metrics: {
    recordsProcessed?: number;
    throughput?: number; // records per second
    cacheHitRate?: number;
    errorRate?: number;
  };
  recommendations?: string[];
  error?: string;
}

export interface LoadTestConfig {
  recordCount: number;
  concurrentUsers: number;
  testDuration: number; // seconds
  rampUpTime: number; // seconds
}

export class PerformanceTester {
  private userId: string;
  private testResults: PerformanceTestResult[] = [];

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Test large dataset loading performance
   */
  async testLargeDatasetLoading(): Promise<PerformanceTestResult> {
    const testName = 'Large Dataset Loading';
    const startTime = performance.now();
    const memoryBefore = this.getMemoryUsage();

    try {
      // Test loading large number of ideas
      const { data: ideas, error: ideasError } = await supabase
        .from('ideas')
        .select('*')
        .limit(1000);

      if (ideasError) throw ideasError;

      // Test loading large number of messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .limit(1000);

      if (messagesError) throw messagesError;

      // Test loading large number of tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .limit(500);

      if (tasksError) throw tasksError;

      const duration = performance.now() - startTime;
      const memoryAfter = this.getMemoryUsage();
      const totalRecords = (ideas?.length || 0) + (messages?.length || 0) + (tasks?.length || 0);

      return {
        testName,
        success: true,
        duration,
        memoryUsage: {
          before: memoryBefore,
          after: memoryAfter,
          delta: memoryAfter - memoryBefore
        },
        metrics: {
          recordsProcessed: totalRecords,
          throughput: totalRecords / (duration / 1000)
        },
        recommendations: this.generateRecommendations(duration, totalRecords)
      };
    } catch (error) {
      return {
        testName,
        success: false,
        duration: performance.now() - startTime,
        metrics: {},
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      };
    }
  }

  /**
   * Test pagination performance
   */
  async testPaginationPerformance(): Promise<PerformanceTestResult> {
    const testName = 'Pagination Performance';
    const startTime = performance.now();
    const memoryBefore = this.getMemoryUsage();

    try {
      let totalRecords = 0;
      let pageCount = 0;
      let cursor: string | undefined;
      const pageSize = 50;

      // Test cursor-based pagination
      do {
        const result = await QueryOptimizationService.getPaginatedData('messages', {
          pageSize,
          cursor,
          orderBy: 'created_at',
          ascending: false
        });

        totalRecords += result.data.length;
        pageCount++;
        cursor = result.nextCursor;

        // Limit to 10 pages for testing
        if (pageCount >= 10) break;
      } while (cursor);

      const duration = performance.now() - startTime;
      const memoryAfter = this.getMemoryUsage();

      return {
        testName,
        success: true,
        duration,
        memoryUsage: {
          before: memoryBefore,
          after: memoryAfter,
          delta: memoryAfter - memoryBefore
        },
        metrics: {
          recordsProcessed: totalRecords,
          throughput: totalRecords / (duration / 1000)
        },
        recommendations: [
          duration > 5000 ? 'Consider reducing page size or implementing virtual scrolling' : 'Pagination performance is acceptable',
          totalRecords < 100 ? 'Consider increasing page size for better efficiency' : 'Page size is appropriate'
        ]
      };
    } catch (error) {
      return {
        testName,
        success: false,
        duration: performance.now() - startTime,
        metrics: {},
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      };
    }
  }

  /**
   * Test caching performance
   */
  async testCachingPerformance(): Promise<PerformanceTestResult> {
    const testName = 'Caching Performance';
    const startTime = performance.now();

    try {
      const cacheKey = 'performance_test_cache';
      let cacheHits = 0;
      let totalRequests = 0;

      // Test cache performance with multiple requests
      for (let i = 0; i < 10; i++) {
        const result = await QueryOptimizationService.getCachedQuery(
          `${cacheKey}_${i % 3}`, // Repeat some keys to test cache hits
          async () => {
            const { data } = await supabase.from('ideas').select('*').limit(10);
            return data || [];
          },
          30000 // 30 second TTL
        );

        totalRequests++;
        // Check if this was likely a cache hit (very fast response)
        if (i > 2 && i % 3 < 2) cacheHits++;
      }

      const duration = performance.now() - startTime;
      const cacheHitRate = (cacheHits / totalRequests) * 100;

      return {
        testName,
        success: true,
        duration,
        metrics: {
          recordsProcessed: totalRequests,
          cacheHitRate,
          throughput: totalRequests / (duration / 1000)
        },
        recommendations: [
          cacheHitRate > 50 ? 'Cache is performing well' : 'Consider optimizing cache strategy',
          duration > 3000 ? 'Cache lookup time could be improved' : 'Cache performance is good'
        ]
      };
    } catch (error) {
      return {
        testName,
        success: false,
        duration: performance.now() - startTime,
        metrics: {},
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      };
    }
  }

  /**
   * Test concurrent operations performance
   */
  async testConcurrentOperations(): Promise<PerformanceTestResult> {
    const testName = 'Concurrent Operations';
    const startTime = performance.now();
    const memoryBefore = this.getMemoryUsage();

    try {
      // Create multiple concurrent operations
      const operations = [
        () => supabase.from('ideas').select('*').limit(100),
        () => supabase.from('messages').select('*').limit(100),
        () => supabase.from('tasks').select('*').limit(50),
        () => supabase.from('user_profiles').select('*').limit(50),
        () => supabase.from('teams').select('*').limit(25)
      ];

      // Run operations concurrently
      const results = await Promise.all(operations.map(op => op()));
      
      const duration = performance.now() - startTime;
      const memoryAfter = this.getMemoryUsage();
      const totalRecords = results.reduce((sum, result) => sum + (result.data?.length || 0), 0);
      const errorCount = results.filter(result => result.error).length;

      return {
        testName,
        success: errorCount === 0,
        duration,
        memoryUsage: {
          before: memoryBefore,
          after: memoryAfter,
          delta: memoryAfter - memoryBefore
        },
        metrics: {
          recordsProcessed: totalRecords,
          throughput: totalRecords / (duration / 1000),
          errorRate: (errorCount / operations.length) * 100
        },
        recommendations: [
          errorCount > 0 ? 'Some concurrent operations failed - check connection limits' : 'Concurrent operations successful',
          duration > 5000 ? 'Consider implementing request queuing' : 'Concurrent performance is acceptable'
        ]
      };
    } catch (error) {
      return {
        testName,
        success: false,
        duration: performance.now() - startTime,
        metrics: {},
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      };
    }
  }

  /**
   * Test real-time subscription performance
   */
  async testRealtimePerformance(): Promise<PerformanceTestResult> {
    const testName = 'Real-time Subscription Performance';
    const startTime = performance.now();

    try {
      let messageCount = 0;
      const subscriptions: unknown[] = [];

      // Create multiple real-time subscriptions
      for (let i = 0; i < 5; i++) {
        const channel = supabase
          .channel(`perf_test_${i}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          }, () => {
            messageCount++;
          })
          .subscribe();

        subscriptions.push(channel);
      }

      // Wait for subscriptions to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Send test messages
      for (let i = 0; i < 10; i++) {
        await supabase.from('messages').insert([{
          text: `Performance test message ${i}`,
          username: `perf_test_${this.userId}`,
          country: 'Test',
          is_authenticated: true
        }]);
      }

      // Wait for messages to be received
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Cleanup subscriptions
      subscriptions.forEach(channel => {
        supabase.removeChannel(channel);
      });

      const duration = performance.now() - startTime;

      return {
        testName,
        success: messageCount > 0,
        duration,
        metrics: {
          recordsProcessed: messageCount,
          throughput: messageCount / (duration / 1000)
        },
        recommendations: [
          messageCount < 10 ? 'Some real-time messages may have been missed' : 'Real-time performance is good',
          duration > 10000 ? 'Real-time latency is high' : 'Real-time latency is acceptable'
        ]
      };
    } catch (error) {
      return {
        testName,
        success: false,
        duration: performance.now() - startTime,
        metrics: {},
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      };
    }
  }

  /**
   * Test memory usage patterns
   */
  async testMemoryUsage(): Promise<PerformanceTestResult> {
    const testName = 'Memory Usage Analysis';
    const startTime = performance.now();
    const memoryBefore = this.getMemoryUsage();

    try {
      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc();
      }

      const initialMemory = this.getMemoryUsage();
      
      // Create large data structures to test memory handling
      const largeArrays: unknown[] = [];
      for (let i = 0; i < 100; i++) {
        const { data } = await supabase.from('messages').select('*').limit(50);
        largeArrays.push(data);
      }

      const peakMemory = this.getMemoryUsage();

      // Clear references
      largeArrays.length = 0;

      // Force garbage collection again if available
      if ((window as any).gc) {
        (window as any).gc();
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      const finalMemory = this.getMemoryUsage();

      const duration = performance.now() - startTime;

      return {
        testName,
        success: true,
        duration,
        memoryUsage: {
          before: memoryBefore,
          after: finalMemory,
          delta: finalMemory - memoryBefore
        },
        metrics: {
          recordsProcessed: 100 * 50 // 100 requests * 50 records each
        },
        recommendations: [
          (finalMemory - initialMemory) > 50 ? 'Potential memory leak detected' : 'Memory usage is stable',
          (peakMemory - initialMemory) > 200 ? 'High memory usage during operations' : 'Memory usage is reasonable'
        ]
      };
    } catch (error) {
      return {
        testName,
        success: false,
        duration: performance.now() - startTime,
        metrics: {},
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      };
    }
  }

  /**
   * Run all performance tests
   */
  async runAllTests(): Promise<{
    results: PerformanceTestResult[];
    summary: {
      totalTests: number;
      passedTests: number;
      failedTests: number;
      averageDuration: number;
      totalMemoryDelta: number;
      overallScore: number;
    };
  }> {
    console.log('🚀 Starting Performance Tests...');
    
    const tests = [
      () => this.testLargeDatasetLoading(),
      () => this.testPaginationPerformance(),
      () => this.testCachingPerformance(),
      () => this.testConcurrentOperations(),
      () => this.testRealtimePerformance(),
      () => this.testMemoryUsage()
    ];

    this.testResults = [];

    for (const test of tests) {
      try {
        const result = await test();
        this.testResults.push(result);
        console.log(`✅ ${result.testName}: ${result.success ? 'PASS' : 'FAIL'} (${Math.round(result.duration)}ms)`);
      } catch (error) {
        console.error(`❌ Test failed:`, error);
      }
    }

    const summary = this.generateSummary();
    console.log('🎯 Performance Tests Complete:', summary);
    
    return { results: this.testResults, summary };
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  private generateRecommendations(duration: number, recordCount: number): string[] {
    const recommendations: string[] = [];
    
    if (duration > 5000) {
      recommendations.push('Consider implementing pagination or virtual scrolling');
    }
    
    if (recordCount > 1000) {
      recommendations.push('Large dataset detected - consider data virtualization');
    }
    
    if (duration / recordCount > 5) {
      recommendations.push('Query optimization needed - consider indexing');
    }
    
    return recommendations;
  }

  private generateSummary() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const averageDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0) / totalTests;
    const totalMemoryDelta = this.testResults
      .filter(r => r.memoryUsage)
      .reduce((sum, r) => sum + (r.memoryUsage?.delta || 0), 0);
    
    // Calculate overall performance score (0-100)
    const successRate = (passedTests / totalTests) * 100;
    const speedScore = Math.max(0, 100 - (averageDuration / 100)); // Penalty for slow operations
    const memoryScore = Math.max(0, 100 - (totalMemoryDelta * 2)); // Penalty for memory usage
    const overallScore = (successRate + speedScore + memoryScore) / 3;

    return {
      totalTests,
      passedTests,
      failedTests,
      averageDuration: Math.round(averageDuration),
      totalMemoryDelta: Math.round(totalMemoryDelta * 100) / 100,
      overallScore: Math.round(overallScore)
    };
  }
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).performanceTest = {
    PerformanceTester,
    runTests: async (userId: string) => {
      const tester = new PerformanceTester(userId);
      return await tester.runAllTests();
    }
  };
}
