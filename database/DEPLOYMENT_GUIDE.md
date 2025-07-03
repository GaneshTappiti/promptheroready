# 🚀 Database Deployment Guide

This guide provides step-by-step instructions for deploying the PromptHeroReady database to Supabase using our automated deployment scripts.

## 📋 Prerequisites

### 1. Required Tools
- **Node.js** (v16 or later)
- **Supabase CLI** (`npm install -g supabase`)
- **Git** (for version control)

### 2. Environment Variables
Set up the following environment variables in your `.env` file:

```env
# Development Environment
VITE_SUPABASE_URL_DEV=https://your-dev-project.supabase.co
VITE_SUPABASE_KEY_DEV=your-dev-anon-key
SUPABASE_PROJECT_ID_DEV=your-dev-project-id

# Staging Environment (optional)
VITE_SUPABASE_URL_STAGING=https://your-staging-project.supabase.co
VITE_SUPABASE_KEY_STAGING=your-staging-anon-key
SUPABASE_PROJECT_ID_STAGING=your-staging-project-id

# Production Environment
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_KEY=your-prod-anon-key
SUPABASE_PROJECT_ID=your-prod-project-id
```

### 3. Supabase Project Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Note down your project URL and anon key
3. Enable the required extensions (done automatically by our scripts)

## 🎯 Quick Start

### Option 1: Using NPM Scripts (Recommended)

```bash
# Fresh installation (new database)
npm run db:deploy:fresh

# Run pending migrations (existing database)
npm run db:deploy:migrate

# Verify deployment files
npm run db:deploy:verify

# Deploy to specific environment
npm run db:deploy:dev      # Development
npm run db:deploy:staging  # Staging
npm run db:deploy:prod     # Production
```

### Option 2: Using Direct Scripts

```bash
# Node.js script (cross-platform)
node database/deploy-database.js --fresh --env dev

# PowerShell script (Windows)
.\database\deploy-database.ps1 -Fresh -Environment dev
```

## 📊 Deployment Options

### 1. Fresh Installation
Use this for new Supabase projects:

```bash
# Deploy complete schema and all migrations
npm run db:deploy:fresh

# Or with specific environment
node database/deploy-database.js --fresh --env prod
```

**What it does:**
- ✅ Deploys unified database schema (42 tables)
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Creates performance indexes
- ✅ Enables real-time subscriptions
- ✅ Runs all migrations
- ✅ Inserts default data (subscription plans, admin roles)

### 2. Incremental Migrations
Use this for existing databases:

```bash
# Run only pending migrations
npm run db:deploy:migrate

# Or with specific environment
node database/deploy-database.js --migrate --env prod
```

**What it does:**
- ✅ Checks for pending migrations
- ✅ Runs migrations in correct order
- ✅ Updates migration tracking
- ✅ Validates schema integrity

### 3. Verification
Check deployment status without making changes:

```bash
# Verify deployment files and status
npm run db:deploy:verify
```

**What it shows:**
- 📊 Available schema files
- 📊 Migration files count
- 📊 Setup scripts status
- 📊 Environment configuration

## 🔧 Manual Deployment (Alternative)

If automated scripts don't work, you can deploy manually:

### Step 1: Deploy Main Schema
1. Open Supabase SQL Editor
2. Copy content from `database/schemas/unified_schema.sql`
3. Execute the SQL

### Step 2: Run Setup Scripts
Execute these files in order:
1. `database/setup/initial_setup.sql`
2. `database/utilities/performance_optimization.sql`
3. `database/setup/realtime_chat_setup.sql`

### Step 3: Apply Migrations
Execute migration files in numerical order:
1. `database/migrations/000_initial_schema.sql`
2. `database/migrations/001_add_workshop_validation_fields.sql`
3. `database/migrations/002_add_ai_provider_enhancements.sql`

### Step 4: Set Up Migration Tracking
Execute `database/migrate.sql` to set up migration management.

## 🌍 Environment-Specific Deployment

### Development Environment
```bash
# Quick setup for development
npm run db:deploy:dev

# Or manual
node database/deploy-database.js --fresh --env dev
```

### Staging Environment
```bash
# Deploy to staging (usually migrations only)
npm run db:deploy:staging

# Or manual
node database/deploy-database.js --migrate --env staging
```

### Production Environment
```bash
# Deploy to production (migrations only, be careful!)
npm run db:deploy:prod

# Or manual with verification first
node database/deploy-database.js --verify --env prod
node database/deploy-database.js --migrate --env prod
```

## 🛡️ Safety Guidelines

### Before Deployment

1. **Backup your database** (if existing data)
   ```bash
   supabase db dump --file backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Test in development first**
   ```bash
   npm run db:deploy:dev
   ```

3. **Verify deployment files**
   ```bash
   npm run db:deploy:verify
   ```

### During Deployment

1. **Monitor the process**
   - Watch for error messages
   - Verify each step completes successfully
   - Check Supabase dashboard for changes

2. **Validate after deployment**
   ```bash
   # Check migration status
   SELECT * FROM get_migration_status();
   
   # Validate schema integrity
   SELECT * FROM validate_schema_integrity();
   ```

### After Deployment

1. **Test application functionality**
   - Verify authentication works
   - Test database operations
   - Check real-time features

2. **Update TypeScript types**
   ```bash
   npm run db:types
   ```

## 🔄 Rollback Procedures

### Automatic Rollback (Future Feature)
```bash
# Rollback to specific migration
node database/deploy-database.js --rollback 001_add_workshop_validation_fields
```

### Manual Rollback
1. Connect to Supabase SQL Editor
2. Find rollback SQL in migration file comments
3. Execute rollback SQL
4. Remove migration record:
   ```sql
   DELETE FROM schema_migrations WHERE version = 'migration_version';
   ```

## 📈 Monitoring & Maintenance

### Check Deployment Status
```sql
-- Get migration status
SELECT deploy_pending_migrations();

-- Check schema integrity
SELECT * FROM validate_schema_integrity();

-- View applied migrations
SELECT * FROM get_applied_migrations();
```

### Performance Monitoring
```sql
-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
    indexrelname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;
```

## 🆘 Troubleshooting

### Common Issues

1. **Environment variables not set**
   ```
   Error: Missing environment variables for dev: SUPABASE_URL
   ```
   **Solution:** Check your `.env` file and ensure all required variables are set.

2. **Supabase CLI not found**
   ```
   Error: Supabase CLI not found
   ```
   **Solution:** Install Supabase CLI: `npm install -g supabase`

3. **Permission denied**
   ```
   Error: Permission denied executing SQL
   ```
   **Solution:** Ensure you're using the correct project ID and have admin access.

4. **Migration already applied**
   ```
   Error: Migration already exists
   ```
   **Solution:** Use `--migrate` instead of `--fresh` for existing databases.

### Getting Help

1. **Check logs** in the deployment script output
2. **Verify environment** variables are correct
3. **Test connection** to Supabase
4. **Check Supabase dashboard** for error details

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Database Schema Documentation](./README.md)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

---

**Remember**: Always test in development first, backup production data, and monitor the deployment process! 🛡️
