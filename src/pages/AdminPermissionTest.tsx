import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/contexts/AdminContext';
import { generateTestReport, runPermissionTests, canAccessRoute, routePermissions } from '@/utils/adminPermissionTest';
import { CheckCircle, XCircle, Shield, TestTube, AlertTriangle } from 'lucide-react';

const AdminPermissionTest: React.FC = () => {
  const { adminUser, isAdmin, isSuperAdmin, permissions, checkPermission } = useAdmin();
  const [testResults, setTestResults] = useState<any>(null);

  const runTests = () => {
    const results = runPermissionTests();
    setTestResults(results);
  };

  const testCurrentUserPermissions = () => {
    if (!adminUser) return [];

    return routePermissions.map(rp => ({
      route: rp.route,
      canAccess: canAccessRoute(adminUser.role, permissions, rp.route),
      requiredPermission: rp.requiredPermission,
      superAdminOnly: rp.superAdminOnly,
      hasPermission: rp.requiredPermission ? checkPermission(rp.requiredPermission) : true,
    }));
  };

  const currentUserTests = testCurrentUserPermissions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Permission Test</h1>
          <p className="text-gray-400">Test and validate the admin permission system</p>
        </div>

        {/* Current User Status */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Current User Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white">{adminUser?.email || 'Not logged in'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Role</p>
                <Badge variant={adminUser?.role === 'super_admin' ? 'default' : 'secondary'}>
                  {adminUser?.role || 'none'}
                </Badge>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Is Admin</p>
                <Badge variant={isAdmin ? 'default' : 'destructive'}>
                  {isAdmin ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Is Super Admin</p>
                <Badge variant={isSuperAdmin ? 'default' : 'destructive'}>
                  {isSuperAdmin ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <p className="text-gray-400 text-sm mb-2">Permissions</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(permissions).map(([key, value]) => (
                  <Badge key={key} variant={value ? 'default' : 'secondary'} className="text-xs">
                    {key}: {value ? 'Yes' : 'No'}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current User Route Access */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Route Access Test (Current User)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentUserTests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {test.canAccess ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                    <span className="text-white font-mono">{test.route}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.superAdminOnly && (
                      <Badge variant="outline" className="text-xs">Super Admin Only</Badge>
                    )}
                    {test.requiredPermission && (
                      <Badge variant={test.hasPermission ? 'default' : 'destructive'} className="text-xs">
                        {test.requiredPermission}
                      </Badge>
                    )}
                    <Badge variant={test.canAccess ? 'default' : 'destructive'}>
                      {test.canAccess ? 'Allowed' : 'Denied'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Runner */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Permission System Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runTests} className="w-full">
              Run Comprehensive Permission Tests
            </Button>

            {testResults && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{testResults.passed}</p>
                    <p className="text-gray-400 text-sm">Passed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-400">{testResults.failed}</p>
                    <p className="text-gray-400 text-sm">Failed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">
                      {((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%
                    </p>
                    <p className="text-gray-400 text-sm">Success Rate</p>
                  </div>
                </div>

                {testResults.failed > 0 && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      <h3 className="text-red-400 font-semibold">Failed Tests</h3>
                    </div>
                    <div className="space-y-1">
                      {testResults.results
                        .filter((r: any) => !r.passed)
                        .map((r: any, index: number) => (
                          <p key={index} className="text-red-300 text-sm font-mono">
                            {r.role || 'non-admin'} accessing {r.route}: expected {r.expected.toString()}, got {r.actual.toString()}
                          </p>
                        ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Test Report</h3>
                  <pre className="text-gray-300 text-xs overflow-x-auto whitespace-pre-wrap">
                    {generateTestReport()}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPermissionTest;
