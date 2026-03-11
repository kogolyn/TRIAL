import React from 'react';

const ITEMS = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'incoming-alerts', label: 'Incoming Alerts' },
    { key: 'active-incidents', label: 'Active Incidents' },
    { key: 'coordination-actions', label: 'Coordination Actions' },
];

export default function Sidebar({ activeSection, onChangeSection }) {
    return (
        <div className="w-[240px] bg-white border-r border-gray-200 flex flex-col pt-5">
            <div className="flex-1">
                {ITEMS.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => onChangeSection?.(item.key)}
                        className={`w-[calc(100%-8px)] text-left px-5 py-3 flex items-center gap-2.5 cursor-pointer m-1 rounded transition-colors ${
                            activeSection === item.key
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                    >
                        <span className="text-sm font-semibold">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}