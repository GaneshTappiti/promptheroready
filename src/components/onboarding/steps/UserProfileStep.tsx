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
    const colors = {
      blue: selected ? 'bg-blue-100 border-blue-500 text-blue-900' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      purple: selected ? 'bg-purple-100 border-purple-500 text-purple-900' : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      pink: selected ? 'bg-pink-100 border-pink-500 text-pink-900' : 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100',
      green: selected ? 'bg-green-100 border-green-500 text-green-900' : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      orange: selected ? 'bg-orange-100 border-orange-500 text-orange-900' : 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
      gray: selected ? 'bg-gray-100 border-gray-500 text-gray-900' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
      teal: selected ? 'bg-teal-100 border-teal-500 text-teal-900' : 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100',
      yellow: selected ? 'bg-yellow-100 border-yellow-500 text-yellow-900' : 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Tell Us About You</CardTitle>
        <CardDescription className="text-gray-600">
          Help us personalize your StartWise experience
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* User Type Selection */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-gray-900">
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
          <Label className="text-lg font-semibold text-gray-900">
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
          <Label className="text-lg font-semibold text-gray-900">
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
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!userType || !buildingGoal || !experience}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white flex items-center gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </>
  );
};
