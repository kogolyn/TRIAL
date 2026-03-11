import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function NavigationMap({ ambulance, incident, hospital, navigation, currentSpeed }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const resizeObserverRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current).setView([ambulance.lat, ambulance.lng], 13);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const ambulanceIcon = L.divIcon({
      html: '<div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white text-xl shadow-lg border-2 border-white">AMB</div>',
      className: "",
      iconSize: [40, 40],
    });

    L.marker([ambulance.lat, ambulance.lng], { icon: ambulanceIcon })
      .addTo(map)
      .bindPopup(
        `<strong>Ambulance ${ambulance.id}</strong><br>Speed: ${currentSpeed} km/h`,
      );

    if (incident && Number.isFinite(incident.lat) && Number.isFinite(incident.lng)) {
      const incidentIcon = L.divIcon({
        html: '<div class="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg border-2 border-white">INC</div>',
        className: "",
        iconSize: [40, 40],
      });

      L.marker([incident.lat, incident.lng], { icon: incidentIcon })
        .addTo(map)
        .bindPopup("<strong>Incident Location</strong>");
    }

    const hospitalIcon = L.divIcon({
      html: '<div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white text-xl shadow-lg border-2 border-white">H</div>',
      className: "",
      iconSize: [40, 40],
    });

    L.marker([hospital.lat, hospital.lng], { icon: hospitalIcon })
      .addTo(map)
      .bindPopup(`<strong>${hospital.name}</strong>`);

    const routeCoordinates = [[ambulance.lat, ambulance.lng]];
    if (incident && Number.isFinite(incident.lat) && Number.isFinite(incident.lng)) {
      routeCoordinates.push([incident.lat, incident.lng]);
    }
    routeCoordinates.push([hospital.lat, hospital.lng]);

    L.polyline(routeCoordinates, {
      color: "#ef4444",
      weight: 4,
      opacity: 0.7,
      dashArray: "10, 10",
    }).addTo(map);

    map.fitBounds(routeCoordinates, { padding: [50, 50] });

    const handleResize = () => map.invalidateSize();
    map.whenReady(handleResize);
    map.on("load", handleResize);

    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }
    if (mapRef.current && typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(handleResize);
      observer.observe(mapRef.current);
      resizeObserverRef.current = observer;
    }

    window.addEventListener("resize", handleResize);
    const resizeTimer = setTimeout(handleResize, 0);
    const resizeTimer2 = setTimeout(handleResize, 200);
    const resizeTimer3 = setTimeout(handleResize, 1000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
      clearTimeout(resizeTimer2);
      clearTimeout(resizeTimer3);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [
    ambulance.id,
    ambulance.lat,
    ambulance.lng,
    currentSpeed,
    hospital.lat,
    hospital.lng,
    hospital.name,
    incident?.lat,
    incident?.lng,
  ]);

  return (
    <div className="flex-1 flex flex-col bg-card-bg">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 border-b border-blue-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm">
              Go
            </div>
            <div>
              <p className="text-white font-semibold text-lg">{navigation.nextManeuver}</p>
              <p className="text-blue-200 text-sm">in {navigation.distance}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-2xl">{navigation.timeToDestination}</p>
            <p className="text-blue-200 text-xs">to {navigation.destinationName}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <span className="text-blue-200">Distance:</span>
            <span className="text-white font-semibold">{navigation.distanceToDestination}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <span className="text-blue-200">Speed:</span>
            <span className="text-white font-semibold">{currentSpeed} km/h</span>
          </div>
        </div>
      </div>

      <div ref={mapRef} className="flex-1 min-h-[400px] w-full bg-gray-800" />
    </div>
  );
}

export default NavigationMap;
