"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Building,
  MapPin,
  Calendar,
  Upload,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { ChangePassword } from "@/components/common/ChangePassword";
import { userApi } from "@/lib/userApi";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL;

const getUserProfile = async () => {
  try {
    console.log('Fetching profile from:', `${API_BASE_URL}/users/me`);
    
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("getUserProfile error:", error);
    throw error;
  }
};

const updateUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error);
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to update user");
  }
};

const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to delete user");
  }
};

const updateUserPreferences = async (preferences) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me/preferences`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ preferences }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error);
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to update preferences");
  }
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [isChangePassword, setIsChangePasswordOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/auth");
          return;
        }
  
        const userData = await getUserProfile();
  
        if (userData && userData.user) {
          const transformedUser = {
            ...userData.user,
            organization: userData.user.associated_department || "Not specified",
            joinDate: userData.user.createdAt
              ? new Date(userData.user.createdAt).toLocaleDateString()
              : "Recent",
            preferences: userData.user.preferences || {
              notifications: {
                push: true,
                email: true,
                sms: false,
                radius: 50
              },
              theme: {
                mode: "system"
              },
              language: "en"
            }
          };
          setUser(transformedUser);
        } else {
          throw new Error("Invalid user data received");
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch profile",
          variant: "destructive",
        });
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserProfile();
  }, [toast, router]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const updatedUser = {
        name: formData.get("name"),
        email: formData.get("email"),
        associated_department: formData.get("organization"),
        location: user.location,
      };

      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw new Error("User data not found");
      }

      const parsedUser = JSON.parse(storedUser);
      const userId = parsedUser.id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      const data = await updateUser(userId, updatedUser);

      if (data.success) {
        const transformedUser = {
          ...user,
          ...data.user,
          organization: data.user.associated_department || "Not specified",
          joinDate: data.user.createdAt
            ? new Date(data.user.createdAt).toLocaleDateString()
            : "Recent",
          preferences: user.preferences,
        };
        setUser(transformedUser);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
  
      const formData = new FormData();
      formData.append('avatar', file);
  
      const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error);
      return data;
    } catch (error) {
      throw new Error(error.message || "Failed to update avatar");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw new Error("User data not found");
      }

      const parsedUser = JSON.parse(storedUser);
      const userId = parsedUser.id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await deleteUser(userId);

      if (response.success) {
        localStorage.clear();
        toast({
          title: "Account deleted",
          description: "Your account has been permanently deleted.",
          variant: "destructive",
        });
        router.push("/auth");
      } else {
        throw new Error(response.message || "Failed to delete account");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePreferenceChange = async (key, value) => {
    try {
      setLoading(true);
      const updatedPreferences = {
        ...user.preferences,
        [key]: value,
      };

      const data = await updateUserPreferences(updatedPreferences);

      if (data.success) {
        setUser((prev) => ({
          ...prev,
          preferences: data.user.preferences,
        }));
        toast({
          title: "Preferences updated",
          description: "Your preferences have been successfully updated.",
        });
      } else {
        throw new Error(data.message || "Failed to update preferences");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update preferences. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-8xl mx-auto py-6">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={user?.avatar ? `${API_BASE_URL}${user.avatar}` : "/placeholder-avatar.png"}
                    alt={user?.name}
                  />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer"
                >
                  <Upload className="h-4 w-4 text-white" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={loading}
                />
              </div>
              <div className="space-y-1">
                <CardTitle>{user?.name}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-4">
                  <MapPin className="h-4 w-4 opacity-70" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.location
                        ? `${user.location.latitude}, ${user.location.longitude}`
                        : "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Building className="h-4 w-4 opacity-70" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Organization
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user?.organization}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Calendar className="h-4 w-4 opacity-70" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Joined</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.joinDate}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={user?.name || ""}
                      onChange={(e) =>
                        setUser((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={user?.email || ""}
                      onChange={(e) =>
                        setUser((prev) => ({ ...prev, email: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="location"
                        name="location"
                        defaultValue={
                          user?.location
                            ? `${user.location.latitude}, ${user.location.longitude}`
                            : ""
                        }
                        readOnly
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (position) => {
                                const locationData = {
                                  latitude: position.coords.latitude,
                                  longitude: position.coords.longitude,
                                };
                                setUser((prev) => ({
                                  ...prev,
                                  location: locationData, 
                                }));
                                toast({
                                  title: "Location updated",
                                  description:
                                    "Your location has been successfully retrieved.",
                                });
                              },
                              (error) => {
                                toast({
                                  variant: "destructive",
                                  title: "Error",
                                  description:
                                    "Failed to get location. Please ensure location access is enabled.",
                                });
                              },
                            );
                          } else {
                            toast({
                              variant: "destructive",
                              title: "Error",
                              description:
                                "Geolocation is not supported by your browser.",
                            });
                          }
                        }}
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      name="organization"
                      value={user?.organization || ""}
                      onChange={(e) =>
                        setUser((prev) => ({
                          ...prev,
                          organization: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Manage your notification and display preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications for important updates
                    </p>
                  </div>
                  <Switch 
                    checked={user?.preferences?.notifications?.push} 
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', {
                      ...user.preferences.notifications,
                      push: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications
                    </p>
                  </div>
                  <Switch 
                    checked={user?.preferences?.notifications?.email} 
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', {
                      ...user.preferences.notifications,
                      email: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive SMS notifications
                    </p>
                  </div>
                  <Switch 
                    checked={user?.preferences?.notifications?.sms} 
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', {
                      ...user.preferences.notifications,
                      sms: checked
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notification Radius (km)</Label>
                  <Input
                    type="number"
                    value={user?.preferences?.notifications?.radius || 50}
                    onChange={(e) => handlePreferenceChange('notifications', {
                      ...user.preferences.notifications,
                      radius: parseInt(e.target.value)
                    })}
                    min="1"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Theme Mode</Label>
                  <Select 
                    value={user?.preferences?.theme?.mode || "system"} 
                    onValueChange={(value) => handlePreferenceChange('theme', {
                      ...user.preferences.theme,
                      mode: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select 
                    value={user?.preferences?.language || "en"} 
                    onValueChange={(value) => handlePreferenceChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="w-full h-12 text-base hover:bg-primary/5 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Change Password
                </Button>
                <ChangePassword
                  open={isChangePassword}
                  onClose={() => setIsChangePasswordOpen(false)}
                />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full h-12 text-base hover:bg-destructive/90 transition-colors"
                    >
                      <Trash2 className="mr-2 h-5 w-5" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-bold">
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-base">
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="h-10 px-4">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive hover:bg-destructive/90 h-10 px-4"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
