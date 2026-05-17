import { googleMapsScriptUrl } from "./geocoding.js";

export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (!apiKey) return Promise.resolve();
  if (typeof window !== "undefined" && window.google?.maps?.Geocoder) return Promise.resolve();

  const existing = document.querySelector('script[data-google-maps="true"]');
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Maps script failed to load")), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = googleMapsScriptUrl(apiKey);
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = "true";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Google Maps script failed to load")), { once: true });
    document.head.appendChild(script);
  });
}
