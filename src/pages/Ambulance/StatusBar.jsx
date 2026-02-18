import React from 'react';

const StatusBar = ({ activeEmergencies, availableUnits, avgResponseTime, emergenciesToday }) => {
  return (
    <div className="bg-white shadow-sm py-3">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🚨</div>
          <div>
            <div className="text-xs text-slate-500">Active Emergencies</div>
            <div className="font-bold text-lg">{activeEmergencies}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-2xl">🚑</div>
          <div>
            <div className="text-xs text-slate-500">Available Units</div>
            <div className="font-bold text-lg">{availableUnits}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-2xl">⏱️</div>
          <div>
            <div className="text-xs text-slate-500">Avg Response Time</div>
            <div className="font-bold text-lg">{avgResponseTime}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-2xl">📊</div>
          <div>
            <div className="text-xs text-slate-500">Emergencies Today</div>
            <div className="font-bold text-lg">{emergenciesToday}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;