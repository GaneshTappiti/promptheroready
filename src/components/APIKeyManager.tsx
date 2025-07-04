import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useToast } from '@/hooks/use-toast';
import { 
  Eye, 
  EyeOff, 
  Key, 
  Check, 
  X, 
  AlertTriangle, 
  ExternalLink,
  Shield,
  Loader2,
  Copy,
  RefreshCw
} from 'lucide-react';
import { aiProviderService } from '@/services/aiProviderService';
import { useAuth } from '@/hooks/useAuth';

interface APIProvider {
  id: string;
  name: string;
  description: string;
  website: string;
  keyFormat: string;
  testEndpoint?: string;
  icon: React.ReactNode;
  pricing: {
    type: 'free' | 'freemium' | 'paid';
    description: string;
  };
}

const API_PROVIDERS: APIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5, and other OpenAI models',
    website: 'https://platform.openai.com/api-keys',
    keyFormat: 'sk-...',
    icon: <div className="w-6 h-6 bg-green-500 rounded"></div>,
    pricing: {
      type: 'paid',
      description: 'Pay-per-use, $0.03/1K tokens for GPT-4'
    }
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    description: 'Claude 3.5 Sonnet and other Anthropic models',
    website: 'https://console.anthropic.com/account/keys',
    keyFormat: 'sk-ant-...',
    icon: <div className="w-6 h-6 bg-orange-500 rounded"></div>,
    pricing: {
      type: 'paid',
      description: 'Pay-per-use, competitive pricing'
    }
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini Pro and Flash models',
    website: 'https://aistudio.google.com/app/apikey',
    keyFormat: 'AI...',
    icon: <div className="w-6 h-6 bg-blue-500 rounded"></div>,
    pricing: {
      type: 'freemium',
      description: 'Free tier available, then pay-per-use'
    }
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'Cost-effective coding and reasoning models',
    website: 'https://platform.deepseek.com/api_keys',
    keyFormat: 'sk-...',
    icon: <div className="w-6 h-6 bg-purple-500 rounded"></div>,
    pricing: {
      type: 'paid',
      description: 'Very cost-effective, $0.14/1M tokens'
    }
  }
];

interface APIKeyManagerProps {
  className?: string;
}

const APIKeyManager: React.FC<APIKeyManagerProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingKeys, setTestingKeys] = useState<Record<string, boolean>>({});
  const [keyStatus, setKeyStatus] = useState<Record<string, 'valid' | 'invalid' | 'untested'>>({});
  const [loading, setLoading] = useState(true);

  const loadAPIKeys = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Load saved API keys for each provider
      const keys: Record<string, string> = {};
      const status: Record<string, 'valid' | 'invalid' | 'untested'> = {};

      for (const provider of API_PROVIDERS) {
        const preferences = await aiProviderService.getUserPreferences(user.id);
        if (preferences && preferences.provider === provider.id) {
          keys[provider.id] = '••••••••••••••••'; // Masked for security
          status[provider.id] = preferences.connectionStatus === 'connected' ? 'valid' : 'untested';
        } else {
          status[provider.id] = 'untested';
        }
      }

      setApiKeys(keys);
      setKeyStatus(status);
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    loadAPIKeys();
  }, [user, loadAPIKeys]);

  const handleKeyChange = (providerId: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [providerId]: value
    }));
    
    // Reset status when key changes
    setKeyStatus(prev => ({
      ...prev,
      [providerId]: 'untested'
    }));
  };

  const toggleKeyVisibility = (providerId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

  const testAPIKey = async (providerId: string) => {
    const key = apiKeys[providerId];
    if (!key || !user?.id) return;

    setTestingKeys(prev => ({ ...prev, [providerId]: true }));
    
    try {
      const result = await aiProviderService.testConnection(user.id, {
        provider: providerId as 'openai' | 'anthropic' | 'google' | 'mistral' | 'deepseek' | 'custom',
        apiKey: key,
        modelName: 'default'
      });

      if (result.success) {
        setKeyStatus(prev => ({ ...prev, [providerId]: 'valid' }));
        toast({
          title: "API Key Valid",
          description: `${API_PROVIDERS.find(p => p.id === providerId)?.name} connection successful`,
        });
      } else {
        setKeyStatus(prev => ({ ...prev, [providerId]: 'invalid' }));
        toast({
          title: "API Key Invalid",
          description: result.error || "Connection failed",
          variant: "destructive"
        });
      }
    } catch {
      setKeyStatus(prev => ({ ...prev, [providerId]: 'invalid' }));
      toast({
        title: "Test Failed",
        description: "Could not test API key",
        variant: "destructive"
      });
    } finally {
      setTestingKeys(prev => ({ ...prev, [providerId]: false }));
    }
  };

  const saveAPIKey = async (providerId: string) => {
    const key = apiKeys[providerId];
    if (!key || !user?.id) return;

    try {
      const success = await aiProviderService.saveUserPreferences(user.id, {
        provider: providerId as 'openai' | 'anthropic' | 'google' | 'mistral' | 'deepseek' | 'custom',
        apiKey: key,
        modelName: 'default'
      });

      if (success) {
        toast({
          title: "API Key Saved",
          description: `${API_PROVIDERS.find(p => p.id === providerId)?.name} API key saved securely`,
        });
        
        // Test the key after saving
        await testAPIKey(providerId);
      } else {
        toast({
          title: "Save Failed",
          description: "Could not save API key",
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Website URL copied to clipboard",
    });
  };

  const getStatusIcon = (status: 'valid' | 'invalid' | 'untested') => {
    switch (status) {
      case 'valid':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: 'valid' | 'invalid' | 'untested') => {
    switch (status) {
      case 'valid':
        return 'Valid';
      case 'invalid':
        return 'Invalid';
      default:
        return 'Not tested';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Loading API keys...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">API Key Management</h2>
        <p className="text-gray-400">
          Securely manage your AI provider API keys. Keys are encrypted and stored safely.
        </p>
      </div>

      <Alert className="border-blue-600/20 bg-blue-600/10">
        <Shield className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-200">
          Your API keys are encrypted using industry-standard security practices. 
          We never store your keys in plain text.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {API_PROVIDERS.map((provider) => (
          <Card key={provider.id} className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {provider.icon}
                  <div>
                    <CardTitle className="text-white">{provider.name}</CardTitle>
                    <p className="text-gray-400 text-sm">{provider.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={(provider.pricing as any)?.type === 'free' ? 'default' : 'secondary'}
                    className={
                      (provider.pricing as any)?.type === 'free'
                        ? 'bg-green-600/20 text-green-400'
                        : (provider.pricing as any)?.type === 'freemium'
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'bg-yellow-600/20 text-yellow-400'
                    }
                  >
                    {(provider.pricing as any)?.type}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(keyStatus[provider.id] || 'untested')}
                    <span className="text-sm text-gray-400">
                      {getStatusText(keyStatus[provider.id] || 'untested')}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor={`key-${provider.id}`} className="text-gray-300">
                  API Key
                </Label>
                <div className="flex gap-2 mt-1">
                  <div className="relative flex-1">
                    <Input
                      id={`key-${provider.id}`}
                      type={showKeys[provider.id] ? 'text' : 'password'}
                      placeholder={`Enter your ${provider.name} API key (${provider.keyFormat})`}
                      value={apiKeys[provider.id] || ''}
                      onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                      className="bg-gray-900/50 border-gray-700 text-white pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => toggleKeyVisibility(provider.id)}
                    >
                      {showKeys[provider.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    onClick={() => testAPIKey(provider.id)}
                    disabled={!apiKeys[provider.id] || testingKeys[provider.id]}
                    variant="outline"
                    size="sm"
                  >
                    {testingKeys[provider.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Test
                  </Button>
                  <Button
                    onClick={() => saveAPIKey(provider.id)}
                    disabled={!apiKeys[provider.id]}
                    size="sm"
                  >
                    <Key className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-400">
                  {provider.pricing.description}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="link"
                    size="sm"
                    className="text-blue-400 hover:text-blue-300 p-0"
                    onClick={() => copyToClipboard(provider.website)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Get API Key
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-blue-400 hover:text-blue-300 p-0"
                    onClick={() => window.open(provider.website, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default APIKeyManager;
