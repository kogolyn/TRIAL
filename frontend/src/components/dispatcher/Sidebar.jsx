import React from 'react';

export default function Sidebar() {
    return (
        <div className="w-[220px] bg-white border-r border-gray-200 flex flex-col pt-5">
            <div className="flex-1">
                <div className="px-5 py-3 flex items-center gap-2.5 cursor-pointer bg-blue-600 text-white m-1 rounded">
                    <span className="w-5 text-center">☐</span> Dashboard
                </div>
                <div className="px-5 py-3 flex items-center gap-2.5 cursor-pointer text-gray-500 hover:bg-blue-50 hover:text-blue-600 m-1 rounded transition-colors">
                    <span className="w-5 text-center">ⓘ</span> Incidents
                </div>
                <div className="px-5 py-3 flex items-center gap-2.5 cursor-pointer text-gray-500 hover:bg-blue-50 hover:text-blue-600 m-1 rounded transition-colors">
                    <span className="w-5 text-center">🏥</span> Hospitals
                </div>
                <div className="px-5 py-3 flex items-center gap-2.5 cursor-pointer text-gray-500 hover:bg-blue-50 hover:text-blue-600 m-1 rounded transition-colors">
                    <span className="w-5 text-center">🚑</span> Ambulances
                </div>
                <div className="px-5 py-3 flex items-center gap-2.5 cursor-pointer text-gray-500 hover:bg-blue-50 hover:text-blue-600 m-1 rounded transition-colors">
                    <span className="w-5 text-center">📄</span> Reports
                </div>
            </div>
            <div className="mt-auto mb-5">
                <div className="px-5 py-3 flex items-center gap-2.5 cursor-pointer text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 m-1 rounded transition-colors">
                    <span className="w-5 text-center">↪</span> Logout
                </div>
            </div>
        </div>
    );
}
