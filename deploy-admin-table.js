import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_KEY);

async function deployAdminTable() {
  console.log('🚀 Deploying admin_users table...');
  
  try {
    // Create admin_users table
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Admin users table (for application compatibility)
        CREATE TABLE IF NOT EXISTS admin_users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
            role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')),
            is_active BOOLEAN DEFAULT true,
            created_by UUID REFERENCES auth.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            last_login_at TIMESTAMP WITH TIME ZONE
        );
      `
    });

    if (tableError) {
      console.error('❌ Error creating admin table:', tableError.message);
      // Try direct SQL execution
      console.log('🔄 Trying direct table creation...');
      
      const { error: directError } = await supabase
        .from('admin_users')
        .select('count')
        .limit(1);
      
      if (directError && directError.message.includes('does not exist')) {
        console.log('⚠️ Table does not exist, manual creation needed');
        console.log('📋 Please execute this SQL in Supabase SQL Editor:');
        console.log(`
-- Admin users table (for application compatibility)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);
        `);
        return;
      }
    }
    
    console.log('✅ Admin users table created successfully!');
    
    // Test the table
    const { data, error: testError } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error testing admin table:', testError.message);
    } else {
      console.log('✅ Admin users table is accessible');
      console.log('📊 Current admin users count:', data?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
  }
}

deployAdminTable();
