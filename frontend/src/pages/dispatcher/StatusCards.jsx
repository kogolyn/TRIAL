import React from 'react';

export default function StatusCards({ stats, loading }) {
    const cards = [
        { label: 'PENDING', value: stats?.pending ?? 0, color: 'text-orange-500' },
        { label: 'ASSIGNED', value: stats?.assigned ?? 0, color: 'text-blue-600' },
        { label: 'EN ROUTE', value: stats?.en_route ?? 0, color: 'text-green-600' },
        { label: 'COMPLETED', value: stats?.completed ?? 0, color: 'text-gray-800' },
    ];

    return (
        <div className="flex gap-5">
            {cards.map((card) => (
                <div key={card.label} className="flex-1 bg-white p-5 rounded-lg shadow-sm border border-gray-200 cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-md">
                    <div className="text-gray-500 text-[11px] uppercase mb-2.5">{card.label}</div>
                    <div className={`text-2xl font-bold ${card.color}`}>{loading ? '...' : card.value}</div>
                </div>
            ))}
        </div>
    );
}
