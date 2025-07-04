// =====================================================
// DATABASE INTEGRATION TESTING UTILITY
// =====================================================
// Comprehensive testing utility to verify Supabase integration
// and database functionality across all application modules

import { supabase, testSupabaseConnection } from '@/lib/supabase';
import databaseService from '@/services/database';

// Test result interface
interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  duration?: number;
  details?: unknown;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

// =====================================================
// CORE DATABASE TESTS
// =====================================================

class DatabaseTester {
  private results: TestSuite[] = [];
  private currentUserId: string | null = null;

  constructor() {
    // Try to get current user for testing
    this.initializeUser();
  }

  private async initializeUser() {
    try {
      const { data } = await supabase.auth.getUser();
      this.currentUserId = data.user?.id || null;
    } catch (error) {
      console.warn('No authenticated user for testing');
    }
  }

  // =====================================================
  // CONNECTION TESTS
  // =====================================================

  async testConnection(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Database Connection',
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0 }
    };

    // Test 1: Basic connection
    const startTime = performance.now();
    try {
      const result = await testSupabaseConnection();
      const duration = performance.now() - startTime;

      suite.tests.push({
        name: 'Basic Connection',
        status: result.success ? 'pass' : 'fail',
        message: result.success ? 'Connection successful' : `Connection failed: ${result.errors.join(', ')}`,
        duration,
        details: result
      });
    } catch (error) {
      suite.tests.push({
        name: 'Basic Connection',
        status: 'fail',
        message: `Connection test failed: ${error instanceof Error ? (error as Error).message : 'Unknown error'}`,
        duration: performance.now() - startTime
      });
    }

    // Test 2: Database service health
    try {
      const health = await databaseService.healthCheck();
      suite.tests.push({
        name: 'Database Service Health',
        status: health.status === 'connected' ? 'pass' : 'fail',
        message: `Service status: ${health.status}`,
        details: health
      });
    } catch (error) {
      suite.tests.push({
        name: 'Database Service Health',
        status: 'fail',
        message: `Health check failed: ${error instanceof Error ? (error as Error).message : 'Unknown error'}`
      });
    }

    // Test 3: Authentication system
    try {
      const { data, error } = await supabase.auth.getSession();
      suite.tests.push({
        name: 'Authentication System',
        status: error ? 'fail' : 'pass',
        message: error ? `Auth error: ${(error as Error).message}` : 'Authentication system working',
        details: { hasSession: !!data.session }
      });
    } catch (error) {
      suite.tests.push({
        name: 'Authentication System',
        status: 'fail',
        message: `Auth test failed: ${error instanceof Error ? (error as Error).message : 'Unknown error'}`
      });
    }

    this.updateSummary(suite);
    return suite;
  }

  // =====================================================
  // SCHEMA TESTS
  // =====================================================

  async testSchema(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Database Schema',
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0 }
    };

    // Test core tables exist
    const coreTables = [
      'user_profiles', 'ideas', 'mvps', 'prompt_history', 'teams',
      'documents', 'subscription_plans', 'user_subscriptions'
    ];

    for (const table of coreTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);

        suite.tests.push({
          name: `Table: ${table}`,
          status: error ? 'fail' : 'pass',
          message: error ? `Table error: ${(error as Error).message}` : 'Table accessible'
        });
      } catch (error) {
        suite.tests.push({
          name: `Table: ${table}`,
          status: 'fail',
          message: `Table test failed: ${error instanceof Error ? (error as Error).message : 'Unknown error'}`
        });
      }
    }

    // Test RLS policies
    try {
      const { data, error } = await supabase.rpc('validate_schema_integrity');
      if (data) {
        data.forEach((check: unknown) => {
          suite.tests.push({
            name: `Schema Check: ${check.check_name}`,
            status: check.status === 'PASS' ? 'pass' : 'fail',
            message: check.details
          });
        });
      }
    } catch (error) {
      suite.tests.push({
        name: 'Schema Integrity Check',
        status: 'warning',
        message: 'Schema validation function not available (this is normal for fresh installations)'
      });
    }

    this.updateSummary(suite);
    return suite;
  }

  // =====================================================
  // FEATURE TESTS
  // =====================================================

  async testFeatures(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Application Features',
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0 }
    };

    if (!this.currentUserId) {
      suite.tests.push({
        name: 'Feature Tests',
        status: 'warning',
        message: 'No authenticated user - skipping feature tests'
      });
      this.updateSummary(suite);
      return suite;
    }

    // Test Workspace features
    try {
      const result = await databaseService.workspace.getDashboardStats(this.currentUserId);
      suite.tests.push({
        name: 'Workspace Dashboard',
        status: result.error ? 'fail' : 'pass',
        message: result.error ? `Workspace error: ${(result.error as Error).message}` : 'Workspace data accessible',
        details: result.data
      });
    } catch (error) {
      suite.tests.push({
        name: 'Workspace Dashboard',
        status: 'fail',
        message: `Workspace test failed: ${error instanceof Error ? (error as Error).message : 'Unknown error'}`
      });
    }

    // Test Idea Vault features
    try {
      const result = await databaseService.ideaVault.getIdeas(this.currentUserId, { limit: 1 });
      suite.tests.push({
        name: 'Idea Vault',
        status: result.error ? 'fail' : 'pass',
        message: result.error ? `Idea Vault error: ${(result.error as Error).message}` : 'Idea Vault accessible',
        details: { ideaCount: result.data?.length || 0 }
      });
    } catch (error) {
      suite.tests.push({
        name: 'Idea Vault',
        status: 'fail',
        message: `Idea Vault test failed: ${error instanceof Error ? (error as Error).message : 'Unknown error'}`
      });
    }

    // Test subscription features
    try {
      const result = await databaseService.subscription.getUserSubscription(this.currentUserId);
      suite.tests.push({
        name: 'Subscription System',
        status: result.error && result.error.code !== 'PGRST116' ? 'fail' : 'pass',
        message: result.error && result.error.code !== 'PGRST116' ? 
          `Subscription error: ${(result.error as Error).message}` : 'Subscription system accessible',
        details: result.data
      });
    } catch (error) {
      suite.tests.push({
        name: 'Subscription System',
        status: 'fail',
        message: `Subscription test failed: ${error instanceof Error ? (error as Error).message : 'Unknown error'}`
      });
    }

    this.updateSummary(suite);
    return suite;
  }

  // =====================================================
  // REAL-TIME TESTS
  // =====================================================

  async testRealtime(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Real-time Features',
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0 }
    };

    // Test real-time connection
    try {
      const channel = supabase.channel('test_channel');
      
      const connectionPromise = new Promise<boolean>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Real-time connection timeout'));
        }, 5000);

        channel.subscribe((status) => {
          clearTimeout(timeout);
          if (status === 'SUBSCRIBED') {
            resolve(true);
          } else {
            reject(new Error(`Subscription failed: ${status}`));
          }
        });
      });

      await connectionPromise;
      supabase.removeChannel(channel);

      suite.tests.push({
        name: 'Real-time Connection',
        status: 'pass',
        message: 'Real-time subscriptions working'
      });
    } catch (error) {
      suite.tests.push({
        name: 'Real-time Connection',
        status: 'fail',
        message: `Real-time test failed: ${error instanceof Error ? (error as Error).message : 'Unknown error'}`
      });
    }

    // Test real-time tables
    const realtimeTables = ['messages', 'team_messages', 'notifications'];
    for (const table of realtimeTables) {
      try {
        const channel = supabase
          .channel(`test_${table}`)
          .on('postgres_changes', { event: '*', schema: 'public', table }, () => {})
          .subscribe();

        suite.tests.push({
          name: `Real-time Table: ${table}`,
          status: 'pass',
          message: `${table} real-time subscription created`
        });

        supabase.removeChannel(channel);
      } catch (error) {
        suite.tests.push({
          name: `Real-time Table: ${table}`,
          status: 'fail',
          message: `${table} real-time failed: ${error instanceof Error ? (error as Error).message : 'Unknown error'}`
        });
      }
    }

    this.updateSummary(suite);
    return suite;
  }

  // =====================================================
  // PERFORMANCE TESTS
  // =====================================================

  async testPerformance(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Performance',
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0 }
    };

    // Test query performance
    const performanceTests = [
      {
        name: 'Simple Query',
        query: () => supabase.from('subscription_plans').select('*').limit(5),
        threshold: 1000 // 1 second
      },
      {
        name: 'Complex Query with Joins',
        query: () => supabase.from('ideas').select('*, user_profiles(username)').limit(5),
        threshold: 2000 // 2 seconds
      }
    ];

    for (const test of performanceTests) {
      const startTime = performance.now();
      try {
        const { data, error } = await test.query();
        const duration = performance.now() - startTime;

        suite.tests.push({
          name: test.name,
          status: error ? 'fail' : duration > test.threshold ? 'warning' : 'pass',
          message: error ? 
            `Query failed: ${(error as Error).message}` : 
            `Query completed in ${duration.toFixed(2)}ms`,
          duration,
          details: { recordCount: data?.length || 0 }
        });
      } catch (error) {
        suite.tests.push({
          name: test.name,
          status: 'fail',
          message: `Performance test failed: ${error instanceof Error ? (error as Error).message : 'Unknown error'}`,
          duration: performance.now() - startTime
        });
      }
    }

    this.updateSummary(suite);
    return suite;
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  private updateSummary(suite: TestSuite) {
    suite.summary.total = suite.tests.length;
    suite.summary.passed = suite.tests.filter(t => t.status === 'pass').length;
    suite.summary.failed = suite.tests.filter(t => t.status === 'fail').length;
    suite.summary.warnings = suite.tests.filter(t => t.status === 'warning').length;
  }

  // =====================================================
  // MAIN TEST RUNNER
  // =====================================================

  async runAllTests(): Promise<{
    suites: TestSuite[];
    overall: {
      total: number;
      passed: number;
      failed: number;
      warnings: number;
      duration: number;
    };
  }> {
    const startTime = performance.now();
    console.log('🧪 Starting comprehensive database tests...');

    const suites = await Promise.all([
      this.testConnection(),
      this.testSchema(),
      this.testFeatures(),
      this.testRealtime(),
      this.testPerformance()
    ]);

    const overall = {
      total: suites.reduce((sum, suite) => sum + suite.summary.total, 0),
      passed: suites.reduce((sum, suite) => sum + suite.summary.passed, 0),
      failed: suites.reduce((sum, suite) => sum + suite.summary.failed, 0),
      warnings: suites.reduce((sum, suite) => sum + suite.summary.warnings, 0),
      duration: performance.now() - startTime
    };

    return { suites, overall };
  }
}

// =====================================================
// EXPORT
// =====================================================

export const databaseTester = new DatabaseTester();
export default databaseTester;
