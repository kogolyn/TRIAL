import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon missing in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function IncidentMap({ center = [-0.3031, 36.08], incidents = [], ambulances = [] }) {
    return (
        <div className="bg-white rounded-lg shadow-sm flex flex-col overflow-hidden border border-gray-200 flex-1 h-full">
            <div className="bg-gray-50 text-gray-800 px-4 py-3 text-sm font-bold uppercase border-b border-gray-200">
                <h3>INCIDENT MAP - NAKURU</h3>
            </div>
            <div className="flex-1 min-h-[200px] relative z-10">
                <MapContainer key={`${center[0]}-${center[1]}`} center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {incidents.map((incident) => (
                        <Marker key={`inc-${incident.recordId || incident.id}`} position={incident.position}>
                            <Popup>
                                <div>
                                    <div className="font-semibold">{incident.id}</div>
                                    <div>{incident.title}</div>
                                    <div>Status: {incident.status}</div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                    {ambulances.map((ambulance) => (
                        <Marker key={`amb-${ambulance.id}`} position={ambulance.position}>
                            <Popup>
                                <div>
                                    <div className="font-semibold">{ambulance.unitCode}</div>
                                    <div>Status: {ambulance.status}</div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
