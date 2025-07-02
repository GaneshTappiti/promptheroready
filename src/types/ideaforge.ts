
export interface IdeaDocument {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  favorited?: boolean;
}

export interface IdeaInput {
  title: string;
  description?: string;
  tags?: string[];
  coverImage?: string;
}

export interface BlueprintSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Phase {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  duration: string;
  progress: number;
}

export interface Task {
  id: number;
  title: string;
  status: "completed" | "in-progress" | "pending";
}

export type ViewMode = "wiki" | "blueprint" | "journey" | "feedback";

// MVP Wizard Types
export type AppType = "web-app" | "mobile-app" | "saas-tool" | "chrome-extension" | "ai-app";
export type UITheme = "dark" | "light";
export type DesignStyle = "minimal" | "playful" | "business";
export type Platform = "android" | "ios" | "web" | "cross-platform";

export interface MVPWizardStep1 {
  appName: string;
  appType: AppType;
}

export interface MVPWizardStep2 {
  theme: UITheme;
  designStyle: DesignStyle;
}

export interface MVPWizardStep3 {
  platforms: Platform[];
}

export interface MVPWizardStep4 {
  selectedAI: string; // AI provider ID
}

export interface MVPWizardData {
  step1: MVPWizardStep1;
  step2: MVPWizardStep2;
  step3: MVPWizardStep3;
  step4: MVPWizardStep4;
  userPrompt: string;
}

export interface MVPAnalysisResult {
  pages: MVPPage[];
  navigation: NavigationFlow;
  components: ComponentDescription[];
  styling: StylingGuide;
  recommendedTools: RecommendedTool[];
  uiPrompt: string;
  launchPath: LaunchStep[];
  // New prompt-by-prompt structure
  frameworkPrompt?: string;
  pagePrompts?: PagePrompt[];
  linkingPrompt?: string;
  currentStep?: 'framework' | 'pages' | 'linking' | 'complete';
  currentPageIndex?: number;
}

export interface MVPPage {
  name: string;
  description: string;
  components: string[];
  layout: string;
}

export interface NavigationFlow {
  type: "sidebar" | "bottom-tabs" | "top-tabs" | "drawer";
  structure: NavigationItem[];
}

export interface NavigationItem {
  name: string;
  icon?: string;
  children?: NavigationItem[];
}

export interface ComponentDescription {
  name: string;
  type: string;
  description: string;
  props?: Record<string, any>;
}

export interface StylingGuide {
  theme: UITheme;
  designStyle: DesignStyle;
  colorScheme: string[];
  typography: string;
  spacing: string;
}

export interface RecommendedTool {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string[];
  pricing: "free" | "freemium" | "paid";
  url: string;
  logoUrl?: string;
  priority: number;
}

export interface LaunchStep {
  step: number;
  title: string;
  description: string;
  estimatedTime: string;
  tools: string[];
}

export interface PagePrompt {
  pageName: string;
  prompt: string;
  components: string[];
  layout: string;
  generated?: boolean;
  builderSpecific?: Record<string, string>; // Different prompts for different builders
}

export interface BuilderTool {
  name: string;
  type: 'web' | 'mobile' | 'cross-platform';
  description: string;
  url: string;
  openUrl?: string;
  icon?: string;
  bestFor: string[];
}

// Enhanced IdeaForge Types
export interface IdeaStatus {
  value: 'draft' | 'researching' | 'validated' | 'building';
  label: string;
  color: string;
}

export interface WikiSection {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
  isExpanded: boolean;
  aiGenerated?: boolean;
}

export interface WikiVersion {
  id: string;
  timestamp: string;
  changes: string;
  author: string;
}

export interface FeatureNode {
  id: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'in-progress' | 'completed';
  children: FeatureNode[];
  linkedFeedback?: string[];
}

export interface ScreenMap {
  id: string;
  name: string;
  role: string;
  function: string;
  components: string[];
  notes: string;
  uiPrompt?: string;
}

export interface TechStackItem {
  category: 'frontend' | 'backend' | 'database' | 'ai' | 'deployment' | 'analytics';
  name: string;
  description: string;
  reason: string;
  alternatives: string[];
  selected: boolean;
}

export interface JourneyEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  type: 'insight' | 'pivot' | 'validation' | 'blocked' | 'breakthrough' | 'reflection';
  emotion?: 'excited' | 'confident' | 'worried' | 'frustrated' | 'motivated' | 'uncertain';
  tags: string[];
  linkedToBlueprint?: string;
  aiGenerated?: boolean;
}

export interface FeedbackItem {
  id: string;
  source: 'user-interview' | 'mentor' | 'ai' | 'survey' | 'discord' | 'email' | 'form';
  type: 'positive' | 'negative' | 'feature-request' | 'confusion' | 'validation' | 'concern';
  status: 'new' | 'reviewed' | 'actioned' | 'archived' | 'rejected';
  title: string;
  content: string;
  author: string;
  authorEmail?: string;
  date: string;
  tags: string[];
  linkedFeature?: string;
  priority: 'high' | 'medium' | 'low';
  sentiment: number; // -1 to 1
  aiGenerated?: boolean;
}

// AI Tool Recommender Types
export type AIToolCategory =
  | 'chatbots'
  | 'ui-ux'
  | 'dev-ides'
  | 'app-builders'
  | 'backend'
  | 'local-tools'
  | 'workflow'
  | 'deployment'
  | 'knowledge';

export interface AITool {
  id: string;
  name: string;
  category: AIToolCategory;
  description: string;
  features: string[];
  pricing: {
    free?: boolean;
    freemium?: boolean;
    paid?: boolean;
    priceINR?: string;
    details?: string;
  };
  url: string;
  logoUrl?: string;
  rating: number; // 1-5
  tags: string[];
  bestFor: string[];
  pros: string[];
  cons: string[];
  integrations?: string[];
  supportedPlatforms: ('web' | 'mobile' | 'desktop' | 'api')[];
}

export interface AIToolRecommendation {
  tool: AITool;
  score: number; // 0-100
  reason: string;
  matchedCriteria: string[];
}

export interface UserPreferences {
  appType: AppType;
  designStyle: DesignStyle;
  codingApproach: 'no-code' | 'low-code' | 'full-code';
  budget: 'free' | 'budget' | 'premium';
  teamSize: 'solo' | 'small' | 'medium' | 'large';
  experience: 'beginner' | 'intermediate' | 'expert';
  priorities: ('speed' | 'customization' | 'cost' | 'scalability' | 'ease-of-use')[];
}
