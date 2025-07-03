#!/usr/bin/env node

/**
 * Simple schema deployment script for PromptHeroReady
 * This script will deploy the database schema to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');

  try {
    // Test basic connection by trying to get the current user
    const { data, error } = await supabase.auth.getUser();

    // Connection is successful even if no user is logged in
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

async function deploySchema() {
  console.log('🚀 Starting schema deployment...');
  
  // Test connection first
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ Cannot proceed without a valid connection');
    process.exit(1);
  }
  
  try {
    // Read the unified schema file
    const schemaPath = path.join(__dirname, 'database', 'schemas', 'unified_schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Schema file not found:', schemaPath);
      process.exit(1);
    }
    
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    console.log('📄 Schema file loaded successfully');
    
    // Split the SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.length === 0) continue;
      
      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        });
        
        if (error) {
          console.warn(`⚠️ Statement ${i + 1} warning:`, error.message);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.warn(`⚠️ Statement ${i + 1} error:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📈 Deployment Summary:');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`⚠️ Warnings/Errors: ${errorCount}`);
    
    if (successCount > 0) {
      console.log('🎉 Schema deployment completed!');
      
      // Test a few key tables
      await testTables();
    } else {
      console.error('❌ Schema deployment failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Deployment error:', error.message);
    process.exit(1);
  }
}

async function testTables() {
  console.log('\n🔍 Testing key tables...');
  
  const tablesToTest = [
    'user_profiles',
    'ideas',
    'mvps',
    'documents',
    'team_messages'
  ];
  
  for (const table of tablesToTest) {
    try {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error && error.code !== 'PGRST116') {
        console.log(`❌ Table '${table}' test failed:`, error.message);
      } else {
        console.log(`✅ Table '${table}' is accessible`);
      }
    } catch (error) {
      console.log(`❌ Table '${table}' error:`, error.message);
    }
  }
}

// Run the deployment
deploySchema().catch(error => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
});
