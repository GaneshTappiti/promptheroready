import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';
import { setupAdminDemo, createAdminUser, AdminSetupResult } from '@/utils/adminSetup';
import AdminVerification from './AdminVerification';
import {
  Shield,
  User,
  Database,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Settings,
} from 'lucide-react';

const AdminSetupDemo: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, adminUser, refreshAdminStatus } = useAdmin();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AdminSetupResult[]>([]);

  const handleSetupAdmin = async (role: 'admin' | 'super_admin') => {
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
      setResults([]);

      const setupResults = await setupAdminDemo(user.id, role);
      setResults(setupResults);

      const successCount = setupResults.filter(r => r.success).length;
      const totalCount = setupResults.length;

      if (successCount === totalCount) {
        toast({
          title: "Success",
          description: `Admin setup completed successfully! You now have ${role} access.`
        });
        // Refresh admin status to update the UI
        await refreshAdminStatus();
      } else {
        toast({
          title: "Partial Success",
          description: `${successCount}/${totalCount} setup steps completed. Check results below.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error setting up admin:', error);
      toast({
        title: "Error",
        description: "Failed to set up admin access",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdminOnly = async (role: 'admin' | 'super_admin') => {
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
      const result = await createAdminUser(user.id, role);
      setResults([result]);

      if (result.success) {
        toast({
          title: "Success",
          description: `Admin user created successfully with ${role} role!`
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
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast({
        title: "Error",
        description: "Failed to create admin user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="workspace-card">
        <CardContent className="p-8 text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Authentication Required</h3>
          <p className="text-gray-400">
            Please sign in to set up admin access.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Verification Component */}
      <AdminVerification />

      <Card className="workspace-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-400" />
            Admin Setup Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-blue-600/20 bg-blue-600/10">
            <AlertTriangle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200">
              <strong>Demo Setup:</strong> This will create admin access for your current user account 
              and populate the admin panel with sample data for testing purposes.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10">
              <div>
                <p className="text-white font-medium">Current User</p>
                <p className="text-gray-400 text-sm">{user.email}</p>
                {isAdmin && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400">
                      <Shield className="h-3 w-3 mr-1" />
                      {adminUser?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </Badge>
                  </div>
                )}
              </div>
              <Badge variant="outline" className="border-white/20 text-gray-300">
                User ID: {user.id.slice(0, 8)}...
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-white font-medium">Admin Role</h4>
                <p className="text-gray-400 text-sm">
                  Can manage prompt templates and AI tools directory
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleCreateAdminOnly('admin')}
                    disabled={loading}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <User className="mr-2 h-4 w-4" />}
                    Create Admin User Only
                  </Button>
                  <Button
                    onClick={() => handleSetupAdmin('admin')}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                    Setup Admin + Demo Data
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-white font-medium">Super Admin Role</h4>
                <p className="text-gray-400 text-sm">
                  Full access including user analytics, settings, and role management
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleCreateAdminOnly('super_admin')}
                    disabled={loading}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                    Create Super Admin Only
                  </Button>
                  <Button
                    onClick={() => handleSetupAdmin('super_admin')}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
                    Setup Super Admin + Demo Data
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card className="workspace-card">
          <CardHeader>
            <CardTitle className="text-white">Setup Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  result.success 
                    ? 'bg-green-600/10 border-green-600/20' 
                    : 'bg-red-600/10 border-red-600/20'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                    {result.success ? 'Success' : 'Error'}
                  </p>
                  <p className="text-gray-400 text-sm">{result.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="workspace-card">
        <CardHeader>
          <CardTitle className="text-white">Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-gray-300">
            <p>1. After setup, refresh the page to see the "Admin Panel" link in the sidebar</p>
            <p>2. Navigate to <code className="bg-black/30 px-2 py-1 rounded text-green-400">/admin</code> to access the admin dashboard</p>
            <p>3. Explore the different admin sections based on your role permissions</p>
            <p>4. The demo data includes sample prompt templates, AI tools, and platform settings</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetupDemo;
