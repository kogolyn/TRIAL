import React, { useEffect, useRef } from 'react';
import L from "leaflet";
import 'leaflet/dist/leaflet.css';

function NavigationMap({ ambulance, incident, hospital, navigation, currentSpeed }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([ambulance.lat, ambulance.lng], 13);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Ambulance marker
    const ambulanceIcon = L.divIcon({
      html: '<div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white text-xl shadow-lg border-2 border-white">🚑</div>',
      className: '',
      iconSize: [40, 40]
    });

    L.marker([ambulance.lat, ambulance.lng], { icon: ambulanceIcon })
      .addTo(map)
      .bindPopup(`<strong>Ambulance ${ambulance.id}</strong><br>Speed: ${currentSpeed} km/h`);

    // Incident marker
    const incidentIcon = L.divIcon({
      html: '<div class="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg border-2 border-white animate-pulse">⚠️</div>',
      className: '',
      iconSize: [40, 40]
    });

    L.marker([incident.lat, incident.lng], { icon: incidentIcon })
      .addTo(map)
      .bindPopup('<strong>Incident Location</strong>');

    // Hospital marker
    const hospitalIcon = L.divIcon({
      html: '<div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white text-xl shadow-lg border-2 border-white">🏥</div>',
      className: '',
      iconSize: [40, 40]
    });

    L.marker([hospital.lat, hospital.lng], { icon: hospitalIcon })
      .addTo(map)
      .bindPopup(`<strong>${hospital.name}</strong>`);

    // Draw route
    const routeCoordinates = [
      [ambulance.lat, ambulance.lng],
      [incident.lat, incident.lng],
      [hospital.lat, hospital.lng]
    ];

    L.polyline(routeCoordinates, {
      color: '#ef4444',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 10'
    }).addTo(map);

    // Fit bounds
    map.fitBounds(routeCoordinates, { padding: [50, 50] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-card-bg">
      {/* Navigation Info Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 border-b border-blue-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm">
              ➡️
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

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="flex-1 min-h-[400px] w-full bg-gray-800"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}

export default NavigationMap;