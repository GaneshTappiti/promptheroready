import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  Key, 
  CreditCard, 
  User, 
  Bell, 
  Shield, 
  ChevronLeft,
  Crown,
  Zap
} from 'lucide-react';
import WorkspaceSidebar, { SidebarToggle } from '@/components/WorkspaceSidebar';
import APIKeyManager from '@/components/APIKeyManager';
import BreadcrumbNavigation from '@/components/BreadcrumbNavigation';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    currentPlan, 
    subscription, 
    isFreeTier, 
    isOnTrial, 
    trialDaysRemaining,
    startFreeTrial,
    cancelSubscription 
  } = useSubscription();

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false
  });

  const handleStartTrial = async () => {
    const success = await startFreeTrial();
    if (success) {
      toast({
        title: "Trial Started!",
        description: "Your 7-day Pro trial has begun.",
      });
    }
  };

  const handleCancelSubscription = async () => {
    const success = await cancelSubscription(false);
    if (success) {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will be cancelled at the end of the current period.",
      });
    }
  };

  return (
    <div className="layout-container bg-gradient-to-br from-black via-gray-900 to-green-950">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="layout-main transition-all duration-300">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarToggle onClick={() => setSidebarOpen(true)} />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => navigate('/workspace')}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Workspace
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-gray-400" />
                <span className="text-white font-medium">Settings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="px-6 py-2 border-b border-white/10">
          <BreadcrumbNavigation />
        </div>

        {/* Main Content */}
        <div className="px-6 py-8 max-w-6xl mx-auto">
          <Tabs defaultValue="api-keys" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-900/50">
              <TabsTrigger value="api-keys" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Subscription
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="api-keys">
              <APIKeyManager />
            </TabsContent>

            <TabsContent value="subscription" className="space-y-6">
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Current Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {currentPlan?.name || 'Free Plan'}
                      </h3>
                      <p className="text-gray-400">
                        {currentPlan?.price === 0 
                          ? 'No cost' 
                          : `$${currentPlan?.price}/${currentPlan?.interval}`
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOnTrial && (
                        <Badge className="bg-blue-600/20 text-blue-400">
                          Trial - {trialDaysRemaining} days left
                        </Badge>
                      )}
                      <Badge 
                        className={
                          isFreeTier 
                            ? 'bg-gray-600/20 text-gray-400' 
                            : 'bg-yellow-600/20 text-yellow-400'
                        }
                      >
                        {currentPlan?.tier || 'free'}
                      </Badge>
                    </div>
                  </div>

                  {currentPlan?.features && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Features</h4>
                      <ul className="space-y-1">
                        {currentPlan.features.map((feature, index) => (
                          <li key={index} className="text-gray-300 text-sm flex items-center gap-2">
                            <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-gray-700">
                    {isFreeTier && !isOnTrial && (
                      <Button
                        onClick={handleStartTrial}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Start Free Trial
                      </Button>
                    )}
                    
                    {isFreeTier && (
                      <Button
                        onClick={() => toast({ title: "Upgrade", description: "Payment integration coming soon!" })}
                        className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    )}

                    {!isFreeTier && subscription && (
                      <Button
                        variant="outline"
                        onClick={handleCancelSubscription}
                        className="border-red-600 text-red-400 hover:bg-red-600/10"
                      >
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Email</Label>
                    <p className="text-white mt-1">{user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-300">User ID</Label>
                    <p className="text-gray-400 text-sm mt-1 font-mono">{user?.id}</p>
                  </div>
                  <div>
                    <Label className="text-gray-300">Account Created</Label>
                    <p className="text-gray-400 text-sm mt-1">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Email Notifications</Label>
                      <p className="text-gray-400 text-sm">Receive updates about your account and features</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, email: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Push Notifications</Label>
                      <p className="text-gray-400 text-sm">Get notified about important updates</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, push: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Marketing Communications</Label>
                      <p className="text-gray-400 text-sm">Receive tips, tutorials, and product updates</p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, marketing: checked }))
                      }
                    />
                  </div>

                  <Button className="w-full mt-6">
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;
