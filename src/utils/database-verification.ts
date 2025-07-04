/**
 * Database Verification Utility
 * Comprehensive verification of Supabase database schema and configuration
 */

import { supabase } from '@/lib/supabase';

interface TableInfo {
  table_name: string;
  exists: boolean;
  row_count?: number;
  has_rls?: boolean;
  error?: string;
}

interface VerificationResult {
  success: boolean;
  tables: TableInfo[];
  errors: string[];
  summary: {
    total_tables: number;
    existing_tables: number;
    missing_tables: number;
    tables_with_rls: number;
  };
}

// Expected tables from clean_schema.sql
const EXPECTED_TABLES = [
  'user_profiles',
  'user_onboarding_profiles',
  'user_ai_preferences',
  'user_preferences',
  'subscription_plans',
  'user_subscriptions',
  'usage_tracking',
  'ideas',
  'wiki_pages',
  'journey_entries',
  'feedback_items',
  'mvps',
  'prompt_history',
  'ai_tools_directory',
  'ai_tools',
  'documents',
  'document_templates',
  'teams',
  'team_members',
  'team_tasks',
  'team_messages',
  'team_meetings',
  'messages',
  'projects',
  'tasks',
  'project_phases',
  'phase_tasks',
  'investors',
  'funding_rounds',
  'pitch_scripts',
  'pitch_decks',
  'pitch_videos',
  'admin_roles',
  'admin_users',
  'user_admin_roles',
  'system_announcements',
  'prompt_templates',
  'security_audit_log',
  'user_activity',
  'system_metrics',
  'ai_provider_usage',
  'notifications',
  'file_attachments'
];

/**
 * Check if a table exists and get basic info
 */
async function checkTable(tableName: string): Promise<TableInfo> {
  try {
    // Try to query the table directly to check if it exists
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      // If error is about table not existing
      if (error.code === '42P01' || (error as Error).message.includes('does not exist')) {
        return {
          table_name: tableName,
          exists: false
        };
      }

      // If it's an RLS error, table exists but we can't access it
      if (error.code === '42501' || (error as Error).message.includes('permission denied') || (error as Error).message.includes('RLS')) {
        return {
          table_name: tableName,
          exists: true,
          has_rls: true,
          row_count: 0
        };
      }

      return {
        table_name: tableName,
        exists: false,
        error: `Error checking table: ${(error as Error).message}`
      };
    }

    // Table exists and we can access it
    // Get row count
    let rowCount = 0;
    try {
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!countError) {
        rowCount = count || 0;
      }
    } catch (error) {
      console.warn(`Could not get row count for ${tableName}:`, error);
    }

    return {
      table_name: tableName,
      exists: true,
      row_count: rowCount,
      has_rls: false // If we can access it, RLS is either off or we have permission
    };

  } catch (error) {
    return {
      table_name: tableName,
      exists: false,
      error: `Unexpected error: ${error instanceof Error ? (error as Error).message : 'Unknown error'}`
    };
  }
}

/**
 * Verify all expected tables exist and are properly configured
 * Now with caching to prevent frequent expensive queries
 */
export async function verifyDatabaseSchema(useCache: boolean = true): Promise<VerificationResult> {
  console.log('🔍 Starting database schema verification...');

  // Check cache first if enabled
  const cacheKey = 'database_schema_verification';
  const cacheExpiry = 5 * 60 * 1000; // 5 minutes

  if (useCache) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < cacheExpiry) {
        console.log('📋 Using cached schema verification result');
        return data;
      }
    }
  }

  const tables: TableInfo[] = [];
  const errors: string[] = [];

  // Check each expected table
  for (const tableName of EXPECTED_TABLES) {
    console.log(`Checking table: ${tableName}`);
    const tableInfo = await checkTable(tableName);
    tables.push(tableInfo);

    if (!tableInfo.exists) {
      errors.push(`Missing table: ${tableName}`);
    }

    if (tableInfo.error) {
      errors.push(`Error with table ${tableName}: ${tableInfo.error}`);
    }
  }

  // Calculate summary
  const existingTables = tables.filter(t => t.exists).length;
  const missingTables = tables.filter(t => !t.exists).length;
  const tablesWithRLS = tables.filter(t => t.has_rls).length;

  const summary = {
    total_tables: EXPECTED_TABLES.length,
    existing_tables: existingTables,
    missing_tables: missingTables,
    tables_with_rls: tablesWithRLS
  };

  const success = missingTables === 0 && errors.length === 0;

  console.log('📊 Database verification summary:', summary);

  if (success) {
    console.log('✅ Database schema verification passed!');
  } else {
    console.error('❌ Database schema verification failed');
    console.error('Errors:', errors);
  }

  const result = {
    success,
    tables,
    errors,
    summary
  };

  // Cache the result if enabled
  if (useCache) {
    localStorage.setItem(cacheKey, JSON.stringify({
      data: result,
      timestamp: Date.now()
    }));
  }

  return result;
}

/**
 * Test basic database operations
 */
export async function testDatabaseOperations(): Promise<{
  success: boolean;
  operations: Array<{ name: string; success: boolean; error?: string }>;
}> {
  console.log('🧪 Testing basic database operations...');

  const operations = [];

  // Test 1: Simple select query
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    operations.push({
      name: 'Basic SELECT query',
      success: !error,
      error: error?.message
    });
  } catch (error) {
    operations.push({
      name: 'Basic SELECT query',
      success: false,
      error: error instanceof Error ? (error as Error).message : 'Unknown error'
    });
  }

  // Test 2: Authentication check
  try {
    const { data, error } = await supabase.auth.getUser();
    operations.push({
      name: 'Authentication check',
      success: !error,
      error: error?.message
    });
  } catch (error) {
    operations.push({
      name: 'Authentication check',
      success: false,
      error: error instanceof Error ? (error as Error).message : 'Unknown error'
    });
  }

  // Test 3: Real-time connection
  try {
    const channel = supabase.channel('test_connection');
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Real-time connection timeout'));
      }, 5000);

      channel.subscribe((status) => {
        clearTimeout(timeout);
        if (status === 'SUBSCRIBED') {
          resolve(true);
        } else {
          reject(new Error(`Real-time subscription failed: ${status}`));
        }
      });
    });

    operations.push({
      name: 'Real-time connection',
      success: true
    });

    supabase.removeChannel(channel);
  } catch (error) {
    operations.push({
      name: 'Real-time connection',
      success: false,
      error: error instanceof Error ? (error as Error).message : 'Unknown error'
    });
  }

  const success = operations.every(op => op.success);

  console.log('🧪 Database operations test results:', operations);

  return {
    success,
    operations
  };
}

/**
 * Run complete database verification
 */
export async function runCompleteVerification(): Promise<{
  schema: VerificationResult;
  operations: { success: boolean; operations: Array<{ name: string; success: boolean; error?: string }> };
  overall_success: boolean;
}> {
  console.log('🚀 Running complete database verification...');

  const schema = await verifyDatabaseSchema();
  const operations = await testDatabaseOperations();

  const overall_success = schema.success && operations.success;

  console.log('🏁 Complete verification finished');
  console.log(`Overall result: ${overall_success ? '✅ PASSED' : '❌ FAILED'}`);

  return {
    schema,
    operations,
    overall_success
  };
}