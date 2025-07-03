#!/usr/bin/env node

/**
 * =====================================================
 * ENVIRONMENT SETUP SCRIPT
 * =====================================================
 * Interactive script to help set up environment variables for database deployment
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Utility functions
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  step: (msg) => console.log(`🔄 ${msg}`)
};

// Prompt user for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Validate URL format
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Check if .env file exists
function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  return fs.existsSync(envPath);
}

// Read existing .env file
function readEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });

  return env;
}

// Write .env file
function writeEnvFile(envVars) {
  const envPath = path.join(process.cwd(), '.env');
  const content = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(envPath, content + '\n');
}

// Main setup function
async function setupEnvironment() {
  console.log(`
🚀 PromptHeroReady Database Environment Setup
============================================

This script will help you set up environment variables for database deployment.
You'll need your Supabase project details for each environment.

`);

  try {
    // Check existing .env file
    const existingEnv = readEnvFile();
    const hasExisting = Object.keys(existingEnv).length > 0;

    if (hasExisting) {
      log.info('Found existing .env file with the following variables:');
      Object.keys(existingEnv).forEach(key => {
        if (key.includes('SUPABASE')) {
          console.log(`  ${key}=${existingEnv[key].substring(0, 20)}...`);
        }
      });
      console.log();

      const overwrite = await prompt('Do you want to update the existing configuration? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        log.info('Setup cancelled. Existing configuration preserved.');
        rl.close();
        return;
      }
    }

    const envVars = { ...existingEnv };

    // Setup development environment
    log.step('Setting up Development Environment');
    console.log('Please provide your Supabase development project details:');
    
    const devUrl = await prompt('Development Supabase URL (https://xxx.supabase.co): ');
    if (!isValidUrl(devUrl)) {
      throw new Error('Invalid URL format for development environment');
    }
    envVars.VITE_SUPABASE_URL_DEV = devUrl;

    const devKey = await prompt('Development Supabase Anon Key: ');
    if (!devKey || devKey.length < 50) {
      throw new Error('Invalid anon key for development environment');
    }
    envVars.VITE_SUPABASE_KEY_DEV = devKey;

    const devProjectId = await prompt('Development Project ID: ');
    if (!devProjectId) {
      throw new Error('Project ID is required for development environment');
    }
    envVars.SUPABASE_PROJECT_ID_DEV = devProjectId;

    // Ask about staging environment
    const needStaging = await prompt('\nDo you have a staging environment? (y/N): ');
    if (needStaging.toLowerCase() === 'y') {
      log.step('Setting up Staging Environment');
      
      const stagingUrl = await prompt('Staging Supabase URL: ');
      if (isValidUrl(stagingUrl)) {
        envVars.VITE_SUPABASE_URL_STAGING = stagingUrl;
        
        const stagingKey = await prompt('Staging Supabase Anon Key: ');
        envVars.VITE_SUPABASE_KEY_STAGING = stagingKey;
        
        const stagingProjectId = await prompt('Staging Project ID: ');
        envVars.SUPABASE_PROJECT_ID_STAGING = stagingProjectId;
      } else {
        log.warning('Invalid staging URL, skipping staging environment');
      }
    }

    // Ask about production environment
    const needProduction = await prompt('\nDo you have a production environment? (y/N): ');
    if (needProduction.toLowerCase() === 'y') {
      log.step('Setting up Production Environment');
      
      const prodUrl = await prompt('Production Supabase URL: ');
      if (isValidUrl(prodUrl)) {
        envVars.VITE_SUPABASE_URL = prodUrl;
        
        const prodKey = await prompt('Production Supabase Anon Key: ');
        envVars.VITE_SUPABASE_KEY = prodKey;
        
        const prodProjectId = await prompt('Production Project ID: ');
        envVars.SUPABASE_PROJECT_ID = prodProjectId;
      } else {
        log.warning('Invalid production URL, skipping production environment');
      }
    }

    // Ask about additional environment variables
    const needGemini = await prompt('\nDo you want to add Gemini API key? (y/N): ');
    if (needGemini.toLowerCase() === 'y') {
      const geminiKey = await prompt('Gemini API Key: ');
      if (geminiKey) {
        envVars.VITE_GEMINI_API_KEY = geminiKey;
      }
    }

    // Write the .env file
    writeEnvFile(envVars);
    log.success('.env file created/updated successfully!');

    // Show summary
    console.log('\n📋 Environment Summary:');
    console.log('======================');
    
    if (envVars.VITE_SUPABASE_URL_DEV) {
      console.log('✅ Development environment configured');
    }
    if (envVars.VITE_SUPABASE_URL_STAGING) {
      console.log('✅ Staging environment configured');
    }
    if (envVars.VITE_SUPABASE_URL) {
      console.log('✅ Production environment configured');
    }
    if (envVars.VITE_GEMINI_API_KEY) {
      console.log('✅ Gemini API key configured');
    }

    console.log('\n🚀 Next Steps:');
    console.log('==============');
    console.log('1. Deploy to development:');
    console.log('   npm run db:deploy:dev');
    console.log('');
    console.log('2. Verify deployment:');
    console.log('   npm run db:deploy:verify');
    console.log('');
    console.log('3. Generate TypeScript types:');
    console.log('   npm run db:types');
    console.log('');
    console.log('4. Start your application:');
    console.log('   npm run dev');

  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Show help
function showHelp() {
  console.log(`
🚀 Environment Setup Script

Usage:
  node setup-environment.js [options]

Options:
  --help    Show this help message

This script will interactively guide you through setting up environment
variables for your PromptHeroReady database deployment.

Required for each environment:
- Supabase URL (https://xxx.supabase.co)
- Supabase Anon Key
- Supabase Project ID

Optional:
- Gemini API Key (for AI features)
`);
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.includes('--help')) {
  showHelp();
  process.exit(0);
}

// Run the setup
if (require.main === module) {
  setupEnvironment();
}

module.exports = { setupEnvironment };
