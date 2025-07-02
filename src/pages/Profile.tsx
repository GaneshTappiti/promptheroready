import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkspaceContainer, WorkspaceHeader } from "@/components/ui/workspace-layout";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Menu,
  Shield,
  Bell,
  Globe,
  Lock
} from "lucide-react";

const Profile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "Passionate entrepreneur building the next big thing in tech. Love solving problems and creating innovative solutions.",
    company: "StartWise",
    role: "Founder & CEO",
    website: "https://startwise.com",
    joinedDate: "January 2024"
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen flex">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 transition-all duration-300">
        <div className="flex flex-col w-full">
          {/* Enhanced Top Navigation Bar */}
          <div className="workspace-nav-enhanced">
            <div className="flex items-center justify-between w-full px-4 md:px-6 py-3 md:py-4">
              {/* Left Section - Hamburger & Search */}
              <div className="flex items-center gap-2 md:gap-4 flex-1">
                {/* Hamburger Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-black/30"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <WorkspaceContainer>
            <WorkspaceHeader
              title="Profile Settings"
              subtitle="Manage your personal information and account preferences."
            >
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30 hover:border-red-500/50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-500"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-green-600/20 border-green-500/30 text-green-400 hover:bg-green-600/30 hover:border-green-500/50"
                    variant="outline"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </WorkspaceHeader>

            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="bg-black/20 border-white/10">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-8">
                {/* Profile Header */}
                <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                      <div className="relative">
                        <Avatar className="h-28 w-28">
                          <AvatarImage src="/placeholder-avatar.jpg" alt={profileData.name} />
                          <AvatarFallback className="bg-green-600 text-white text-2xl font-bold">
                            {profileData.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <Button
                            size="icon"
                            className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-green-600 hover:bg-green-500 shadow-lg"
                          >
                            <Camera className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <h2 className="text-3xl font-bold text-white">{profileData.name}</h2>
                          <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-500/30 w-fit">
                            {profileData.role}
                          </Badge>
                        </div>
                        <p className="text-lg text-gray-300">{profileData.email}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{profileData.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {profileData.joinedDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Information */}
                <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl text-white">Personal Information</CardTitle>
                    <CardDescription className="text-gray-400">
                      Update your personal details and contact information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-white font-medium">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          disabled={!isEditing}
                          className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 h-11"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          disabled={!isEditing}
                          className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 h-11"
                          placeholder="Enter your email address"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-white font-medium">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          disabled={!isEditing}
                          className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 h-11"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="location" className="text-white font-medium">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                          disabled={!isEditing}
                          className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 h-11"
                          placeholder="Enter your location"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="bio" className="text-white font-medium">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        disabled={!isEditing}
                        className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 min-h-[120px] resize-none"
                        placeholder="Tell us about yourself and your entrepreneurial journey..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Information */}
                <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl text-white">Professional Information</CardTitle>
                    <CardDescription className="text-gray-400">
                      Your work and business details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="company" className="text-white font-medium">Company</Label>
                        <Input
                          id="company"
                          value={profileData.company}
                          onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                          disabled={!isEditing}
                          className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 h-11"
                          placeholder="Enter your company name"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="role" className="text-white font-medium">Role/Position</Label>
                        <Input
                          id="role"
                          value={profileData.role}
                          onChange={(e) => setProfileData({...profileData, role: e.target.value})}
                          disabled={!isEditing}
                          className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 h-11"
                          placeholder="Enter your role or position"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="website" className="text-white font-medium">Website</Label>
                      <Input
                        id="website"
                        value={profileData.website}
                        onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                        disabled={!isEditing}
                        className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 h-11"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-8">
                <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl text-white flex items-center gap-3">
                      <Shield className="h-6 w-6 text-green-400" />
                      Security Settings
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage your account security and authentication.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-black/20 rounded-xl border border-white/10 hover:border-green-500/30 transition-colors">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-white">Change Password</h4>
                        <p className="text-sm text-gray-400">Update your account password for better security</p>
                      </div>
                      <Button
                        variant="outline"
                        className="bg-green-600/20 border-green-500/30 text-green-400 hover:bg-green-600/30 hover:border-green-500/50"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-8">
                <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl text-white flex items-center gap-3">
                      <Bell className="h-6 w-6 text-green-400" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Choose what notifications you want to receive.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-8">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto">
                        <Bell className="h-8 w-8 text-green-400" />
                      </div>
                      <h3 className="text-lg font-medium text-white">Coming Soon</h3>
                      <p className="text-gray-400 max-w-md mx-auto">
                        Notification settings will be available soon. You'll be able to customize your notification preferences here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-8">
                <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl text-white flex items-center gap-3">
                      <Globe className="h-6 w-6 text-green-400" />
                      App Preferences
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Customize your app experience.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-8">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto">
                        <Globe className="h-8 w-8 text-green-400" />
                      </div>
                      <h3 className="text-lg font-medium text-white">Coming Soon</h3>
                      <p className="text-gray-400 max-w-md mx-auto">
                        App preference settings will be available soon. You'll be able to customize themes, language, and other preferences here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </WorkspaceContainer>
        </div>
      </main>
    </div>
  );
};

export default Profile;
