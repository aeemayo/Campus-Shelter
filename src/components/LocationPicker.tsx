/**
 * Interactive map picker using Leaflet + OpenStreetMap (no API key required).
 * Lets the user click to place a pin, returning lat/lng coordinates.
 */
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FUTA_CENTER, FUTA_GATES } from "@/lib/futa-gates";
import { MapPin } from "lucide-react";

// Fix default marker icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LocationPickerProps {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
}

const GATE_ICON = L.divIcon({
  className: "",
  html: `<div style="background:#6366f1;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:11px;font-weight:bold;">G</div>`,
  iconAnchor: [14, 14],
});

const PROPERTY_ICON = L.divIcon({
  className: "",
  html: `<div style="background:#f43f5e;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);">📍</div>`,
  iconAnchor: [16, 16],
});

export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: lat && lng ? [lat, lng] : FUTA_CENTER,
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Add FUTA gate markers
    FUTA_GATES.forEach((gate) => {
      L.marker([gate.lat, gate.lng], { icon: GATE_ICON, interactive: false })
        .addTo(map)
        .bindTooltip(gate.name, { permanent: false, direction: "top" });
    });

    // If we already have coordinates, place the property marker
    if (lat && lng) {
      markerRef.current = L.marker([lat, lng], { icon: PROPERTY_ICON }).addTo(map);
    }

    // Click to place / move marker
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([clickLat, clickLng]);
      } else {
        markerRef.current = L.marker([clickLat, clickLng], {
          icon: PROPERTY_ICON,
        }).addTo(map);
      }
      onChange(
        Math.round(clickLat * 1e6) / 1e6,
        Math.round(clickLng * 1e6) / 1e6
      );
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync external lat/lng changes (e.g. edit mode load)
  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: PROPERTY_ICON }).addTo(
        mapRef.current
      );
    }
    mapRef.current.setView([lat, lng], mapRef.current.getZoom());
  }, [lat, lng]);

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="h-64 rounded-xl overflow-hidden border border-border/60 ring-0 focus-within:ring-2 focus-within:ring-primary"
        style={{ zIndex: 0 }}
      />
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-4 rounded-full bg-primary/80 text-[9px] text-white flex items-center justify-center font-bold">G</span>
          FUTA Gates
        </span>
        <span className="flex items-center gap-1">📍 Property location (click map to set)</span>
        {lat && lng && (
          <span className="ml-auto font-mono text-[10px] text-muted-foreground/70">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </span>
        )}
      </div>
    </div>
  );
}
