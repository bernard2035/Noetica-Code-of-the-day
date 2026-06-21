"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin } from "lucide-react";

if (typeof window !== "undefined") {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";
}

interface EstateMapProps {
  lat: number;
  lng: number;
  title?: string;
}

export default function EstateMap({ lat, lng, title = "Estate Location" }: EstateMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapContainer.current && !map.current && typeof window !== "undefined") {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [lng, lat], 
        zoom: 14,
        pitch: 45,
      });

      new mapboxgl.Marker({ color: "#3b82f6" })
        .setLngLat([lng, lat])
        .addTo(map.current);

      map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [lat, lng]);

  return (
    <div className="glass-panel p-6 rounded-lg border border-slate-200 h-[400px] flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -z-10 blur-2xl"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-lg font-semibold flex items-center text-slate-800">
          <MapPin className="w-5 h-5 mr-2 text-lime-600" /> {title}
        </h3>
        <span className="text-xs font-medium px-2.5 py-1 bg-lime-100 text-lime-700 rounded-md">
          Live View
        </span>
      </div>

      <div className="flex-1 w-full rounded-xl overflow-hidden relative shadow-inner bg-slate-800">
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
}
