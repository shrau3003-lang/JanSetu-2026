import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { Button } from './Button';

// Fix default Leaflet icon paths in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface LocationPickerMapProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  className?: string;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  onChange,
  className = 'h-64'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const defaultLat = 23.3441; // Ranchi, Jharkhand default
  const defaultLng = 85.3096;

  const currentLat = latitude || defaultLat;
  const currentLng = longitude || defaultLng;

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMap.current) {
      const map = L.map(mapRef.current).setView([currentLat, currentLng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      const marker = L.marker([currentLat, currentLng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onChange(e.latlng.lat, e.latlng.lng);
      });

      leafletMap.current = map;
    } else {
      leafletMap.current.setView([currentLat, currentLng]);
      if (markerRef.current) {
        markerRef.current.setLatLng([currentLat, currentLng]);
      }
    }
  }, [currentLat, currentLng, onChange]);

  const handleUseMyLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          onChange(lat, lng);
          if (leafletMap.current) {
            leafletMap.current.setView([lat, lng], 15);
          }
        },
        (error) => {
          console.warn('Geolocation error:', error);
          alert('Could not retrieve your exact current location. Please click directly on the map to set location.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Click Map to Pinpoint Coordinates</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={<Navigation className="w-3.5 h-3.5 text-emerald-600" />}
          onClick={handleUseMyLocation}
          className="text-xs"
        >
          Use My Current Location
        </Button>
      </div>

      <div className={`relative rounded-2xl overflow-hidden border border-slate-300 shadow-inner ${className}`}>
        <div ref={mapRef} className="w-full h-full z-0" />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
        <span>Latitude: {currentLat.toFixed(6)}</span>
        <span>Longitude: {currentLng.toFixed(6)}</span>
      </div>
    </div>
  );
};
