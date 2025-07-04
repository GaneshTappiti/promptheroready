// Test script to identify database signup issues
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Use the actual credentials from .env
const supabaseUrl = 'https://dsfikceaftssoaazhvwv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzZmlrY2VhZnRzc29hYXpodnd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MTM2NzYsImV4cCI6MjA2NDE4OTY3Nn0.TVtwI2INheLjdnwnaZNM0tLuz9URmGZ4MHbH2Akb3fA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseSignup() {
  console.log('🧪 Testing Database Signup Process...');
  console.log('📊 Supabase URL:', supabaseUrl);
  console.log('🔑 Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

  try {
    // Test 1: Check database connection
    console.log('\n1️⃣ Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError);
      return;
    }
    console.log('✅ Database connection successful');

    // Test 2: Check if required tables exist
    console.log('\n2️⃣ Checking required tables...');
    const tables = ['user_profiles', 'subscription_plans', 'user_subscriptions', 'user_preferences'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.error(`❌ Table ${table} error:`, error.message);
        } else {
          console.log(`✅ Table ${table} exists and accessible`);
        }
      } catch (err) {
        console.error(`❌ Table ${table} check failed:`, err.message);
      }
    }

    // Test 3: Check subscription plans
    console.log('\n3️⃣ Checking subscription plans...');
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*');

    if (plansError) {
      console.error('❌ Subscription plans error:', plansError);
    } else {
      console.log('✅ Subscription plans found:', plans?.length || 0);
      plans?.forEach(plan => {
        console.log(`   - ${plan.name}: ${plan.display_name}`);
      });
    }

    // Test 4: Test user creation (with actual creation for testing)
    console.log('\n4️⃣ Testing user creation process...');
    const testEmail = `testuser${Date.now()}@gmail.com`;
    const testPassword = 'TestPassword123!';

    console.log(`📝 Creating test user: ${testEmail}`);

    // Actually try to create a user to test the trigger
    try {
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: 'http://localhost:3003/auth/callback',
        },
      });

      if (signupError) {
        console.error('❌ Signup failed:', signupError.message);

        // Check specific error types
        if (signupError.message.includes('User already registered')) {
          console.log('ℹ️  This is expected for existing emails');
        } else if (signupError.message.includes('Invalid email')) {
          console.log('ℹ️  Email validation issue');
        } else if (signupError.message.includes('Password')) {
          console.log('ℹ️  Password validation issue');
        } else if (signupError.message.includes('Database error saving new user')) {
          console.log('🔥 DATABASE TRIGGER ERROR - Apply the fix-user-creation.sql script!');
        } else if (signupError.message.includes('permission')) {
          console.log('🔥 PERMISSION ERROR - RLS policy issue!');
        } else {
          console.log('🔥 UNKNOWN ERROR - Need to investigate further');
        }
      } else {
        console.log('✅ Signup successful!');
        console.log('📊 User created:', signupData.user ? `ID: ${signupData.user.id}` : 'No user data');
        console.log('📊 Session:', signupData.session ? 'Session created' : 'No session (email confirmation required)');

        // Test if user profile was created (wait a moment for trigger/manual creation)
        if (signupData.user) {
          console.log('⏳ Waiting 2 seconds for profile creation...');
          await new Promise(resolve => setTimeout(resolve, 2000));

          try {
            const { data: profiles, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', signupData.user.id);

            if (profileError) {
              console.log('❌ User profile check failed:', profileError.message);
            } else if (profiles && profiles.length > 0) {
              console.log('✅ User profile created successfully!');
              console.log('   - Role:', profiles[0].role);
              console.log('   - Created at:', profiles[0].created_at);
            } else {
              console.log('❌ User profile not found - this indicates the fix needs to be applied');
              console.log('   📋 Apply the fix-profile-creation.sql script to Supabase');
            }
          } catch (err) {
            console.log('❌ Error checking user profile:', err.message);
          }
        }
      }
    } catch (err) {
      console.error('❌ Signup test failed with exception:', err.message);
    }

    // Test 5: Check trigger function exists
    console.log('\n5️⃣ Checking database functions...');
    try {
      const { data: functions, error: functionsError } = await supabase
        .rpc('handle_new_user'); // This will fail but tell us if function exists

      console.log('ℹ️  Function test result (expected to fail):', functionsError?.message || 'Unexpected success');
    } catch (err) {
      console.log('ℹ️  Function test exception (expected):', err.message);
    }

  } catch (error) {
    console.error('❌ Test failed with exception:', error);
  }
}

// Run the test
testDatabaseSignup().then(() => {
  console.log('\n🏁 Database signup test completed');
}).catch(err => {
  console.error('💥 Test script failed:', err);
});
