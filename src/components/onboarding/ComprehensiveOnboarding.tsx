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
  ArrowLeft,
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
  icon: any;
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
            user={user}
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900">Welcome to StartWise</h1>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
              Step {currentStepIndex + 1} of {STEPS.length}
            </Badge>
          </div>
          
          <Progress value={progress} className="h-2 bg-white/50" />
          
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>{STEPS[currentStepIndex].title}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {renderStepContent()}
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mt-8 gap-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            
            return (
              <div
                key={step.id}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-lg scale-110' 
                    : isCompleted
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-white/50 text-gray-400'
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
