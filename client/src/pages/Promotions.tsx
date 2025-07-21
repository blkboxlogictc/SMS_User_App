import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Promotion } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag, User, Plus, Percent } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPromotionSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

const promotionFormSchema = insertPromotionSchema.extend({
  expiresAt: z.string().min(1, "Expiration date is required"),
});

type PromotionFormData = z.infer<typeof promotionFormSchema>;

export default function Promotions() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: promotions = [], isLoading } = useQuery<Promotion[]>({
    queryKey: ['/api/promotions'],
  });

  const { data: businesses = [] } = useQuery({
    queryKey: ['/api/businesses'],
    enabled: user?.role === 'business',
  });

  const form = useForm<PromotionFormData>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      businessId: 0,
      code: "",
      discount: "",
      expiresAt: "",
      isActive: true,
    },
  });

  const createPromotionMutation = useMutation({
    mutationFn: async (data: PromotionFormData) => {
      const { expiresAt, ...rest } = data;
      await apiRequest('POST', '/api/promotions', {
        ...rest,
        expiresAt: new Date(expiresAt).toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Promotion created!",
        description: "Your promotion has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/promotions'] });
      setIsCreateDialogOpen(false);
      form.reset();
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
        title: "Failed to create promotion",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "No expiration";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const onSubmit = (data: PromotionFormData) => {
    createPromotionMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="text-gray-500">Loading promotions...</div>
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
              <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--sms-green))] to-[hsl(var(--sms-blue))] rounded-lg flex items-center justify-center">
                <Tag className="text-white" size={16} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Promotions</h1>
                <p className="text-xs text-gray-500">Current deals and offers</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {user?.role === 'business' && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="sms-green">
                      <Plus size={16} className="mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Promotion</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 20% Off Lunch Special" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe your promotion..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="businessId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business</FormLabel>
                              <Select 
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                value={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a business" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {businesses.map((business: any) => (
                                    <SelectItem key={business.id} value={business.id.toString()}>
                                      {business.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Promo Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="SAVE20" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="discount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Discount</FormLabel>
                                <FormControl>
                                  <Input placeholder="20%" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="expiresAt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expires At</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex space-x-2">
                          <Button 
                            type="submit" 
                            className="flex-1 sms-blue"
                            disabled={createPromotionMutation.isPending}
                          >
                            {createPromotionMutation.isPending ? 'Creating...' : 'Create Promotion'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsCreateDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <User size={20} className="text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        {promotions.length === 0 ? (
          <div className="text-center py-12">
            <Tag size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No promotions available</h3>
            <p className="text-gray-500">Check back soon for exciting deals and offers!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {promotions.map((promotion) => (
              <Card key={promotion.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                        <Percent className="text-white" size={16} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{promotion.title}</h3>
                        <p className="text-sm text-gray-500">Business ID: {promotion.businessId}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                      Expires {formatDate(promotion.expiresAt)}
                    </span>
                  </div>
                  
                  {promotion.description && (
                    <p className="text-sm text-gray-600 mb-3">{promotion.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {promotion.code && (
                        <div className="text-xs text-gray-400">
                          Code: <span className="font-mono bg-gray-100 px-1 rounded">{promotion.code}</span>
                        </div>
                      )}
                      {promotion.discount && (
                        <div className="text-xs text-orange-600 font-medium">
                          {promotion.discount}
                        </div>
                      )}
                    </div>
                    <Button size="sm" className="sms-green text-xs px-3 py-1 h-7">
                      Claim
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
