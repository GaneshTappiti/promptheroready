/**
 * IdeaForge Test Component
 * Comprehensive testing of IdeaForge functionality
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, AlertCircle, Lightbulb, Loader2, BookOpen, Layers, GitBranch, MessageSquare } from 'lucide-react';
import { ideaForgeHelpers } from '@/lib/supabase-connection-helpers';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  details?: unknown;
}

interface TestIdeaForge {
  title: string;
  description: string;
  tags: string[];
  status: 'draft' | 'researching' | 'validated' | 'building';
}

const IdeaForgeTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testIdea, setTestIdea] = useState<TestIdeaForge>({
    title: 'AI-Powered Task Manager',
    description: 'An intelligent task management system that uses AI to prioritize and organize tasks automatically.',
    tags: ['AI', 'Productivity', 'SaaS'],
    status: 'draft'
  });
  const [createdIdeaId, setCreatedIdeaId] = useState<string | null>(null);
  const [createdWikiPageId, setCreatedWikiPageId] = useState<string | null>(null);
  const { user } = useAuth();

  const runIdeaForgeTests = async () => {
    setIsRunning(true);
    setResults([]);
    const testResults: TestResult[] = [];

    if (!user) {
      testResults.push({
        name: 'User Authentication Check',
        success: false,
        error: 'User must be logged in to test IdeaForge functionality'
      });
      setResults(testResults);
      setIsRunning(false);
      return;
    }

    // Test 1: Check ideas table access for IdeaForge
    try {
      const { data, error } = await ideaForgeHelpers.getIdeas(user.id);
      testResults.push({
        name: 'IdeaForge Ideas Access',
        success: !error,
        error: error?.message,
        details: {
          accessible: !error,
          existingIdeas: data?.length || 0
        }
      });
    } catch (error) {
      testResults.push({
        name: 'IdeaForge Ideas Access',
        success: false,
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      });
    }

    // Test 2: Create a new idea via IdeaForge
    try {
      const newIdea = {
        title: testIdea.title,
        description: testIdea.description,
        status: testIdea.status,
        tags: testIdea.tags,
        user_id: user.id,
        progress: {
          wiki: 0,
          blueprint: 0,
          journey: 0,
          feedback: 0
        }
      };

      const { data, error } = await ideaForgeHelpers.createIdea(newIdea);

      if (!error && data) {
        setCreatedIdeaId(data.id);
        testResults.push({
          name: 'Create IdeaForge Idea',
          success: true,
          details: {
            ideaId: data.id,
            title: data.title,
            status: data.status
          }
        });
      } else {
        testResults.push({
          name: 'Create IdeaForge Idea',
          success: false,
          error: error?.message || 'No data returned'
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Create IdeaForge Idea',
        success: false,
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      });
    }

    // Test 3: Test wiki pages functionality
    if (createdIdeaId) {
      try {
        const wikiPageData = {
          idea_id: createdIdeaId,
          title: 'Market Research',
          content: 'This is a test wiki page for market research analysis.',
          order_index: 1,
          user_id: user.id
        };

        const { data, error } = await supabase
          .from('wiki_pages')
          .insert([wikiPageData])
          .select()
          .single();

        if (!error && data) {
          setCreatedWikiPageId(data.id);
          testResults.push({
            name: 'Create Wiki Page',
            success: true,
            details: {
              wikiPageId: data.id,
              title: data.title
            }
          });
        } else {
          testResults.push({
            name: 'Create Wiki Page',
            success: false,
            error: error?.message || 'No data returned'
          });
        }
      } catch (error) {
        testResults.push({
          name: 'Create Wiki Page',
          success: false,
          error: error instanceof Error ? (error as Error).message : 'Unknown error'
        });
      }
    } else {
      testResults.push({
        name: 'Create Wiki Page',
        success: false,
        error: 'No idea created to attach wiki page to'
      });
    }

    // Test 4: Test journey entries functionality
    if (createdIdeaId) {
      try {
        const journeyEntryData = {
          idea_id: createdIdeaId,
          title: 'Initial Concept',
          content: 'Started working on the AI-powered task manager concept.',
          entry_type: 'milestone',
          user_id: user.id
        };

        const { data, error } = await supabase
          .from('journey_entries')
          .insert([journeyEntryData])
          .select()
          .single();

        testResults.push({
          name: 'Create Journey Entry',
          success: !error,
          error: error?.message,
          details: {
            journeyEntryId: data?.id,
            title: data?.title
          }
        });
      } catch (error) {
        testResults.push({
          name: 'Create Journey Entry',
          success: false,
          error: error instanceof Error ? (error as Error).message : 'Unknown error'
        });
      }
    } else {
      testResults.push({
        name: 'Create Journey Entry',
        success: false,
        error: 'No idea created to attach journey entry to'
      });
    }

    // Test 5: Test feedback functionality
    if (createdIdeaId) {
      try {
        const feedbackData = {
          idea_id: createdIdeaId,
          feedback_type: 'suggestion',
          content: 'Consider adding integration with popular calendar apps.',
          priority: 'medium',
          user_id: user.id
        };

        const { data, error } = await supabase
          .from('feedback_items')
          .insert([feedbackData])
          .select()
          .single();

        testResults.push({
          name: 'Create Feedback Item',
          success: !error,
          error: error?.message,
          details: {
            feedbackId: data?.id,
            type: data?.feedback_type
          }
        });
      } catch (error) {
        testResults.push({
          name: 'Create Feedback Item',
          success: false,
          error: error instanceof Error ? (error as Error).message : 'Unknown error'
        });
      }
    } else {
      testResults.push({
        name: 'Create Feedback Item',
        success: false,
        error: 'No idea created to attach feedback to'
      });
    }

    // Test 6: Test getting idea with all details
    if (createdIdeaId) {
      try {
        const result = await ideaForgeHelpers.getIdeaWithDetails(createdIdeaId);
        testResults.push({
          name: 'Get Idea With Details',
          success: !result.error,
          error: result.error?.message,
          details: {
            hasIdea: !!result.idea,
            hasWikiPages: !!result.wiki?.length,
            hasJourneyEntries: !!result.journey?.length,
            hasFeedback: !!result.feedback?.length
          }
        });
      } catch (error) {
        testResults.push({
          name: 'Get Idea With Details',
          success: false,
          error: error instanceof Error ? (error as Error).message : 'Unknown error'
        });
      }
    } else {
      testResults.push({
        name: 'Get Idea With Details',
        success: false,
        error: 'No idea created to retrieve details for'
      });
    }

    setResults(testResults);
    setIsRunning(false);
  };

  const cleanupTestData = async () => {
    if (!createdIdeaId) return;

    setIsRunning(true);
    try {
      // Archive the test idea and related data
      const { error } = await ideaForgeHelpers.updateIdea(createdIdeaId, {
        status: 'archived',
        title: testIdea.title + ' (Test - Archived)',
        updated_at: new Date().toISOString()
      });

      if (!error) {
        setCreatedIdeaId(null);
        setCreatedWikiPageId(null);

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
            IdeaForge Feature Test
          </CardTitle>
          <CardDescription>
            Comprehensive testing of IdeaForge functionality including idea creation, wiki pages, journey entries, and feedback
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
              <h3 className="font-semibold">Test IdeaForge Configuration</h3>
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
                <Label htmlFor="test-tags">Tags (comma-separated)</Label>
                <Input
                  id="test-tags"
                  value={testIdea.tags.join(', ')}
                  onChange={(e) => setTestIdea(prev => ({
                    ...prev,
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                  }))}
                  placeholder="AI, Productivity, SaaS"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Test Actions</h3>
              <div className="space-y-2">
                <Button
                  onClick={runIdeaForgeTests}
                  disabled={isRunning || !user}
                  className="w-full flex items-center gap-2"
                >
                  {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Run IdeaForge Tests
                </Button>
                <Button
                  onClick={cleanupTestData}
                  disabled={isRunning || !createdIdeaId}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Cleanup Test Data
                </Button>
              </div>

              {createdIdeaId && (
                <Alert className="border-yellow-500">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div>Test idea created with ID: {createdIdeaId}</div>
                      {createdWikiPageId && <div>Wiki page created with ID: {createdWikiPageId}</div>}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Feature Icons */}
              <div className="grid grid-cols-2 gap-2 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  Wiki Pages
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GitBranch className="h-4 w-4" />
                  Journey Entries
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  Feedback Items
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  Blueprint Data
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

export default IdeaForgeTest;