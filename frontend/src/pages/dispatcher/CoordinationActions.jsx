import React, { useMemo, useState } from 'react';
import { api } from '../../lib/api';

const STATUS_OPTIONS = [
    { label: 'Assigned', value: 'assigned' },
    { label: 'En Route', value: 'en_route' },
    { label: 'Arrived', value: 'arrived' },
    { label: 'Transporting', value: 'transporting' },
    { label: 'Completed', value: 'completed' },
];

export default function CoordinationActions({
    incidents = [],
    selectedIncident,
    selectedIncidentId,
    onSelectIncident,
    ambulances,
    hospitals,
    onActionComplete,
}) {
    const [selectedAmbulanceId, setSelectedAmbulanceId] = useState('');
    const [selectedHospitalId, setSelectedHospitalId] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('en_route');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const availableAmbulances = useMemo(
        () => ambulances.filter((item) => item.status === 'available' || item.id === selectedIncident?.assignedAmbulance?.id),
        [ambulances, selectedIncident],
    );

    const canAct = Boolean(selectedIncident?.recordId);

    function handleIncidentChange(event) {
        const value = event.target.value || null;
        setError('');
        setMessage('');
        onSelectIncident?.(value);
    }

    async function runAction(fn, successMessage) {
        setSubmitting(true);
        setError('');
        setMessage('');
        try {
            await fn();
            setMessage(successMessage);
            await onActionComplete?.();
        } catch (err) {
            setError(err.message || 'Action failed');
        } finally {
            setSubmitting(false);
        }
    }

    function handleAssignAmbulance() {
        if (!canAct || !selectedAmbulanceId) {
            setError('Select an incident and ambulance first');
            return;
        }

        runAction(
            () => api.post(`/dispatcher/incidents/${selectedIncident.recordId}/assign`, { ambulanceId: selectedAmbulanceId }),
            'Ambulance assigned',
        );
    }

    function handleNotifyHospital() {
        if (!canAct || !selectedHospitalId) {
            setError('Select an incident and hospital first');
            return;
        }

        runAction(
            () => api.post(`/dispatcher/incidents/${selectedIncident.recordId}/notify-hospital`, { hospitalProfileId: selectedHospitalId }),
            'Hospital notified',
        );
    }

    function handleUpdateStatus() {
        if (!canAct || !selectedStatus) {
            setError('Select an incident and status');
            return;
        }

        runAction(
            () => api.patch(`/dispatcher/incidents/${selectedIncident.recordId}/status`, { status: selectedStatus }),
            `Status updated to ${selectedStatus}`,
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm flex flex-col overflow-visible border border-gray-200 pb-5">
            <div className="bg-gray-50 text-gray-800 px-4 py-3 text-sm font-bold uppercase border-b border-gray-200">
                <h3>COORDINATION ACTIONS</h3>
            </div>

            <div className="px-5 pt-4 text-xs text-gray-600">
                {selectedIncident ? (
                    <span>
                        Selected Incident: <strong>{selectedIncident.id}</strong> ({selectedIncident.status})
                    </span>
                ) : (
                    <span>Select an incident from the table to enable actions.</span>
                )}
            </div>

            <div className="px-5 pt-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Select Incident</label>
                <select
                    value={selectedIncidentId || ''}
                    onChange={handleIncidentChange}
                    disabled={submitting || incidents.length === 0}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                    <option value="">-- Select incident --</option>
                    {incidents
                        .filter((inc) => inc.status === 'Pending')
                        .map((inc) => (
                        <option key={inc.recordId} value={inc.recordId}>
                            {inc.id} - {inc.condition || inc.victimReport?.emergencyType || 'Unknown'} - {inc.location || 'No address'} ({inc.status})
                        </option>
                    ))}
                </select>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Assign Ambulance</label>
                    <select
                        value={selectedAmbulanceId}
                        onChange={(e) => setSelectedAmbulanceId(e.target.value)}
                        disabled={!canAct || submitting}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                        <option value="">Select ambulance</option>
                        {availableAmbulances.map((amb) => (
                            <option key={amb.id} value={amb.id}>
                                {amb.unitCode} - {amb.name} ({amb.status})
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleAssignAmbulance}
                        disabled={!canAct || submitting}
                        className="mt-2 w-full bg-blue-600 text-white text-xs font-bold rounded py-2 disabled:opacity-50"
                    >
                        ASSIGN
                    </button>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Notify Hospital</label>
                    <select
                        value={selectedHospitalId}
                        onChange={(e) => setSelectedHospitalId(e.target.value)}
                        disabled={!canAct || submitting}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                        <option value="">Select hospital</option>
                        {hospitals.map((hospital) => (
                            <option key={hospital.id} value={hospital.id}>
                                {hospital.name} ({hospital.availableBeds ?? 0} beds)
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleNotifyHospital}
                        disabled={!canAct || submitting}
                        className="mt-2 w-full bg-green-700 text-white text-xs font-bold rounded py-2 disabled:opacity-50"
                    >
                        NOTIFY
                    </button>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Update Status</label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        disabled={!canAct || submitting}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                        {STATUS_OPTIONS.map((status) => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleUpdateStatus}
                        disabled={!canAct || submitting}
                        className="mt-2 w-full bg-orange-600 text-white text-xs font-bold rounded py-2 disabled:opacity-50"
                    >
                        UPDATE
                    </button>
                </div>
            </div>

            {message && (
                <div className="mx-5 mt-1 rounded border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                    {message}
                </div>
            )}
            {error && (
                <div className="mx-5 mt-1 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {error}
                </div>
            )}
        </div>
    );
}
