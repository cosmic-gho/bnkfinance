"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { userService, accountService } from "@/lib/supabase-services";
import { supabase } from "@/lib/supabase";
import { ImageUpload } from "@/components/image-upload";
import { getProfilePictureUrl } from "@/lib/image-utils";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface UserProfile {
  id: number;
  user: User;
  phone_number: string | null;
  address: string | null;
  date_of_birth: string | null;
  profile_picture: string | null;
}

interface Account {
  id: number;
  account_type: { name: string };
  account_number: string;
  balance: string;
}

const profileFormSchema = z.object({
  phone_number: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
  profile_picture: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      phone_number: "",
      address: "",
      date_of_birth: "",
      profile_picture: null,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        // Get user data - try profile first, fallback to auth user
        let userData = await userService.getCurrentUser();
        
        // If profile doesn't exist, create it from auth user data
        if (!userData) {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            // Try to create the profile
            try {
              const { data: newProfile, error: createError } = await supabase
                .from('user_profiles')
                .insert({
                  id: authUser.id,
                  username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'user',
                  first_name: authUser.user_metadata?.first_name || null,
                  last_name: authUser.user_metadata?.last_name || null,
                  is_admin: false,
                })
                .select()
                .single();

              if (!createError && newProfile) {
                userData = {
                  id: newProfile.id,
                  email: authUser.email || '',
                  username: newProfile.username || '',
                  first_name: newProfile.first_name || '',
                  last_name: newProfile.last_name || '',
                };
              } else {
                // If insert fails, use auth user data directly
                userData = {
                  id: authUser.id,
                  email: authUser.email || '',
                  username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'user',
                  first_name: authUser.user_metadata?.first_name || '',
                  last_name: authUser.user_metadata?.last_name || '',
                };
              }
            } catch (err) {
              // Use auth user data as fallback
              userData = {
                id: authUser.id,
                email: authUser.email || '',
                username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'user',
                first_name: authUser.user_metadata?.first_name || '',
                last_name: authUser.user_metadata?.last_name || '',
              };
            }
          }
        }

        if (userData) {
          setUser({
            id: parseInt(userData.id) || 0,
            username: userData.username,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
          });
          
          // Set profile state (using user data as profile)
          setProfile({
            id: parseInt(userData.id) || 0,
            user: {
              id: parseInt(userData.id) || 0,
              username: userData.username,
              email: userData.email,
              first_name: userData.first_name,
              last_name: userData.last_name,
            },
            phone_number: null,
            address: null,
            date_of_birth: null,
          });
        }

        // Fetch accounts
        try {
          const accountsData = await accountService.getAccounts();
          if (accountsData) {
            setAccounts(accountsData.map((acc: any) => ({
              id: acc.id,
              account_type: acc.account_type,
              account_number: acc.account_number,
              balance: acc.balance,
            })));
          }
        } catch (accError) {
          console.warn("Could not fetch accounts:", accError);
        }

        // Fetch profile details (phone, address, etc.) and update profile state
        try {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('phone_number, address, date_of_birth, profile_picture')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileData && userData) {
            // Update profile state with fetched data
            setProfile(prev => ({
              ...prev!,
              phone_number: profileData.phone_number,
              address: profileData.address,
              date_of_birth: profileData.date_of_birth,
              profile_picture: profileData.profile_picture,
            }));
            
            // Set profile picture URL if exists
            if (profileData.profile_picture) {
              setProfilePictureUrl(profileData.profile_picture);
            }
            
            form.reset({
              phone_number: profileData.phone_number || "",
              address: profileData.address || "",
              date_of_birth: profileData.date_of_birth || "",
              profile_picture: null,
            });
          } else {
            form.reset({
              phone_number: "",
              address: "",
              date_of_birth: "",
              profile_picture: null,
            });
          }
        } catch (profileError) {
          // If profile columns don't exist yet, just set defaults
          form.reset({
            phone_number: "",
            address: "",
            date_of_birth: "",
            profile_picture: null,
          });
        }
      } catch (err: any) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router, toast, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No session found");
      }

      // Update profile using Supabase service
      await userService.updateProfile({
        phone_number: data.phone_number || null,
        address: data.address || null,
        date_of_birth: data.date_of_birth || null,
        profile_picture: profilePictureUrl || null,
      });

      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      // Refresh user data
      const updatedUser = await userService.getCurrentUser();
      if (updatedUser) {
        setUser({
          id: parseInt(updatedUser.id) || 0,
          username: updatedUser.username,
          email: updatedUser.email,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
        });
      }

      // Update profile state with new picture
      if (profilePictureUrl) {
        setProfile(prev => ({
          ...prev!,
          profile_picture: profilePictureUrl,
        }));
      }

      // Reset form with updated values
      form.reset({
        phone_number: data.phone_number || "",
        address: data.address || "",
        date_of_birth: data.date_of_birth || "",
        profile_picture: null,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-green-50 p-4 md:p-6">
      <Card className="max-w-2xl mx-auto border-green-500 shadow-green-200">
        <CardHeader className="bg-green-100">
          <CardTitle className="text-green-800">User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}
          {isLoading ? (
            <p className="text-green-600">Loading profile...</p>
          ) : user ? (
            <>
              <div>
                <h3 className="text-lg font-semibold text-green-700">User Information</h3>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>First Name:</strong> {user.first_name || "Not set"}</p>
                <p><strong>Last Name:</strong> {user.last_name || "Not set"}</p>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-green-700">Profile Details</h3>
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-100"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
                {!isEditing ? (
                  <div className="mt-2">
                    {profile?.profile_picture ? (
                      <Image
                        src={getProfilePictureUrl(profile.profile_picture, 150)}
                        alt="Profile Picture"
                        width={150}
                        height={150}
                        className="rounded-full mb-2 object-cover"
                      />
                    ) : (
                      <div className="w-[150px] h-[150px] bg-green-200 rounded-full mb-2 flex items-center justify-center">
                        <span className="text-green-700">No Image</span>
                      </div>
                    )}
                    <p><strong>Phone Number:</strong> {profile?.phone_number || "Not set"}</p>
                    <p><strong>Address:</strong> {profile?.address || "Not set"}</p>
                    <p><strong>Date of Birth:</strong> {profile?.date_of_birth || "Not set"}</p>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
                      <FormField
                        control={form.control}
                        name="phone_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter phone number"
                                className="focus:ring-green-500"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter address"
                                className="focus:ring-green-500"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="date_of_birth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                className="focus:ring-green-500"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormItem>
                        <FormLabel>Profile Picture</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={profilePictureUrl || undefined}
                            onChange={(url) => setProfilePictureUrl(url)}
                            folder="profile-pictures"
                            tags={["profile", "avatar"]}
                            maxSize={5 * 1024 * 1024} // 5MB
                            showPreview={true}
                            previewClassName="w-32 h-32 rounded-full"
                            onError={(error) => {
                              toast({
                                variant: "destructive",
                                title: "Upload Error",
                                description: error,
                              });
                            }}
                          />
                        </FormControl>
                      </FormItem>
                      <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={form.formState.isSubmitting}
                      >
                        Update Profile
                      </Button>
                    </form>
                  </Form>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-700">Accounts</h3>
                {accounts.length === 0 ? (
                  <p className="text-green-600">No accounts found.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-green-100">
                        <TableHead className="text-green-800">Account ID</TableHead>
                        <TableHead className="text-green-800">Type</TableHead>
                        <TableHead className="text-green-800">Account Number</TableHead>
                        <TableHead className="text-green-800">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>{account.id}</TableCell>
                          <TableCell>{account.account_type.name}</TableCell>
                          <TableCell>****{account.account_number.slice(-4)}</TableCell>
                          <TableCell>${parseFloat(account.balance).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </>
          ) : (
            <p className="text-green-600">No user or profile data available.</p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            Log Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}