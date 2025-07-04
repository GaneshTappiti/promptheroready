import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  FileText,
  Presentation,
  FileSpreadsheet,
  FilePieChart,

  Eye,
  Edit,
  Share,
  Download,
  Users,
  BarChart3,
  Sparkles,
  Video,
  MessageSquare,
  UserPlus,
  RefreshCw,
  ChevronLeft,
  Wand2,
  Grid,
  List,
  TrendingUp
} from "lucide-react";
import WorkspaceSidebar, { SidebarToggle } from "@/components/WorkspaceSidebar";
import DocumentModal from "@/components/docs-decks/DocumentModal";
import PitchDeckCard from "@/components/docs-decks/PitchDeckCard";
import DocumentCard from "@/components/docs-decks/DocumentCard";
import TemplateCard from "@/components/docs-decks/TemplateCard";
import EmptyState from "@/components/docs-decks/EmptyState";
import PresentationGenerator from "@/components/presentation/PresentationGenerator";
import PresentationCard from "@/components/presentation/PresentationCard";
import { useToast } from "@/hooks/use-toast";

import { docsDecksHelpers } from "@/lib/supabase-connection-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
// Removed unused Badge and Progress imports
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
// Removed unused Textarea import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Removed unused DropdownMenu imports
import { presentationService } from "@/services/presentationService";
import { Presentation as PresentationType } from "@/types/presentation";

const DocsDecks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("presentations");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollaborationModalOpen, setIsCollaborationModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isVersionHistoryModalOpen, setIsVersionHistoryModalOpen] = useState(false);
  const [isAIAssistantModalOpen, setIsAIAssistantModalOpen] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<PresentationType | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Database state
  const [presentations, setPresentations] = useState<PresentationType[]>([]);
  const [pitchDecks, setPitchDecks] = useState<PresentationType[]>([]);
  const [documents, setDocuments] = useState<PresentationType[]>([]);
  
  const templates = [
    {
      id: 1,
      name: "Investor Deck",
      description: "Standard 10-12 slide investor pitch",
      category: "Pitch Deck",
      icon: Presentation
    },
    {
      id: 2,
      name: "Executive Summary",
      description: "One-page business overview",
      category: "Document",
      icon: FileText
    },
    {
      id: 3,
      name: "Financial Model",
      description: "Basic startup financial projection",
      category: "Spreadsheet",
      icon: FileSpreadsheet
    },
    {
      id: 4,
      name: "Market Analysis",
      description: "Industry research template",
      category: "Research",
      icon: FilePieChart
    }
  ];

  // Database helper functions
  const loadPresentations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await presentationService.getUserPresentations(user.id, {
        limit: 50
      });

      if (error) throw error;

      setPresentations(data || []);
    } catch (error) {
      console.error('Error loading presentations:', error);
      toast({
        title: "Error Loading Presentations",
        description: "Failed to load your presentations. Please try again.",
        variant: "destructive"
      });
    }
  };

  const loadDocuments = async () => {
    if (!user) return;

    try {
      const { data, error } = await docsDecksHelpers.getDocuments(user.id);

      if (error) throw error;

      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error Loading Documents",
        description: "Failed to load your documents. Please try again.",
        variant: "destructive"
      });
    }
  };

  const loadPitchDecks = async () => {
    if (!user) return;

    try {
      const { data, error } = await docsDecksHelpers.getPitchDecks(user.id);

      if (error) throw error;

      setPitchDecks(data || []);
    } catch (error: unknown) {
      console.error('Error loading pitch decks:', error);
    }
  };

  // Load data on component mount
  React.useEffect(() => {
    if (user) {
      loadPresentations();
      loadDocuments();
      loadPitchDecks();
    }
  }, [user]);

  const handleCreateDocument = async (data: { title: string; description: string; type: string }) => {
    if (!user) return;

    try {
      if (data.type === "deck") {
        // Create pitch deck
        const { data: newDeck, error } = await docsDecksHelpers.createPitchDeck({
          title: data.title,
          content: data.description || '',
          document_type: 'pitch_deck',
          user_id: user.id
        });

        if (error) throw error;

        if (newDeck) {
          await loadPitchDecks();
          navigate(`/workspace/docs-decks/editor/${newDeck.id}`);
        }
      } else {
        // Create document
        const { data: newDoc, error } = await docsDecksHelpers.createDocument({
          title: data.title,
          content: data.description || '',
          document_type: 'other',
          user_id: user.id
        });

        if (error) throw error;

        if (newDoc) {
          await loadDocuments();
          navigate(`/workspace/docs-decks/editor/${newDoc.id}`);
        }
      }

      toast({
        title: "Document created",
        description: `Your ${data.type === "deck" ? "pitch deck" : "document"} was created successfully`,
      });
    } catch (error: unknown) {
      console.error('Error creating document:', error);
      toast({
        title: "Error Creating Document",
        description: "Failed to create document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeckClick = (id: number) => {
    navigate(`/workspace/docs-decks/editor/${id}`);
  };

  const handleDocumentClick = (id: number) => {
    navigate(`/workspace/docs-decks/editor/${id}`);
  };

  const handleCollaboration = (document: PresentationType) => {
    setSelectedDocument(document);
    setIsCollaborationModalOpen(true);
  };

  const handleAnalytics = (document: PresentationType) => {
    setSelectedDocument(document);
    setIsAnalyticsModalOpen(true);
  };

  const handleVersionHistory = (document: PresentationType) => {
    setSelectedDocument(document);
    setIsVersionHistoryModalOpen(true);
  };

  const handleAIAssistant = (document: PresentationType) => {
    setSelectedDocument(document);
    setIsAIAssistantModalOpen(true);
  };

  const handleGenerateContent = async (prompt: string) => {
    setIsGeneratingContent(true);

    // Simulate AI content generation
    await new Promise(resolve => setTimeout(resolve, 3000));

    setIsGeneratingContent(false);
    toast({
      title: "Content Generated",
      description: "AI has generated new content for your document.",
    });
  };

  const handleShare = (document: PresentationType) => {
    navigator.clipboard.writeText(`https://app.example.com/share/${document.id}`);
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard.",
    });
  };

  const handleDuplicate = (document: PresentationType) => {
    toast({
      title: "Document duplicated",
      description: `${document.title} has been duplicated.`,
    });
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleOpenGeneratorModal = () => {
    setIsGeneratorModalOpen(true);
  };

  // Presentation handlers
  const handlePresentationClick = (presentation: PresentationType) => {
    navigate(`/workspace/docs-decks/presentation/${presentation.id}`);
  };

  const handlePresentationEdit = (presentation: PresentationType) => {
    navigate(`/workspace/docs-decks/presentation/${presentation.id}/edit`);
  };

  const handlePresentationDuplicate = async (presentation: PresentationType) => {
    if (!user) return;

    try {
      const { data, error } = await presentationService.duplicatePresentation(
        presentation.id,
        user.id,
        `${presentation.title} (Copy)`
      );

      if (error) throw error;

      await loadPresentations();
      toast({
        title: "Presentation Duplicated",
        description: `"${presentation.title}" has been duplicated successfully.`,
      });
    } catch (error: unknown) {
      console.error('Error duplicating presentation:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate presentation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePresentationDelete = async (presentation: PresentationType) => {
    if (!user) return;

    try {
      const { success, error } = await presentationService.deletePresentation(
        presentation.id,
        user.id
      );

      if (!success || error) throw error;

      await loadPresentations();
      toast({
        title: "Presentation Deleted",
        description: `"${presentation.title}" has been deleted.`,
      });
    } catch (error: unknown) {
      console.error('Error deleting presentation:', error);
      toast({
        title: "Error",
        description: "Failed to delete presentation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePresentationShare = (presentation: PresentationType) => {
    const shareUrl = `${window.location.origin}/presentation/${presentation.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied",
      description: "Presentation share link copied to clipboard.",
    });
  };

  const handlePresentationGenerated = async (presentationId: string) => {
    setIsGeneratorModalOpen(false);
    await loadPresentations();
    navigate(`/workspace/docs-decks/presentation/${presentationId}`);
  };

  return (
    <div className="layout-container bg-gradient-to-br from-black via-gray-900 to-green-950">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="layout-main transition-all duration-300">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarToggle onClick={() => setSidebarOpen(true)} />
                <div className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Workspace</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleOpenGeneratorModal}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  AI Presentation
                </Button>
                <Button
                  onClick={handleOpenModal}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Document
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
              <FileText className="h-8 w-8 text-green-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">Docs & Decks</h1>
            </div>
            <p className="text-gray-400 text-lg">
              Create and manage your documents and presentations
            </p>
          </div>

          {/* Main Content Container */}
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <header className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Docs & Decks</h1>
            <p className="text-muted-foreground">
              Create professional documents and presentations for your startup
            </p>
          </header>
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <div className="flex items-center gap-4">
              <h2 className="text-xl md:text-2xl font-semibold">Document Center</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleOpenGeneratorModal} className="bg-purple-600 hover:bg-purple-700">
                <Wand2 className="h-4 w-4 mr-2" />
                AI Presentation
              </Button>
              <Button onClick={handleOpenModal} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                New Document
              </Button>
            </div>
          </div>
          <Tabs
            defaultValue="presentations"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-6 md:mb-8"
          >
            <TabsList className="mb-2 w-full sm:w-auto">
              <TabsTrigger
                value="presentations"
                className={`transition-all duration-300 ${activeTab === "presentations" ? "tab-active" : ""}`}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Presentations
              </TabsTrigger>
              <TabsTrigger
                value="pitch-decks"
                className={`transition-all duration-300 ${activeTab === "pitch-decks" ? "tab-active" : ""}`}
              >
                Pitch Decks
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className={`transition-all duration-300 ${activeTab === "documents" ? "tab-active" : ""}`}
              >
                Documents
              </TabsTrigger>
              <TabsTrigger
                value="templates"
                className={`transition-all duration-300 ${activeTab === "templates" ? "tab-active" : ""}`}
              >
                Templates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="presentations" className="mt-4 md:mt-6 transition-all duration-300 animate-fade-in">
              {presentations.length > 0 ? (
                <div className={viewMode === 'grid'
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                  : "space-y-4"
                }>
                  {presentations.map(presentation => (
                    <PresentationCard
                      key={presentation.id}
                      presentation={presentation}
                      viewMode={viewMode}
                      onClick={() => handlePresentationClick(presentation)}
                      onEdit={() => handlePresentationEdit(presentation)}
                      onDuplicate={() => handlePresentationDuplicate(presentation)}
                      onShare={() => handlePresentationShare(presentation)}
                      onDelete={() => handlePresentationDelete(presentation)}
                    />
                  ))}

                  {viewMode === 'grid' && (
                    <div
                      className="workspace-card border-dashed border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-purple-500/50"
                      onClick={handleOpenGeneratorModal}
                    >
                      <div className="flex flex-col items-center justify-center p-4 md:p-6 h-full">
                        <div className="rounded-full bg-purple-500/10 p-3 mb-4">
                          <Wand2 className="h-6 w-6 text-purple-500" />
                        </div>
                        <p className="font-medium">Generate with AI</p>
                        <p className="text-sm text-muted-foreground text-center mt-2">
                          Create professional presentations with AI assistance
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="h-12 w-12 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No presentations yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first AI-powered presentation to get started
                  </p>
                  <Button onClick={handleOpenGeneratorModal} className="bg-purple-600 hover:bg-purple-700">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate AI Presentation
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pitch-decks" className="mt-4 md:mt-6 transition-all duration-300 animate-fade-in">
              {pitchDecks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {pitchDecks.map(deck => (
                    <PitchDeckCard
                      key={deck.id}
                      id={parseInt(deck.id)}
                      name={deck.title}
                      description={deck.description || 'No description'}
                      lastEdited={new Date(deck.updatedAt).toLocaleDateString()}
                      slides={deck.totalSlides}
                      template={deck.theme}
                      onClick={() => handleDeckClick(parseInt(deck.id))}
                    />
                  ))}
                  
                  <div 
                    className="workspace-card border-dashed border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50"
                    onClick={handleOpenModal}
                  >
                    <div className="flex flex-col items-center justify-center p-4 md:p-6 h-full">
                      <div className="rounded-full bg-white/5 p-3 mb-4">
                        <Presentation className="h-6 w-6" />
                      </div>
                      <p className="font-medium">Create New Deck</p>
                      <p className="text-sm text-muted-foreground text-center mt-2">
                        Build a professional pitch deck with AI assistance
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState type="decks" onCreateNew={handleOpenModal} />
              )}
            </TabsContent>
            
            <TabsContent value="documents" className="mt-4 md:mt-6 transition-all duration-300 animate-fade-in">
              {documents.length > 0 ? (
                <div className="space-y-4">
                  {documents.map(doc => (
                    <DocumentCard
                      key={doc.id}
                      id={parseInt(doc.id)}
                      name={doc.title}
                      description={doc.description || 'No description'}
                      type={doc.status}
                      lastEdited={new Date(doc.updatedAt).toLocaleDateString()}
                      pages={doc.totalSlides}
                      onClick={() => handleDocumentClick(parseInt(doc.id))}
                    />
                  ))}
                  
                  <Button variant="outline" className="w-full justify-center" onClick={handleOpenModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Document
                  </Button>
                </div>
              ) : (
                <EmptyState type="documents" onCreateNew={handleOpenModal} />
              )}
            </TabsContent>
            
            <TabsContent value="templates" className="mt-4 md:mt-6 transition-all duration-300 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {templates.map(template => (
                  <TemplateCard
                    key={template.id}
                    id={template.id}
                    name={template.name}
                    description={template.description}
                    category={template.category}
                    icon={template.icon}
                  />
                ))}
              </div>
              
              <div className="mt-6 md:mt-8 p-4 md:p-6 glass-effect rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">AI Document Generator</h4>
                    <p className="text-sm text-muted-foreground">Generate professional documents with AI assistance</p>
                  </div>
                </div>
                <Button className="w-full mt-4">Generate Document with AI</Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <DocumentModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleCreateDocument}
          />

        </div>

          {/* AI Presentation Generator Modal */}
          <Dialog open={isGeneratorModalOpen} onOpenChange={setIsGeneratorModalOpen}>
            <DialogContent className="bg-black/90 backdrop-blur-xl border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-purple-400" />
                  AI Presentation Generator
                </DialogTitle>
              </DialogHeader>

              <div className="py-4">
                <PresentationGenerator
                  onPresentationGenerated={handlePresentationGenerated}
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Collaboration Modal */}
          <Dialog open={isCollaborationModalOpen} onOpenChange={setIsCollaborationModalOpen}>
            <DialogContent className="bg-black/90 backdrop-blur-xl border-white/10 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-400" />
                  Collaboration Settings
                </DialogTitle>
              </DialogHeader>

              {selectedDocument && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{selectedDocument.title}</h3>
                    <p className="text-gray-400">{selectedDocument.description}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Current Collaborators</Label>
                    <div className="space-y-2 mt-2">
                      <div className="text-sm text-muted-foreground">No collaborators added yet</div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Invite New Collaborator</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Enter email address"
                        className="bg-black/20 border-white/10"
                      />
                      <Select defaultValue="editor">
                        <SelectTrigger className="w-32 bg-black/20 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite
                      </Button>
                    </div>
                  </div>

                  <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                    <h4 className="font-medium text-green-400 mb-2">Real-time Features</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-blue-400" />
                        <span>Video calling during editing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-400" />
                        <span>Live comments and suggestions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-yellow-400" />
                        <span>Auto-sync changes</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCollaborationModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Settings Updated",
                    description: "Collaboration settings have been saved.",
                  });
                  setIsCollaborationModalOpen(false);
                }}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Analytics Modal */}
          <Dialog open={isAnalyticsModalOpen} onOpenChange={setIsAnalyticsModalOpen}>
            <DialogContent className="bg-black/90 backdrop-blur-xl border-white/10 text-white max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                  Document Analytics
                </DialogTitle>
              </DialogHeader>

              {selectedDocument && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{selectedDocument.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-black/40 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">
                          0
                        </div>
                        <div className="text-sm text-gray-400">Total Views</div>
                      </div>
                      <div className="bg-black/40 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          0
                        </div>
                        <div className="text-sm text-gray-400">Unique Viewers</div>
                      </div>
                      <div className="bg-black/40 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-400">
                          0:00
                        </div>
                        <div className="text-sm text-gray-400">Avg. Time Spent</div>
                      </div>
                      <div className="bg-black/40 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          0%
                        </div>
                        <div className="text-sm text-gray-400">Completion Rate</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Engagement Over Time</h4>
                      <div className="bg-black/40 rounded-lg p-4 h-48 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                          <p>Chart visualization would go here</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Recent Activity</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 bg-black/40 rounded-lg p-3">
                          <Eye className="h-4 w-4 text-green-400" />
                          <div className="text-sm">Viewed by investor@fund.com</div>
                          <div className="text-xs text-gray-400 ml-auto">2 hours ago</div>
                        </div>
                        <div className="flex items-center gap-3 bg-black/40 rounded-lg p-3">
                          <Share className="h-4 w-4 text-blue-400" />
                          <div className="text-sm">Shared with team</div>
                          <div className="text-xs text-gray-400 ml-auto">Yesterday</div>
                        </div>
                        <div className="flex items-center gap-3 bg-black/40 rounded-lg p-3">
                          <Edit className="h-4 w-4 text-yellow-400" />
                          <div className="text-sm">Last edited by you</div>
                          <div className="text-xs text-gray-400 ml-auto">2 days ago</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAnalyticsModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Report Exported",
                    description: "Analytics report has been downloaded.",
                  });
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default DocsDecks;
