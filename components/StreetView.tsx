
import React, { useEffect, useRef } from 'react';
import { LatLngLiteral } from '../types';

interface StreetViewProps {
  location: LatLngLiteral;
}

const StreetView: React.FC<StreetViewProps> = ({ location }) => {
  const streetViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!streetViewRef.current || !window.google) return;

    const panorama = new window.google.maps.StreetViewPanorama(
      streetViewRef.current,
      {
        position: location,
        pov: { heading: 34, pitch: 10 },
        addressControl: false,
        linksControl: true,
        panControl: true,
        enableCloseButton: false,
        zoomControl: true,
        showRoadLabels: false,
        motionTracking: false,
        motionTrackingControl: false,
      }
    );
    
    // This is a bit of a hack to force the panorama to be visible
    // Sometimes it doesn't render on the first load without a small nudge
    setTimeout(() => {
        window.google.maps.event.trigger(panorama, 'resize');
    }, 100);

  }, [location]);

  return <div ref={streetViewRef} className="w-full h-full" />;
};

export default StreetView;
