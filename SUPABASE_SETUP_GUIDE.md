# Supabase Setup Guide for API Key Testing

This guide explains how to connect your API key testing system to Supabase for secure storage and management.

## Overview

The application uses Supabase for:
- ✅ User authentication and management
- ✅ Encrypted API key storage
- ✅ Connection status tracking
- ✅ Usage analytics and monitoring
- ✅ Secure data access with Row Level Security (RLS)

## Prerequisites

1. **Supabase Account**: Create account at [supabase.com](https://supabase.com)
2. **Project Setup**: Create a new Supabase project
3. **Environment Variables**: Configure your `.env` file

## Step 1: Supabase Project Setup

### Create Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization and enter project details
4. Wait for project to be created (2-3 minutes)

### Get Project Credentials
1. Go to Project Settings → API
2. Copy your project URL and anon key
3. Add to your `.env` file:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 2: Database Schema Setup

### Option A: Run Migration Script (Recommended)
```bash
# Install dependencies if needed
npm install

# Run the migration
node scripts/run-migration.js
```

### Option B: Manual SQL Setup
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `database/migrations/update_user_ai_preferences.sql`
3. Click "Run" to execute the migration

### Option C: Use the Clean Schema
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `database/schemas/clean_schema.sql`
3. Click "Run" to create all tables

## Step 3: Environment Configuration

### Required Environment Variables
```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service Role Key (for migrations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Encryption Key for API keys
REACT_APP_ENCRYPTION_KEY=your-32-character-encryption-key-here
```

### Generate Encryption Key
```bash
# Generate a secure encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Database Table Structure

The `user_ai_preferences` table stores:

```sql
CREATE TABLE user_ai_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    api_key_encrypted TEXT,
    model_name TEXT,
    custom_endpoint TEXT,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 2000,
    provider_settings JSONB DEFAULT '{}',
    connection_status TEXT DEFAULT 'untested',
    last_error TEXT,
    last_test_at TIMESTAMP WITH TIME ZONE,
    total_requests INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Step 5: Row Level Security (RLS)

The table uses RLS policies to ensure users can only access their own data:

```sql
-- Enable RLS
ALTER TABLE user_ai_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only access their own preferences
CREATE POLICY "Users can manage their own AI preferences" 
ON user_ai_preferences
USING (auth.uid() = user_id);
```

## Step 6: Testing the Connection

### Browser Console Test
```javascript
// Test Supabase connection
testSupabaseConnection()

// Test API key functionality
testAPIKey()
```

### Application Interface
1. Navigate to `/api-key-test` in your application
2. Check the "Database Connection" status
3. Run the comprehensive API key test

### Manual Verification
```javascript
// Check if table exists
const { data, error } = await supabase
  .from('user_ai_preferences')
  .select('*')
  .limit(1);

console.log('Table access:', { data, error });
```

## Step 7: Authentication Setup

### Enable Authentication Providers
1. Go to Authentication → Providers
2. Enable desired providers (Email, Google, GitHub, etc.)
3. Configure redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

### Email Templates (Optional)
1. Go to Authentication → Email Templates
2. Customize signup, reset password, and confirmation emails

## Troubleshooting

### Common Issues

#### ❌ "Table does not exist"
**Solution**: Run the migration script or create the table manually

#### ❌ "Permission denied"
**Solution**: Check RLS policies and ensure user is authenticated

#### ❌ "Invalid API key format"
**Solution**: Verify environment variables are correctly set

#### ❌ "Connection failed"
**Solution**: Check Supabase URL and anon key

### Debug Commands

```javascript
// Check current user
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);

// Test table access
const { data, error } = await supabase
  .from('user_ai_preferences')
  .select('count');
console.log('Table access:', { data, error });

// Check environment
console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('Has anon key:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);
```

## Security Best Practices

### API Key Encryption
- ✅ API keys are encrypted before storage
- ✅ Encryption uses user-specific keys
- ✅ Keys are never stored in plain text
- ✅ Fallback encryption for older browsers

### Database Security
- ✅ Row Level Security enabled
- ✅ Users can only access their own data
- ✅ Service role key kept secure
- ✅ Regular security audits

### Environment Variables
- ✅ Never commit `.env` files
- ✅ Use different keys for development/production
- ✅ Rotate keys regularly
- ✅ Monitor for unauthorized access

## Production Deployment

### Environment Setup
1. Set production environment variables
2. Use production Supabase project
3. Enable SSL/HTTPS
4. Configure proper CORS settings

### Monitoring
1. Enable Supabase monitoring
2. Set up error tracking
3. Monitor API usage
4. Regular backup verification

## Support

### Getting Help
- Check the troubleshooting section
- Review Supabase documentation
- Test connection using provided utilities
- Contact support with specific error messages

### Useful Links
- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [JavaScript Client Reference](https://supabase.com/docs/reference/javascript)

The Supabase integration provides a robust, secure foundation for your API key testing system with proper user isolation and data protection.
