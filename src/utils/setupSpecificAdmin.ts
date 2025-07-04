/**
 * Utility to set up specific admin users
 * This can be used to manually grant admin access to specific email addresses
 */

import { supabase } from '@/lib/supabase';

export interface AdminSetupResult {
  success: boolean;
  message: string;
  data?: unknown;
}

/**
 * Set up admin access for a specific email address
 */
export async function setupAdminByEmail(
  email: string,
  role: 'admin' | 'super_admin' = 'super_admin'
): Promise<AdminSetupResult> {
  try {
    // Get current user (this function should only be called by the user themselves)
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: `Error getting current user: ${userError?.message || 'No user found'}`
      };
    }

    // Check if the current user's email matches the target email
    if (user.email?.toLowerCase() !== email.toLowerCase()) {
      return {
        success: false,
        message: `You can only set up admin access for your own account. Current email: ${user.email}`
      };
    }

    // Check if user is already an admin
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return {
        success: false,
        message: `Error checking existing admin status: ${checkError.message}`
      };
    }

    if (existingAdmin) {
      return {
        success: false,
        message: `User ${email} is already an admin with role: ${existingAdmin.role}`
      };
    }

    // Create admin user
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .insert([{
        user_id: user.id,
        role: role,
        is_active: true,
        created_by: user.id, // Self-created
      }])
      .select()
      .single();

    if (adminError) {
      return {
        success: false,
        message: `Error creating admin user: ${adminError.message}`
      };
    }

    return {
      success: true,
      message: `Successfully granted ${role} access to ${email}`,
      data: adminData
    };

  } catch (error) {
    console.error('Error setting up admin by email:', error);
    return {
      success: false,
      message: `Unexpected error: ${(error as Error).message}`
    };
  }
}

/**
 * Setup admin access for the predefined admin email
 */
export async function setupPredefinedAdmin(): Promise<AdminSetupResult> {
  const adminEmail = 'ganeshtappiti1605@gmail.com';
  return await setupAdminByEmail(adminEmail, 'super_admin');
}

/**
 * Check if an email is in the predefined admin list
 */
export function isPredefinedAdmin(email: string): boolean {
  const predefinedAdminEmails = ['ganeshtappiti1605@gmail.com'];
  return predefinedAdminEmails.includes(email.toLowerCase());
}

/**
 * Get all predefined admin emails
 */
export function getPredefinedAdminEmails(): string[] {
  return ['ganeshtappiti1605@gmail.com'];
}
