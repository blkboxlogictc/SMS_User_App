import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Event } from "@shared/schema";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, User, ArrowLeft, Clock, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/lib/auth";
import { AuthModal } from "@/components/auth/AuthModal";

export default function EventDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: [`/api/events/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/events/${id}`);
      if (!response.ok) {
        throw new Error("Event not found");
      }
      return response.json();
    },
    enabled: !!id,
  });

  const { data: rsvps = [] } = useQuery({
    queryKey: [`/api/events/${id}/rsvps`],
    queryFn: async () => {
      const response = await fetch(`/api/events/${id}/rsvps`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!id,
  });

  // Get user's RSVPs to check if they've already RSVP'd
  const { data: userRsvps = [] } = useQuery<any[]>({
    queryKey: ["/api/event-rsvps"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/event-rsvps");
        return await response.json();
      } catch (error) {
        if (isUnauthorizedError(error as Error)) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!user,
  });

  // Check if user has already RSVP'd for this event
  const hasUserRsvpd =
    Array.isArray(userRsvps) &&
    userRsvps.some((rsvp: any) => rsvp.eventId === parseInt(id!));

  const rsvpMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/event-rsvps", { eventId: parseInt(id!) });
    },
    onSuccess: () => {
      toast({
        title: "RSVP successful!",
        description: "You've been added to the event",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/event-rsvps"] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${id}/rsvps`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please sign in to RSVP for events",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "RSVP failed",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Check-in mutation
  const checkinMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/checkins", { eventId: parseInt(id!) });
    },
    onSuccess: () => {
      toast({
        title: "Check-in successful!",
        description: "You've checked in to the event and earned 5 points!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/checkins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rewards"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please sign in to check in to events",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Check-in failed",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
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

  const handleBack = () => {
    setLocation("/events");
  };

  // Check if event is in the future
  const isEventInFuture = () => {
    if (!event) return false;
    const eventDate = new Date(event.date);
    const now = new Date();
    return eventDate > now;
  };

  // Check if event is today
  const isEventToday = () => {
    if (!event) return false;
    const eventDate = new Date(event.date);
    const today = new Date();
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="text-gray-500">Loading event...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Event not found
          </h3>
          <p className="text-gray-500 mb-4">
            The event you're looking for doesn't exist.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Events
          </Button>
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
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft size={20} className="text-gray-600" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Event Details
                </h1>
                <p className="text-xs text-gray-500">Event information</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero Image */}
          {event.imageUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-lg mb-6">
              <img
                src={event.imageUrl}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Event Info Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {event.name}
              </h1>

              {/* Date and Time */}
              <div className="flex items-center text-lg text-[hsl(var(--sms-blue))] mb-3">
                <Calendar size={20} className="mr-3" />
                <div>
                  <div className="font-semibold">{formatDate(event.date)}</div>
                  <div className="text-sm text-gray-600">
                    {formatTime(event.date)}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center text-gray-700 mb-4">
                <MapPin size={20} className="mr-3" />
                <span className="text-lg">{event.location}</span>
              </div>

              {/* RSVP Count */}
              <div className="flex items-center text-gray-600 mb-6">
                <Users size={20} className="mr-3" />
                <span>
                  {rsvps.length} {rsvps.length === 1 ? "person" : "people"}{" "}
                  attending
                </span>
              </div>

              {/* Description */}
              {event.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    About this event
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                {user && user.user_metadata?.role === "business" ? (
                  // Show message for business owners
                  <div className="text-center text-gray-600">
                    <p className="text-sm">
                      Business owners cannot RSVP to events
                    </p>
                  </div>
                ) : (
                  // Always show buttons for patrons and unauthenticated users
                  <>
                    {/* RSVP Button - Always show */}
                    <Button
                      variant="default"
                      size="lg"
                      style={{
                        backgroundColor: hasUserRsvpd ? "#9CA3AF" : "#4ADE80",
                        color: "white",
                        padding: "12px 32px",
                        fontSize: "16px",
                        fontWeight: "500",
                        border: "none",
                        borderRadius: "6px",
                        cursor: hasUserRsvpd ? "not-allowed" : "pointer",
                        opacity: hasUserRsvpd ? 0.6 : 1,
                      }}
                      onClick={() => {
                        // If not authenticated, show auth modal (will default to patron role)
                        if (!user) {
                          setShowAuthModal(true);
                          return;
                        }
                        // If authenticated as patron and hasn't RSVP'd, allow RSVP
                        if (
                          user.user_metadata?.role !== "business" &&
                          !hasUserRsvpd
                        ) {
                          rsvpMutation.mutate();
                        }
                      }}
                      disabled={rsvpMutation.isPending || hasUserRsvpd}
                    >
                      {rsvpMutation.isPending
                        ? "RSVPing..."
                        : hasUserRsvpd
                        ? "Already RSVP'd"
                        : "RSVP for this Event"}
                    </Button>

                    {/* Check-In Button - Always show */}
                    <Button
                      variant="default"
                      size="lg"
                      style={{
                        backgroundColor: "#3B82F6",
                        color: "white",
                        padding: "12px 32px",
                        fontSize: "16px",
                        fontWeight: "500",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        // If not authenticated, show auth modal (will default to patron role)
                        if (!user) {
                          setShowAuthModal(true);
                          return;
                        }
                        // If authenticated as patron but hasn't RSVP'd, show message
                        if (
                          user.user_metadata?.role !== "business" &&
                          !hasUserRsvpd
                        ) {
                          toast({
                            title: "RSVP Required",
                            description:
                              "You must RSVP first to check in to this event",
                            variant: "destructive",
                          });
                          return;
                        }
                        // If authenticated as patron and has RSVP'd, allow check-in
                        if (
                          user.user_metadata?.role !== "business" &&
                          hasUserRsvpd
                        ) {
                          checkinMutation.mutate();
                        }
                      }}
                      disabled={checkinMutation.isPending}
                    >
                      {checkinMutation.isPending
                        ? "Checking in..."
                        : "Check In to Event"}
                    </Button>

                    {/* Show helpful messages */}
                    {user &&
                      user.user_metadata?.role !== "business" &&
                      !hasUserRsvpd && (
                        <div className="text-center text-gray-600">
                          <p className="text-sm">
                            RSVP first to unlock check-in
                          </p>
                        </div>
                      )}

                    {!user && (
                      <div className="text-center text-gray-600">
                        <p className="text-sm">
                          Sign in as a patron to RSVP and check in to events
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event Details Card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Event Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <Clock size={16} className="mr-3" />
                  <div>
                    <div className="font-medium">Duration</div>
                    <div className="text-sm">
                      Check event description for details
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <Users size={16} className="mr-3" />
                  <div>
                    <div className="font-medium">Attendees</div>
                    <div className="text-sm">{rsvps.length} confirmed</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode="signin"
        />
      )}
    </div>
  );
}
