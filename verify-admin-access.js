import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_KEY);

async function verifyAdminAccess() {
  console.log('🔍 Verifying admin access...');
  
  try {
    // Check if admin_users table exists and is accessible
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .limit(5);
    
    if (adminError) {
      console.error('❌ Admin users table error:', adminError.message);
      console.log('\n📋 Please execute the SQL provided above in Supabase SQL Editor first.');
      return;
    }
    
    console.log('✅ Admin users table accessible');
    console.log('📊 Admin users found:', adminUsers.length);
    
    if (adminUsers.length > 0) {
      console.log('\n👤 Admin users:');
      adminUsers.forEach(admin => {
        console.log(`   - User ID: ${admin.user_id}`);
        console.log(`   - Role: ${admin.role}`);
        console.log(`   - Active: ${admin.is_active}`);
        console.log(`   - Created: ${admin.created_at}`);
        console.log('   ---');
      });
    }
    
    // Check user_profiles table
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, role, username, first_name, last_name')
      .eq('role', 'super_admin')
      .limit(5);
    
    if (profileError) {
      console.error('❌ User profiles error:', profileError.message);
    } else {
      console.log('\n✅ User profiles table accessible');
      console.log('📊 Super admin profiles found:', profiles.length);
      
      if (profiles.length > 0) {
        console.log('\n👤 Super admin profiles:');
        profiles.forEach(profile => {
          console.log(`   - ID: ${profile.id}`);
          console.log(`   - Role: ${profile.role}`);
          console.log(`   - Name: ${profile.first_name} ${profile.last_name}`);
          console.log(`   - Username: ${profile.username}`);
          console.log('   ---');
        });
      }
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('==============');
    console.log('1. Sign in with: ganeshtappiti1605@gmail.com');
    console.log('2. Password: Tappiti@1605');
    console.log('3. Look for "Admin Panel" in the sidebar');
    console.log('4. Navigate to /admin');
    console.log('5. If not working, check browser console for errors');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyAdminAccess();
