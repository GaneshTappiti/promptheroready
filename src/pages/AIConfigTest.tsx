import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Brain,
  Settings,
  Key
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { aiProviderService } from '@/services/aiProviderService';
import { createAIEngine } from '@/services/aiEngine';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export default function AIConfigTest() {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const tests: Omit<TestResult, 'status' | 'message'>[] = [
    {
      name: 'Environment Variables',
      details: 'Checking if Gemini API key is configured'
    },
    {
      name: 'AI Engine Initialization',
      details: 'Testing AI engine startup'
    },
    {
      name: 'User AI Preferences',
      details: 'Checking user-specific AI configuration'
    },
    {
      name: 'AI Provider Service',
      details: 'Testing AI provider service functionality'
    },
    {
      name: 'Simple AI Request',
      details: 'Making a test AI request'
    }
  ];

  useEffect(() => {
    // Initialize results
    setResults(tests.map(test => ({
      ...test,
      status: 'pending',
      message: 'Waiting to run...'
    })));
  }, []);

  const updateResult = (index: number, status: TestResult['status'], message: string) => {
    setResults(prev => prev.map((result, i) => 
      i === index ? { ...result, status, message } : result
    ));
  };

  const runTests = async () => {
    setTesting(true);
    
    try {
      // Test 1: Environment Variables
      updateResult(0, 'pending', 'Checking environment variables...');
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!geminiKey || geminiKey === 'your-gemini-api-key') {
        updateResult(0, 'warning', 'Gemini API key not configured in environment');
      } else {
        updateResult(0, 'success', 'Gemini API key found in environment');
      }

      // Test 2: AI Engine Initialization
      updateResult(1, 'pending', 'Initializing AI engine...');
      try {
        const aiEngine = createAIEngine(user?.id);
        updateResult(1, 'success', 'AI engine initialized successfully');
      } catch (error) {
        updateResult(1, 'error', `AI engine initialization failed: ${(error as Error).message}`);
      }

      // Test 3: User AI Preferences
      updateResult(2, 'pending', 'Checking user AI preferences...');
      if (!user) {
        updateResult(2, 'warning', 'No user logged in');
      } else {
        try {
          const preferences = await aiProviderService.getUserPreferences(user.id);
          if (preferences) {
            updateResult(2, 'success', `Found preferences for provider: ${preferences.provider}`);
          } else {
            updateResult(2, 'warning', 'No AI preferences configured for user');
          }
        } catch (error) {
          updateResult(2, 'error', `Failed to fetch preferences: ${(error as Error).message}`);
        }
      }

      // Test 4: AI Provider Service
      updateResult(3, 'pending', 'Testing AI provider service...');
      try {
        const providers = aiProviderService.getAvailableProviders();
        updateResult(3, 'success', `Found ${providers.length} available providers`);
      } catch (error) {
        updateResult(3, 'error', `Provider service error: ${(error as Error).message}`);
      }

      // Test 5: Simple AI Request
      updateResult(4, 'pending', 'Making test AI request...');
      if (!user) {
        updateResult(4, 'warning', 'Skipped - no user logged in');
      } else {
        try {
          // Test with AI provider service instead
          const request = {
            prompt: 'Say "Hello, AI test successful!"',
            temperature: 0.7,
            maxTokens: 100
          };

          const response = await aiProviderService.generateResponse(user.id, request);
          if (response && response.content && response.content.length > 0) {
            updateResult(4, 'success', `AI responded: ${response.content.substring(0, 50)}...`);
          } else {
            updateResult(4, 'error', 'AI returned empty response');
          }
        } catch (error) {
          updateResult(4, 'warning', `AI request failed (expected if no provider configured): ${(error as Error).message}`);
        }
      }

    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
      default:
        return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">AI Configuration Test</CardTitle>
            <CardDescription>
              Test your AI setup and configuration to ensure everything is working properly
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Environment Info */}
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                <strong>Current Environment:</strong> {import.meta.env.MODE} | 
                <strong> User:</strong> {user?.email || 'Not logged in'} |
                <strong> Gemini Key:</strong> {import.meta.env.VITE_GEMINI_API_KEY ? 'Configured' : 'Not configured'}
              </AlertDescription>
            </Alert>

            {/* Test Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Key className="w-5 h-5" />
                Test Results
              </h3>
              
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <h4 className="font-medium">{result.name}</h4>
                      <p className="text-sm text-gray-600">{result.message}</p>
                      {result.details && (
                        <p className="text-xs text-gray-500 mt-1">{result.details}</p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={runTests} 
                disabled={testing}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  'Run AI Tests'
                )}
              </Button>
              
              <Button variant="outline" asChild>
                <a href="/settings">Configure AI Settings</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
