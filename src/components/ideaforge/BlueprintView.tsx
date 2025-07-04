
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Globe,
  Smartphone,
  Zap,
  Brain,
  Plus,
  ChevronDown,
  ChevronRight,
  Settings,
  Code,
  Database,
  Cloud,
  Layout,
  Edit,
  Trash2,
  Copy,
  Download,
  Sparkles,
  TreePine,
  Eye,
  Map,
  Layers,
  FileText
} from "lucide-react";

// Blueprint Types
type AppType = 'web' | 'mobile' | 'saas' | 'api' | 'agent';
type TechCategory = 'frontend' | 'backend' | 'database' | 'ai' | 'deployment' | 'tools';

interface FeatureNode {
  id: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'in-progress' | 'completed';
  children: FeatureNode[];
  isExpanded: boolean;
}

interface ScreenMap {
  id: string;
  name: string;
  role: string;
  function: string;
  components: string[];
  notes: string;
}

interface TechStackItem {
  category: TechCategory;
  name: string;
  description: string;
  reason: string;
  alternatives: string[];
}

interface BlueprintData {
  appType: AppType;
  features: FeatureNode[];
  screens: ScreenMap[];
  techStack: TechStackItem[];
  generatedPrompts: {
    framework: string;
    uiPrompts: { screen: string; prompt: string }[];
  };
}

interface BlueprintViewProps {
  ideaId: string;
}

const BlueprintView: React.FC<BlueprintViewProps> = ({ ideaId }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);

  // Blueprint state
  const [blueprint, setBlueprint] = useState<BlueprintData>({
    appType: 'mobile',
    features: [
      {
        id: 'core',
        name: 'Core Features',
        description: 'Essential functionality for MVP',
        priority: 'high',
        status: 'planned',
        isExpanded: true,
        children: [
          {
            id: 'inventory',
            name: 'Inventory Tracking',
            description: 'Track grocery items and expiry dates',
            priority: 'high',
            status: 'planned',
            isExpanded: false,
            children: [
              {
                id: 'barcode',
                name: 'Barcode Scanning',
                description: 'Scan product barcodes for easy entry',
                priority: 'high',
                status: 'planned',
                isExpanded: false,
                children: []
              },
              {
                id: 'manual-entry',
                name: 'Manual Entry',
                description: 'Manually add items to inventory',
                priority: 'medium',
                status: 'planned',
                isExpanded: false,
                children: []
              }
            ]
          },
          {
            id: 'notifications',
            name: 'Expiry Notifications',
            description: 'Alert users about expiring items',
            priority: 'high',
            status: 'planned',
            isExpanded: false,
            children: []
          }
        ]
      },
      {
        id: 'ai-features',
        name: 'AI Features',
        description: 'Smart recommendations and insights',
        priority: 'medium',
        status: 'planned',
        isExpanded: false,
        children: [
          {
            id: 'recipe-suggestions',
            name: 'Recipe Suggestions',
            description: 'AI-powered recipe recommendations',
            priority: 'medium',
            status: 'planned',
            isExpanded: false,
            children: []
          },
          {
            id: 'shopping-list',
            name: 'Smart Shopping List',
            description: 'Auto-generate shopping lists',
            priority: 'low',
            status: 'planned',
            isExpanded: false,
            children: []
          }
        ]
      }
    ],
    screens: [
      {
        id: 'home',
        name: 'Home Dashboard',
        role: 'Main',
        function: 'Overview of inventory and quick actions',
        components: ['Header', 'Inventory Summary', 'Quick Actions', 'Recent Items'],
        notes: 'Primary entry point with key metrics'
      },
      {
        id: 'inventory',
        name: 'Inventory List',
        role: 'Core',
        function: 'Display all grocery items with filters',
        components: ['Search Bar', 'Filter Chips', 'Item Cards', 'Add Button'],
        notes: 'Main inventory management screen'
      },
      {
        id: 'add-item',
        name: 'Add Item',
        role: 'Action',
        function: 'Add new grocery items to inventory',
        components: ['Camera Scanner', 'Manual Form', 'Save Button'],
        notes: 'Support both barcode scanning and manual entry'
      },
      {
        id: 'recipes',
        name: 'Recipe Suggestions',
        role: 'Feature',
        function: 'Show AI-generated recipe recommendations',
        components: ['Recipe Cards', 'Ingredients Match', 'Cooking Time'],
        notes: 'AI-powered based on available ingredients'
      }
    ],
    techStack: [
      {
        category: 'frontend',
        name: 'React Native',
        description: 'Cross-platform mobile development',
        reason: 'Single codebase for iOS and Android',
        alternatives: ['Flutter', 'Native iOS/Android']
      },
      {
        category: 'backend',
        name: 'Firebase',
        description: 'Backend-as-a-Service platform',
        reason: 'Quick setup, real-time database, authentication',
        alternatives: ['Supabase', 'AWS Amplify']
      },
      {
        category: 'database',
        name: 'Firestore',
        description: 'NoSQL document database',
        reason: 'Real-time sync, offline support',
        alternatives: ['PostgreSQL', 'MongoDB']
      },
      {
        category: 'ai',
        name: 'OpenAI GPT',
        description: 'AI for recipe suggestions',
        reason: 'Advanced natural language processing',
        alternatives: ['Google Gemini', 'Claude']
      }
    ],
    generatedPrompts: {
      framework: '',
      uiPrompts: []
    }
  });

  useEffect(() => {
    // Initialize blueprint data for the specific idea
    console.log('Initializing blueprint for idea:', ideaId);
  }, [ideaId]);

  // Helper functions
  const appTypes = [
    { value: 'web', label: 'Web App', icon: Globe, description: 'Browser-based application' },
    { value: 'mobile', label: 'Mobile App', icon: Smartphone, description: 'iOS/Android application' },
    { value: 'saas', label: 'SaaS Platform', icon: Zap, description: 'Software as a Service' },
    { value: 'api', label: 'API Service', icon: Code, description: 'Backend API service' },
    { value: 'agent', label: 'AI Agent', icon: Brain, description: 'AI-powered agent' }
  ];

  const techCategories = [
    { id: 'frontend', label: 'Frontend', icon: Layout, color: 'bg-blue-500' },
    { id: 'backend', label: 'Backend', icon: Database, color: 'bg-green-500' },
    { id: 'database', label: 'Database', icon: Database, color: 'bg-purple-500' },
    { id: 'ai', label: 'AI/ML', icon: Brain, color: 'bg-orange-500' },
    { id: 'deployment', label: 'Deployment', icon: Cloud, color: 'bg-red-500' },
    { id: 'tools', label: 'Tools', icon: Settings, color: 'bg-gray-500' }
  ];

  const toggleFeatureExpansion = (featureId: string, parentPath: string[] = []) => {
    const updateFeatures = (features: FeatureNode[], path: string[]): FeatureNode[] => {
      return features.map(feature => {
        if (path.length === 0 && feature.id === featureId) {
          return { ...feature, isExpanded: !feature.isExpanded };
        } else if (path.length > 0 && feature.id === path[0]) {
          return {
            ...feature,
            children: updateFeatures(feature.children, path.slice(1))
          };
        }
        return feature;
      });
    };

    setBlueprint(prev => ({
      ...prev,
      features: updateFeatures(prev.features, parentPath)
    }));
  };

  const addFeature = (parentPath: string[] = []) => {
    const newFeature: FeatureNode = {
      id: `feature-${Date.now()}`,
      name: 'New Feature',
      description: 'Feature description',
      priority: 'medium',
      status: 'planned',
      isExpanded: false,
      children: []
    };

    const addToFeatures = (features: FeatureNode[], path: string[]): FeatureNode[] => {
      if (path.length === 0) {
        return [...features, newFeature];
      }

      return features.map(feature => {
        if (feature.id === path[0]) {
          return {
            ...feature,
            children: addToFeatures(feature.children, path.slice(1))
          };
        }
        return feature;
      });
    };

    setBlueprint(prev => ({
      ...prev,
      features: addToFeatures(prev.features, parentPath)
    }));
  };

  const addScreen = () => {
    const newScreen: ScreenMap = {
      id: `screen-${Date.now()}`,
      name: 'New Screen',
      role: 'Feature',
      function: 'Screen function',
      components: [],
      notes: ''
    };

    setBlueprint(prev => ({
      ...prev,
      screens: [...prev.screens, newScreen]
    }));
  };

  const addTechStackItem = (category: TechCategory) => {
    const newItem: TechStackItem = {
      category,
      name: 'New Technology',
      description: 'Technology description',
      reason: 'Why this technology',
      alternatives: []
    };

    setBlueprint(prev => ({
      ...prev,
      techStack: [...prev.techStack, newItem]
    }));
  };

  const generateFramework = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const frameworkPrompt = `# ${blueprint.appType.toUpperCase()} App Framework

## App Type: ${appTypes.find(t => t.value === blueprint.appType)?.label}

## Core Architecture
- **Frontend**: ${blueprint.techStack.find(t => t.category === 'frontend')?.name || 'React Native'}
- **Backend**: ${blueprint.techStack.find(t => t.category === 'backend')?.name || 'Firebase'}
- **Database**: ${blueprint.techStack.find(t => t.category === 'database')?.name || 'Firestore'}

## Feature Structure
${blueprint.features.map(feature => `
### ${feature.name}
${feature.description}
Priority: ${feature.priority}
${feature.children.map(child => `- ${child.name}: ${child.description}`).join('\n')}
`).join('\n')}

## Screen Flow
${blueprint.screens.map(screen => `
**${screen.name}** (${screen.role})
- Function: ${screen.function}
- Components: ${screen.components.join(', ')}
`).join('\n')}

## Tech Stack Rationale
${blueprint.techStack.map(tech => `
**${tech.name}** (${tech.category})
- ${tech.description}
- Why: ${tech.reason}
- Alternatives: ${tech.alternatives.join(', ')}
`).join('\n')}`;

      const uiPrompts = blueprint.screens.map(screen => ({
        screen: screen.name,
        prompt: `Create a ${blueprint.appType} screen for "${screen.name}":

**Purpose**: ${screen.function}
**Role**: ${screen.role} screen
**Components needed**: ${screen.components.join(', ')}

**Design Requirements**:
- Follow ${blueprint.appType} design patterns
- Use ${blueprint.techStack.find(t => t.category === 'frontend')?.name || 'modern'} components
- Ensure responsive design
- Include proper navigation
- Add loading states and error handling

**Notes**: ${screen.notes}

Make it user-friendly and intuitive for the target audience.`
      }));

      setBlueprint(prev => ({
        ...prev,
        generatedPrompts: {
          framework: frameworkPrompt,
          uiPrompts
        }
      }));

      toast({
        title: "Framework Generated!",
        description: "Your app framework and UI prompts are ready."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate framework. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`
    });
  };

  const exportToMVPStudio = () => {
    // This would integrate with MVP Studio
    toast({
      title: "Exported to MVP Studio",
      description: "Your blueprint has been sent to MVP Studio for building."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">🧩 Product Blueprint</h2>
          <p className="text-muted-foreground">
            Define your product structure, tech stack, and UI approach
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPromptModal(true)}
            disabled={!blueprint.generatedPrompts.framework}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Prompts
          </Button>
          <Button
            onClick={generateFramework}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Framework
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">App Type</TabsTrigger>
          <TabsTrigger value="features">Feature Tree</TabsTrigger>
          <TabsTrigger value="screens">Screen Map</TabsTrigger>
          <TabsTrigger value="tech">Tech Stack</TabsTrigger>
        </TabsList>

        {/* App Type Selection */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                App Type Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={blueprint.appType}
                onValueChange={(value) => setBlueprint(prev => ({ ...prev, appType: value as AppType }))}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {appTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label htmlFor={type.value} className="flex items-center gap-3 cursor-pointer flex-1">
                      <type.icon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {blueprint.generatedPrompts.framework && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generated Framework
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-64">
                    {blueprint.generatedPrompts.framework.substring(0, 500)}...
                  </pre>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(blueprint.generatedPrompts.framework, "Framework")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Framework
                  </Button>
                  <Button onClick={exportToMVPStudio}>
                    <Download className="h-4 w-4 mr-2" />
                    Export to MVP Studio
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Feature Tree */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5" />
                  Feature Tree
                </CardTitle>
                <Button size="sm" onClick={() => addFeature()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {blueprint.features.map((feature) => (
                  <FeatureTreeNodeComponent
                    key={feature.id}
                    feature={feature}
                    level={0}
                    onToggle={() => toggleFeatureExpansion(feature.id)}
                    onAddChild={() => addFeature([feature.id])}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Screen Mapping */}
        <TabsContent value="screens" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Screen Mapping
                </CardTitle>
                <Button size="sm" onClick={addScreen}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Screen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Screen Name</th>
                      <th className="text-left p-3 font-medium">Role</th>
                      <th className="text-left p-3 font-medium">Function</th>
                      <th className="text-left p-3 font-medium">Components</th>
                      <th className="text-left p-3 font-medium">Notes</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blueprint.screens.map((screen) => (
                      <tr key={screen.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{screen.name}</td>
                        <td className="p-3">
                          <Badge variant="outline">{screen.role}</Badge>
                        </td>
                        <td className="p-3 text-sm">{screen.function}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {screen.components.map((component, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {component}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground max-w-48 truncate">
                          {screen.notes}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tech Stack */}
        <TabsContent value="tech" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {techCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className={`p-1 rounded ${category.color} text-white`}>
                        <category.icon className="h-4 w-4" />
                      </div>
                      {category.label}
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addTechStackItem(category.id as TechCategory)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {blueprint.techStack
                    .filter(tech => tech.category === category.id)
                    .map((tech, idx) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="font-medium text-sm mb-1">{tech.name}</div>
                        <div className="text-xs text-muted-foreground mb-2">{tech.description}</div>
                        <div className="text-xs">
                          <span className="font-medium">Why:</span> {tech.reason}
                        </div>
                        {tech.alternatives.length > 0 && (
                          <div className="text-xs mt-1">
                            <span className="font-medium">Alternatives:</span> {tech.alternatives.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Generated Prompts Modal */}
      <Dialog open={showPromptModal} onOpenChange={setShowPromptModal}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Generated UI Prompts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {blueprint.generatedPrompts.uiPrompts.map((prompt, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{prompt.screen}</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(prompt.prompt, `${prompt.screen} prompt`)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg overflow-auto max-h-64">
                    {prompt.prompt}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Feature Tree Node Component
const FeatureTreeNodeComponent: React.FC<{
  feature: FeatureNode;
  level: number;
  onToggle: () => void;
  onAddChild: () => void;
}> = ({ feature, level, onToggle, onAddChild }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      case 'planned': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  // Fix dynamic margin class issue
  const getMarginClass = (level: number) => {
    switch (level) {
      case 0: return '';
      case 1: return 'ml-4';
      case 2: return 'ml-8';
      case 3: return 'ml-12';
      default: return 'ml-16';
    }
  };

  return (
    <div className={getMarginClass(level)}>
      <div className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-lg">
        {feature.children.length > 0 && (
          <button onClick={onToggle} className="p-1">
            {feature.isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        <div className="flex-1 flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${getPriorityColor(feature.priority)}`} />
          <div className="flex-1">
            <div className="font-medium text-sm">{feature.name}</div>
            <div className="text-xs text-muted-foreground">{feature.description}</div>
          </div>
          <Badge variant="outline" className={getStatusColor(feature.status)}>
            {feature.status}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {feature.priority}
          </Badge>
        </div>
        <Button size="sm" variant="ghost" onClick={onAddChild}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {feature.isExpanded && feature.children.map((child) => (
        <FeatureTreeNodeComponent
          key={child.id}
          feature={child}
          level={level + 1}
          onToggle={() => {}} // Handle nested toggle
          onAddChild={() => {}} // Handle nested add
        />
      ))}
    </div>
  );
};

export default BlueprintView;
