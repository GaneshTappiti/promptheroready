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
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Share,
  Download,
  Trash2,
  Users,
  Clock,
  Star,
  Copy,
  History,
  BarChart3,
  Sparkles,
  Video,
  MessageSquare,
  Calendar,
  Globe,
  Lock,
  Unlock,
  UserPlus,
  Settings,
  Archive,
  RefreshCw,
  ExternalLink,
  Zap,
  TrendingUp,
  Target,
  Brain,
  ChevronLeft
} from "lucide-react";
import WorkspaceSidebar, { SidebarToggle } from "@/components/WorkspaceSidebar";
import DocumentModal from "@/components/docs-decks/DocumentModal";
import PitchDeckCard from "@/components/docs-decks/PitchDeckCard";
import DocumentCard from "@/components/docs-decks/DocumentCard";
import TemplateCard from "@/components/docs-decks/TemplateCard";
import EmptyState from "@/components/docs-decks/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const DocsDecks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pitch-decks");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollaborationModalOpen, setIsCollaborationModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isVersionHistoryModalOpen, setIsVersionHistoryModalOpen] = useState(false);
  const [isAIAssistantModalOpen, setIsAIAssistantModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  
  const pitchDecks = [
    {
      id: 1,
      name: "Investor Pitch",
      description: "15-slide deck for seed round investors",
      lastEdited: "Yesterday",
      slides: 15,
      template: "YC Seed",
      status: "active",
      collaborators: ["john@example.com", "sarah@example.com"],
      views: 127,
      shares: 8,
      version: "v2.1",
      createdAt: "2024-01-10",
      tags: ["investor", "seed", "funding"],
      analytics: {
        totalViews: 127,
        uniqueViewers: 45,
        avgTimeSpent: "4:32",
        completionRate: 78,
        engagementScore: 85
      }
    },
    {
      id: 2,
      name: "Partner Pitch",
      description: "Overview for potential strategic partners",
      lastEdited: "3 days ago",
      slides: 10,
      template: "Partner Brief"
    },
    {
      id: 3,
      name: "Product Demo",
      description: "Product walkthrough for customers",
      lastEdited: "Last week",
      slides: 12,
      template: "Product Launch"
    }
  ];
  
  const documents = [
    {
      id: 1,
      name: "Business Plan",
      description: "Full business plan with financial projections",
      type: "Document",
      lastEdited: "Today",
      pages: 24
    },
    {
      id: 2,
      name: "One-Pager",
      description: "Executive summary for quick overview",
      type: "One-pager",
      lastEdited: "Yesterday",
      pages: 1
    },
    {
      id: 3,
      name: "Market Research",
      description: "Industry analysis and market opportunity",
      type: "Research",
      lastEdited: "Last week",
      pages: 15
    },
    {
      id: 4,
      name: "Financial Model",
      description: "5-year projection with assumptions",
      type: "Spreadsheet",
      lastEdited: "2 weeks ago",
      pages: "N/A"
    }
  ];
  
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

  const handleCreateDocument = (data: { title: string; description: string; type: string }) => {
    toast({
      title: "Document created",
      description: `Your ${data.type === "deck" ? "pitch deck" : "document"} was created successfully`,
    });
    
    // In a real app, you would add the document to your state or database
    // For this demo, we'll navigate to the editor
    navigate("/workspace/docs-decks/editor/new");
  };

  const handleDeckClick = (id: number) => {
    navigate(`/workspace/docs-decks/editor/${id}`);
  };

  const handleDocumentClick = (id: number) => {
    navigate(`/workspace/docs-decks/editor/${id}`);
  };

  const handleCollaboration = (document: any) => {
    setSelectedDocument(document);
    setIsCollaborationModalOpen(true);
  };

  const handleAnalytics = (document: any) => {
    setSelectedDocument(document);
    setIsAnalyticsModalOpen(true);
  };

  const handleVersionHistory = (document: any) => {
    setSelectedDocument(document);
    setIsVersionHistoryModalOpen(true);
  };

  const handleAIAssistant = (document: any) => {
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

  const handleShare = (document: any) => {
    navigator.clipboard.writeText(`https://app.example.com/share/${document.id}`);
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard.",
    });
  };

  const handleDuplicate = (document: any) => {
    toast({
      title: "Document duplicated",
      description: `${document.name} has been duplicated.`,
    });
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 flex">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 transition-all duration-300">
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
            <div>
              <h2 className="text-xl md:text-2xl font-semibold">Document Center</h2>
            </div>
            <Button onClick={handleOpenModal} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </div>
          <Tabs 
            defaultValue="pitch-decks" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="mb-6 md:mb-8"
          >
            <TabsList className="mb-2 w-full sm:w-auto">
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
            
            <TabsContent value="pitch-decks" className="mt-4 md:mt-6 transition-all duration-300 animate-fade-in">
              {pitchDecks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {pitchDecks.map(deck => (
                    <PitchDeckCard
                      key={deck.id}
                      id={deck.id}
                      name={deck.name}
                      description={deck.description}
                      lastEdited={deck.lastEdited}
                      slides={deck.slides}
                      template={deck.template}
                      onClick={() => handleDeckClick(deck.id)}
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
                      id={doc.id}
                      name={doc.name}
                      description={doc.description}
                      type={doc.type}
                      lastEdited={doc.lastEdited}
                      pages={doc.pages}
                      onClick={() => handleDocumentClick(doc.id)}
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
                    <h3 className="font-semibold text-lg mb-2">{selectedDocument.name}</h3>
                    <p className="text-gray-400">{selectedDocument.description}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Current Collaborators</Label>
                    <div className="space-y-2 mt-2">
                      {selectedDocument.collaborators?.map((email: string, index: number) => (
                        <div key={index} className="flex items-center justify-between bg-black/40 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-medium">
                              {email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{email}</div>
                              <div className="text-xs text-gray-400">Editor</div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
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
                    <h3 className="font-semibold text-lg mb-2">{selectedDocument.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-black/40 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {selectedDocument.analytics?.totalViews || 0}
                        </div>
                        <div className="text-sm text-gray-400">Total Views</div>
                      </div>
                      <div className="bg-black/40 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {selectedDocument.analytics?.uniqueViewers || 0}
                        </div>
                        <div className="text-sm text-gray-400">Unique Viewers</div>
                      </div>
                      <div className="bg-black/40 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-400">
                          {selectedDocument.analytics?.avgTimeSpent || "0:00"}
                        </div>
                        <div className="text-sm text-gray-400">Avg. Time Spent</div>
                      </div>
                      <div className="bg-black/40 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {selectedDocument.analytics?.completionRate || 0}%
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
        </div>
      </main>
    </div>
  );
};

export default DocsDecks;
