import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_KEY);

async function setupAdminProfile() {
  console.log('🔧 Setting up admin profile for ganeshtappiti1605@gmail.com...');
  
  try {
    // First, let's check if we can find any users with this email in user_profiles
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(10);
    
    if (profileError) {
      console.error('❌ Error checking user profiles:', profileError.message);
      return;
    }
    
    console.log('📊 Found user profiles:', profiles.length);
    
    if (profiles.length > 0) {
      console.log('👤 Existing user profiles:');
      profiles.forEach(profile => {
        console.log(`   - ID: ${profile.id}, Role: ${profile.role}, Username: ${profile.username}`);
      });
    }
    
    // Instructions for manual setup
    console.log('\n📋 Setup Instructions:');
    console.log('======================');
    console.log('1. Sign in to your application with: ganeshtappiti1605@gmail.com');
    console.log('2. Complete the onboarding process if prompted');
    console.log('3. The system will automatically detect the predefined admin email');
    console.log('4. Admin access will be granted automatically');
    console.log('5. Look for the "Admin Panel" link in the sidebar');
    console.log('6. Navigate to /admin to access the dashboard');
    
    console.log('\n🔧 If admin access is not working:');
    console.log('1. Check that you are signed in with the correct email');
    console.log('2. Try refreshing the page');
    console.log('3. Check the browser console for any errors');
    console.log('4. Ensure the admin_users table exists in your database');
    
    console.log('\n📝 Manual Database Setup (if needed):');
    console.log('Execute this SQL in Supabase SQL Editor:');
    console.log(`
-- First, find your user ID (replace with actual email)
SELECT id FROM auth.users WHERE email = 'ganeshtappiti1605@gmail.com';

-- Then insert admin user (replace 'your-user-id' with actual ID)
INSERT INTO admin_users (user_id, role, is_active, created_by)
VALUES ('your-user-id', 'super_admin', true, 'your-user-id')
ON CONFLICT (user_id) DO UPDATE SET 
  role = 'super_admin',
  is_active = true,
  updated_at = CURRENT_TIMESTAMP;

-- Also update user profile role
UPDATE user_profiles 
SET role = 'super_admin' 
WHERE id = 'your-user-id';
    `);
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupAdminProfile();
