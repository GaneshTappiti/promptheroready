import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, MessageSquare, Tag, ArrowLeft, Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WorkspaceLayout } from "@/components/ui/workspace-layout";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";

interface IdeaComment {
  id: number;
  author: string;
  text: string;
  date: string;
}

const IdeaDetails = () => {
  const { ideaId } = useParams<{ ideaId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // In production, this would load the idea from the database
  const idea = null; // Will be loaded from user's actual idea data
  
  if (!idea) {
    return (
      <WorkspaceLayout>
        <div className="container mx-auto py-8">
          <h1 className="text-2xl font-bold">Idea not found</h1>
          <Button 
            className="mt-4" 
            onClick={() => navigate("/workspace/idea-vault")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Idea Vault
          </Button>
        </div>
      </WorkspaceLayout>
    );
  }
  
  const handleVote = () => {
    toast({
      title: "Vote added!",
      description: "You've upvoted this idea.",
    });
  };
  
  const handleCommentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const commentInput = form.elements.namedItem("comment") as HTMLTextAreaElement;
    
    if (commentInput.value.trim()) {
      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
      commentInput.value = "";
    }
  };
  
  return (
    <WorkspaceLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate("/workspace/idea-vault")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Idea Vault
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">{idea.title}</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10">
                <Trash className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {idea.tags.map((tag, index) => (
              <div key={index} className="bg-white/10 px-2 py-1 rounded-full text-xs flex items-center">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </div>
            ))}
            <span className={`ml-2 px-3 py-1 rounded-full text-xs uppercase ${
              idea.status === 'validated' 
                ? 'bg-green-500/20 text-green-300' 
                : idea.status === 'exploring'
                  ? 'bg-yellow-500/20 text-yellow-300'
                  : 'bg-gray-500/20 text-gray-300'
            }`}>
              {idea.status}
            </span>
          </div>
          
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <ThumbsUp 
                className="h-4 w-4 cursor-pointer hover:text-primary" 
                onClick={handleVote}
              />
              <span>{idea.votes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{idea.comments.length}</span>
            </div>
            <span>Updated {idea.updatedAt}</span>
          </div>
        </div>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="whitespace-pre-line">{idea.longDescription}</p>
          </CardContent>
        </Card>
        
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Comments</h2>
          
          <Card className="mb-4">
            <CardContent className="pt-6">
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <textarea 
                  name="comment" 
                  className="w-full p-3 rounded-md bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add a comment..."
                  rows={3}
                ></textarea>
                <div className="flex justify-end">
                  <Button type="submit">Post Comment</Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {idea.comments.length > 0 ? (
            <div className="space-y-4">
              {idea.comments.map(comment => (
                <Card key={comment.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{comment.author}</span>
                      <span className="text-sm text-muted-foreground">{comment.date}</span>
                    </div>
                    <p>{comment.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
};

export default IdeaDetails;
