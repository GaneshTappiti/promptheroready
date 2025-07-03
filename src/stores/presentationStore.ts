// Presentation Store - Adapted for our application using Zustand

import { create } from 'zustand';
import { 
  Presentation, 
  PresentationState, 
  ThemeType, 
  ThemeProperties, 
  PresentationStyle, 
  PageStyle,
  PresentationGenerationProgress,
  Slide
} from '@/types/presentation';

interface PresentationStore extends PresentationState {
  // Actions
  setCurrentPresentation: (presentation: Presentation | null) => void;
  setCurrentPresentationId: (id: string | null) => void;
  setIsGridView: (isGrid: boolean) => void;
  setIsSheetOpen: (isOpen: boolean) => void;
  setIsPresenting: (isPresenting: boolean) => void;
  setCurrentSlideIndex: (index: number) => void;
  setIsThemeCreatorOpen: (isOpen: boolean) => void;
  setShouldShowExitHeader: (show: boolean) => void;
  
  // Generation actions
  setIsGeneratingOutline: (isGenerating: boolean) => void;
  setIsGeneratingPresentation: (isGenerating: boolean) => void;
  setGenerationProgress: (progress: PresentationGenerationProgress | null) => void;
  startOutlineGeneration: () => void;
  startPresentationGeneration: () => void;
  resetGeneration: () => void;
  
  // Form actions
  setPresentationInput: (input: string) => void;
  setNumSlides: (num: number) => void;
  setTheme: (theme: ThemeType, customData?: ThemeProperties | null) => void;
  setLanguage: (language: string) => void;
  setPageStyle: (style: PageStyle) => void;
  setPresentationStyle: (style: PresentationStyle) => void;
  setImageModel: (model: string) => void;
  
  // Selection actions
  toggleSelecting: () => void;
  selectAllPresentations: (ids: string[]) => void;
  deselectAllPresentations: () => void;
  togglePresentationSelection: (id: string) => void;
  
  // Saving actions
  setSavingStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  
  // Slide navigation
  nextSlide: () => void;
  previousSlide: () => void;
  goToSlide: (index: number) => void;
  
  // Slide management
  addSlide: (slide: Slide, index?: number) => void;
  removeSlide: (slideId: string) => void;
  updateSlide: (slideId: string, updates: Partial<Slide>) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
}

export const usePresentationStore = create<PresentationStore>((set, get) => ({
  // Initial state
  currentPresentationId: null,
  currentPresentation: null,
  isGridView: true,
  isSheetOpen: false,
  isPresenting: false,
  currentSlideIndex: 0,
  isThemeCreatorOpen: false,
  shouldShowExitHeader: false,
  
  // Generation state
  isGeneratingOutline: false,
  isGeneratingPresentation: false,
  generationProgress: null,
  
  // Form state
  presentationInput: '',
  numSlides: 10,
  theme: 'mystique',
  customThemeData: null,
  language: 'en-US',
  pageStyle: 'default',
  presentationStyle: 'professional',
  imageModel: 'dall-e-3',
  
  // Selection state
  isSelecting: false,
  selectedPresentations: [],
  
  // Saving state
  savingStatus: 'idle',
  
  // Actions
  setCurrentPresentation: (presentation) => 
    set({ 
      currentPresentation: presentation,
      currentPresentationId: presentation?.id || null,
      currentSlideIndex: 0
    }),
    
  setCurrentPresentationId: (id) => 
    set({ currentPresentationId: id }),
    
  setIsGridView: (isGrid) => 
    set({ isGridView: isGrid }),
    
  setIsSheetOpen: (isOpen) => 
    set({ isSheetOpen: isOpen }),
    
  setIsPresenting: (isPresenting) => 
    set({ isPresenting }),
    
  setCurrentSlideIndex: (index) => 
    set({ currentSlideIndex: index }),
    
  setIsThemeCreatorOpen: (isOpen) => 
    set({ isThemeCreatorOpen: isOpen }),
    
  setShouldShowExitHeader: (show) => 
    set({ shouldShowExitHeader: show }),
  
  // Generation actions
  setIsGeneratingOutline: (isGenerating) => 
    set({ isGeneratingOutline: isGenerating }),
    
  setIsGeneratingPresentation: (isGenerating) => 
    set({ isGeneratingPresentation: isGenerating }),
    
  setGenerationProgress: (progress) => 
    set({ generationProgress: progress }),
    
  startOutlineGeneration: () => 
    set({ 
      isGeneratingOutline: true,
      isGeneratingPresentation: false,
      generationProgress: {
        stage: 'outline',
        currentSlide: 0,
        totalSlides: get().numSlides,
        message: 'Generating presentation outline...',
        progress: 0
      }
    }),
    
  startPresentationGeneration: () => 
    set({ 
      isGeneratingPresentation: true,
      generationProgress: {
        stage: 'slides',
        currentSlide: 0,
        totalSlides: get().numSlides,
        message: 'Generating slides...',
        progress: 0
      }
    }),
    
  resetGeneration: () => 
    set({ 
      isGeneratingOutline: false,
      isGeneratingPresentation: false,
      generationProgress: null
    }),
  
  // Form actions
  setPresentationInput: (input) => 
    set({ presentationInput: input }),
    
  setNumSlides: (num) => 
    set({ numSlides: num }),
    
  setTheme: (theme, customData = null) => 
    set({ theme, customThemeData: customData }),
    
  setLanguage: (language) => 
    set({ language }),
    
  setPageStyle: (style) => 
    set({ pageStyle: style }),
    
  setPresentationStyle: (style) => 
    set({ presentationStyle: style }),
    
  setImageModel: (model) => 
    set({ imageModel: model }),
  
  // Selection actions
  toggleSelecting: () => 
    set((state) => ({ 
      isSelecting: !state.isSelecting,
      selectedPresentations: []
    })),
    
  selectAllPresentations: (ids) => 
    set({ selectedPresentations: ids }),
    
  deselectAllPresentations: () => 
    set({ selectedPresentations: [] }),
    
  togglePresentationSelection: (id) => 
    set((state) => ({
      selectedPresentations: state.selectedPresentations.includes(id)
        ? state.selectedPresentations.filter(p => p !== id)
        : [...state.selectedPresentations, id]
    })),
  
  // Saving actions
  setSavingStatus: (status) => 
    set({ savingStatus: status }),
  
  // Slide navigation
  nextSlide: () => 
    set((state) => ({
      currentSlideIndex: Math.min(
        state.currentSlideIndex + 1,
        (state.currentPresentation?.slides.length || 1) - 1
      )
    })),
    
  previousSlide: () => 
    set((state) => ({
      currentSlideIndex: Math.max(state.currentSlideIndex - 1, 0)
    })),
    
  goToSlide: (index) => 
    set((state) => ({
      currentSlideIndex: Math.max(0, Math.min(
        index,
        (state.currentPresentation?.slides.length || 1) - 1
      ))
    })),
  
  // Slide management
  addSlide: (slide, index) => 
    set((state) => {
      if (!state.currentPresentation) return state;
      
      const slides = [...state.currentPresentation.slides];
      const insertIndex = index !== undefined ? index : slides.length;
      slides.splice(insertIndex, 0, slide);
      
      return {
        currentPresentation: {
          ...state.currentPresentation,
          slides,
          totalSlides: slides.length
        }
      };
    }),
    
  removeSlide: (slideId) => 
    set((state) => {
      if (!state.currentPresentation) return state;
      
      const slides = state.currentPresentation.slides.filter(s => s.id !== slideId);
      
      return {
        currentPresentation: {
          ...state.currentPresentation,
          slides,
          totalSlides: slides.length
        },
        currentSlideIndex: Math.min(state.currentSlideIndex, slides.length - 1)
      };
    }),
    
  updateSlide: (slideId, updates) => 
    set((state) => {
      if (!state.currentPresentation) return state;
      
      const slides = state.currentPresentation.slides.map(slide =>
        slide.id === slideId ? { ...slide, ...updates } : slide
      );
      
      return {
        currentPresentation: {
          ...state.currentPresentation,
          slides
        }
      };
    }),
    
  reorderSlides: (fromIndex, toIndex) => 
    set((state) => {
      if (!state.currentPresentation) return state;
      
      const slides = [...state.currentPresentation.slides];
      const [movedSlide] = slides.splice(fromIndex, 1);
      slides.splice(toIndex, 0, movedSlide);
      
      // Update order property
      slides.forEach((slide, index) => {
        slide.order = index;
      });
      
      return {
        currentPresentation: {
          ...state.currentPresentation,
          slides
        }
      };
    }),
}));
