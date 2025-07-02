// Discovery Step - How did you find us?
import { useState } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  Twitter,
  Linkedin,
  Users,
  GraduationCap,
  Search,
  HelpCircle
} from 'lucide-react';
import { OnboardingData } from '../ComprehensiveOnboarding';

interface DiscoveryStepProps {
  data: Partial<OnboardingData>;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DiscoveryStep = ({ data, onUpdate, onNext, onBack }: DiscoveryStepProps) => {
  const [discoverySource, setDiscoverySource] = useState(data.discoverySource || '');
  const [customSource, setCustomSource] = useState('');

  const handleNext = () => {
    const finalSource = discoverySource === 'other' ? customSource : discoverySource;
    onUpdate({ discoverySource: finalSource });
    onNext();
  };

  const sources = [
    {
      id: 'twitter',
      label: 'Twitter/X',
      description: 'Found us on social media',
      icon: Twitter,
      color: 'blue'
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      description: 'Professional network',
      icon: Linkedin,
      color: 'blue'
    },
    {
      id: 'referral',
      label: 'Friend Referral',
      description: 'Someone recommended us',
      icon: Users,
      color: 'green'
    },
    {
      id: 'college',
      label: 'College Workshop / GITAM Event',
      description: 'Educational institution',
      icon: GraduationCap,
      color: 'purple'
    },
    {
      id: 'search',
      label: 'Google Search',
      description: 'Found through search',
      icon: Search,
      color: 'orange'
    },
    {
      id: 'other',
      label: 'Other',
      description: 'Something else',
      icon: HelpCircle,
      color: 'gray'
    }
  ];

  const getColorClasses = (color: string, selected: boolean) => {
    const colors = {
      blue: selected ? 'bg-blue-100 border-blue-500 text-blue-900' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      green: selected ? 'bg-green-100 border-green-500 text-green-900' : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      purple: selected ? 'bg-purple-100 border-purple-500 text-purple-900' : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      orange: selected ? 'bg-orange-100 border-orange-500 text-orange-900' : 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
      gray: selected ? 'bg-gray-100 border-gray-500 text-gray-900' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
          <MessageSquare className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">How Did You Hear About Us?</CardTitle>
        <CardDescription className="text-gray-600">
          Help us understand how you discovered StartWise (optional but valuable!)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Source Selection */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-gray-900">
            Discovery Source
          </Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((source) => {
              const Icon = source.icon;
              const isSelected = discoverySource === source.id;
              
              return (
                <button
                  key={source.id}
                  onClick={() => setDiscoverySource(source.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${getColorClasses(source.color, isSelected)}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-6 h-6 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">{source.label}</h3>
                      <p className="text-sm opacity-80">{source.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Source Input */}
        {discoverySource === 'other' && (
          <div className="space-y-2">
            <Label htmlFor="custom-source" className="text-sm font-medium text-gray-700">
              Please specify how you found us
            </Label>
            <Input
              id="custom-source"
              placeholder="e.g., YouTube, Reddit, Blog post, etc."
              value={customSource}
              onChange={(e) => setCustomSource(e.target.value)}
              className="bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
        )}

        {/* Why This Matters */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-900 mb-3">
            Why This Helps Us 🎯
          </h3>
          
          <div className="space-y-2 text-sm text-emerald-800">
            <p>• <strong>Better Content:</strong> We'll create more content where you found us</p>
            <p>• <strong>Improved Features:</strong> Understanding our audience helps us build better tools</p>
            <p>• <strong>Community Growth:</strong> We can focus on the right channels to help more builders</p>
            <p>• <strong>Attribution:</strong> Helps us track what marketing efforts are working</p>
          </div>
        </div>

        {/* Thank You Message */}
        {discoverySource && (
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 font-medium">
              {discoverySource === 'referral' && "Thanks for the referral! We love word-of-mouth growth 💙"}
              {discoverySource === 'twitter' && "Great to connect with you from Twitter/X! 🐦"}
              {discoverySource === 'linkedin' && "Professional networks are the best! 💼"}
              {discoverySource === 'college' && "Educational partnerships are important to us! 🎓"}
              {discoverySource === 'search' && "Glad our SEO is working! 🔍"}
              {discoverySource === 'other' && "Thanks for sharing how you found us! 🙏"}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={discoverySource === 'other' && !customSource.trim()}
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
