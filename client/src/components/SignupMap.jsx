// src/components/SignupMap.jsx
import React, { useMemo } from "react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";

// Libraries-Array outside of component to prevent re-creation on every render, which would cause the map to reload unnecessarily
const libraries = [];

export default function SignupMap({ x, y, zoom, country }) {
  // useJsApiLoader loads the Google Maps JavaScript API and provides loading state and error handling ONE time
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries
  });

  // Stabilising center and options with useMemo to prevent unnecessary re-renders of the map
  const center = useMemo(() => ({ 
    lat: Number(x) || 20, 
    lng: Number(y) || 0 
  }), [x, y]);

  const mapOptions = useMemo(() => ({
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
  }), []);

  if (loadError) {
    return <small className="text-danger">Fehler beim Laden von Google Maps.</small>;
  }

  if (!isLoaded) {
    return <small className="text-muted">Karte wird geladen…</small>;
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "300px", borderRadius: "0.75rem" }}
      center={center}
      zoom={zoom}
      options={mapOptions}
    >
      <MarkerF position={center} title={country} />
    </GoogleMap>
  );
}