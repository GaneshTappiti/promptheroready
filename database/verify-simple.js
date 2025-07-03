#!/usr/bin/env node

/**
 * Simple verification script for database deployment
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔍 PromptHeroReady Database Verification');
console.log('=======================================');

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase configuration');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_KEY');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
console.log(`🔑 API Key: ${SUPABASE_KEY.substring(0, 20)}...`);

// Expected tables
const EXPECTED_TABLES = [
  'user_profiles',
  'user_onboarding_profiles', 
  'user_ai_preferences',
  'user_preferences',
  'user_subscriptions',
  'usage_tracking',
  'subscription_plans',
  'ideas',
  'wiki_pages',
  'journey_entries',
  'feedback_items',
  'mvps',
  'prompt_history',
  'ai_tools',
  'documents',
  'document_templates',
  'teams',
  'team_members',
  'team_tasks',
  'team_messages',
  'messages',
  'team_meetings',
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

async function testConnection() {
  try {
    console.log('\n🔄 Testing Supabase connection...');
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Try a simple query
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('⚠️  Tables not yet created - this is expected before schema deployment');
        return { connected: true, tablesExist: false };
      } else {
        console.error('❌ Connection error:', error.message);
        return { connected: false, tablesExist: false };
      }
    }
    
    console.log('✅ Supabase connection successful');
    console.log('✅ Tables appear to be created');
    return { connected: true, tablesExist: true };
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return { connected: false, tablesExist: false };
  }
}

async function checkTables() {
  try {
    console.log('\n🔄 Checking table existence...');
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    let existingTables = 0;
    const results = [];
    
    for (const tableName of EXPECTED_TABLES) {
      try {
        const { data, error } = await supabase.from(tableName).select('*').limit(1);
        
        if (error) {
          if (error.message.includes('does not exist')) {
            results.push({ table: tableName, exists: false, error: 'Table does not exist' });
          } else {
            results.push({ table: tableName, exists: true, error: error.message });
            existingTables++;
          }
        } else {
          results.push({ table: tableName, exists: true, error: null });
          existingTables++;
        }
      } catch (err) {
        results.push({ table: tableName, exists: false, error: err.message });
      }
    }
    
    console.log(`\n📊 Table Status: ${existingTables}/${EXPECTED_TABLES.length} tables exist`);
    
    if (existingTables === 0) {
      console.log('\n⚠️  No tables found. Please execute the schema in Supabase SQL Editor:');
      console.log('1. Go to: https://supabase.com/dashboard/project/dsfikceaftssoaazhvwv/sql');
      console.log('2. Run: npm run db:deploy');
      console.log('3. Copy and paste the generated SQL');
      console.log('4. Execute the SQL in Supabase');
      console.log('5. Run this verification again');
    } else if (existingTables < EXPECTED_TABLES.length) {
      console.log('\n⚠️  Some tables are missing:');
      results.filter(r => !r.exists).forEach(r => {
        console.log(`   ❌ ${r.table}`);
      });
    } else {
      console.log('\n🎉 All tables exist! Database is ready.');
    }
    
    return { existingTables, totalTables: EXPECTED_TABLES.length, results };
    
  } catch (error) {
    console.error('❌ Table check failed:', error.message);
    return { existingTables: 0, totalTables: EXPECTED_TABLES.length, results: [] };
  }
}

async function main() {
  try {
    // Test connection
    const connectionResult = await testConnection();
    
    if (!connectionResult.connected) {
      console.error('\n❌ Cannot proceed without Supabase connection');
      process.exit(1);
    }
    
    // Check tables
    const tableResult = await checkTables();
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    
    if (tableResult.existingTables === tableResult.totalTables) {
      console.log('🎉 SUCCESS: All database tables are deployed!');
      console.log('🚀 Your application is ready for production use.');
    } else {
      console.log(`⚠️  INCOMPLETE: ${tableResult.existingTables}/${tableResult.totalTables} tables deployed`);
      console.log('📋 Next steps:');
      console.log('   1. Run: npm run db:deploy');
      console.log('   2. Copy the SQL output');
      console.log('   3. Execute in Supabase SQL Editor');
      console.log('   4. Run this verification again');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Run the verification
main();
