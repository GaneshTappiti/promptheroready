#!/usr/bin/env node

/**
 * Quick deployment script to fix the SSR issues
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Deploying SSR fixes...');

try {
  // Ensure we have the latest build
  console.log('📦 Building application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Check if vercel CLI is available
  try {
    execSync('npx vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI available');
    
    // Deploy to Vercel
    console.log('🚀 Deploying to Vercel...');
    execSync('npx vercel --prod --yes', { stdio: 'inherit' });
    
  } catch (vercelError) {
    console.log('⚠️ Vercel CLI not configured or not available');
    console.log('📋 Manual deployment steps:');
    console.log('1. Go to https://vercel.com/dashboard');
    console.log('2. Import this repository');
    console.log('3. Set environment variables:');
    console.log('   - VITE_SUPABASE_URL');
    console.log('   - VITE_SUPABASE_ANON_KEY');
    console.log('4. Deploy');
  }

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
