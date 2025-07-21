import { Business } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, Globe, HourglassIcon, Phone, MapPin, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";

interface BusinessModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BusinessModal({ business, isOpen, onClose }: BusinessModalProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const checkinMutation = useMutation({
    mutationFn: async (businessId: number) => {
      await apiRequest('POST', '/api/checkins', { businessId });
    },
    onSuccess: () => {
      toast({
        title: "Check-in successful!",
        description: `You've checked in at ${business?.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/checkins'] });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {business.name}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </DialogTitle>
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
            <span className="text-sm text-gray-500">{business.category}</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${business.isOpen ? 'bg-[hsl(var(--sms-green))]' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${business.isOpen ? 'text-[hsl(var(--sms-green))]' : 'text-red-500'}`}>
                {business.isOpen ? 'Open Now' : 'Closed'}
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
                  {typeof business.hours === 'object' ? (
                    Object.entries(business.hours as Record<string, string>).map(([day, hours]) => (
                      <div key={day}>{day}: {hours}</div>
                    ))
                  ) : (
                    business.hours
                  )}
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
                {business.website.replace(/^https?:\/\//, '')}
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
              <div className="text-sm font-medium text-gray-900">Current Wait Time</div>
              <div className={`text-sm ${business.waitTime ? 'text-orange-600' : 'text-[hsl(var(--sms-green))]'}`}>
                {formatWaitTime(business.waitTime)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button 
              className="flex-1 sms-green"
              onClick={handleCheckIn}
              disabled={checkinMutation.isPending}
            >
              <MapPin size={16} className="mr-2" />
              {checkinMutation.isPending ? 'Checking in...' : 'Check In'}
            </Button>
            {business.phone && (
              <Button 
                variant="outline"
                className="flex-1"
                onClick={handleCall}
              >
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
