// Usage Stats View - Component for displaying AI usage statistics
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  Zap, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { UserAIPreferences, ConnectionStatus } from '@/types/aiProvider';

interface UsageStatsViewProps {
  preferences: UserAIPreferences | null;
  usageStats?: Record<string, unknown>;
}

export const UsageStatsView: React.FC<UsageStatsViewProps> = ({
  preferences,
  usageStats
}) => {
  if (!preferences) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No AI provider configured. Set up your provider first to see usage statistics.
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusIcon = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'quota_exceeded':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Connection Error';
      case 'quota_exceeded':
        return 'Quota Exceeded';
      default:
        return 'Not Tested';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const estimateCost = (tokens: number, provider: string) => {
    // Rough cost estimates per 1K tokens (input + output average)
    const costPer1K: Record<string, number> = {
      'openai': 0.045, // GPT-4 average
      'gemini': 0.0004, // Gemini 2.0 Flash
      'deepseek': 0.00021, // DeepSeek average
      'claude': 0.045, // Claude 3 Sonnet average
      'mistral': 0.0055, // Mistral Large
      'custom': 0 // Unknown
    };

    const rate = costPer1K[provider] || 0;
    const cost = (tokens / 1000) * rate;
    
    if (cost === 0) return 'Unknown';
    if (cost < 0.01) return '<$0.01';
    return `$${cost.toFixed(2)}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(preferences.connectionStatus)}
              <div>
                <p className="font-medium">{getStatusText(preferences.connectionStatus)}</p>
                <p className="text-sm text-gray-500">
                  Provider: {preferences.provider.charAt(0).toUpperCase() + preferences.provider.slice(1)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last Tested</p>
              <p className="font-medium">{formatDate(preferences.lastTestAt)}</p>
            </div>
          </div>
          
          {preferences.lastError && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Last Error:</strong> {preferences.lastError}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total Requests</p>
                <p className="text-2xl font-bold">{formatNumber(preferences.totalRequests)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Tokens Used</p>
                <p className="text-2xl font-bold">{formatNumber(preferences.totalTokensUsed)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Est. Cost</p>
                <p className="text-2xl font-bold">
                  {estimateCost(preferences.totalTokensUsed, preferences.provider)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Last Used</p>
                <p className="text-lg font-bold">{formatDate(preferences.lastUsedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Details */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Configuration</CardTitle>
          <CardDescription>Current AI provider settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Provider</p>
              <p className="text-lg capitalize">{preferences.provider}</p>
            </div>
            
            {preferences.modelName && (
              <div>
                <p className="text-sm font-medium text-gray-700">Model</p>
                <p className="text-lg">{preferences.modelName}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium text-gray-700">Temperature</p>
              <p className="text-lg">{preferences.temperature}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700">Max Tokens</p>
              <p className="text-lg">{preferences.maxTokens.toLocaleString()}</p>
            </div>
            
            {preferences.customEndpoint && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-700">Custom Endpoint</p>
                <p className="text-lg font-mono text-sm bg-gray-100 p-2 rounded">
                  {preferences.customEndpoint}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Usage Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">💡</Badge>
              <p><strong>Optimize Costs:</strong> Use lower temperature values for more predictable responses and fewer tokens.</p>
            </div>
            
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">⚡</Badge>
              <p><strong>Improve Speed:</strong> Choose faster models like GPT-3.5 Turbo or Gemini Flash for simple tasks.</p>
            </div>
            
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">🎯</Badge>
              <p><strong>Better Results:</strong> Use specific, clear prompts to get more accurate responses with fewer retries.</p>
            </div>
            
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">📊</Badge>
              <p><strong>Monitor Usage:</strong> Check this dashboard regularly to track your API usage and costs.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
