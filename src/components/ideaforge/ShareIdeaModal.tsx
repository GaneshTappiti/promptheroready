import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Share2,
  Copy,
  Mail,
  Link,
  Users,
  Eye,
  EyeOff,
  Download,
  MessageSquare
} from "lucide-react";

interface ShareIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaTitle: string;
  ideaId: string;
}

const ShareIdeaModal: React.FC<ShareIdeaModalProps> = ({
  isOpen,
  onClose,
  ideaTitle,
  ideaId
}) => {
  const { toast } = useToast();
  const [shareSettings, setShareSettings] = useState({
    includeWiki: true,
    includeBlueprint: true,
    includeJourney: false,
    includeFeedback: false,
    allowComments: true,
    isPublic: false
  });
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  // Generate shareable link (mock implementation)
  const shareableLink = `https://ideaforge.app/shared/${ideaId}?token=abc123`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    toast({
      title: "Link Copied",
      description: "Shareable link has been copied to your clipboard."
    });
  };

  const handleEmailShare = () => {
    if (!collaboratorEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to share with.",
        variant: "destructive"
      });
      return;
    }

    // Simple email sharing
    const subject = `Check out my startup idea: ${ideaTitle}`;
    const body = `Hi there!\n\nI'd like to share my startup idea "${ideaTitle}" with you for feedback.\n\n${shareMessage}\n\nYou can view the details here: ${shareableLink}\n\nLet me know what you think!\n\nBest regards`;

    const mailtoLink = `mailto:${collaboratorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);

    toast({
      title: "Email Opened",
      description: "Your email client has been opened with the sharing details."
    });
  };

  const handleGeneratePublicLink = () => {
    setShareSettings(prev => ({ ...prev, isPublic: true }));
    toast({
      title: "Public Link Generated",
      description: "Your idea is now publicly accessible via the shareable link."
    });
  };

  const getIncludedSections = () => {
    const sections = [];
    if (shareSettings.includeWiki) sections.push("Wiki");
    if (shareSettings.includeBlueprint) sections.push("Blueprint");
    if (shareSettings.includeJourney) sections.push("Journey");
    if (shareSettings.includeFeedback) sections.push("Feedback");
    return sections;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share "{ideaTitle}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold">What to Share</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="wiki">Wiki Knowledge Base</Label>
                <Switch
                  id="wiki"
                  checked={shareSettings.includeWiki}
                  onCheckedChange={(checked) =>
                    setShareSettings(prev => ({ ...prev, includeWiki: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="blueprint">Product Blueprint</Label>
                <Switch
                  id="blueprint"
                  checked={shareSettings.includeBlueprint}
                  onCheckedChange={(checked) =>
                    setShareSettings(prev => ({ ...prev, includeBlueprint: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="journey">Founder Journey</Label>
                <Switch
                  id="journey"
                  checked={shareSettings.includeJourney}
                  onCheckedChange={(checked) =>
                    setShareSettings(prev => ({ ...prev, includeJourney: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="feedback">Feedback & Validation</Label>
                <Switch
                  id="feedback"
                  checked={shareSettings.includeFeedback}
                  onCheckedChange={(checked) =>
                    setShareSettings(prev => ({ ...prev, includeFeedback: checked }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <h3 className="font-semibold">Permissions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="comments">Allow Comments</Label>
                  <p className="text-sm text-muted-foreground">Let viewers add feedback and suggestions</p>
                </div>
                <Switch
                  id="comments"
                  checked={shareSettings.allowComments}
                  onCheckedChange={(checked) =>
                    setShareSettings(prev => ({ ...prev, allowComments: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="public">Public Access</Label>
                  <p className="text-sm text-muted-foreground">Anyone with the link can view</p>
                </div>
                <Switch
                  id="public"
                  checked={shareSettings.isPublic}
                  onCheckedChange={(checked) =>
                    setShareSettings(prev => ({ ...prev, isPublic: checked }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Share Preview */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Share Preview</h4>
            <div className="flex items-center gap-2 mb-2">
              {shareSettings.isPublic ? (
                <Eye className="h-4 w-4 text-green-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-orange-600" />
              )}
              <span className="text-sm">
                {shareSettings.isPublic ? "Public" : "Private"} access
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {getIncludedSections().map((section) => (
                <Badge key={section} variant="secondary" className="text-xs">
                  {section}
                </Badge>
              ))}
            </div>
            {shareSettings.allowComments && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                Comments enabled
              </div>
            )}
          </div>

          {/* Shareable Link */}
          <div className="space-y-3">
            <Label htmlFor="shareLink">Shareable Link</Label>
            <div className="flex gap-2">
              <Input
                id="shareLink"
                value={shareableLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={handleCopyLink} size="sm">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Email Collaboration */}
          <div className="space-y-3">
            <Label htmlFor="collaboratorEmail">Invite Collaborator</Label>
            <Input
              id="collaboratorEmail"
              type="email"
              placeholder="Enter email address..."
              value={collaboratorEmail}
              onChange={(e) => setCollaboratorEmail(e.target.value)}
            />
            <Textarea
              placeholder="Add a personal message (optional)..."
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              rows={3}
            />
            <Button onClick={handleEmailShare} className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCopyLink} className="flex-1">
              <Link className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareIdeaModal;
