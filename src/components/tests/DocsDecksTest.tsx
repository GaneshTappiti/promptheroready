/**
 * Docs & Decks Test Component
 * Comprehensive testing of Docs & Decks functionality
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, AlertCircle, FileText, Loader2, Presentation, FilePieChart, Users } from 'lucide-react';
import { docsDecksHelpers } from '@/lib/supabase-connection-helpers';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  details?: any;
}

interface TestDocument {
  title: string;
  content: string;
  document_type: 'document' | 'presentation' | 'pitch_deck' | 'business_plan';
  description?: string;
  tags: string[];
  is_public: boolean;
}

const DocsDecksTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testDocument, setTestDocument] = useState<TestDocument>({
    title: 'Test Business Plan',
    content: '# Executive Summary\n\nThis is a test business plan document for our AI-powered task management system.\n\n## Market Analysis\n\nThe market for productivity tools is growing rapidly...',
    document_type: 'business_plan',
    description: 'A comprehensive business plan for testing document functionality.',
    tags: ['business', 'planning', 'test'],
    is_public: false
  });
  const [createdDocumentId, setCreatedDocumentId] = useState<string | null>(null);
  const [createdTemplateId, setCreatedTemplateId] = useState<string | null>(null);
  const { user } = useAuth();

  const runDocsDecksTests = async () => {
    setIsRunning(true);
    setResults([]);
    const testResults: TestResult[] = [];

    if (!user) {
      testResults.push({
        name: 'User Authentication Check',
        success: false,
        error: 'User must be logged in to test Docs & Decks functionality'
      });
      setResults(testResults);
      setIsRunning(false);
      return;
    }

    // Test 1: Check documents table access
    try {
      const { data, error } = await docsDecksHelpers.getDocuments(user.id);
      testResults.push({
        name: 'Documents Table Access',
        success: !error,
        error: error?.message,
        details: {
          accessible: !error,
          existingDocuments: data?.length || 0
        }
      });
    } catch (error) {
      testResults.push({
        name: 'Documents Table Access',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Create a new document
    try {
      const newDocument = {
        ...testDocument,
        user_id: user.id,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await docsDecksHelpers.createDocument(newDocument);

      if (!error && data) {
        setCreatedDocumentId(data.id);
        testResults.push({
          name: 'Create Document',
          success: true,
          details: {
            documentId: data.id,
            title: data.title,
            type: data.document_type
          }
        });
      } else {
        testResults.push({
          name: 'Create Document',
          success: false,
          error: error?.message || 'No data returned'
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Create Document',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Update document
    if (createdDocumentId) {
      try {
        const updates = {
          title: testDocument.title + ' (Updated)',
          content: testDocument.content + '\n\n## Updated Section\n\nThis section was added during testing.',
          version: 2,
          updated_at: new Date().toISOString()
        };

        const { data, error } = await docsDecksHelpers.updateDocument(createdDocumentId, updates);

        testResults.push({
          name: 'Update Document',
          success: !error,
          error: error?.message,
          details: {
            updated: !error,
            newTitle: updates.title,
            newVersion: updates.version
          }
        });
      } catch (error) {
        testResults.push({
          name: 'Update Document',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } else {
      testResults.push({
        name: 'Update Document',
        success: false,
        error: 'No document created to update'
      });
    }

    // Test 4: Test document templates functionality
    try {
      const templateData = {
        name: 'Test Business Plan Template',
        description: 'A template for creating business plans',
        category: 'business',
        content: '# Business Plan Template\n\n## Executive Summary\n[Your executive summary here]\n\n## Market Analysis\n[Your market analysis here]',
        tags: ['template', 'business', 'planning'],
        is_public: true,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('document_templates')
        .insert([templateData])
        .select()
        .single();

      if (!error && data) {
        setCreatedTemplateId(data.id);
        testResults.push({
          name: 'Create Document Template',
          success: true,
          details: {
            templateId: data.id,
            name: data.name
          }
        });
      } else {
        testResults.push({
          name: 'Create Document Template',
          success: false,
          error: error?.message || 'No data returned'
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Create Document Template',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 5: Test document sharing functionality
    if (createdDocumentId) {
      try {
        const shareData = {
          document_id: createdDocumentId,
          shared_with_user_id: user.id, // Self-share for testing
          permission_level: 'read',
          shared_by_user_id: user.id,
          created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('document_shares')
          .insert([shareData])
          .select()
          .single();

        testResults.push({
          name: 'Document Sharing',
          success: !error,
          error: error?.message,
          details: {
            shareId: data?.id,
            permission: data?.permission_level
          }
        });
      } catch (error) {
        testResults.push({
          name: 'Document Sharing',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } else {
      testResults.push({
        name: 'Document Sharing',
        success: false,
        error: 'No document created to share'
      });
    }

    // Test 6: Retrieve documents list
    try {
      const { data, error } = await docsDecksHelpers.getDocuments(user.id);
      testResults.push({
        name: 'Retrieve Documents List',
        success: !error,
        error: error?.message,
        details: {
          totalDocuments: data?.length || 0,
          hasTestDocument: data?.some(doc => doc.id === createdDocumentId) || false
        }
      });
    } catch (error) {
      testResults.push({
        name: 'Retrieve Documents List',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setResults(testResults);
    setIsRunning(false);
  };

  const cleanupTestData = async () => {
    if (!createdDocumentId) return;

    setIsRunning(true);
    try {
      // Archive the test document
      const { error } = await docsDecksHelpers.updateDocument(createdDocumentId, {
        title: testDocument.title + ' (Test - Archived)',
        is_public: false,
        updated_at: new Date().toISOString()
      });

      if (!error) {
        setCreatedDocumentId(null);
        setCreatedTemplateId(null);

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
            <FileText className="h-6 w-6" />
            Docs & Decks Feature Test
          </CardTitle>
          <CardDescription>
            Comprehensive testing of Docs & Decks functionality including document creation, templates, sharing, and version tracking
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
              <h3 className="font-semibold">Test Document Configuration</h3>
              <div className="space-y-2">
                <Label htmlFor="doc-title">Document Title</Label>
                <Input
                  id="doc-title"
                  value={testDocument.title}
                  onChange={(e) => setTestDocument(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter test document title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-type">Document Type</Label>
                <Select
                  value={testDocument.document_type}
                  onValueChange={(value: any) => setTestDocument(prev => ({ ...prev, document_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="pitch_deck">Pitch Deck</SelectItem>
                    <SelectItem value="business_plan">Business Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-description">Description</Label>
                <Textarea
                  id="doc-description"
                  value={testDocument.description || ''}
                  onChange={(e) => setTestDocument(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter document description"
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Test Actions</h3>
              <div className="space-y-2">
                <Button
                  onClick={runDocsDecksTests}
                  disabled={isRunning || !user}
                  className="w-full flex items-center gap-2"
                >
                  {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Run Docs & Decks Tests
                </Button>
                <Button
                  onClick={cleanupTestData}
                  disabled={isRunning || !createdDocumentId}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Cleanup Test Data
                </Button>
              </div>

              {createdDocumentId && (
                <Alert className="border-yellow-500">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div>Test document created with ID: {createdDocumentId}</div>
                      {createdTemplateId && <div>Template created with ID: {createdTemplateId}</div>}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Feature Icons */}
              <div className="grid grid-cols-2 gap-2 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Documents
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Presentation className="h-4 w-4" />
                  Presentations
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FilePieChart className="h-4 w-4" />
                  Templates
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Sharing
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

export default DocsDecksTest;