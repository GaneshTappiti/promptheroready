import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RealtimeTester, RealtimeTestResult } from '@/utils/realtimeTest';
import { supabase } from '@/lib/supabase';
import {
  Wifi,
  MessageSquare,
  Users,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  RefreshCw,
  AlertTriangle,
  Zap,
  Eye,
  Send,
  UserCheck
} from 'lucide-react';

const RealtimeTest: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [testResults, setTestResults] = useState<Map<string, RealtimeTestResult>>(new Map());
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');
  const [testSummary, setTestSummary] = useState<any>(null);
  const [tester, setTester] = useState<RealtimeTester | null>(null);
  
  // Live testing states
  const [liveMessage, setLiveMessage] = useState('');
  const [liveMessages, setLiveMessages] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const newTester = new RealtimeTester(user.id, `test-team-${user.id}`);
      setTester(newTester);
    }

    return () => {
      if (tester) {
        tester.cleanup();
      }
    };
  }, [user]);

  const runComprehensiveTests = async () => {
    if (!user || !tester) {
      toast({
        title: "Authentication Required",
        description: "Please log in to run real-time tests",
        variant: "destructive"
      });
      return;
    }

    setIsRunningTests(true);
    setTestProgress(0);
    setTestResults(new Map());
    setTestSummary(null);

    try {
      const progressSteps = [
        'Initializing WebSocket connection...',
        'Testing basic connectivity...',
        'Testing global messaging...',
        'Testing team messaging...',
        'Testing presence tracking...',
        'Testing typing indicators...',
        'Testing concurrent connections...',
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
        title: "Real-time Tests Complete",
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

  const startLiveTest = async () => {
    if (!user) return;

    try {
      // Test live connection
      const channel = supabase.channel('live_test_connection');
      
      channel.subscribe((status) => {
        setConnectionStatus(status);
        setIsConnected(status === 'SUBSCRIBED');
      });

      // Subscribe to live messages
      const messageChannel = supabase
        .channel('live_messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        }, (payload) => {
          setLiveMessages(prev => [payload.new, ...prev.slice(0, 9)]);
        })
        .subscribe();

      toast({
        title: "Live Test Started",
        description: "Connected to real-time message stream",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Live Test Failed",
        description: "Could not connect to real-time stream",
        variant: "destructive"
      });
    }
  };

  const sendLiveMessage = async () => {
    if (!user || !liveMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          text: liveMessage,
          username: user.email?.split('@')[0] || 'Test User',
          country: 'Test',
          is_authenticated: true
        }]);

      if (error) throw error;

      setLiveMessage('');
      toast({
        title: "Message Sent",
        description: "Message sent via real-time system",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Could not send message",
        variant: "destructive"
      });
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
            <Wifi className="h-8 w-8 text-blue-400" />
            Real-time Features Testing
          </h1>
          <p className="text-gray-400">Test WebSocket connections and team collaboration features</p>
        </div>

        {/* Connection Status */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-white">{connectionStatus}</span>
              </div>
              <Button onClick={startLiveTest} size="sm" variant="outline">
                <Zap className="h-4 w-4 mr-2" />
                Test Live Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comprehensive Tests */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comprehensive Real-time Tests
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
                {isRunningTests ? 'Running Tests...' : 'Run All Real-time Tests'}
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

        {/* Live Message Test */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Send className="h-5 w-5" />
              Live Message Testing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={liveMessage}
                onChange={(e) => setLiveMessage(e.target.value)}
                placeholder="Type a test message..."
                className="bg-gray-700/50 border-gray-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && sendLiveMessage()}
              />
              <Button 
                onClick={sendLiveMessage} 
                disabled={!liveMessage.trim() || !user}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {liveMessages.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <Label className="text-gray-300">Recent Messages (Real-time)</Label>
                {liveMessages.map((msg, index) => (
                  <div key={index} className="p-2 bg-gray-700/30 rounded text-sm">
                    <span className="text-blue-400">{msg.username}:</span>
                    <span className="text-white ml-2">{msg.text}</span>
                  </div>
                ))}
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

        {/* Real-time Features Overview */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Real-time Features in Application</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                  <h3 className="text-white font-semibold">Global Chat</h3>
                </div>
                <p className="text-gray-400 text-sm">Real-time messaging for all users</p>
              </div>
              
              <div className="p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-green-400" />
                  <h3 className="text-white font-semibold">Team Chat</h3>
                </div>
                <p className="text-gray-400 text-sm">Team-specific messaging and collaboration</p>
              </div>
              
              <div className="p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-white font-semibold">Presence Tracking</h3>
                </div>
                <p className="text-gray-400 text-sm">See who's online and active</p>
              </div>
              
              <div className="p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-5 w-5 text-purple-400" />
                  <h3 className="text-white font-semibold">Typing Indicators</h3>
                </div>
                <p className="text-gray-400 text-sm">Real-time typing status updates</p>
              </div>
              
              <div className="p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-red-400" />
                  <h3 className="text-white font-semibold">Live Updates</h3>
                </div>
                <p className="text-gray-400 text-sm">Real-time task and project updates</p>
              </div>
              
              <div className="p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-white font-semibold">WebSocket Infrastructure</h3>
                </div>
                <p className="text-gray-400 text-sm">Supabase real-time subscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealtimeTest;
