// Test script to specifically test profile creation
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://dsfikceaftssoaazhvwv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzZmlrY2VhZnRzc29hYXpodnd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MTM2NzYsImV4cCI6MjA2NDE4OTY3Nn0.TVtwI2INheLjdnwnaZNM0tLuz9URmGZ4MHbH2Akb3fA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProfileCreation() {
  console.log('🧪 Testing User Profile Creation...');

  try {
    // Test 1: Try to create a profile directly
    console.log('\n1️⃣ Testing direct profile creation...');
    const testUserId = '12345678-1234-1234-1234-123456789012'; // Fake UUID for testing
    
    const { data: directInsert, error: directError } = await supabase
      .from('user_profiles')
      .insert({
        id: testUserId,
        role: 'user'
      })
      .select();

    if (directError) {
      console.log('❌ Direct profile creation failed:', directError.message);
      if (directError.message.includes('policy')) {
        console.log('🔥 RLS POLICY ISSUE - This is the problem!');
      }
    } else {
      console.log('✅ Direct profile creation successful:', directInsert);
      
      // Clean up test data
      await supabase.from('user_profiles').delete().eq('id', testUserId);
    }

    // Test 2: Check current RLS policies
    console.log('\n2️⃣ Checking RLS policies...');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_policies_for_table', { table_name: 'user_profiles' })
      .catch(() => ({ data: null, error: { message: 'RPC function not available' } }));

    if (policyError) {
      console.log('ℹ️  Cannot check policies directly:', policyError.message);
    } else {
      console.log('📋 Policies found:', policies);
    }

    // Test 3: Test actual signup and profile creation
    console.log('\n3️⃣ Testing full signup flow...');
    const testEmail = `profiletest${Date.now()}@gmail.com`;
    const testPassword = 'TestPassword123!';

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signupError) {
      console.log('❌ Signup failed:', signupError.message);
    } else {
      console.log('✅ Signup successful, user ID:', signupData.user?.id);
      
      if (signupData.user) {
        // Wait for trigger to potentially create profile
        console.log('⏳ Waiting 3 seconds for trigger...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check if profile was created
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', signupData.user.id);

        if (profileError) {
          console.log('❌ Profile check failed:', profileError.message);
        } else if (profile && profile.length > 0) {
          console.log('✅ Profile created by trigger:', profile[0]);
        } else {
          console.log('❌ No profile found - trigger not working');
          
          // Try manual creation
          console.log('🔄 Attempting manual profile creation...');
          const { data: manualProfile, error: manualError } = await supabase
            .from('user_profiles')
            .insert({
              id: signupData.user.id,
              role: 'user'
            })
            .select();

          if (manualError) {
            console.log('❌ Manual profile creation failed:', manualError.message);
            console.log('🔥 THIS IS THE ROOT CAUSE - RLS policy blocking creation');
          } else {
            console.log('✅ Manual profile creation successful:', manualProfile);
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProfileCreation().then(() => {
  console.log('\n🏁 Profile creation test completed');
  console.log('\n📋 Summary:');
  console.log('- If direct creation fails with policy error → Apply final-profile-fix.sql');
  console.log('- If trigger not working → Check trigger function in database');
  console.log('- If manual creation fails → RLS policy needs fixing');
}).catch(err => {
  console.error('💥 Test script failed:', err);
});
