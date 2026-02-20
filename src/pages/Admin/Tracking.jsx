import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Ambulance, Navigation, Clock, Activity } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Webpack/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const liveAmbulances = [
  { id: 1, plate: 'KBZ 123A', status: 'en-route',  location: 'Westlands',   lat: -1.2674, lng: 36.8022, patient: 'Cardiac',   distance: '2.3 km', eta: '5 min',  driver: 'John Kamau'   },
  { id: 2, plate: 'KCA 456B', status: 'available', location: 'CBD',         lat: -1.2864, lng: 36.8172, patient: '-',         distance: '-',      eta: '-',      driver: 'Peter Otieno' },
  { id: 3, plate: 'KCB 789C', status: 'at-scene',  location: 'Karen',       lat: -1.3197, lng: 36.7070, patient: 'Trauma',    distance: '8.7 km', eta: '12 min', driver: 'James Waweru' },
  { id: 4, plate: 'KDA 012D', status: 'returning', location: 'Upper Hill',  lat: -1.2921, lng: 36.8219, patient: 'Completed', distance: '1.2 km', eta: '3 min',  driver: 'David Mutua'  },
  { id: 5, plate: 'KBE 345E', status: 'available', location: 'Parklands',   lat: -1.2630, lng: 36.8578, patient: '-',         distance: '-',      eta: '-',      driver: 'Samuel Njoro' },
  { id: 6, plate: 'KCF 678F', status: 'en-route',  location: 'Kilimani',    lat: -1.2884, lng: 36.7829, patient: 'Stroke',    distance: '4.1 km', eta: '8 min',  driver: 'Michael Ouma' },
];

const statusColor = (s) => ({
  available:  'bg-green-100  text-green-800',
  'en-route': 'bg-blue-100   text-blue-800',
  'at-scene': 'bg-amber-100  text-amber-800',
  returning:  'bg-purple-100 text-purple-800',
}[s] || 'bg-gray-100 text-gray-800');

const statusMarkerColor = (s) => ({
  available:  '#10B981',
  'en-route': '#3B82F6',
  'at-scene': '#F59E0B',
  returning:  '#A855F7',
}[s] || '#6B7280');

const Tracking = () => {
  const [selected, setSelected] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    // Initialize map
    if (!mapInstanceRef.current && mapRef.current) {
      const map = L.map(mapRef.current).setView([-1.2864, 36.8172], 12); // Nairobi center

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    // Add/update markers
    if (mapInstanceRef.current) {
      const map = mapInstanceRef.current;

      liveAmbulances.forEach(ambulance => {
        const color = statusMarkerColor(ambulance.status);
        
        // Custom ambulance icon
        const ambulanceIcon = L.divIcon({
          className: 'custom-ambulance-marker',
          html: `
            <div style="
              background-color: ${color};
              width: 36px;
              height: 36px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 19a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"/>
                <path d="M10 15h4"/>
                <path d="M12 13v4"/>
              </svg>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        // Remove old marker if exists
        if (markersRef.current[ambulance.id]) {
          map.removeLayer(markersRef.current[ambulance.id]);
        }

        // Add new marker
        const marker = L.marker([ambulance.lat, ambulance.lng], { icon: ambulanceIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: Arial, sans-serif; min-width: 200px;">
              <strong style="font-size: 14px; color: #1F2937;">${ambulance.plate}</strong>
              <div style="margin-top: 8px; font-size: 12px; color: #6B7280;">
                <div style="margin-bottom: 4px;"><strong>Status:</strong> ${ambulance.status.replace('-', ' ')}</div>
                <div style="margin-bottom: 4px;"><strong>Location:</strong> ${ambulance.location}</div>
                <div style="margin-bottom: 4px;"><strong>Driver:</strong> ${ambulance.driver}</div>
                ${ambulance.patient !== '-' ? `<div style="margin-bottom: 4px;"><strong>Patient:</strong> ${ambulance.patient}</div>` : ''}
                ${ambulance.eta !== '-' ? `<div><strong>ETA:</strong> ${ambulance.eta}</div>` : ''}
              </div>
            </div>
          `);

        marker.on('click', () => {
          setSelected(ambulance);
        });

        markersRef.current[ambulance.id] = marker;
      });
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        Object.values(markersRef.current).forEach(marker => {
          mapInstanceRef.current.removeLayer(marker);
        });
        markersRef.current = {};
      }
    };
  }, []);

  // Pan to selected ambulance
  useEffect(() => {
    if (selected && mapInstanceRef.current) {
      mapInstanceRef.current.setView([selected.lat, selected.lng], 15);
      if (markersRef.current[selected.id]) {
        markersRef.current[selected.id].openPopup();
      }
    }
  }, [selected]);

  const counts = {
    available:  liveAmbulances.filter(a => a.status === 'available').length,
    'en-route': liveAmbulances.filter(a => a.status === 'en-route').length,
    'at-scene': liveAmbulances.filter(a => a.status === 'at-scene').length,
    returning:  liveAmbulances.filter(a => a.status === 'returning').length,
  };

  return (
    <div className="space-y-6">

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatusCard label="Available"  value={counts.available}  color="bg-green-500"  />
        <StatusCard label="En Route"   value={counts['en-route']} color="bg-blue-500"  />
        <StatusCard label="At Scene"   value={counts['at-scene']} color="bg-amber-500" />
        <StatusCard label="Returning"  value={counts.returning}  color="bg-purple-500" />
      </div>

      {/* Map + List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Map */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Live Map</h3>
            <p className="text-sm text-gray-500 mt-1">Real-time ambulance locations</p>
          </div>
          <div 
            ref={mapRef} 
            style={{ height: '500px', width: '100%' }}
            className="leaflet-map"
          />
        </div>

        {/* Ambulance List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Ambulance Fleet</h3>
            <p className="text-sm text-gray-500 mt-1">Click a unit to view on map</p>
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {liveAmbulances.map(a => (
              <div
                key={a.id}
                onClick={() => setSelected(selected?.id === a.id ? null : a)}
                className={`p-4 cursor-pointer transition-colors ${selected?.id === a.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Ambulance className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm font-mono text-gray-900">{a.plate}</p>
                      <p className="text-xs text-gray-500 flex items-center mt-0.5">
                        <MapPin className="w-3 h-3 mr-1" />{a.location}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(a.status)}`}>
                    {a.status.replace('-', ' ')}
                  </span>
                </div>

                {/* Expanded details */}
                {selected?.id === a.id && (
                  <div className="mt-4 ml-11 grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400">Driver</p>
                      <p className="font-semibold text-gray-900 mt-0.5">{a.driver}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400">Patient</p>
                      <p className="font-semibold text-gray-900 mt-0.5">{a.patient}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400">Distance</p>
                      <p className="font-semibold text-gray-900 mt-0.5">{a.distance}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 flex items-center"><Clock className="w-3 h-3 mr-1" />ETA</p>
                      <p className="font-semibold text-gray-900 mt-0.5">{a.eta}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusCard = ({ label, value, color }) => (
  <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
    <div className="flex items-center space-x-3">
      <div className={`${color} w-3 h-3 rounded-full`}></div>
      <p className="text-sm text-gray-600 font-medium">{label}</p>
    </div>
    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
  </div>
);

export default Tracking;
