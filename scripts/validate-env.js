#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Validates that all required environment variables are present for deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment files manually since we're not in Vite context
function loadEnvFiles() {
  const rootDir = path.resolve(__dirname, '..');
  const envFiles = [
    '.env.local',
    '.env.development',
    '.env'
  ];

  for (const envFile of envFiles) {
    const envPath = path.join(rootDir, envFile);
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
      }
      console.log(`📄 Loaded ${envFile}`);
    }
  }
}

// Load environment files before validation
loadEnvFiles();

// Required environment variables for production
const REQUIRED_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_APP_NAME',
  'VITE_APP_VERSION'
];

// Optional but recommended variables
const RECOMMENDED_VARS = [
  'VITE_ENCRYPTION_KEY',
  'VITE_API_BASE_URL',
  'VITE_ENABLE_ANALYTICS',
  'VITE_ENABLE_ERROR_REPORTING'
];

function validateEnvironment() {
  console.log('🔍 Validating environment variables...');
  
  const missing = [];
  const missingRecommended = [];
  
  // Check required variables (both VITE_ and REACT_APP_ variants)
  REQUIRED_VARS.forEach(varName => {
    const viteVar = process.env[varName];
    const reactVar = process.env[varName.replace('VITE_', 'REACT_APP_')];
    
    if (!viteVar && !reactVar) {
      missing.push(varName);
    } else {
      console.log(`✅ ${varName}: ${viteVar ? 'VITE_' : 'REACT_APP_'} variant found`);
    }
  });
  
  // Check recommended variables
  RECOMMENDED_VARS.forEach(varName => {
    const viteVar = process.env[varName];
    const reactVar = process.env[varName.replace('VITE_', 'REACT_APP_')];
    
    if (!viteVar && !reactVar) {
      missingRecommended.push(varName);
    }
  });
  
  // Report results
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName} (or ${varName.replace('VITE_', 'REACT_APP_')})`);
    });
    
    if (process.env.NODE_ENV === 'production') {
      console.error('🔥 Production build cannot continue without required variables!');
      process.exit(1);
    } else {
      console.warn('⚠️ Development mode: continuing with missing variables...');
    }
  }
  
  if (missingRecommended.length > 0) {
    console.warn('⚠️ Missing recommended environment variables:');
    missingRecommended.forEach(varName => {
      console.warn(`   - ${varName} (or ${varName.replace('VITE_', 'REACT_APP_')})`);
    });
  }
  
  if (missing.length === 0) {
    console.log('✅ All required environment variables are present!');
  }
  
  return missing.length === 0;
}

function createEnvTemplate() {
  console.log('📝 Creating environment template...');
  
  const template = `# Environment Variables Template
# Copy this file to .env.local and fill in your values

# Application Configuration
VITE_APP_NAME="PromptHeroReady"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENVIRONMENT=production

# API Configuration
VITE_API_BASE_URL=https://your-api-domain.com
VITE_API_TIMEOUT=30000

# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Security Configuration (REQUIRED for production)
VITE_ENCRYPTION_KEY=your-32-character-encryption-key

# AI Provider API Keys
VITE_OPENAI_API_KEY=your-openai-key
VITE_GEMINI_API_KEY=your-gemini-key
VITE_CLAUDE_API_KEY=your-claude-key

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_PWA=true

# React App fallback support (for compatibility)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_ENCRYPTION_KEY=your-32-character-encryption-key
`;

  fs.writeFileSync('.env.template', template);
  console.log('✅ Environment template created as .env.template');
}

// Main execution
const isMainModule = import.meta.url === `file://${__filename}`;
if (isMainModule) {
  const args = process.argv.slice(2);

  if (args.includes('--template')) {
    createEnvTemplate();
  } else {
    const isValid = validateEnvironment();

    if (!isValid && process.env.NODE_ENV === 'production') {
      console.error('\n🔥 Environment validation failed for production build!');
      console.log('💡 Run "node scripts/validate-env.js --template" to create a template');
      process.exit(1);
    }
  }
}

export { validateEnvironment, createEnvTemplate };
