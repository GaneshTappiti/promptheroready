import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types for our idea and prompt system
export interface ActiveIdea {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'validated' | 'exploring' | 'archived';
  category?: string;
  tags: string[];
  validation_score?: number;
  market_opportunity?: string;
  risk_assessment?: string;
  monetization_strategy?: string;
  key_features?: string[];
  next_steps?: string[];
  competitor_analysis?: string;
  target_market?: string;
  problem_statement?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PromptData {
  id: string;
  prompt: string;
  response: string;
  timestamp: string;
  section: string;
  // Additional metadata for MVP Studio organization
  ideaId?: string;
  ideaTitle?: string;
  pageType?: string;
  appType?: string;
  tools?: string[];
}

export interface IdeaForgePrompts {
  targetUser?: PromptData;
  features?: PromptData;
  appStructure?: PromptData;
  uiDesign?: PromptData;
  pageMapping?: PromptData;
}

export interface MVPStudioPrompts {
  toolRecommendation?: PromptData;
  homepage?: PromptData;
  onboarding?: PromptData;
  dashboard?: PromptData;
  settings?: PromptData;
  mapping?: PromptData;
  [key: string]: PromptData | undefined;
}

export interface PromptHistory {
  ideaforge: IdeaForgePrompts;
  mvpStudio: MVPStudioPrompts;
}

export interface UserSettings {
  aiProvider: 'openai' | 'claude' | 'gemini' | 'deepseek';
  apiKey?: string;
  preferredTools: string[];
  budget: 'free' | 'low' | 'medium' | 'high';
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  appType: 'web' | 'mobile' | 'saas' | 'extension';
  // Subscription settings
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'inactive' | 'trial' | 'expired';
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
}

interface IdeaStore {
  // Active idea state
  activeIdea: ActiveIdea | null;
  setActiveIdea: (idea: ActiveIdea | null) => void;
  updateActiveIdea: (updates: Partial<ActiveIdea>) => void;
  
  // Prompt history
  promptHistory: PromptHistory;
  addPrompt: (section: 'ideaforge' | 'mvpStudio', key: string, prompt: PromptData) => void;
  getPrompt: (section: 'ideaforge' | 'mvpStudio', key: string) => PromptData | undefined;
  clearPromptHistory: () => void;
  
  // User settings
  userSettings: UserSettings;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  
  // Navigation state
  currentStep: 'workshop' | 'vault' | 'ideaforge' | 'mvpstudio';
  setCurrentStep: (step: 'workshop' | 'vault' | 'ideaforge' | 'mvpstudio') => void;
  
  // Free tier restrictions
  hasActiveIdea: boolean;
  setHasActiveIdea: (hasIdea: boolean) => void;
  canCreateNewIdea: () => boolean;
  canGeneratePrompts: () => boolean;
  canAccessFeature: (feature: 'workspace' | 'idea-vault' | 'ideaforge' | 'mvp-studio' | 'prompts' | 'export') => boolean;
  getPromptLimit: () => number;
  getRemainingPrompts: () => number;
  
  // Utility functions
  resetAll: () => void;
  exportPrompts: () => string;
  getPromptsByIdea: (ideaId: string, section?: 'ideaforge' | 'mvpStudio') => PromptData[];
  exportIdeaPrompts: (ideaId: string) => string;
}

const initialPromptHistory: PromptHistory = {
  ideaforge: {},
  mvpStudio: {}
};

const initialUserSettings: UserSettings = {
  aiProvider: 'gemini',
  preferredTools: [],
  budget: 'free',
  skillLevel: 'beginner',
  appType: 'web',
  subscriptionTier: 'free',
  subscriptionStatus: 'active'
};

export const useIdeaStore = create<IdeaStore>()(
  persist(
    (set, get) => ({
      // Active idea state
      activeIdea: null,
      setActiveIdea: (idea) => set({ activeIdea: idea }),
      updateActiveIdea: (updates) => set((state) => ({
        activeIdea: state.activeIdea ? { ...state.activeIdea, ...updates } : null
      })),
      
      // Prompt history
      promptHistory: initialPromptHistory,
      addPrompt: (section, key, prompt) => set((state) => ({
        promptHistory: {
          ...state.promptHistory,
          [section]: {
            ...state.promptHistory[section],
            [key]: prompt
          }
        }
      })),
      getPrompt: (section, key) => {
        const state = get();
        return state.promptHistory[section][key];
      },
      clearPromptHistory: () => set({ promptHistory: initialPromptHistory }),
      
      // User settings
      userSettings: initialUserSettings,
      updateUserSettings: (settings) => set((state) => ({
        userSettings: { ...state.userSettings, ...settings }
      })),
      
      // Navigation state
      currentStep: 'workshop',
      setCurrentStep: (step) => set({ currentStep: step }),
      
      // Free tier restrictions
      hasActiveIdea: false,
      setHasActiveIdea: (hasIdea) => set({ hasActiveIdea: hasIdea }),

      canCreateNewIdea: () => {
        const state = get();
        if (state.userSettings.subscriptionTier === 'pro' || state.userSettings.subscriptionTier === 'enterprise') {
          return true;
        }
        // Free tier: only 1 active idea at a time
        return !state.hasActiveIdea;
      },

      canGeneratePrompts: () => {
        const state = get();
        if (state.userSettings.subscriptionTier === 'pro' || state.userSettings.subscriptionTier === 'enterprise') {
          return true;
        }
        // Free tier: limited prompts
        return state.getRemainingPrompts() > 0;
      },

      canAccessFeature: (feature) => {
        const state = get();
        const isPro = state.userSettings.subscriptionTier === 'pro' || state.userSettings.subscriptionTier === 'enterprise';

        switch (feature) {
          case 'workspace':
          case 'idea-vault':
            // Workspace and Idea Vault are unlimited for everyone
            return true;

          case 'ideaforge':
          case 'mvp-studio':
            // These require an active idea but are accessible to free users
            return state.hasActiveIdea;

          case 'prompts':
            // Prompt generation has limits for free tier
            return isPro || state.getRemainingPrompts() > 0;

          case 'export':
            // Advanced export features are Pro only
            return isPro;

          default:
            return true;
        }
      },

      getPromptLimit: () => {
        const state = get();
        switch (state.userSettings.subscriptionTier) {
          case 'pro':
          case 'enterprise':
            return -1; // Unlimited
          case 'free':
          default:
            return 10; // 10 prompts per idea for free tier
        }
      },

      getRemainingPrompts: () => {
        const state = get();
        const limit = state.getPromptLimit();
        if (limit === -1) return -1; // Unlimited

        if (!state.activeIdea) return limit;

        const usedPrompts = state.getPromptsByIdea(state.activeIdea.id).length;
        return Math.max(0, limit - usedPrompts);
      },
      
      // Utility functions
      resetAll: () => set({
        activeIdea: null,
        promptHistory: initialPromptHistory,
        currentStep: 'workshop',
        hasActiveIdea: false
      }),
      
      exportPrompts: () => {
        const state = get();
        const allPrompts = {
          idea: state.activeIdea,
          ideaforge: state.promptHistory.ideaforge,
          mvpStudio: state.promptHistory.mvpStudio,
          exportedAt: new Date().toISOString()
        };
        return JSON.stringify(allPrompts, null, 2);
      },

      getPromptsByIdea: (ideaId: string, section?: 'ideaforge' | 'mvpStudio') => {
        const state = get();
        const allPrompts: PromptData[] = [];

        if (!section || section === 'ideaforge') {
          Object.values(state.promptHistory.ideaforge).forEach(prompt => {
            if (prompt && (prompt.ideaId === ideaId || prompt.section.includes(ideaId))) {
              allPrompts.push(prompt);
            }
          });
        }

        if (!section || section === 'mvpStudio') {
          Object.values(state.promptHistory.mvpStudio).forEach(prompt => {
            if (prompt && (prompt.ideaId === ideaId || prompt.section.includes(ideaId))) {
              allPrompts.push(prompt);
            }
          });
        }

        return allPrompts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },

      exportIdeaPrompts: (ideaId: string) => {
        const state = get();
        const ideaPrompts = state.getPromptsByIdea(ideaId);
        const organizedPrompts = {
          ideaId,
          ideaTitle: state.activeIdea?.title || 'Unknown',
          totalPrompts: ideaPrompts.length,
          ideaforgePrompts: ideaPrompts.filter(p => p.section.includes('ideaforge') || !p.ideaId),
          mvpStudioPrompts: ideaPrompts.filter(p => p.section.includes('mvpStudio') || p.ideaId),
          exportedAt: new Date().toISOString()
        };
        return JSON.stringify(organizedPrompts, null, 2);
      }
    }),
    {
      name: 'prompthero-idea-store',
      partialize: (state) => ({
        activeIdea: state.activeIdea,
        promptHistory: state.promptHistory,
        userSettings: state.userSettings,
        hasActiveIdea: state.hasActiveIdea
      })
    }
  )
);

// Helper hooks for specific sections
export const useActiveIdea = () => {
  const activeIdea = useIdeaStore((state) => state.activeIdea);
  const setActiveIdea = useIdeaStore((state) => state.setActiveIdea);
  const updateActiveIdea = useIdeaStore((state) => state.updateActiveIdea);
  return { activeIdea, setActiveIdea, updateActiveIdea };
};

export const usePromptHistory = () => {
  const promptHistory = useIdeaStore((state) => state.promptHistory);
  const addPrompt = useIdeaStore((state) => state.addPrompt);
  const getPrompt = useIdeaStore((state) => state.getPrompt);
  const clearPromptHistory = useIdeaStore((state) => state.clearPromptHistory);
  const exportPrompts = useIdeaStore((state) => state.exportPrompts);
  return { promptHistory, addPrompt, getPrompt, clearPromptHistory, exportPrompts };
};

export const useUserSettings = () => {
  const userSettings = useIdeaStore((state) => state.userSettings);
  const updateUserSettings = useIdeaStore((state) => state.updateUserSettings);
  return { userSettings, updateUserSettings };
};
