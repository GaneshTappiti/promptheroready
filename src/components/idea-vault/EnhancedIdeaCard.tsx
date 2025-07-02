import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  MessageSquare,
  ThumbsUp,
  Star,
  MoreHorizontal,
  Brain,
  Users,
  Share2,
  FileText,
  Presentation,
  ExternalLink,
  Clock,
  Target,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Eye,
  GripVertical,
  Sparkles
} from 'lucide-react';

interface IdeaCardProps {
  idea: {
    id: number;
    title: string;
    description: string;
    tags: string[];
    votes: number;
    comments: number;
    status: "validated" | "exploring" | "archived" | "draft";
    priority?: "low" | "medium" | "high";
    validationScore?: number;
    potentialRevenue?: string;
    timeToMarket?: string;
    collaborators?: Array<{
      id: string;
      name: string;
      avatar?: string;
      role: "owner" | "collaborator" | "viewer";
    }>;
    aiInsights?: {
      nextSteps: string[];
      marketOpportunity: string;
      riskAssessment: string;
      recommendedTools: string[];
      lastAnalyzed: string;
    };
    isShared?: boolean;
    category?: string;
    createdAt?: string;
    lastUpdated?: string;
  };
  onGenerateInsights: (idea: any) => void;
  onAddToPitchDeck?: (idea: any) => void;
  isGeneratingInsights?: boolean;
  isDragging?: boolean;
  onDragStart?: (idea: any) => void;
  onDragEnd?: () => void;
  onClick?: (idea: any) => void;
}

const EnhancedIdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  onGenerateInsights,
  onAddToPitchDeck,
  isGeneratingInsights = false,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onClick
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'exploring': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'archived': return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
      case 'draft': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  return (
    <TooltipProvider>
      <Card 
        className={`bg-black/20 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group ${
          isDragging ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'
        }`}
        draggable
        onDragStart={() => onDragStart?.(idea)}
        onDragEnd={onDragEnd}
        onClick={() => onClick?.(idea)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {/* Drag Handle */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-white text-sm group-hover:text-green-400 transition-colors">
                    {idea.title}
                  </h3>
                  {idea.priority && (
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(idea.priority)}`} />
                  )}
                  {idea.isShared && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Users className="h-3 w-3 text-blue-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Shared with team</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                
                <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                  {idea.description}
                </p>
                
                {/* Tags - Show only top 3 */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {idea.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-2 py-0.5 border-white/20">
                      {tag}
                    </Badge>
                  ))}
                  {idea.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5 border-white/20 text-gray-400">
                      +{idea.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 backdrop-blur-xl border-white/10">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onGenerateInsights(idea); }}>
                  <Brain className="h-4 w-4 mr-2" />
                  AI Insights
                </DropdownMenuItem>
                {onAddToPitchDeck && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddToPitchDeck(idea); }}>
                    <Presentation className="h-4 w-4 mr-2" />
                    Add to Pitch Deck
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Status and Validation Score */}
          <div className="flex items-center justify-between mb-3">
            <Badge className={`text-xs px-2 py-1 ${getStatusColor(idea.status)}`}>
              {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
            </Badge>
            {idea.validationScore && (
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-400">{idea.validationScore}%</span>
              </div>
            )}
          </div>
          
          {/* Validation Progress */}
          {idea.validationScore && (
            <div className="mb-3">
              <Progress value={idea.validationScore} className="h-1" />
            </div>
          )}
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            {idea.potentialRevenue && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-green-400" />
                <span className="text-gray-400">{idea.potentialRevenue}</span>
              </div>
            )}
            {idea.timeToMarket && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-400" />
                <span className="text-gray-400">{idea.timeToMarket}</span>
              </div>
            )}
          </div>
          
          {/* AI Insights Preview */}
          {idea.aiInsights && (
            <div className="mb-3 p-2 bg-green-600/10 border border-green-600/20 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <Sparkles className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400 font-medium">AI Insights</span>
              </div>
              <p className="text-xs text-gray-300 line-clamp-2">
                {idea.aiInsights.marketOpportunity}
              </p>
            </div>
          )}
          
          {/* Collaborators */}
          {idea.collaborators && idea.collaborators.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex -space-x-1">
                {idea.collaborators.slice(0, 3).map((collaborator, index) => (
                  <Tooltip key={collaborator.id}>
                    <TooltipTrigger>
                      <Avatar className="h-5 w-5 border border-white/20">
                        <AvatarImage src={collaborator.avatar} />
                        <AvatarFallback className="text-xs bg-gray-700">
                          {collaborator.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{collaborator.name} ({collaborator.role})</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {idea.collaborators.length > 3 && (
                  <div className="h-5 w-5 rounded-full bg-gray-700 border border-white/20 flex items-center justify-center">
                    <span className="text-xs text-gray-300">+{idea.collaborators.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-400">{idea.votes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-400">{idea.comments}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isGeneratingInsights && (
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 animate-spin rounded-full border border-green-400 border-t-transparent" />
                  <span className="text-xs text-green-400">Analyzing...</span>
                </div>
              )}
              <span className="text-xs text-gray-500">{formatTimeAgo(idea.lastUpdated)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default EnhancedIdeaCard;
