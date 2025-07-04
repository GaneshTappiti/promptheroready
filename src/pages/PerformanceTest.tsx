import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PerformanceTester, PerformanceTestResult } from '@/utils/performanceTest';
import { QueryOptimizationService } from '@/services/queryOptimizationService';
import {
  Gauge,
  Zap,
  Database,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Activity,
  Cpu,
  HardDrive,
  Network,
  RefreshCw
} from 'lucide-react';

const PerformanceTest: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [testResults, setTestResults] = useState<PerformanceTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');
  const [testSummary, setTestSummary] = useState<any>(null);
  const [performanceStats, setPerformanceStats] = useState<any>(null);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);

  useEffect(() => {
    loadPerformanceStats();
    loadSystemMetrics();
  }, []);

  const loadPerformanceStats = () => {
    const stats = QueryOptimizationService.getPerformanceStats();
    setPerformanceStats(stats);
  };

  const loadSystemMetrics = () => {
    const metrics = {
      memory: getMemoryInfo(),
      connection: getConnectionInfo(),
      cache: getCacheInfo(),
      timing: getTimingInfo()
    };
    setSystemMetrics(metrics);
  };

  const getMemoryInfo = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return { used: 0, total: 0, limit: 0 };
  };

  const getConnectionInfo = () => {
    return {
      type: (navigator as any).connection?.effectiveType || 'unknown',
      downlink: (navigator as any).connection?.downlink || 0,
      rtt: (navigator as any).connection?.rtt || 0
    };
  };

  const getCacheInfo = () => {
    try {
      const cacheSize = Object.keys(sessionStorage).length + Object.keys(localStorage).length;
      return {
        size: cacheSize,
        sessionStorage: Object.keys(sessionStorage).length,
        localStorage: Object.keys(localStorage).length
      };
    } catch (error) {
      return { size: 0, sessionStorage: 0, localStorage: 0 };
    }
  };

  const getTimingInfo = () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      return {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.fetchStart),
        firstPaint: Math.round(navigation.responseStart - navigation.fetchStart)
      };
    }
    return { domContentLoaded: 0, loadComplete: 0, firstPaint: 0 };
  };

  const runPerformanceTests = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to run performance tests",
        variant: "destructive"
      });
      return;
    }

    setIsRunningTests(true);
    setTestProgress(0);
    setTestResults([]);
    setTestSummary(null);

    try {
      const tester = new PerformanceTester(user.id);
      
      const testSteps = [
        'Initializing performance testing...',
        'Testing large dataset loading...',
        'Testing pagination performance...',
        'Testing caching efficiency...',
        'Testing concurrent operations...',
        'Testing real-time performance...',
        'Testing memory usage patterns...',
        'Generating performance report...'
      ];

      for (let i = 0; i < testSteps.length; i++) {
        setCurrentTest(testSteps[i]);
        setTestProgress((i / testSteps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const { results, summary } = await tester.runAllTests();
      setTestResults(results);
      setTestSummary(summary);
      setTestProgress(100);
      setCurrentTest('Performance tests completed!');

      // Refresh stats after tests
      loadPerformanceStats();
      loadSystemMetrics();

      toast({
        title: "Performance Tests Complete",
        description: `${summary.passedTests}/${summary.totalTests} tests passed (Score: ${summary.overallScore}/100)`,
        variant: summary.overallScore > 70 ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Performance test execution failed:', error);
      toast({
        title: "Test Execution Failed",
        description: error instanceof Error ? (error as Error).message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500">Good</Badge>;
    return <Badge variant="destructive">Needs Improvement</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Gauge className="h-8 w-8 text-blue-400" />
            Performance Testing & Optimization
          </h1>
          <p className="text-gray-400">Test application performance with larger datasets and identify bottlenecks</p>
        </div>

        {/* System Metrics Overview */}
        {systemMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Memory Usage</p>
                    <p className="text-lg font-bold text-white">
                      {systemMetrics.memory.used}MB / {systemMetrics.memory.total}MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Connection</p>
                    <p className="text-lg font-bold text-white">
                      {systemMetrics.connection.type} ({systemMetrics.connection.downlink}Mbps)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Cache Size</p>
                    <p className="text-lg font-bold text-white">{systemMetrics.cache.size} items</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Load Time</p>
                    <p className="text-lg font-bold text-white">{systemMetrics.timing.loadComplete}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Performance Test Controls */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance Test Suite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={runPerformanceTests} 
                disabled={isRunningTests || !user}
                className="flex items-center gap-2"
              >
                {isRunningTests ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Gauge className="h-4 w-4" />
                )}
                {isRunningTests ? 'Running Tests...' : 'Run Performance Tests'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => { loadPerformanceStats(); loadSystemMetrics(); }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Metrics
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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-700/30 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{testSummary.totalTests}</p>
                  <p className="text-gray-400 text-sm">Total Tests</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{testSummary.passedTests}</p>
                  <p className="text-gray-400 text-sm">Passed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{testSummary.failedTests}</p>
                  <p className="text-gray-400 text-sm">Failed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{testSummary.averageDuration}ms</p>
                  <p className="text-gray-400 text-sm">Avg Duration</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${getScoreColor(testSummary.overallScore)}`}>
                    {testSummary.overallScore}/100
                  </p>
                  <p className="text-gray-400 text-sm">Performance Score</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Tabs defaultValue="results" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="results">Test Results</TabsTrigger>
            <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
            <TabsTrigger value="optimization">Optimization Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            {testResults.length > 0 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Detailed Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {testResults.map((result, index) => (
                      <div key={index} className="p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {result.success ? (
                              <CheckCircle className="h-5 w-5 text-green-400" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-400" />
                            )}
                            <h3 className="text-white font-semibold">{result.testName}</h3>
                          </div>
                          <Badge variant={result.success ? "default" : "destructive"}>
                            {result.success ? "PASS" : "FAIL"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Duration</p>
                            <p className="text-white">{Math.round(result.duration)}ms</p>
                          </div>
                          {result.metrics.recordsProcessed && (
                            <div>
                              <p className="text-gray-400">Records</p>
                              <p className="text-white">{result.metrics.recordsProcessed}</p>
                            </div>
                          )}
                          {result.metrics.throughput && (
                            <div>
                              <p className="text-gray-400">Throughput</p>
                              <p className="text-white">{Math.round(result.metrics.throughput)}/sec</p>
                            </div>
                          )}
                          {result.memoryUsage && (
                            <div>
                              <p className="text-gray-400">Memory Δ</p>
                              <p className="text-white">{result.memoryUsage.delta.toFixed(1)}MB</p>
                            </div>
                          )}
                        </div>

                        {result.recommendations && result.recommendations.length > 0 && (
                          <div className="mt-3">
                            <p className="text-gray-400 text-sm mb-1">Recommendations:</p>
                            <ul className="text-sm text-gray-300 space-y-1">
                              {result.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <TrendingUp className="h-3 w-3 mt-1 text-blue-400 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {result.error && (
                          <div className="mt-3 p-2 bg-red-900/20 border border-red-500/30 rounded">
                            <p className="text-red-400 text-sm">{result.error}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            {performanceStats && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Query Performance Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-400">{performanceStats.totalQueries}</p>
                      <p className="text-gray-400">Total Queries</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-400">{performanceStats.cacheHitRate.toFixed(1)}%</p>
                      <p className="text-gray-400">Cache Hit Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-yellow-400">{Math.round(performanceStats.averageExecutionTime)}ms</p>
                      <p className="text-gray-400">Avg Execution Time</p>
                    </div>
                  </div>

                  {performanceStats.slowestQueries.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-white font-semibold mb-3">Slowest Queries</h4>
                      <div className="space-y-2">
                        {performanceStats.slowestQueries.slice(0, 5).map((query: unknown, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                            <span className="text-gray-300 font-mono text-sm">{query.queryId}</span>
                            <span className="text-yellow-400">{Math.round(query.executionTime)}ms</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="optimization" className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <h4 className="text-blue-400 font-semibold mb-2">Database Optimization</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Implement cursor-based pagination for large datasets</li>
                      <li>• Use database indexes on frequently queried columns</li>
                      <li>• Consider query result caching for static data</li>
                      <li>• Optimize JOIN operations and reduce N+1 queries</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <h4 className="text-green-400 font-semibold mb-2">Frontend Optimization</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Implement virtual scrolling for large lists</li>
                      <li>• Use React.memo for expensive components</li>
                      <li>• Lazy load images and non-critical components</li>
                      <li>• Optimize bundle size with code splitting</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                    <h4 className="text-purple-400 font-semibold mb-2">Caching Strategy</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Implement service worker for offline caching</li>
                      <li>• Use browser storage for user preferences</li>
                      <li>• Cache API responses with appropriate TTL</li>
                      <li>• Implement stale-while-revalidate pattern</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <h4 className="text-yellow-400 font-semibold mb-2">Real-time Optimization</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Implement connection pooling for WebSockets</li>
                      <li>• Use message batching for high-frequency updates</li>
                      <li>• Add rate limiting to prevent spam</li>
                      <li>• Optimize subscription filters to reduce data transfer</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PerformanceTest;
