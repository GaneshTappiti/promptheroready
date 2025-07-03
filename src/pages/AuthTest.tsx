import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  testSupabaseConnection,
  testSignUp,
  testSignIn,
  testSignOut,
  getCurrentSession,
  runAuthTests,
  AuthTestResult
} from '@/utils/authTest';

interface ExtendedAuthTestResult extends AuthTestResult {
  name?: string;
}
import { Loader2, CheckCircle, XCircle, Play, User, LogOut } from 'lucide-react';

export default function AuthTest() {
  const { user, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpassword123');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<ExtendedAuthTestResult[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<AuthTestResult | null>(null);

  useEffect(() => {
    // Test connection on component mount
    testConnection();
  }, []);

  const testConnection = async () => {
    const result = await testSupabaseConnection();
    setConnectionStatus(result);
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      const results = await runAuthTests();
      setTestResults([
        { name: 'Supabase Connection', ...results.connection },
        { name: 'Current Session', ...results.session }
      ]);
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestSignUp = async () => {
    setLoading(true);
    try {
      const result = await testSignUp(email, password);
      setTestResults(prev => [...prev, { name: 'Sign Up Test', ...result }]);
    } catch (error) {
      console.error('Sign up test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestSignIn = async () => {
    setLoading(true);
    try {
      const result = await testSignIn(email, password);
      setTestResults(prev => [...prev, { name: 'Sign In Test', ...result }]);
    } catch (error) {
      console.error('Sign in test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestSignOut = async () => {
    setLoading(true);
    try {
      const result = await testSignOut();
      setTestResults(prev => [...prev, { name: 'Sign Out Test', ...result }]);
    } catch (error) {
      console.error('Sign out test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContextSignIn = async () => {
    setLoading(true);
    try {
      const result = await signIn(email, password);
      setTestResults(prev => [...prev, { 
        name: 'Context Sign In', 
        success: !result.error,
        message: result.error ? result.error.message : 'Sign in successful via context'
      }]);
    } catch (error) {
      console.error('Context sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContextSignUp = async () => {
    setLoading(true);
    try {
      const result = await signUp(email, password);
      setTestResults(prev => [...prev, { 
        name: 'Context Sign Up', 
        success: !result.error,
        message: result.error ? result.error.message : 'Sign up successful via context'
      }]);
    } catch (error) {
      console.error('Context sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContextSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setTestResults(prev => [...prev, { 
        name: 'Context Sign Out', 
        success: true,
        message: 'Sign out successful via context'
      }]);
    } catch (error) {
      console.error('Context sign out error:', error);
      setTestResults(prev => [...prev, { 
        name: 'Context Sign Out', 
        success: false,
        message: 'Sign out failed via context'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-glass p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="workspace-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Play className="h-5 w-5" />
              Authentication Test Suite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Supabase Connection:</span>
              {connectionStatus ? (
                <Badge variant={connectionStatus.success ? "default" : "destructive"}>
                  {connectionStatus.success ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Connected</>
                  ) : (
                    <><XCircle className="h-3 w-3 mr-1" /> Failed</>
                  )}
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Testing...
                </Badge>
              )}
            </div>

            {/* Current User Status */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Current User:</span>
              {user ? (
                <Badge variant="default">
                  <User className="h-3 w-3 mr-1" /> {user.email}
                </Badge>
              ) : (
                <Badge variant="secondary">Not authenticated</Badge>
              )}
            </div>

            {/* Test Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="test-email">Test Email</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="workspace-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-password">Test Password</Label>
                <Input
                  id="test-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="workspace-input"
                />
              </div>
            </div>

            {/* Test Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={runAllTests}
                disabled={loading}
                className="workspace-button"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Run All Tests'}
              </Button>
              
              <Button
                onClick={handleTestSignUp}
                disabled={loading}
                variant="outline"
                className="workspace-button-secondary"
              >
                Test Sign Up
              </Button>
              
              <Button
                onClick={handleTestSignIn}
                disabled={loading}
                variant="outline"
                className="workspace-button-secondary"
              >
                Test Sign In
              </Button>
              
              <Button
                onClick={handleTestSignOut}
                disabled={loading}
                variant="outline"
                className="workspace-button-secondary"
              >
                Test Sign Out
              </Button>
            </div>

            {/* Context Tests */}
            <div className="border-t border-white/10 pt-4">
              <h3 className="text-white font-medium mb-3">Auth Context Tests</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={handleContextSignUp}
                  disabled={loading}
                  variant="outline"
                  className="workspace-button-secondary"
                >
                  Context Sign Up
                </Button>
                
                <Button
                  onClick={handleContextSignIn}
                  disabled={loading}
                  variant="outline"
                  className="workspace-button-secondary"
                >
                  Context Sign In
                </Button>
                
                <Button
                  onClick={handleContextSignOut}
                  disabled={loading}
                  variant="outline"
                  className="workspace-button-secondary"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Context Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="workspace-card">
            <CardHeader>
              <CardTitle className="text-white">Test Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {testResults.map((result, index) => (
                <Alert key={index} variant={result.success ? "default" : "destructive"}>
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  <AlertDescription className="mt-2">
                    {result.message}
                  </AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
