/**
 * Database Test Page
 * Comprehensive testing of database schema and operations
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Database, Play, Loader2, FileText } from 'lucide-react';
import { runCompleteVerification } from '@/utils/database-verification';
import { checkSchemaStatus } from '@/utils/apply-schema';
import AuthTest from '@/components/auth/AuthTest';
import IdeaVaultTest from '@/components/tests/IdeaVaultTest';
import IdeaForgeTest from '@/components/tests/IdeaForgeTest';
import MVPStudioTest from '@/components/tests/MVPStudioTest';
import DocsDecksTest from '@/components/tests/DocsDecksTest';
import ComprehensiveFeatureTest from '@/components/tests/ComprehensiveFeatureTest';
import TestingSummary from '@/components/tests/TestingSummary';

interface TestResult {
  schema: {
    success: boolean;
    tables: Array<{
      table_name: string;
      exists: boolean;
      row_count?: number;
      has_rls?: boolean;
      error?: string;
    }>;
    errors: string[];
    summary: {
      total_tables: number;
      existing_tables: number;
      missing_tables: number;
      tables_with_rls: number;
    };
  };
  operations: {
    success: boolean;
    operations: Array<{
      name: string;
      success: boolean;
      error?: string;
    }>;
  };
  overall_success: boolean;
}

const DatabaseTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult | null>(null);
  const [schemaStatus, setSchemaStatus] = useState<{
    isApplied: boolean;
    missingTables: string[];
    error?: string;
  } | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const checkSchema = async () => {
    try {
      const status = await checkSchemaStatus();
      setSchemaStatus(status);
      return status;
    } catch (error) {
      console.error('Schema check failed:', error);
      setSchemaStatus({
        isApplied: false,
        missingTables: [],
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      });
      return null;
    }
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      // First check schema status
      const status = await checkSchema();

      if (!status?.isApplied) {
        setShowInstructions(true);
        setIsRunning(false);
        return;
      }

      const testResults = await runCompleteVerification();
      setResults(testResults);
    } catch (error) {
      console.error('Test execution failed:', error);
      setResults({
        schema: {
          success: false,
          tables: [],
          errors: [`Test execution failed: ${error instanceof Error ? (error as Error).message : 'Unknown error'}`],
          summary: {
            total_tables: 0,
            existing_tables: 0,
            missing_tables: 0,
            tables_with_rls: 0
          }
        },
        operations: {
          success: false,
          operations: []
        },
        overall_success: false
      });
    } finally {
      setIsRunning(false);
    }
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Database Verification
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive testing of Supabase database schema and operations
          </p>
        </div>
        <Button
          onClick={runTests}
          disabled={isRunning}
          size="lg"
          className="flex items-center gap-2"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </Button>
      </div>

      {/* Schema Status */}
      {schemaStatus && !schemaStatus.isApplied && (
        <Alert className="border-yellow-500">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Database schema not fully applied. Missing tables: {schemaStatus.missingTables.join(', ')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {showInstructions ? 'Hide' : 'Show'} Instructions
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Schema Application Instructions */}
      {showInstructions && (
        <Card>
          <CardHeader>
            <CardTitle>Database Schema Application Instructions</CardTitle>
            <CardDescription>
              Follow these steps to apply the database schema to your Supabase project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Method 1: Supabase Dashboard</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to your Supabase project dashboard</li>
                  <li>Navigate to the SQL Editor</li>
                  <li>Open the file: <code className="bg-background px-2 py-1 rounded">database/schemas/clean_schema.sql</code></li>
                  <li>Copy the entire content</li>
                  <li>Paste it into the Supabase SQL Editor</li>
                  <li>Click "Run" to execute the schema</li>
                  <li>Verify all tables are created successfully</li>
                </ol>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Method 2: Supabase CLI</h4>
                <div className="space-y-2 text-sm">
                  <p>If you have Supabase CLI installed:</p>
                  <code className="block bg-background p-2 rounded">supabase db reset</code>
                  <p>Or:</p>
                  <code className="block bg-background p-2 rounded">supabase db push</code>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  After applying the schema, refresh this page and run the tests again.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {results && (
        <div className="space-y-6">
          {/* Overall Status */}
          <Alert className={results.overall_success ? "border-green-500" : "border-red-500"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Overall Status: {results.overall_success ? "All tests passed!" : "Some tests failed"}
              </span>
              {getStatusBadge(results.overall_success)}
            </AlertDescription>
          </Alert>

          {/* Schema Verification Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Schema Verification</span>
                {getStatusBadge(results.schema.success)}
              </CardTitle>
              <CardDescription>
                Verification of database tables and structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{results.schema.summary.total_tables}</div>
                  <div className="text-sm text-muted-foreground">Total Tables</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{results.schema.summary.existing_tables}</div>
                  <div className="text-sm text-muted-foreground">Existing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{results.schema.summary.missing_tables}</div>
                  <div className="text-sm text-muted-foreground">Missing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.schema.summary.tables_with_rls}</div>
                  <div className="text-sm text-muted-foreground">With RLS</div>
                </div>
              </div>

              {results.schema.errors.length > 0 && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-2">Errors found:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {results.schema.errors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.schema.tables.map((table) => (
                  <div key={table.table_name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(table.exists)}
                      <span className="font-medium">{table.table_name}</span>
                      {table.has_rls && (
                        <Badge variant="outline" className="text-xs">RLS</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {table.row_count !== undefined && (
                        <span>{table.row_count} rows</span>
                      )}
                      {table.error && (
                        <span className="text-red-500">{table.error}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Operations Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Operations Testing</span>
                {getStatusBadge(results.operations.success)}
              </CardTitle>
              <CardDescription>
                Testing of basic database operations and connectivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.operations.operations.map((operation, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(operation.success)}
                      <span className="font-medium">{operation.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {operation.error && (
                        <span className="text-sm text-red-500">{operation.error}</span>
                      )}
                      {getStatusBadge(operation.success)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Authentication Test */}
          <AuthTest />

          {/* Idea Vault Test */}
          <IdeaVaultTest />

          {/* IdeaForge Test */}
          <IdeaForgeTest />

          {/* MVP Studio Test */}
          <MVPStudioTest />

          {/* Docs & Decks Test */}
          <DocsDecksTest />

          {/* Comprehensive Feature Test */}
          <ComprehensiveFeatureTest />

          {/* Testing Summary */}
          <TestingSummary />
        </div>
      )}
    </div>
  );
};

export default DatabaseTest;