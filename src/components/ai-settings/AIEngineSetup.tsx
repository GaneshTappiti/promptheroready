import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useToast } from '@/hooks/use-toast';
import {
  Brain,
  Key,
  CheckCircle,
  AlertCircle,
  Zap,
  Clock,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
  Rocket,
  Star,
  TrendingUp
} from 'lucide-react';
import { aiProviderService } from '@/services/aiProviderService';
import { AIProvider, AIProviderConfig } from '@/types/aiProvider';
import { useAuth } from '@/contexts/AuthContext';

interface AIProviderOption {
  id: AIProvider;
  name: string;
  description: string;
  icon: React.ReactNode;
  pricing: 'free' | 'freemium' | 'paid';
  popularity: number;
  strengths: string[];
  setupUrl: string;
  apiKeyPattern: string;
  models: string[];
}

const aiProviders: AIProviderOption[] = [
  {
    id: 'openai',
    name: 'OpenAI GPT-4',
    description: 'Most versatile for MVP planning and creative tasks',
    icon: <Brain className="h-6 w-6 text-green-500" />,
    pricing: 'paid',
    popularity: 95,
    strengths: ['Creative writing', 'Code generation', 'Complex reasoning'],
    setupUrl: 'https://platform.openai.com/api-keys',
    apiKeyPattern: 'sk-',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']
  },
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    description: 'Excellent for detailed planning and analysis',
    icon: <Sparkles className="h-6 w-6 text-purple-500" />,
    pricing: 'freemium',
    popularity: 85,
    strengths: ['Long-form content', 'Analysis', 'Safety'],
    setupUrl: 'https://console.anthropic.com/',
    apiKeyPattern: 'sk-ant-',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Great for technical analysis and multimodal tasks',
    icon: <Star className="h-6 w-6 text-blue-500" />,
    pricing: 'freemium',
    popularity: 80,
    strengths: ['Technical content', 'Multimodal', 'Fast responses'],
    setupUrl: 'https://makersuite.google.com/app/apikey',
    apiKeyPattern: 'AIza',
    models: ['gemini-pro', 'gemini-pro-vision']
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'Cost-effective option with good performance',
    icon: <TrendingUp className="h-6 w-6 text-orange-500" />,
    pricing: 'paid',
    popularity: 70,
    strengths: ['Cost-effective', 'Code generation', 'Math reasoning'],
    setupUrl: 'https://platform.deepseek.com/api_keys',
    apiKeyPattern: 'sk-',
    models: ['deepseek-chat', 'deepseek-coder']
  }
];

interface AIEngineSetupProps {
  onSetupComplete?: () => void;
  showTitle?: boolean;
}

export const AIEngineSetup: React.FC<AIEngineSetupProps> = ({ 
  onSetupComplete, 
  showTitle = true 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | ''>('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const [loading, setLoading] = useState(false);

  const selectedProviderData = aiProviders.find(p => p.id === selectedProvider);

  const loadExistingPreferences = useCallback(async () => {
    if (!user?.id) return;

    try {
      const preferences = await aiProviderService.getUserPreferences(user.id);
      if (preferences) {
        setSelectedProvider(preferences.provider);
        setSelectedModel(preferences.modelName || '');

        setConnectionStatus('success');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadExistingPreferences();
  }, [loadExistingPreferences]);

  const validateApiKey = (provider: AIProvider, key: string): boolean => {
    const providerData = aiProviders.find(p => p.id === provider);
    if (!providerData) return false;
    
    return key.startsWith(providerData.apiKeyPattern) && key.length > 10;
  };

  const testConnection = async () => {
    if (!selectedProvider || !apiKey || !user?.id) return;

    setIsTestingConnection(true);
    setConnectionStatus('testing');

    try {
      const config: AIProviderConfig = {
        provider: selectedProvider,
        apiKey,
        modelName: selectedModel || selectedProviderData?.models[0] || '',
        temperature: 0.7,
        maxTokens: 2000
      };

      const result = await aiProviderService.testConnection(user.id, config);
      
      if (result.success) {
        setConnectionStatus('success');
        toast({
          title: "Connection Successful!",
          description: `Successfully connected to ${selectedProviderData?.name}`,
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Connection Failed",
          description: result.error || "Failed to connect to AI provider",
          variant: "destructive"
        });
      }
    } catch {
      setConnectionStatus('error');
      toast({
        title: "Connection Error",
        description: "An error occurred while testing the connection",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const saveConfiguration = async () => {
    if (!selectedProvider || !apiKey || !user?.id) return;

    setLoading(true);
    try {
      const config: AIProviderConfig = {
        provider: selectedProvider,
        apiKey,
        modelName: selectedModel || selectedProviderData?.models[0] || '',
        temperature: 0.7,
        maxTokens: 2000
      };

      const success = await aiProviderService.saveUserPreferences(user.id, config);
      
      if (success) {
        toast({
          title: "Configuration Saved!",
          description: `${selectedProviderData?.name} is now your default AI engine`,
        });
        onSetupComplete?.();
      } else {
        toast({
          title: "Save Failed",
          description: "Failed to save AI configuration",
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: "Save Error",
        description: "An error occurred while saving configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">🤖 Setup Your AI Engine</h2>
          <p className="text-muted-foreground">
            Choose your preferred AI provider to power your MVP generation
          </p>
        </div>
      )}

      {/* Provider Selection */}
      <div className="grid gap-4">
        <Label className="text-base font-medium">Choose Your AI Provider</Label>
        <div className="grid gap-3">
          {aiProviders.map((provider) => (
            <Card 
              key={provider.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedProvider === provider.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => {
                setSelectedProvider(provider.id);
                setSelectedModel(provider.models[0]);
                setConnectionStatus('idle');
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {provider.icon}
                    <div>
                      <h3 className="font-medium">{provider.name}</h3>
                      <p className="text-sm text-muted-foreground">{provider.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={provider.pricing === 'free' ? 'default' : 'secondary'}>
                      {provider.pricing}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{provider.popularity}%</span>
                    </div>
                  </div>
                </div>
                
                {selectedProvider === provider.id && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex flex-wrap gap-1">
                      {provider.strengths.map((strength, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* API Key Configuration */}
      {selectedProvider && selectedProviderData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Configure {selectedProviderData.name}
            </CardTitle>
            <CardDescription>
              Get your API key from{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto"
                onClick={() => window.open(selectedProviderData.setupUrl, '_blank')}
              >
                {selectedProviderData.setupUrl}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* API Key Input */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  placeholder={`Enter your ${selectedProviderData.name} API key...`}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setConnectionStatus('idle');
                  }}
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  {apiKey && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={copyApiKey}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              {apiKey && !validateApiKey(selectedProvider, apiKey) && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    API key format doesn't match expected pattern for {selectedProviderData.name}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProviderData.models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Connection Status */}
            {connectionStatus !== 'idle' && (
              <Alert className={
                connectionStatus === 'success' ? 'border-green-500 bg-green-50' :
                connectionStatus === 'error' ? 'border-red-500 bg-red-50' :
                'border-yellow-500 bg-yellow-50'
              }>
                {connectionStatus === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : connectionStatus === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-600" />
                )}
                <AlertDescription>
                  {connectionStatus === 'testing' && 'Testing connection...'}
                  {connectionStatus === 'success' && 'Connection successful! Ready to generate MVPs.'}
                  {connectionStatus === 'error' && 'Connection failed. Please check your API key.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={testConnection}
                disabled={!apiKey || !validateApiKey(selectedProvider, apiKey) || isTestingConnection}
                variant="outline"
              >
                {isTestingConnection ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
              
              <Button
                onClick={saveConfiguration}
                disabled={connectionStatus !== 'success' || loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Save & Activate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIEngineSetup;
