import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin, AdminPermissions } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof AdminPermissions;
  superAdminOnly?: boolean;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({
  children,
  requiredPermission,
  superAdminOnly = false,
}) => {
  const { isAdmin, isSuperAdmin, checkPermission, loading } = useAdmin();
  const { toast } = useToast();

  // Show loading state while checking permissions
  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-white">Loading admin panel...</div>
      </div>
    );
  }

  // Check if user is admin at all
  if (!isAdmin) {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access this page",
      variant: "destructive"
    });
    return <Navigate to="/workspace" replace />;
  }

  // Check if super admin is required
  if (superAdminOnly && !isSuperAdmin) {
    toast({
      title: "Access Denied",
      description: "This page is only accessible to super administrators",
      variant: "destructive"
    });
    return <Navigate to="/admin" replace />;
  }

  // Check specific permission if required
  if (requiredPermission && !checkPermission(requiredPermission)) {
    toast({
      title: "Insufficient Permissions",
      description: "You don't have the required permissions to access this feature",
      variant: "destructive"
    });
    return <Navigate to="/admin" replace />;
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

export default ProtectedAdminRoute;
