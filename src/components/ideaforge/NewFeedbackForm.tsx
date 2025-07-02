import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Star,
  Brain,
  BarChart3,
  MessageSquare,
  Mail,
  Target,
  X,
  Plus
} from "lucide-react";

// Types
type FeedbackSource = 'user-interview' | 'mentor' | 'ai' | 'survey' | 'discord' | 'email' | 'form';
type FeedbackType = 'positive' | 'negative' | 'feature-request' | 'confusion' | 'validation' | 'concern';
type FeedbackStatus = 'new' | 'reviewed' | 'actioned' | 'archived' | 'rejected';

interface FeedbackItem {
  source: FeedbackSource;
  type: FeedbackType;
  status: FeedbackStatus;
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

interface NewFeedbackFormProps {
  onSubmit: (feedback: Omit<FeedbackItem, 'id'>) => void;
  onCancel: () => void;
}

const NewFeedbackForm: React.FC<NewFeedbackFormProps> = ({ onSubmit, onCancel }) => {
  const { toast } = useToast();
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [source, setSource] = useState<FeedbackSource>('user-interview');
  const [type, setType] = useState<FeedbackType>('positive');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [sentiment, setSentiment] = useState([0]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // Configuration
  const feedbackSources = [
    { value: 'user-interview', label: 'User Interview', icon: Users },
    { value: 'mentor', label: 'Mentor', icon: Star },
    { value: 'ai', label: 'AI Analysis', icon: Brain },
    { value: 'survey', label: 'Survey', icon: BarChart3 },
    { value: 'discord', label: 'Discord', icon: MessageSquare },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'form', label: 'Form', icon: Target }
  ];

  const feedbackTypes = [
    { value: 'positive', label: 'Positive', color: 'bg-green-500' },
    { value: 'negative', label: 'Negative', color: 'bg-red-500' },
    { value: 'feature-request', label: 'Feature Request', color: 'bg-blue-500' },
    { value: 'confusion', label: 'Confusion', color: 'bg-orange-500' },
    { value: 'validation', label: 'Validation', color: 'bg-purple-500' },
    { value: 'concern', label: 'Concern', color: 'bg-yellow-500' }
  ];

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !author.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (title, content, and author).",
        variant: "destructive"
      });
      return;
    }

    const feedback: Omit<FeedbackItem, 'id'> = {
      source,
      type,
      status: 'new',
      title: title.trim(),
      content: content.trim(),
      author: author.trim(),
      authorEmail: authorEmail.trim() || undefined,
      date: new Date().toISOString(),
      tags,
      priority,
      sentiment: sentiment[0],
      aiGenerated: false
    };

    onSubmit(feedback);
  };

  const getSentimentLabel = (value: number) => {
    if (value > 0.5) return "Very Positive 😍";
    if (value > 0) return "Positive 😊";
    if (value > -0.5) return "Neutral 😐";
    return "Negative 😞";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief summary of the feedback..."
          required
        />
      </div>

      {/* Source and Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="source">Source *</Label>
          <Select value={source} onValueChange={(value) => setSource(value as FeedbackSource)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {feedbackSources.map((src) => (
                <SelectItem key={src.value} value={src.value}>
                  <div className="flex items-center gap-2">
                    <src.icon className="h-4 w-4" />
                    {src.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select value={type} onValueChange={(value) => setType(value as FeedbackType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {feedbackTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${t.color}`} />
                    {t.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Detailed feedback content..."
          rows={4}
          required
        />
      </div>

      {/* Author Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="author">Author *</Label>
          <Input
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Name of the person providing feedback"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="authorEmail">Author Email</Label>
          <Input
            id="authorEmail"
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            placeholder="Optional email address"
          />
        </div>
      </div>

      {/* Priority and Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={(value) => setPriority(value as 'high' | 'medium' | 'low')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sentiment">Sentiment: {getSentimentLabel(sentiment[0])}</Label>
          <Slider
            value={sentiment}
            onValueChange={setSentiment}
            max={1}
            min={-1}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
          />
          <Button type="button" onClick={handleAddTag} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Feedback
        </Button>
      </div>
    </form>
  );
};

export default NewFeedbackForm;
