import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
// Removed unused imports
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
// Removed unused DropdownMenu imports
import WorkspaceSidebar, { SidebarToggle } from "@/components/WorkspaceSidebar";
import {
  PlusCircle,
  ChevronLeft,
  // Removed unused icons
  Lightbulb,
  BookOpen,
  Layers,
  GitBranch,
  MessageSquare,
  Rocket,
  FileText,
  Share2,
  Settings
} from "lucide-react";
import { IdeaInput } from "@/types/ideaforge";
import NewIdeaModal from "@/components/ideaforge/NewIdeaModal";
import IdeaEmptyState from "@/components/ideaforge/IdeaEmptyState";
import WikiView from "@/components/ideaforge/WikiView";
import BlueprintView from "@/components/ideaforge/BlueprintView";
import JourneyView from "@/components/ideaforge/JourneyView";
import FeedbackView from "@/components/ideaforge/FeedbackView";
import IdeaForgeStorage, { StoredIdea } from "@/utils/ideaforge-storage";
import { ideaForgeHelpers } from "@/lib/supabase-connection-helpers";
import { useAuth } from "@/contexts/AuthContext";
import ShareIdeaModal from "@/components/ideaforge/ShareIdeaModal";
import IdeaSummaryModal from "@/components/ideaforge/IdeaSummaryModal";

// IdeaForge Types
type IdeaStatus = 'draft' | 'researching' | 'validated' | 'building';
type IdeaForgeTab = 'overview' | 'wiki' | 'blueprint' | 'journey' | 'feedback';

interface ExportData {
  idea?: {
    title?: string;
    description?: string;
    status?: string;
    tags?: string[];
    createdAt?: string;
  };
  wiki?: {
    sections?: Array<{
      title?: string;
      content?: string;
    }>;
  };
  blueprint?: {
    appType?: string;
    features?: Array<{
      name?: string;
      description?: string;
      priority?: string;
    }>;
    techStack?: Array<{
      name?: string;
      description?: string;
      category?: string;
    }>;
  };
  journey?: {
    entries?: Array<{
      title?: string;
      content?: string;
      date?: string;
      type?: string;
    }>;
  };
  feedback?: {
    items?: Array<{
      title?: string;
      content?: string;
      author?: string;
    }>;
  };
}

// interface IdeaOverview {
//   id: string;
//   title: string;
//   description: string;
//   status: IdeaStatus;
//   tags: string[];
//   createdAt: string;
//   updatedAt: string;
//   progress: {
//     wiki: number;
//     blueprint: number;
//     journey: number;
//     feedback: number;
//   };
// }

interface IdeaForgeSidebarItem {
  id: IdeaForgeTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  progress?: number;
}

const IdeaForge = () => {
  const { ideaId } = useParams<{ ideaId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // State management
  const [ideas, setIdeas] = useState<StoredIdea[]>([]);
  const [currentIdea, setCurrentIdea] = useState<StoredIdea | null>(null);
  const [activeTab, setActiveTab] = useState<IdeaForgeTab>('overview');
  // Removed unused isEditingIdea state
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditingIdea, setIsEditingIdea] = useState(false);

  // Sidebar configuration
  const sidebarItems: IdeaForgeSidebarItem[] = [
    { id: 'overview', label: 'Idea Overview', icon: Lightbulb },
    { id: 'wiki', label: 'Wiki', icon: BookOpen, progress: currentIdea?.progress.wiki },
    { id: 'blueprint', label: 'Blueprint', icon: Layers, progress: currentIdea?.progress.blueprint },
    { id: 'journey', label: 'Journey', icon: GitBranch, progress: currentIdea?.progress.journey },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, progress: currentIdea?.progress.feedback },
  ];

  // Handle creating a new idea
  const handleCreateIdea = async (idea: IdeaInput) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create ideas.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: newIdea, error } = await ideaForgeHelpers.createIdea({
        title: idea.title,
        description: idea.description || "",
        status: 'draft',
        tags: idea.tags || [],
        user_id: user.id,
        progress: {
          wiki: 0,
          blueprint: 0,
          journey: 0,
          feedback: 0
        }
      });

      if (error) throw error;

      if (newIdea) {
        // Update local state
        await loadIdeas();

        navigate(`/workspace/ideaforge/${newIdea.id}`);
        toast({
          title: "Idea Created!",
          description: `"${newIdea.title}" has been added to your IdeaForge.`,
        });
      }
    } catch (error: unknown) {
      console.error('Error creating idea:', error);
      toast({
        title: "Error Creating Idea",
        description: "Failed to create idea. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Load ideas from database
  const loadIdeas = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: ideasData, error } = await ideaForgeHelpers.getIdeas(user.id);

      if (error) throw error;

      // Convert database format to StoredIdea format for compatibility
      const convertedIdeas: StoredIdea[] = (ideasData || []).map(idea => ({
        id: idea.id,
        title: idea.title,
        description: idea.description || "",
        content: "", // This would be populated from wiki pages
        status: idea.status as IdeaStatus,
        tags: idea.tags || [],
        coverImage: undefined,
        favorited: false,
        createdAt: idea.created_at,
        updatedAt: idea.updated_at,
        progress: (typeof idea.progress === 'object' && idea.progress &&
                  typeof idea.progress === 'object' &&
                  'wiki' in idea.progress) ?
                  idea.progress as { wiki: number; blueprint: number; journey: number; feedback: number } : {
          wiki: 0,
          blueprint: 0,
          journey: 0,
          feedback: 0
        }
      }));

      setIdeas(convertedIdeas);
    } catch (error: unknown) {
      console.error('Error loading ideas:', error);
      toast({
        title: "Error Loading Ideas",
        description: "Failed to load your ideas. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize data from database and handle URL params
  useEffect(() => {
    if (user) {
      loadIdeas();
    }
  }, [user]);

  // Load current idea when ideaId changes
  useEffect(() => {
    if (ideaId && ideas.length > 0) {
      const idea = ideas.find(i => i.id === ideaId);
      setCurrentIdea(idea || null);
    } else if (!ideaId) {
      setCurrentIdea(null);
    }
  }, [ideaId, ideas]);

  // Handle export functionality - simplified to display content
  const handleExport = (format: 'summary' | 'display' | 'markdown' | 'json') => {
    if (!currentIdea) return;

    try {
      const exportData = IdeaForgeStorage.exportIdeaData(currentIdea.id);

      switch (format) {
        case 'summary':
          // Show summary modal
          setShowSummaryModal(true);
          return; // Don't show success toast for modal

        case 'display': {
          // Open a new window to display the formatted content
          const displayContent = generateDisplayExport(exportData);
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(displayContent);
            newWindow.document.close();
          }
          break;
        }

        case 'json': {
          const dataStr = JSON.stringify(exportData, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${currentIdea.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_ideaforge_export.json`;
          link.click();
          URL.revokeObjectURL(url);
          break;
        }

        case 'markdown': {
          const markdownContent = generateMarkdownExport(exportData);
          const mdBlob = new Blob([markdownContent], { type: 'text/markdown' });
          const mdUrl = URL.createObjectURL(mdBlob);
          const mdLink = document.createElement('a');
          mdLink.href = mdUrl;
          mdLink.download = `${currentIdea.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_ideaforge_export.md`;
          mdLink.click();
          URL.revokeObjectURL(mdUrl);
          break;
        }
      }

      toast({
        title: "Export Successful",
        description: `Your IdeaForge data has been exported.`,
      });
    } catch (error: unknown) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Generate HTML display export content
  const generateDisplayExport = (data: ExportData) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.idea?.title || 'Untitled Idea'} - IdeaForge Export</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
          }
          .header {
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 2.5em;
            margin: 0;
            color: #1e40af;
          }
          .description {
            font-size: 1.2em;
            color: #6b7280;
            margin: 10px 0;
          }
          .meta {
            display: flex;
            gap: 20px;
            margin: 15px 0;
          }
          .status {
            background: #3b82f6;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.9em;
          }
          .tags {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
          .tag {
            background: #f3f4f6;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            border: 1px solid #d1d5db;
          }
          .section {
            margin: 40px 0;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
          .section-title {
            font-size: 1.5em;
            margin: 0 0 20px 0;
            color: #1f2937;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
          }
          .subsection {
            margin: 20px 0;
          }
          .subsection-title {
            font-size: 1.2em;
            font-weight: 600;
            margin: 15px 0 10px 0;
            color: #374151;
          }
          .content {
            white-space: pre-wrap;
            background: #f9fafb;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #3b82f6;
          }
          .feature-item, .feedback-item {
            background: #f8fafc;
            padding: 15px;
            margin: 10px 0;
            border-radius: 6px;
            border-left: 4px solid #10b981;
          }
          .feedback-item {
            border-left-color: #8b5cf6;
          }
          .priority-high { border-left-color: #ef4444; }
          .priority-medium { border-left-color: #f59e0b; }
          .priority-low { border-left-color: #10b981; }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${data.idea?.title || 'Untitled Idea'}</h1>
          <p class="description">${data.idea?.description || 'No description'}</p>
          <div class="meta">
            <span class="status">${data.idea?.status || 'Draft'}</span>
            <div class="tags">
              ${data.idea?.tags?.map((tag: string) => `<span class="tag">${tag}</span>`).join('') || ''}
            </div>
          </div>
          <p><strong>Created:</strong> ${new Date(data.idea?.createdAt).toLocaleDateString()}</p>
        </div>

        ${data.wiki?.sections ? `
        <div class="section">
          <h2 class="section-title">📚 Wiki Knowledge Base</h2>
          ${(data.wiki as Record<string, unknown>)?.sections && Array.isArray((data.wiki as Record<string, unknown>).sections) ? ((data.wiki as Record<string, unknown>).sections as Record<string, unknown>[]).map((section: Record<string, unknown>) => `
            <div class="subsection">
              <h3 class="subsection-title">${section.title}</h3>
              <div class="content">${section.content}</div>
            </div>
          `).join('') : ''}
        </div>
        ` : ''}

        ${data.blueprint ? `
        <div class="section">
          <h2 class="section-title">🧩 Product Blueprint</h2>
          <p><strong>App Type:</strong> ${data.blueprint.appType}</p>

          ${data.blueprint.features?.length ? `
          <div class="subsection">
            <h3 class="subsection-title">Features</h3>
            ${data.blueprint.features.map((feature: unknown) => `
              <div class="feature-item priority-${feature.priority}">
                <strong>${feature.name}</strong> (${feature.priority} priority)
                <br>${feature.description}
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${data.blueprint.techStack?.length ? `
          <div class="subsection">
            <h3 class="subsection-title">Tech Stack</h3>
            ${data.blueprint.techStack.map((tech: unknown) => `
              <div class="feature-item">
                <strong>${tech.category}:</strong> ${tech.name}
                <br>${tech.description}
              </div>
            `).join('')}
          </div>
          ` : ''}
        </div>
        ` : ''}

        ${data.journey?.entries?.length ? `
        <div class="section">
          <h2 class="section-title">📍 Founder's Journey</h2>
          ${data.journey.entries.map((entry: unknown) => `
            <div class="subsection">
              <h3 class="subsection-title">${entry.title} (${new Date(entry.date).toLocaleDateString()})</h3>
              <p><strong>Type:</strong> ${entry.type}</p>
              <div class="content">${entry.content}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${data.feedback?.items?.length ? `
        <div class="section">
          <h2 class="section-title">💬 Feedback & Validation</h2>
          ${data.feedback.items.map((item: unknown) => `
            <div class="feedback-item priority-${item.priority}">
              <h4>${item.title}</h4>
              <p><strong>Source:</strong> ${item.source} | <strong>Type:</strong> ${item.type} | <strong>Priority:</strong> ${item.priority}</p>
              <p><strong>Author:</strong> ${item.author}</p>
              <div class="content">${item.content}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div class="footer">
          <p>Exported from IdeaForge on ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;
  };

  // Generate markdown export content
  const generateMarkdownExport = (data: ExportData) => {
    let markdown = `# ${data.idea?.title || 'Untitled Idea'}\n\n`;
    markdown += `**Description:** ${data.idea?.description || 'No description'}\n\n`;
    markdown += `**Status:** ${data.idea?.status || 'Draft'}\n\n`;
    markdown += `**Tags:** ${data.idea?.tags?.join(', ') || 'None'}\n\n`;
    markdown += `**Created:** ${new Date(data.idea?.createdAt).toLocaleDateString()}\n\n`;
    markdown += `---\n\n`;

    if (data.wiki?.sections) {
      markdown += `## 📚 Wiki\n\n`;
      data.wiki.sections.forEach((section) => {
        markdown += `### ${section.title}\n\n${section.content}\n\n`;
      });
    }

    if (data.blueprint) {
      markdown += `## 🧩 Blueprint\n\n`;
      markdown += `**App Type:** ${data.blueprint.appType}\n\n`;

      if (data.blueprint.features?.length) {
        markdown += `### Features\n\n`;
        data.blueprint.features.forEach((feature) => {
          markdown += `- **${feature.name}** (${feature.priority}): ${feature.description}\n`;
        });
        markdown += `\n`;
      }

      if (data.blueprint.techStack?.length) {
        markdown += `### Tech Stack\n\n`;
        data.blueprint.techStack.forEach((tech) => {
          markdown += `- **${tech.category}**: ${tech.name} - ${tech.description}\n`;
        });
        markdown += `\n`;
      }
    }

    if (data.journey?.entries?.length) {
      markdown += `## 📍 Journey\n\n`;
      data.journey.entries.forEach((entry) => {
        markdown += `### ${entry.title} (${new Date(entry.date).toLocaleDateString()})\n\n`;
        markdown += `**Type:** ${entry.type}\n\n`;
        markdown += `${entry.content}\n\n`;
      });
    }

    if (data.feedback?.items?.length) {
      markdown += `## 💬 Feedback\n\n`;
      data.feedback.items.forEach((item: unknown) => {
        markdown += `### ${item.title}\n\n`;
        markdown += `**Source:** ${item.source} | **Type:** ${item.type} | **Priority:** ${item.priority}\n\n`;
        markdown += `**Author:** ${item.author}\n\n`;
        markdown += `${item.content}\n\n`;
      });
    }

    markdown += `---\n\n*Exported from IdeaForge on ${new Date().toLocaleDateString()}*`;
    return markdown;
  };

  // Handle URL params and set current idea
  useEffect(() => {
    if (ideaId && ideas.length > 0) {
      const idea = ideas.find(i => i.id === ideaId);
      if (idea) {
        setCurrentIdea(idea);
      } else {
        // Idea not found, redirect to main page
        navigate('/workspace/ideaforge');
      }
    } else if (ideas.length > 0 && !ideaId) {
      // No specific idea selected, show the first one or ideas list
      setCurrentIdea(null);
    }
  }, [ideaId, ideas, navigate]);

  // Helper functions
  const getStatusColor = (status: IdeaStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'researching': return 'bg-blue-500';
      case 'validated': return 'bg-green-500';
      case 'building': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: IdeaStatus) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'researching': return 'Researching';
      case 'validated': return 'Validated';
      case 'building': return 'Building';
      default: return 'Draft';
    }
  };

  // Render ideas list (when no specific idea is selected)
  const renderIdeasList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">IdeaForge</h1>
          <p className="text-muted-foreground mt-2">
            Research, document, and refine your startup ideas before building
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <PlusCircle className="h-5 w-5" />
              New Idea
            </Button>
          </DialogTrigger>
          <NewIdeaModal onCreateIdea={handleCreateIdea} />
        </Dialog>
      </div>

      {ideas.length === 0 ? (
        <IdeaEmptyState onCreateClick={() => (document.querySelector('[data-dialog-trigger]') as HTMLElement)?.click()} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea) => (
            <Card
              key={idea.id}
              className="workspace-card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/workspace/ideaforge/${idea.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge className={`${getStatusColor(idea.status)} text-white`}>
                    {getStatusLabel(idea.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(idea.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{idea.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {idea.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {idea.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{Math.round((idea.progress.wiki + idea.progress.blueprint + idea.progress.journey + idea.progress.feedback) / 4)}%</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    <div className="h-1 bg-blue-500 rounded" style={{ opacity: idea.progress.wiki / 100 }} />
                    <div className="h-1 bg-green-500 rounded" style={{ opacity: idea.progress.blueprint / 100 }} />
                    <div className="h-1 bg-yellow-500 rounded" style={{ opacity: idea.progress.journey / 100 }} />
                    <div className="h-1 bg-purple-500 rounded" style={{ opacity: idea.progress.feedback / 100 }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="layout-container bg-gradient-to-br from-black via-gray-900 to-green-950">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="layout-main transition-all duration-300">
        {currentIdea ? (
          <>
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <SidebarToggle onClick={() => setSidebarOpen(true)} />
                    <Link
                      to="/workspace/ideaforge"
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Back to Ideas</span>
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowShareModal(true)}
                      className="bg-black/60 border-white/20 hover:bg-black/80"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-black/60 border-white/20 hover:bg-black/80"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-6 py-8">
              {/* Header Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <Lightbulb className="h-8 w-8 text-green-400" />
                  <h1 className="text-3xl md:text-4xl font-bold text-white">{currentIdea.title}</h1>
                  <Badge className={`${getStatusColor(currentIdea.status)} text-white`}>
                    {getStatusLabel(currentIdea.status)}
                  </Badge>
                </div>
                <p className="text-gray-400 text-lg max-w-2xl">
                  {currentIdea.description}
                </p>
              </div>

              {/* Tab Navigation */}
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
                {/* Desktop Tab Navigation */}
                <div className="flex items-center gap-1 overflow-x-auto">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all relative whitespace-nowrap ${
                        activeTab === item.id
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-black/60'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {item.progress !== undefined && (
                        <span className={`text-xs px-2 py-0.5 rounded-full transition-all ${
                          activeTab === item.id
                            ? 'bg-white/20 text-white font-medium'
                            : 'bg-gray-600 text-gray-300'
                        }`}>
                          {item.progress}%
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="animate-in fade-in-50 duration-300">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Progress Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {sidebarItems.slice(1).map((item) => (
                        <Card key={item.id} className="workspace-card p-4 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => setActiveTab(item.id)}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <item.icon className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="font-semibold">{item.label}</h3>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{item.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${item.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="workspace-card p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          Research Status
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Wiki Sections</span>
                            <span className="font-medium">8 sections</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Last Updated</span>
                            <span className="font-medium">2 hours ago</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">AI Insights</span>
                            <span className="font-medium">12 generated</span>
                          </div>
                        </div>
                      </Card>

                      <Card className="workspace-card p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Layers className="h-5 w-5 text-green-600" />
                          Product Planning
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Core Features</span>
                            <span className="font-medium">6 defined</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Screens Mapped</span>
                            <span className="font-medium">8 screens</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Tech Stack</span>
                            <span className="font-medium">Selected</span>
                          </div>
                        </div>
                      </Card>

                      <Card className="workspace-card p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-purple-600" />
                          Validation Progress
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Feedback Items</span>
                            <span className="font-medium">15 collected</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Positive Signals</span>
                            <span className="font-medium text-green-600">78%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Action Items</span>
                            <span className="font-medium">3 pending</span>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card className="workspace-card p-6">
                      <h3 className="font-semibold mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 justify-start"
                          onClick={() => {
                            // Navigate to MVP Studio with prefilled data
                            navigate('/workspace/mvp-studio', {
                              state: {
                                fromIdeaForge: true,
                                ideaData: currentIdea
                              }
                            });
                          }}
                        >
                          <Rocket className="h-4 w-4 mr-2" />
                          Start Building in MVP Studio
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleExport('summary')}
                          className="justify-start"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Complete Summary
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowShareModal(true)}
                          className="justify-start"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Share with Others
                        </Button>
                      </div>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="workspace-card p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <GitBranch className="h-5 w-5 text-orange-600" />
                        Recent Activity
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 rounded-lg glass-effect-light">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Added user interview feedback from Sarah M.</p>
                            <p className="text-xs text-muted-foreground">2 hours ago • Feedback</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg glass-effect-light">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Updated tech stack selection in Blueprint</p>
                            <p className="text-xs text-muted-foreground">5 hours ago • Blueprint</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg glass-effect-light">
                          <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">AI generated market analysis insights</p>
                            <p className="text-xs text-muted-foreground">1 day ago • Wiki</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
                {activeTab === 'wiki' && currentIdea && <WikiView idea={currentIdea as any} />}
                {activeTab === 'blueprint' && currentIdea && <BlueprintView ideaId={currentIdea.id} />}
                {activeTab === 'journey' && currentIdea && <JourneyView ideaId={currentIdea.id} />}
                {activeTab === 'feedback' && currentIdea && <FeedbackView ideaId={currentIdea.id} />}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <SidebarToggle onClick={() => setSidebarOpen(true)} />
                    <Link
                      to="/workspace"
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Back to Workspace</span>
                    </Link>
                  </div>
                  <Button
                    onClick={() => setIsEditingIdea(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Idea
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-6 py-8">
              {/* Header Section */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">IdeaForge</h1>
                <p className="text-gray-400 text-lg">
                  Transform your ideas into structured plans with AI-powered insights
                </p>
              </div>

              {/* Ideas List */}
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                {renderIdeasList()}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Share Modal */}
      {currentIdea && (
        <ShareIdeaModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          ideaTitle={currentIdea.title}
          ideaId={currentIdea.id}
        />
      )}

      {/* Summary Modal */}
      {currentIdea && (
        <IdeaSummaryModal
          isOpen={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          ideaData={IdeaForgeStorage.exportIdeaData(currentIdea.id)}
        />
      )}
    </div>
  );
};

export default IdeaForge;
