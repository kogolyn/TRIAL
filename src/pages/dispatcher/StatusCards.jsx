import React from 'react';

export default function StatusCards() {
    return (
        <div className="flex gap-5">
            <div className="flex-1 bg-white p-5 rounded-lg shadow-sm border border-gray-200 cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-gray-500 text-[11px] uppercase mb-2.5">PENDING</div>
                <div className="text-2xl font-bold text-orange-500">2</div>
            </div>
            <div className="flex-1 bg-white p-5 rounded-lg shadow-sm border border-gray-200 cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-gray-500 text-[11px] uppercase mb-2.5">ASSIGNED</div>
                <div className="text-2xl font-bold text-blue-600">1</div>
            </div>
            <div className="flex-1 bg-white p-5 rounded-lg shadow-sm border border-gray-200 cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-gray-500 text-[11px] uppercase mb-2.5">EN ROUTE</div>
                <div className="text-2xl font-bold text-green-600">1</div>
            </div>
            <div className="flex-1 bg-white p-5 rounded-lg shadow-sm border border-gray-200 cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-gray-500 text-[11px] uppercase mb-2.5">COMPLETED</div>
                <div className="text-2xl font-bold text-gray-800">8</div>
            </div>
        </div>
    );
}
