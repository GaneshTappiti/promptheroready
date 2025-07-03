# 🚀 PromptHeroReady Migration Guide

This guide provides comprehensive instructions for managing database migrations in the PromptHeroReady application.

## 📋 Overview

Our migration system provides:
- ✅ **Versioned migrations** with sequential numbering
- ✅ **Rollback capabilities** for safe deployment
- ✅ **Dependency tracking** to ensure proper order
- ✅ **Automated validation** of schema integrity
- ✅ **Execution logging** for audit trails

## 🗂️ Migration File Structure

```
database/migrations/
├── 000_initial_schema.sql          # Initial database setup
├── 001_add_workshop_validation_fields.sql  # Workshop features
├── 002_add_ai_provider_enhancements.sql    # AI provider improvements
└── migrate.sql                     # Migration management system
```

## 🎯 Quick Start

### 1. Fresh Installation (New Supabase Project)

```sql
-- Step 1: Set up migration tracking
\i database/migrate.sql

-- Step 2: Deploy unified schema
\i database/schemas/unified_schema.sql

-- Step 3: Apply any additional migrations
\i database/migrations/001_add_workshop_validation_fields.sql
\i database/migrations/002_add_ai_provider_enhancements.sql

-- Step 4: Verify deployment
SELECT deploy_pending_migrations();
```

### 2. Existing Installation (Incremental Updates)

```sql
-- Step 1: Check current status
SELECT * FROM get_migration_status();

-- Step 2: See pending migrations
SELECT * FROM get_pending_migrations();

-- Step 3: Apply pending migrations in order
-- (Run each file individually in Supabase SQL Editor)

-- Step 4: Verify completion
SELECT * FROM validate_schema_integrity();
```

## 📊 Migration Management Commands

### Check Migration Status
```sql
-- Get overall migration status
SELECT * FROM get_migration_status();

-- List all applied migrations
SELECT * FROM get_applied_migrations();

-- List pending migrations
SELECT * FROM get_pending_migrations();

-- Get deployment report
SELECT deploy_pending_migrations();
```

### Validate Database
```sql
-- Check schema integrity
SELECT * FROM validate_schema_integrity();

-- Verify specific migration
SELECT is_migration_applied('001_add_workshop_validation_fields');
```

### Rollback Migrations (Use with caution!)
```sql
-- Rollback a specific migration
SELECT rollback_migration('002_add_ai_provider_enhancements');

-- View rollback history
SELECT * FROM migration_execution_log WHERE action = 'rollback';
```

## 🔧 Creating New Migrations

### 1. Migration File Template

```sql
-- Migration: XXX_descriptive_name
-- Description: Brief description of changes
-- Created: YYYY-MM-DD
-- Dependencies: Previous migration version
-- Rollback: Description of rollback process

-- Check migration dependencies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = 'previous_migration') THEN
        RAISE EXCEPTION 'Previous migration must be applied first';
    END IF;
    
    RAISE NOTICE 'Starting migration XXX_descriptive_name...';
END $$;

-- =====================================================
-- MIGRATION CHANGES
-- =====================================================

-- Your migration SQL here

-- =====================================================
-- RECORD MIGRATION
-- =====================================================

INSERT INTO schema_migrations (version, description, rollback_sql) VALUES (
    'XXX_descriptive_name',
    'Brief description of changes',
    '-- Rollback SQL here'
);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Migration XXX_descriptive_name completed successfully!';
    RAISE NOTICE '📋 Next: Description of next steps';
END $$;
```

### 2. Migration Naming Convention

- **Format**: `XXX_descriptive_name.sql`
- **XXX**: 3-digit sequential number (001, 002, 003...)
- **descriptive_name**: Snake_case description of changes

### 3. Migration Best Practices

#### ✅ DO:
- Always include dependency checks
- Provide detailed rollback SQL
- Use transactions where appropriate
- Test migrations on development first
- Include descriptive comments
- Add appropriate indexes
- Enable RLS on new user tables

#### ❌ DON'T:
- Skip migration numbers
- Modify existing migration files
- Forget to test rollback procedures
- Apply migrations out of order
- Remove data without backups

## 🛡️ Safety Guidelines

### Before Applying Migrations

1. **Backup your database**
   ```bash
   # Using Supabase CLI
   supabase db dump --file backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Test in development environment**
   - Apply migration to dev/staging first
   - Verify application functionality
   - Test rollback procedures

3. **Review migration dependencies**
   ```sql
   SELECT * FROM get_pending_migrations();
   ```

### During Migration

1. **Monitor execution**
   ```sql
   SELECT * FROM migration_execution_log 
   WHERE executed_at > NOW() - INTERVAL '1 hour'
   ORDER BY executed_at DESC;
   ```

2. **Verify each step**
   ```sql
   SELECT * FROM validate_schema_integrity();
   ```

### After Migration

1. **Confirm completion**
   ```sql
   SELECT deploy_pending_migrations();
   ```

2. **Test application functionality**
   - Verify all features work correctly
   - Check real-time subscriptions
   - Test authentication flows

## 🔄 Rollback Procedures

### When to Rollback

- Migration causes application errors
- Data corruption detected
- Performance issues arise
- Business requirements change

### How to Rollback

```sql
-- 1. Check rollback SQL
SELECT rollback_sql FROM schema_migrations 
WHERE version = 'migration_to_rollback';

-- 2. Execute rollback
SELECT rollback_migration('migration_to_rollback');

-- 3. Verify rollback
SELECT * FROM get_applied_migrations();
```

### Post-Rollback Steps

1. **Investigate the issue**
2. **Fix the migration**
3. **Test thoroughly**
4. **Reapply when ready**

## 📈 Monitoring & Maintenance

### Regular Health Checks

```sql
-- Weekly schema validation
SELECT * FROM validate_schema_integrity();

-- Monthly migration audit
SELECT 
    version,
    applied_at,
    applied_by
FROM schema_migrations 
ORDER BY applied_at DESC;

-- Performance monitoring
SELECT 
    schemaname,
    tablename,
    n_tup_ins + n_tup_upd + n_tup_del as total_changes
FROM pg_stat_user_tables 
ORDER BY total_changes DESC;
```

### Cleanup Old Logs

```sql
-- Clean up old execution logs (keep last 90 days)
DELETE FROM migration_execution_log 
WHERE executed_at < NOW() - INTERVAL '90 days';
```

## 🆘 Troubleshooting

### Common Issues

1. **Migration fails with dependency error**
   - Check if previous migrations are applied
   - Verify migration order

2. **RLS policy conflicts**
   - Review existing policies
   - Ensure proper user context

3. **Index creation timeouts**
   - Create indexes concurrently
   - Consider maintenance windows

4. **Rollback fails**
   - Check rollback SQL syntax
   - Verify data dependencies

### Getting Help

1. **Check migration logs**
   ```sql
   SELECT * FROM migration_execution_log 
   WHERE status = 'failed' 
   ORDER BY executed_at DESC;
   ```

2. **Validate current state**
   ```sql
   SELECT * FROM validate_schema_integrity();
   ```

3. **Review Supabase logs** in the dashboard

## 📚 Additional Resources

- [Supabase Migration Documentation](https://supabase.com/docs/guides/database/migrations)
- [PostgreSQL Migration Best Practices](https://www.postgresql.org/docs/current/ddl-alter.html)
- [Database Schema Design Guidelines](https://www.postgresql.org/docs/current/ddl-schemas.html)

---

**Remember**: Always backup before migrating, test thoroughly, and have a rollback plan ready! 🛡️
