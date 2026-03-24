import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Ambulance, Clock, User, Phone, Activity } from 'lucide-react';
import { api } from "../../lib/api";

const DEFAULT_AMBULANCES = [
  { id: 1, plate: 'KBZ 123A', status: 'en-route',  location: 'Westlands',   lat: -1.2674, lng: 36.8022, patient: 'Cardiac',   distance: '2.3 km', eta: '5 min',  driver: 'John Kamau',   phone: '+254 712 345 678' },
  { id: 2, plate: 'KCA 456B', status: 'available', location: 'CBD',         lat: -1.2864, lng: 36.8172, patient: '-',         distance: '-',      eta: '-',      driver: 'Peter Otieno', phone: '+254 722 111 222' },
  { id: 3, plate: 'KCB 789C', status: 'at-scene',  location: 'Karen',       lat: -1.3197, lng: 36.7070, patient: 'Trauma',    distance: '8.7 km', eta: '12 min', driver: 'James Waweru', phone: '+254 733 444 555' },
  { id: 4, plate: 'KDA 012D', status: 'returning', location: 'Upper Hill',  lat: -1.2921, lng: 36.8219, patient: 'Completed', distance: '1.2 km', eta: '3 min',  driver: 'David Mutua',  phone: '+254 744 666 777' },
  { id: 5, plate: 'KBE 345E', status: 'available', location: 'Parklands',   lat: -1.2630, lng: 36.8578, patient: '-',         distance: '-',      eta: '-',      driver: 'Samuel Njoro', phone: '+254 755 888 999' },
  { id: 6, plate: 'KCF 678F', status: 'en-route',  location: 'Kilimani',    lat: -1.2884, lng: 36.7829, patient: 'Stroke',    distance: '4.1 km', eta: '8 min',  driver: 'Michael Ouma', phone: '+254 766 111 222' },
];

const statusColor = (s) => ({
  available:  { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-500' },
  'en-route': { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-500' },
  'at-scene': { bg: 'bg-amber-100',  text: 'text-amber-800',  border: 'border-amber-500' },
  returning:  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-500' },
}[s] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-500' });

const statusMarkerColor = (s) => ({
  available:  '#10B981',
  'en-route': '#3B82F6',
  'at-scene': '#F59E0B',
  returning:  '#A855F7',
}[s] || '#6B7280');

const TrackingAlt = () => {
  const [liveAmbulances, setLiveAmbulances] = useState(DEFAULT_AMBULANCES);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const leafletRef = useRef(null);

  const renderMarkers = (list) => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    list.forEach((ambulance) => {
      const color = statusMarkerColor(ambulance.status);
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M8 19a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"/>
            <path d="M10 15h4"/><path d="M12 13v4"/>
          </svg>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([ambulance.lat, ambulance.lng], { icon })
        .addTo(map)
        .bindPopup(`<div style="font-family: Arial;"><strong>${ambulance.plate}</strong><div style="margin-top: 8px; font-size: 12px;"><div><strong>Status:</strong> ${ambulance.status.replace('-', ' ')}</div><div><strong>Location:</strong> ${ambulance.location}</div></div></div>`);

      marker.on('click', () => setSelected(ambulance));
      markersRef.current[ambulance.id] = marker;
    });
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await api.get("/admin/ambulances/live");
        if (!active) return;
        if (Array.isArray(data) && data.length) {
          setLiveAmbulances(data);
        }
      } catch {
        // keep defaults
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');
        leafletRef.current = L;
        
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        if (!mapInstanceRef.current && mapRef.current) {
          const map = L.map(mapRef.current).setView([-1.2864, 36.8172], 12);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19,
          }).addTo(map);
          mapInstanceRef.current = map;

          renderMarkers(liveAmbulances);
        }
      } catch (error) {
        console.error('Map error:', error);
      }
    };
    initMap();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (selected && mapInstanceRef.current && markersRef.current[selected.id]) {
      mapInstanceRef.current.setView([selected.lat, selected.lng], 15);
      markersRef.current[selected.id].openPopup();
    }
  }, [selected]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      renderMarkers(liveAmbulances);
    }
  }, [liveAmbulances]);

  const counts = {
    all: liveAmbulances.length,
    available:  liveAmbulances.filter(a => a.status === 'available').length,
    'en-route': liveAmbulances.filter(a => a.status === 'en-route').length,
    'at-scene': liveAmbulances.filter(a => a.status === 'at-scene').length,
    returning:  liveAmbulances.filter(a => a.status === 'returning').length,
  };

  const filtered = filter === 'all' ? liveAmbulances : liveAmbulances.filter(a => a.status === filter);

  return (
    <div className="space-y-6">
      {/* Fleet Summary Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Fleet Overview</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {counts.all} ambulances</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterButton label="All" count={counts.all} active={filter === 'all'} onClick={() => setFilter('all')} />
            <FilterButton label="Available" count={counts.available} active={filter === 'available'} onClick={() => setFilter('available')} color="green" />
            <FilterButton label="En Route" count={counts['en-route']} active={filter === 'en-route'} onClick={() => setFilter('en-route')} color="blue" />
            <FilterButton label="At Scene" count={counts['at-scene']} active={filter === 'at-scene'} onClick={() => setFilter('at-scene')} color="amber" />
            <FilterButton label="Returning" count={counts.returning} active={filter === 'returning'} onClick={() => setFilter('returning')} color="purple" />
          </div>
        </div>
      </div>

      {/* Ambulance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(a => {
          const colors = statusColor(a.status);
          return (
            <div
              key={a.id}
              onClick={() => setSelected(a)}
              className={`bg-white rounded-xl shadow-md border-2 transition-all cursor-pointer hover:shadow-lg ${
                selected?.id === a.id ? `${colors.border} bg-blue-50` : 'border-gray-200'
              }`}
            >
              <div className={`px-4 py-3 border-b-2 ${colors.border} ${colors.bg}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Ambulance className={`w-5 h-5 ${colors.text}`} />
                    <span className="font-bold font-mono text-gray-900">{a.plate}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                    {a.status.replace('-', ' ')}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{a.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{a.driver}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{a.phone}</span>
                </div>

                {a.patient !== '-' && (
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200">
                    <InfoPill label="Patient" value={a.patient} />
                    <InfoPill label="Distance" value={a.distance} />
                    <InfoPill label="ETA" value={a.eta} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Map */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Live Map View</h3>
                <p className="text-sm text-gray-600">Click ambulance cards above to locate on map</p>
              </div>
            </div>
            {selected && (
              <div className="bg-white px-4 py-2 rounded-lg shadow-md border border-gray-200">
                <p className="text-xs text-gray-500">Viewing</p>
                <p className="font-bold text-gray-900">{selected.plate}</p>
              </div>
            )}
          </div>
        </div>
        <div ref={mapRef} style={{ height: '600px', width: '100%' }} />
      </div>
    </div>
  );
};

const FilterButton = ({ label, count, active, onClick, color = 'gray' }) => {
  const colors = {
    gray:   'bg-gray-100 text-gray-800 hover:bg-gray-200',
    green:  'bg-green-100 text-green-800 hover:bg-green-200',
    blue:   'bg-blue-100 text-blue-800 hover:bg-blue-200',
    amber:  'bg-amber-100 text-amber-800 hover:bg-amber-200',
    purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  };
  
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
        active ? 'ring-2 ring-blue-500 shadow-md scale-105' : ''
      } ${colors[color]}`}
    >
      {label} <span className="font-bold">({count})</span>
    </button>
  );
};

const InfoPill = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-2 text-center">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-xs font-bold text-gray-900 mt-0.5">{value}</p>
  </div>
);

export default TrackingAlt;
