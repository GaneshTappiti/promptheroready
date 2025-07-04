#!/usr/bin/env node

/**
 * Production Deployment Script
 * Handles environment-specific builds and deployments
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Configuration
const ENVIRONMENTS = {
  development: {
    envFile: '.env.development',
    buildCommand: 'npm run build',
    outputDir: 'dist',
  },
  staging: {
    envFile: '.env.staging',
    buildCommand: 'npm run build',
    outputDir: 'dist',
  },
  production: {
    envFile: '.env.production',
    buildCommand: 'npm run build:production',
    outputDir: 'dist',
  }
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function error(message) {
  log(`❌ ${message}`, 'red')
}

function success(message) {
  log(`✅ ${message}`, 'green')
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue')
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

// Get command line arguments
const args = process.argv.slice(2)
const environment = args[0] || 'production'
const skipTests = args.includes('--skip-tests')
const skipLint = args.includes('--skip-lint')
const analyze = args.includes('--analyze')

// Validate environment
if (!ENVIRONMENTS[environment]) {
  error(`Invalid environment: ${environment}`)
  error(`Available environments: ${Object.keys(ENVIRONMENTS).join(', ')}`)
  process.exit(1)
}

const config = ENVIRONMENTS[environment]

async function main() {
  try {
    log(`🚀 Starting deployment for ${environment} environment`, 'cyan')
    
    // Step 1: Validate environment
    await validateEnvironment()
    
    // Step 2: Run pre-deployment checks
    await preDeploymentChecks()
    
    // Step 3: Build the application
    await buildApplication()
    
    // Step 4: Post-build validation
    await postBuildValidation()
    
    // Step 5: Bundle analysis (if requested)
    if (analyze) {
      await analyzeBundle()
    }
    
    success(`🎉 Deployment preparation completed for ${environment}!`)
    
    // Step 6: Show next steps
    showNextSteps()
    
  } catch (err) {
    error(`Deployment failed: ${err.message}`)
    process.exit(1)
  }
}

async function validateEnvironment() {
  info('Validating environment configuration...')
  
  // Check if environment file exists
  if (!fs.existsSync(config.envFile)) {
    error(`Environment file not found: ${config.envFile}`)
    throw new Error(`Missing environment file: ${config.envFile}`)
  }
  
  // Check required environment variables
  const envContent = fs.readFileSync(config.envFile, 'utf8')
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_ENCRYPTION_KEY'
  ]
  
  const missingVars = requiredVars.filter(varName => {
    const regex = new RegExp(`^${varName}=.+`, 'm')
    return !regex.test(envContent) || envContent.includes(`${varName}=your-`)
  })
  
  if (missingVars.length > 0) {
    error(`Missing or incomplete environment variables: ${missingVars.join(', ')}`)
    throw new Error('Environment validation failed')
  }
  
  success('Environment configuration validated')
}

async function preDeploymentChecks() {
  info('Running pre-deployment checks...')
  
  // Check Node.js version
  const nodeVersion = process.version
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
  if (majorVersion < 18) {
    warning(`Node.js version ${nodeVersion} detected. Recommended: 18+`)
  }
  
  // Install dependencies
  info('Installing dependencies...')
  execSync('npm ci', { stdio: 'inherit' })
  
  // Run type checking
  info('Running type checking...')
  execSync('npm run type-check', { stdio: 'inherit' })
  
  // Run linting (unless skipped)
  if (!skipLint) {
    info('Running linting...')
    execSync('npm run lint', { stdio: 'inherit' })
  } else {
    warning('Skipping linting')
  }
  
  // Run tests (unless skipped)
  if (!skipTests) {
    info('Running tests...')
    execSync('npm test -- --run', { stdio: 'inherit' })
  } else {
    warning('Skipping tests')
  }
  
  success('Pre-deployment checks completed')
}

async function buildApplication() {
  info(`Building application for ${environment}...`)
  
  // Copy environment file to .env for build
  fs.copyFileSync(config.envFile, '.env')
  
  // Set NODE_ENV
  process.env.NODE_ENV = environment === 'development' ? 'development' : 'production'
  
  // Run build command
  execSync(config.buildCommand, { stdio: 'inherit' })
  
  success('Application built successfully')
}

async function postBuildValidation() {
  info('Validating build output...')
  
  const distPath = path.resolve(config.outputDir)
  
  // Check if dist directory exists
  if (!fs.existsSync(distPath)) {
    throw new Error(`Build output directory not found: ${distPath}`)
  }
  
  // Check if index.html exists
  const indexPath = path.join(distPath, 'index.html')
  if (!fs.existsSync(indexPath)) {
    throw new Error('index.html not found in build output')
  }
  
  // Check build size
  const stats = fs.statSync(distPath)
  const buildSize = execSync(`du -sh ${distPath}`, { encoding: 'utf8' }).split('\t')[0]
  info(`Build size: ${buildSize}`)
  
  // Check for critical files
  const criticalFiles = ['assets', 'favicon.ico']
  const missingFiles = criticalFiles.filter(file => 
    !fs.existsSync(path.join(distPath, file))
  )
  
  if (missingFiles.length > 0) {
    warning(`Missing files in build: ${missingFiles.join(', ')}`)
  }
  
  success('Build output validated')
}

async function analyzeBundle() {
  info('Analyzing bundle size...')
  
  try {
    execSync('npm run analyze', { stdio: 'inherit' })
    success('Bundle analysis completed')
  } catch (err) {
    warning('Bundle analysis failed or not configured')
  }
}

function showNextSteps() {
  log('\n📋 Next Steps:', 'cyan')
  log('1. Review the build output in the dist/ directory')
  log('2. Test the build locally: npm run preview')
  log('3. Deploy to your hosting platform')
  log('4. Update DNS settings if needed')
  log('5. Monitor application performance')
  
  if (environment === 'production') {
    log('\n🔒 Production Checklist:', 'yellow')
    log('- Verify all environment variables are set correctly')
    log('- Ensure HTTPS is enabled')
    log('- Configure proper caching headers')
    log('- Set up monitoring and error tracking')
    log('- Test all critical user flows')
  }
}

// Run the deployment script
main().catch(err => {
  error(`Deployment script failed: ${err.message}`)
  process.exit(1)
})
