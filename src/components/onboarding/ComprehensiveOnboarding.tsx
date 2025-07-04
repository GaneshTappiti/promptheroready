// Comprehensive Onboarding Flow - Multi-step user setup
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ArrowRight,
  User,
  Brain,
  Palette,
  MessageSquare,
  CheckCircle
} from 'lucide-react';

// Import step components
import { WelcomeStep } from './steps/WelcomeStep';
import { AIProviderStep } from './steps/AIProviderStep';
import { UserProfileStep } from './steps/UserProfileStep';
import { PreferencesStep } from './steps/PreferencesStep';
import { DiscoveryStep } from './steps/DiscoveryStep';
import { CompletionStep } from './steps/CompletionStep';

interface ComprehensiveOnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  // User Profile
  userType: string;
  buildingGoal: string;
  experience: string;
  
  // AI Provider
  aiProvider?: string;
  aiConfigured: boolean;
  
  // UI Preferences
  uiStyle: string;
  theme: string;
  outputFormat: string;
  
  // Discovery
  discoverySource: string;
  
  // Completion timestamp
  completedAt: Date;
}

type OnboardingStep = 'welcome' | 'profile' | 'ai-provider' | 'preferences' | 'discovery' | 'completion';

const STEPS: Array<{
  id: OnboardingStep;
  title: string;
  description: string;
  icon: unknown;
}> = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Get started with StartWise',
    icon: Sparkles
  },
  {
    id: 'profile',
    title: 'About You',
    description: 'Tell us about yourself',
    icon: User
  },
  {
    id: 'ai-provider',
    title: 'AI Setup',
    description: 'Connect your AI assistant',
    icon: Brain
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Customize your experience',
    icon: Palette
  },
  {
    id: 'discovery',
    title: 'Discovery',
    description: 'How did you find us?',
    icon: MessageSquare
  },
  {
    id: 'completion',
    title: 'Complete',
    description: 'You\'re all set!',
    icon: CheckCircle
  }
];

export const ComprehensiveOnboarding = ({ onComplete }: ComprehensiveOnboardingProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});

  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  const handleComplete = () => {
    const completeData: OnboardingData = {
      userType: onboardingData.userType || '',
      buildingGoal: onboardingData.buildingGoal || '',
      experience: onboardingData.experience || '',
      aiProvider: onboardingData.aiProvider,
      aiConfigured: onboardingData.aiConfigured || false,
      uiStyle: onboardingData.uiStyle || 'professional',
      theme: onboardingData.theme || 'dark',
      outputFormat: onboardingData.outputFormat || 'both',
      discoverySource: onboardingData.discoverySource || '',
      completedAt: new Date()
    };
    
    onComplete(completeData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <WelcomeStep 
            onNext={goToNextStep}
            user={user}
          />
        );
      case 'profile':
        return (
          <UserProfileStep
            data={onboardingData}
            onUpdate={updateOnboardingData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 'ai-provider':
        return (
          <AIProviderStep
            data={onboardingData}
            onUpdate={updateOnboardingData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}

          />
        );
      case 'preferences':
        return (
          <PreferencesStep
            data={onboardingData}
            onUpdate={updateOnboardingData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 'discovery':
        return (
          <DiscoveryStep
            data={onboardingData}
            onUpdate={updateOnboardingData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 'completion':
        return (
          <CompletionStep
            data={onboardingData}
            onComplete={handleComplete}
            onBack={goToPreviousStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-green-600/10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]"></div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-green-400" />
              <h1 className="text-2xl font-bold text-white">Welcome to PromptHeroReady</h1>
            </div>
            <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-500/30">
              Step {currentStepIndex + 1} of {STEPS.length}
            </Badge>
          </div>

          <Progress value={progress} className="h-2 bg-black/40 border border-green-500/20" />

          <div className="flex justify-between mt-2 text-sm text-gray-300">
            <span>{STEPS[currentStepIndex].title}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-green-500/20 overflow-hidden glass-effect">
          {renderStepContent()}
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mt-8 gap-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon as React.ComponentType<{ className?: string }>;
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;

            return (
              <div
                key={step.id}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                  isActive
                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/25 scale-110'
                    : isCompleted
                    ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                    : 'bg-black/40 text-gray-500 border border-gray-600/30'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
