import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Play, RefreshCw } from 'lucide-react';
import { supabaseTestSuite, TestResult } from '@/utils/supabaseTest';

const SupabaseTestPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    try {
      const testResults = await supabaseTestSuite.runAllTests();
      setResults(testResults);
      setLastRun(new Date());
    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? "PASS" : "FAIL"}
      </Badge>
    );
  };

  const failedTests = results.filter(r => !r.success);
  const successfulTests = results.filter(r => r.success);

  return (
    <Card className="workspace-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Supabase Connection Test</span>
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            size="sm"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Tests
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastRun && (
          <div className="text-sm text-muted-foreground">
            Last run: {lastRun.toLocaleTimeString()}
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {successfulTests.length}
                </div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {failedTests.length}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {results.length}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </CardContent>
            </Card>
          </div>
        )}

        {failedTests.length > 0 && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {failedTests.length} test(s) failed. Check the details below and ensure your Supabase setup is correct.
            </AlertDescription>
          </Alert>
        )}

        {results.length > 0 && failedTests.length === 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              All tests passed! Your Supabase setup is working correctly.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {results.map((result, index) => (
            <Card key={index} className={`border-l-4 ${
              result.success ? 'border-l-green-500' : 'border-l-red-500'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.success)}
                    <span className="font-medium">{result.test}</span>
                  </div>
                  {getStatusBadge(result.success)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {result.message}
                </p>
                {result.data && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      View Details
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {results.length === 0 && !isRunning && (
          <div className="text-center py-8 text-muted-foreground">
            Click "Run Tests" to verify your Supabase setup
          </div>
        )}

        {failedTests.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Troubleshooting Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>• Check your environment variables in .env file</div>
              <div>• Ensure the messages table exists in your Supabase database</div>
              <div>• Verify that Realtime is enabled for the messages table</div>
              <div>• Check your Supabase project URL and API key</div>
              <div>• Make sure Row Level Security policies are set correctly</div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default SupabaseTestPanel;
