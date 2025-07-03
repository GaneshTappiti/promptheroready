import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useAdmin, withAdminAuth } from '@/contexts/AdminContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { aiToolsSyncService } from '@/services/aiToolsSyncService';
import { aiToolsDatabase } from '@/data/aiToolsDatabase';
import {
  Wrench,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Star,
  ExternalLink,
  RefreshCw,
  Save,
  CheckCircle,
  AlertTriangle,
  Globe,
  Smartphone,
  Monitor,
  Code,
  Download,
  Upload,
  Sync,
  Database,
} from 'lucide-react';

interface AITool {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  pricing_model: 'free' | 'paid' | 'freemium';
  pricing_inr: string;
  is_recommended: boolean;
  supported_platforms: string[];
  input_types: string[];
  tags: string[];
  last_verified_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const categories = [
  'Chatbots',
  'UI/UX Design',
  'Development IDEs',
  'App Builders',
  'Backend Services',
  'Local Tools',
  'Workflow Automation',
  'Deployment',
  'Knowledge Management',
];

const pricingModels = [
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
  { value: 'freemium', label: 'Freemium' },
];

const platforms = [
  'Web',
  'Desktop',
  'Mobile',
  'API',
  'CLI',
  'Browser Extension',
];

const inputTypes = [
  'Text',
  'Image',
  'Code',
  'Voice',
  'File Upload',
  'URL',
];

const AIToolsDirectory: React.FC = () => {
  const { adminUser, checkPermission } = useAdmin();
  const { toast } = useToast();
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPricing, setFilterPricing] = useState('all');
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<AITool | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncStats, setSyncStats] = useState<{staticCount: number; databaseCount: number; lastSync?: string} | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    url: '',
    pricing_model: 'freemium' as const,
    pricing_inr: '',
    is_recommended: false,
    supported_platforms: [] as string[],
    input_types: [] as string[],
    tags: '',
  });

  useEffect(() => {
    fetchTools();
    fetchSyncStats();
  }, []);

  const fetchSyncStats = async () => {
    try {
      const stats = await aiToolsSyncService.getSyncStats();
      setSyncStats(stats);
    } catch (error) {
      console.error('Error fetching sync stats:', error);
    }
  };

  const fetchTools = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_tools_directory')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
      toast({
        title: "Error",
        description: "Failed to fetch AI tools",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncPredefinedTools = async () => {
    if (!adminUser?.id) {
      toast({
        title: "Error",
        description: "Admin user not found",
        variant: "destructive"
      });
      return;
    }

    try {
      setSyncInProgress(true);
      const result = await aiToolsSyncService.syncPredefinedTools(adminUser.id);

      if (result.success) {
        toast({
          title: "Sync Successful",
          description: result.message
        });
        await fetchTools();
        await fetchSyncStats();
      } else {
        toast({
          title: "Sync Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Error",
        description: "Failed to sync predefined tools",
        variant: "destructive"
      });
    } finally {
      setSyncInProgress(false);
    }
  };

  const handleCreateTool = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_tools_directory')
        .insert([{
          name: formData.name,
          description: formData.description,
          category: formData.category,
          url: formData.url,
          pricing_model: formData.pricing_model,
          pricing_inr: formData.pricing_inr,
          is_recommended: formData.is_recommended,
          supported_platforms: formData.supported_platforms,
          input_types: formData.input_types,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          created_by: adminUser?.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setTools(prev => [data, ...prev]);
      setIsCreateModalOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "AI tool added successfully"
      });
    } catch (error) {
      console.error('Error creating tool:', error);
      toast({
        title: "Error",
        description: "Failed to add AI tool",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTool = async () => {
    if (!editingTool) return;

    try {
      const { data, error } = await supabase
        .from('ai_tools_directory')
        .update({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          url: formData.url,
          pricing_model: formData.pricing_model,
          pricing_inr: formData.pricing_inr,
          is_recommended: formData.is_recommended,
          supported_platforms: formData.supported_platforms,
          input_types: formData.input_types,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingTool.id)
        .select()
        .single();

      if (error) throw error;

      setTools(prev => prev.map(t => t.id === editingTool.id ? data : t));
      setEditingTool(null);
      resetForm();
      toast({
        title: "Success",
        description: "AI tool updated successfully"
      });
    } catch (error) {
      console.error('Error updating tool:', error);
      toast({
        title: "Error",
        description: "Failed to update AI tool",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTool = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;

    try {
      const { error } = await supabase
        .from('ai_tools_directory')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTools(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Success",
        description: "AI tool deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast({
        title: "Error",
        description: "Failed to delete AI tool",
        variant: "destructive"
      });
    }
  };

  const handleVerifyTool = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_tools_directory')
        .update({
          last_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      setTools(prev => prev.map(t =>
        t.id === id
          ? { ...t, last_verified_at: new Date().toISOString() }
          : t
      ));

      toast({
        title: "Success",
        description: "Tool verification updated"
      });
    } catch (error) {
      console.error('Error verifying tool:', error);
      toast({
        title: "Error",
        description: "Failed to verify tool",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      url: '',
      pricing_model: 'freemium',
      pricing_inr: '',
      is_recommended: false,
      supported_platforms: [],
      input_types: [],
      tags: '',
    });
  };

  const openEditModal = (tool: AITool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      description: tool.description,
      category: tool.category,
      url: tool.url,
      pricing_model: tool.pricing_model,
      pricing_inr: tool.pricing_inr,
      is_recommended: tool.is_recommended,
      supported_platforms: tool.supported_platforms,
      input_types: tool.input_types,
      tags: tool.tags.join(', '),
    });
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || tool.category === filterCategory;
    const matchesPricing = filterPricing === 'all' || tool.pricing_model === filterPricing;
    const matchesRecommended = !showRecommendedOnly || tool.is_recommended;

    return matchesSearch && matchesCategory && matchesPricing && matchesRecommended;
  });

  const getPricingBadge = (pricing: string) => {
    switch (pricing) {
      case 'free':
        return <Badge className="bg-green-600/20 text-green-400 border-green-500/30">Free</Badge>;
      case 'paid':
        return <Badge className="bg-red-600/20 text-red-400 border-red-500/30">Paid</Badge>;
      case 'freemium':
        return <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30">Freemium</Badge>;
      default:
        return <Badge variant="secondary">{pricing}</Badge>;
    }
  };

  const getVerificationStatus = (lastVerified: string | null) => {
    if (!lastVerified) {
      return <Badge className="bg-gray-600/20 text-gray-400 border-gray-500/30">Not Verified</Badge>;
    }

    const verifiedDate = new Date(lastVerified);
    const daysSince = Math.floor((Date.now() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince <= 30) {
      return <Badge className="bg-green-600/20 text-green-400 border-green-500/30">Recently Verified</Badge>;
    } else if (daysSince <= 90) {
      return <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30">Needs Verification</Badge>;
    } else {
      return <Badge className="bg-red-600/20 text-red-400 border-red-500/30">Outdated</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">AI Tools Directory</h1>
          <div className="animate-pulse h-8 w-32 bg-white/10 rounded"></div>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="workspace-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-white/10 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Dashboard */}
      {syncStats && (
        <Card className="workspace-card mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="h-5 w-5" />
              AI Tools Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{syncStats.staticCount}</div>
                <div className="text-sm text-gray-400">Static Tools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{syncStats.databaseCount}</div>
                <div className="text-sm text-gray-400">Database Tools</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  syncStats.databaseCount >= syncStats.staticCount ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {syncStats.databaseCount >= syncStats.staticCount ? '✅' : '⚠️'}
                </div>
                <div className="text-sm text-gray-400">
                  {syncStats.databaseCount >= syncStats.staticCount ? 'Synced' : 'Needs Sync'}
                </div>
              </div>
            </div>
            {syncStats.lastSync && (
              <div className="mt-4 text-center text-sm text-gray-400">
                Last sync: {new Date(syncStats.lastSync).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Tools Directory</h1>
          <p className="text-gray-400 mt-1">
            Manage AI tools shown in IdeaForge recommendations
          </p>
        </div>
        <div className="flex items-center gap-2">
          {syncStats && (
            <div className="text-sm text-gray-400 mr-4">
              <div>Static: {syncStats.staticCount} | DB: {syncStats.databaseCount}</div>
              {syncStats.lastSync && (
                <div className="text-xs">Last sync: {new Date(syncStats.lastSync).toLocaleDateString()}</div>
              )}
            </div>
          )}
          <Button
            onClick={handleSyncPredefinedTools}
            disabled={syncInProgress}
            variant="outline"
            size="sm"
            className="border-green-500/20 text-green-400 hover:bg-green-500/10"
          >
            {syncInProgress ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sync className="mr-2 h-4 w-4" />
            )}
            {syncInProgress ? 'Syncing...' : 'Sync Predefined'}
          </Button>
          <Button
            onClick={fetchTools}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Tool
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-black/90 backdrop-blur-xl border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Add New AI Tool</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Tool Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-black/20 border-white/20 text-white"
                      placeholder="e.g., ChatGPT"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="bg-black/20 border-white/20 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/20">
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-black/20 border-white/20 text-white"
                    placeholder="Brief description of the tool..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      className="bg-black/20 border-white/20 text-white"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricing_model">Pricing Model</Label>
                    <Select value={formData.pricing_model} onValueChange={(value: 'free' | 'paid' | 'freemium') => setFormData(prev => ({ ...prev, pricing_model: value }))}>
                      <SelectTrigger className="bg-black/20 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/20">
                        {pricingModels.map(model => (
                          <SelectItem key={model.value} value={model.value}>{model.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="pricing_inr">Pricing (INR)</Label>
                  <Input
                    id="pricing_inr"
                    value={formData.pricing_inr}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricing_inr: e.target.value }))}
                    className="bg-black/20 border-white/20 text-white"
                    placeholder="e.g., ₹999/month or Free"
                  />
                </div>

                <div>
                  <Label>Supported Platforms</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {platforms.map(platform => (
                      <div key={platform} className="flex items-center space-x-2">
                        <Checkbox
                          id={`platform-${platform}`}
                          checked={formData.supported_platforms.includes(platform)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                supported_platforms: [...prev.supported_platforms, platform]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                supported_platforms: prev.supported_platforms.filter(p => p !== platform)
                              }));
                            }
                          }}
                          className="border-white/20"
                        />
                        <Label htmlFor={`platform-${platform}`} className="text-sm text-gray-300">
                          {platform}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Input Types</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {inputTypes.map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`input-${type}`}
                          checked={formData.input_types.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                input_types: [...prev.input_types, type]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                input_types: prev.input_types.filter(t => t !== type)
                              }));
                            }
                          }}
                          className="border-white/20"
                        />
                        <Label htmlFor={`input-${type}`} className="text-sm text-gray-300">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="bg-black/20 border-white/20 text-white"
                    placeholder="ai, chatbot, productivity"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_recommended"
                    checked={formData.is_recommended}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recommended: !!checked }))}
                    className="border-white/20"
                  />
                  <Label htmlFor="is_recommended" className="text-sm text-gray-300">
                    Mark as recommended
                  </Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      resetForm();
                    }}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateTool}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={!formData.name || !formData.description || !formData.category}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Add Tool
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="workspace-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/20 border-white/20 text-white"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[150px] bg-black/20 border-white/20 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/20">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPricing} onValueChange={setFilterPricing}>
              <SelectTrigger className="w-[120px] bg-black/20 border-white/20 text-white">
                <SelectValue placeholder="Pricing" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/20">
                <SelectItem value="all">All Pricing</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="freemium">Freemium</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recommended-only"
                checked={showRecommendedOnly}
                onCheckedChange={setShowRecommendedOnly}
                className="border-white/20"
              />
              <Label htmlFor="recommended-only" className="text-sm text-gray-300">
                Recommended only
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tools List */}
      <div className="space-y-4">
        {filteredTools.length === 0 ? (
          <Card className="workspace-card">
            <CardContent className="p-8 text-center">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No tools found</h3>
              <p className="text-gray-400">
                {searchTerm || filterCategory !== 'all' || filterPricing !== 'all' || showRecommendedOnly
                  ? 'Try adjusting your search or filters'
                  : 'Add your first AI tool to get started'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTools.map((tool) => (
            <Card key={tool.id} className="workspace-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-white flex items-center gap-2">
                        {tool.name}
                        {tool.is_recommended && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                      </CardTitle>
                      {getPricingBadge(tool.pricing_model)}
                      <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                        {tool.category}
                      </Badge>
                      {getVerificationStatus(tool.last_verified_at)}
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{tool.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {tool.url}
                      </span>
                      <span>₹{tool.pricing_inr}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {tool.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-white/10 text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(tool.url, '_blank')}
                      className="text-gray-400 hover:text-white hover:bg-white/10"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVerifyTool(tool.id)}
                      className="text-gray-400 hover:text-green-400 hover:bg-green-500/10"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(tool)}
                      className="text-gray-400 hover:text-white hover:bg-white/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTool(tool.id)}
                      className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="text-gray-300 font-medium mb-2">Supported Platforms</h4>
                    <div className="flex flex-wrap gap-1">
                      {tool.supported_platforms.map(platform => (
                        <Badge key={platform} variant="outline" className="text-xs border-white/20 text-gray-400">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-gray-300 font-medium mb-2">Input Types</h4>
                    <div className="flex flex-wrap gap-1">
                      {tool.input_types.map(type => (
                        <Badge key={type} variant="outline" className="text-xs border-white/20 text-gray-400">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                  <span>
                    Last verified: {tool.last_verified_at
                      ? new Date(tool.last_verified_at).toLocaleDateString()
                      : 'Never'
                    }
                  </span>
                  <span>Updated: {new Date(tool.updated_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Modal - Similar structure to create modal */}
      <Dialog open={!!editingTool} onOpenChange={(open) => !open && setEditingTool(null)}>
        <DialogContent className="max-w-2xl bg-black/90 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Edit AI Tool</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Same form fields as create modal - abbreviated for space */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Tool Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="bg-black/20 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20">
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-black/20 border-white/20 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-url">URL</Label>
                <Input
                  id="edit-url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-pricing_inr">Pricing (INR)</Label>
                <Input
                  id="edit-pricing_inr"
                  value={formData.pricing_inr}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricing_inr: e.target.value }))}
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-is_recommended"
                checked={formData.is_recommended}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recommended: !!checked }))}
                className="border-white/20"
              />
              <Label htmlFor="edit-is_recommended" className="text-sm text-gray-300">
                Mark as recommended
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingTool(null);
                  resetForm();
                }}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateTool}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={!formData.name || !formData.description || !formData.category}
              >
                <Save className="mr-2 h-4 w-4" />
                Update Tool
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default withAdminAuth(AIToolsDirectory, 'canManageTools');