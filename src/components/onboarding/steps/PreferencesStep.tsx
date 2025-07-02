// Preferences Step - UI and experience preferences
import { useState } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  ArrowRight,
  ArrowLeft,
  Palette,
  Monitor,
  Moon,
  Sun,
  Copy,
  FileText,
  Layers,
  Sparkles,
  Zap,
  Heart,
  Square
} from 'lucide-react';
import { OnboardingData } from '../ComprehensiveOnboarding';

interface PreferencesStepProps {
  data: Partial<OnboardingData>;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PreferencesStep = ({ data, onUpdate, onNext, onBack }: PreferencesStepProps) => {
  const [uiStyle, setUiStyle] = useState(data.uiStyle || '');
  const [theme, setTheme] = useState(data.theme || '');
  const [outputFormat, setOutputFormat] = useState(data.outputFormat || '');

  const handleNext = () => {
    onUpdate({ uiStyle, theme, outputFormat });
    onNext();
  };

  const uiStyles = [
    {
      id: 'professional',
      label: 'Professional & Minimal',
      description: 'Clean, business-focused design',
      icon: Square,
      preview: 'bg-gradient-to-br from-gray-100 to-gray-200',
      color: 'gray'
    },
    {
      id: 'vibrant',
      label: 'Vibrant & Animated',
      description: 'Colorful with smooth animations',
      icon: Sparkles,
      preview: 'bg-gradient-to-br from-purple-100 to-pink-200',
      color: 'purple'
    },
    {
      id: 'friendly',
      label: 'Friendly & Rounded',
      description: 'Warm, approachable interface',
      icon: Heart,
      preview: 'bg-gradient-to-br from-orange-100 to-yellow-200',
      color: 'orange'
    },
    {
      id: 'dashboard',
      label: 'Classic Dashboard',
      description: 'Traditional dashboard layout',
      icon: Monitor,
      preview: 'bg-gradient-to-br from-blue-100 to-indigo-200',
      color: 'blue'
    }
  ];

  const themes = [
    {
      id: 'dark',
      label: 'Dark Mode',
      description: 'Easy on the eyes',
      icon: Moon,
      preview: 'bg-gradient-to-br from-gray-800 to-gray-900',
      textColor: 'text-white'
    },
    {
      id: 'light',
      label: 'Light Mode',
      description: 'Bright and clean',
      icon: Sun,
      preview: 'bg-gradient-to-br from-white to-gray-100',
      textColor: 'text-gray-900'
    }
  ];

  const outputFormats = [
    {
      id: 'prompts',
      label: 'Copy-Paste Prompts',
      description: 'Ready-to-use prompts for builder tools',
      icon: Copy,
      color: 'green'
    },
    {
      id: 'structured',
      label: 'JSON/Structure Export',
      description: 'Structured data for technical use',
      icon: FileText,
      color: 'blue'
    },
    {
      id: 'both',
      label: 'Both Formats',
      description: 'Maximum flexibility',
      icon: Layers,
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string, selected: boolean) => {
    const colors = {
      gray: selected ? 'bg-gray-100 border-gray-500 text-gray-900' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
      purple: selected ? 'bg-purple-100 border-purple-500 text-purple-900' : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      orange: selected ? 'bg-orange-100 border-orange-500 text-orange-900' : 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
      blue: selected ? 'bg-blue-100 border-blue-500 text-blue-900' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      green: selected ? 'bg-green-100 border-green-500 text-green-900' : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
          <Palette className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Customize Your Experience</CardTitle>
        <CardDescription className="text-gray-600">
          Set up your UI preferences and output formats
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* UI Style Selection */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-gray-900">
            How do you want your UI to look when designing MVPs?
          </Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uiStyles.map((style) => {
              const Icon = style.icon;
              const isSelected = uiStyle === style.id;
              
              return (
                <button
                  key={style.id}
                  onClick={() => setUiStyle(style.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${getColorClasses(style.color, isSelected)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg ${style.preview} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{style.label}</h3>
                      <p className="text-sm opacity-80">{style.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Theme Selection */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-gray-900">
            Preferred theme
          </Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isSelected = theme === themeOption.id;
              
              return (
                <button
                  key={themeOption.id}
                  onClick={() => setTheme(themeOption.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg ${themeOption.preview} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${themeOption.textColor}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{themeOption.label}</h3>
                      <p className="text-sm text-gray-600">{themeOption.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Output Format Selection */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-gray-900">
            Preferred output format
          </Label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {outputFormats.map((format) => {
              const Icon = format.icon;
              const isSelected = outputFormat === format.id;
              
              return (
                <button
                  key={format.id}
                  onClick={() => setOutputFormat(format.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${getColorClasses(format.color, isSelected)}`}
                >
                  <div className="text-center space-y-2">
                    <Icon className="w-8 h-8 mx-auto" />
                    <h3 className="font-semibold">{format.label}</h3>
                    <p className="text-sm opacity-80">{format.description}</p>
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
            disabled={!uiStyle || !theme || !outputFormat}
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
