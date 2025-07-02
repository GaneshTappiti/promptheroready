import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Save, ChevronLeft, Edit2 } from "lucide-react";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";

const WikiPageEditor = () => {
  const { pageId } = useParams();
  const [title, setTitle] = useState("Example Wiki Page");
  const [content, setContent] = useState("This is a placeholder for the actual content of the wiki page.");

  const handleSave = () => {
    // Save functionality would go here
    // Redirect would happen here in a real implementation
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-black via-gray-900 to-green-950">
      <WorkspaceSidebar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-0 md:ml-64 transition-all duration-300">
        <div className="w-full max-w-3xl mx-auto bg-black/80 rounded-2xl shadow-lg p-8 flex flex-col">
          <header className="mb-6 flex items-center gap-2">
            <Link to="/workspace/idea-wiki" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mr-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
            <h1 className="text-2xl font-bold flex-grow">Edit Wiki Page</h1>
          </header>
            <Input
            className="mb-4 bg-white/5 border-none text-white placeholder:text-muted-foreground rounded-lg"
              value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <Textarea
            className="w-full h-64 mb-4 bg-white/5 border-none text-white placeholder:text-muted-foreground rounded-lg"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Link to="/workspace/idea-wiki" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">Cancel</Link>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </div>
      </main>
      </div>
  );
};

export default WikiPageEditor;
