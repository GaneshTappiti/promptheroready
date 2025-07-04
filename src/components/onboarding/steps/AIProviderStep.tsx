// AI Provider Step - Connect AI assistant
import { useState } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  ArrowLeft,
  Brain,
  DollarSign,
  Shield,
  Zap,
  SkipForward,
  ExternalLink,
  Info,
  AlertTriangle
} from 'lucide-react';
import { OnboardingData } from '../ComprehensiveOnboarding';

interface AIProviderStepProps {
  data: Partial<OnboardingData>;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const AIProviderStep = ({ data, onUpdate, onNext, onBack }: AIProviderStepProps) => {
  const [selectedProvider, setSelectedProvider] = useState(data.aiProvider || '');

  const handleNext = () => {
    onUpdate({ 
      aiProvider: selectedProvider,
      aiConfigured: selectedProvider ? true : false
    });
    onNext();
  };

  const handleSkip = () => {
    onUpdate({ 
      aiProvider: undefined,
      aiConfigured: false
    });
    onNext();
  };

  const providers = [
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Free tier with 15 requests/minute',
      pricing: 'Free tier available',
      features: ['Fast responses', 'Good for beginners', 'Generous free tier'],
      color: 'blue',
      recommended: true
    },
    {
      id: 'deepseek',
      name: 'DeepSeek',
      description: 'Ultra cost-effective AI',
      pricing: '₹12 per 1M tokens (~$0.14)',
      features: ['Extremely affordable', 'High quality', 'Great for volume'],
      color: 'green',
      recommended: true
    },
    {
      id: 'openai',
      name: 'OpenAI (ChatGPT)',
      description: 'Industry standard AI',
      pricing: '₹1,650 per 1M tokens (~$20)',
      features: ['Most popular', 'Excellent quality', 'Wide compatibility'],
      color: 'purple'
    },
    {
      id: 'claude',
      name: 'Anthropic Claude',
      description: 'Advanced reasoning AI',
      pricing: '₹1,240 per 1M tokens (~$15)',
      features: ['Great for analysis', 'Long context', 'Ethical AI'],
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string, selected: boolean) => {
    const colors = {
      blue: selected ? 'bg-blue-100 border-blue-500' : 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      green: selected ? 'bg-green-100 border-green-500' : 'bg-green-50 border-green-200 hover:bg-green-100',
      purple: selected ? 'bg-purple-100 border-purple-500' : 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      orange: selected ? 'bg-orange-100 border-orange-500' : 'bg-orange-50 border-orange-200 hover:bg-orange-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Connect Your AI Assistant</CardTitle>
        <CardDescription className="text-gray-600">
          Bring your own AI provider for the best experience
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">Cost Control</h3>
            <p className="text-sm text-green-700">Pay only for what you use</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800">Privacy First</h3>
            <p className="text-sm text-blue-700">Your data stays with your provider</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-800">Latest Models</h3>
            <p className="text-sm text-purple-700">Access cutting-edge AI</p>
          </div>
        </div>

        {/* Provider Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Choose Your AI Provider</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((provider) => {
              const isSelected = selectedProvider === provider.id;
              
              return (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left relative ${getColorClasses(provider.color, isSelected)}`}
                >
                  {provider.recommended && (
                    <Badge className="absolute -top-2 -right-2 bg-emerald-500 text-white">
                      Recommended
                    </Badge>
                  )}
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                    <p className="text-sm text-gray-600">{provider.description}</p>
                    <p className="text-sm font-medium text-gray-800">{provider.pricing}</p>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {provider.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Setup Information */}
        {selectedProvider && (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Important:</strong> You'll need to configure your {providers.find(p => p.id === selectedProvider)?.name} API key to access AI-powered features.
              <br />
              <a
                href={`https://${selectedProvider === 'gemini' ? 'makersuite.google.com' : selectedProvider === 'openai' ? 'platform.openai.com' : selectedProvider === 'claude' ? 'console.anthropic.com' : 'platform.deepseek.com'}/api-keys`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline mt-1"
              >
                Get your API key here <ExternalLink className="w-3 h-3" />
              </a>
            </AlertDescription>
          </Alert>
        )}

        {/* Important Notice */}
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>AI API Required:</strong> Most features in StartWise require an AI provider. You can set up your API key now or later in settings, but you'll need it to access AI-powered tools like IdeaForge, MVP Studio, and Document Generation.
          </AlertDescription>
        </Alert>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSkip} className="flex items-center gap-2">
              <SkipForward className="w-4 h-4" />
              Skip for Now
            </Button>
            
            <Button 
              onClick={handleNext}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white flex items-center gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </>
  );
};
