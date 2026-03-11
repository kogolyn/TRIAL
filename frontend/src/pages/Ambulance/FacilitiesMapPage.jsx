import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { apiRequest } from "../../config/api";

function FacilitiesMapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [facilities, setFacilities] = useState(location.state?.facilities || []);
  const selectedFacility = location.state?.selectedFacility || null;
  const ambulance = location.state?.ambulance || {
    id: "AMB-04",
    lat: -0.2827,
    lng: 36.08,
  };

  useEffect(() => {
    const loadFacilities = async () => {
      if (facilities.length > 0) return;
      try {
        const data = await apiRequest("/api/facilities/available");
        const mapped = (data || []).map((facility) => ({
          id: facility.id,
          name: facility.name,
          level: facility.type || "Hospital",
          bedsAvailable: Number(facility.bedsAvailable || 0),
          status: Number(facility.bedsAvailable || 0) > 0 ? "available" : "busy",
          lat: Number(facility.latitude),
          lng: Number(facility.longitude),
        }));
        setFacilities(mapped);
      } catch {
        setFacilities([]);
      }
    };
    loadFacilities();
  }, [facilities.length]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([ambulance.lat, ambulance.lng], 12);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [ambulance.lat, ambulance.lng]);

  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    const map = mapRef.current;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    const bounds = [];

    const ambulanceIcon = L.divIcon({
      html: '<div style="width:32px;height:32px;background:#dc2626;border-radius:9999px;color:white;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;">AMB</div>',
      className: "",
      iconSize: [32, 32],
    });

    L.marker([ambulance.lat, ambulance.lng], { icon: ambulanceIcon })
      .addTo(layer)
      .bindPopup(`Ambulance ${ambulance.id}`);
    bounds.push([ambulance.lat, ambulance.lng]);

    facilities.forEach((facility) => {
      if (Number.isNaN(facility.lat) || Number.isNaN(facility.lng)) return;

      const isSelected = selectedFacility?.id === facility.id;
      const color = isSelected ? "#2563eb" : facility.status === "available" ? "#16a34a" : "#ef4444";
      const label = isSelected ? "S" : "H";

      const icon = L.divIcon({
        html: `<div style="width:30px;height:30px;background:${color};border-radius:9999px;color:white;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;">${label}</div>`,
        className: "",
        iconSize: [30, 30],
      });

      L.marker([facility.lat, facility.lng], { icon })
        .addTo(layer)
        .bindPopup(
          `<strong>${facility.name}</strong><br/>Beds available: ${facility.bedsAvailable}<br/>Status: ${facility.status}`,
        );

      bounds.push([facility.lat, facility.lng]);
    });

    if (selectedFacility && Number.isFinite(selectedFacility.lat) && Number.isFinite(selectedFacility.lng)) {
      L.polyline(
        [
          [ambulance.lat, ambulance.lng],
          [selectedFacility.lat, selectedFacility.lng],
        ],
        {
          color: "#2563eb",
          weight: 4,
          opacity: 0.8,
        },
      ).addTo(layer);
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [ambulance.id, ambulance.lat, ambulance.lng, facilities, selectedFacility]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Facilities Map</h1>
            <p className="text-sm text-gray-600">
              Showing hospitals and emergency facilities near your ambulance
            </p>
          </div>
          <button
            onClick={() => navigate("/ambulance")}
            className="px-4 py-2 bg-[#0a1628] text-white rounded-lg hover:bg-[#14223a]"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="rounded-xl overflow-hidden border border-gray-300 bg-white shadow-lg">
          <div ref={mapContainerRef} className="h-[70vh] w-full" />
        </div>
      </div>
    </div>
  );
}

export default FacilitiesMapPage;
