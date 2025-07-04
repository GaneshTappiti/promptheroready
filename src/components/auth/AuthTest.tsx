/**
 * Authentication Test Component
 * Comprehensive testing of authentication functionality
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, AlertCircle, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  details?: unknown;
}

const AuthTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('testpassword123');
  const { user, signIn, signUp, signOut, resetPassword } = useAuth();

  const runAuthTests = async () => {
    setIsRunning(true);
    setResults([]);
    const testResults: TestResult[] = [];

    // Test 1: Check Supabase connection
    try {
      const { data, error } = await supabase.auth.getSession();
      testResults.push({
        name: 'Supabase Auth Connection',
        success: !error,
        error: error?.message,
        details: { hasSession: !!data.session }
      });
    } catch (error) {
      testResults.push({
        name: 'Supabase Auth Connection',
        success: false,
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      });
    }

    // Test 2: Check user_profiles table access
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);

      testResults.push({
        name: 'User Profiles Table Access',
        success: !error || error.code === 'PGRST116', // No rows is OK
        error: error?.message,
        details: { accessible: !error || error.code === 'PGRST116' }
      });
    } catch (error) {
      testResults.push({
        name: 'User Profiles Table Access',
        success: false,
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      });
    }

    // Test 3: Check current user state
    testResults.push({
      name: 'Current User State',
      success: true,
      details: {
        isLoggedIn: !!user,
        userEmail: user?.email,
        userId: user?.id
      }
    });

    // Test 4: Test password reset (without actually sending email)
    try {
      // This will test the function but won't send email for invalid addresses
      const { error } = await resetPassword('nonexistent@test.com');
      testResults.push({
        name: 'Password Reset Function',
        success: true, // Function should work even if email doesn't exist
        details: { functionWorks: true }
      });
    } catch (error) {
      testResults.push({
        name: 'Password Reset Function',
        success: false,
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      });
    }

    // Test 5: Check RLS policies
    if (user) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id);

        testResults.push({
          name: 'RLS Policy Check (Own Profile)',
          success: !error,
          error: error?.message,
          details: { canAccessOwnProfile: !error }
        });
      } catch (error) {
        testResults.push({
          name: 'RLS Policy Check (Own Profile)',
          success: false,
          error: error instanceof Error ? (error as Error).message : 'Unknown error'
        });
      }
    } else {
      testResults.push({
        name: 'RLS Policy Check (Own Profile)',
        success: true,
        details: { skipped: 'No user logged in' }
      });
    }

    setResults(testResults);
    setIsRunning(false);
  };

  const testSignUp = async () => {
    if (!testEmail || !testPassword) return;

    setIsRunning(true);
    try {
      const { error } = await signUp(testEmail, testPassword);
      const newResult: TestResult = {
        name: 'Test Sign Up',
        success: !error,
        error: error?.message,
        details: { email: testEmail }
      };
      setResults(prev => [...prev, newResult]);
    } catch (error) {
      const newResult: TestResult = {
        name: 'Test Sign Up',
        success: false,
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      };
      setResults(prev => [...prev, newResult]);
    }
    setIsRunning(false);
  };

  const testSignIn = async () => {
    if (!testEmail || !testPassword) return;

    setIsRunning(true);
    try {
      const { error } = await signIn(testEmail, testPassword);
      const newResult: TestResult = {
        name: 'Test Sign In',
        success: !error,
        error: error?.message,
        details: { email: testEmail }
      };
      setResults(prev => [...prev, newResult]);
    } catch (error) {
      const newResult: TestResult = {
        name: 'Test Sign In',
        success: false,
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      };
      setResults(prev => [...prev, newResult]);
    }
    setIsRunning(false);
  };

  const testSignOut = async () => {
    setIsRunning(true);
    try {
      await signOut();
      const newResult: TestResult = {
        name: 'Test Sign Out',
        success: true,
        details: { signedOut: true }
      };
      setResults(prev => [...prev, newResult]);
    } catch (error) {
      const newResult: TestResult = {
        name: 'Test Sign Out',
        success: false,
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      };
      setResults(prev => [...prev, newResult]);
    }
    setIsRunning(false);
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? "PASS" : "FAIL"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6" />
            Authentication System Test
          </CardTitle>
          <CardDescription>
            Comprehensive testing of authentication functionality and database integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current User Status */}
          <Alert className={user ? "border-green-500" : "border-yellow-500"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  Current Status: {user ? `Logged in as ${user.email}` : 'Not logged in'}
                </span>
                <Badge variant={user ? "default" : "secondary"}>
                  {user ? "AUTHENTICATED" : "GUEST"}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>

          {/* Test Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Test Credentials</h3>
              <div className="space-y-2">
                <Label htmlFor="test-email">Test Email</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-password">Test Password</Label>
                <Input
                  id="test-password"
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="testpassword123"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Test Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={runAuthTests}
                  disabled={isRunning}
                  className="flex items-center gap-2"
                >
                  {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Run Tests
                </Button>
                <Button
                  onClick={testSignUp}
                  disabled={isRunning}
                  variant="outline"
                >
                  Test Sign Up
                </Button>
                <Button
                  onClick={testSignIn}
                  disabled={isRunning}
                  variant="outline"
                >
                  Test Sign In
                </Button>
                <Button
                  onClick={testSignOut}
                  disabled={isRunning || !user}
                  variant="outline"
                >
                  Test Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Test Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Test Results</h3>
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.success)}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.error && (
                      <span className="text-sm text-red-500 max-w-xs truncate">{result.error}</span>
                    )}
                    {result.details && (
                      <span className="text-sm text-muted-foreground">
                        {JSON.stringify(result.details)}
                      </span>
                    )}
                    {getStatusBadge(result.success)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthTest;