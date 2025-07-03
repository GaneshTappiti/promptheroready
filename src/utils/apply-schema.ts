/**
 * Apply Database Schema
 * Script to check and guide schema application
 */

import { supabase } from '@/lib/supabase';

// Check if schema is applied by testing key tables
export async function checkSchemaStatus(): Promise<{
  isApplied: boolean;
  missingTables: string[];
  error?: string;
}> {
  try {
    console.log('🔍 Checking database schema status...');

    const keyTables = [
      'user_profiles',
      'ideas',
      'mvps',
      'documents',
      'teams',
      'projects'
    ];

    const missingTables: string[] = [];

    for (const table of keyTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error && (error.code === '42P01' || error.message.includes('does not exist'))) {
          missingTables.push(table);
        }
      } catch (error) {
        missingTables.push(table);
      }
    }

    const isApplied = missingTables.length === 0;

    if (isApplied) {
      console.log('✅ Database schema appears to be applied');
    } else {
      console.log('❌ Database schema not fully applied');
      console.log('Missing tables:', missingTables);
    }

    return {
      isApplied,
      missingTables
    };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to check schema status:', errorMsg);

    return {
      isApplied: false,
      missingTables: [],
      error: errorMsg
    };
  }
}

export async function getSchemaApplicationInstructions(): Promise<string> {
  const instructions = `
📋 Database Schema Application Instructions

To apply the database schema to your Supabase project:

1. 🌐 Go to your Supabase project dashboard
2. 📝 Navigate to the SQL Editor
3. 📁 Open the file: database/schemas/clean_schema.sql
4. 📋 Copy the entire content
5. 🔧 Paste it into the Supabase SQL Editor
6. ▶️ Click "Run" to execute the schema
7. ✅ Verify all tables are created successfully

Alternative method:
1. 💻 Use Supabase CLI: supabase db reset
2. 📤 Or use: supabase db push

After applying the schema, refresh this page and run the tests again.
`;

  return instructions;
}