/**
 * MVP Studio Test Component
 * Comprehensive testing of MVP Studio functionality
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, AlertCircle, Rocket, Loader2, Brain, Layers, Target } from 'lucide-react';
import { mvpStudioHelpers } from '@/lib/supabase-connection-helpers';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  details?: any;
}

interface TestMVP {
  title: string;
  description: string;
  idea_id?: string;
  target_audience: string;
  key_features: string[];
  tech_stack: string[];
  timeline: string;
  budget_range: string;
}

const MVPStudioTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testMVP, setTestMVP] = useState<TestMVP>({
    title: 'AI Task Manager MVP',
    description: 'A minimal viable product for an AI-powered task management system with smart prioritization.',
    target_audience: 'Busy professionals and entrepreneurs',
    key_features: ['Smart task prioritization', 'AI-powered scheduling', 'Team collaboration'],
    tech_stack: ['React', 'Node.js', 'PostgreSQL', 'OpenAI API'],
    timeline: '3 months',
    budget_range: '$10,000 - $25,000'
  });
  const [createdMVPId, setCreatedMVPId] = useState<string | null>(null);
  const [createdPromptId, setCreatedPromptId] = useState<string | null>(null);
  const { user } = useAuth();

  const runMVPStudioTests = async () => {
    setIsRunning(true);
    setResults([]);
    const testResults: TestResult[] = [];

    if (!user) {
      testResults.push({
        name: 'User Authentication Check',
        success: false,
        error: 'User must be logged in to test MVP Studio functionality'
      });
      setResults(testResults);
      setIsRunning(false);
      return;
    }

    // Test 1: Check MVPs table access
    try {
      const { data, error } = await mvpStudioHelpers.getMVPs(user.id);
      testResults.push({
        name: 'MVPs Table Access',
        success: !error,
        error: error?.message,
        details: {
          accessible: !error,
          existingMVPs: data?.length || 0
        }
      });
    } catch (error) {
      testResults.push({
        name: 'MVPs Table Access',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Create a new MVP
    try {
      const newMVP = {
        ...testMVP,
        user_id: user.id,
        status: 'planning' as const,
        progress: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await mvpStudioHelpers.createMVP(newMVP);

      if (!error && data) {
        setCreatedMVPId(data.id);
        testResults.push({
          name: 'Create MVP',
          success: true,
          details: {
            mvpId: data.id,
            title: data.title,
            status: data.status
          }
        });
      } else {
        testResults.push({
          name: 'Create MVP',
          success: false,
          error: error?.message || 'No data returned'
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Create MVP',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Update MVP
    if (createdMVPId) {
      try {
        const updates = {
          status: 'development' as const,
          progress: 25,
          updated_at: new Date().toISOString()
        };

        const { data, error } = await mvpStudioHelpers.updateMVP(createdMVPId, updates);

        testResults.push({
          name: 'Update MVP',
          success: !error,
          error: error?.message,
          details: {
            updated: !error,
            newStatus: updates.status,
            newProgress: updates.progress
          }
        });
      } catch (error) {
        testResults.push({
          name: 'Update MVP',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } else {
      testResults.push({
        name: 'Update MVP',
        success: false,
        error: 'No MVP created to update'
      });
    }

    // Test 4: Test prompt history functionality
    if (createdMVPId) {
      try {
        const promptData = {
          user_id: user.id,
          mvp_id: createdMVPId,
          prompt_type: 'feature_analysis',
          prompt_text: 'Analyze the key features for this MVP and suggest improvements.',
          response_text: 'Based on your MVP concept, here are the recommended features and improvements...',
          ai_provider: 'gemini',
          tokens_used: 150,
          created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('prompt_history')
          .insert([promptData])
          .select()
          .single();

        if (!error && data) {
          setCreatedPromptId(data.id);
          testResults.push({
            name: 'Create Prompt History',
            success: true,
            details: {
              promptId: data.id,
              type: data.prompt_type
            }
          });
        } else {
          testResults.push({
            name: 'Create Prompt History',
            success: false,
            error: error?.message || 'No data returned'
          });
        }
      } catch (error) {
        testResults.push({
          name: 'Create Prompt History',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } else {
      testResults.push({
        name: 'Create Prompt History',
        success: false,
        error: 'No MVP created to attach prompt history to'
      });
    }

    // Test 5: Test AI tools directory integration
    try {
      const { data, error } = await supabase
        .from('ai_tools_directory')
        .select('*')
        .limit(5);

      testResults.push({
        name: 'AI Tools Directory Access',
        success: !error,
        error: error?.message,
        details: {
          accessible: !error,
          toolsCount: data?.length || 0
        }
      });
    } catch (error) {
      testResults.push({
        name: 'AI Tools Directory Access',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 6: Retrieve MVPs with details
    try {
      const { data, error } = await mvpStudioHelpers.getMVPs(user.id);
      testResults.push({
        name: 'Retrieve MVPs List',
        success: !error,
        error: error?.message,
        details: {
          totalMVPs: data?.length || 0,
          hasTestMVP: data?.some(mvp => mvp.id === createdMVPId) || false
        }
      });
    } catch (error) {
      testResults.push({
        name: 'Retrieve MVPs List',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setResults(testResults);
    setIsRunning(false);
  };

  const cleanupTestData = async () => {
    if (!createdMVPId) return;

    setIsRunning(true);
    try {
      // Archive the test MVP
      const { error } = await mvpStudioHelpers.updateMVP(createdMVPId, {
        status: 'archived',
        title: testMVP.title + ' (Test - Archived)',
        updated_at: new Date().toISOString()
      });

      if (!error) {
        setCreatedMVPId(null);
        setCreatedPromptId(null);

        const newResult: TestResult = {
          name: 'Cleanup Test Data',
          success: true,
          details: { archived: true }
        };
        setResults(prev => [...prev, newResult]);
      } else {
        const newResult: TestResult = {
          name: 'Cleanup Test Data',
          success: false,
          error: error.message
        };
        setResults(prev => [...prev, newResult]);
      }
    } catch (error) {
      const newResult: TestResult = {
        name: 'Cleanup Test Data',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
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
            <Rocket className="h-6 w-6" />
            MVP Studio Feature Test
          </CardTitle>
          <CardDescription>
            Comprehensive testing of MVP Studio functionality including MVP creation, management, and prompt history tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current User Status */}
          <Alert className={user ? "border-green-500" : "border-red-500"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  User Status: {user ? `Logged in as ${user.email}` : 'Not logged in - tests will fail'}
                </span>
                <Badge variant={user ? "default" : "destructive"}>
                  {user ? "AUTHENTICATED" : "NOT AUTHENTICATED"}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>

          {/* Test Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Test MVP Configuration</h3>
              <div className="space-y-2">
                <Label htmlFor="mvp-title">MVP Title</Label>
                <Input
                  id="mvp-title"
                  value={testMVP.title}
                  onChange={(e) => setTestMVP(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter test MVP title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mvp-description">Description</Label>
                <Textarea
                  id="mvp-description"
                  value={testMVP.description}
                  onChange={(e) => setTestMVP(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter test MVP description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mvp-audience">Target Audience</Label>
                <Input
                  id="mvp-audience"
                  value={testMVP.target_audience}
                  onChange={(e) => setTestMVP(prev => ({ ...prev, target_audience: e.target.value }))}
                  placeholder="Enter target audience"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Test Actions</h3>
              <div className="space-y-2">
                <Button
                  onClick={runMVPStudioTests}
                  disabled={isRunning || !user}
                  className="w-full flex items-center gap-2"
                >
                  {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Run MVP Studio Tests
                </Button>
                <Button
                  onClick={cleanupTestData}
                  disabled={isRunning || !createdMVPId}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Cleanup Test Data
                </Button>
              </div>

              {createdMVPId && (
                <Alert className="border-yellow-500">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div>Test MVP created with ID: {createdMVPId}</div>
                      {createdPromptId && <div>Prompt history created with ID: {createdPromptId}</div>}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Feature Icons */}
              <div className="grid grid-cols-2 gap-2 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Brain className="h-4 w-4" />
                  AI Analysis
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  MVP Planning
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  Tech Stack
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Rocket className="h-4 w-4" />
                  Launch Ready
                </div>
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

export default MVPStudioTest;