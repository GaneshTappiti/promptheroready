import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Save,
  User,
  Crown,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
} from 'lucide-react';

interface AdminUser {
  id: string;
  user_id: string;
  role: 'admin' | 'super_admin';
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  user_email?: string;
}

interface AuditLogEntry {
  id: string;
  admin_user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values: unknown;
  new_values: unknown;
  created_at: string;
  admin_email?: string;
}

const RoleManagement: React.FC = () => {
  const { adminUser, isSuperAdmin } = useAdmin();
  const { toast } = useToast();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<{
    email: string;
    role: 'admin' | 'super_admin';
  }>({
    email: '',
    role: 'admin',
  });

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdminUsers();
      fetchAuditLogs();
    }
  }, [isSuperAdmin]);

  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      
      // Get admin users with their email from auth.users
      const { data, error } = await supabase
        .from('admin_users')
        .select(`
          *,
          user_email:user_id (email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to flatten user email
      const transformedData = data?.map(admin => ({
        ...admin,
        user_email: admin.user_email?.email || 'Unknown'
      })) || [];
      
      setAdminUsers(transformedData);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const handleAddAdmin = async () => {
    try {
      // First, find the user by email
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (userError) {
        toast({
          title: "Error",
          description: "User not found with that email address",
          variant: "destructive"
        });
        return;
      }

      // Create admin user
      const { data, error } = await supabase
        .from('admin_users')
        .insert([{
          user_id: userData.id,
          role: formData.role,
          is_active: true,
          created_by: adminUser?.id,
        }])
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await logAuditAction('admin_created', 'admin_user', data.id, null, {
        role: formData.role,
        email: formData.email
      });

      await fetchAdminUsers();
      setIsAddModalOpen(false);
      resetForm();
      
      toast({
        title: "Success",
        description: `Admin user created successfully with ${formData.role} role`
      });
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast({
        title: "Error",
        description: "Failed to create admin user",
        variant: "destructive"
      });
    }
  };

  const handleUpdateAdmin = async () => {
    if (!editingAdmin) return;

    try {
      const oldValues = {
        role: editingAdmin.role,
        is_active: editingAdmin.is_active
      };

      const { data, error } = await supabase
        .from('admin_users')
        .update({
          role: formData.role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingAdmin.id)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await logAuditAction('admin_updated', 'admin_user', editingAdmin.id, oldValues, {
        role: formData.role
      });

      await fetchAdminUsers();
      setEditingAdmin(null);
      resetForm();
      
      toast({
        title: "Success",
        description: "Admin user updated successfully"
      });
    } catch (error) {
      console.error('Error updating admin user:', error);
      toast({
        title: "Error",
        description: "Failed to update admin user",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (admin: AdminUser) => {
    if (admin.user_id === adminUser?.id) {
      toast({
        title: "Error",
        description: "You cannot deactivate your own account",
        variant: "destructive"
      });
      return;
    }

    try {
      const newActiveStatus = !admin.is_active;
      
      const { error } = await supabase
        .from('admin_users')
        .update({
          is_active: newActiveStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', admin.id);

      if (error) throw error;

      // Log the action
      await logAuditAction(
        newActiveStatus ? 'admin_activated' : 'admin_deactivated',
        'admin_user',
        admin.id,
        { is_active: admin.is_active },
        { is_active: newActiveStatus }
      );

      await fetchAdminUsers();
      
      toast({
        title: "Success",
        description: `Admin user ${newActiveStatus ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast({
        title: "Error",
        description: "Failed to update admin status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAdmin = async (admin: AdminUser) => {
    if (admin.user_id === adminUser?.id) {
      toast({
        title: "Error",
        description: "You cannot delete your own account",
        variant: "destructive"
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete admin access for ${admin.user_email}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', admin.id);

      if (error) throw error;

      // Log the action
      await logAuditAction('admin_deleted', 'admin_user', admin.id, {
        role: admin.role,
        email: admin.user_email
      }, null);

      await fetchAdminUsers();
      
      toast({
        title: "Success",
        description: "Admin user deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting admin user:', error);
      toast({
        title: "Error",
        description: "Failed to delete admin user",
        variant: "destructive"
      });
    }
  };

  const logAuditAction = async (
    action: string,
    resourceType: string,
    resourceId: string,
    oldValues: unknown,
    newValues: unknown
  ) => {
    try {
      await supabase
        .from('admin_audit_log')
        .insert([{
          admin_user_id: adminUser?.id,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          old_values: oldValues,
          new_values: newValues,
        }]);
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      role: 'admin',
    });
  };

  const openEditModal = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setFormData({
      email: admin.user_email || '',
      role: admin.role,
    });
  };

  const filteredAdmins = adminUsers.filter(admin =>
    admin.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30">Super Admin</Badge>;
      case 'admin':
        return <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30">Admin</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-600/20 text-green-400 border-green-500/30">Active</Badge>
    ) : (
      <Badge className="bg-red-600/20 text-red-400 border-red-500/30">Inactive</Badge>
    );
  };

  if (!isSuperAdmin) {
    return (
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>Only Super Admins can access role management.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Role Management</h1>
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
          <h1 className="text-3xl font-bold text-white">Role Management</h1>
          <p className="text-gray-400 mt-1">
            Manage admin users and view audit logs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => {
              fetchAdminUsers();
              fetchAuditLogs();
            }} 
            variant="outline" 
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 backdrop-blur-xl border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Add New Admin User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">User Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-black/20 border-white/20 text-white"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value: 'admin' | 'super_admin') => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className="bg-black/20 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/20">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddModalOpen(false);
                      resetForm();
                    }}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddAdmin}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={!formData.email}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Add Admin
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card className="workspace-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search admin users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/20 border-white/20 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Admin Users List */}
      <Card className="workspace-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-400" />
            Admin Users ({filteredAdmins.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAdmins.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No admin users found</h3>
                <p className="text-gray-400">
                  {searchTerm ? 'Try adjusting your search' : 'Add your first admin user to get started'}
                </p>
              </div>
            ) : (
              filteredAdmins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-600/20 rounded-lg">
                      {admin.role === 'super_admin' ? (
                        <Crown className="h-5 w-5 text-purple-400" />
                      ) : (
                        <User className="h-5 w-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium">{admin.user_email}</p>
                        {getRoleBadge(admin.role)}
                        {getStatusBadge(admin.is_active)}
                        {admin.user_id === adminUser?.id && (
                          <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>Created: {new Date(admin.created_at).toLocaleDateString()}</span>
                        {admin.last_login_at && (
                          <span>Last login: {new Date(admin.last_login_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(admin)}
                      disabled={admin.user_id === adminUser?.id}
                      className={`text-gray-400 hover:bg-white/10 ${
                        admin.is_active ? 'hover:text-red-400' : 'hover:text-green-400'
                      }`}
                    >
                      {admin.is_active ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(admin)}
                      className="text-gray-400 hover:text-white hover:bg-white/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAdmin(admin)}
                      disabled={admin.user_id === adminUser?.id}
                      className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Audit Logs */}
      <Card className="workspace-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="h-5 w-5 text-green-400" />
            Recent Audit Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No audit logs</h3>
                <p className="text-gray-400">Admin actions will be logged here</p>
              </div>
            ) : (
              auditLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/10">
                  <div className="p-1.5 bg-blue-600/20 rounded">
                    <Clock className="h-3 w-3 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {log.resource_type} • {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={!!editingAdmin} onOpenChange={(open) => !open && setEditingAdmin(null)}>
        <DialogContent className="bg-black/90 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Edit Admin User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                value={formData.email}
                disabled
                className="bg-black/20 border-white/20 text-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select value={formData.role} onValueChange={(value: 'admin' | 'super_admin') => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger className="bg-black/20 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingAdmin(null);
                  resetForm();
                }}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateAdmin}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="mr-2 h-4 w-4" />
                Update Admin
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleManagement;
