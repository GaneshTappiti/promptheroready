import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import AdminVerification from '@/components/admin/AdminVerification';
import { runHealthCheck, getOverallHealth, HealthCheckResult } from '@/utils/healthCheck';
import {
  Shield,
  Home,
  Settings,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const AdminTest: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isSuperAdmin, adminUser, loading } = useAdmin();
  const [healthResults, setHealthResults] = useState<HealthCheckResult[]>([]);
  const [healthLoading, setHealthLoading] = useState(false);

  const runSystemHealthCheck = async () => {
    setHealthLoading(true);
    try {
      const results = await runHealthCheck();
      setHealthResults(results);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    runSystemHealthCheck();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Access Test</h1>
            <p className="text-gray-400 mt-1">
              Test and verify admin access for ganeshtappiti1605@gmail.com
            </p>
          </div>
          <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Link to="/workspace">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Workspace
            </Link>
          </Button>
        </div>

        {/* Current Status */}
        <Card className="workspace-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Info */}
              <div className="space-y-3">
                <h3 className="text-white font-medium">User Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{user?.email || 'Not logged in'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">User ID:</span>
                    <span className="text-white text-xs">{user?.id?.slice(0, 8) || 'N/A'}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expected Admin:</span>
                    <span className="text-white">
                      {user?.email === 'ganeshtappiti1605@gmail.com' ? (
                        <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-400">
                          <XCircle className="h-3 w-3 mr-1" />
                          No
                        </Badge>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Status */}
              <div className="space-y-3">
                <h3 className="text-white font-medium">Admin Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Loading:</span>
                    <span className="text-white">{loading ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Is Admin:</span>
                    <span className="text-white">
                      {isAdmin ? (
                        <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-400">
                          <XCircle className="h-3 w-3 mr-1" />
                          No
                        </Badge>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Role:</span>
                    <span className="text-white">{adminUser?.role || 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Super Admin:</span>
                    <span className="text-white">{isSuperAdmin ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health Check */}
        <Card className="workspace-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-400" />
              System Health Check
              {healthResults.length > 0 && (
                <Badge
                  variant="outline"
                  className={`ml-auto ${
                    getOverallHealth(healthResults) === 'healthy'
                      ? 'border-green-500/30 bg-green-500/10 text-green-400'
                      : getOverallHealth(healthResults) === 'warning'
                      ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                      : 'border-red-500/30 bg-red-500/10 text-red-400'
                  }`}
                >
                  {getOverallHealth(healthResults) === 'healthy' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {getOverallHealth(healthResults) === 'warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {getOverallHealth(healthResults) === 'error' && <XCircle className="h-3 w-3 mr-1" />}
                  {getOverallHealth(healthResults)}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {healthLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
                <p className="text-gray-400 mt-2">Running health checks...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {healthResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.status === 'healthy'
                        ? 'bg-green-600/10 border-green-600/20'
                        : result.status === 'warning'
                        ? 'bg-yellow-600/10 border-yellow-600/20'
                        : 'bg-red-600/10 border-red-600/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{result.component}</span>
                      <Badge
                        variant="outline"
                        className={`${
                          result.status === 'healthy'
                            ? 'border-green-500/30 bg-green-500/10 text-green-400'
                            : result.status === 'warning'
                            ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                            : 'border-red-500/30 bg-red-500/10 text-red-400'
                        }`}
                      >
                        {result.status}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{result.message}</p>
                  </div>
                ))}
                <Button
                  onClick={runSystemHealthCheck}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 mt-3"
                  disabled={healthLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Health Check
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Verification */}
        <AdminVerification />

        {/* Quick Actions */}
        <Card className="workspace-card">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Link to="/admin-setup">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Setup
                </Link>
              </Button>
              
              {isAdmin && (
                <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
                  <Link to="/admin">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Link>
                </Button>
              )}
              
              <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Link to="/workspace">
                  <Home className="h-4 w-4 mr-2" />
                  Workspace
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="workspace-card">
          <CardHeader>
            <CardTitle className="text-white">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-gray-300">
              <p><strong>For ganeshtappiti1605@gmail.com:</strong></p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Sign in with the admin email address</li>
                <li>The system should automatically detect and grant admin access</li>
                <li>If not automatic, click "Activate Admin Access" in the verification section above</li>
                <li>Once admin access is active, you can access the admin panel</li>
                <li>Use the "Admin Panel" link in the sidebar or the button above</li>
              </ol>
              
              <p className="mt-4"><strong>Troubleshooting:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Make sure you're signed in with the correct email</li>
                <li>Try refreshing the page if admin status doesn't update</li>
                <li>Check the browser console for any errors</li>
                <li>Use the "Refresh Status" button to manually update admin status</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTest;
