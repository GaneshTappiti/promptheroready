// AI Settings Panel - Main component for managing AI provider settings
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Settings, BarChart3, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { AIProviderConfig, UserAIPreferences, ConnectionStatus } from '@/types/aiProvider';
import { aiProviderService } from '@/services/aiProviderService';
import { getUserPreferences, getUsageStats } from '@/services/userAIPreferencesService';
import { ProviderConfigForm } from './ProviderConfigForm';
import { UsageStatsView } from './UsageStatsView';
import { ProviderSelector } from './ProviderSelector';

interface AISettingsPanelProps {
  onClose?: () => void;
}

export const AISettingsPanel: React.FC<AISettingsPanelProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserAIPreferences | null>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('provider');

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = useCallback(async () => {
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
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleProviderSave = async (config: AIProviderConfig) => {
    if (!user) return;

    try {
      const success = await aiProviderService.saveUserPreferences(user.id, config);
      if (success) {
        await loadUserData(); // Reload data
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving provider config:', error);
      return false;
    }
  };

  const handleTestConnection = async () => {
    if (!user) return;

    setTesting(true);
    try {
      const result = await aiProviderService.testConnection(user.id);
      await loadUserData(); // Reload to get updated status
      return result;
    } catch (error) {
      console.error('Error testing connection:', error);
      return { success: false, error: 'Connection test failed' };
    } finally {
      setTesting(false);
    }
  };

  const getStatusBadge = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
      case 'quota_exceeded':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Quota Exceeded</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Not Tested</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Bring Your Own Brain 🧠
            </CardTitle>
            <CardDescription>
              Connect your own AI provider for full control and cost efficiency
            </CardDescription>
          </div>
          {preferences && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Status:</span>
              {getStatusBadge(preferences.connectionStatus)}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!preferences?.apiKeyEncrypted && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No AI provider configured. Connect your API key to start using the platform with your own AI provider.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="provider" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Provider
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Usage
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Help
            </TabsTrigger>
          </TabsList>

          <TabsContent value="provider" className="space-y-6">
            <ProviderSelector 
              currentProvider={preferences?.provider}
              onProviderChange={(provider) => {
                // Handle provider change if needed
              }}
            />
            
            <ProviderConfigForm
              preferences={preferences}
              onSave={handleProviderSave}
              onTestConnection={handleTestConnection}
              testing={testing}
            />
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <UsageStatsView 
              preferences={preferences}
              usageStats={usageStats}
            />
          </TabsContent>

          <TabsContent value="help" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Getting Started</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>1. Choose your preferred AI provider from the list</p>
                <p>2. Get your API key from the provider's website</p>
                <p>3. Enter your API key and configure settings</p>
                <p>4. Test the connection to ensure everything works</p>
                <p>5. Start using the platform with your own AI!</p>
              </div>

              <h3 className="text-lg font-semibold mt-6">Benefits</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• <strong>Cost Control:</strong> Pay only for what you use</p>
                <p>• <strong>Privacy:</strong> Your data goes directly to your chosen provider</p>
                <p>• <strong>Flexibility:</strong> Switch providers anytime</p>
                <p>• <strong>Performance:</strong> Use the latest models as they become available</p>
              </div>

              <h3 className="text-lg font-semibold mt-6">Troubleshooting</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• <strong>Connection Failed:</strong> Check your API key and internet connection</p>
                <p>• <strong>Quota Exceeded:</strong> Check your provider's usage limits</p>
                <p>• <strong>Invalid API Key:</strong> Verify the key is correct and has proper permissions</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
