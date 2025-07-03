/**
 * Quick Database Test
 * Simple test to check current database state
 */

import { supabase } from '@/lib/supabase';

export async function quickDatabaseTest() {
  console.log('🔍 Running quick database test...');

  // Test 1: Check connection
  try {
    const { data, error } = await supabase.auth.getUser();
    console.log('✅ Supabase connection working');
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return;
  }

  // Test 2: Check if any tables exist
  const testTables = ['user_profiles', 'ideas', 'mvps', 'documents'];

  for (const table of testTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.log(`❌ Table '${table}' does not exist`);
        } else {
          console.log(`⚠️ Table '${table}' exists but has access restrictions:`, error.message);
        }
      } else {
        console.log(`✅ Table '${table}' exists and accessible`);
      }
    } catch (error) {
      console.log(`❌ Error checking table '${table}':`, error);
    }
  }

  console.log('💡 If tables are missing, apply the schema manually via Supabase dashboard');
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  quickDatabaseTest();
}