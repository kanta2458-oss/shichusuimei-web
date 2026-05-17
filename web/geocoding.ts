export interface GeocodingResult {
  label: string;
  latitude: number;
  longitude: number;
}

export interface GeocodingProvider {
  searchAddress(query: string): Promise<GeocodingResult[]>;
}

interface GoogleMapsLatLng {
  lat(): number;
  lng(): number;
}

interface GoogleMapsGeocoderResult {
  formatted_address: string;
  geometry: {
    location: GoogleMapsLatLng;
  };
}

interface GoogleMapsGeocoder {
  geocode(
    request: { address: string; region?: string },
    callback: (results: GoogleMapsGeocoderResult[] | null, status: string) => void
  ): void;
}

declare global {
  interface Window {
    google?: {
      maps?: {
        Geocoder: new () => GoogleMapsGeocoder;
      };
    };
  }
}

export class GoogleMapsGeocodingProvider implements GeocodingProvider {
  async searchAddress(query: string): Promise<GeocodingResult[]> {
    const normalized = query.trim();
    if (!normalized) return [];

    const Geocoder = window.google?.maps?.Geocoder;
    if (!Geocoder) {
      throw new Error("Google Maps JavaScript API is not loaded");
    }

    const geocoder = new Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: normalized, region: "JP" }, (results, status) => {
        if (status !== "OK" || !results) {
          reject(new Error(`Geocoding failed: ${status}`));
          return;
        }

        resolve(
          results.map((result) => ({
            label: result.formatted_address,
            latitude: result.geometry.location.lat(),
            longitude: result.geometry.location.lng()
          }))
        );
      });
    });
  }
}

export function googleMapsScriptUrl(apiKey: string): string {
  const params = new URLSearchParams({
    key: apiKey,
    libraries: "places",
    language: "ja",
    region: "JP"
  });
  return `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
}
