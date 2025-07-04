/**
 * API Key Tester Component
 * User-friendly interface for testing API key functionality
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  RefreshCw,
  AlertTriangle,
  Info,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  APIKeyValidationTester, 
  APIKeyTestResult, 
  ComprehensiveTestResult 
} from '@/utils/apiKeyValidationTest';

interface APIKeyTesterProps {
  className?: string;
}

export const APIKeyTester: React.FC<APIKeyTesterProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ComprehensiveTestResult | null>(null);
  const [progress, setProgress] = useState(0);

  const runTest = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to test your API keys",
        variant: "destructive"
      });
      return;
    }

    setTesting(true);
    setProgress(0);
    setTestResult(null);

    try {
      const tester = new APIKeyValidationTester(user.id);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await tester.testAllConfiguredKeys();
      
      clearInterval(progressInterval);
      setProgress(100);
      setTestResult(result);

      if (result.overall) {
        toast({
          title: "API Key Test Passed! ✅",
          description: "Your API key is working correctly",
        });
      } else {
        toast({
          title: "API Key Test Failed ❌",
          description: "There are issues with your API key configuration",
          variant: "destructive"
        });
      }

    } catch (error) {
      toast({
        title: "Test Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    if (success) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getDetailIcon = (status: boolean) => {
    return status ? '✅' : '❌';
  };

  return (
    <Card className={`bg-black/40 backdrop-blur-sm border-white/10 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Zap className="w-5 h-5" />
          API Key Validation Test
        </CardTitle>
        <CardDescription className="text-gray-400">
          Test your API key configuration to ensure everything is working properly
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Test Button */}
        <div className="flex gap-2">
          <Button 
            onClick={runTest} 
            disabled={testing || !user}
            className="flex items-center gap-2"
          >
            {testing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run API Key Test
              </>
            )}
          </Button>
          
          {testResult && (
            <Button 
              variant="outline" 
              onClick={runTest}
              disabled={testing}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retest
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        {testing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              Testing API key functionality...
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Test Results */}
        {testResult && (
          <div className="space-y-4">
            {/* Overall Status */}
            <Alert className={testResult.overall ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
              <div className="flex items-center gap-2">
                {getStatusIcon(testResult.overall)}
                <AlertDescription className={testResult.overall ? 'text-green-800' : 'text-red-800'}>
                  <strong>
                    {testResult.overall ? 'All Tests Passed!' : 'Tests Failed'}
                  </strong>
                  <br />
                  {testResult.summary.passed} of {testResult.summary.tested} tests passed
                </AlertDescription>
              </div>
            </Alert>

            {/* Detailed Results */}
            {testResult.results.map((result, index) => (
              <Card key={index} className="bg-gray-50 border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {getStatusIcon(result.success)}
                      {result.provider.toUpperCase()} Provider
                    </CardTitle>
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.success ? 'PASS' : 'FAIL'}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {result.message}
                  </CardDescription>
                </CardHeader>
                
                {result.details && (
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span>{getDetailIcon(result.details.keyFormat)}</span>
                        <span>Key Format</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{getDetailIcon(result.details.storage)}</span>
                        <span>Storage</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{getDetailIcon(result.details.encryption)}</span>
                        <span>Encryption</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{getDetailIcon(result.details.connection)}</span>
                        <span>Connection</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{getDetailIcon(result.details.response)}</span>
                        <span>AI Response</span>
                      </div>
                      {result.responseTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{result.responseTime}ms</span>
                        </div>
                      )}
                    </div>
                    
                    {result.error && (
                      <Alert className="mt-2 bg-red-50 border-red-200">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <AlertDescription className="text-red-800 text-xs">
                          <strong>Error:</strong> {result.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}

            {/* Recommendations */}
            {!testResult.overall && (
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Recommendations:</strong>
                  <ul className="list-disc list-inside mt-1 text-sm">
                    <li>Check that your API key is correctly formatted</li>
                    <li>Verify your API key has sufficient credits/quota</li>
                    <li>Ensure your API key has the necessary permissions</li>
                    <li>Try regenerating your API key from the provider's dashboard</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* No User Warning */}
        {!user && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Please log in to test your API key configuration.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
