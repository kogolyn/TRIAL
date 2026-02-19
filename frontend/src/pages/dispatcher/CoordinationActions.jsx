import React from 'react';

export default function CoordinationActions() {
    return (
        <div className="bg-white rounded-lg shadow-sm flex flex-col overflow-hidden border border-gray-200 pb-5">
            <div className="bg-gray-50 text-gray-800 px-4 py-3 text-sm font-bold uppercase border-b border-gray-200">
                <h3>COORDINATION ACTIONS</h3>
            </div>
            <div className="p-5 flex gap-5">
                <button className="flex-1 py-4 px-4 border-none text-white font-bold text-xs rounded shadow hover:shadow-md hover:opacity-90 active:translate-y-0 active:shadow-sm transition-all bg-blue-600">ASSIGN AMBULANCE</button>
                <button className="flex-1 py-4 px-4 border-none text-white font-bold text-xs rounded shadow hover:shadow-md hover:opacity-90 active:translate-y-0 active:shadow-sm transition-all bg-green-700">NOTIFY HOSPITAL</button>
                <button className="flex-1 py-4 px-4 border-none text-white font-bold text-xs rounded shadow hover:shadow-md hover:opacity-90 active:translate-y-0 active:shadow-sm transition-all bg-orange-600">UPDATE STATUS</button>
            </div>
        </div>
    );
}
