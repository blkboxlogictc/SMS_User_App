import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import BottomNavigation from "@/components/BottomNavigation";
import UserMenu from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Events() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const rsvpMutation = useMutation({
    mutationFn: async (eventId: number) => {
      await apiRequest("POST", "/api/event-rsvps", { eventId });
    },
    onSuccess: () => {
      toast({
        title: "RSVP successful!",
        description: "You've been added to the event",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/event-rsvps"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "RSVP failed",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="text-gray-500">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-20">
      {/* Header */}
      <header className="bg-blue-600 shadow-lg sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
                <Calendar className="text-blue-600" size={16} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Events</h1>
                <p className="text-xs text-white">Upcoming community events</p>
              </div>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No events scheduled
            </h3>
            <p className="text-gray-500">
              Check back soon for upcoming community events!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => (window.location.href = `/events/${event.id}`)}
              >
                {event.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {event.name}
                    </h3>
                    <div className="flex items-center text-sm text-[hsl(var(--sms-blue))] mb-1">
                      <Calendar size={14} className="mr-1" />
                      <span>
                        {formatDate(event.date)} at {formatTime(event.date)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin size={14} className="mr-1" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {event.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs px-3 py-1 h-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/events/${event.id}`;
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      className="sms-green text-xs px-3 py-1 h-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        rsvpMutation.mutate(event.id);
                      }}
                      disabled={rsvpMutation.isPending}
                    >
                      {rsvpMutation.isPending ? "RSVPing..." : "RSVP"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
