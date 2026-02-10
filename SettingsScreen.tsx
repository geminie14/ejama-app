import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Bell, Lock, HelpCircle, LogOut, Camera } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { getSupabaseClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { projectId } from "@/utils/supabase/info";

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
  accessToken: string;
}

export function SettingsScreen({ onBack, onLogout, accessToken }: SettingsScreenProps) {
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserName(user.user_metadata?.name || "");
        setUserEmail(user.email || "");
        setProfilePicture(user.user_metadata?.profile_picture || "");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    setUploading(true);

    const supabase = getSupabaseClient();
const { data: { session } } = await supabase.auth.getSession();

if (!session?.access_token) {
  toast.error("No active session. Please log in again.");
  setUploading(false);
  return;
}


    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Upload to server
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-1aee76a8/profile/picture`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ picture: base64String }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProfilePicture(data.url);
          toast.success("Profile picture updated!");
          
          // Update local user metadata
          await supabase.auth.updateUser({
            data: { profile_picture: data.url }
          });
        } else {
          throw new Error("Upload failed");
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateName = async () => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.updateUser({
        data: { name: userName }
      });

      if (error) throw error;

      toast.success("Name updated successfully");
      setShowProfileEdit(false);
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error("Failed to update name");
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseClient();

      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      onLogout();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#E7DDFF] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            style={{ color: '#A592AB' }}
            className="hover:bg-[#D4C4EC]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#594F62' }}>Settings</h1>
          <p style={{ color: '#776B7D' }}>Manage your account and preferences</p>
        </div>

        <div className="space-y-4">
          {/* Profile Picture Card */}
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg" style={{ color: '#594F62' }}>Profile</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowProfileEdit(!showProfileEdit)}
              >
                {showProfileEdit ? "Cancel" : "Edit"}
              </Button>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="relative group">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                    style={{ backgroundColor: '#A592AB' }}
                  >
                    {getInitials(userName)}
                  </div>
                )}
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
              <div className="flex-1">
                {showProfileEdit ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={userEmail}
                        disabled
                        className="bg-gray-100"
                      />
                      <p className="text-xs mt-1" style={{ color: '#776B7D' }}>
                        Email cannot be changed
                      </p>
                    </div>
                    <Button
                      onClick={handleUpdateName}
                      style={{ backgroundColor: '#A592AB', color: 'white' }}
                    >
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <>
                    <h4 className="font-medium" style={{ color: '#594F62' }}>{userName || "User"}</h4>
                    <p className="text-sm" style={{ color: '#776B7D' }}>{userEmail}</p>
                    <p className="text-xs mt-2" style={{ color: '#A592AB' }}>
                      Click "Edit" to update your name or hover over your picture to change it
                    </p>
                  </>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 rounded-full" style={{ backgroundColor: '#B9A5E2' }}>
                <Bell className="w-6 h-6" style={{ color: '#594F62' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold" style={{ color: '#594F62' }}>Notifications</h3>
                <p className="text-sm" style={{ color: '#776B7D' }}>Manage notification preferences</p>
              </div>
            </div>
            <div className="space-y-4 ml-14">
              <div className="flex items-center justify-between">
                <Label htmlFor="period-reminders" className="flex flex-col space-y-1">
                  <span className="text-sm font-medium">Period Reminders</span>
                  <span className="text-xs text-gray-500">Get notified before your period</span>
                </Label>
                <Switch id="period-reminders" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="health-tips" className="flex flex-col space-y-1">
                  <span className="text-sm font-medium">Health Tips</span>
                  <span className="text-xs text-gray-500">Receive wellness advice</span>
                </Label>
                <Switch id="health-tips" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="community-updates" className="flex flex-col space-y-1">
                  <span className="text-sm font-medium">Community Updates</span>
                  <span className="text-xs text-gray-500">Stay updated on community activities</span>
                </Label>
                <Switch id="community-updates" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full" style={{ backgroundColor: '#9279BA' }}>
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold" style={{ color: '#594F62' }}>Privacy & Security</h3>
                <p className="text-sm" style={{ color: '#776B7D' }}>Manage your data and security settings</p>
              </div>
              <Button variant="ghost" size="sm">Manage</Button>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full" style={{ backgroundColor: '#A592AB' }}>
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold" style={{ color: '#594F62' }}>Help & Support</h3>
                <p className="text-sm" style={{ color: '#776B7D' }}>Get help and contact support</p>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-4 w-full text-left hover:opacity-70 transition-opacity"
            >
              <div className="p-3 bg-gray-100 rounded-full">
                <LogOut className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold" style={{ color: '#594F62' }}>Logout</h3>
                <p className="text-sm" style={{ color: '#776B7D' }}>Sign out of your account</p>
              </div>
            </button>
          </Card>

          <Card className="p-4 border" style={{ backgroundColor: '#D4C4EC', borderColor: '#B2A0B9' }}>
            <p className="text-sm text-center" style={{ color: '#594F62' }}>
              Ejama v1.0 • Made with 💜 for women's health
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
