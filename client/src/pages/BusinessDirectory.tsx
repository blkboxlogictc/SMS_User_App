import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Business, Promotion } from "@shared/schema";
import BusinessModal from "@/components/BusinessModal";
import BottomNavigation from "@/components/BottomNavigation";
import UserMenu from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, User, Search, Clock, Phone, Globe } from "lucide-react";

export default function BusinessDirectory() {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: businesses = [] } = useQuery<Business[]>({
    queryKey: ["/api/businesses"],
  });

  const { data: promotions = [] } = useQuery<Promotion[]>({
    queryKey: ["/api/promotions"],
  });

  const handleBusinessClick = (business: Business) => {
    setSelectedBusiness(business);
    setIsBusinessModalOpen(true);
  };

  // Separate featured and regular businesses
  const featuredBusinesses = businesses.filter(
    (business) => business.isFeatured
  );
  const regularBusinesses = businesses.filter(
    (business) => !business.isFeatured
  );

  // Filter businesses based on search term
  const filteredFeaturedBusinesses = featuredBusinesses.filter(
    (business) =>
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRegularBusinesses = regularBusinesses.filter(
    (business) =>
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Combine filtered results with featured businesses first
  const filteredBusinesses = [
    ...filteredFeaturedBusinesses,
    ...filteredRegularBusinesses,
  ];

  // Get promotions for a specific business
  const getBusinessPromotions = (businessId: number) => {
    return promotions.filter(
      (promo) => promo.businessId === businessId && promo.isActive
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-20">
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
                  Business Directory
                </h1>
                <p className="text-xs text-white">Downtown Stuart, FL</p>
              </div>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            type="text"
            placeholder="Search businesses, categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 py-4">
        {/* Featured Businesses Section */}
        {!searchTerm && filteredFeaturedBusinesses.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Featured Businesses
              </h2>
              <span className="text-sm text-gray-500">
                {filteredFeaturedBusinesses.length} featured
              </span>
            </div>
            <div className="space-y-3">
              {filteredFeaturedBusinesses.map((business) => {
                const businessPromotions = getBusinessPromotions(business.id);
                return (
                  <Card
                    key={business.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50"
                    onClick={() => handleBusinessClick(business)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        {business.imageUrl && (
                          <img
                            src={business.imageUrl}
                            alt={business.name}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-gray-900 text-base">
                                  {business.name}
                                </h3>
                                <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full font-medium">
                                  FEATURED
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                {business.category}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  business.isOpen
                                    ? "bg-[hsl(var(--sms-green))]"
                                    : "bg-red-500"
                                }`}
                              />
                              <span
                                className={`text-xs font-medium ${
                                  business.isOpen
                                    ? "text-[hsl(var(--sms-green))]"
                                    : "text-red-500"
                                }`}
                              >
                                {business.isOpen ? "Open" : "Closed"}
                              </span>
                            </div>
                          </div>

                          {business.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {business.description}
                            </p>
                          )}

                          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                            {business.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone size={12} />
                                <span>{business.phone}</span>
                              </div>
                            )}
                            {business.address && (
                              <div className="flex items-center space-x-1">
                                <MapPin size={12} />
                                <span className="truncate">
                                  {business.address}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {business.waitTime ? (
                                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                                  {business.waitTime} min wait
                                </span>
                              ) : (
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                                  No wait
                                </span>
                              )}
                              {businessPromotions.length > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                  {businessPromotions.length} promotion
                                  {businessPromotions.length > 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* All Businesses Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {searchTerm
              ? `Search Results (${filteredBusinesses.length})`
              : !searchTerm && filteredFeaturedBusinesses.length > 0
              ? "All Businesses"
              : "All Businesses"}
          </h2>
          <span className="text-sm text-gray-500">
            {searchTerm
              ? filteredBusinesses.length
              : filteredRegularBusinesses.length}{" "}
            found
          </span>
        </div>

        {/* Business List */}
        <div className="space-y-3">
          {(searchTerm ? filteredBusinesses : filteredRegularBusinesses).map(
            (business) => {
              const businessPromotions = getBusinessPromotions(business.id);
              return (
                <Card
                  key={business.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleBusinessClick(business)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {business.imageUrl && (
                        <img
                          src={business.imageUrl}
                          alt={business.name}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900 text-base">
                                {business.name}
                              </h3>
                              {business.isFeatured && searchTerm && (
                                <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full font-medium">
                                  FEATURED
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {business.category}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                business.isOpen
                                  ? "bg-[hsl(var(--sms-green))]"
                                  : "bg-red-500"
                              }`}
                            />
                            <span
                              className={`text-xs font-medium ${
                                business.isOpen
                                  ? "text-[hsl(var(--sms-green))]"
                                  : "text-red-500"
                              }`}
                            >
                              {business.isOpen ? "Open" : "Closed"}
                            </span>
                          </div>
                        </div>

                        {business.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {business.description}
                          </p>
                        )}

                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                          {business.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone size={12} />
                              <span>{business.phone}</span>
                            </div>
                          )}
                          {business.address && (
                            <div className="flex items-center space-x-1">
                              <MapPin size={12} />
                              <span className="truncate">
                                {business.address}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {business.waitTime ? (
                              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                                {business.waitTime} min wait
                              </span>
                            ) : (
                              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                                No wait
                              </span>
                            )}
                            {businessPromotions.length > 0 && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                {businessPromotions.length} promotion
                                {businessPromotions.length > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }
          )}
        </div>

        {filteredBusinesses.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No businesses found matching your search.
            </p>
          </div>
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
