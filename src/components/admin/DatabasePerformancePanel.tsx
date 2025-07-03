import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap
} from 'lucide-react';
import { DatabasePerformanceMonitor } from '@/utils/database-performance';

interface PerformanceData {
  slowQueries: Array<{
    query: string;
    avgTime: string;
    calls: number;
  }>;
  recommendations: Array<{
    query: string;
    issue: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  summary: {
    totalSlowQueries: number;
    highPriorityIssues: number;
    avgQueryTime: number;
  };
  connectionStats: {
    active: number;
    idle: number;
    total: number;
  };
}

const DatabasePerformancePanel: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const report = await DatabasePerformanceMonitor.generatePerformanceReport();
      const connectionStats = await DatabasePerformanceMonitor.getConnectionStats();
      
      setPerformanceData({
        slowQueries: report.metrics.slowQueries,
        recommendations: report.recommendations,
        summary: report.summary,
        connectionStats
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchPerformanceData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthStatus = () => {
    if (!performanceData) return { status: 'unknown', color: 'gray' };
    
    const { highPriorityIssues, avgQueryTime } = performanceData.summary;
    
    if (highPriorityIssues > 3 || avgQueryTime > 3) {
      return { status: 'critical', color: 'red', icon: AlertTriangle };
    } else if (highPriorityIssues > 0 || avgQueryTime > 1) {
      return { status: 'warning', color: 'yellow', icon: Clock };
    } else {
      return { status: 'healthy', color: 'green', icon: CheckCircle };
    }
  };

  const health = getHealthStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Database Performance</h2>
          <p className="text-gray-400">Monitor and optimize database query performance</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-sm text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={fetchPerformanceData}
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="workspace-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">System Health</p>
                <div className="flex items-center gap-2 mt-1">
                  <health.icon className={`h-5 w-5 text-${health.color}-400`} />
                  <span className="text-white font-medium capitalize">{health.status}</span>
                </div>
              </div>
              <Database className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="workspace-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Slow Queries</p>
                <p className="text-2xl font-bold text-white">
                  {performanceData?.summary.totalSlowQueries || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="workspace-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">High Priority Issues</p>
                <p className="text-2xl font-bold text-white">
                  {performanceData?.summary.highPriorityIssues || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="workspace-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Query Time</p>
                <p className="text-2xl font-bold text-white">
                  {performanceData?.summary.avgQueryTime.toFixed(2) || '0.00'}s
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Statistics */}
      {performanceData?.connectionStats && (
        <Card className="workspace-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Database Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  {performanceData.connectionStats.active}
                </p>
                <p className="text-sm text-gray-400">Active</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {performanceData.connectionStats.idle}
                </p>
                <p className="text-sm text-gray-400">Idle</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {performanceData.connectionStats.total}
                </p>
                <p className="text-sm text-gray-400">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Recommendations */}
      {performanceData?.recommendations && performanceData.recommendations.length > 0 && (
        <Card className="workspace-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {performanceData.recommendations.slice(0, 5).map((rec, index) => (
              <Alert key={index} className="border-yellow-600/20 bg-yellow-600/10">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${getPriorityColor(rec.priority)} text-white text-xs`}>
                          {rec.priority.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{rec.issue}</span>
                      </div>
                      <p className="text-sm">{rec.recommendation}</p>
                      <p className="text-xs text-yellow-300 mt-1 font-mono">
                        {rec.query}
                      </p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Slow Queries List */}
      {performanceData?.slowQueries && performanceData.slowQueries.length > 0 && (
        <Card className="workspace-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Slow Queries ({performanceData.slowQueries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performanceData.slowQueries.slice(0, 10).map((query, index) => (
                <div key={index} className="border border-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-red-400 border-red-400">
                      {query.avgTime} avg
                    </Badge>
                    <span className="text-sm text-gray-400">{query.calls} calls</span>
                  </div>
                  <code className="text-xs text-gray-300 block bg-black/20 p-2 rounded">
                    {query.query.length > 200 ? query.query.substring(0, 200) + '...' : query.query}
                  </code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!loading && !performanceData && (
        <Card className="workspace-card">
          <CardContent className="text-center py-8">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Performance Data</h3>
            <p className="text-gray-400 mb-4">
              Performance monitoring requires pg_stat_statements extension to be enabled.
            </p>
            <Button onClick={fetchPerformanceData} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DatabasePerformancePanel;
