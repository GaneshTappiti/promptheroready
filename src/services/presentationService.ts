// Presentation Service - Main service for presentation management

import { 
  Presentation, 
  PresentationDocument, 
  OutlineGenerationRequest,
  CreatePresentationRequest,
  UpdatePresentationRequest,
  Slide
} from '@/types/presentation';
import { docsDecksHelpers } from '@/lib/database-helpers';
import { presentationAIService } from './presentationAIService';
import { nanoid } from 'nanoid';

export class PresentationService {
  /**
   * Create a new presentation
   */
  async createPresentation(
    userId: string, 
    request: CreatePresentationRequest
  ): Promise<{ data: PresentationDocument | null; error: any }> {
    try {
      const presentation: Presentation = {
        id: nanoid(),
        title: request.title,
        description: request.description,
        theme: request.theme,
        customTheme: request.customTheme,
        style: request.style,
        pageStyle: request.pageStyle,
        language: request.language,
        totalSlides: 0,
        estimatedDuration: request.estimatedDuration,
        targetAudience: request.targetAudience,
        tags: request.tags || [],
        isPublic: request.isPublic,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId,
        ideaId: request.ideaId,
        slides: [],
        settings: {
          autoAdvance: false,
          showNotes: true,
          showProgress: true,
          allowNavigation: true,
          loop: false
        }
      };

      const { data, error } = await docsDecksHelpers.createPresentation({
        title: presentation.title,
        content: JSON.stringify(presentation),
        user_id: userId,
        idea_id: request.ideaId,
        metadata: {
          presentation: {
            id: presentation.id,
            title: presentation.title,
            theme: presentation.theme,
            style: presentation.style,
            totalSlides: 0,
            status: 'draft',
            createdAt: presentation.createdAt,
            updatedAt: presentation.updatedAt,
            userId,
            isPublic: presentation.isPublic
          },
          generation: {},
          analytics: {
            views: 0,
            downloads: 0,
            shares: 0
          }
        }
      });

      return { data, error };
    } catch (error) {
      console.error('Error creating presentation:', error);
      return { data: null, error };
    }
  }

  /**
   * Get presentation by ID
   */
  async getPresentation(
    id: string, 
    userId: string
  ): Promise<{ data: Presentation | null; error: any }> {
    try {
      const { data, error } = await docsDecksHelpers.getPresentation(id, userId);
      
      if (error || !data) {
        return { data: null, error };
      }

      const presentation = JSON.parse(data.content) as Presentation;
      return { data: presentation, error: null };
    } catch (error) {
      console.error('Error getting presentation:', error);
      return { data: null, error };
    }
  }

  /**
   * Update presentation
   */
  async updatePresentation(
    id: string,
    userId: string,
    updates: Partial<Presentation>
  ): Promise<{ data: Presentation | null; error: any }> {
    try {
      // First get the current presentation document to access metadata
      const { data: currentDoc, error: fetchDocError } = await docsDecksHelpers.getDocument(id, userId);

      if (fetchDocError || !currentDoc) {
        return { data: null, error: fetchDocError || new Error('Presentation not found') };
      }

      // Parse the current presentation
      const current = JSON.parse(currentDoc.content) as Presentation;

      // Merge updates
      const updatedPresentation: Presentation = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString(),
        totalSlides: updates.slides ? updates.slides.length : current.totalSlides
      };

      // Update in database
      const { data, error } = await docsDecksHelpers.updatePresentation(id, {
        title: updatedPresentation.title,
        content: JSON.stringify(updatedPresentation),
        status: updatedPresentation.status,
        metadata: {
          presentation: {
            id: updatedPresentation.id,
            title: updatedPresentation.title,
            theme: updatedPresentation.theme,
            style: updatedPresentation.style,
            totalSlides: updatedPresentation.totalSlides,
            status: updatedPresentation.status,
            createdAt: updatedPresentation.createdAt,
            updatedAt: updatedPresentation.updatedAt,
            userId: updatedPresentation.userId,
            isPublic: updatedPresentation.isPublic
          },
          generation: currentDoc.metadata?.generation || {},
          analytics: currentDoc.metadata?.analytics || { views: 0, downloads: 0, shares: 0 }
        }
      });

      if (error) {
        return { data: null, error };
      }

      return { data: updatedPresentation, error: null };
    } catch (error) {
      console.error('Error updating presentation:', error);
      return { data: null, error };
    }
  }

  /**
   * Get user's presentations
   */
  async getUserPresentations(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: string;
      search?: string;
    }
  ): Promise<{ data: Presentation[] | null; error: any }> {
    try {
      const { data, error } = await docsDecksHelpers.getPresentations(userId, options);
      
      if (error) {
        return { data: null, error };
      }

      const presentations = data?.map(doc => {
        try {
          return JSON.parse(doc.content) as Presentation;
        } catch (parseError) {
          console.error('Error parsing presentation content:', parseError);
          return null;
        }
      }).filter(Boolean) as Presentation[];

      return { data: presentations || [], error: null };
    } catch (error) {
      console.error('Error getting user presentations:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete presentation
   */
  async deletePresentation(
    id: string, 
    userId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await docsDecksHelpers.deletePresentation(id, userId);
      return { success: !error, error };
    } catch (error) {
      console.error('Error deleting presentation:', error);
      return { success: false, error };
    }
  }

  /**
   * Duplicate presentation
   */
  async duplicatePresentation(
    id: string,
    userId: string,
    newTitle?: string
  ): Promise<{ data: PresentationDocument | null; error: any }> {
    try {
      const { data, error } = await docsDecksHelpers.duplicatePresentation(id, userId, newTitle);
      return { data, error };
    } catch (error) {
      console.error('Error duplicating presentation:', error);
      return { data: null, error };
    }
  }

  /**
   * Generate presentation from AI
   */
  async generatePresentationFromAI(
    userId: string,
    request: OutlineGenerationRequest,
    onProgress?: (stage: string, current: number, total: number, message: string) => void
  ): Promise<{ data: Presentation | null; error: any }> {
    try {
      // Step 1: Generate outline
      onProgress?.('outline', 0, 2, 'Generating presentation outline...');
      
      const outline = await presentationAIService.generateOutline(userId, request);
      
      // Step 2: Generate slides
      onProgress?.('slides', 1, 2, 'Generating slides...');
      
      const slides = await presentationAIService.generatePresentation(
        userId,
        outline,
        (current, total, message) => {
          onProgress?.('slides', current, total, message);
        }
      );

      // Step 3: Create presentation object
      const presentation: Presentation = {
        id: nanoid(),
        title: outline.title,
        description: outline.description,
        theme: 'mystique',
        style: request.style,
        pageStyle: 'default',
        language: request.language,
        totalSlides: slides.length,
        estimatedDuration: outline.estimatedDuration,
        targetAudience: outline.targetAudience,
        tags: [],
        isPublic: false,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId,
        slides,
        outline,
        settings: {
          autoAdvance: false,
          showNotes: true,
          showProgress: true,
          allowNavigation: true,
          loop: false
        }
      };

      onProgress?.('complete', 2, 2, 'Presentation generated successfully!');
      
      return { data: presentation, error: null };
    } catch (error) {
      console.error('Error generating presentation:', error);
      return { data: null, error };
    }
  }

  /**
   * Save generated presentation to database
   */
  async saveGeneratedPresentation(
    userId: string,
    presentation: Presentation,
    ideaId?: string
  ): Promise<{ data: PresentationDocument | null; error: any }> {
    try {
      const { data, error } = await docsDecksHelpers.createPresentation({
        title: presentation.title,
        content: JSON.stringify(presentation),
        user_id: userId,
        idea_id: ideaId,
        metadata: {
          presentation: {
            id: presentation.id,
            title: presentation.title,
            theme: presentation.theme,
            style: presentation.style,
            totalSlides: presentation.totalSlides,
            status: presentation.status,
            createdAt: presentation.createdAt,
            updatedAt: presentation.updatedAt,
            userId,
            isPublic: presentation.isPublic
          },
          generation: {
            generatedAt: new Date().toISOString(),
            aiProvider: 'user-configured',
            outline: presentation.outline
          },
          analytics: {
            views: 0,
            downloads: 0,
            shares: 0
          }
        }
      });

      return { data, error };
    } catch (error) {
      console.error('Error saving generated presentation:', error);
      return { data: null, error };
    }
  }

  /**
   * Update slide in presentation
   */
  async updateSlide(
    presentationId: string,
    userId: string,
    slideId: string,
    updates: Partial<Slide>
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { data: presentation, error: fetchError } = await this.getPresentation(presentationId, userId);
      
      if (fetchError || !presentation) {
        return { success: false, error: fetchError || new Error('Presentation not found') };
      }

      const updatedSlides = presentation.slides.map(slide =>
        slide.id === slideId ? { ...slide, ...updates } : slide
      );

      const { error } = await this.updatePresentation(presentationId, userId, {
        slides: updatedSlides
      });

      return { success: !error, error };
    } catch (error) {
      console.error('Error updating slide:', error);
      return { success: false, error };
    }
  }
}

export const presentationService = new PresentationService();
