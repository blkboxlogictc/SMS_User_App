import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth, useUserProfile } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { apiRequest } from "@/lib/queryClient";
import { uploadProfileImage, uploadBusinessImage } from "@/lib/imageUtils";
import { checkIfUserNeedsBusinessSetup } from "@/lib/businessUtils";
import BottomNavigation from "@/components/BottomNavigation";
import UserMenu from "@/components/UserMenu";
import ImageUpload from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  MapPin,
  Calendar,
  Star,
  Gift,
  FileText,
  Trophy,
  Building2,
  Phone,
  Globe,
  Clock,
  Save,
  Edit,
  Tag,
  Timer,
  Plus,
  History,
  ShoppingBag,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BusinessOnboardingModal } from "@/components/BusinessOnboardingModal";

// Business categories for dropdown
const businessCategories = [
  "Restaurant",
  "Cafe",
  "Bar/Lounge",
  "Retail",
  "Service",
  "Entertainment",
  "Art Gallery",
  "Health & Wellness",
  "Professional Services",
  "Automotive",
  "Beauty & Personal Care",
  "Home & Garden",
  "Sports & Recreation",
  "Education",
  "Other",
];

export default function Account() {
  const { toast } = useToast();
  const { user, loading } = useAuth();

  // Direct React Query call to replace useUserProfile hook
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/auth/user");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const queryClient = useQueryClient();
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [surveyResponses, setSurveyResponses] = useState<
    Record<number, string>
  >({});
  const [editingBusiness, setEditingBusiness] = useState<any>(null);
  const [businessForm, setBusinessForm] = useState<any>({});
  const [newPromotion, setNewPromotion] = useState<any>({});
  const [editingPromotion, setEditingPromotion] = useState<any>(null);
  const [promotionForm, setPromotionForm] = useState<any>({});
  const [editingWaitTime, setEditingWaitTime] = useState<any>(null);
  const [newWaitTime, setNewWaitTime] = useState<number>(0);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [selectedRewardForRedemption, setSelectedRewardForRedemption] =
    useState<any>(null);
  const [selectedBusinessForRedemption, setSelectedBusinessForRedemption] =
    useState<any>(null);
  const [needsBusinessSetup, setNeedsBusinessSetup] = useState(false);
  const [checkingBusinessStatus, setCheckingBusinessStatus] = useState(true);
  const [showBusinessOnboarding, setShowBusinessOnboarding] = useState(false);

  // Timeout for loading states to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading || profileLoading) {
        console.warn("Loading timeout reached, proceeding anyway");
        setLoadingTimeout(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [loading, profileLoading]);

  // Check role - prioritize database role over auth metadata
  const authRole = (user as any)?.user_metadata?.role;
  const dbRole = profile?.role;

  // Use database role as primary source, fallback to auth role
  const userRole = dbRole || authRole;
  const isBusinessOwner = userRole === "business";

  // Check business setup status for business users
  useEffect(() => {
    if (user && userRole === "business") {
      checkIfUserNeedsBusinessSetup(user.id)
        .then(setNeedsBusinessSetup)
        .finally(() => setCheckingBusinessStatus(false));
    } else {
      setCheckingBusinessStatus(false);
    }
  }, [user, userRole]);

  // Get profile image URL from user metadata with fallback
  const getProfileImageUrl = () => {
    return user?.user_metadata?.profile_image_url || null;
  };

  const profileImageUrl = getProfileImageUrl();

  // Debug logging
  console.log("Account page debug:", {
    user: user,
    userMetadata: user?.user_metadata,
    profileImageFromMetadata: user?.user_metadata?.profile_image_url,
    profileImageUrl: profileImageUrl,
    profile: profile,
    profileImageFromDB: profile?.profileImageUrl,
    authRole: authRole,
    dbRole: dbRole,
    userRole: userRole,
    isBusinessOwner: isBusinessOwner,
    loading: loading,
    profileLoading: profileLoading,
    profileError: profileError,
    loadingTimeout: loadingTimeout,
  });

  // Patron-specific queries
  const { data: checkins = [] } = useQuery({
    queryKey: ["/api/checkins"],
    enabled: !!user && !isBusinessOwner,
  });

  const { data: eventRsvps = [] } = useQuery({
    queryKey: ["/api/event-rsvps"],
    enabled: !!user && !isBusinessOwner,
  });

  const { data: rewards = [] } = useQuery({
    queryKey: ["/api/rewards"],
    enabled: !!user && !isBusinessOwner,
  });

  const { data: totalPointsData } = useQuery({
    queryKey: ["/api/rewards/total"],
    enabled: !!user && !isBusinessOwner,
  });

  const { data: surveys = [] } = useQuery({
    queryKey: ["/api/surveys"],
    enabled: !!user && !isBusinessOwner,
  });

  const { data: userSurveyResponses = [] } = useQuery({
    queryKey: ["/api/survey-responses"],
    enabled: !!user && !isBusinessOwner,
  });

  // Reward items and redemption queries
  const { data: rewardItems = [] } = useQuery({
    queryKey: ["/api/reward-items"],
    enabled: !!user && !isBusinessOwner,
  });

  const { data: userPoints = 0 } = useQuery({
    queryKey: ["/api/user-points"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/user-points");
      const data = await response.json();
      return data.points;
    },
    enabled: !!user && !isBusinessOwner,
  });

  const { data: redemptionHistory = [] } = useQuery({
    queryKey: ["/api/redemption-history"],
    enabled: !!user && !isBusinessOwner,
  });

  // Get all businesses for reward redemption selection
  const { data: allBusinesses = [] } = useQuery({
    queryKey: ["/api/businesses"],
    enabled: !!user && !isBusinessOwner,
  });

  // Business owner specific queries
  const { data: ownedBusinesses = [] } = useQuery({
    queryKey: ["/api/businesses/owned"],
    enabled: !!user && isBusinessOwner,
  }) as { data: any[] };

  // Get promotions for the first owned business (Stuart Coffee Company)
  const { data: businessPromotions = [] } = useQuery({
    queryKey: ["/api/promotions/business", (ownedBusinesses as any[])[0]?.id],
    queryFn: async () => {
      if (!(ownedBusinesses as any[])[0]?.id) return [];
      const response = await fetch(
        `/api/promotions/business/${(ownedBusinesses as any[])[0].id}`
      );
      if (!response.ok) throw new Error("Failed to fetch business promotions");
      return response.json();
    },
    enabled: !!user && isBusinessOwner && (ownedBusinesses as any[]).length > 0,
  });

  const submitSurveyMutation = useMutation({
    mutationFn: async (surveyData: { surveyId: number; responses: string }) => {
      const response = await apiRequest(
        "POST",
        "/api/survey-responses",
        surveyData
      );
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Survey Completed!",
        description: `You earned ${data.pointsEarned} reward points!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rewards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rewards/total"] });
      queryClient.invalidateQueries({ queryKey: ["/api/survey-responses"] });
      setSelectedSurvey(null);
      setSurveyResponses({});
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBusinessMutation = useMutation({
    mutationFn: async (businessData: any) => {
      const response = await apiRequest(
        "PATCH",
        `/api/businesses/${businessData.id}`,
        businessData
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Business Updated!",
        description: "Your business information has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/businesses/owned"] });
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      setEditingBusiness(null);
      setBusinessForm({});
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createPromotionMutation = useMutation({
    mutationFn: async (promotionData: any) => {
      const response = await apiRequest(
        "POST",
        "/api/promotions",
        promotionData
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Promotion Created!",
        description: "Your promotion has been added successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: [
          "/api/promotions/business",
          (ownedBusinesses as any[])[0]?.id,
        ],
      });
      setNewPromotion({});
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePromotionMutation = useMutation({
    mutationFn: async (promotionData: any) => {
      const response = await apiRequest(
        "PATCH",
        `/api/promotions/${promotionData.id}`,
        promotionData
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Promotion Updated!",
        description: "Your promotion has been updated successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: [
          "/api/promotions/business",
          (ownedBusinesses as any[])[0]?.id,
        ],
      });
      setEditingPromotion(null);
      setPromotionForm({});
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateWaitTimeMutation = useMutation({
    mutationFn: async ({
      businessId,
      waitTime,
    }: {
      businessId: number;
      waitTime: number;
    }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/businesses/${businessId}`,
        { waitTime }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Wait Time Updated!",
        description: "Your wait time has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/businesses/owned"] });
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      setEditingWaitTime(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reward redemption mutation
  const redeemRewardMutation = useMutation({
    mutationFn: async ({
      rewardItemId,
      businessId,
    }: {
      rewardItemId: number;
      businessId: number;
    }) => {
      const response = await apiRequest("POST", "/api/redeem-reward", {
        rewardItemId,
        businessId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Reward Redeemed!",
        description: `You've successfully redeemed ${data.reward_name} at ${data.business_name} for ${data.points_redeemed} points!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user-points"] });
      queryClient.invalidateQueries({ queryKey: ["/api/redemption-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rewards/total"] });
      setSelectedRewardForRedemption(null);
      setSelectedBusinessForRedemption(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Redemption Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const totalPoints = userPoints || (totalPointsData as any)?.totalPoints || 0;
  const completedSurveyIds = (userSurveyResponses as any[]).map(
    (response: any) => response.surveyId
  );
  const availableSurveys = (surveys as any[]).filter(
    (survey: any) => !completedSurveyIds.includes(survey.id)
  );

  const handleSurveySubmit = () => {
    if (!selectedSurvey) return;

    const responses = JSON.stringify(surveyResponses);
    submitSurveyMutation.mutate({
      surveyId: selectedSurvey.id,
      responses,
    });
  };

  const handleSurveyResponseChange = (questionId: number, value: string) => {
    setSurveyResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleEditBusiness = (business: any) => {
    setEditingBusiness(business);

    // Handle hours field - it might be a string or already an object
    let hoursData = {};
    if (business.hours) {
      if (typeof business.hours === "string") {
        try {
          hoursData = JSON.parse(business.hours);
        } catch (error) {
          console.error("Error parsing hours JSON:", error);
          hoursData = {};
        }
      } else if (typeof business.hours === "object") {
        hoursData = business.hours;
      }
    }

    setBusinessForm({
      id: business.id,
      name: business.name,
      category: business.category,
      description: business.description,
      website: business.website,
      phone: business.phone,
      address: business.address,
      hours: hoursData,
    });
  };

  const handleBusinessFormChange = (field: string, value: any) => {
    setBusinessForm((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHoursChange = (day: string, value: string) => {
    setBusinessForm((prev: any) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: value,
      },
    }));
  };

  const handleSaveBusiness = () => {
    const businessData = {
      ...businessForm,
      hours: JSON.stringify(businessForm.hours),
    };
    updateBusinessMutation.mutate(businessData);
  };

  const handleCreatePromotion = () => {
    if (!newPromotion.title || !newPromotion.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const promotionData = {
      ...newPromotion,
      expiresAt: newPromotion.expiresAt
        ? new Date(newPromotion.expiresAt).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      isActive: true,
    };
    createPromotionMutation.mutate(promotionData);
  };

  const handleEditPromotion = (promotion: any) => {
    setEditingPromotion(promotion);

    // Handle the expiration date conversion more safely
    let expiresAtFormatted = "";
    if (promotion.expiresAt) {
      try {
        // Check if it's already a timestamp in seconds or milliseconds
        const timestamp =
          typeof promotion.expiresAt === "number"
            ? promotion.expiresAt
            : parseInt(promotion.expiresAt);

        // If timestamp is in seconds (less than year 2100), convert to milliseconds
        const timestampMs =
          timestamp < 4000000000 ? timestamp * 1000 : timestamp;

        const date = new Date(timestampMs);
        if (!isNaN(date.getTime())) {
          expiresAtFormatted = date.toISOString().split("T")[0];
        }
      } catch (error) {
        console.error("Error parsing expiration date:", error);
      }
    }

    setPromotionForm({
      id: promotion.id,
      title: promotion.title,
      description: promotion.description,
      code: promotion.code,
      discount: promotion.discount,
      expiresAt: expiresAtFormatted,
      isActive: promotion.isActive,
    });
  };

  const handlePromotionFormChange = (field: string, value: any) => {
    setPromotionForm((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSavePromotion = () => {
    if (!promotionForm.title || !promotionForm.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const promotionData = {
      ...promotionForm,
      expiresAt: promotionForm.expiresAt
        ? new Date(promotionForm.expiresAt).toISOString()
        : null,
    };
    updatePromotionMutation.mutate(promotionData);
  };

  const handleUpdateWaitTime = () => {
    if (!(ownedBusinesses as any[])[0]?.id) return;
    updateWaitTimeMutation.mutate({
      businessId: (ownedBusinesses as any[])[0].id,
      waitTime: newWaitTime,
    });
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      // Don't redirect automatically, just let the app handle it naturally
      return;
    }
  }, [user, loading]);

  // Profile image upload handler
  const handleProfileImageUpload = async (file: File): Promise<string> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    console.log("Starting profile image upload for user:", user.id);

    const imageUrl = await uploadProfileImage(user.id, file);

    if (!imageUrl) {
      throw new Error("Failed to upload profile image");
    }

    console.log("Image uploaded successfully, URL:", imageUrl);

    // Give the backend a moment to process triggers and update metadata
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Force refresh the user session to get updated metadata
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      console.warn("Failed to refresh session:", refreshError);
    } else {
      console.log("Session refreshed successfully");
    }

    // Get fresh user data to verify the update
    const {
      data: { user: freshUser },
      error: getUserError,
    } = await supabase.auth.getUser();
    if (getUserError) {
      console.warn("Failed to get fresh user data:", getUserError);
    } else {
      console.log(
        "Fresh user metadata after upload:",
        freshUser?.user_metadata
      );
    }

    // Invalidate queries to refresh user profile data
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    queryClient.invalidateQueries({ queryKey: ["userProfile"] });

    // Force a page refresh to ensure the new image is displayed
    setTimeout(() => {
      window.location.reload();
    }, 500);

    return imageUrl;
  };

  // Business image upload handler
  const handleBusinessImageUpload = async (
    file: File,
    businessId: number
  ): Promise<string> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const imageUrl = await uploadBusinessImage(businessId, file);

    if (!imageUrl) {
      throw new Error("Failed to upload business image");
    }

    // Invalidate queries to refresh business data
    queryClient.invalidateQueries({ queryKey: ["/api/businesses/owned"] });
    queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });

    return imageUrl;
  };

  // Profile image removal handler
  const handleProfileImageRemove = async (): Promise<void> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    // Get current session to get the current profile image URL
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("No active session");
    }

    // Get the current profile image URL to extract the file path
    const currentImageUrl = session.user.user_metadata?.profile_image_url;

    // Delete the image file from storage if it exists
    if (currentImageUrl) {
      try {
        // Extract the file path from the URL
        // URL format: https://[project].supabase.co/storage/v1/object/public/profile_images/[userId]/[filename]
        const urlParts = currentImageUrl.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `${user.id}/${fileName}`;

        console.log("Deleting profile image file:", filePath);

        const { error: deleteError } = await supabase.storage
          .from("profile_images")
          .remove([filePath]);

        if (deleteError) {
          console.error("Error deleting profile image file:", deleteError);
          throw new Error("Failed to delete profile image file");
        } else {
          console.log("Profile image file deleted successfully");
        }
      } catch (error) {
        console.error("Error extracting file path or deleting file:", error);
        throw error;
      }
    } else {
      throw new Error("No profile image to delete");
    }

    // Note: We're NOT updating the metadata here - just deleting the file
    // The profile_image_url field will remain, but point to a non-existent file
    // This allows the user to upload a new image to replace it

    // Invalidate queries to refresh user profile data (this will cause a re-render)
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    queryClient.invalidateQueries({ queryKey: ["userProfile"] });
  };

  // Business image removal handler
  const handleBusinessImageRemove = async (
    businessId: number
  ): Promise<void> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      // Use API route to handle both storage deletion and database cleanup
      const response = await apiRequest(
        "DELETE",
        `/api/remove-business-image/${businessId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove business image");
      }

      // Invalidate queries to refresh business data
      queryClient.invalidateQueries({ queryKey: ["/api/businesses/owned"] });
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
    } catch (error) {
      console.error("Error removing business image:", error);
      throw error;
    }
  };

  // Show loading only if we're still loading and haven't timed out
  if ((loading || profileLoading) && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-2">Loading account...</div>
          <div className="text-xs text-gray-400">
            Auth: {loading ? "Loading..." : "Ready"} | Profile:{" "}
            {profileLoading ? "Loading..." : profileError ? "Error" : "Ready"}
          </div>
          {profileError && (
            <div className="text-xs text-red-500 mt-1">
              Profile Error: {profileError?.message || String(profileError)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // If we've timed out but still don't have a user, show error
  if (loadingTimeout && !user) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">Authentication Error</div>
          <div className="text-sm text-gray-600 mb-4">
            Unable to load account information. Please try signing in again.
          </div>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }

  // If profile loading failed but we have a user, show a warning but continue
  if (profileError && user && !profileLoading) {
    console.warn(
      "Profile loading failed, continuing with auth data only:",
      profileError
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-20">
      {/* Header */}
      <header className="bg-blue-600 shadow-lg sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
                {isBusinessOwner ? (
                  <Building2 className="text-blue-600" size={16} />
                ) : (
                  <User className="text-blue-600" size={16} />
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  {isBusinessOwner ? "Business Account" : "My Account"}
                </h1>
                <p className="text-xs text-white">
                  {isBusinessOwner
                    ? "Manage your business"
                    : "Profile and activity"}
                </p>
              </div>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        {/* Profile Card */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4 mb-4">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  {isBusinessOwner ? (
                    <Building2 size={32} className="text-gray-400" />
                  ) : (
                    <User size={32} className="text-gray-400" />
                  )}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {(user as any)?.user_metadata?.first_name ||
                  (user as any)?.user_metadata?.last_name
                    ? `${(user as any)?.user_metadata?.first_name || ""} ${
                        (user as any)?.user_metadata?.last_name || ""
                      }`.trim()
                    : "User"}
                </h3>
                <p className="text-sm text-gray-500">{(user as any)?.email}</p>
                <p className="text-xs text-gray-400 capitalize">
                  {isBusinessOwner ? "Business Owner" : "Patron"} • Member since{" "}
                  {(user as any)?.createdAt
                    ? new Date((user as any).createdAt).toLocaleDateString()
                    : "Recently"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information Section */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="text-blue-500" size={20} />
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>
                <ImageUpload
                  variant="profile"
                  currentImageUrl={profileImageUrl}
                  onImageUpload={handleProfileImageUpload}
                  onImageRemove={handleProfileImageRemove}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <p className="text-gray-900">
                  {profile?.firstName || profile?.lastName
                    ? `${profile?.firstName || ""} ${
                        profile?.lastName || ""
                      }`.trim()
                    : user?.user_metadata?.full_name ||
                      (user?.user_metadata?.first_name ||
                      user?.user_metadata?.last_name
                        ? `${user?.user_metadata?.first_name || ""} ${
                            user?.user_metadata?.last_name || ""
                          }`.trim()
                        : "Not provided")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <p className="text-gray-900 capitalize">{userRole}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Owner Content */}
        {isBusinessOwner && (
          <>
            {/* Business Management */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="text-blue-500" size={20} />
                  <span>Your Businesses</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {checkingBusinessStatus ? (
                  <div className="text-center py-6">
                    <div className="text-sm text-gray-500">
                      Checking business status...
                    </div>
                  </div>
                ) : needsBusinessSetup ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      Complete Your Business Profile
                    </h3>
                    <p className="text-blue-700 mb-4">
                      Add your business information to appear in the directory
                      and start attracting customers.
                    </p>
                    <Button
                      onClick={() => setShowBusinessOnboarding(true)}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Business Information
                    </Button>
                  </div>
                ) : (ownedBusinesses as any[]).length === 0 ? (
                  <div className="text-center py-6">
                    <Building2
                      size={32}
                      className="mx-auto text-gray-400 mb-2"
                    />
                    <p className="text-sm text-gray-500">No businesses yet</p>
                    <p className="text-xs text-gray-400">
                      Contact support to add your business
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(ownedBusinesses as any[]).map((business: any) => (
                      <div key={business.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {business.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {business.category}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditBusiness(business)}
                          >
                            <Edit size={16} className="mr-1" />
                            Edit
                          </Button>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Image
                          </label>
                          {business.imageUrl ? (
                            <div className="space-y-3">
                              <div className="relative max-w-sm mx-auto">
                                <img
                                  src={business.imageUrl}
                                  alt={business.name}
                                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                />
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const input =
                                      document.createElement("input");
                                    input.type = "file";
                                    input.accept =
                                      "image/jpeg,image/png,image/gif,image/webp";
                                    input.onchange = async (e) => {
                                      const file = (
                                        e.target as HTMLInputElement
                                      ).files?.[0];
                                      if (file) {
                                        try {
                                          await handleBusinessImageUpload(
                                            file,
                                            business.id
                                          );
                                        } catch (error) {
                                          console.error("Upload error:", error);
                                        }
                                      }
                                    };
                                    input.click();
                                  }}
                                >
                                  Update Image
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleBusinessImageRemove(business.id)
                                  }
                                >
                                  Remove Image
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <ImageUpload
                              variant="business"
                              currentImageUrl={business.imageUrl}
                              onImageUpload={(file: File) =>
                                handleBusinessImageUpload(file, business.id)
                              }
                              onImageRemove={() =>
                                handleBusinessImageRemove(business.id)
                              }
                            />
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <MapPin size={14} />
                            <span>{business.address || "No address"}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone size={14} />
                            <span>{business.phone || "No phone"}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Globe size={14} />
                            <span>{business.website || "No website"}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock size={14} />
                            <span>{business.isOpen ? "Open" : "Closed"}</span>
                          </div>
                        </div>
                        {business.description && (
                          <p className="text-sm text-gray-600 mt-2">
                            {business.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Promotions Management */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="text-green-500" size={20} />
                  <span>Promotions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Current Promotions */}
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-3">
                    Current Promotions
                  </h4>
                  {businessPromotions.length === 0 ? (
                    <div className="text-center py-4">
                      <Tag size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        No active promotions
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {businessPromotions.map((promotion: any) => (
                        <div
                          key={promotion.id}
                          className="border rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-sm">
                              {promotion.title}
                            </h5>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditPromotion(promotion)}
                              >
                                <Edit size={12} className="mr-1" />
                                Edit
                              </Button>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Active
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            {promotion.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Code: {promotion.code}</span>
                            <span>
                              Expires:{" "}
                              {(() => {
                                try {
                                  // Handle different timestamp formats
                                  let date;
                                  if (typeof promotion.expiresAt === "number") {
                                    // If it's a number, check if it's in seconds or milliseconds
                                    const timestamp =
                                      promotion.expiresAt < 4000000000
                                        ? promotion.expiresAt * 1000
                                        : promotion.expiresAt;
                                    date = new Date(timestamp);
                                  } else {
                                    // If it's a string, parse it directly
                                    date = new Date(promotion.expiresAt);
                                  }

                                  return !isNaN(date.getTime())
                                    ? date.toLocaleDateString()
                                    : "Invalid Date";
                                } catch (error) {
                                  return "Invalid Date";
                                }
                              })()}
                            </span>
                          </div>
                          {promotion.discount && (
                            <div className="text-xs text-green-600 mt-1">
                              Discount: {promotion.discount}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add New Promotion */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-3">
                    Add New Promotion
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="promo-title">Title</Label>
                        <Input
                          id="promo-title"
                          placeholder="e.g., Happy Hour Special"
                          value={newPromotion.title || ""}
                          onChange={(e) =>
                            setNewPromotion((prev: any) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="promo-code">Promo Code</Label>
                        <Input
                          id="promo-code"
                          placeholder="e.g., HAPPY50"
                          value={newPromotion.code || ""}
                          onChange={(e) =>
                            setNewPromotion((prev: any) => ({
                              ...prev,
                              code: e.target.value.toUpperCase(),
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="promo-description">Description</Label>
                      <Textarea
                        id="promo-description"
                        placeholder="Describe your promotion..."
                        value={newPromotion.description || ""}
                        onChange={(e) =>
                          setNewPromotion((prev: any) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="promo-discount">Discount</Label>
                        <Input
                          id="promo-discount"
                          placeholder="e.g., 50% off, $5 off, Buy 1 Get 1"
                          value={newPromotion.discount || ""}
                          onChange={(e) =>
                            setNewPromotion((prev: any) => ({
                              ...prev,
                              discount: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="promo-expires">Expiration Date</Label>
                        <Input
                          id="promo-expires"
                          type="date"
                          value={newPromotion.expiresAt || ""}
                          onChange={(e) =>
                            setNewPromotion((prev: any) => ({
                              ...prev,
                              expiresAt: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleCreatePromotion}
                      disabled={createPromotionMutation.isPending}
                      className="w-full"
                    >
                      <Plus size={16} className="mr-2" />
                      {createPromotionMutation.isPending
                        ? "Creating..."
                        : "Add Promotion"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wait Time Management */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Timer className="text-orange-500" size={20} />
                  <span>Wait Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(ownedBusinesses as any[]).length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">
                          Current Wait Time
                        </h4>
                        <p className="text-xs text-gray-500">
                          Let customers know how long they might wait
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">
                          {(ownedBusinesses as any[])[0]?.waitTime || 0}
                        </div>
                        <div className="text-xs text-gray-500">minutes</div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm mb-3">
                        Update Wait Time
                      </h4>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <Label htmlFor="wait-time">Minutes</Label>
                          <Input
                            id="wait-time"
                            type="number"
                            min="0"
                            max="120"
                            placeholder="0"
                            value={newWaitTime}
                            onChange={(e) =>
                              setNewWaitTime(parseInt(e.target.value) || 0)
                            }
                          />
                        </div>
                        <Button
                          onClick={handleUpdateWaitTime}
                          disabled={updateWaitTimeMutation.isPending}
                          className="mt-6"
                        >
                          <Timer size={16} className="mr-2" />
                          {updateWaitTimeMutation.isPending
                            ? "Updating..."
                            : "Update"}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Set to 0 for no wait time. This will be displayed to
                        customers on the map.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Patron Content */}
        {!isBusinessOwner && (
          <>
            {/* Activity Stats */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Your Activity
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 sms-green-light rounded-lg">
                    <div className="text-2xl font-bold text-[hsl(var(--sms-green))]">
                      {(checkins as any[]).length}
                    </div>
                    <div className="text-xs text-gray-600">Check-ins</div>
                  </div>
                  <div className="text-center p-3 sms-blue-light rounded-lg">
                    <div className="text-2xl font-bold text-[hsl(var(--sms-blue))]">
                      {(eventRsvps as any[]).length}
                    </div>
                    <div className="text-xs text-gray-600">Events RSVPed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rewards Section */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="text-yellow-500" size={20} />
                  <span>Rewards</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Available Points
                    </span>
                    <span className="text-2xl font-bold text-yellow-600">
                      {totalPoints}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((totalPoints / 100) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Earn points by checking in, taking surveys, and
                    participating in events!
                  </p>
                </div>

                <Tabs defaultValue="earn" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="earn">Earn Points</TabsTrigger>
                    <TabsTrigger value="redeem">Redeem Rewards</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="earn" className="space-y-4">
                    {/* Take Survey Button */}
                    {availableSurveys.length > 0 && (
                      <div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full" variant="outline">
                              <FileText size={16} className="mr-2" />
                              Take a Survey ({availableSurveys.length}{" "}
                              available)
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Available Surveys</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                              {availableSurveys.map((survey: any) => (
                                <div
                                  key={survey.id}
                                  className="border rounded-lg p-3"
                                >
                                  <h4 className="font-medium text-sm">
                                    {survey.title}
                                  </h4>
                                  <p className="text-xs text-gray-600 mb-2">
                                    {survey.description}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-yellow-600 font-medium">
                                      +{survey.rewardPoints} points
                                    </span>
                                    <Button
                                      size="sm"
                                      onClick={() => setSelectedSurvey(survey)}
                                    >
                                      Start Survey
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}

                    {/* Recent Rewards */}
                    <div>
                      <h4 className="font-medium text-sm mb-3">
                        Recent Points Earned
                      </h4>
                      {(rewards as any[]).length === 0 ? (
                        <div className="text-center py-4">
                          <Gift
                            size={32}
                            className="mx-auto text-gray-400 mb-2"
                          />
                          <p className="text-sm text-gray-500">
                            No rewards yet
                          </p>
                          <p className="text-xs text-gray-400">
                            Start earning points today!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(rewards as any[]).slice(0, 5).map((reward: any) => (
                            <div
                              key={reward.id}
                              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                  <Star size={16} className="text-yellow-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    +{reward.points} points
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {reward.description}
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(
                                  reward.createdAt
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="redeem" className="space-y-4">
                    {(rewardItems as any[]).length === 0 ? (
                      <div className="text-center py-6">
                        <ShoppingBag
                          size={32}
                          className="mx-auto text-gray-400 mb-2"
                        />
                        <p className="text-sm text-gray-500">
                          No rewards available
                        </p>
                        <p className="text-xs text-gray-400">
                          Check back later for new rewards to redeem!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(rewardItems as any[]).map((item: any) => (
                          <div key={item.id} className="border rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">
                                  {item.name}
                                </h4>
                                <p className="text-xs text-gray-600 mb-2">
                                  {item.description}
                                </p>
                                {item.expirationDate && (
                                  <p className="text-xs text-gray-500">
                                    Expires:{" "}
                                    {new Date(
                                      item.expirationDate
                                    ).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              <Badge
                                variant={
                                  totalPoints >= item.pointThreshold
                                    ? "default"
                                    : "secondary"
                                }
                                className="ml-2"
                              >
                                <Star className="h-3 w-3 mr-1" />
                                {item.pointThreshold}
                              </Badge>
                            </div>
                            <Button
                              onClick={() =>
                                setSelectedRewardForRedemption(item)
                              }
                              disabled={totalPoints < item.pointThreshold}
                              className="w-full"
                              size="sm"
                              variant={
                                totalPoints >= item.pointThreshold
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {totalPoints >= item.pointThreshold
                                ? "Redeem Now"
                                : `Need ${
                                    item.pointThreshold - totalPoints
                                  } more points`}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="history" className="space-y-4">
                    {(redemptionHistory as any[]).length === 0 ? (
                      <div className="text-center py-6">
                        <History
                          size={32}
                          className="mx-auto text-gray-400 mb-2"
                        />
                        <p className="text-sm text-gray-500">
                          No redemptions yet
                        </p>
                        <p className="text-xs text-gray-400">
                          Your redemption history will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(redemptionHistory as any[]).map((redemption: any) => (
                          <div
                            key={redemption.redemption_id}
                            className="border rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">
                                  {redemption.reward_name}
                                </h4>
                                {redemption.business_name && (
                                  <p className="text-xs text-gray-500">
                                    at {redemption.business_name}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500">
                                  {new Date(
                                    redemption.redeemed_at
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant="outline">
                                -{redemption.points_redeemed} points
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Recent Check-ins */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Recent Check-ins
                </h3>
                {(checkins as any[]).length === 0 ? (
                  <div className="text-center py-6">
                    <MapPin size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No check-ins yet</p>
                    <p className="text-xs text-gray-400">
                      Start exploring local businesses!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(checkins as any[]).slice(0, 5).map((checkin: any) => (
                      <div
                        key={checkin.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 sms-green rounded-full flex items-center justify-center">
                            <MapPin size={16} className="text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Check-in #{checkin.id}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(checkin.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="w-5 h-5 sms-green rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>

      {/* Survey Modal */}
      {selectedSurvey && (
        <Dialog
          open={!!selectedSurvey}
          onOpenChange={() => setSelectedSurvey(null)}
        >
          <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{selectedSurvey.title}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              <p className="text-sm text-gray-600">
                {selectedSurvey.description}
              </p>

              {JSON.parse(selectedSurvey.questions).map((question: any) => (
                <div
                  key={question.id}
                  className="space-y-3 border-b border-gray-100 pb-4 last:border-b-0"
                >
                  <label className="text-sm font-medium block">
                    {question.id}. {question.question}
                  </label>

                  {/* Rating Type */}
                  {question.type === "rating" && (
                    <div className="space-y-2">
                      {question.options.map((option: string, index: number) => (
                        <label
                          key={index}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            onChange={(e) =>
                              handleSurveyResponseChange(
                                question.id,
                                e.target.value
                              )
                            }
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Multiple Choice Type */}
                  {question.type === "multiple_choice" && (
                    <div className="space-y-2">
                      {question.options.map((option: string, index: number) => (
                        <label
                          key={index}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            onChange={(e) =>
                              handleSurveyResponseChange(
                                question.id,
                                e.target.value
                              )
                            }
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Checkbox Type (Multiple Selection) */}
                  {question.type === "checkbox" && (
                    <div className="space-y-2">
                      {question.options.map((option: string, index: number) => (
                        <label
                          key={index}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            value={option}
                            onChange={(e) => {
                              const currentResponse =
                                surveyResponses[question.id] || "";
                              const selectedOptions = currentResponse
                                ? currentResponse.split(",")
                                : [];

                              if (e.target.checked) {
                                // Add option if checked
                                if (!selectedOptions.includes(option)) {
                                  selectedOptions.push(option);
                                }
                              } else {
                                // Remove option if unchecked
                                const optionIndex =
                                  selectedOptions.indexOf(option);
                                if (optionIndex > -1) {
                                  selectedOptions.splice(optionIndex, 1);
                                }
                              }

                              handleSurveyResponseChange(
                                question.id,
                                selectedOptions.join(",")
                              );
                            }}
                            checked={
                              surveyResponses[question.id]
                                ?.split(",")
                                .includes(option) || false
                            }
                            className="text-blue-600 focus:ring-blue-500 rounded"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Text Type */}
                  {question.type === "text" && (
                    <Textarea
                      className="w-full"
                      rows={3}
                      placeholder="Your answer..."
                      value={surveyResponses[question.id] || ""}
                      onChange={(e) =>
                        handleSurveyResponseChange(question.id, e.target.value)
                      }
                    />
                  )}

                  {/* Yes/No Type */}
                  {question.type === "yes_no" && (
                    <div className="space-y-2">
                      {["Yes", "No"].map((option: string, index: number) => (
                        <label
                          key={index}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            onChange={(e) =>
                              handleSurveyResponseChange(
                                question.id,
                                e.target.value
                              )
                            }
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex space-x-2 pt-4 border-t border-gray-200 mt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedSurvey(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSurveySubmit}
                disabled={submitSurveyMutation.isPending}
                className="flex-1"
              >
                {submitSurveyMutation.isPending
                  ? "Submitting..."
                  : `Submit (+${selectedSurvey.rewardPoints} points)`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Business Edit Modal */}
      {editingBusiness && (
        <Dialog
          open={!!editingBusiness}
          onOpenChange={() => setEditingBusiness(null)}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Business Information</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Business Name</Label>
                  <Input
                    id="name"
                    value={businessForm.name || ""}
                    onChange={(e) =>
                      handleBusinessFormChange("name", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={businessForm.category || ""}
                    onValueChange={(value) =>
                      handleBusinessFormChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={businessForm.description || ""}
                  onChange={(e) =>
                    handleBusinessFormChange("description", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={businessForm.phone || ""}
                    onChange={(e) =>
                      handleBusinessFormChange("phone", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={businessForm.website || ""}
                    onChange={(e) =>
                      handleBusinessFormChange("website", e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={businessForm.address || ""}
                  onChange={(e) =>
                    handleBusinessFormChange("address", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Business Hours</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {[
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                    "sunday",
                  ].map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Label className="w-20 capitalize">{day}</Label>
                      <Input
                        value={businessForm.hours?.[day] || ""}
                        onChange={(e) => handleHoursChange(day, e.target.value)}
                        placeholder="e.g., 9:00 AM - 5:00 PM or Closed"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingBusiness(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveBusiness}
                  disabled={updateBusinessMutation.isPending}
                  className="flex-1"
                >
                  <Save size={16} className="mr-2" />
                  {updateBusinessMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Promotion Edit Modal */}
      {editingPromotion && (
        <Dialog
          open={!!editingPromotion}
          onOpenChange={() => setEditingPromotion(null)}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Promotion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-promo-title">Title</Label>
                  <Input
                    id="edit-promo-title"
                    value={promotionForm.title || ""}
                    onChange={(e) =>
                      handlePromotionFormChange("title", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-promo-code">Promo Code</Label>
                  <Input
                    id="edit-promo-code"
                    value={promotionForm.code || ""}
                    onChange={(e) =>
                      handlePromotionFormChange(
                        "code",
                        e.target.value.toUpperCase()
                      )
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-promo-description">Description</Label>
                <Textarea
                  id="edit-promo-description"
                  value={promotionForm.description || ""}
                  onChange={(e) =>
                    handlePromotionFormChange("description", e.target.value)
                  }
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-promo-discount">Discount</Label>
                  <Input
                    id="edit-promo-discount"
                    value={promotionForm.discount || ""}
                    onChange={(e) =>
                      handlePromotionFormChange("discount", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-promo-expires">Expiration Date</Label>
                  <Input
                    id="edit-promo-expires"
                    type="date"
                    value={promotionForm.expiresAt || ""}
                    onChange={(e) =>
                      handlePromotionFormChange("expiresAt", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingPromotion(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePromotion}
                  disabled={updatePromotionMutation.isPending}
                  className="flex-1"
                >
                  <Save size={16} className="mr-2" />
                  {updatePromotionMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Business Selection Modal for Reward Redemption */}
      {selectedRewardForRedemption && (
        <Dialog
          open={!!selectedRewardForRedemption}
          onOpenChange={() => {
            setSelectedRewardForRedemption(null);
            setSelectedBusinessForRedemption(null);
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Select Business</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Choose which business you'd like to redeem your{" "}
                <span className="font-medium">
                  {selectedRewardForRedemption.name}
                </span>{" "}
                reward at:
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(allBusinesses as any[]).map((business: any) => (
                  <div
                    key={business.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedBusinessForRedemption?.id === business.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedBusinessForRedemption(business)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{business.name}</h4>
                        <p className="text-xs text-gray-500">
                          {business.category}
                        </p>
                        {business.address && (
                          <p className="text-xs text-gray-400 mt-1">
                            {business.address}
                          </p>
                        )}
                      </div>
                      <div className="ml-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            selectedBusinessForRedemption?.id === business.id
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedBusinessForRedemption?.id ===
                            business.id && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRewardForRedemption(null);
                    setSelectedBusinessForRedemption(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (selectedBusinessForRedemption) {
                      redeemRewardMutation.mutate({
                        rewardItemId: selectedRewardForRedemption.id,
                        businessId: selectedBusinessForRedemption.id,
                      });
                    }
                  }}
                  disabled={
                    !selectedBusinessForRedemption ||
                    redeemRewardMutation.isPending
                  }
                  className="flex-1"
                >
                  <ShoppingBag size={16} className="mr-2" />
                  {redeemRewardMutation.isPending
                    ? "Redeeming..."
                    : "Redeem Reward"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Business Onboarding Modal */}
      {showBusinessOnboarding && (
        <BusinessOnboardingModal
          open={showBusinessOnboarding}
          onOpenChange={setShowBusinessOnboarding}
          onSuccess={() => {
            setShowBusinessOnboarding(false);
            setNeedsBusinessSetup(false);
            // Refresh business data
            queryClient.invalidateQueries({
              queryKey: ["/api/businesses/owned"],
            });
            queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
          }}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
