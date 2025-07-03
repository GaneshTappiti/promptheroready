import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_KEY);

async function deployProfileFix() {
  console.log('🔧 Deploying profile creation fix...');
  
  try {
    // Test if we can access the tables
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (profileError) {
      console.error('❌ Cannot access user_profiles table:', profileError.message);
      console.log('📋 Please deploy the complete schema first using the SQL provided earlier.');
      return;
    }
    
    console.log('✅ user_profiles table accessible');
    
    // Check current profile count
    const { count: profileCount } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });
    
    console.log('📊 Current user profiles:', profileCount || 0);
    
    // Check admin users
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .limit(5);
    
    if (adminError) {
      console.error('❌ Cannot access admin_users table:', adminError.message);
    } else {
      console.log('✅ admin_users table accessible');
      console.log('📊 Current admin users:', adminUsers.length);
      
      if (adminUsers.length > 0) {
        console.log('\n👤 Admin users:');
        adminUsers.forEach(admin => {
          console.log(`   - User ID: ${admin.user_id}`);
          console.log(`   - Role: ${admin.role}`);
          console.log(`   - Active: ${admin.is_active}`);
          console.log('   ---');
        });
      }
    }
    
    console.log('\n📋 Profile Creation Fix Status:');
    console.log('================================');
    console.log('✅ Updated clean_schema.sql with:');
    console.log('   - handle_new_user() function');
    console.log('   - on_auth_user_created trigger');
    console.log('   - create_profiles_for_existing_users() function');
    console.log('   - Automatic admin detection for ganeshtappiti1605@gmail.com');
    
    console.log('\n🚀 Next Steps:');
    console.log('==============');
    console.log('1. Deploy the updated schema by running:');
    console.log('   node database/deploy-simple.js');
    console.log('2. Copy the generated SQL to Supabase SQL Editor');
    console.log('3. Execute the SQL to apply the fixes');
    console.log('4. Sign up/sign in with ganeshtappiti1605@gmail.com');
    console.log('5. Profile and admin access will be created automatically');
    
    console.log('\n🔧 Manual Fix (if needed):');
    console.log('Execute this in Supabase SQL Editor:');
    console.log(`
-- Create profile for existing admin user
INSERT INTO user_profiles (id, role, created_at, updated_at)
SELECT id, 'super_admin', NOW(), NOW()
FROM auth.users 
WHERE email = 'ganeshtappiti1605@gmail.com'
ON CONFLICT (id) DO UPDATE SET 
  role = 'super_admin',
  updated_at = NOW();

-- Create admin user record
INSERT INTO admin_users (user_id, role, is_active, created_by, created_at, updated_at)
SELECT id, 'super_admin', true, id, NOW(), NOW()
FROM auth.users 
WHERE email = 'ganeshtappiti1605@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  role = 'super_admin',
  is_active = true,
  updated_at = NOW();
    `);
    
  } catch (error) {
    console.error('❌ Profile fix deployment failed:', error.message);
  }
}

deployProfileFix();
