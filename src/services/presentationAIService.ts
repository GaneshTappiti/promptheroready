// Presentation AI Service - Integrated with existing AI provider infrastructure

import { aiProviderService } from './aiProviderService';
import { AIRequest } from '@/types/aiProvider';
import { 
  OutlineGenerationRequest, 
  PresentationOutline, 
  SlideGenerationRequest,
  Slide,
  SlideElement,
  SlideLayout
} from '@/types/presentation';
import { nanoid } from 'nanoid';

export class PresentationAIService {
  /**
   * Generate presentation outline using user's configured AI provider
   */
  async generateOutline(
    userId: string, 
    request: OutlineGenerationRequest
  ): Promise<PresentationOutline> {
    const systemPrompt = `You are an expert presentation designer. Create a detailed presentation outline based on the user's requirements. 

Return a JSON object with the following structure:
{
  "title": "Presentation Title",
  "description": "Brief description of the presentation",
  "slides": [
    {
      "title": "Slide Title",
      "content": "Main content points for this slide",
      "layout": "title|content|two-column|image-text|full-image|quote|conclusion",
      "notes": "Speaker notes (optional)"
    }
  ],
  "estimatedDuration": 15,
  "targetAudience": "Target audience description",
  "objectives": ["Learning objective 1", "Learning objective 2"]
}

Guidelines:
- Create exactly ${request.numSlides} slides
- Use ${request.style} tone and style
- Target audience: ${request.targetAudience || 'general audience'}
- Language: ${request.language}
- Include a compelling title slide and conclusion slide
- Ensure logical flow between slides
- Provide actionable content points
- Suggest appropriate layouts for each slide`;

    const userPrompt = `Create a presentation about: ${request.topic}

Requirements:
- Number of slides: ${request.numSlides}
- Style: ${request.style}
- Language: ${request.language}
- Target audience: ${request.targetAudience || 'general audience'}
${request.objectives ? `- Objectives: ${request.objectives.join(', ')}` : ''}
${request.duration ? `- Duration: ${request.duration} minutes` : ''}

Please provide a comprehensive outline that covers all key aspects of the topic.`;

    const aiRequest: AIRequest = {
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 3000
    };

    try {
      const response = await aiProviderService.generateResponse(userId, aiRequest);
      
      // Parse the JSON response
      const cleanedContent = response.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const outline = JSON.parse(cleanedContent) as PresentationOutline;
      
      // Validate and ensure required fields
      if (!outline.title || !outline.slides || !Array.isArray(outline.slides)) {
        throw new Error('Invalid outline format received from AI');
      }

      // Ensure we have the right number of slides
      if (outline.slides.length !== request.numSlides) {
        console.warn(`AI generated ${outline.slides.length} slides instead of ${request.numSlides}`);
      }

      return outline;
    } catch (error) {
      console.error('Error generating outline:', error);
      throw new Error('Failed to generate presentation outline');
    }
  }

  /**
   * Generate individual slide content
   */
  async generateSlideContent(
    userId: string,
    request: SlideGenerationRequest
  ): Promise<Slide> {
    const slideInfo = request.outline.slides[request.slideIndex];
    if (!slideInfo) {
      throw new Error('Invalid slide index');
    }

    const systemPrompt = `You are an expert slide designer. Create detailed slide content based on the outline provided.

Return a JSON object with this structure:
{
  "id": "unique-id",
  "title": "Slide Title",
  "layout": "content|two-column|image-text|title|quote|conclusion",
  "elements": [
    {
      "id": "element-id",
      "type": "text|image|list|quote",
      "content": "Element content or description for images",
      "position": {
        "x": 0,
        "y": 0,
        "width": 100,
        "height": 50
      },
      "style": {}
    }
  ],
  "notes": "Detailed speaker notes",
  "duration": 60,
  "transition": "fade",
  "background": {
    "type": "color",
    "value": "#ffffff"
  },
  "order": 0
}

Guidelines:
- Create engaging, visual content
- Use appropriate layout for the content type
- Include speaker notes with talking points
- For images, provide detailed descriptions
- Keep text concise and impactful
- Use bullet points for lists
- Ensure content flows logically`;

    const userPrompt = `Create slide content for:
Title: ${slideInfo.title}
Content: ${slideInfo.content}
Layout: ${slideInfo.layout}
Slide ${request.slideIndex + 1} of ${request.outline.slides.length}

Context from presentation:
- Overall topic: ${request.outline.title}
- Target audience: ${request.outline.targetAudience}
- Presentation style: professional

Make this slide engaging and visually appealing while maintaining consistency with the overall presentation theme.`;

    const aiRequest: AIRequest = {
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.6,
      maxTokens: 2000
    };

    try {
      const response = await aiProviderService.generateResponse(userId, aiRequest);
      
      const cleanedContent = response.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const slideData = JSON.parse(cleanedContent);
      
      // Ensure required fields and generate IDs
      const slide: Slide = {
        id: slideData.id || nanoid(),
        title: slideData.title || slideInfo.title,
        layout: slideData.layout || slideInfo.layout || 'content',
        elements: this.processSlideElements(slideData.elements || []),
        notes: slideData.notes || slideInfo.notes || '',
        duration: slideData.duration || 60,
        transition: slideData.transition || 'fade',
        background: slideData.background || { type: 'color', value: '#ffffff' },
        order: request.slideIndex
      };

      return slide;
    } catch (error) {
      console.error('Error generating slide content:', error);
      
      // Fallback: create a basic slide
      return this.createFallbackSlide(slideInfo, request.slideIndex);
    }
  }

  /**
   * Generate complete presentation from outline
   */
  async generatePresentation(
    userId: string,
    outline: PresentationOutline,
    onProgress?: (current: number, total: number, message: string) => void
  ): Promise<Slide[]> {
    const slides: Slide[] = [];
    
    for (let i = 0; i < outline.slides.length; i++) {
      onProgress?.(i, outline.slides.length, `Generating slide ${i + 1}...`);
      
      try {
        const slide = await this.generateSlideContent(userId, {
          outline,
          slideIndex: i,
          theme: 'mystique', // Default theme
          includeImages: true
        });
        
        slides.push(slide);
        
        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error generating slide ${i + 1}:`, error);
        
        // Add fallback slide
        slides.push(this.createFallbackSlide(outline.slides[i], i));
      }
    }
    
    onProgress?.(outline.slides.length, outline.slides.length, 'Presentation generated!');
    return slides;
  }

  /**
   * Process and validate slide elements
   */
  private processSlideElements(elements: unknown[]): SlideElement[] {
    return elements.map((element, index) => ({
      id: element.id || nanoid(),
      type: element.type || 'text',
      content: element.content || '',
      position: {
        x: element.position?.x || 0,
        y: element.position?.y || (index * 20),
        width: element.position?.width || 100,
        height: element.position?.height || 20
      },
      style: element.style || {},
      animation: element.animation
    }));
  }

  /**
   * Create a fallback slide when AI generation fails
   */
  private createFallbackSlide(slideInfo: unknown, index: number): Slide {
    return {
      id: nanoid(),
      title: slideInfo.title || `Slide ${index + 1}`,
      layout: slideInfo.layout || 'content',
      elements: [
        {
          id: nanoid(),
          type: 'text',
          content: slideInfo.content || 'Content will be added here.',
          position: { x: 10, y: 20, width: 80, height: 60 },
          style: { fontSize: '18px', color: '#333' }
        }
      ],
      notes: slideInfo.notes || '',
      duration: 60,
      transition: 'fade',
      background: { type: 'color', value: '#ffffff' },
      order: index
    };
  }

  /**
   * Enhance existing slide with AI suggestions
   */
  async enhanceSlide(
    userId: string,
    slide: Slide,
    enhancement: 'improve-content' | 'add-visuals' | 'optimize-layout'
  ): Promise<Slide> {
    const systemPrompt = `You are an expert presentation designer. Enhance the provided slide based on the requested improvement type.

Return the enhanced slide as JSON with the same structure as the input.

Enhancement type: ${enhancement}

Guidelines:
- improve-content: Make text more engaging, add bullet points, improve clarity
- add-visuals: Suggest image placements, charts, or visual elements
- optimize-layout: Improve element positioning and visual hierarchy`;

    const userPrompt = `Enhance this slide:
${JSON.stringify(slide, null, 2)}

Focus on: ${enhancement}
Keep the same overall structure but improve the specified aspect.`;

    const aiRequest: AIRequest = {
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.5,
      maxTokens: 2000
    };

    try {
      const response = await aiProviderService.generateResponse(userId, aiRequest);
      
      const cleanedContent = response.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const enhancedSlide = JSON.parse(cleanedContent);
      
      return {
        ...slide,
        ...enhancedSlide,
        id: slide.id, // Preserve original ID
        order: slide.order // Preserve original order
      };
    } catch (error) {
      console.error('Error enhancing slide:', error);
      return slide; // Return original slide if enhancement fails
    }
  }
}

export const presentationAIService = new PresentationAIService();
