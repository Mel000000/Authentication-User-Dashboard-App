// src/components/SignupMap.jsx
import React, { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to handle dynamic zooming and panning
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    // .setView smoothly forces Leaflet to update its center and zoom level
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);

  return null;
}

export default function SignupMap({ x, y, zoom, country }) {
  const center = useMemo(() => [Number(x) || 20, Number(y) || 0], [x, y]);
  const safeZoom = Number(zoom) || 4;

  return (
    <div style={{ width: "100%", height: "300px", borderRadius: "0.75rem", overflow: "hidden" }}>
      <MapContainer 
        center={center} 
        zoom={safeZoom} 
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        {/* We place the updater inside the container so it can access the map context */}
        <MapUpdater center={center} zoom={safeZoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} title={country} />
      </MapContainer>
    </div>
  );
}