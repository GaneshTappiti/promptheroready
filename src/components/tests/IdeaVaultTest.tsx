/**
 * Idea Vault Test Component
 * Comprehensive testing of Idea Vault functionality
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, AlertCircle, Lightbulb, Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { supabaseHelpers } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveIdea } from '@/stores/ideaStore';

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  details?: unknown;
}

interface TestIdea {
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: 'draft' | 'validated' | 'exploring' | 'archived';
}

const IdeaVaultTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testIdea, setTestIdea] = useState<TestIdea>({
    title: 'Test Startup Idea',
    description: 'A revolutionary app that solves everyday problems using AI technology.',
    category: 'Technology',
    tags: ['AI', 'Mobile', 'SaaS'],
    status: 'draft'
  });
  const [createdIdeaId, setCreatedIdeaId] = useState<string | null>(null);
  const { user } = useAuth();
  const { activeIdea, setActiveIdea } = useActiveIdea();

  const runIdeaVaultTests = async () => {
    setIsRunning(true);
    setResults([]);
    const testResults: TestResult[] = [];

    if (!user) {
      testResults.push({
        name: 'User Authentication Check',
        success: false,
        error: 'User must be logged in to test Idea Vault functionality'
      });
      setResults(testResults);
      setIsRunning(false);
      return;
    }

    // Test 1: Check ideas table access
    try {
      const { data, error } = await supabaseHelpers.getIdeas();
      testResults.push({
        name: 'Ideas Table Access',
        success: !error,
        error: error?.message,
        details: {
          accessible: !error,
          existingIdeas: data?.length || 0
        }
      });
    } catch (error) {
      testResults.push({
        name: 'Ideas Table Access',
        success: false,
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      });
    }

    // Test 2: Create a new idea
    try {
      const newIdea = {
        ...testIdea,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseHelpers.createIdea(newIdea);

      if (!error && data && data[0]) {
        setCreatedIdeaId(data[0].id);
        testResults.push({
          name: 'Create New Idea',
          success: true,
          details: {
            ideaId: data[0].id,
            title: data[0].title
          }
        });
      } else {
        testResults.push({
          name: 'Create New Idea',
          success: false,
          error: error?.message || 'No data returned'
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Create New Idea',
        success: false,
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      });
    }

    // Test 3: Update the created idea (if successful)
    if (createdIdeaId) {
      try {
        const updates = {
          title: testIdea.title + ' (Updated)',
          status: 'validated',
          validation_score: 85,
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabaseHelpers.updateIdea(createdIdeaId, updates);

        testResults.push({
          name: 'Update Idea',
          success: !error,
          error: error?.message,
          details: {
            updated: !error,
            newTitle: updates.title,
            newStatus: updates.status
          }
        });
      } catch (error) {
        testResults.push({
          name: 'Update Idea',
          success: false,
          error: error instanceof Error ? (error as Error).message : 'Unknown error'
        });
      }
    } else {
      testResults.push({
        name: 'Update Idea',
        success: false,
        error: 'No idea created to update'
      });
    }

    // Test 4: Retrieve ideas list
    try {
      const { data, error } = await supabaseHelpers.getIdeas();
      testResults.push({
        name: 'Retrieve Ideas List',
        success: !error,
        error: error?.message,
        details: {
          totalIdeas: data?.length || 0,
          hasTestIdea: data?.some(idea => idea.id === createdIdeaId) || false
        }
      });
    } catch (error) {
      testResults.push({
        name: 'Retrieve Ideas List',
        success: false,
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      });
    }

    // Test 5: Test Zustand store integration
    try {
      if (createdIdeaId) {
        const { data } = await supabaseHelpers.getIdeas();
        const testIdeaFromDB = data?.find(idea => idea.id === createdIdeaId);

        if (testIdeaFromDB) {
          setActiveIdea({
            id: testIdeaFromDB.id,
            title: testIdeaFromDB.title,
            description: testIdeaFromDB.description || '',
            status: testIdeaFromDB.status,
            category: testIdeaFromDB.category,
            tags: testIdeaFromDB.tags || [],
            validation_score: testIdeaFromDB.validation_score,
            created_at: testIdeaFromDB.created_at,
            updated_at: testIdeaFromDB.updated_at
          });

          testResults.push({
            name: 'Zustand Store Integration',
            success: true,
            details: {
              storeUpdated: true,
              activeIdeaId: testIdeaFromDB.id
            }
          });
        } else {
          testResults.push({
            name: 'Zustand Store Integration',
            success: false,
            error: 'Could not find test idea in database'
          });
        }
      } else {
        testResults.push({
          name: 'Zustand Store Integration',
          success: false,
          error: 'No idea created to test store integration'
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Zustand Store Integration',
        success: false,
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      });
    }

    setResults(testResults);
    setIsRunning(false);
  };

  const cleanupTestData = async () => {
    if (!createdIdeaId) return;

    setIsRunning(true);
    try {
      // Archive the test idea instead of deleting it
      const { error } = await supabaseHelpers.updateIdea(createdIdeaId, {
        status: 'archived',
        title: testIdea.title + ' (Test - Archived)',
        updated_at: new Date().toISOString()
      });

      if (!error) {
        setCreatedIdeaId(null);
        setActiveIdea(null);

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
          error: (error as Error).message
        };
        setResults(prev => [...prev, newResult]);
      }
    } catch (error) {
      const newResult: TestResult = {
        name: 'Cleanup Test Data',
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
            <Lightbulb className="h-6 w-6" />
            Idea Vault Feature Test
          </CardTitle>
          <CardDescription>
            Comprehensive testing of Idea Vault functionality including CRUD operations and store integration
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

          {/* Active Idea Status */}
          {activeIdea && (
            <Alert className="border-blue-500">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    Active Idea: {activeIdea.title} (Status: {activeIdea.status})
                  </span>
                  <Badge variant="outline">
                    ACTIVE
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Test Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Test Idea Configuration</h3>
              <div className="space-y-2">
                <Label htmlFor="test-title">Idea Title</Label>
                <Input
                  id="test-title"
                  value={testIdea.title}
                  onChange={(e) => setTestIdea(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter test idea title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-description">Description</Label>
                <Textarea
                  id="test-description"
                  value={testIdea.description}
                  onChange={(e) => setTestIdea(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter test idea description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-category">Category</Label>
                <Input
                  id="test-category"
                  value={testIdea.category}
                  onChange={(e) => setTestIdea(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Enter category"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Test Actions</h3>
              <div className="space-y-2">
                <Button
                  onClick={runIdeaVaultTests}
                  disabled={isRunning || !user}
                  className="w-full flex items-center gap-2"
                >
                  {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Run Idea Vault Tests
                </Button>
                <Button
                  onClick={cleanupTestData}
                  disabled={isRunning || !createdIdeaId}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Cleanup Test Data
                </Button>
              </div>

              {createdIdeaId && (
                <Alert className="border-yellow-500">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Test idea created with ID: {createdIdeaId}
                  </AlertDescription>
                </Alert>
              )}
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

export default IdeaVaultTest;