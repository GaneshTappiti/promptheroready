-- Performance Optimization SQL Functions and Configurations
-- Run these in your Supabase SQL editor to implement performance improvements
-- Note: This file is optimized for Supabase and excludes auth schema modifications

-- 1. Create function to get timezone names with caching
CREATE OR REPLACE FUNCTION get_timezone_names()
RETURNS TEXT[]
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    timezone_array TEXT[];
BEGIN
    -- Cache timezone names for better performance
    SELECT ARRAY(
        SELECT name 
        FROM pg_timezone_names 
        WHERE name NOT LIKE '%/%/%' -- Exclude overly specific timezones
        ORDER BY name
    ) INTO timezone_array;
    
    RETURN timezone_array;
END;
$$;

-- 2. Create function to set connection pool settings
CREATE OR REPLACE FUNCTION set_connection_pool_settings(
    max_connections INTEGER DEFAULT 20,
    idle_timeout INTEGER DEFAULT 30000,
    connection_timeout INTEGER DEFAULT 5000
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This function would typically configure connection pool settings
    -- In Supabase, these are managed at the platform level
    -- This is a placeholder for custom connection management
    
    RAISE NOTICE 'Connection pool settings: max_connections=%, idle_timeout=%, connection_timeout=%', 
                 max_connections, idle_timeout, connection_timeout;
    
    RETURN TRUE;
END;
$$;

-- 3. Create indexes for better query performance
-- Index for messages table (if it exists)
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_username ON messages(username);
CREATE INDEX IF NOT EXISTS idx_messages_country ON messages(country);

-- Note: Cannot create indexes on auth schema tables in Supabase
-- These are system-managed tables with existing optimizations
-- CREATE INDEX IF NOT EXISTS idx_auth_events_user_id ON auth.audit_log_entries(user_id);
-- CREATE INDEX IF NOT EXISTS idx_auth_events_created_at ON auth.audit_log_entries(created_at DESC);

-- 4. Create materialized view for frequently accessed data
-- Note: Using auth.users is allowed for reading in Supabase
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_stats AS
SELECT
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data,
    u.last_sign_in_at
FROM auth.users u
WHERE u.deleted_at IS NULL;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_user_stats_id ON mv_user_stats(id);

-- 5. Create function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_stats;
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error refreshing materialized views: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- 6. Create security audit log table
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for security audit log
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON security_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_event_type ON security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_severity ON security_audit_log(severity);

-- 7. Create function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_description TEXT,
    p_metadata JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_severity TEXT DEFAULT 'low'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO security_audit_log (
        user_id, event_type, description, metadata, 
        ip_address, user_agent, severity
    ) VALUES (
        p_user_id, p_event_type, p_description, p_metadata,
        p_ip_address, p_user_agent, p_severity
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$;

-- 8. Create user MFA methods table
CREATE TABLE IF NOT EXISTS user_mfa_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    method_type TEXT NOT NULL CHECK (method_type IN ('totp', 'sms', 'email')),
    method_name TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    encrypted_secret TEXT, -- For TOTP secrets
    phone_number TEXT, -- For SMS
    backup_codes JSONB, -- For backup codes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, method_type)
);

-- Create indexes for MFA methods
CREATE INDEX IF NOT EXISTS idx_user_mfa_user_id ON user_mfa_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mfa_enabled ON user_mfa_methods(is_enabled) WHERE is_enabled = TRUE;

-- 9. Create password history table for password age tracking
CREATE TABLE IF NOT EXISTS user_password_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for password history
CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON user_password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_password_history_created_at ON user_password_history(created_at DESC);

-- 10. Create function to check password age
CREATE OR REPLACE FUNCTION check_password_age(p_user_id UUID)
RETURNS TABLE(
    needs_update BOOLEAN,
    days_old INTEGER,
    last_changed TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    last_change TIMESTAMP WITH TIME ZONE;
    days_since_change INTEGER;
    max_age_days INTEGER := 90; -- Default policy
BEGIN
    -- Get the most recent password change
    SELECT created_at INTO last_change
    FROM user_password_history
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If no password history, use user creation date
    IF last_change IS NULL THEN
        SELECT created_at INTO last_change
        FROM auth.users
        WHERE id = p_user_id;
    END IF;
    
    -- Calculate days since last change
    days_since_change := EXTRACT(DAY FROM NOW() - last_change);
    
    RETURN QUERY SELECT 
        days_since_change > max_age_days,
        days_since_change,
        last_change;
END;
$$;

-- 11. Create RLS policies for security tables
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mfa_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_password_history ENABLE ROW LEVEL SECURITY;

-- Policy for security audit log (users can only see their own events)
CREATE POLICY security_audit_user_policy ON security_audit_log
    FOR SELECT USING (auth.uid() = user_id);

-- Policy for MFA methods (users can manage their own methods)
CREATE POLICY user_mfa_policy ON user_mfa_methods
    FOR ALL USING (auth.uid() = user_id);

-- Policy for password history (users can see their own history)
CREATE POLICY password_history_policy ON user_password_history
    FOR SELECT USING (auth.uid() = user_id);

-- 12. Create function to clean up old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM security_audit_log
    WHERE created_at < NOW() - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- 13. Create scheduled job to refresh materialized views (if pg_cron is available)
-- SELECT cron.schedule('refresh-mv', '0 */6 * * *', 'SELECT refresh_materialized_views();');

-- 14. Create scheduled job to cleanup old audit logs
-- SELECT cron.schedule('cleanup-audit', '0 2 * * *', 'SELECT cleanup_old_audit_logs(90);');

-- 15. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON mv_user_stats TO authenticated;
GRANT SELECT, INSERT ON security_audit_log TO authenticated;
GRANT ALL ON user_mfa_methods TO authenticated;
GRANT SELECT ON user_password_history TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_timezone_names() TO authenticated;
GRANT EXECUTE ON FUNCTION set_connection_pool_settings(INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION log_security_event(UUID, TEXT, TEXT, JSONB, INET, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_password_age(UUID) TO authenticated;

COMMIT;
