// User Profile Step - Collect user information
import { useState } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  ArrowRight,
  ArrowLeft,
  User,
  GraduationCap,
  UserCheck,
  Palette,
  Code,
  Lightbulb,
  HelpCircle,
  Smartphone,
  Globe,
  Server,
  Bot,
  Target,
  Zap
} from 'lucide-react';
import { OnboardingData } from '../ComprehensiveOnboarding';

interface UserProfileStepProps {
  data: Partial<OnboardingData>;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const UserProfileStep = ({ data, onUpdate, onNext, onBack }: UserProfileStepProps) => {
  const [userType, setUserType] = useState(data.userType || '');
  const [buildingGoal, setBuildingGoal] = useState(data.buildingGoal || '');
  const [experience, setExperience] = useState(data.experience || '');

  const handleNext = () => {
    onUpdate({ userType, buildingGoal, experience });
    onNext();
  };

  const userTypes = [
    {
      id: 'student',
      label: 'Student Founder',
      description: 'Building projects while studying',
      icon: GraduationCap,
      color: 'blue'
    },
    {
      id: 'solo',
      label: 'Solo Builder',
      description: 'Working independently on ideas',
      icon: UserCheck,
      color: 'purple'
    },
    {
      id: 'designer',
      label: 'Product Designer',
      description: 'Focused on user experience',
      icon: Palette,
      color: 'pink'
    },
    {
      id: 'nocode',
      label: 'No-Code Enthusiast',
      description: 'Building without traditional coding',
      icon: Zap,
      color: 'green'
    },
    {
      id: 'developer',
      label: 'Developer',
      description: 'Technical background in programming',
      icon: Code,
      color: 'orange'
    },
    {
      id: 'other',
      label: 'Other',
      description: 'Something else entirely',
      icon: HelpCircle,
      color: 'gray'
    }
  ];

  const buildingGoals = [
    {
      id: 'mobile',
      label: 'Mobile App',
      description: 'iOS/Android application',
      icon: Smartphone,
      color: 'blue'
    },
    {
      id: 'web',
      label: 'Web App',
      description: 'Browser-based application',
      icon: Globe,
      color: 'green'
    },
    {
      id: 'saas',
      label: 'SaaS Platform',
      description: 'Software as a Service',
      icon: Server,
      color: 'purple'
    },
    {
      id: 'ai-tool',
      label: 'AI Agent/Tool',
      description: 'AI-powered solution',
      icon: Bot,
      color: 'orange'
    },
    {
      id: 'validator',
      label: 'Startup Idea Validator',
      description: 'Test and validate concepts',
      icon: Target,
      color: 'teal'
    },
    {
      id: 'unsure',
      label: 'Not Sure Yet',
      description: 'Still exploring options',
      icon: Lightbulb,
      color: 'yellow'
    }
  ];

  const getColorClasses = (color: string, selected: boolean) => {
    // Use green glassy theme for all options
    return selected
      ? 'bg-green-600/20 border-green-500 text-green-400 backdrop-blur-sm'
      : 'bg-black/20 border-green-500/20 text-gray-300 hover:bg-green-600/10 hover:border-green-400/40 backdrop-blur-sm';
  };

  return (
    <>
      <CardHeader className="text-center bg-gradient-to-br from-black/20 to-green-900/20">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
          <User className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-white">Tell Us About You</CardTitle>
        <CardDescription className="text-gray-300">
          Help us personalize your PromptHeroReady experience
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8 bg-gradient-to-br from-black/10 to-green-900/10">
        {/* User Type Selection */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-white">
            What best describes you?
          </Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = userType === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => setUserType(type.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${getColorClasses(type.color, isSelected)}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-6 h-6 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">{type.label}</h3>
                      <p className="text-sm opacity-80">{type.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Building Goal Selection */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-white">
            What do you want to build first?
          </Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {buildingGoals.map((goal) => {
              const Icon = goal.icon;
              const isSelected = buildingGoal === goal.id;
              
              return (
                <button
                  key={goal.id}
                  onClick={() => setBuildingGoal(goal.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${getColorClasses(goal.color, isSelected)}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-6 h-6 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">{goal.label}</h3>
                      <p className="text-sm opacity-80">{goal.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience Level Selection */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-white">
            What's your experience level?
          </Label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'beginner', label: 'Beginner', description: 'New to building products', color: 'green' },
              { id: 'intermediate', label: 'Intermediate', description: 'Some experience building', color: 'blue' },
              { id: 'advanced', label: 'Advanced', description: 'Experienced builder', color: 'purple' }
            ].map((level) => {
              const isSelected = experience === level.id;

              return (
                <button
                  key={level.id}
                  onClick={() => setExperience(level.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${getColorClasses(level.color, isSelected)}`}
                >
                  <div>
                    <h3 className="font-semibold">{level.label}</h3>
                    <p className="text-sm opacity-80">{level.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2 bg-black/20 border-green-500/30 text-gray-300 hover:bg-green-600/10 hover:border-green-400/40">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!userType || !buildingGoal || !experience}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white flex items-center gap-2 shadow-lg shadow-green-500/25"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </>
  );
};
