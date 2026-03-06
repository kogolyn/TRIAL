import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '../../components/dispatcher/Layout';
import ActiveIncidents from '../../pages/dispatcher/ActiveIncidents';
import IncidentMap from '../../components/dispatcher/IncidentMap';
import CoordinationActions from '../../pages/dispatcher/CoordinationActions';
import StatusCards from '../../pages/dispatcher/StatusCards';
import IncomingAlertDetails from './IncomingAlertDetails';
import { api } from '../../lib/api';
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dispatcher() {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [incidents, setIncidents] = useState([]);
    const [mapData, setMapData] = useState({ center: [-0.3031, 36.08], incidents: [], ambulances: [], hospitals: [] });
    const [stats, setStats] = useState(null);
    const [ambulances, setAmbulances] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [selectedIncidentId, setSelectedIncidentId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const selectedIncident = useMemo(
        () => incidents.find((item) => item.recordId === selectedIncidentId) || null,
        [incidents, selectedIncidentId],
    );

    const refreshData = useCallback(async () => {
        try {
            const [incRes, mapRes, statsRes, ambRes, hospRes] = await Promise.all([
                api.get('/dispatcher/incidents?active=true&limit=50'),
                api.get('/dispatcher/map'),
                api.get('/dispatcher/stats'),
                api.get('/dispatcher/ambulances'),
                api.get('/dispatcher/hospitals'),
            ]);

            setIncidents(incRes.incidents || []);
            setMapData({
                center: mapRes.center || [-0.3031, 36.08],
                incidents: mapRes.incidents || [],
                ambulances: mapRes.ambulances || [],
                hospitals: mapRes.hospitals || [],
            });
            setStats(statsRes.incidents || null);
            setAmbulances(ambRes.ambulances || []);
            setHospitals(hospRes.hospitals || []);

            setSelectedIncidentId((prev) => {
                if (prev && (incRes.incidents || []).some((item) => item.recordId === prev)) return prev;
                return (incRes.incidents || [])[0]?.recordId || null;
            });

            setError('');
        } catch (err) {
            setError(err.message || 'Failed to load dispatcher data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    useEffect(() => {
        const timer = setInterval(refreshData, 15000);
        return () => clearInterval(timer);
    }, [refreshData]);

    useEffect(() => {
        const socket = io(API_BASE_URL, { transports: ['websocket'] });
        socket.emit('dispatcher:join', { role: 'dispatcher' });

        const events = [
            'dispatcher:emergency:new',
            'dispatcher:emergency:status',
            'dispatcher:emergency:priority',
            'dispatcher:dashboard:update',
            'dispatcher:ambulance:location',
            'dispatcher:hospital:notified',
            'dispatcher:hospital:assigned',
        ];

        events.forEach((eventName) => {
            socket.on(eventName, refreshData);
        });

        return () => {
            events.forEach((eventName) => socket.off(eventName, refreshData));
            socket.disconnect();
        };
    }, [refreshData]);

    function renderSection() {
        // 1. INCOMING ALERTS - Only show new/pending alerts
       if (activeSection === 'incoming-alerts') {
    return (
        <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold text-gray-800">Incoming Alerts</h2>
            
            {/* Incoming alerts selector */}
            <div className="bg-white rounded-lg shadow p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Incoming Alert:
                </label>
                <select
                    value={selectedIncidentId || ''}
                    onChange={(e) => setSelectedIncidentId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">-- Select Alert --</option>
                    {incidents
                        .filter(inc => inc.status === 'pending' || inc.status === 'verified')
                        .map(inc => (
                            <option key={inc.recordId} value={inc.recordId}>
                                {inc.recordId} - {inc.patientInfo?.condition || 'Unknown'} - {inc.location?.address || 'No address'} ({inc.status})
                            </option>
                        ))
                    }
                </select>
            </div>

            {/* Selected alert details from victim */}
            {selectedIncident ? (
                <IncomingAlertDetails selectedIncident={selectedIncident} />
            ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <p className="text-blue-800 font-semibold">
                        Please select an incoming alert from the dropdown above to view details.
                    </p>
                </div>
            )}
        </div>
    );

        }

        // 2. ACTIVE INCIDENTS - Show map + ongoing incidents
       if (activeSection === 'active-incidents') {
    return (
        <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold text-gray-800">Active Incidents</h2>
            
            {/* Map and incident list side by side */}
            <div className="flex gap-5 h-[calc(100vh-180px)]">
                {/* Left side - Incident list */}
                <div className="w-1/3">
                    <div className="bg-white rounded-lg shadow h-full overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">
                                Ongoing Incidents ({incidents.filter(inc => 
                                    inc.status === 'assigned' || 
                                    inc.status === 'en_route' || 
                                    inc.status === 'arrived' ||
                                    inc.status === 'transporting'
                                ).length})
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <ActiveIncidents
                                incidents={incidents.filter(inc => 
                                    inc.status === 'assigned' || 
                                    inc.status === 'en_route' || 
                                    inc.status === 'arrived' ||
                                    inc.status === 'transporting'
                                )}
                                selectedIncidentId={selectedIncidentId}
                                onSelectIncident={setSelectedIncidentId}
                                loading={loading}
                            />
                        </div>
                    </div>
                </div>

                {/* Right side - Map */}
                <div className="flex-1">
                    <div className="bg-white rounded-lg shadow h-full overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">Live Map View</h3>
                        </div>
                        <div className="h-[calc(100%-60px)]">
                            <IncidentMap
                                center={mapData.center}
                                incidents={mapData.incidents}
                                ambulances={mapData.ambulances}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
        // 3. COORDINATION ACTIONS - Only assignment/coordination tools
if (activeSection === 'coordination-actions') {
    return (
        <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold text-gray-800">Coordination Actions</h2>
            
            {/* Coordination tools directly */}
            {selectedIncident ? (
                <CoordinationActions
                    selectedIncident={selectedIncident}
                    ambulances={ambulances}
                    hospitals={hospitals}
                    onActionComplete={refreshData}
                />
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <p className="text-yellow-800 font-semibold">
                        Please select an emergency from Active Incidents or Incoming Alerts to coordinate.
                    </p>
                </div>
            )}
        </div>
    );
}

        // 4. DASHBOARD - Overview with summary cards
return (
    <div className="flex flex-col gap-5">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        
        {/* Statistics at top */}
        <StatusCards stats={stats} loading={loading} />

        {/* Full-width Map */}
        <div className="h-[calc(100vh-300px)]">
            <IncidentMap
                center={mapData.center}
                incidents={mapData.incidents}
                ambulances={mapData.ambulances}
            />
        </div>
    </div>
);
    }

    return (
        <Layout activeSection={activeSection} onChangeSection={setActiveSection}>
            <div className="flex flex-col gap-5">
                {error && (
                    <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}
                {renderSection()}
            </div>
        </Layout>
    );
}