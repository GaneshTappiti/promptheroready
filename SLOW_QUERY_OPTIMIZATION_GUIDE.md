# 🚀 Slow Query Optimization Guide

This guide helps you identify, analyze, and optimize slow database queries in your PromptHeroReady application.

## 🔍 Problem Identification

The slow queries you're experiencing (4.5-5.1 seconds) are likely caused by:

1. **PostgreSQL System Catalog Queries** - Schema introspection queries using `pg_get_tabledef()` and `pg_get_viewdef()`
2. **Frequent Database Testing** - Repeated schema verification and testing
3. **Supabase Dashboard Usage** - Table Editor and SQL Editor triggering schema queries
4. **Lack of Query Caching** - No caching for expensive schema operations

## 🛠️ Solutions Implemented

### 1. Query Caching System
- Added `QueryOptimizationService.getCachedSchemaQuery()` for expensive schema queries
- Implemented 10-minute caching for schema verification results
- Added debouncing for database testing operations

### 2. Performance Monitoring
- Created `DatabasePerformanceMonitor` utility class
- Added SQL functions for slow query detection
- Built admin dashboard for performance monitoring

### 3. Optimized Database Testing
- Added caching to `verifyDatabaseSchema()` function
- Reduced frequency of expensive schema introspection
- Implemented smart cache invalidation

## 📋 Installation Steps

### Step 1: Deploy Performance Monitoring Functions

Execute this SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the entire content of:
-- database/performance/slow_query_monitoring.sql
```

### Step 2: Enable pg_stat_statements Extension

In Supabase SQL Editor, run:

```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

### Step 3: Access Performance Dashboard

1. Navigate to `/admin/performance` (Super Admin only)
2. View slow queries and performance metrics
3. Follow optimization recommendations

## 🎯 Immediate Actions

### 1. Reduce Schema Query Frequency

**Before:**
```typescript
// This runs expensive queries every time
const verification = await verifyDatabaseSchema();
```

**After:**
```typescript
// This uses 5-minute cache
const verification = await verifyDatabaseSchema(true);
```

### 2. Optimize Database Testing

**Before:**
```typescript
// Runs tests immediately on every call
const results = await databaseTester.runAllTests();
```

**After:**
```typescript
// Uses cached results for 5 minutes
const results = await QueryOptimizationService.getCachedSchemaQuery(
  'database_test_results',
  () => databaseTester.runAllTests(),
  5 * 60 * 1000
);
```

### 3. Limit Supabase Dashboard Usage

- Avoid frequent Table Editor refreshes
- Use SQL Editor sparingly for schema queries
- Consider using the app's performance dashboard instead

## 📊 Performance Monitoring

### Access Performance Dashboard
1. Login as Super Admin
2. Go to Admin → Database Performance
3. Monitor slow queries and connection stats

### Key Metrics to Watch
- **Slow Queries**: Queries taking >1 second
- **Schema Introspection**: Queries using pg_class, pg_namespace
- **Connection Count**: Active vs idle connections
- **Cache Hit Ratio**: Buffer and index cache performance

## 🔧 Advanced Optimizations

### 1. Database Configuration

Add these to your Supabase project settings:

```sql
-- Increase shared_buffers for better caching
ALTER SYSTEM SET shared_buffers = '256MB';

-- Optimize work_mem for complex queries
ALTER SYSTEM SET work_mem = '16MB';

-- Enable query plan caching
ALTER SYSTEM SET plan_cache_mode = 'auto';
```

### 2. Index Optimization

Monitor index usage and add missing indexes:

```sql
-- Check index usage
SELECT * FROM get_index_usage();

-- Add indexes for frequently queried columns
CREATE INDEX CONCURRENTLY idx_ideas_user_status 
ON ideas(user_id, status) WHERE status = 'active';
```

### 3. Query Optimization

For application queries:

```typescript
// Use specific column selection
.select('id, title, status') // Instead of .select('*')

// Add proper filtering
.eq('user_id', userId)
.eq('status', 'active')

// Use pagination
.range(0, 49) // Limit to 50 records

// Add ordering
.order('created_at', { ascending: false })
```

## 🚨 Emergency Actions

If you're experiencing critical performance issues:

### 1. Immediate Relief
```sql
-- Reset query statistics (clears pg_stat_statements)
SELECT reset_query_stats();

-- Kill long-running queries (use with caution)
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' 
AND query_start < NOW() - INTERVAL '30 seconds'
AND query NOT LIKE '%pg_stat_activity%';
```

### 2. Disable Expensive Features Temporarily
```typescript
// In your app, temporarily disable:
// - Automatic database testing
// - Real-time schema verification
// - Frequent performance monitoring
```

## 📈 Expected Results

After implementing these optimizations:

- **Schema queries**: 4.5s → <0.5s (90% improvement)
- **Database testing**: Cached results, no repeated expensive queries
- **Admin dashboard**: Real-time performance monitoring
- **Overall app performance**: Significantly improved response times

## 🔍 Monitoring Success

### Performance Metrics to Track
1. **Average Query Time**: Should drop below 1 second
2. **Slow Query Count**: Should reduce by 80%+
3. **Cache Hit Ratio**: Should be >95%
4. **Connection Efficiency**: Better active/idle ratio

### Regular Maintenance
- Review performance dashboard weekly
- Monitor slow query trends
- Update indexes based on usage patterns
- Cache frequently accessed data

## 🆘 Troubleshooting

### Common Issues

**Issue**: Performance dashboard shows no data
**Solution**: Ensure pg_stat_statements extension is enabled

**Issue**: Queries still slow after optimization
**Solution**: Check for missing indexes and review query patterns

**Issue**: High connection count
**Solution**: Implement connection pooling and review app architecture

### Getting Help

1. Check the performance dashboard for specific recommendations
2. Review slow query patterns in the admin panel
3. Monitor cache hit ratios and connection statistics
4. Consider upgrading Supabase plan for better performance

## 📚 Additional Resources

- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Supabase Performance Guide](https://supabase.com/docs/guides/platform/performance)
- [Query Optimization Best Practices](https://use-the-index-luke.com/)

---

**Note**: These optimizations are specifically designed for your PromptHeroReady application and the slow queries you're experiencing. The performance monitoring system will help you identify and resolve future performance issues proactively.
