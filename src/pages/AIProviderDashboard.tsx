// AI Provider Dashboard - Standalone page for monitoring AI usage and status
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Settings, 
  BarChart3, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  TrendingUp,
  Activity,
  DollarSign,
  Zap,
  Clock,
  Menu
} from 'lucide-react';
import { UserAIPreferences } from '@/types/aiProvider';
import { getUserPreferences, getUsageStats } from '@/services/userAIPreferencesService';
import { aiProviderService } from '@/services/aiProviderService';
import { UsageStatsView } from '@/components/ai-settings/UsageStatsView';
import { AISettingsPanel } from '@/components/ai-settings/AISettingsPanel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import WorkspaceSidebar from '@/components/WorkspaceSidebar';

export default function AIProviderDashboard() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [preferences, setPreferences] = useState<UserAIPreferences | null>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [prefsData, statsData] = await Promise.all([
        getUserPreferences(user.id),
        getUsageStats(user.id)
      ]);
      
      setPreferences(prefsData);
      setUsageStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleTestConnection = async () => {
    if (!user) return;
    
    try {
      await aiProviderService.testConnection(user.id);
      await loadData(); // Reload to get updated status
    } catch (error) {
      console.error('Connection test failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'quota_exceeded': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'quota_exceeded': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-black via-gray-900 to-green-950">
        <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 p-4 md:p-6">
          {/* Top navigation with hamburger menu */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-black/30"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
            <div className="flex-1">
              {/* Page-specific navigation can go here */}
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-black via-gray-900 to-green-950">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 p-4 md:p-6">
        {/* Top navigation with hamburger menu */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-black/30"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
          <div className="flex-1">
            {/* Page-specific navigation can go here */}
          </div>
        </div>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Brain className="w-8 h-8" />
                AI Provider Dashboard
              </h1>
              <p className="text-gray-400 mt-1">
                Monitor your AI usage, connection status, and performance metrics
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-black/20 border-white/10 text-white hover:bg-white/10"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                onClick={() => setShowSettings(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Status Alert */}
          {!preferences?.apiKeyEncrypted && (
            <Alert className="bg-orange-500/10 border-orange-500/20">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-orange-200">
                No AI provider configured. 
                <Button 
                  variant="link" 
                  className="text-orange-300 hover:text-orange-100 p-0 ml-1"
                  onClick={() => setShowSettings(true)}
                >
                  Set up your AI provider
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Stats */}
          {preferences && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-black/20 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(preferences.connectionStatus)}
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <p className={`font-semibold ${getStatusColor(preferences.connectionStatus)}`}>
                        {preferences.connectionStatus.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-400">Total Requests</p>
                      <p className="font-semibold text-white">{formatNumber(preferences.totalRequests)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-400">Tokens Used</p>
                      <p className="font-semibold text-white">{formatNumber(preferences.totalTokensUsed)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-400">Provider</p>
                      <p className="font-semibold text-white capitalize">{preferences.provider}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/20 border-white/10">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">
                Overview
              </TabsTrigger>
              <TabsTrigger value="usage" className="data-[state=active]:bg-white/10">
                Usage Details
              </TabsTrigger>
              <TabsTrigger value="troubleshooting" className="data-[state=active]:bg-white/10">
                Troubleshooting
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {preferences ? (
                <UsageStatsView preferences={preferences} usageStats={usageStats} />
              ) : (
                <Card className="bg-black/20 border-white/10">
                  <CardContent className="p-8 text-center">
                    <Brain className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No AI Provider Configured</h3>
                    <p className="text-gray-400 mb-4">
                      Set up your AI provider to start using the platform with your own API keys.
                    </p>
                    <Button onClick={() => setShowSettings(true)}>
                      Configure AI Provider
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="usage" className="space-y-6">
              {preferences ? (
                <UsageStatsView preferences={preferences} usageStats={usageStats} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">Configure your AI provider to see usage details.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="troubleshooting" className="space-y-6">
              <Card className="bg-black/20 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Troubleshooting Guide</CardTitle>
                  <CardDescription className="text-gray-400">
                    Common issues and solutions for AI provider connectivity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white">Connection Issues</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Verify your API key is correct and has proper permissions</li>
                      <li>• Check if your provider account has sufficient credits/quota</li>
                      <li>• Ensure your internet connection is stable</li>
                      <li>• Try testing the connection again after a few minutes</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-white">Quota Exceeded</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Check your provider's usage dashboard for current limits</li>
                      <li>• Consider upgrading your plan if you need higher limits</li>
                      <li>• Wait for your quota to reset (usually monthly)</li>
                      <li>• Switch to a different provider temporarily</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-white">Performance Issues</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Try using a faster model (e.g., GPT-3.5 instead of GPT-4)</li>
                      <li>• Reduce the max tokens setting for shorter responses</li>
                      <li>• Lower the temperature for more consistent responses</li>
                      <li>• Check if the provider is experiencing outages</li>
                    </ul>
                  </div>

                  {preferences && (
                    <div className="pt-4 border-t border-white/10">
                      <Button onClick={handleTestConnection} variant="outline" className="w-full">
                        Test Connection Now
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/90 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">AI Provider Settings</DialogTitle>
          </DialogHeader>
          <AISettingsPanel onClose={() => setShowSettings(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
