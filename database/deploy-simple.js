#!/usr/bin/env node

/**
 * Simple deployment script that outputs the SQL schema for manual execution
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 PromptHeroReady Database Schema Deployment');
console.log('='.repeat(50));

const schemaPath = path.join(__dirname, 'schemas', 'clean_schema.sql');

if (!fs.existsSync(schemaPath)) {
  console.error('❌ Schema file not found:', schemaPath);
  process.exit(1);
}

const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

console.log('✅ Schema loaded successfully');
console.log('📋 Instructions:');
console.log('1. Copy the SQL below');
console.log('2. Go to: https://supabase.com/dashboard/project/dsfikceaftssoaazhvwv/sql');
console.log('3. Paste and execute the SQL');
console.log('4. Run: npm run db:verify');
console.log('');
console.log('='.repeat(80));
console.log('COMPLETE DATABASE SCHEMA - COPY AND PASTE INTO SUPABASE SQL EDITOR');
console.log('='.repeat(80));
console.log('');
console.log(schemaSQL);
console.log('');
console.log('='.repeat(80));
console.log('END OF SCHEMA');
console.log('='.repeat(80));
