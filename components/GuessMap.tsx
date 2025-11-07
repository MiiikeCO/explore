
import React, { useEffect, useRef, useState } from 'react';
import { GameState, LatLngLiteral } from '../types';

interface GuessMapProps {
  onGuess: (location: LatLngLiteral) => void;
  gameState: GameState;
  actualLocation: LatLngLiteral | null;
  guessLocation: LatLngLiteral | null;
}

const GuessMap: React.FC<GuessMapProps> = ({ onGuess, gameState, actualLocation, guessLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  // Fix: Use `any` for Google Maps type as full type definitions are not available. This resolves the "Cannot find namespace 'google'" error.
  const mapInstance = useRef<any | null>(null);
  // Fix: Use `any` for Google Maps type as full type definitions are not available. This resolves the "Cannot find namespace 'google'" error.
  const guessMarker = useRef<any | null>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 20, lng: 0 },
      zoom: 2,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: 'greedy', // Allow scroll wheel zoom
      // Removed the dark theme styles to use the default bright roadmap
    });

    // Fix: Use `any` for the event parameter type as full type definitions are not available. This resolves the "Cannot find namespace 'google'" error.
    const clickListener = mapInstance.current.addListener('click', (e: any) => {
      if (gameState !== GameState.GUESSING || !e.latLng) return;
      
      if (!guessMarker.current) {
        guessMarker.current = new window.google.maps.Marker({
          position: e.latLng,
          map: mapInstance.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2,
          }
        });
      } else {
        guessMarker.current.setPosition(e.latLng);
      }
      setCanSubmit(true);
    });

    return () => {
      window.google.maps.event.removeListener(clickListener);
    };
  }, [gameState]);

  // Handle result display
  useEffect(() => {
    if (gameState === GameState.RESULT && actualLocation && guessLocation && mapInstance.current) {
        if(guessMarker.current) {
            guessMarker.current.setMap(null);
        }

      const guessM = new window.google.maps.Marker({
        position: guessLocation,
        map: mapInstance.current,
        label: { text: '🤔', fontSize: '24px' },
        icon: {
            url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='%234285F4' stroke='%23ffffff' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' class='feather feather-map-pin'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'%3E%3C/path%3E%3Ccircle cx='12' cy='10' r='3'%3E%3C/circle%3E%3C/svg%3E",
            scaledSize: new window.google.maps.Size(48, 48),
            anchor: new window.google.maps.Point(24, 48),
            labelOrigin: new window.google.maps.Point(24, 18)
        }
      });

      const actualM = new window.google.maps.Marker({
        position: actualLocation,
        map: mapInstance.current,
        label: { text: '📍', fontSize: '24px' },
         icon: {
            url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='%2334A853' stroke='%23ffffff' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' class='feather feather-map-pin'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'%3E%3C/path%3E%3Ccircle cx='12' cy='10' r='3'%3E%3C/circle%3E%3C/svg%3E",
            scaledSize: new window.google.maps.Size(48, 48),
            anchor: new window.google.maps.Point(24, 48),
            labelOrigin: new window.google.maps.Point(24, 18)
        }
      });
      
      new window.google.maps.Polyline({
        path: [guessLocation, actualLocation],
        geodesic: true,
        strokeColor: '#FDB813',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: mapInstance.current,
      });

      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(guessLocation);
      bounds.extend(actualLocation);
      mapInstance.current.fitBounds(bounds, 100);
    }
  }, [gameState, actualLocation, guessLocation]);
  
  const handleSubmit = () => {
    if (guessMarker.current) {
        const pos = guessMarker.current.getPosition();
        if(pos) {
            onGuess({ lat: pos.lat(), lng: pos.lng() });
        }
    }
  }

  return (
    <div className="absolute inset-x-0 bottom-0 md:inset-0 flex flex-col items-center justify-center p-4 md:p-8 z-10">
      <div className="w-full max-w-4xl h-[50vh] md:h-full md:max-h-[80vh] bg-gray-200 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        <div ref={mapRef} className="w-full h-full" />
        {gameState === GameState.GUESSING && (
          <button 
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-4 text-lg font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            Confirm Guess
          </button>
        )}
      </div>
    </div>
  );
};

export default GuessMap;