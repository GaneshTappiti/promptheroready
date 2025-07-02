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

  const mockIdeas = [
    {
      id: 1,
      title: "HealthTrack App",
      description: "A fitness tracking app specifically designed for seniors with simplified UI and health monitoring features.",
      longDescription: "The HealthTrack App aims to solve the problem of technology accessibility for seniors who want to monitor their health. Many existing fitness apps are complicated and not designed with older users in mind.\n\nOur solution provides large, easy-to-read UI elements, simplified navigation, emergency contact features, medication reminders, and integration with common health monitoring devices. The app will focus on metrics most relevant to seniors like blood pressure, heart rate, medication adherence, and activity levels appropriate for their age group.",
      tags: ["Health", "Mobile App", "Seniors"],
      votes: 12,
      comments: [
        {
          id: 1, 
          author: "Jane Smith", 
          text: "I think we should add voice commands for users who have difficulty with touch screens.", 
          date: "2025-05-01"
        },
        {
          id: 2, 
          author: "Mark Johnson", 
          text: "Have you considered partnering with retirement communities for initial user testing?", 
          date: "2025-05-05"
        }
      ],
      status: "validated",
      createdAt: "2025-04-15",
      updatedAt: "2025-05-10"
    },
    {
      id: 2,
      title: "EcoMarket",
      description: "Marketplace for sustainable goods with carbon footprint tracking and eco-friendly product verification.",
      longDescription: "EcoMarket will be a specialized e-commerce platform dedicated to sustainable and eco-friendly products. The key differentiator is our carbon footprint tracking system that allows consumers to understand the environmental impact of their purchases.\n\nThe platform will include a rigorous verification process for sellers, ensuring all products meet our sustainability standards. Consumers can filter products based on various environmental factors like packaging, materials, manufacturing process, and shipping distance.",
      tags: ["Marketplace", "Sustainability", "E-commerce"],
      votes: 8,
      comments: [
        {
          id: 1,
          author: "Alex Green",
          text: "We should implement a reward system for consumers who consistently make eco-friendly choices.",
          date: "2025-05-03"
        }
      ],
      status: "exploring",
      createdAt: "2025-04-20",
      updatedAt: "2025-05-03"
    },
    {
      id: 3,
      title: "CodeBuddy",
      description: "AI pair programming assistant that helps developers with code reviews and suggestions in real-time.",
      longDescription: "CodeBuddy is an AI-powered coding assistant designed to act as a virtual pair programmer. It integrates with popular IDEs and provides real-time code suggestions, identifies potential bugs, and offers optimization recommendations.\n\nUnlike existing tools that just provide snippets or auto-completion, CodeBuddy understands the context of your entire project and makes suggestions based on best practices specific to your programming language and framework. It can also explain its reasoning, helping developers learn and improve their skills over time.",
      tags: ["AI", "Developer Tools", "Productivity"],
      votes: 15,
      comments: [
        {
          id: 1,
          author: "David Chen",
          text: "Would be great to have it integrate with GitHub PR reviews as well.",
          date: "2025-05-07"
        },
        {
          id: 2,
          author: "Sarah Miller",
          text: "How will this handle different coding styles and preferences?",
          date: "2025-05-08"
        },
        {
          id: 3,
          author: "Raj Patel",
          text: "I'd love to see language-specific versions optimized for different ecosystems.",
          date: "2025-05-10"
        }
      ],
      status: "validated",
      createdAt: "2025-04-10",
      updatedAt: "2025-05-10"
    },
    {
      id: 4,
      title: "RemoteTeam",
      description: "Virtual workspace platform for remote teams with asynchronous collaboration tools.",
      longDescription: "RemoteTeam is designed to solve the challenges of distributed team collaboration, especially across time zones. The platform creates a persistent virtual office where team members can collaborate both synchronously and asynchronously.\n\nKey features include: customizable virtual spaces that mimic physical office layouts, presence indicators that respect focus time, integrated asynchronous video messaging, cultural team-building activities, and smart notification systems that understand time zones and working hours.",
      tags: ["Remote Work", "Collaboration", "SaaS"],
      votes: 6,
      comments: [
        {
          id: 1,
          author: "Lisa Wong",
          text: "Consider adding virtual water cooler features to help with team bonding.",
          date: "2025-05-02"
        }
      ],
      status: "exploring",
      createdAt: "2025-04-25",
      updatedAt: "2025-05-02"
    }
  ];
  
  const idea = mockIdeas.find(idea => idea.id === Number(ideaId));
  
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
