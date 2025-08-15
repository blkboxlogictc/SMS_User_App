import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Business } from "@shared/schema";

// Fix for default markers in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Category mapping and colors
export const GENERAL_CATEGORIES = {
  EATERIES: "Eateries",
  SHOPPING: "Shopping",
  SERVICES: "Services",
  ENTERTAINMENT: "Entertainment",
} as const;

export type GeneralCategory =
  (typeof GENERAL_CATEGORIES)[keyof typeof GENERAL_CATEGORIES];

export const CATEGORY_MAPPING: Record<string, GeneralCategory> = {
  Restaurant: GENERAL_CATEGORIES.EATERIES,
  Cafe: GENERAL_CATEGORIES.EATERIES,
  "Bar/Lounge": GENERAL_CATEGORIES.ENTERTAINMENT,
  Retail: GENERAL_CATEGORIES.SHOPPING,
  Service: GENERAL_CATEGORIES.SERVICES,
  Entertainment: GENERAL_CATEGORIES.ENTERTAINMENT,
  "Art Gallery": GENERAL_CATEGORIES.ENTERTAINMENT,
  "Health & Wellness": GENERAL_CATEGORIES.SERVICES,
  "Professional Services": GENERAL_CATEGORIES.SERVICES,
  Automotive: GENERAL_CATEGORIES.SERVICES,
  "Beauty & Personal Care": GENERAL_CATEGORIES.SERVICES,
  "Home & Garden": GENERAL_CATEGORIES.SHOPPING,
  "Sports & Recreation": GENERAL_CATEGORIES.ENTERTAINMENT,
  Education: GENERAL_CATEGORIES.SERVICES,
};

export const CATEGORY_COLORS: Record<GeneralCategory, string> = {
  [GENERAL_CATEGORIES.EATERIES]: "#ef4444", // Red
  [GENERAL_CATEGORIES.SHOPPING]: "#3b82f6", // Blue
  [GENERAL_CATEGORIES.SERVICES]: "#10b981", // Green
  [GENERAL_CATEGORIES.ENTERTAINMENT]: "#f59e0b", // Orange
};

interface MapViewProps {
  businesses: Business[];
  onBusinessClick?: (business: Business) => void;
  selectedCategories?: GeneralCategory[];
}

// Helper function to get general category for a business
const getGeneralCategory = (businessCategory: string): GeneralCategory => {
  return CATEGORY_MAPPING[businessCategory] || GENERAL_CATEGORIES.SERVICES;
};

// Helper function to create custom colored marker
const createColoredMarker = (color: string, businessName: string) => {
  const svgIcon = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 19.4 12.5 41 12.5 41S25 19.4 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="width: 25px; height: 41px;">
          ${svgIcon}
        </div>
        <div style="
          background: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          margin-top: -5px;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        ">${businessName}</div>
      </div>
    `,
    className: "custom-marker",
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
    popupAnchor: [0, -41],
  });
};

export default function MapView({
  businesses,
  onBusinessClick,
  selectedCategories,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map centered on downtown Stuart, FL with maximum zoom capability
    const map = L.map(mapRef.current, {
      maxZoom: 19, // Maximum zoom level supported by OpenStreetMap
      minZoom: 10, // Minimum zoom to keep focus on Stuart area
    }).setView([27.197, -80.2535], 16);

    // Add OpenStreetMap tiles with maximum zoom support
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19, // Match the map's maximum zoom level
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Filter businesses based on selected categories
    const filteredBusinesses =
      selectedCategories && selectedCategories.length > 0
        ? businesses.filter((business) => {
            const generalCategory = getGeneralCategory(business.category);
            return selectedCategories.includes(generalCategory);
          })
        : businesses;

    // Add markers for each filtered business
    filteredBusinesses.forEach((business) => {
      if (business.latitude && business.longitude) {
        const lat =
          typeof business.latitude === "string"
            ? parseFloat(business.latitude)
            : business.latitude;
        const lng =
          typeof business.longitude === "string"
            ? parseFloat(business.longitude)
            : business.longitude;

        // Get the general category and color
        const generalCategory = getGeneralCategory(business.category);
        const color = CATEGORY_COLORS[generalCategory];

        // Create custom colored marker with business name
        const customIcon = createColoredMarker(color, business.name);

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)
          .bindPopup(`
            <div class="p-3">
              <h3 class="font-bold text-sm mb-1">${business.name}</h3>
              <div class="flex items-center gap-2 mb-2">
                <span class="inline-block w-3 h-3 rounded-full" style="background-color: ${color}"></span>
                <span class="text-xs text-gray-600">${
                  business.category
                } • ${generalCategory}</span>
              </div>
              <p class="text-xs text-gray-700 mb-2">${business.address}</p>
              <div class="flex gap-1 flex-wrap">
                ${
                  business.isOpen
                    ? `<span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Open</span>`
                    : `<span class="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Closed</span>`
                }
                ${
                  business.waitTime && business.waitTime > 0
                    ? `<span class="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">${business.waitTime} min wait</span>`
                    : ""
                }
              </div>
            </div>
          `);

        if (onBusinessClick) {
          marker.on("click", () => onBusinessClick(business));
        }
      }
    });
  }, [businesses, onBusinessClick, selectedCategories]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full absolute inset-0"
      style={{ zIndex: 1 }}
    />
  );
}
