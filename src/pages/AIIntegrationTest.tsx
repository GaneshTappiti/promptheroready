import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AIIntegrationTester, AITestResult } from '@/utils/aiIntegrationTest';
import { aiProviderService } from '@/services/aiProviderService';
import { AIProvider, AIRequest } from '@/types/aiProvider';
import {
  Brain,
  TestTube,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Settings,
  Play,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  MessageSquare,
  Presentation,
  Lightbulb
} from 'lucide-react';

const AIIntegrationTest: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [testResults, setTestResults] = useState<Map<string, AITestResult>>(new Map());
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');
  const [testSummary, setTestSummary] = useState<any>(null);
  
  // Manual test states
  const [manualPrompt, setManualPrompt] = useState('Generate a creative startup idea for a mobile app');
  const [manualResponse, setManualResponse] = useState('');
  const [isManualTesting, setIsManualTesting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('gemini');

  const runComprehensiveTests = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to run AI integration tests",
        variant: "destructive"
      });
      return;
    }

    setIsRunningTests(true);
    setTestProgress(0);
    setTestResults(new Map());
    setTestSummary(null);

    try {
      const tester = new AIIntegrationTester(user.id);
      
      // Simulate progress updates
      const progressSteps = [
        'Initializing AI providers...',
        'Testing provider connections...',
        'Testing direct AI calls...',
        'Testing startup idea analysis...',
        'Testing presentation generation...',
        'Testing provider capabilities...',
        'Generating test report...'
      ];

      for (let i = 0; i < progressSteps.length; i++) {
        setCurrentTest(progressSteps[i]);
        setTestProgress((i / progressSteps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const { results, summary } = await tester.runAllTests();
      setTestResults(results);
      setTestSummary(summary);
      setTestProgress(100);
      setCurrentTest('Tests completed!');

      toast({
        title: "AI Integration Tests Complete",
        description: `${summary.passed}/${summary.total} tests passed (${summary.successRate})`,
        variant: summary.failed === 0 ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Test execution failed:', error);
      toast({
        title: "Test Execution Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const runManualTest = async () => {
    if (!user || !manualPrompt.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a prompt to test",
        variant: "destructive"
      });
      return;
    }

    setIsManualTesting(true);
    setManualResponse('');

    try {
      const request: AIRequest = {
        prompt: manualPrompt,
        systemPrompt: "You are a helpful AI assistant. Provide clear and concise responses.",
        temperature: 0.7,
        maxTokens: 500
      };

      const response = await aiProviderService.generateResponse(user.id, request);
      setManualResponse(response.content);

      toast({
        title: "AI Response Generated",
        description: `Response generated using ${response.provider} (${response.tokensUsed.total} tokens)`,
        variant: "default"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setManualResponse(`Error: ${errorMessage}`);
      
      toast({
        title: "AI Request Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsManualTesting(false);
    }
  };

  const getTestIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-400" />
    ) : (
      <XCircle className="h-4 w-4 text-red-400" />
    );
  };

  const getTestBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? "PASS" : "FAIL"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Brain className="h-8 w-8 text-blue-400" />
            AI Integration Testing
          </h1>
          <p className="text-gray-400">Test all AI-powered features and provider integrations</p>
        </div>

        {/* Test Controls */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Comprehensive AI Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={runComprehensiveTests} 
                disabled={isRunningTests || !user}
                className="flex items-center gap-2"
              >
                {isRunningTests ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isRunningTests ? 'Running Tests...' : 'Run All AI Tests'}
              </Button>
              
              {!user && (
                <Badge variant="destructive">Login Required</Badge>
              )}
            </div>

            {isRunningTests && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{currentTest}</span>
                  <span className="text-sm text-gray-400">{Math.round(testProgress)}%</span>
                </div>
                <Progress value={testProgress} className="w-full" />
              </div>
            )}

            {testSummary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-700/30 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{testSummary.total}</p>
                  <p className="text-gray-400 text-sm">Total Tests</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{testSummary.passed}</p>
                  <p className="text-gray-400 text-sm">Passed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{testSummary.failed}</p>
                  <p className="text-gray-400 text-sm">Failed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{testSummary.successRate}</p>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual AI Test */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Manual AI Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-gray-300">Test Prompt</Label>
              <Textarea
                id="prompt"
                value={manualPrompt}
                onChange={(e) => setManualPrompt(e.target.value)}
                placeholder="Enter your AI prompt here..."
                className="bg-gray-700/50 border-gray-600 text-white"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-4">
              <Button 
                onClick={runManualTest} 
                disabled={isManualTesting || !user || !manualPrompt.trim()}
                className="flex items-center gap-2"
              >
                {isManualTesting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {isManualTesting ? 'Generating...' : 'Test AI Response'}
              </Button>
            </div>

            {manualResponse && (
              <div className="space-y-2">
                <Label className="text-gray-300">AI Response</Label>
                <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                  <p className="text-white whitespace-pre-wrap">{manualResponse}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.size > 0 && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from(testResults.entries()).map(([testName, result]) => (
                  <div key={testName} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTestIcon(result.success)}
                      <div>
                        <p className="text-white font-medium">{testName}</p>
                        <p className="text-gray-400 text-sm">{result.message}</p>
                        {result.error && (
                          <p className="text-red-400 text-xs mt-1">Error: {result.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-gray-400 text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {result.duration}ms
                        </p>
                      </div>
                      {getTestBadge(result.success)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Features Overview */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">AI Features in Application</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-white font-semibold">Idea Analysis</h3>
                </div>
                <p className="text-gray-400 text-sm">AI-powered startup idea validation and analysis</p>
              </div>
              
              <div className="p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-5 w-5 text-blue-400" />
                  <h3 className="text-white font-semibold">MVP Planning</h3>
                </div>
                <p className="text-gray-400 text-sm">Automated MVP roadmap and feature generation</p>
              </div>
              
              <div className="p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Presentation className="h-5 w-5 text-green-400" />
                  <h3 className="text-white font-semibold">Presentations</h3>
                </div>
                <p className="text-gray-400 text-sm">AI-generated pitch decks and presentations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIIntegrationTest;
