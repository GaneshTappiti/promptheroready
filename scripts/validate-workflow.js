#!/usr/bin/env node

/**
 * GitHub Actions Workflow Validation Script
 * Validates the deploy.yml workflow file for common issues
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function validateWorkflow() {
  const workflowPath = '.github/workflows/deploy.yml';
  
  info('🔍 Validating GitHub Actions workflow...');
  
  // Check if file exists
  if (!fs.existsSync(workflowPath)) {
    error('Workflow file not found at .github/workflows/deploy.yml');
    return false;
  }
  
  success('Workflow file found');
  
  // Read and validate content
  const content = fs.readFileSync(workflowPath, 'utf8');
  
  // Basic structure checks
  const checks = [
    {
      name: 'Has workflow name',
      test: () => content.includes('name:'),
      fix: 'Add a name field to your workflow'
    },
    {
      name: 'Has trigger events',
      test: () => content.includes('on:'),
      fix: 'Add trigger events (on: push, pull_request, etc.)'
    },
    {
      name: 'Has jobs section',
      test: () => content.includes('jobs:'),
      fix: 'Add a jobs section to define workflow jobs'
    },
    {
      name: 'Uses supported Node.js version',
      test: () => content.includes("node-version: '18'") || content.includes('NODE_VERSION'),
      fix: 'Use Node.js version 18 or later'
    },
    {
      name: 'Has checkout action',
      test: () => content.includes('actions/checkout@v4'),
      fix: 'Add checkout action to access repository code'
    },
    {
      name: 'Has setup-node action',
      test: () => content.includes('actions/setup-node@v4'),
      fix: 'Add setup-node action to configure Node.js'
    },
    {
      name: 'Has dependency installation',
      test: () => content.includes('npm ci') || content.includes('npm install'),
      fix: 'Add step to install dependencies'
    },
    {
      name: 'Has build step',
      test: () => content.includes('npm run build'),
      fix: 'Add step to build the application'
    },
    {
      name: 'Has deployment step',
      test: () => content.includes('vercel') || content.includes('deploy'),
      fix: 'Add deployment step'
    },
    {
      name: 'Uses caching',
      test: () => content.includes('actions/cache'),
      fix: 'Add caching to improve build performance'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  info('\n📋 Running validation checks...');
  
  checks.forEach(check => {
    if (check.test()) {
      success(check.name);
      passed++;
    } else {
      error(`${check.name} - ${check.fix}`);
      failed++;
    }
  });
  
  // Check for common issues
  info('\n🔍 Checking for common issues...');
  
  if (content.includes('amondnet/vercel-action@v25')) {
    warning('Using older Vercel action version - consider updating to vercel/action@v1');
  } else {
    success('Using current Vercel action version');
  }
  
  if (content.includes('ubuntu-latest')) {
    success('Using ubuntu-latest runner');
  } else {
    warning('Consider using ubuntu-latest for better compatibility');
  }
  
  if (content.includes('timeout-minutes')) {
    success('Has timeout configuration');
  } else {
    warning('Consider adding timeout-minutes to prevent hanging jobs');
  }
  
  // Summary
  info('\n📊 Validation Summary:');
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  
  if (failed === 0) {
    success('\n🎉 Workflow validation passed! Your deployment workflow looks good.');
    return true;
  } else {
    error('\n⚠️  Workflow has issues that should be addressed.');
    return false;
  }
}

// Run validation
const isValid = validateWorkflow();
process.exit(isValid ? 0 : 1);
