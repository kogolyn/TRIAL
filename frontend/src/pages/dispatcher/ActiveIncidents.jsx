import React from 'react';

export default function ActiveIncidents({ incidents, selectedIncidentId, onSelectIncident, loading }) {
    return (
        <div className="bg-white rounded-lg shadow-sm flex flex-col overflow-hidden border border-gray-200 flex-1">
            <div className="bg-gray-50 text-gray-800 px-4 py-3 text-sm font-bold uppercase border-b border-gray-200">
                <h3>ACTIVE INCIDENTS</h3>
            </div>
            <div className="p-4 flex-1 overflow-auto">
                <table className="w-full border-collapse text-[13px]">
                    <thead>
                        <tr>
                            <th className="text-left text-gray-500 font-bold pb-2.5 text-[11px]">ID</th>
                            <th className="text-left text-gray-500 font-bold pb-2.5 text-[11px]">LOCATION</th>
                            <th className="text-left text-gray-500 font-bold pb-2.5 text-[11px]">SEVERITY</th>
                            <th className="text-left text-gray-500 font-bold pb-2.5 text-[11px]">STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td className="py-3 text-gray-500" colSpan={4}>Loading incidents...</td>
                            </tr>
                        )}
                        {!loading && incidents.length === 0 && (
                            <tr>
                                <td className="py-3 text-gray-500" colSpan={4}>No active incidents</td>
                            </tr>
                        )}
                        {!loading && incidents.map((inc) => (
                            <tr
                                key={inc.recordId}
                                onClick={() => onSelectIncident?.(inc.recordId)}
                                className={`cursor-pointer transition-colors border-b border-gray-100 last:border-0 ${
                                    selectedIncidentId === inc.recordId ? 'bg-blue-50' : 'hover:bg-gray-50'
                                }`}
                            >
                                <td className="py-3 text-blue-600">{inc.id}</td>
                                <td className="py-3">{inc.location}</td>
                                <td className={`py-3 font-bold ${inc.severity === 'Critical' ? 'text-red-600' :
                                        inc.severity === 'Moderate' ? 'text-orange-500' :
                                            'text-yellow-500'
                                    }`}>{inc.severity}</td>
                                <td className={`py-3 ${inc.status === 'Pending' ? 'text-gray-500' :
                                        inc.status === 'Assigned' ? 'text-blue-600' :
                                            'text-green-600'
                                    }`}>{inc.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
