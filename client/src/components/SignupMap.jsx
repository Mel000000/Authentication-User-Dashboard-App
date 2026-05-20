import { GoogleMap,LoadScript, MarkerF } from "@react-google-maps/api";
import { useEffect, useState } from "react";

export default function SignupMap({ x, y, zoom,country }) {
  const center = { lat: x, lng: y };


  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      loadingElement={<small>Loading map…</small>}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "300px" }}
        center={center}
        zoom={zoom}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
      <MarkerF position={center} title={country} />

      </GoogleMap>
    </LoadScript>
  );
}
