import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, MapPin, Calendar } from "lucide-react";

export default function Account() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: checkins = [] } = useQuery({
    queryKey: ['/api/checkins'],
    enabled: isAuthenticated,
  });

  const { data: eventRsvps = [] } = useQuery({
    queryKey: ['/api/event-rsvps'],
    enabled: isAuthenticated,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--sms-green))] to-[hsl(var(--sms-blue))] rounded-lg flex items-center justify-center">
                <User className="text-white" size={16} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">My Account</h1>
                <p className="text-xs text-gray-500">Profile and activity</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <User size={20} className="text-gray-600" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        {/* Profile Card */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4 mb-4">
              {user.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover" 
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={32} className="text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {user.firstName || user.lastName ? 
                    `${user.firstName || ''} ${user.lastName || ''}`.trim() :
                    user.email || 'User'
                  }
                </h3>
                <p className="text-sm text-gray-500 capitalize">{user.role} User</p>
                <p className="text-xs text-gray-400">
                  Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Activity Stats */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Your Activity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 sms-green-light rounded-lg">
                <div className="text-2xl font-bold text-[hsl(var(--sms-green))]">
                  {checkins.length}
                </div>
                <div className="text-xs text-gray-600">Check-ins</div>
              </div>
              <div className="text-center p-3 sms-blue-light rounded-lg">
                <div className="text-2xl font-bold text-[hsl(var(--sms-blue))]">
                  {eventRsvps.length}
                </div>
                <div className="text-xs text-gray-600">Events RSVPed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Check-ins */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Check-ins</h3>
            {checkins.length === 0 ? (
              <div className="text-center py-6">
                <MapPin size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No check-ins yet</p>
                <p className="text-xs text-gray-400">Start exploring local businesses!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {checkins.slice(0, 5).map((checkin) => (
                  <div key={checkin.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 sms-green rounded-full flex items-center justify-center">
                        <MapPin size={16} className="text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Check-in #{checkin.id}</div>
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
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
