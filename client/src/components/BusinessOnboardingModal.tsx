import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Building2, Save } from "lucide-react";

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

interface BusinessOnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BusinessOnboardingModal({
  open,
  onOpenChange,
  onSuccess,
}: BusinessOnboardingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [businessForm, setBusinessForm] = useState({
    name: "",
    category: "",
    description: "",
    address: "",
    phone: "",
    website: "",
    hours: {
      monday: "",
      tuesday: "",
      wednesday: "",
      thursday: "",
      friday: "",
      saturday: "",
      sunday: "",
    },
  });

  const createBusinessMutation = useMutation({
    mutationFn: async (businessData: any) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Call the database function to create business
      const { data, error } = await supabase.rpc("create_business_for_user", {
        p_user_id: user.id,
        p_name: businessData.name,
        p_category: businessData.category,
        p_description: businessData.description || null,
        p_address: businessData.address || null,
        p_phone: businessData.phone || null,
        p_website: businessData.website || null,
        p_hours: businessData.hours ? JSON.stringify(businessData.hours) : null,
      });

      if (error) {
        console.error("Error creating business:", error);
        throw new Error(error.message || "Failed to create business");
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Business Created!",
        description: "Your business has been added successfully.",
      });

      // Reset form
      setBusinessForm({
        name: "",
        category: "",
        description: "",
        address: "",
        phone: "",
        website: "",
        hours: {
          monday: "",
          tuesday: "",
          wednesday: "",
          thursday: "",
          friday: "",
          saturday: "",
          sunday: "",
        },
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/businesses/owned"] });
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });

      // Close modal and call success callback
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFormChange = (field: string, value: any) => {
    setBusinessForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHoursChange = (day: string, value: string) => {
    setBusinessForm((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: value,
      },
    }));
  };

  const handleSubmit = () => {
    if (!businessForm.name || !businessForm.category) {
      toast({
        title: "Error",
        description: "Please fill in the business name and category",
        variant: "destructive",
      });
      return;
    }

    createBusinessMutation.mutate(businessForm);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="text-blue-500" size={20} />
            <span>Add Your Business Information</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business-name">Business Name *</Label>
              <Input
                id="business-name"
                placeholder="Enter your business name"
                value={businessForm.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="business-category">Category *</Label>
              <Select
                value={businessForm.category}
                onValueChange={(value) => handleFormChange("category", value)}
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
            <Label htmlFor="business-description">Description</Label>
            <Textarea
              id="business-description"
              placeholder="Describe your business..."
              value={businessForm.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business-phone">Phone</Label>
              <Input
                id="business-phone"
                placeholder="(555) 123-4567"
                value={businessForm.phone}
                onChange={(e) => handleFormChange("phone", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="business-website">Website</Label>
              <Input
                id="business-website"
                placeholder="https://yourwebsite.com"
                value={businessForm.website}
                onChange={(e) => handleFormChange("website", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="business-address">Address</Label>
            <Input
              id="business-address"
              placeholder="123 Main St, Stuart, FL 34994"
              value={businessForm.address}
              onChange={(e) => handleFormChange("address", e.target.value)}
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
                    value={
                      businessForm.hours[day as keyof typeof businessForm.hours]
                    }
                    onChange={(e) => handleHoursChange(day, e.target.value)}
                    placeholder="e.g., 9:00 AM - 5:00 PM or Closed"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-2 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createBusinessMutation.isPending}
              className="flex-1"
            >
              <Save size={16} className="mr-2" />
              {createBusinessMutation.isPending
                ? "Creating..."
                : "Create Business"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
