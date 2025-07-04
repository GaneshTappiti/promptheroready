/**
 * API Key Test Page
 * Comprehensive page for testing and validating user API keys
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  TestTube, 
  CheckCircle, 
  AlertTriangle,
  Info,
  ExternalLink,
  ArrowLeft,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { APIKeyTester } from '@/components/APIKeyTester';
import { APIKeyManager } from '@/components/APIKeyManager';
import { aiProviderService } from '@/services/aiProviderService';
import { UserAIPreferences } from '@/types/aiProvider';
import { SupabaseConnectionTester } from '@/utils/supabaseConnectionTest';

export const APIKeyTestPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userPreferences, setUserPreferences] = useState<UserAIPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseStatus, setSupabaseStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  useEffect(() => {
    loadUserPreferences();
    testSupabaseConnection();
  }, [user]);

  const loadUserPreferences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const preferences = await aiProviderService.getUserPreferences(user.id);
      setUserPreferences(preferences);
    } catch (error) {
      console.error('Error loading user preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const testSupabaseConnection = async () => {
    try {
      const tester = new SupabaseConnectionTester();
      const result = await tester.quickHealthCheck();
      setSupabaseStatus(result ? 'connected' : 'error');
    } catch (error) {
      setSupabaseStatus('error');
    }
  };

  const getProviderStatus = () => {
    if (!userPreferences) return 'not-configured';
    if (userPreferences.connectionStatus === 'connected') return 'working';
    if (userPreferences.connectionStatus === 'error') return 'error';
    return 'untested';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'working':
        return <Badge className="bg-green-100 text-green-800">✅ Working</Badge>;
      case 'error':
        return <Badge variant="destructive">❌ Error</Badge>;
      case 'untested':
        return <Badge variant="secondary">⏳ Untested</Badge>;
      default:
        return <Badge variant="outline">⚙️ Not Configured</Badge>;
    }
  };

  const getProviderInfo = () => {
    if (!userPreferences) return null;

    const providerNames: Record<string, string> = {
      openai: 'OpenAI (ChatGPT)',
      gemini: 'Google Gemini',
      claude: 'Anthropic Claude',
      deepseek: 'DeepSeek',
      mistral: 'Mistral AI',
      custom: 'Custom Provider'
    };

    return {
      name: providerNames[userPreferences.provider] || userPreferences.provider,
      model: userPreferences.modelName || 'Default',
      lastUsed: userPreferences.lastUsedAt,
      totalRequests: userPreferences.totalRequests || 0,
      totalTokens: userPreferences.totalTokensUsed || 0
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const providerInfo = getProviderInfo();
  const status = getProviderStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">API Key Testing</h1>
              <p className="text-emerald-200">Verify your AI provider configuration</p>
            </div>
          </div>
          {getStatusBadge(status)}
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Database Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {supabaseStatus === 'connected' && (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400">Connected to Supabase</span>
                  </>
                )}
                {supabaseStatus === 'error' && (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400">Database Connection Error</span>
                  </>
                )}
                {supabaseStatus === 'unknown' && (
                  <>
                    <Info className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400">Checking connection...</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                AI Provider Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getStatusBadge(status)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Configuration Overview */}
        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Current Configuration
            </CardTitle>
            <CardDescription className="text-gray-400">
              Overview of your current AI provider setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            {providerInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Provider</p>
                  <p className="text-white font-medium">{providerInfo.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Model</p>
                  <p className="text-white font-medium">{providerInfo.model}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Total Requests</p>
                  <p className="text-white font-medium">{providerInfo.totalRequests.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Tokens Used</p>
                  <p className="text-white font-medium">{providerInfo.totalTokens.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>No API provider configured.</strong> Please set up your AI provider first.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="test" className="space-y-4">
          <TabsList className="bg-black/40 border-white/10">
            <TabsTrigger value="test" className="data-[state=active]:bg-white/20">
              <TestTube className="w-4 h-4 mr-2" />
              Test API Key
            </TabsTrigger>
            <TabsTrigger value="manage" className="data-[state=active]:bg-white/20">
              <Settings className="w-4 h-4 mr-2" />
              Manage API Keys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="test" className="space-y-4">
            {/* API Key Tester */}
            <APIKeyTester />

            {/* Quick Actions */}
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 justify-start"
                    onClick={() => navigate('/dashboard/ai-settings')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    AI Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 justify-start"
                    onClick={() => navigate('/dashboard/presentations')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Create Presentation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Help & Troubleshooting */}
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Troubleshooting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Common Issues:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Invalid API key format - Check your key starts with the correct prefix</li>
                      <li>Insufficient quota - Verify your account has available credits</li>
                      <li>Network connectivity - Ensure you have a stable internet connection</li>
                      <li>Rate limiting - Wait a moment and try again if you're making many requests</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 justify-start"
                    onClick={() => window.open('https://docs.startwise.ai/troubleshooting', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Documentation
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 justify-start"
                    onClick={() => window.open('mailto:support@startwise.ai', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <APIKeyManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
