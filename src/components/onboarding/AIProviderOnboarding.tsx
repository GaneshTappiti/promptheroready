// AI Provider Onboarding - Optional step during user onboarding
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  ArrowRight,
  SkipForward,
  CheckCircle,
  DollarSign,
  Shield,
  Zap,
  Settings
} from 'lucide-react';
import { AIProvider, AIProviderConfig } from '@/types/aiProvider';
import { aiProviderService } from '@/services/aiProviderService';
import { ProviderSelector } from '@/components/ai-settings/ProviderSelector';
import { ProviderConfigForm } from '@/components/ai-settings/ProviderConfigForm';
import { useToast } from '@/hooks/use-toast';

interface AIProviderOnboardingProps {
  onComplete: (configured: boolean) => void;
  onSkip: () => void;
}

type OnboardingStep = 'welcome' | 'provider-selection' | 'configuration' | 'success';

export const AIProviderOnboarding: React.FC<AIProviderOnboardingProps> = ({
  onComplete,
  onSkip
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
  const [configuring, setConfiguring] = useState(false);

  const handleProviderSave = async (config: AIProviderConfig): Promise<boolean> => {
    if (!user) return false;

    setConfiguring(true);
    try {
      const success = await aiProviderService.saveUserPreferences(user.id, config);
      if (success) {
        setCurrentStep('success');
        toast({
          title: "AI Provider Configured!",
          description: "Your AI provider has been set up successfully.",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving provider config:', error);
      return false;
    } finally {
      setConfiguring(false);
    }
  };

  const handleTestConnection = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user found' };
    
    try {
      return await aiProviderService.testConnection(user.id);
    } catch (error: any) {
      return { success: false, error: error.message || 'Connection test failed' };
    }
  };

  const renderWelcomeStep = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Brain className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Bring Your Own Brain 🧠</CardTitle>
        <CardDescription className="text-lg">
          Connect your own AI provider for the best experience
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">Cost Control</h3>
            <p className="text-sm text-green-700">Pay only for what you use with your own API</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800">Privacy First</h3>
            <p className="text-sm text-blue-700">Your data goes directly to your chosen provider</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-800">Latest Models</h3>
            <p className="text-sm text-purple-700">Access cutting-edge AI as soon as it's released</p>
          </div>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Popular choice:</strong> Start with Gemini (15 free requests/minute) or DeepSeek (ultra cost-effective at $0.14 per 1M tokens)
          </AlertDescription>
        </Alert>

        <div className="flex gap-3 justify-center">
          <Button onClick={() => setCurrentStep('provider-selection')} size="lg">
            <ArrowRight className="w-4 h-4 mr-2" />
            Set Up AI Provider
          </Button>
          
          <Button variant="outline" onClick={onSkip} size="lg">
            <SkipForward className="w-4 h-4 mr-2" />
            Skip for Now
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500">
          You can always configure this later in Settings
        </p>
      </CardContent>
    </Card>
  );

  const renderProviderSelectionStep = () => (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Choose Your AI Provider
        </CardTitle>
        <CardDescription>
          Select the AI provider that best fits your needs and budget
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <ProviderSelector
          currentProvider={selectedProvider}
          onProviderChange={(provider) => {
            setSelectedProvider(provider);
            setCurrentStep('configuration');
          }}
        />
        
        <div className="flex gap-3 justify-center mt-6">
          <Button variant="outline" onClick={() => setCurrentStep('welcome')}>
            Back
          </Button>
          
          <Button variant="outline" onClick={onSkip}>
            <SkipForward className="w-4 h-4 mr-2" />
            Skip for Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderConfigurationStep = () => (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configure {selectedProvider?.charAt(0).toUpperCase()}{selectedProvider?.slice(1)}
        </CardTitle>
        <CardDescription>
          Enter your API key and configure settings
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {selectedProvider && (
          <ProviderConfigForm
            preferences={null}
            onSave={handleProviderSave}
            onTestConnection={handleTestConnection}
            testing={configuring}
          />
        )}
        
        <div className="flex gap-3 justify-center mt-6">
          <Button variant="outline" onClick={() => setCurrentStep('provider-selection')}>
            Back
          </Button>
          
          <Button variant="outline" onClick={onSkip}>
            <SkipForward className="w-4 h-4 mr-2" />
            Skip for Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderSuccessStep = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl text-green-800">All Set! 🎉</CardTitle>
        <CardDescription className="text-lg">
          Your AI provider has been configured successfully
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {selectedProvider?.charAt(0).toUpperCase()}{selectedProvider?.slice(1)} Connected
          </Badge>
          <p className="text-sm text-gray-600">
            You're now ready to use the platform with your own AI provider!
          </p>
        </div>

        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>What's next?</strong> Start creating startup ideas, get AI-powered insights, and build your next big thing!
          </AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button onClick={() => onComplete(true)} size="lg">
            <ArrowRight className="w-4 h-4 mr-2" />
            Continue to Workspace
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const stepComponents = {
    welcome: renderWelcomeStep,
    'provider-selection': renderProviderSelectionStep,
    configuration: renderConfigurationStep,
    success: renderSuccessStep
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full">
        {stepComponents[currentStep]()}
      </div>
    </div>
  );
};
