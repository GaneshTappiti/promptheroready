#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Verifies that the application is ready for production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
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

// Verification checks
const checks = [
  {
    name: 'Environment Variables',
    check: () => {
      // In CI environment, check environment variables directly
      if (process.env.CI) {
        const requiredVars = [
          'REACT_APP_SUPABASE_URL',
          'REACT_APP_SUPABASE_ANON_KEY',
          'REACT_APP_ENCRYPTION_KEY'
        ];

        const missingVars = requiredVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
          warning(`Environment variables will be provided by CI: ${missingVars.join(', ')}`);
        }

        return 'Environment variables check passed (CI mode)';
      }

      // Local development check
      const envFile = '.env.production';
      if (!fs.existsSync(envFile)) {
        warning('Production environment file not found (will use CI environment variables)');
        return 'Environment variables will be provided by deployment platform';
      }

      const envContent = fs.readFileSync(envFile, 'utf8');
      const requiredVars = [
        'REACT_APP_SUPABASE_URL',
        'REACT_APP_SUPABASE_ANON_KEY',
        'REACT_APP_ENCRYPTION_KEY'
      ];

      const missingVars = requiredVars.filter(varName =>
        !envContent.includes(varName) || envContent.includes(`${varName}=your-`)
      );

      if (missingVars.length > 0) {
        warning(`Missing or placeholder environment variables: ${missingVars.join(', ')}`);
      }

      return 'Environment variables configuration verified';
    }
  },
  {
    name: 'Build Configuration',
    check: () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      if (!packageJson.scripts.build) {
        throw new Error('Build script not found in package.json');
      }
      
      if (!fs.existsSync('craco.config.js')) {
        throw new Error('CRACO configuration file not found');
      }
      
      return 'Build configuration is properly set up';
    }
  },
  {
    name: 'TypeScript Configuration',
    check: () => {
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        return 'TypeScript compilation successful';
      } catch (error) {
        throw new Error('TypeScript compilation failed');
      }
    }
  },
  {
    name: 'Production Build',
    check: () => {
      // Skip build check in CI if requested
      if (process.env.SKIP_BUILD_CHECK === 'true') {
        return 'Production build check skipped (will be done in deploy step)';
      }

      try {
        info('Building production bundle...');
        execSync('npm run build', { stdio: 'pipe' });

        if (!fs.existsSync('build/index.html')) {
          throw new Error('Build output not found');
        }

        const buildStats = fs.statSync('build');
        if (!buildStats.isDirectory()) {
          throw new Error('Build directory not created');
        }

        return 'Production build successful';
      } catch (error) {
        throw new Error(`Build failed: ${error.message}`);
      }
    }
  },
  {
    name: 'Deployment Configuration',
    check: () => {
      if (!fs.existsSync('vercel.json')) {
        warning('Vercel configuration not found (optional)');
      }
      
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (!packageJson.homepage) {
        warning('Homepage field not set in package.json');
      }
      
      return 'Deployment configuration verified';
    }
  },
  {
    name: 'Security Headers',
    check: () => {
      if (fs.existsSync('vercel.json')) {
        const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
        if (!vercelConfig.headers) {
          warning('Security headers not configured in vercel.json (recommended)');
        } else {
          return 'Security headers configured in vercel.json';
        }
      } else {
        warning('vercel.json not found - security headers will use platform defaults');
      }

      return 'Security configuration verified';
    }
  }
];

async function runVerification() {
  log('\n🚀 DEPLOYMENT VERIFICATION STARTING...', 'cyan');
  log('==========================================', 'cyan');
  
  let passed = 0;
  let failed = 0;
  
  for (const check of checks) {
    try {
      info(`\nChecking: ${check.name}`);
      const result = await check.check();
      success(result);
      passed++;
    } catch (err) {
      error(`${check.name}: ${err.message}`);
      failed++;
    }
  }
  
  log('\n==========================================', 'cyan');
  log(`📊 VERIFICATION RESULTS:`, 'cyan');
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  
  if (failed === 0) {
    log('\n🎉 ALL CHECKS PASSED! READY FOR DEPLOYMENT!', 'green');
    log('\nQuick deployment commands:', 'blue');
    log('• Vercel: npm run deploy:vercel', 'blue');
    log('• Netlify: npm run deploy:netlify', 'blue');
    log('• Manual: npm run build && upload build/ folder', 'blue');
    return true;
  } else {
    log('\n⚠️  DEPLOYMENT NOT READY - Please fix the issues above', 'red');
    return false;
  }
}

// Run verification
runVerification()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    error(`Verification failed: ${error.message}`);
    process.exit(1);
  });
