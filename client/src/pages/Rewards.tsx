import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Star, Clock, MapPin, Trophy, History } from "lucide-react";

interface RewardItem {
  id: number;
  name: string;
  description: string;
  pointThreshold: number;
  businessId?: number;
  imageUrl?: string;
  isActive: boolean;
  expirationDate?: string;
  maxRedemptions?: number;
  createdAt: string;
  updatedAt: string;
}

interface RedemptionHistory {
  redemption_id: number;
  reward_name: string;
  points_redeemed: number;
  business_name?: string;
  redeemed_at: string;
}

export default function Rewards() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("available");

  // Fetch user's available points
  const { data: userPoints = 0 } = useQuery<number>({
    queryKey: ["/api/user-points"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/user-points");
      const data = await response.json();
      return data.points;
    },
    enabled: !!user,
  });

  // Fetch available reward items
  const { data: rewardItems = [], isLoading: loadingItems } = useQuery<
    RewardItem[]
  >({
    queryKey: ["/api/reward-items"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/reward-items");
      return await response.json();
    },
    enabled: !!user,
  });

  // Fetch redemption history
  const { data: redemptionHistory = [], isLoading: loadingHistory } = useQuery<
    RedemptionHistory[]
  >({
    queryKey: ["/api/redemption-history"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/redemption-history");
      return await response.json();
    },
    enabled: !!user,
  });

  // Redeem reward mutation
  const redeemMutation = useMutation({
    mutationFn: async (rewardItemId: number) => {
      const response = await apiRequest("POST", "/api/redeem-reward", {
        rewardItemId,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Reward Redeemed!",
        description: `You've successfully redeemed ${data.reward_name} for ${data.points_redeemed} points!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user-points"] });
      queryClient.invalidateQueries({ queryKey: ["/api/redemption-history"] });
    },
    onError: (error: any) => {
      toast({
        title: "Redemption Failed",
        description: error.message || "Failed to redeem reward",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canAfford = (pointThreshold: number) => userPoints >= pointThreshold;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sign in Required
          </h3>
          <p className="text-gray-500">Please sign in to view your rewards.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Rewards</h1>
              <p className="text-xs text-gray-500">Redeem your points</p>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-lg font-bold text-gray-900">
                {userPoints}
              </span>
              <span className="text-sm text-gray-500">points</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="available">Available Rewards</TabsTrigger>
              <TabsTrigger value="history">Redemption History</TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-4">
              {loadingItems ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading rewards...</div>
                </div>
              ) : rewardItems.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Rewards Available
                  </h3>
                  <p className="text-gray-500">
                    Check back later for new rewards to redeem!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rewardItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      {item.imageUrl && (
                        <div className="aspect-video w-full overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <Badge
                            variant={
                              canAfford(item.pointThreshold)
                                ? "default"
                                : "secondary"
                            }
                            className="ml-2"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {item.pointThreshold}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-gray-600 text-sm mb-4">
                          {item.description}
                        </p>

                        {item.expirationDate && (
                          <div className="flex items-center text-xs text-gray-500 mb-3">
                            <Clock className="h-3 w-3 mr-1" />
                            Expires: {formatDate(item.expirationDate)}
                          </div>
                        )}

                        <Button
                          onClick={() => redeemMutation.mutate(item.id)}
                          disabled={
                            !canAfford(item.pointThreshold) ||
                            redeemMutation.isPending
                          }
                          className="w-full"
                          variant={
                            canAfford(item.pointThreshold)
                              ? "default"
                              : "secondary"
                          }
                        >
                          {redeemMutation.isPending
                            ? "Redeeming..."
                            : canAfford(item.pointThreshold)
                            ? "Redeem Now"
                            : `Need ${
                                item.pointThreshold - userPoints
                              } more points`}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {loadingHistory ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading history...</div>
                </div>
              ) : redemptionHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Redemptions Yet
                  </h3>
                  <p className="text-gray-500">
                    Your redemption history will appear here once you start
                    redeeming rewards.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {redemptionHistory.map((redemption) => (
                    <Card key={redemption.redemption_id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {redemption.reward_name}
                            </h3>
                            {redemption.business_name && (
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {redemption.business_name}
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(redemption.redeemed_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">
                              -{redemption.points_redeemed} points
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
