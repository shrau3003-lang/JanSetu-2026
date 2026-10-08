import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ProblemReport, UserRole } from '../../types';
import { Badge } from './Badge';

// Fix default Leaflet icon paths in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface JanSetuMapProps {
  problems: (ProblemReport & { latitude?: number; longitude?: number })[];
  role?: UserRole;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  className?: string;
  onMarkerClick?: (problemId: string) => void;
}

export const JanSetuMap: React.FC<JanSetuMapProps> = ({
  problems,
  role = 'CITIZEN',
  centerLat = 23.3441, // Ranchi, Jharkhand default
  centerLng = 85.3096,
  zoom = 12,
  className = 'h-96 w-full rounded-2xl shadow-sm border border-slate-200',
  onMarkerClick
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMap.current) {
      const map = L.map(mapRef.current).setView([centerLat, centerLng], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      leafletMap.current = map;
      markersLayer.current = L.layerGroup().addTo(map);
    }

    const map = leafletMap.current;
    const layer = markersLayer.current;

    if (layer) {
      layer.clearLayers();

      // Sample mock coordinates around Ranchi/Jharkhand if items lack lat/lng
      const seedCoords = [
        { lat: 23.3441, lng: 85.3096 }, // Main city
        { lat: 23.3600, lng: 85.3300 }, // North
        { lat: 23.3200, lng: 85.2900 }, // South
        { lat: 23.3800, lng: 85.3500 }, // Industrial
        { lat: 23.3100, lng: 85.3200 }, // Ward 12
        { lat: 23.3500, lng: 85.2700 }  // West
      ];

      problems.forEach((item, idx) => {
        const lat = item.latitude || seedCoords[idx % seedCoords.length].lat;
        const lng = item.longitude || seedCoords[idx % seedCoords.length].lng;

        // Custom priority marker colors
        const color = 
          item.priority === 'critical' ? '#e11d48' : // Rose
          item.priority === 'high' ? '#f97316' :     // Orange
          item.priority === 'medium' ? '#3b82f6' :   // Blue
          '#10b981';                                 // Emerald

        const customHtml = `
          <div style="
            background-color: ${color};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: bold;
          ">
            ${idx + 1}
          </div>
        `;

        const icon = L.divIcon({
          html: customHtml,
          className: 'custom-leaflet-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const popupContent = `
          <div style="font-family: inherit; width: 200px; padding: 4px;">
            <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: ${color}; margin-bottom: 2px;">
              ${item.priority.toUpperCase()} PRIORITY • ${item.category}
            </div>
            <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #0f172a;">${item.title}</h4>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">📍 ${item.location}</div>
            <a href="/citizen/problem/${item.id}" style="
              display: inline-block;
              background-color: #2563eb;
              color: white;
              font-size: 11px;
              font-weight: bold;
              padding: 4px 8px;
              border-radius: 6px;
              text-decoration: none;
            ">View Details &rarr;</a>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon })
          .bindPopup(popupContent)
          .addTo(layer);

        if (onMarkerClick) {
          marker.on('click', () => onMarkerClick(item.id));
        }
      });
    }

  }, [problems, role, centerLat, centerLng, zoom, onMarkerClick]);

  return (
    <div className="relative">
      <div ref={mapRef} className={className} />
      
      {/* Map Role Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200/90 shadow-md text-xs space-y-1">
        <span className="font-bold text-slate-900 block text-[10px] uppercase tracking-wider">Priority Legend</span>
        <div className="flex items-center gap-3 text-[11px] font-medium">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Critical</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> High</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Resolved</span>
        </div>
      </div>
    </div>
  );
};
