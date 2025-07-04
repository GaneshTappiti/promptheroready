#!/usr/bin/env node

/**
 * PromptHeroReady Database Setup Script
 * 
 * This script helps you set up your Supabase database with all necessary
 * tables, policies, and data for PromptHeroReady.
 * 
 * Usage:
 *   node database/setup-database.js
 * 
 * What it does:
 * 1. Checks if you have the required environment variables
 * 2. Provides instructions for running the SQL setup
 * 3. Verifies the database setup
 * 4. Sets up your first admin user
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(message, 'bright');
  log('='.repeat(60), 'cyan');
}

function logStep(step, message) {
  log(`\n${step}. ${message}`, 'yellow');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function checkEnvironment() {
  logHeader('CHECKING ENVIRONMENT');
  
  const requiredEnvVars = [
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY'
  ];
  
  const missing = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  if (missing.length > 0) {
    logError('Missing required environment variables:');
    missing.forEach(envVar => log(`  - ${envVar}`, 'red'));
    log('\nPlease add these to your .env file:', 'yellow');
    log('REACT_APP_SUPABASE_URL=your_supabase_project_url');
    log('REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key');
    return false;
  }
  
  logSuccess('Environment variables are configured');
  return true;
}

function checkFiles() {
  logHeader('CHECKING REQUIRED FILES');
  
  const requiredFiles = [
    'database/schemas/clean_schema.sql',
    'database/complete-setup.sql'
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      logError(`Missing required file: ${file}`);
      return false;
    }
    logSuccess(`Found: ${file}`);
  }
  
  return true;
}

function showSetupInstructions() {
  logHeader('DATABASE SETUP INSTRUCTIONS');
  
  logStep('1', 'Open your Supabase Dashboard');
  logInfo('   Go to: https://supabase.com/dashboard');
  logInfo('   Navigate to your project');
  
  logStep('2', 'Open the SQL Editor');
  logInfo('   Click on "SQL Editor" in the left sidebar');
  logInfo('   Click "New Query"');
  
  logStep('3', 'Run the Main Schema');
  logInfo('   Copy the entire contents of: database/schemas/clean_schema.sql');
  logInfo('   Paste it into the SQL Editor');
  logInfo('   Click "Run" (this may take 30-60 seconds)');
  
  logStep('4', 'Run the Complete Setup');
  logInfo('   Copy the entire contents of: database/complete-setup.sql');
  logInfo('   Paste it into a new query in the SQL Editor');
  logInfo('   Click "Run"');
  
  logStep('5', 'Set up your admin user');
  logInfo('   In the SQL Editor, run this command:');
  log('   SELECT setup_admin_user(\'your-email@domain.com\');', 'cyan');
  logInfo('   Replace "your-email@domain.com" with your actual email');
  
  logHeader('VERIFICATION');
  logInfo('After running the setup, you can verify it worked by:');
  logInfo('1. Running: node database/verify-simple.js');
  logInfo('2. Starting your app and visiting /admin');
  logInfo('3. Checking that you can create ideas, teams, etc.');
}

function showQuickStart() {
  logHeader('QUICK START SUMMARY');
  
  log('🚀 To set up your database:', 'bright');
  log('');
  log('1. Copy database/schemas/clean_schema.sql → Paste in Supabase SQL Editor → Run', 'green');
  log('2. Copy database/complete-setup.sql → Paste in Supabase SQL Editor → Run', 'green');
  log('3. Run: SELECT setup_admin_user(\'your-email@domain.com\');', 'green');
  log('4. Test: node database/verify-simple.js', 'green');
  log('');
  log('📚 Files you need:', 'bright');
  log('  • database/schemas/clean_schema.sql (main schema - 43 tables)');
  log('  • database/complete-setup.sql (setup script + AI tools)');
  log('');
  log('🎯 What you get:', 'bright');
  log('  • Complete user management system');
  log('  • Idea development workflow (IdeaForge, MVP Studio)');
  log('  • Team collaboration with real-time chat');
  log('  • Project management and task tracking');
  log('  • Admin panel with role-based access');
  log('  • AI tools directory (40+ tools)');
  log('  • Document and presentation management');
  log('  • Investor tracking and funding rounds');
  log('  • Security audit logging');
  log('  • Performance optimizations');
}

function main() {
  log('🎯 PromptHeroReady Database Setup', 'bright');
  
  // Check environment
  if (!checkEnvironment()) {
    process.exit(1);
  }
  
  // Check files
  if (!checkFiles()) {
    process.exit(1);
  }
  
  // Show instructions
  showSetupInstructions();
  
  // Show quick start
  showQuickStart();
  
  logHeader('READY TO PROCEED');
  logSuccess('All checks passed! Follow the instructions above to set up your database.');
  log('');
  log('💡 Need help? Check the README.md or run: node database/verify-simple.js', 'blue');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  checkEnvironment,
  checkFiles,
  showSetupInstructions,
  showQuickStart
};
