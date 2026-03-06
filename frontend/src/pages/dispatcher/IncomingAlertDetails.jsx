import React from 'react';

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleString();
}

export default function IncomingAlertDetails({ selectedIncident }) {
    if (!selectedIncident) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-bold uppercase text-gray-800 mb-3">Incoming Alert Details</h3>
                <p className="text-sm text-gray-500">Select an incident from the active list to view full emergency details.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold uppercase text-gray-800 mb-3">Incoming Alert Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><span className="font-semibold text-gray-700">Reference:</span> {selectedIncident.id}</div>
                <div><span className="font-semibold text-gray-700">Status:</span> {selectedIncident.status}</div>
                <div><span className="font-semibold text-gray-700">Emergency Type:</span> {selectedIncident.condition || '-'}</div>
                <div><span className="font-semibold text-gray-700">Priority:</span> {selectedIncident.priority || '-'}</div>
                <div><span className="font-semibold text-gray-700">Severity:</span> {selectedIncident.severity}</div>
                <div><span className="font-semibold text-gray-700">Reported At:</span> {formatDate(selectedIncident.createdAt)}</div>
                <div><span className="font-semibold text-gray-700">Reporter:</span> {selectedIncident.reporterName || '-'}</div>
                <div><span className="font-semibold text-gray-700">Phone:</span> {selectedIncident.reporterPhone || '-'}</div>
                <div className="md:col-span-2"><span className="font-semibold text-gray-700">Location:</span> {selectedIncident.location || '-'}</div>
                <div className="md:col-span-2"><span className="font-semibold text-gray-700">Description:</span> {selectedIncident.description || '-'}</div>
            </div>
        </div>
    );
}
