import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export type AdminRole = 'super_admin' | 'admin' | null;

export interface AdminPermissions {
  canManageUsers: boolean;
  canManagePrompts: boolean;
  canManageTools: boolean;
  canViewAnalytics: boolean;
  canManageSettings: boolean;
  canManageRoles: boolean;
  canViewAuditLogs: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  permissions: AdminPermissions;
  createdAt: string;
  lastLoginAt?: string;
}

interface AdminContextType {
  adminUser: AdminUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  permissions: AdminPermissions;
  checkPermission: (permission: keyof AdminPermissions) => boolean;
  refreshAdminStatus: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const defaultPermissions: AdminPermissions = {
  canManageUsers: false,
  canManagePrompts: false,
  canManageTools: false,
  canViewAnalytics: false,
  canManageSettings: false,
  canManageRoles: false,
  canViewAuditLogs: false,
};

const getPermissionsForRole = (role: AdminRole): AdminPermissions => {
  switch (role) {
    case 'super_admin':
      return {
        canManageUsers: true,
        canManagePrompts: true,
        canManageTools: true,
        canViewAnalytics: true,
        canManageSettings: true,
        canManageRoles: true,
        canViewAuditLogs: true,
      };
    case 'admin':
      return {
        canManageUsers: false,
        canManagePrompts: true,
        canManageTools: true,
        canViewAnalytics: false,
        canManageSettings: false,
        canManageRoles: false,
        canViewAuditLogs: false,
      };
    default:
      return defaultPermissions;
  }
};

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAdminStatus = async () => {
    if (!user) {
      setAdminUser(null);
      setLoading(false);
      return;
    }

    try {
      // First check user_profiles for admin role
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('AdminContext: Error checking user profile:', profileError);
      }

      // Check if user has admin role in profile or is predefined admin
      const predefinedAdminEmails = ['ganeshtappiti1605@gmail.com'];
      const isProfileAdmin = profileData?.role === 'admin' || profileData?.role === 'super_admin';
      const isPredefinedAdmin = user.email && predefinedAdminEmails.includes(user.email.toLowerCase());

      if (isProfileAdmin || isPredefinedAdmin) {
        // Try to get from admin_users table, create if doesn't exist
        const { data: adminData, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('AdminContext: Error checking admin_users table:', error);
          // Fall back to profile-based admin
          const role = isPredefinedAdmin ? 'super_admin' : (profileData?.role as AdminRole);
          if (role === 'admin' || role === 'super_admin') {
            const permissions = getPermissionsForRole(role);
            setAdminUser({
              id: user.id,
              email: user.email || '',
              role,
              permissions,
              createdAt: new Date().toISOString(),
            });
          }
          return;
        }

        if (adminData) {
          const permissions = getPermissionsForRole(adminData.role as AdminRole);
          setAdminUser({
            id: adminData.user_id,
            email: user.email || '',
            role: adminData.role as AdminRole,
            permissions,
            createdAt: adminData.created_at,
            lastLoginAt: adminData.last_login_at,
          });

          // Update last login time
          await supabase
            .from('admin_users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('user_id', user.id);
        } else if (isPredefinedAdmin || isProfileAdmin) {
          console.log('Creating admin access for user:', user.email);

          // Determine role
          const role = isPredefinedAdmin ? 'super_admin' : (profileData?.role as AdminRole);

          // Try to create admin user record
          const { data: newAdminData, error: createError } = await supabase
            .from('admin_users')
            .insert([{
              user_id: user.id,
              role: role,
              is_active: true,
              created_by: user.id,
            }])
            .select()
            .single();

          if (createError) {
            console.error('Error creating admin user record:', createError);
            // Still grant admin access based on profile
            const permissions = getPermissionsForRole(role);
            setAdminUser({
              id: user.id,
              email: user.email || '',
              role,
              permissions,
              createdAt: new Date().toISOString(),
            });
          } else if (newAdminData) {
            const permissions = getPermissionsForRole(role);
            setAdminUser({
              id: newAdminData.user_id,
              email: user.email || '',
              role: role,
              permissions,
              createdAt: newAdminData.created_at,
              lastLoginAt: newAdminData.last_login_at,
            });

            toast({
              title: "Admin Access Granted",
              description: `Welcome! You now have ${role} access to the platform.`,
            });
          }
        } else {
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }
    } catch (error) {
      console.error('AdminContext: Error fetching admin status:', error);
      setAdminUser(null);
      toast({
        title: "Error",
        description: "Failed to verify admin status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      refreshAdminStatus();
    }
  }, [user, authLoading]);

  // Also refresh admin status when user changes (e.g., after login)
  useEffect(() => {
    if (user && !authLoading) {
      refreshAdminStatus();
    }
  }, [user?.id]);

  const checkPermission = (permission: keyof AdminPermissions): boolean => {
    return adminUser?.permissions[permission] || false;
  };

  const isAdmin = adminUser?.role === 'admin' || adminUser?.role === 'super_admin';
  const isSuperAdmin = adminUser?.role === 'super_admin';
  const permissions = adminUser?.permissions || defaultPermissions;

  const value: AdminContextType = {
    adminUser,
    isAdmin,
    isSuperAdmin,
    loading: loading || authLoading,
    permissions,
    checkPermission,
    refreshAdminStatus,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

// Higher-order component for admin route protection
export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission?: keyof AdminPermissions
) {
  return function AdminProtectedComponent(props: P) {
    const { isAdmin, checkPermission, loading } = useAdmin();
    const { toast } = useToast();

    useEffect(() => {
      if (!loading && !isAdmin) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page",
          variant: "destructive"
        });
      }
    }, [isAdmin, loading, toast]);

    if (loading) {
      return (
        <div className="min-h-screen bg-transparent flex items-center justify-center">
          <div className="text-white">Loading admin panel...</div>
        </div>
      );
    }

    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-transparent flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p>You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    if (requiredPermission && !checkPermission(requiredPermission)) {
      return (
        <div className="min-h-screen bg-transparent flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Insufficient Permissions</h1>
            <p>You don't have the required permissions to access this feature.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
