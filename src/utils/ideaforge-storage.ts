import { 
  IdeaDocument, 
  WikiSection, 
  FeatureNode, 
  ScreenMap, 
  TechStackItem, 
  JourneyEntry, 
  FeedbackItem 
} from '@/types/ideaforge';

// Storage keys
const STORAGE_KEYS = {
  IDEAS: 'ideaforge_ideas',
  WIKI: 'ideaforge_wiki',
  BLUEPRINT: 'ideaforge_blueprint',
  JOURNEY: 'ideaforge_journey',
  FEEDBACK: 'ideaforge_feedback',
  SETTINGS: 'ideaforge_settings'
} as const;

// Enhanced idea interface for storage
export interface StoredIdea extends IdeaDocument {
  status: 'draft' | 'researching' | 'validated' | 'building';
  progress: {
    wiki: number;
    blueprint: number;
    journey: number;
    feedback: number;
  };
}

export interface WikiData {
  ideaId: string;
  sections: WikiSection[];
  tags: string[];
  lastUpdated: string;
}

export interface BlueprintData {
  ideaId: string;
  appType: 'web' | 'mobile' | 'saas' | 'api' | 'agent';
  features: FeatureNode[];
  screens: ScreenMap[];
  techStack: TechStackItem[];
  generatedPrompts: {
    framework: string;
    uiPrompts: { screen: string; prompt: string }[];
  };
  lastUpdated: string;
}

export interface JourneyData {
  ideaId: string;
  entries: JourneyEntry[];
  lastUpdated: string;
}

export interface FeedbackData {
  ideaId: string;
  items: FeedbackItem[];
  clusters: Array<{
    id: string;
    theme: string;
    description: string;
    feedbackIds: string[];
    priority: 'high' | 'medium' | 'low';
    actionable: boolean;
  }>;
  insights: Array<{
    id: string;
    category: 'market-fit' | 'feature-validation' | 'pricing' | 'user-experience';
    insight: string;
    confidence: number;
    supportingFeedback: string[];
    recommendation: string;
  }>;
  lastUpdated: string;
}

// Storage utilities
class IdeaForgeStorage {
  // Ideas management
  static getIdeas(): StoredIdea[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.IDEAS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading ideas:', error);
      return [];
    }
  }

  static saveIdea(idea: StoredIdea): void {
    try {
      const ideas = this.getIdeas();
      const existingIndex = ideas.findIndex(i => i.id === idea.id);
      
      if (existingIndex >= 0) {
        ideas[existingIndex] = { ...idea, updatedAt: new Date().toISOString() };
      } else {
        ideas.unshift(idea);
      }
      
      localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
    } catch (error) {
      console.error('Error saving idea:', error);
    }
  }

  static deleteIdea(ideaId: string): void {
    try {
      const ideas = this.getIdeas().filter(i => i.id !== ideaId);
      localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
      
      // Clean up related data
      this.deleteWikiData(ideaId);
      this.deleteBlueprintData(ideaId);
      this.deleteJourneyData(ideaId);
      this.deleteFeedbackData(ideaId);
    } catch (error) {
      console.error('Error deleting idea:', error);
    }
  }

  // Wiki data management
  static getWikiData(ideaId: string): WikiData | null {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEYS.WIKI}_${ideaId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading wiki data:', error);
      return null;
    }
  }

  static saveWikiData(data: WikiData): void {
    try {
      const updatedData = { ...data, lastUpdated: new Date().toISOString() };
      localStorage.setItem(`${STORAGE_KEYS.WIKI}_${data.ideaId}`, JSON.stringify(updatedData));
      this.updateIdeaProgress(data.ideaId, 'wiki', this.calculateWikiProgress(data));
    } catch (error) {
      console.error('Error saving wiki data:', error);
    }
  }

  static deleteWikiData(ideaId: string): void {
    localStorage.removeItem(`${STORAGE_KEYS.WIKI}_${ideaId}`);
  }

  // Blueprint data management
  static getBlueprintData(ideaId: string): BlueprintData | null {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEYS.BLUEPRINT}_${ideaId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading blueprint data:', error);
      return null;
    }
  }

  static saveBlueprintData(data: BlueprintData): void {
    try {
      const updatedData = { ...data, lastUpdated: new Date().toISOString() };
      localStorage.setItem(`${STORAGE_KEYS.BLUEPRINT}_${data.ideaId}`, JSON.stringify(updatedData));
      this.updateIdeaProgress(data.ideaId, 'blueprint', this.calculateBlueprintProgress(data));
    } catch (error) {
      console.error('Error saving blueprint data:', error);
    }
  }

  static deleteBlueprintData(ideaId: string): void {
    localStorage.removeItem(`${STORAGE_KEYS.BLUEPRINT}_${ideaId}`);
  }

  // Journey data management
  static getJourneyData(ideaId: string): JourneyData | null {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEYS.JOURNEY}_${ideaId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading journey data:', error);
      return null;
    }
  }

  static saveJourneyData(data: JourneyData): void {
    try {
      const updatedData = { ...data, lastUpdated: new Date().toISOString() };
      localStorage.setItem(`${STORAGE_KEYS.JOURNEY}_${data.ideaId}`, JSON.stringify(updatedData));
      this.updateIdeaProgress(data.ideaId, 'journey', this.calculateJourneyProgress(data));
    } catch (error) {
      console.error('Error saving journey data:', error);
    }
  }

  static deleteJourneyData(ideaId: string): void {
    localStorage.removeItem(`${STORAGE_KEYS.JOURNEY}_${ideaId}`);
  }

  // Feedback data management
  static getFeedbackData(ideaId: string): FeedbackData | null {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEYS.FEEDBACK}_${ideaId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading feedback data:', error);
      return null;
    }
  }

  static saveFeedbackData(data: FeedbackData): void {
    try {
      const updatedData = { ...data, lastUpdated: new Date().toISOString() };
      localStorage.setItem(`${STORAGE_KEYS.FEEDBACK}_${data.ideaId}`, JSON.stringify(updatedData));
      this.updateIdeaProgress(data.ideaId, 'feedback', this.calculateFeedbackProgress(data));
    } catch (error) {
      console.error('Error saving feedback data:', error);
    }
  }

  static deleteFeedbackData(ideaId: string): void {
    localStorage.removeItem(`${STORAGE_KEYS.FEEDBACK}_${ideaId}`);
  }

  // Progress calculation helpers
  private static calculateWikiProgress(data: WikiData): number {
    if (!data.sections.length) return 0;
    const completedSections = data.sections.filter(s => 
      s.content.length > 100 && !s.content.includes('*')
    ).length;
    return Math.round((completedSections / data.sections.length) * 100);
  }

  private static calculateBlueprintProgress(data: BlueprintData): number {
    let progress = 0;
    if (data.appType) progress += 20;
    if (data.features.length > 0) progress += 30;
    if (data.screens.length > 0) progress += 25;
    if (data.techStack.length > 0) progress += 25;
    return Math.min(progress, 100);
  }

  private static calculateJourneyProgress(data: JourneyData): number {
    if (!data.entries.length) return 0;
    return Math.min(data.entries.length * 10, 100);
  }

  private static calculateFeedbackProgress(data: FeedbackData): number {
    if (!data.items.length) return 0;
    const actionedItems = data.items.filter(item => 
      item.status === 'actioned' || item.status === 'reviewed'
    ).length;
    return Math.round((actionedItems / data.items.length) * 100);
  }

  // Update idea progress
  private static updateIdeaProgress(
    ideaId: string, 
    module: 'wiki' | 'blueprint' | 'journey' | 'feedback', 
    progress: number
  ): void {
    const ideas = this.getIdeas();
    const ideaIndex = ideas.findIndex(i => i.id === ideaId);
    
    if (ideaIndex >= 0) {
      ideas[ideaIndex].progress[module] = progress;
      ideas[ideaIndex].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
    }
  }

  // Export functionality
  static exportIdeaData(ideaId: string): unknown {
    const idea = this.getIdeas().find(i => i.id === ideaId);
    const wiki = this.getWikiData(ideaId);
    const blueprint = this.getBlueprintData(ideaId);
    const journey = this.getJourneyData(ideaId);
    const feedback = this.getFeedbackData(ideaId);

    return {
      idea,
      wiki,
      blueprint,
      journey,
      feedback,
      exportedAt: new Date().toISOString()
    };
  }

  // Import functionality
  static importIdeaData(data: unknown): boolean {
    try {
      const dataObj = data as any;
      if (dataObj.idea) this.saveIdea(dataObj.idea);
      if (dataObj.wiki) this.saveWikiData(dataObj.wiki);
      if (dataObj.blueprint) this.saveBlueprintData(dataObj.blueprint);
      if (dataObj.journey) this.saveJourneyData(dataObj.journey);
      if (dataObj.feedback) this.saveFeedbackData(dataObj.feedback);
      return true;
    } catch (error) {
      console.error('Error importing idea data:', error);
      return false;
    }
  }
}

export default IdeaForgeStorage;
