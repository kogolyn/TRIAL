import React, { useEffect, useState } from 'react';
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

// Nakuru Coordinates
const NAKURU_CENTER = [-0.3031, 36.0800];

const incidents = [
    { id: 'INC-001', position: [-0.2831, 36.0600], title: 'Kenyatta Avenue, CBD - Critical' },
    { id: 'INC-002', position: [-0.2950, 36.1000], title: 'Section 58 - Moderate' },
    { id: 'INC-003', position: [-0.3100, 36.0500], title: 'Kaptembwa - Critical' },
    { id: 'INC-004', position: [-0.3400, 36.0100], title: 'Njoro Road - Minor' },
];

export default function IncidentMap() {
    return (
        <div className="bg-white rounded-lg shadow-sm flex flex-col overflow-hidden border border-gray-200 flex-1 h-full">
            <div className="bg-gray-50 text-gray-800 px-4 py-3 text-sm font-bold uppercase border-b border-gray-200">
                <h3>INCIDENT MAP - NAKURU</h3>
            </div>
            <div className="flex-1 min-h-[200px] relative z-10">
                <MapContainer center={NAKURU_CENTER} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {incidents.map((incident) => (
                        <Marker key={incident.id} position={incident.position}>
                            <Popup>
                                {incident.title}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
