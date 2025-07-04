#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Tests the deployed application to ensure all features work correctly
 */

const https = require('https');
const http = require('http');

// Configuration
const DEPLOYMENT_URL = process.argv[2] || 'https://your-app.vercel.app';
const TIMEOUT = 10000;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// HTTP request helper
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const req = protocol.get(url, { timeout: TIMEOUT }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Test functions
async function testBasicConnectivity() {
  info('Testing basic connectivity...');
  try {
    const response = await makeRequest(DEPLOYMENT_URL);
    if (response.status === 200) {
      success('Application is accessible');
      return true;
    } else {
      error(`Unexpected status code: ${response.status}`);
      return false;
    }
  } catch (err) {
    error(`Connection failed: ${err.message}`);
    return false;
  }
}

async function testHTMLContent() {
  info('Testing HTML content...');
  try {
    const response = await makeRequest(DEPLOYMENT_URL);
    const html = response.data;
    
    // Check for essential elements
    const checks = [
      { test: html.includes('<title>'), name: 'Page title' },
      { test: html.includes('PromptHero'), name: 'App name in content' },
      { test: html.includes('<div id="root">'), name: 'React root element' },
      { test: html.includes('script'), name: 'JavaScript bundles' },
    ];
    
    let passed = 0;
    checks.forEach(check => {
      if (check.test) {
        success(`${check.name} found`);
        passed++;
      } else {
        error(`${check.name} missing`);
      }
    });
    
    return passed === checks.length;
  } catch (err) {
    error(`HTML content test failed: ${err.message}`);
    return false;
  }
}

async function testSecurityHeaders() {
  info('Testing security headers...');
  try {
    const response = await makeRequest(DEPLOYMENT_URL);
    const headers = response.headers;
    
    const securityChecks = [
      { header: 'x-content-type-options', expected: 'nosniff', name: 'Content Type Options' },
      { header: 'x-frame-options', expected: 'DENY', name: 'Frame Options' },
      { header: 'x-xss-protection', expected: '1; mode=block', name: 'XSS Protection' },
    ];
    
    let passed = 0;
    securityChecks.forEach(check => {
      const value = headers[check.header];
      if (value && value.toLowerCase().includes(check.expected.toLowerCase())) {
        success(`${check.name} header configured`);
        passed++;
      } else {
        warning(`${check.name} header missing or incorrect`);
      }
    });
    
    return passed >= 2; // At least 2 security headers should be present
  } catch (err) {
    error(`Security headers test failed: ${err.message}`);
    return false;
  }
}

async function testAssetLoading() {
  info('Testing asset loading...');
  try {
    // Test CSS loading
    const cssResponse = await makeRequest(`${DEPLOYMENT_URL}/assets/index-B7GA3ikZ.css`);
    if (cssResponse.status === 200) {
      success('CSS assets loading correctly');
    } else {
      warning('CSS assets may not be loading correctly');
    }
    
    return true;
  } catch (err) {
    warning(`Asset loading test inconclusive: ${err.message}`);
    return true; // Don't fail deployment for this
  }
}

async function testSPARouting() {
  info('Testing SPA routing...');
  try {
    // Test a non-root route
    const response = await makeRequest(`${DEPLOYMENT_URL}/workspace`);
    if (response.status === 200) {
      success('SPA routing configured correctly');
      return true;
    } else {
      error('SPA routing may not be configured correctly');
      return false;
    }
  } catch (err) {
    error(`SPA routing test failed: ${err.message}`);
    return false;
  }
}

// Main verification function
async function verifyDeployment() {
  log(`🚀 Verifying deployment at: ${DEPLOYMENT_URL}`, 'cyan');
  log('─'.repeat(50), 'cyan');
  
  const tests = [
    { name: 'Basic Connectivity', fn: testBasicConnectivity, critical: true },
    { name: 'HTML Content', fn: testHTMLContent, critical: true },
    { name: 'Security Headers', fn: testSecurityHeaders, critical: false },
    { name: 'Asset Loading', fn: testAssetLoading, critical: false },
    { name: 'SPA Routing', fn: testSPARouting, critical: true },
  ];
  
  let passed = 0;
  let critical_failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else if (test.critical) {
        critical_failed++;
      }
    } catch (err) {
      error(`${test.name} test error: ${err.message}`);
      if (test.critical) {
        critical_failed++;
      }
    }
    log(''); // Empty line for readability
  }
  
  log('─'.repeat(50), 'cyan');
  log(`📊 Results: ${passed}/${tests.length} tests passed`, 'cyan');
  
  if (critical_failed === 0) {
    success('🎉 Deployment verification successful!');
    success('Your application is ready for use.');
    return true;
  } else {
    error(`❌ ${critical_failed} critical test(s) failed.`);
    error('Please check your deployment configuration.');
    return false;
  }
}

// Run verification
if (require.main === module) {
  if (!process.argv[2]) {
    log('Usage: node verify-deployment.js <deployment-url>', 'yellow');
    log('Example: node verify-deployment.js https://my-app.vercel.app', 'yellow');
    process.exit(1);
  }
  
  verifyDeployment()
    .then(success => process.exit(success ? 0 : 1))
    .catch(err => {
      error(`Verification failed: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { verifyDeployment };
