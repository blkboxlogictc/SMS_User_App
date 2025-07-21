import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Business } from "@shared/schema";
import Map from "@/components/Map";
import BusinessModal from "@/components/BusinessModal";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, User } from "lucide-react";

export default function Home() {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);

  const { data: businesses = [] } = useQuery<Business[]>({
    queryKey: ['/api/businesses'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
  });

  const handleBusinessClick = (business: Business) => {
    setSelectedBusiness(business);
    setIsBusinessModalOpen(true);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--sms-green))] to-[hsl(var(--sms-blue))] rounded-lg flex items-center justify-center">
                <MapPin className="text-white" size={16} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Stuart Main Street</h1>
                <p className="text-xs text-gray-500">Downtown Stuart, FL</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <User size={20} className="text-gray-600" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Map */}
        <Map onBusinessClick={handleBusinessClick} />

        {/* Quick Stats */}
        <div className="px-4 py-4 bg-white">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[hsl(var(--sms-blue))]">
                {stats?.totalBusinesses || 0}
              </div>
              <div className="text-xs text-gray-500">Businesses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[hsl(var(--sms-green))]">
                {stats?.openBusinesses || 0}
              </div>
              <div className="text-xs text-gray-500">Open Now</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {stats?.upcomingEvents || 0}
              </div>
              <div className="text-xs text-gray-500">Events Today</div>
            </div>
          </div>
        </div>

        {/* Featured Businesses */}
        <div className="px-4 py-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Businesses</h2>
          <div className="space-y-3">
            {businesses.slice(0, 3).map((business) => (
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
                        className="w-16 h-16 rounded-lg object-cover" 
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{business.name}</h3>
                          <p className="text-sm text-gray-500">{business.category}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${business.isOpen ? 'bg-[hsl(var(--sms-green))]' : 'bg-red-500'}`} />
                          <span className={`text-xs font-medium ${business.isOpen ? 'text-[hsl(var(--sms-green))]' : 'text-red-500'}`}>
                            {business.isOpen ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {business.isOpen ? 'Open now' : 'Closed'}
                        </span>
                        {business.waitTime ? (
                          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                            {business.waitTime} min wait
                          </span>
                        ) : (
                          <span className="text-xs sms-green-light px-2 py-1 rounded">
                            No wait
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
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
