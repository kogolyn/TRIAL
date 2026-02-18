import React from 'react';

const incidents = [
    { id: 'INC-001', location: 'Kenyatta Avenue, CBD', severity: 'Critical', status: 'Pending' },
    { id: 'INC-002', location: 'Section 58, Near Hyrax', severity: 'Moderate', status: 'Assigned' },
    { id: 'INC-003', location: 'Kaptembwa, West', severity: 'Critical', status: 'En Route' },
    { id: 'INC-004', location: 'Njoro Road, Egerton', severity: 'Minor', status: 'Pending' },
];

export default function ActiveIncidents() {
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
                        {incidents.map((inc) => (
                            <tr key={inc.id} className="cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-100 last:border-0">
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
