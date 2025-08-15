// OpenStreetMap Geocoding utilities
interface GeocodingResult {
  latitude: number;
  longitude: number;
  display_name: string;
  osm_type?: string;
  osm_id?: string;
  address_components?: any;
}

// Simple in-memory cache for geocoding results
const geocodeCache = new Map<string, GeocodingResult>();

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  // Check cache first
  if (geocodeCache.has(address)) {
    return geocodeCache.get(address) || null;
  }

  try {
    // Use Nominatim API (OpenStreetMap's geocoding service)
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'StuartMainStreet/1.0 (contact@stuartmainstreet.com)'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      console.warn(`No geocoding results found for address: ${address}`);
      return null;
    }

    const result: GeocodingResult = {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      display_name: data[0].display_name,
      osm_type: data[0].osm_type,
      osm_id: data[0].osm_id,
      address_components: data[0].address
    };

    // Cache the result
    geocodeCache.set(address, result);
    
    return result;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Batch geocoding for multiple addresses
export async function batchGeocodeAddresses(addresses: string[]): Promise<(GeocodingResult | null)[]> {
  const geocodingPromises = addresses.map(address => 
    geocodeAddress(address).catch(error => {
      console.warn(`Geocoding failed for address: ${address}`, error);
      return null;
    })
  );

  return await Promise.all(geocodingPromises);
}

// Validate coordinates
export function isValidCoordinates(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

// Get default Stuart, FL coordinates
export function getDefaultStuartCoordinates() {
  return {
    latitude: 27.1973,
    longitude: -80.2528
  };
}