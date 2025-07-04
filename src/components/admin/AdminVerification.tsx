import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';
import { setupPredefinedAdmin, isPredefinedAdmin } from '@/utils/setupSpecificAdmin';
import {
  Shield,
  User,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const AdminVerification: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isSuperAdmin, refreshAdminStatus } = useAdmin();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSetupPredefinedAdmin = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to set up admin access",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const result = await setupPredefinedAdmin();

      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        });
        // Refresh admin status to update the UI
        await refreshAdminStatus();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: unknown) {
      console.error('Error setting up predefined admin:', error);
      toast({
        title: "Error",
        description: (error as Error)?.message || "Failed to set up admin access",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    setLoading(true);
    await refreshAdminStatus();
    setLoading(false);
    toast({
      title: "Status Refreshed",
      description: "Admin status has been updated"
    });
  };

  if (!user) {
    return (
      <Card className="workspace-card">
        <CardContent className="p-8 text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Authentication Required</h3>
          <p className="text-gray-400">
            Please sign in to verify admin access.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isPredefined = isPredefinedAdmin(user.email || '');

  return (
    <Card className="workspace-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-400" />
          Admin Access Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current User Info */}
        <div className="p-3 bg-black/20 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Current User</p>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {isPredefined && (
                <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-400">
                  Predefined Admin
                </Badge>
              )}
              {isAdmin && (
                <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400">
                  <Shield className="h-3 w-3 mr-1" />
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Admin Status */}
        <Alert className={`${isAdmin ? 'border-green-600/20 bg-green-600/10' : 'border-yellow-600/20 bg-yellow-600/10'}`}>
          {isAdmin ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
          )}
          <AlertDescription className={isAdmin ? 'text-green-200' : 'text-yellow-200'}>
            {isAdmin ? (
              <span>
                <strong>Admin Access Active:</strong> You have {isSuperAdmin ? 'super admin' : 'admin'} privileges.
              </span>
            ) : isPredefined ? (
              <span>
                <strong>Admin Setup Available:</strong> Your email is configured for admin access. 
                Click the button below to activate admin privileges.
              </span>
            ) : (
              <span>
                <strong>No Admin Access:</strong> Your account does not have admin privileges.
              </span>
            )}
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {isPredefined && !isAdmin && (
            <Button
              onClick={handleSetupPredefinedAdmin}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
              Activate Admin Access
            </Button>
          )}
          
          <Button
            onClick={handleRefreshStatus}
            disabled={loading}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh Status
          </Button>
        </div>

        {/* Admin Panel Access */}
        {isAdmin && (
          <div className="pt-3 border-t border-white/10">
            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <a href="/admin">
                <Shield className="mr-2 h-4 w-4" />
                Go to Admin Panel
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminVerification;
