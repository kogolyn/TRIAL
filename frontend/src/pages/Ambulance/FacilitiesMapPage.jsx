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

  const [facilities, setFacilities] = useState(location.state?.facilities || []);
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
          beds: `${facility.bedsAvailable || 0} beds avail.`,
          wait: "Live",
          status: facility.bedsAvailable > 0 ? "available" : "busy",
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

    const ambulanceIcon = L.divIcon({
      html: '<div style="width:32px;height:32px;background:#dc2626;border-radius:9999px;color:white;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;">A</div>',
      className: "",
      iconSize: [32, 32],
    });

    L.marker([ambulance.lat, ambulance.lng], { icon: ambulanceIcon })
      .addTo(map)
      .bindPopup(`Ambulance ${ambulance.id}`);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [ambulance.id, ambulance.lat, ambulance.lng]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    facilities.forEach((facility) => {
      if (Number.isNaN(facility.lat) || Number.isNaN(facility.lng)) return;
      const color = facility.status === "available" ? "#16a34a" : "#ef4444";
      const icon = L.divIcon({
        html: `<div style="width:28px;height:28px;background:${color};border-radius:9999px;color:white;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;">H</div>`,
        className: "",
        iconSize: [28, 28],
      });

      L.marker([facility.lat, facility.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<strong>${facility.name}</strong><br/>${facility.beds}<br/>Status: ${facility.status}`,
        );
    });
  }, [facilities]);

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
