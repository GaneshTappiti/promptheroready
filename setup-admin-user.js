import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_KEY);

async function setupAdminUser() {
  console.log('🔧 Setting up admin user for ganeshtappiti1605@gmail.com...');
  
  try {
    // First, check if the admin_users table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1);
    
    if (tableError && tableError.message.includes('does not exist')) {
      console.error('❌ admin_users table does not exist!');
      console.log('📋 Please create the admin_users table first using the SQL provided above.');
      return;
    }
    
    console.log('✅ admin_users table exists');
    
    // Get the user ID for the admin email
    // Note: We can't directly query auth.users from client, so we'll use a different approach
    
    // Check if admin user already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .limit(10);
    
    if (checkError) {
      console.error('❌ Error checking existing admins:', checkError.message);
      return;
    }
    
    console.log('📊 Current admin users:', existingAdmin.length);
    
    if (existingAdmin.length > 0) {
      console.log('👤 Existing admin users:');
      existingAdmin.forEach(admin => {
        console.log(`   - ID: ${admin.user_id}, Role: ${admin.role}, Active: ${admin.is_active}`);
      });
    }
    
    // Instructions for manual setup
    console.log('\n📋 Manual Setup Instructions:');
    console.log('===============================');
    console.log('1. Sign in to your application with: ganeshtappiti1605@gmail.com');
    console.log('2. The AdminContext will automatically detect the predefined admin email');
    console.log('3. It will create the admin user automatically on first login');
    console.log('4. Refresh the page to see the Admin Panel link in the sidebar');
    console.log('\nAlternatively, if you have the user ID, you can run:');
    console.log('INSERT INTO admin_users (user_id, role, is_active, created_by)');
    console.log("VALUES ('your-user-id-here', 'super_admin', true, 'your-user-id-here');");
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupAdminUser();
