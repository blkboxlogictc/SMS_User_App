import { Business, Promotion } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  Globe,
  HourglassIcon,
  Phone,
  MapPin,
  X,
  Tag,
} from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";

interface BusinessModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BusinessModal({
  business,
  isOpen,
  onClose,
}: BusinessModalProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: promotions = [] } = useQuery<Promotion[]>({
    queryKey: ["/api/promotions"],
  });

  // Get promotions for this business
  const businessPromotions = business
    ? promotions.filter(
        (promo) => promo.businessId === business.id && promo.isActive
      )
    : [];

  const checkinMutation = useMutation({
    mutationFn: async (businessId: number) => {
      await apiRequest("POST", "/api/checkins", { businessId });
    },
    onSuccess: () => {
      toast({
        title: "Check-in successful!",
        description: `You've checked in at ${business?.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/checkins"] });
      onClose();
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
        title: "Check-in failed",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  if (!business) return null;

  const handleCheckIn = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to check in",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
    checkinMutation.mutate(business.id);
  };

  const handleCall = () => {
    if (business.phone) {
      window.location.href = `tel:${business.phone}`;
    }
  };

  const formatWaitTime = (waitTime: number | null) => {
    if (!waitTime) return "No wait";
    return `Approximately ${waitTime} minutes`;
  };

  const formatBusinessHours = (
    hours: string | Record<string, string> | null
  ): string[] | null => {
    if (!hours) return null;

    let hoursObj: Record<string, string>;

    // Parse hours if it's a string
    if (typeof hours === "string") {
      try {
        hoursObj = JSON.parse(hours);
      } catch {
        return [hours]; // Return as array if parsing fails
      }
    } else {
      hoursObj = hours;
    }

    // Define day order
    const dayOrder = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    return dayOrder.map((day) => {
      const dayName = day.charAt(0).toUpperCase() + day.slice(1);
      const dayHours = hoursObj[day] || hoursObj[day.toLowerCase()];

      if (!dayHours || dayHours.toLowerCase() === "closed") {
        return `${dayName}: Closed`;
      }

      // Format time if it's in 24-hour format
      const formatTime = (timeStr: string) => {
        if (timeStr.includes("-")) {
          const [start, end] = timeStr.split("-");
          const formatSingleTime = (time: string) => {
            const [hours, minutes] = time.split(":");
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? "PM" : "AM";
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            return `${displayHour}:${minutes} ${ampm}`;
          };
          return `${formatSingleTime(start)} - ${formatSingleTime(end)}`;
        }
        return timeStr;
      };

      return `${dayName}: ${formatTime(dayHours)}`;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{business.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Business Image */}
          {business.imageUrl && (
            <img
              src={business.imageUrl}
              alt={business.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          )}

          {/* Category & Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {business.category as string}
            </span>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  business.isOpen ? "bg-[hsl(var(--sms-green))]" : "bg-red-500"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  business.isOpen
                    ? "text-[hsl(var(--sms-green))]"
                    : "text-red-500"
                }`}
              >
                {business.isOpen ? "Open Now" : "Closed"}
              </span>
            </div>
          </div>

          {/* Description */}
          {business.description && (
            <p className="text-sm text-gray-600">{business.description}</p>
          )}

          {/* Hours */}
          {business.hours && (
            <div className="flex items-start space-x-3">
              <Clock size={16} className="text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-900">Hours</div>
                <div className="text-sm text-gray-600">
                  {formatBusinessHours(
                    business.hours as string | Record<string, string> | null
                  )?.map((dayHours: string, index: number) => (
                    <div key={index}>{dayHours}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Website */}
          {business.website && (
            <div className="flex items-center space-x-3">
              <Globe size={16} className="text-gray-400" />
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[hsl(var(--sms-blue))] hover:underline"
              >
                {business.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}

          {/* Address */}
          {business.address && (
            <div className="flex items-center space-x-3">
              <MapPin size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">{business.address}</span>
            </div>
          )}

          {/* Wait Time */}
          <div className="flex items-center space-x-3">
            <HourglassIcon size={16} className="text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                Current Wait Time
              </div>
              <div
                className={`text-sm ${
                  business.waitTime
                    ? "text-orange-600"
                    : "text-[hsl(var(--sms-green))]"
                }`}
              >
                {formatWaitTime(business.waitTime)}
              </div>
            </div>
          </div>

          {/* Promotions */}
          {businessPromotions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Tag size={16} className="text-gray-400" />
                <div className="text-sm font-medium text-gray-900">
                  Current Promotions
                </div>
              </div>
              {businessPromotions.map((promotion) => (
                <div
                  key={promotion.id}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-blue-900">
                      {promotion.title}
                    </h4>
                    {promotion.discount && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        {promotion.discount}
                      </span>
                    )}
                  </div>
                  {promotion.description && (
                    <p className="text-sm text-blue-800 mb-2">
                      {promotion.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    {promotion.code && (
                      <span className="font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Code: {promotion.code}
                      </span>
                    )}
                    {promotion.expiresAt && (
                      <span className="text-blue-600">
                        Expires:{" "}
                        {new Date(promotion.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              className="flex-1 sms-green"
              onClick={handleCheckIn}
              disabled={checkinMutation.isPending}
            >
              <MapPin size={16} className="mr-2" />
              {checkinMutation.isPending ? "Checking in..." : "Check In"}
            </Button>
            {business.phone && (
              <Button variant="outline" className="flex-1" onClick={handleCall}>
                <Phone size={16} className="mr-2" />
                Call
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
