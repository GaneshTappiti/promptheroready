// Presentation Viewer Component - View and present slides

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Square, 
  Maximize, 
  Edit,
  Share,
  Download,
  MoreHorizontal,
  Clock,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';
import { Presentation, Slide } from '@/types/presentation';
import { presentationService } from '@/services/presentationService';
import { getTheme } from '@/lib/presentation/themes';

interface PresentationViewerProps {
  presentationId?: string;
  presentation?: Presentation;
  mode?: 'view' | 'present';
}

const PresentationViewer: React.FC<PresentationViewerProps> = ({
  presentationId,
  presentation: initialPresentation,
  mode = 'view'
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [presentation, setPresentation] = useState<Presentation | null>(initialPresentation || null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPresenting, setIsPresenting] = useState(mode === 'present');
  const [showNotes, setShowNotes] = useState(false);
  const [loading, setLoading] = useState(!initialPresentation);
  const [error, setError] = useState<string | null>(null);

  const effectivePresentationId = presentationId || id;

  // Load presentation if not provided
  useEffect(() => {
    if (!presentation && effectivePresentationId && user) {
      loadPresentation();
    }
  }, [effectivePresentationId, user]);

  const loadPresentation = async () => {
    if (!effectivePresentationId || !user) return;

    try {
      setLoading(true);
      const { data, error } = await presentationService.getPresentation(effectivePresentationId, user.id);
      
      if (error || !data) {
        throw new Error(error?.message || 'Presentation not found');
      }

      setPresentation(data);
    } catch (error: any) {
      console.error('Error loading presentation:', error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load presentation.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!presentation) return;

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          previousSlide();
          break;
        case 'Escape':
          if (isPresenting) {
            setIsPresenting(false);
          }
          break;
        case 'f':
        case 'F11':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    if (isPresenting) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [presentation, currentSlideIndex, isPresenting]);

  const nextSlide = useCallback(() => {
    if (!presentation) return;
    setCurrentSlideIndex(prev => 
      Math.min(prev + 1, presentation.slides.length - 1)
    );
  }, [presentation]);

  const previousSlide = useCallback(() => {
    setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const goToSlide = (index: number) => {
    if (!presentation) return;
    setCurrentSlideIndex(Math.max(0, Math.min(index, presentation.slides.length - 1)));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleEdit = () => {
    if (effectivePresentationId) {
      navigate(`/workspace/docs-decks/presentation/${effectivePresentationId}/edit`);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/presentation/${effectivePresentationId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied",
      description: "Presentation share link copied to clipboard.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-white">Loading presentation...</p>
        </div>
      </div>
    );
  }

  if (error || !presentation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Presentation Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'The requested presentation could not be loaded.'}</p>
          <Button onClick={() => navigate('/workspace/docs-decks')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  const currentSlide = presentation.slides[currentSlideIndex];
  const theme = getTheme(presentation.theme, presentation.customTheme);
  const progress = ((currentSlideIndex + 1) / presentation.slides.length) * 100;

  if (isPresenting) {
    return (
      <div 
        className="min-h-screen flex flex-col"
        style={{ 
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          fontFamily: theme.fonts.body
        }}
      >
        {/* Presentation Controls */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPresenting(false)}
            className="bg-black/20 hover:bg-black/40 text-white"
          >
            <Square className="h-4 w-4 mr-2" />
            Exit
          </Button>
          
          <div className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-1">
            <span className="text-sm text-white">
              {currentSlideIndex + 1} / {presentation.slides.length}
            </span>
          </div>
        </div>

        {/* Slide Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-6xl">
            <SlideRenderer slide={currentSlide} theme={theme} />
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={previousSlide}
            disabled={currentSlideIndex === 0}
            className="bg-black/20 hover:bg-black/40 text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={nextSlide}
            disabled={currentSlideIndex === presentation.slides.length - 1}
            className="bg-black/20 hover:bg-black/40 text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0">
          <Progress value={progress} className="h-1 rounded-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/workspace/docs-decks')}
                className="text-gray-400 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">{presentation.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="h-3 w-3" />
                  {presentation.estimatedDuration || 15} min
                  <Users className="h-3 w-3 ml-2" />
                  {presentation.targetAudience || 'General'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowNotes(!showNotes)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                {showNotes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                Notes
              </Button>
              <Button
                onClick={() => setIsPresenting(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Present
              </Button>
              <Button
                variant="outline"
                onClick={handleEdit}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Slide Thumbnails */}
        <div className="w-64 bg-black/40 border-r border-white/10 p-4">
          <h3 className="text-white font-medium mb-4">Slides</h3>
          <div className="space-y-2">
            {presentation.slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={`w-full p-2 rounded-lg text-left transition-colors ${
                  index === currentSlideIndex
                    ? 'bg-green-600 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                <div className="text-xs font-medium mb-1">Slide {index + 1}</div>
                <div className="text-xs opacity-75 truncate">{slide.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Slide View */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-xl">
            <SlideRenderer slide={currentSlide} theme={theme} />
          </div>
          
          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={previousSlide}
              disabled={currentSlideIndex === 0}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="text-white text-sm">
              {currentSlideIndex + 1} of {presentation.slides.length}
            </div>
            
            <Button
              variant="outline"
              onClick={nextSlide}
              disabled={currentSlideIndex === presentation.slides.length - 1}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Notes Panel */}
        {showNotes && (
          <div className="w-80 bg-black/40 border-l border-white/10 p-4">
            <h3 className="text-white font-medium mb-4">Speaker Notes</h3>
            <div className="text-gray-300 text-sm">
              {currentSlide.notes || 'No notes for this slide.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple slide renderer component
const SlideRenderer: React.FC<{ slide: Slide; theme: any }> = ({ slide, theme }) => {
  return (
    <div 
      className="w-full aspect-video p-8 flex flex-col"
      style={{ 
        backgroundColor: slide.background?.value || theme.colors.surface,
        fontFamily: theme.fonts.body
      }}
    >
      <h1 
        className="text-3xl font-bold mb-6"
        style={{ 
          color: theme.colors.text,
          fontFamily: theme.fonts.heading
        }}
      >
        {slide.title}
      </h1>
      
      <div className="flex-1">
        {slide.elements.map((element) => (
          <div
            key={element.id}
            className="mb-4"
            style={{
              position: 'relative',
              left: `${element.position.x}%`,
              top: `${element.position.y}%`,
              width: `${element.position.width}%`,
              height: `${element.position.height}%`,
              ...element.style
            }}
          >
            {element.type === 'text' && (
              <div 
                className="prose"
                style={{ color: theme.colors.text }}
                dangerouslySetInnerHTML={{ __html: element.content }}
              />
            )}
            {element.type === 'list' && (
              <ul className="list-disc list-inside space-y-2" style={{ color: theme.colors.text }}>
                {element.content.split('\n').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
            {element.type === 'quote' && (
              <blockquote 
                className="border-l-4 pl-4 italic text-lg"
                style={{ 
                  borderColor: theme.colors.primary,
                  color: theme.colors.textSecondary
                }}
              >
                {element.content}
              </blockquote>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PresentationViewer;
