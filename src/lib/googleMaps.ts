import { Loader, LoaderOptions } from "@googlemaps/js-api-loader";

declare global {
  interface Window {
    initGoogleMaps?: () => void;
    [key: string]: unknown;
  }

  // Types for google.maps are provided by @types/google.maps
}

/**
 * Options for loading the Google Maps JavaScript API.
 */
export interface GoogleMapsLoaderOptions extends LoaderOptions {
  /**
   * Called when the API has loaded successfully.
   */
  onLoad?: () => void;

  /**
   * Called if the API fails to load.
   * @param error - Error event or exception
   */
  onError?: (error: ErrorEvent | Error) => void;
}

/**
 * Dynamically loads the Google Maps JavaScript API using @googlemaps/js-api-loader.
 * If the API is already present on window.google.maps, invokes onLoad immediately.
 *
 * @param options - Loader configuration options.
 */
export function loadGoogleMapsScript(options: GoogleMapsLoaderOptions): void {
  const { apiKey, libraries, version, onLoad, onError, ...rest } = options;

  // Already loaded?
  if (typeof window.google === "object" && window.google.maps) {
    onLoad?.();
    return;
  }

  const loader = new Loader({
    apiKey,
    libraries,
    version,
    ...rest,
  });

  loader
    .load()
    .then(() => {
      onLoad?.();
    })
    .catch((err) => {
      console.error("Failed to load Google Maps API:", err);
      onError?.(err);
    });
}

/**
 * Generates a Google Maps search URL for a given place ID.
 *
 * @param placeId - Google Maps Place ID
 * @returns A fully-formed Google Maps URL
 */
export function generateMapLink(placeId: string): string {
  const params = new URLSearchParams({
    api: "1",
    query_place_id: placeId,
  });
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

/**
 * Ensures the global `google` namespace exists to satisfy TypeScript checks
 * even before the API is loaded.
 */
export function initGoogleMapsTypes(): void {
  if (typeof window.google !== "object") {
    (window as unknown as { google: { maps: unknown } }).google = { maps: {} };
  }
}
