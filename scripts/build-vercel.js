#!/usr/bin/env node

/**
 * Custom build script for Vercel to handle Rollup native dependency issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build process...');

// Validate environment variables first
console.log('🔍 Validating environment variables...');
try {
  // Run validation as a separate process since this is CommonJS
  execSync('node scripts/validate-env.js', { stdio: 'inherit' });
  console.log('✅ Environment validation passed');
} catch (envError) {
  console.warn('⚠️ Environment validation failed, but continuing build...');
}

// Set environment variables to force npm to handle optional dependencies correctly
process.env.npm_config_optional = 'false';
process.env.ROLLUP_NO_NATIVE = 'true';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

try {
  // Clean up any existing problematic files
  console.log('🧹 Cleaning up existing files...');
  try {
    if (fs.existsSync('package-lock.json')) {
      fs.unlinkSync('package-lock.json');
      console.log('✅ Removed package-lock.json');
    }
    if (fs.existsSync('node_modules')) {
      execSync('rm -rf node_modules', { stdio: 'inherit' });
      console.log('✅ Removed node_modules');
    }
  } catch (cleanupError) {
    console.log('⚠️ Cleanup warning:', cleanupError.message);
  }

  // Install dependencies with specific flags
  console.log('📦 Installing dependencies...');
  execSync('npm install --no-optional --force --legacy-peer-deps', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_optional: 'false',
      npm_config_fund: 'false',
      npm_config_audit: 'false'
    }
  });

  // Install Rollup native dependencies explicitly
  console.log('🔧 Installing Rollup native dependencies...');
  try {
    execSync('npm install @rollup/rollup-linux-x64-gnu --save-dev --force', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        npm_config_optional: 'false'
      }
    });
    console.log('✅ Rollup native dependencies installed');
  } catch (rollupError) {
    console.log('⚠️ Rollup native install failed, continuing with JS fallback...');
  }

  // Run TypeScript compilation
  console.log('🔨 Running TypeScript compilation...');
  execSync('npx tsc -b', { stdio: 'inherit' });

  // Run Vite build
  console.log('⚡ Running Vite build...');
  execSync('npx vite build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      ROLLUP_NO_NATIVE: 'true'
    }
  });

  console.log('🎉 Build completed successfully!');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
