// Presentation Types - Adapted for Supabase and existing AI infrastructure

export type ThemeType = 
  | 'mystique' 
  | 'aurora' 
  | 'nexus' 
  | 'zenith' 
  | 'prism' 
  | 'velocity' 
  | 'quantum' 
  | 'eclipse' 
  | 'custom';

export type PresentationStyle = 'professional' | 'casual' | 'creative' | 'academic';
export type PageStyle = 'default' | 'minimal' | 'bold' | 'elegant';
export type SlideLayout = 'title' | 'content' | 'two-column' | 'image-text' | 'full-image' | 'quote' | 'conclusion';

export interface ThemeProperties {
  id: string;
  name: string;
  description?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  fonts: {
    heading: string;
    body: string;
    code?: string;
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
  borderRadius: string;
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
  animations?: {
    duration: string;
    easing: string;
  };
}

export interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'chart' | 'list' | 'quote' | 'code';
  content: unknown;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  style?: Record<string, any>;
  animation?: {
    type: string;
    duration: number;
    delay: number;
  };
}

export interface Slide {
  id: string;
  title: string;
  layout: SlideLayout;
  elements: SlideElement[];
  notes?: string;
  duration?: number;
  transition?: string;
  background?: {
    type: 'color' | 'gradient' | 'image';
    value: string;
  };
  order: number;
}

export interface PresentationOutline {
  title: string;
  description: string;
  slides: Array<{
    title: string;
    content: string;
    layout: SlideLayout;
    notes?: string;
  }>;
  estimatedDuration: number;
  targetAudience: string;
  objectives: string[];
}

export interface PresentationMetadata {
  id: string;
  title: string;
  description?: string;
  theme: ThemeType;
  customTheme?: ThemeProperties;
  style: PresentationStyle;
  pageStyle: PageStyle;
  language: string;
  totalSlides: number;
  estimatedDuration?: number;
  targetAudience?: string;
  tags?: string[];
  isPublic: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  userId: string;
  ideaId?: string;
}

export interface Presentation extends PresentationMetadata {
  slides: Slide[];
  outline?: PresentationOutline;
  settings: {
    autoAdvance: boolean;
    showNotes: boolean;
    showProgress: boolean;
    allowNavigation: boolean;
    loop: boolean;
  };
}

export interface PresentationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  theme: ThemeType;
  slides: Omit<Slide, 'id'>[];
  previewImage?: string;
  isPublic: boolean;
  usageCount: number;
  tags: string[];
}

// AI Generation Types
export interface OutlineGenerationRequest {
  topic: string;
  numSlides: number;
  language: string;
  style: PresentationStyle;
  targetAudience?: string;
  objectives?: string[];
  duration?: number;
}

export interface SlideGenerationRequest {
  outline: PresentationOutline;
  slideIndex: number;
  theme: ThemeType;
  customTheme?: ThemeProperties;
  imageModel?: string;
  includeImages: boolean;
}

export interface PresentationGenerationProgress {
  stage: 'outline' | 'slides' | 'images' | 'complete';
  currentSlide?: number;
  totalSlides: number;
  message: string;
  progress: number;
}

// Database Types (extending existing Supabase schema)
export interface PresentationDocument {
  id: string;
  title: string;
  content: string; // JSON stringified Presentation object
  document_type: 'pitch_deck';
  format: 'json';
  status: 'draft' | 'review' | 'published' | 'archived';
  template_id?: string;
  idea_id?: string;
  user_id: string;
  version: number;
  file_url?: string;
  file_size?: number;
  metadata: {
    presentation: PresentationMetadata;
    generation: {
      aiProvider?: string;
      model?: string;
      generatedAt?: string;
      tokensUsed?: number;
    };
    analytics: {
      views: number;
      downloads: number;
      shares: number;
      avgTimeSpent?: number;
      completionRate?: number;
    };
  };
  created_at: string;
  updated_at: string;
}

// Store Types
export interface PresentationState {
  // Current presentation
  currentPresentationId: string | null;
  currentPresentation: Presentation | null;
  
  // UI State
  isGridView: boolean;
  isSheetOpen: boolean;
  isPresenting: boolean;
  currentSlideIndex: number;
  isThemeCreatorOpen: boolean;
  shouldShowExitHeader: boolean;
  
  // Generation State
  isGeneratingOutline: boolean;
  isGeneratingPresentation: boolean;
  generationProgress: PresentationGenerationProgress | null;
  
  // Form State
  presentationInput: string;
  numSlides: number;
  theme: ThemeType;
  customThemeData: ThemeProperties | null;
  language: string;
  pageStyle: PageStyle;
  presentationStyle: PresentationStyle;
  imageModel: string;
  
  // Selection State
  isSelecting: boolean;
  selectedPresentations: string[];
  
  // Saving State
  savingStatus: 'idle' | 'saving' | 'saved' | 'error';
}

// Export utility types
export type CreatePresentationRequest = Omit<PresentationMetadata, 'id' | 'createdAt' | 'updatedAt' | 'totalSlides'>;
export type UpdatePresentationRequest = Partial<Omit<PresentationMetadata, 'id' | 'createdAt' | 'userId'>>;
