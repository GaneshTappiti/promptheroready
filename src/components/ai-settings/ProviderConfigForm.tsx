// Provider Configuration Form - Form for configuring AI provider settings
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

import { Eye, EyeOff, TestTube, Save, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { AIProviderConfig, UserAIPreferences, AIProvider } from '@/types/aiProvider';
import { aiProviderService } from '@/services/aiProviderService';
import { useToast } from '@/hooks/use-toast';

const configSchema = z.object({
  provider: z.enum(['openai', 'google', 'gemini', 'anthropic', 'claude', 'deepseek', 'mistral', 'custom']),
  apiKey: z.string().min(1, 'API key is required'),
  modelName: z.string().optional(),
  customEndpoint: z.string().url().optional().or(z.literal('')),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().min(1).max(100000),
  organization: z.string().optional(), // OpenAI specific
  version: z.string().optional(), // Claude specific
  requestFormat: z.enum(['openai', 'custom']).optional(), // Custom provider specific
});

type ConfigFormData = z.infer<typeof configSchema>;

interface ProviderConfigFormProps {
  preferences: UserAIPreferences | null;
  onSave: (config: AIProviderConfig) => Promise<boolean>;
  onTestConnection: () => Promise<{ success: boolean; error?: string }>;
  testing: boolean;
}

export const ProviderConfigForm: React.FC<ProviderConfigFormProps> = ({
  preferences,
  onSave,
  onTestConnection,
  testing
}) => {
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);

  const form = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      provider: (preferences?.provider && preferences.provider !== 'none') ? preferences.provider : 'gemini',
      apiKey: '',
      modelName: preferences?.modelName || '',
      customEndpoint: preferences?.customEndpoint || '',
      temperature: preferences?.temperature || 0.7,
      maxTokens: preferences?.maxTokens || 2000,
      organization: (preferences?.providerSettings?.organization as string) || '',
      version: (preferences?.providerSettings?.version as string) || '2023-06-01',
      requestFormat: (preferences?.providerSettings?.requestFormat as 'openai' | 'custom') || 'openai',
    }
  });

  const selectedProvider = form.watch('provider');
  const providers = aiProviderService.getAvailableProviders();
  const currentProviderCap = providers.find(p => p.provider === selectedProvider);

  useEffect(() => {
    // Reset form when provider changes
    const subscription = form.watch((value, { name }) => {
      if (name === 'provider') {
        form.reset({
          ...form.getValues(),
          modelName: '',
          customEndpoint: '',
          organization: '',
          version: '2023-06-01',
          requestFormat: 'openai'
        });
        setTestResult(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSave = async (data: ConfigFormData) => {
    setSaving(true);
    setTestResult(null);

    try {
      const config: AIProviderConfig = {
        provider: data.provider,
        apiKey: data.apiKey,
        modelName: data.modelName,
        customEndpoint: data.customEndpoint,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
        providerSettings: {
          ...(data.organization && { organization: data.organization }),
          ...(data.version && { version: data.version }),
          ...(data.requestFormat && { requestFormat: data.requestFormat }),
        }
      };

      const success = await onSave(config);
      
      if (success) {
        toast({
          title: "Settings Saved",
          description: "Your AI provider settings have been saved successfully.",
        });
      } else {
        toast({
          title: "Save Failed",
          description: "Failed to save your settings. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving your settings.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    const result = await onTestConnection();
    setTestResult(result);
    
    if (result.success) {
      toast({
        title: "Connection Successful",
        description: "Your AI provider is working correctly!",
      });
    } else {
      toast({
        title: "Connection Failed",
        description: result.error || "Failed to connect to your AI provider.",
        variant: "destructive"
      });
    }
  };

  const getSetupInstructions = () => {
    if (!currentProviderCap) return null;

    const instructions: Record<AIProvider, { steps: string[]; keyUrl: string }> = {
      openai: {
        steps: [
          "Go to OpenAI Platform",
          "Sign in to your account",
          "Navigate to API Keys section",
          "Create a new secret key",
          "Copy and paste it below"
        ],
        keyUrl: "https://platform.openai.com/api-keys"
      },
      google: {
        steps: [
          "Go to Google AI Studio",
          "Sign in with your Google account",
          "Click 'Get API Key'",
          "Create a new API key",
          "Copy and paste it below"
        ],
        keyUrl: "https://aistudio.google.com/app/apikey"
      },
      anthropic: {
        steps: [
          "Go to Anthropic Console",
          "Sign in to your account",
          "Navigate to API Keys",
          "Create a new API key",
          "Copy and paste it below"
        ],
        keyUrl: "https://console.anthropic.com/"
      },
      gemini: {
        steps: [
          "Go to Google AI Studio",
          "Sign in with your Google account",
          "Click 'Get API Key'",
          "Create a new API key",
          "Copy and paste it below"
        ],
        keyUrl: "https://aistudio.google.com/app/apikey"
      },
      deepseek: {
        steps: [
          "Go to DeepSeek Platform",
          "Create an account or sign in",
          "Navigate to API Keys",
          "Generate a new API key",
          "Copy and paste it below"
        ],
        keyUrl: "https://platform.deepseek.com/api_keys"
      },
      claude: {
        steps: [
          "Go to Anthropic Console",
          "Sign in to your account",
          "Navigate to API Keys",
          "Create a new key",
          "Copy and paste it below"
        ],
        keyUrl: "https://console.anthropic.com/"
      },
      mistral: {
        steps: [
          "Go to Mistral Console",
          "Create an account or sign in",
          "Navigate to API Keys",
          "Generate a new key",
          "Copy and paste it below"
        ],
        keyUrl: "https://console.mistral.ai/"
      },
      custom: {
        steps: [
          "Prepare your custom API endpoint",
          "Ensure it accepts HTTP POST requests",
          "Get your API key if required",
          "Configure the endpoint URL below"
        ],
        keyUrl: "#"
      },
      none: {
        steps: [
          "No AI provider configured",
          "Select a provider above to get started"
        ],
        keyUrl: "#"
      }
    };

    const providerInstructions = instructions[selectedProvider];
    if (!providerInstructions) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="text-sm space-y-1 mb-3">
            {providerInstructions.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs mt-0.5">{index + 1}</Badge>
                {step}
              </li>
            ))}
          </ol>
          {providerInstructions.keyUrl !== '#' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(providerInstructions.keyUrl, '_blank')}
              className="text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Get API Key
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {getSetupInstructions()}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          {/* Provider Selection */}
          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AI Provider</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.provider} value={provider.provider}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* API Key */}
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showApiKey ? "text" : "password"}
                      placeholder="Enter your API key"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Your API key is encrypted and stored securely
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Model Selection */}
          {currentProviderCap && currentProviderCap.models.length > 0 && (
            <FormField
              control={form.control}
              name="modelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currentProviderCap.models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{model.name}</span>
                            {model.isDefault && <Badge variant="secondary" className="ml-2 text-xs">Default</Badge>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Leave empty to use the default model
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Custom Endpoint for Custom Provider */}
          {selectedProvider === 'custom' && (
            <FormField
              control={form.control}
              name="customEndpoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Endpoint</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://your-api-endpoint.com/v1/chat/completions" />
                  </FormControl>
                  <FormDescription>
                    Your custom API endpoint URL
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Advanced Settings</h3>
            
            {/* Temperature */}
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperature: {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={2}
                      step={0.1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    Controls randomness. Lower = more focused, Higher = more creative
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Max Tokens */}
            <FormField
              control={form.control}
              name="maxTokens"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Tokens</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      max={100000}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of tokens to generate
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Test Result */}
          {testResult && (
            <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
                {testResult.success ? "Connection successful!" : testResult.error}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              disabled={testing || !form.getValues('apiKey')}
            >
              <TestTube className="w-4 h-4 mr-2" />
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
