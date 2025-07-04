#!/usr/bin/env node

/**
 * Simple Supabase Connection Test
 * Tests basic connectivity to Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.development' });

// Get Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...');
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n🔗 Testing basic connection...');
    
    // Test 1: Basic health check
    const { data: healthData, error: healthError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    if (healthError) {
      console.log('⚠️  user_profiles table test:', healthError.message);
    } else {
      console.log('✅ Basic connection working');
    }

    // Test 2: Check if user_ai_preferences table exists
    console.log('\n📋 Testing user_ai_preferences table...');
    const { data: apiData, error: apiError } = await supabase
      .from('user_ai_preferences')
      .select('id')
      .limit(1);

    if (apiError) {
      if (apiError.message.includes('does not exist')) {
        console.log('❌ user_ai_preferences table does not exist');
        console.log('💡 Run the migration: node scripts/run-migration.js');
      } else {
        console.log('⚠️  Table access issue:', apiError.message);
      }
    } else {
      console.log('✅ user_ai_preferences table accessible');
    }

    // Test 3: Authentication status
    console.log('\n🔐 Testing authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('⚠️  Auth error:', authError.message);
    } else if (user) {
      console.log('✅ User authenticated:', user.email);
    } else {
      console.log('ℹ️  No user logged in (normal for server-side test)');
    }

    console.log('\n🎉 Supabase connection test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Start your application: npm start');
    console.log('2. Navigate to /api-key-test');
    console.log('3. Test your API key configuration');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

testConnection();
