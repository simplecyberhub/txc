import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import MainLayout from "@/components/layouts/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle,
  Check,
  Settings,
  Shield,
  CreditCard,
  User,
  Lock,
  Loader2
} from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Please enter a valid email address").optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
  });
  
  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const res = await apiRequest("PATCH", `/api/auth/me`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Change password mutation
  const changePassword = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const res = await apiRequest("POST", `/api/auth/change-password`, data);
      return res.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Change Failed",
        description: "Failed to change password. Please check your current password.",
        variant: "destructive",
      });
    }
  });
  
  // Fetch KYC status
  const { data: kycData } = useQuery({
    queryKey: ['/api/kyc/status'],
    // If 404, it means the user hasn't submitted KYC yet
    retry: (failureCount, error: any) => {
      return failureCount < 3 && error.status !== 404;
    },
  });
  
  const kycStatus = kycData?.kyc?.status || "none";
  
  // Handle form submissions
  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfile.mutate(data);
  };
  
  const onPasswordSubmit = (data: PasswordFormData) => {
    changePassword.mutate(data);
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return "U";
  };
  
  return (
    <MainLayout title="Profile">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">
          Manage your account information and security settings
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{user?.username}</h2>
                <p className="text-gray-600 mb-2">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email}
                </p>
                <div className="flex space-x-2 mb-4">
                  {user?.isAdmin && (
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                      Admin
                    </Badge>
                  )}
                  {user?.isVerified ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      Unverified
                    </Badge>
                  )}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <nav className="space-y-1">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeTab === "profile" ? "bg-gray-100" : ""}`}
                  onClick={() => setActiveTab("profile")}
                >
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeTab === "security" ? "bg-gray-100" : ""}`}
                  onClick={() => setActiveTab("security")}
                >
                  <Lock className="h-5 w-5 mr-2" />
                  Security
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeTab === "verification" ? "bg-gray-100" : ""}`}
                  onClick={() => setActiveTab("verification")}
                >
                  <Shield className="h-5 w-5 mr-2" />
                  Verification
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeTab === "payment" ? "bg-gray-100" : ""}`}
                  onClick={() => setActiveTab("payment")}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Methods
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeTab === "preferences" ? "bg-gray-100" : ""}`}
                  onClick={() => setActiveTab("preferences")}
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Preferences
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your first name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your email" 
                                {...field} 
                                disabled={true}
                                className="bg-gray-50"
                              />
                            </FormControl>
                            <FormDescription>
                              Your email cannot be changed. Contact support if needed.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="mt-6">
                        <Button
                          type="submit"
                          disabled={updateProfile.isPending}
                        >
                          {updateProfile.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                            </>
                          ) : (
                            "Update Profile"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Update your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your current password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your new password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm your new password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="mt-6">
                        <Button
                          type="submit"
                          disabled={changePassword.isPending}
                        >
                          {changePassword.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                            </>
                          ) : (
                            "Change Password"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="verification">
              <Card>
                <CardHeader>
                  <CardTitle>Account Verification</CardTitle>
                  <CardDescription>
                    Verify your identity to unlock full platform features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center">
                        <div className="mr-4">
                          {user?.isEmailVerified ? (
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="h-6 w-6 text-green-600" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                              <AlertCircle className="h-6 w-6 text-yellow-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">Email Verification</h3>
                          <p className="text-sm text-gray-500">Verify your email address</p>
                        </div>
                      </div>
                      <div>
                        {user?.isEmailVerified ? (
                          <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        ) : (
                          <Button variant="outline" size="sm">Verify Email</Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center">
                        <div className="mr-4">
                          {user?.isVerified ? (
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="h-6 w-6 text-green-600" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                              <AlertCircle className="h-6 w-6 text-yellow-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">Identity Verification (KYC)</h3>
                          <p className="text-sm text-gray-500">Complete KYC to unlock all features</p>
                        </div>
                      </div>
                      <div>
                        {user?.isVerified ? (
                          <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        ) : kycStatus === "pending" ? (
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => window.location.href = "/kyc"}>
                            Complete KYC
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h3 className="font-medium text-blue-800 mb-1">Why verify your account?</h3>
                      <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
                        <li>Unlock withdrawals</li>
                        <li>Higher deposit and trading limits</li>
                        <li>Access to all trading features</li>
                        <li>Enhanced account security</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your payment methods for deposits and withdrawals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CreditCard className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Methods Added</h3>
                    <p className="text-gray-500 mb-6 max-w-md">
                      Adding payment methods is not available in this demo version.
                      In a production environment, you would be able to add bank accounts, credit cards, and other payment methods.
                    </p>
                    <Button disabled>Add Payment Method</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Account Preferences</CardTitle>
                  <CardDescription>
                    Customize your account settings and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Settings className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Preferences Not Available</h3>
                    <p className="text-gray-500 mb-6 max-w-md">
                      Preference settings are not available in this demo version.
                      In a production environment, you would be able to configure notifications, timezone, language, and other preferences.
                    </p>
                    <Button disabled>Configure Preferences</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
