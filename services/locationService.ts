
import { LatLngLiteral } from '../types';

// Broad boundaries covering most populated land areas
const BOUNDARIES = {
  minLat: -60,
  maxLat: 70,
  minLng: -180,
  maxLng: 180,
};

const MAX_ATTEMPTS = 20;

export const findRandomStreetViewLocation = (): Promise<LatLngLiteral> => {
  return new Promise((resolve, reject) => {
    const streetViewService = new window.google.maps.StreetViewService();

    const find = (attempt: number) => {
      if (attempt > MAX_ATTEMPTS) {
        reject(new Error(`Failed to find a Street View location after ${MAX_ATTEMPTS} attempts.`));
        return;
      }

      const lat = Math.random() * (BOUNDARIES.maxLat - BOUNDARIES.minLat) + BOUNDARIES.minLat;
      const lng = Math.random() * (BOUNDARIES.maxLng - BOUNDARIES.minLng) + BOUNDARIES.minLng;
      const randomLatLng = new window.google.maps.LatLng(lat, lng);

      const request = {
        location: randomLatLng,
        radius: 50000, // 50km radius to increase chances of finding a panorama
        source: window.google.maps.StreetViewSource.OUTDOOR,
        preference: window.google.maps.StreetViewPreference.BEST,
      };

      streetViewService.getPanorama(request, (data, status) => {
        if (status === window.google.maps.StreetViewStatus.OK && data?.location?.latLng) {
          resolve({
            lat: data.location.latLng.lat(),
            lng: data.location.latLng.lng(),
          });
        } else {
          // Try again
          setTimeout(() => find(attempt + 1), 50);
        }
      });
    };

    find(1);
  });
};
