-- Fix admin_users table policies to avoid infinite recursion

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Super admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;

-- Create simpler policies that don't cause recursion
-- Allow users to view their own admin record
CREATE POLICY "Users can view their own admin record" ON admin_users
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own admin record (for last_login_at)
CREATE POLICY "Users can update their own admin record" ON admin_users
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow insertion of admin records (for auto-creation)
CREATE POLICY "Allow admin record creation" ON admin_users
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow super admins to manage all admin users (using user_profiles table to avoid recursion)
CREATE POLICY "Super admins can manage all admin users" ON admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'super_admin'
        )
    );
