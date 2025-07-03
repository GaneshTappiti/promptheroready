import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Edit2, Save, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";

const WikiPage = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(
    "# Getting Started Guide\n\n" +
    "Welcome to your startup's knowledge base! This guide will help you get started with documenting your ideas, processes, and learnings.\n\n" +
    "## Key Features\n\n" +
    "- Create and organize pages\n" +
    "- Collaborate with team members\n" +
    "- Track changes and versions\n" +
    "- Search across all content\n\n" +
    "## Getting Started\n\n" +
    "1. Create your first page\n" +
    "2. Add content using markdown\n" +
    "3. Organize with categories\n" +
    "4. Share with your team"
  );

  const handleSave = () => {
    // TODO: Implement save functionality
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="layout-container bg-gradient-to-br from-black via-gray-900 to-green-950">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="layout-main flex flex-col items-center justify-center px-4 py-8 md:py-0 transition-all duration-300">
        {/* Top navigation with hamburger menu */}
        <div className="flex items-center gap-4 mb-6 w-full max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-black/30"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
          <div className="flex-1">
            {/* Page-specific navigation can go here */}
          </div>
        </div>
        <div className="w-full max-w-3xl mx-auto bg-black/80 rounded-2xl shadow-lg p-8 flex flex-col">
          <header className="mb-6 flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold flex-grow">Wiki Page</h1>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
          </header>
          {isEditing ? (
            <>
              <Textarea
                className="w-full h-64 mb-4 bg-white/5 border-none text-white placeholder:text-muted-foreground rounded-lg"
                value={content}
                onChange={e => setContent(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>
            </>
          ) : (
            <pre className="whitespace-pre-wrap text-white bg-transparent mb-4">{content}</pre>
          )}
        </div>
      </main>
    </div>
  );
};

export default WikiPage; 