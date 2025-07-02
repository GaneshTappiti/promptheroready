// Provider Selector - Component for choosing AI provider
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Zap, DollarSign, Globe, Code, Eye, Cpu } from 'lucide-react';
import { AIProvider, AIProviderCapabilities } from '@/types/aiProvider';
import { aiProviderService } from '@/services/aiProviderService';

interface ProviderSelectorProps {
  currentProvider?: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  currentProvider,
  onProviderChange
}) => {
  const providers = aiProviderService.getAvailableProviders();

  const getProviderIcon = (provider: AIProvider) => {
    switch (provider) {
      case 'openai': return '🤖';
      case 'gemini': return '💎';
      case 'deepseek': return '🔍';
      case 'claude': return '🎭';
      case 'mistral': return '🌪️';
      case 'custom': return '⚙️';
      default: return '🧠';
    }
  };

  const getPricingBadge = (pricing: any) => {
    switch (pricing.type) {
      case 'free':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Free</Badge>;
      case 'freemium':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Freemium</Badge>;
      case 'paid':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Paid</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getFeatureIcon = (featureName: string) => {
    switch (featureName.toLowerCase()) {
      case 'code generation': return <Code className="w-3 h-3" />;
      case 'vision': return <Eye className="w-3 h-3" />;
      case 'multilingual': return <Globe className="w-3 h-3" />;
      case 'streaming': return <Zap className="w-3 h-3" />;
      case 'long context': return <Cpu className="w-3 h-3" />;
      default: return <Zap className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Your AI Provider</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select the AI provider you'd like to use. Each has different capabilities and pricing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((providerCap: AIProviderCapabilities) => (
          <Card 
            key={providerCap.provider}
            className={`cursor-pointer transition-all hover:shadow-md ${
              currentProvider === providerCap.provider 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onProviderChange(providerCap.provider)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getProviderIcon(providerCap.provider)}</span>
                  <CardTitle className="text-base">{providerCap.name}</CardTitle>
                </div>
                {getPricingBadge(providerCap.pricing)}
              </div>
              <CardDescription className="text-xs">
                {providerCap.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Models */}
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700 mb-1">Models:</p>
                <div className="flex flex-wrap gap-1">
                  {providerCap.models.slice(0, 2).map((model) => (
                    <Badge key={model.id} variant="outline" className="text-xs">
                      {model.name}
                    </Badge>
                  ))}
                  {providerCap.models.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{providerCap.models.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Key Features */}
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700 mb-1">Features:</p>
                <div className="flex flex-wrap gap-1">
                  {providerCap.features
                    .filter(f => f.supported)
                    .slice(0, 3)
                    .map((feature) => (
                      <div key={feature.name} className="flex items-center gap-1 text-xs text-gray-600">
                        {getFeatureIcon(feature.name)}
                        <span>{feature.name}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Pricing Info */}
              {providerCap.pricing.freeQuota && (
                <div className="mb-3">
                  <p className="text-xs text-green-600">
                    <DollarSign className="w-3 h-3 inline mr-1" />
                    {providerCap.pricing.freeQuota}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <Button
                  variant={currentProvider === providerCap.provider ? "default" : "outline"}
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProviderChange(providerCap.provider);
                  }}
                >
                  {currentProvider === providerCap.provider ? 'Selected' : 'Select'}
                </Button>
                
                {providerCap.websiteUrl !== '#' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(providerCap.websiteUrl, '_blank');
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Popular Recommendations */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Popular Choices</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>🆓 Best Free Option:</strong> Gemini (15 requests/min free)</p>
          <p><strong>💰 Most Cost-Effective:</strong> DeepSeek ($0.14 per 1M tokens)</p>
          <p><strong>🚀 Most Powerful:</strong> GPT-4 or Claude 3 Opus</p>
          <p><strong>⚡ Fastest:</strong> Gemini 2.0 Flash or GPT-3.5 Turbo</p>
        </div>
      </div>
    </div>
  );
};
