// Presentation Generator Component - Main AI presentation generation interface

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePresentationStore } from '@/stores/presentationStore';
import { presentationService } from '@/services/presentationService';
import { 
  Sparkles, 
  Presentation, 
  Clock, 
  Users, 
  Target, 
  Globe,
  Palette,
  Wand2,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { OutlineGenerationRequest, PresentationStyle } from '@/types/presentation';
import { themeList } from '@/lib/presentation/themes';

interface PresentationGeneratorProps {
  onPresentationGenerated?: (presentationId: string) => void;
  ideaId?: string;
}

const PresentationGenerator: React.FC<PresentationGeneratorProps> = ({
  onPresentationGenerated,
  ideaId
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    presentationInput,
    numSlides,
    language,
    presentationStyle,
    theme,
    isGeneratingOutline,
    isGeneratingPresentation,
    generationProgress,
    setPresentationInput,
    setNumSlides,
    setLanguage,
    setPresentationStyle,
    setTheme,
    startOutlineGeneration,
    startPresentationGeneration,
    resetGeneration
  } = usePresentationStore();

  const [targetAudience, setTargetAudience] = useState('');
  const [objectives, setObjectives] = useState('');
  const [duration, setDuration] = useState(15);
  const [step, setStep] = useState<'input' | 'generating' | 'complete'>('input');

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate presentations.",
        variant: "destructive"
      });
      return;
    }

    if (!presentationInput.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your presentation.",
        variant: "destructive"
      });
      return;
    }

    setStep('generating');
    startOutlineGeneration();

    try {
      const request: OutlineGenerationRequest = {
        topic: presentationInput,
        numSlides,
        language,
        style: presentationStyle,
        targetAudience: targetAudience || undefined,
        objectives: objectives ? objectives.split(',').map(o => o.trim()) : undefined,
        duration
      };

      const { data: presentation, error } = await presentationService.generatePresentationFromAI(
        user.id,
        request,
        (stage, current, total, message) => {
          if (stage === 'slides') {
            startPresentationGeneration();
          }
          // Update progress in store if needed
        }
      );

      if (error || !presentation) {
        throw new Error(error?.message || 'Failed to generate presentation');
      }

      // Save the generated presentation
      const { data: savedPresentation, error: saveError } = await presentationService.saveGeneratedPresentation(
        user.id,
        presentation,
        ideaId
      );

      if (saveError || !savedPresentation) {
        throw new Error(saveError?.message || 'Failed to save presentation');
      }

      setStep('complete');
      resetGeneration();

      toast({
        title: "Presentation Generated!",
        description: `Successfully created "${presentation.title}" with ${presentation.totalSlides} slides.`,
      });

      // Navigate to editor or call callback
      if (onPresentationGenerated) {
        onPresentationGenerated(savedPresentation.id);
      } else {
        navigate(`/workspace/docs-decks/presentation/${savedPresentation.id}`);
      }

    } catch (error: any) {
      console.error('Error generating presentation:', error);
      setStep('input');
      resetGeneration();
      
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate presentation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    setStep('input');
    resetGeneration();
    setPresentationInput('');
    setTargetAudience('');
    setObjectives('');
  };

  if (step === 'generating') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wand2 className="h-6 w-6 text-purple-500 animate-pulse" />
            Generating Your Presentation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-lg font-medium mb-2">
              {isGeneratingOutline ? 'Creating outline...' : 'Generating slides...'}
            </div>
            <div className="text-sm text-muted-foreground">
              {generationProgress?.message || 'Please wait while we create your presentation'}
            </div>
          </div>
          
          <Progress 
            value={generationProgress?.progress || 0} 
            className="w-full"
          />
          
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              AI Processing
            </div>
            <div className="flex items-center gap-2">
              <Presentation className="h-4 w-4" />
              {numSlides} Slides
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              ~{duration} min
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-500" />
          AI Presentation Generator
        </CardTitle>
        <p className="text-muted-foreground">
          Create professional presentations with AI assistance
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Topic Input */}
        <div className="space-y-2">
          <Label htmlFor="topic">Presentation Topic *</Label>
          <Textarea
            id="topic"
            placeholder="Enter your presentation topic (e.g., 'Introduction to Machine Learning for Beginners')"
            value={presentationInput}
            onChange={(e) => setPresentationInput(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Number of Slides */}
          <div className="space-y-2">
            <Label htmlFor="slides">Number of Slides</Label>
            <Select value={numSlides.toString()} onValueChange={(value) => setNumSlides(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 8, 10, 12, 15, 20].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} slides
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20, 30, 45, 60].map(mins => (
                  <SelectItem key={mins} value={mins.toString()}>
                    {mins} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Style */}
          <div className="space-y-2">
            <Label htmlFor="style">Presentation Style</Label>
            <Select value={presentationStyle} onValueChange={(value) => setPresentationStyle(value as PresentationStyle)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English</SelectItem>
                <SelectItem value="es-ES">Spanish</SelectItem>
                <SelectItem value="fr-FR">French</SelectItem>
                <SelectItem value="de-DE">German</SelectItem>
                <SelectItem value="pt-BR">Portuguese</SelectItem>
                <SelectItem value="zh-CN">Chinese</SelectItem>
                <SelectItem value="ja-JP">Japanese</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Optional Fields */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Optional Details
          </h4>
          
          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Input
              id="audience"
              placeholder="e.g., Business executives, Students, General public"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objectives">Learning Objectives</Label>
            <Input
              id="objectives"
              placeholder="e.g., Understand basics, Learn implementation, Gain insights (comma-separated)"
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
            />
          </div>
        </div>

        {/* Theme Preview */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {themeList.slice(0, 6).map((themeOption) => (
              <button
                key={themeOption.id}
                onClick={() => setTheme(themeOption.id as any)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  theme === themeOption.id 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div 
                  className="w-full h-8 rounded mb-2"
                  style={{ backgroundColor: themeOption.colors.primary }}
                />
                <div className="text-xs font-medium">{themeOption.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate}
          disabled={!presentationInput.trim() || isGeneratingOutline || isGeneratingPresentation}
          className="w-full"
          size="lg"
        >
          {isGeneratingOutline || isGeneratingPresentation ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Presentation
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>

        {/* Info */}
        <div className="text-xs text-muted-foreground text-center">
          Generation typically takes 1-3 minutes depending on the number of slides
        </div>
      </CardContent>
    </Card>
  );
};

export default PresentationGenerator;
