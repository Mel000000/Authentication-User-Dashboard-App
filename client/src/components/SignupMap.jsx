import { useEffect, useRef, useState } from "react";

export default function SignupMap({ apiKey: propApiKey, mapId }) {
  const mapRef = useRef(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const apiKey = propApiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
    if (!apiKey) {
      console.error("Google Maps API key missing. Set VITE_GOOGLE_MAPS_API_KEY or pass `apiKey` prop.");
      setStatus("no-key");
      return;
    }

    if (window.google?.maps) {
      console.log("Google Maps already available");
      setStatus("loaded");
      return;
    }

    // Avoid adding the script multiple times if another component already did
    const existing = document.querySelector('script[data-google-maps-api]');
    if (existing) {
      setStatus("loading");
      const onLoad = () => setStatus(window.google?.maps ? "loaded" : "error");
      existing.addEventListener("load", onLoad);
      existing.addEventListener("error", () => setStatus("error"));
      return () => {
        existing.removeEventListener("load", onLoad);
      };
    }

    setStatus("loading");
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=places`;
    script.async = true;
    script.defer = true;
    script.setAttribute("data-google-maps-api", "true");
    script.onload = () => {
      console.log("Google Maps script loaded");
      setStatus("loaded");
    };
    script.onerror = (e) => {
      console.error("Google Maps failed to load", e);
      setStatus("error");
    };
    document.head.appendChild(script);

    const timeout = setTimeout(() => {
      if (!window.google?.maps) {
        console.error("Google Maps script did not initialise in time");
        setStatus("error");
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [propApiKey]);

  useEffect(() => {
    if (status !== "loaded") return;
    if (!mapRef.current) return;

    try {
      // configure the web component after the Maps API is available
      mapRef.current.center = { lat: 20, lng: 0 };
      mapRef.current.zoom = 1;
      if (mapId) mapRef.current["map-id"] = mapId;
      console.log("Configured gmp-map", mapRef.current);
    } catch (e) {
      console.error("Error configuring gmp-map:", e);
    }
  }, [status, mapId]);

  return (
    <>
      <div style={{ marginBottom: 6 }}>
        {status === "loading" && <small>Loading map…</small>}
        {status === "loaded" && <small>Map ready</small>}
        {status === "no-key" && <small style={{ color: "red" }}>No Google Maps API key</small>}
        {status === "error" && <small style={{ color: "red" }}>Map failed to load — check console</small>}
      </div>
      <gmp-map id="signupMap" ref={mapRef} style={{ width: "100%", height: "300px" }} />
    </>
  );
}
