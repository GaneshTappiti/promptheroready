// Welcome Step - Introduction to StartWise
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  ArrowRight,
  Lightbulb,
  Rocket,
  Users,
  TrendingUp,
  Zap,
  Target
} from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface WelcomeStepProps {
  onNext: () => void;
  user: User | null;
}

export const WelcomeStep = ({ onNext, user }: WelcomeStepProps) => {
  return (
    <>
      <CardHeader className="text-center pb-6">
        <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Welcome to StartWise! 🚀
        </CardTitle>
        
        <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
          {user?.email ? `Hi there, ${user.email.split('@')[0]}! ` : 'Hi there! '}
          We help you build and validate your startup ideas using the power of AI.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-blue-900 mb-2">IdeaForge</h3>
            <p className="text-sm text-blue-700">
              Transform rough concepts into structured startup ideas with AI assistance
            </p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <div className="mx-auto mb-4 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-purple-900 mb-2">MVP Studio</h3>
            <p className="text-sm text-purple-700">
              Generate AI prompts for building MVPs with external tools like Framer & FlutterFlow
            </p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-green-900 mb-2">Team Space</h3>
            <p className="text-sm text-green-700">
              Collaborate with your team and get feedback on your startup ideas
            </p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
            <div className="mx-auto mb-4 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-orange-900 mb-2">Investor Radar</h3>
            <p className="text-sm text-orange-700">
              Find and connect with potential investors for your startup
            </p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200">
            <div className="mx-auto mb-4 w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-teal-900 mb-2">AI Tools Hub</h3>
            <p className="text-sm text-teal-700">
              Access curated AI tools and resources for startup building
            </p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-200">
            <div className="mx-auto mb-4 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-pink-900 mb-2">Blueprint Zone</h3>
            <p className="text-sm text-pink-700">
              Create detailed project blueprints and technical specifications
            </p>
          </div>
        </div>

        {/* What Makes Us Different */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-900 mb-4 text-center">
            What Makes StartWise Different?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                AI-Powered
              </Badge>
              <div>
                <p className="text-sm font-medium text-emerald-900">Bring Your Own AI</p>
                <p className="text-xs text-emerald-700">Use your preferred AI provider for maximum control</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge className="bg-teal-100 text-teal-800 border-teal-200">
                Structured
              </Badge>
              <div>
                <p className="text-sm font-medium text-teal-900">Step-by-Step Process</p>
                <p className="text-xs text-teal-700">Guided workflows from idea to MVP</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200">
                Integrated
              </Badge>
              <div>
                <p className="text-sm font-medium text-cyan-900">Tool Ecosystem</p>
                <p className="text-xs text-cyan-700">Works with popular no-code and development tools</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Button 
            onClick={onNext} 
            size="lg" 
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Let's Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            This will take about 2 minutes to complete
          </p>
        </div>
      </CardContent>
    </>
  );
};
