import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Business } from "@shared/schema";
import MapView, {
  GENERAL_CATEGORIES,
  GeneralCategory,
  CATEGORY_COLORS,
} from "@/components/MapView";
import BusinessModal from "@/components/BusinessModal";
import BusinessDashboard from "@/components/BusinessDashboard";
import BottomNavigation from "@/components/BottomNavigation";
import UserMenu from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, BarChart3, Calendar, Store, Filter } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<
    GeneralCategory[]
  >([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: businesses = [] } = useQuery<Business[]>({
    queryKey: ["/api/businesses"],
  });

  const { data: stats } = useQuery<{
    totalBusinesses: number;
    openBusinesses: number;
    upcomingEvents: number;
  }>({
    queryKey: ["/api/stats"],
  });

  // Fetch owned businesses for business owners
  const { data: ownedBusinesses = [] } = useQuery<Business[]>({
    queryKey: ["/api/businesses/owned"],
    enabled: !!user && user?.user_metadata?.role === "business",
  });

  const handleBusinessClick = (business: Business) => {
    setSelectedBusiness(business);
    setIsBusinessModalOpen(true);
  };

  const handleManageBusinessClick = () => {
    setLocation("/account");
  };

  const handleCategoryToggle = (category: GeneralCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
  };

  const isBusinessOwner = user?.user_metadata?.role === "business";
  const primaryBusiness = ownedBusinesses[0]; // Get the first owned business

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-20 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 shadow-lg sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
                <MapPin className="text-blue-600" size={16} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  Stuart Main Street
                </h1>
                <p className="text-xs text-white">Downtown Stuart, FL</p>
              </div>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Business Dashboard for Business Owners or Map for Patrons */}
        {isBusinessOwner ? (
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50/30 to-green-50/30">
            {primaryBusiness ? (
              <div className="p-4">
                <BusinessDashboard
                  businessId={primaryBusiness.id}
                  businessName={primaryBusiness.name}
                />
              </div>
            ) : (
              <div className="p-4">
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardContent className="p-6 text-center">
                    <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Business Found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You don't have any businesses associated with your account
                      yet.
                    </p>
                    <Button
                      onClick={handleManageBusinessClick}
                      className="bg-gradient-to-r from-[hsl(var(--sms-blue))] to-[hsl(var(--sms-green))] hover:from-[hsl(var(--sms-blue))]/90 hover:to-[hsl(var(--sms-green))]/90"
                    >
                      Set Up Business
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Filter Controls Bar */}
            <div className="px-4 py-3 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Explore Businesses
                  </h3>
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[hsl(var(--sms-blue))] to-[hsl(var(--sms-green))] rounded-full text-xs text-white hover:shadow-md transition-all"
                  >
                    <BarChart3 size={12} />
                    Stats
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {selectedCategories.length > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 rounded-full transition-all ${
                      showFilters
                        ? "bg-gradient-to-r from-[hsl(var(--sms-blue))] to-[hsl(var(--sms-green))] text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                    }`}
                  >
                    <Filter size={16} />
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {Object.values(GENERAL_CATEGORIES).map((category) => {
                    const isSelected = selectedCategories.includes(category);
                    const color = CATEGORY_COLORS[category];

                    return (
                      <button
                        key={category}
                        onClick={() => handleCategoryToggle(category)}
                        className={`flex items-center gap-2 p-3 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-gradient-to-r from-[hsl(var(--sms-blue))] to-[hsl(var(--sms-green))] text-white shadow-lg transform scale-105"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full shadow-sm border border-white/20"
                          style={{ backgroundColor: color }}
                        />
                        {category}
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedCategories.length > 0 && !showFilters && (
                <div className="flex flex-wrap gap-1">
                  {selectedCategories.map((category) => {
                    const color = CATEGORY_COLORS[category];
                    return (
                      <span
                        key={category}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700 border border-gray-200"
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        {category}
                        <button
                          onClick={() => handleCategoryToggle(category)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Stats Overlay */}
            {showStats && (
              <div
                className="absolute top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-200"
                onClick={() => setShowStats(false)}
              >
                <div className="px-4 py-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-[hsl(var(--sms-blue))] to-[hsl(var(--sms-blue-light))] rounded-full flex items-center justify-center">
                        <Store className="text-white" size={20} />
                      </div>
                      <div className="text-2xl font-bold text-[hsl(var(--sms-blue))]">
                        {stats?.totalBusinesses || 0}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        Total Businesses
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-[hsl(var(--sms-green))] to-[hsl(var(--sms-green-light))] rounded-full flex items-center justify-center">
                        <MapPin className="text-white" size={20} />
                      </div>
                      <div className="text-2xl font-bold text-[hsl(var(--sms-green))]">
                        {stats?.openBusinesses || 0}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        Open Now
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex items-center justify-center">
                        <Calendar className="text-white" size={20} />
                      </div>
                      <div className="text-2xl font-bold text-orange-500">
                        {stats?.upcomingEvents || 0}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        Events Today
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                      Tap anywhere to close
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Full-screen Map */}
            <div className="flex-1 relative map-container">
              <MapView
                businesses={businesses}
                onBusinessClick={handleBusinessClick}
                selectedCategories={selectedCategories}
              />
            </div>
          </>
        )}
      </main>

      {/* Business Modal */}
      <BusinessModal
        business={selectedBusiness}
        isOpen={isBusinessModalOpen}
        onClose={() => setIsBusinessModalOpen(false)}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
