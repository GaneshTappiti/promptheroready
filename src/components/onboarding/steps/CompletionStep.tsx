// Completion Step - Onboarding summary and next steps
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Rocket,
  Settings,
  BookOpen,
  Users,
  Lightbulb,
  Target
} from 'lucide-react';
import { OnboardingData } from '../ComprehensiveOnboarding';

interface CompletionStepProps {
  data: Partial<OnboardingData>;
  onComplete: () => void;
  onBack: () => void;
}

export const CompletionStep = ({ data, onComplete, onBack }: CompletionStepProps) => {
  const getUserTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'student': 'Student Founder',
      'solo': 'Solo Builder',
      'designer': 'Product Designer',
      'nocode': 'No-Code Enthusiast',
      'developer': 'Developer',
      'other': 'Other'
    };
    return types[type] || type;
  };

  const getBuildingGoalLabel = (goal: string) => {
    const goals: Record<string, string> = {
      'mobile': 'Mobile App',
      'web': 'Web App',
      'saas': 'SaaS Platform',
      'ai-tool': 'AI Agent/Tool',
      'validator': 'Startup Idea Validator',
      'unsure': 'Not Sure Yet'
    };
    return goals[goal] || goal;
  };

  const getAIProviderLabel = (provider?: string) => {
    const providers: Record<string, string> = {
      'gemini': 'Google Gemini',
      'deepseek': 'DeepSeek',
      'openai': 'OpenAI (ChatGPT)',
      'claude': 'Anthropic Claude'
    };
    return provider ? providers[provider] || provider : 'Not configured';
  };

  const nextSteps = [
    {
      icon: Lightbulb,
      title: 'Start with IdeaForge',
      description: 'Transform your startup ideas with AI assistance',
      color: 'blue'
    },
    {
      icon: Rocket,
      title: 'Try MVP Studio',
      description: 'Generate prompts for building your MVP',
      color: 'purple'
    },
    {
      icon: Users,
      title: 'Explore Team Space',
      description: 'Collaborate and get feedback on ideas',
      color: 'green'
    },
    {
      icon: Target,
      title: 'Use Blueprint Zone',
      description: 'Create detailed project specifications',
      color: 'orange'
    }
  ];

  return (
    <>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          You're All Set! 🎉
        </CardTitle>
        <CardDescription className="text-lg text-gray-600">
          Welcome to StartWise! Here's a summary of your preferences
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Profile Summary */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Your Profile Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-emerald-800">User Type</p>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  {getUserTypeLabel(data.userType || '')}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm font-medium text-emerald-800">Building Goal</p>
                <Badge className="bg-teal-100 text-teal-800 border-teal-200">
                  {getBuildingGoalLabel(data.buildingGoal || '')}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm font-medium text-emerald-800">AI Provider</p>
                <Badge className={`${data.aiConfigured ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                  {getAIProviderLabel(data.aiProvider)}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-emerald-800">UI Style</p>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  {data.uiStyle?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not set'}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm font-medium text-emerald-800">Theme</p>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {data.theme?.charAt(0).toUpperCase()}{data.theme?.slice(1)} Mode
                </Badge>
              </div>
              
              <div>
                <p className="text-sm font-medium text-emerald-800">Output Format</p>
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  {data.outputFormat?.charAt(0).toUpperCase()}{data.outputFormat?.slice(1)} Format
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* AI Provider Setup Reminder */}
        {!data.aiConfigured && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Settings className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Don't forget:</strong> You can set up your AI provider anytime in Settings to unlock the full potential of StartWise!
            </AlertDescription>
          </Alert>
        )}

        {/* Next Steps */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            What's Next?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nextSteps.map((step, index) => {
              const Icon = step.icon;
              const colors = {
                blue: 'bg-blue-50 border-blue-200 text-blue-800',
                purple: 'bg-purple-50 border-purple-200 text-purple-800',
                green: 'bg-green-50 border-green-200 text-green-800',
                orange: 'bg-orange-50 border-orange-200 text-orange-800'
              };
              
              return (
                <div key={index} className={`p-4 rounded-lg border ${colors[step.color as keyof typeof colors]}`}>
                  <div className="flex items-start gap-3">
                    <Icon className="w-6 h-6 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">{step.title}</h4>
                      <p className="text-sm opacity-80">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Welcome Message */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Welcome to the StartWise Community! 🚀
          </h3>
          <p className="text-gray-600 mb-4">
            You're now part of a growing community of builders, creators, and entrepreneurs using AI to bring their ideas to life.
          </p>
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <span>• AI-Powered Ideation</span>
            <span>• MVP Generation</span>
            <span>• Community Support</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <Button 
            onClick={onComplete}
            size="lg"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Enter StartWise
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </CardContent>
    </>
  );
};
