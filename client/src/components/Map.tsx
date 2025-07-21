import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Business } from "@shared/schema";
import { MapPin, Coffee, ShoppingBag, Utensils, Palette, Shirt, Book } from "lucide-react";

interface MapProps {
  onBusinessClick: (business: Business) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'restaurant':
    case 'american cuisine':
      return Utensils;
    case 'coffee':
    case 'cafe':
      return Coffee;
    case 'retail':
    case 'shopping':
    case 'fashion & accessories':
      return ShoppingBag;
    case 'art':
    case 'gallery':
      return Palette;
    case 'clothing':
    case 'fashion':
      return Shirt;
    case 'bookstore':
    case 'books':
      return Book;
    default:
      return MapPin;
  }
};

const getCategoryColor = (index: number) => {
  return index % 2 === 0 ? 'hsl(var(--sms-green))' : 'hsl(var(--sms-blue))';
};

export default function Map({ onBusinessClick }: MapProps) {
  const [zoom, setZoom] = useState(1);

  const { data: businesses = [], isLoading } = useQuery<Business[]>({
    queryKey: ['/api/businesses'],
  });

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

  if (isLoading) {
    return (
      <div className="map-container h-96 relative overflow-hidden flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  // Mock positions for businesses - in a real app, these would come from lat/lng coordinates
  const positions = [
    { left: '20%', top: '30%' },
    { left: '45%', top: '25%' },
    { left: '70%', top: '40%' },
    { left: '35%', top: '60%' },
    { left: '60%', top: '70%' },
    { left: '25%', top: '75%' },
  ];

  return (
    <div className="map-container h-96 relative overflow-hidden">
      {/* Background map image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-200"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600')`,
          filter: 'brightness(0.9)',
          transform: `scale(${zoom})`,
        }}
      />
      
      {/* Business Markers */}
      {businesses.map((business, index) => {
        const position = positions[index % positions.length];
        const IconComponent = getCategoryIcon(business.category);
        const color = getCategoryColor(index);
        
        return (
          <div
            key={business.id}
            className="business-marker absolute cursor-pointer z-10"
            style={{ 
              left: position.left, 
              top: position.top,
              transform: `scale(${zoom})`,
            }}
            onClick={() => onBusinessClick(business)}
          >
            <div 
              className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-white border-2 border-white"
              style={{ backgroundColor: color }}
            >
              <IconComponent size={16} />
            </div>
            <div 
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45"
              style={{ backgroundColor: color }}
            />
          </div>
        );
      })}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-20">
        <button 
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:text-sms-blue"
          onClick={handleZoomIn}
        >
          +
        </button>
        <button 
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:text-sms-blue"
          onClick={handleZoomOut}
        >
          −
        </button>
      </div>
    </div>
  );
}
