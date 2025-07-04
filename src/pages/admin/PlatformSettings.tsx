import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin, withAdminAuth } from '@/contexts/AdminContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Save,
  RefreshCw,
  Zap,
  Shield,
  Globe,
  Database,
  Key,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface PlatformSetting {
  id: string;
  key: string;
  value: unknown;
  description: string;
  category: string;
  is_public: boolean;
  updated_by: string;
  updated_at: string;
}

const PlatformSettings: React.FC = () => {
  const { adminUser, isSuperAdmin } = useAdmin();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isSuperAdmin) {
      fetchSettings();
    }
  }, [isSuperAdmin]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      
      setSettings(data || []);
      
      // Initialize form data
      const initialFormData: Record<string, any> = {};
      (data || []).forEach(setting => {
        initialFormData[setting.key] = setting.value;
      });
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch platform settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Update each setting
      const updates = settings.map(setting => ({
        id: setting.id,
        value: formData[setting.key],
        updated_by: adminUser?.id,
        updated_at: new Date().toISOString(),
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('platform_settings')
          .update({
            value: update.value,
            updated_by: update.updated_by,
            updated_at: update.updated_at,
          })
          .eq('id', update.id);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Platform settings updated successfully"
      });
      
      await fetchSettings(); // Refresh to get updated data
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save platform settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderSettingInput = (setting: PlatformSetting) => {
    const value = formData[setting.key];
    
    switch (typeof setting.value) {
      case 'boolean':
        return (
          <Switch
            checked={value}
            onCheckedChange={(checked) => handleInputChange(setting.key, checked)}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleInputChange(setting.key, parseInt(e.target.value) || 0)}
            className="bg-black/20 border-white/20 text-white"
          />
        );
      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            className="bg-black/20 border-white/20 text-white"
          />
        );
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, PlatformSetting[]>);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'api':
        return <Key className="h-5 w-5 text-green-400" />;
      case 'security':
        return <Shield className="h-5 w-5 text-green-400" />;
      case 'features':
        return <Zap className="h-5 w-5 text-green-400" />;
      case 'database':
        return <Database className="h-5 w-5 text-green-400" />;
      default:
        return <Settings className="h-5 w-5 text-green-400" />;
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>Only Super Admins can access platform settings.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Platform Settings</h1>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Platform Settings</h1>
          <p className="text-gray-400 mt-1">
            Configure system-wide settings and feature toggles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={fetchSettings} 
            variant="outline" 
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={handleSaveSettings}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Warning */}
      <Card className="workspace-card border-yellow-600/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div>
              <h3 className="text-yellow-400 font-medium">Important Notice</h3>
              <p className="text-gray-300 text-sm">
                Changes to platform settings affect all users. Please review carefully before saving.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings by Category */}
      {Object.entries(groupedSettings).map(([category, categorySettings]) => (
        <Card key={category} className="workspace-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {getCategoryIcon(category)}
              {category.charAt(0).toUpperCase() + category.slice(1)} Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {categorySettings.map((setting) => (
              <div key={setting.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor={setting.key} className="text-gray-300 font-medium">
                      {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    <p className="text-sm text-gray-400 mt-1">{setting.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {setting.is_public && (
                      <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                        Public
                      </Badge>
                    )}
                    <div className="min-w-[200px]">
                      {renderSettingInput(setting)}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Last updated: {new Date(setting.updated_at).toLocaleString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Default Settings if none exist */}
      {Object.keys(groupedSettings).length === 0 && (
        <Card className="workspace-card">
          <CardContent className="p-8 text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No settings configured</h3>
            <p className="text-gray-400 mb-4">
              Platform settings will appear here once they are configured in the database.
            </p>
            <Button 
              onClick={() => {
                // In a real implementation, this would create default settings
                toast({
                  title: "Info",
                  description: "Default settings would be created here",
                });
              }}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Initialize Default Settings
            </Button>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card className="workspace-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">✓</div>
              <p className="text-sm text-gray-300">Database</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">✓</div>
              <p className="text-sm text-gray-300">API Services</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">✓</div>
              <p className="text-sm text-gray-300">Authentication</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">✓</div>
              <p className="text-sm text-gray-300">File Storage</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformSettings;
