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
      <CardHeader className="text-center pb-6 bg-gradient-to-br from-black/20 to-green-900/20">
        <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
          <Sparkles className="w-10 h-10 text-white" />
        </div>

        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
          Welcome to PromptHeroReady! 🚀
        </CardTitle>

        <CardDescription className="text-lg text-gray-300 max-w-2xl mx-auto">
          {user?.email ? `Hi there, ${user.email.split('@')[0]}! ` : 'Hi there! '}
          We help you build and validate your startup ideas using the power of AI.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8 bg-gradient-to-br from-black/10 to-green-900/10">
        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-black/20 backdrop-blur-sm rounded-xl border border-green-500/20 hover:border-green-400/40 transition-all">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-green-400 mb-2">IdeaForge</h3>
            <p className="text-sm text-gray-300">
              Transform rough concepts into structured startup ideas with AI assistance
            </p>
          </div>

          <div className="text-center p-6 bg-black/20 backdrop-blur-sm rounded-xl border border-green-500/20 hover:border-green-400/40 transition-all">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-green-400 mb-2">MVP Studio</h3>
            <p className="text-sm text-gray-300">
              Generate AI prompts for building MVPs with external tools like Framer & FlutterFlow
            </p>
          </div>

          <div className="text-center p-6 bg-black/20 backdrop-blur-sm rounded-xl border border-green-500/20 hover:border-green-400/40 transition-all">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-green-400 mb-2">Team Space</h3>
            <p className="text-sm text-gray-300">
              Collaborate with your team and get feedback on your startup ideas
            </p>
          </div>

          <div className="text-center p-6 bg-black/20 backdrop-blur-sm rounded-xl border border-green-500/20 hover:border-green-400/40 transition-all">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-green-400 mb-2">Investor Radar</h3>
            <p className="text-sm text-gray-300">
              Find and connect with potential investors for your startup
            </p>
          </div>

          <div className="text-center p-6 bg-black/20 backdrop-blur-sm rounded-xl border border-green-500/20 hover:border-green-400/40 transition-all">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-green-400 mb-2">AI Tools Hub</h3>
            <p className="text-sm text-gray-300">
              Access curated AI tools and resources for startup building
            </p>
          </div>

          <div className="text-center p-6 bg-black/20 backdrop-blur-sm rounded-xl border border-green-500/20 hover:border-green-400/40 transition-all">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-green-400 mb-2">Blueprint Zone</h3>
            <p className="text-sm text-gray-300">
              Create detailed project blueprints and technical specifications
            </p>
          </div>
        </div>

        {/* What Makes Us Different */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-semibold text-green-400 mb-4 text-center">
            What Makes PromptHeroReady Different?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                AI-Powered
              </Badge>
              <div>
                <p className="text-sm font-medium text-green-400">Bring Your Own AI</p>
                <p className="text-xs text-gray-300">Use your preferred AI provider for maximum control</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                Structured
              </Badge>
              <div>
                <p className="text-sm font-medium text-green-400">Step-by-Step Process</p>
                <p className="text-xs text-gray-300">Guided workflows from idea to MVP</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                Integrated
              </Badge>
              <div>
                <p className="text-sm font-medium text-green-400">Tool Ecosystem</p>
                <p className="text-xs text-gray-300">Works with popular no-code and development tools</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Button
            onClick={onNext}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-8 py-3 text-lg font-semibold shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all"
          >
            Let's Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-sm text-gray-400 mt-4">
            This will take about 2 minutes to complete
          </p>
        </div>
      </CardContent>
    </>
  );
};
