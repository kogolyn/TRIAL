import React, { useState } from 'react';

const EmergencyList = ({ emergencies, onSelectEmergency }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('all');

  const handleSelectEmergency = (emergency) => {
    setSelectedId(emergency.id);
    onSelectEmergency(emergency);
  };

  const filteredEmergencies = emergencies.filter(emergency => {
    if (filter === 'all') return true;
    return emergency.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="bg-card-bg rounded-lg border border-border-dark p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">🚨 Emergency List</h3>
        <div className="flex gap-2">
          <button className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`} onClick={() => setFilter('all')}>All</button>
          <button className={`px-3 py-1 rounded text-sm ${filter === 'in progress' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`} onClick={() => setFilter('in progress')}>Active</button>
          <button className={`px-3 py-1 rounded text-sm ${filter === 'responding' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`} onClick={() => setFilter('responding')}>Responding</button>
          <button className={`px-3 py-1 rounded text-sm ${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`} onClick={() => setFilter('completed')}>Completed</button>
        </div>
      </div>

      <div>
        {filteredEmergencies.length === 0 ? (
          <div className="text-sm text-gray-400">No emergencies found</div>
        ) : (
          filteredEmergencies.map((emergency) => (
            <div key={emergency.id} onClick={() => handleSelectEmergency(emergency)} className={`p-3 rounded-lg mb-3 border cursor-pointer ${selectedId === emergency.id ? 'bg-slate-800 border-slate-700' : 'bg-card-bg border-border-dark'} hover:shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${emergency.priority === 'CRITICAL' ? 'bg-red-600 text-white' : emergency.priority === 'SEVERE' ? 'bg-orange-500 text-white' : 'bg-yellow-300 text-slate-800'}`}>{emergency.priority}</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${emergency.status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-700 text-slate-300'}`}>{emergency.status}</span>
                  </div>

                  <div className="text-md font-medium text-white">{emergency.type}</div>
                </div>

                <div className="text-sm text-slate-400">{emergency.time}</div>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-3 text-sm text-slate-400">
                <div className="flex items-center gap-2">📍 <span>{emergency.location}</span></div>
                {emergency.assignedUnit ? <div className="flex items-center gap-2">🚑 <span>{emergency.assignedUnit}</span></div> : <div />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmergencyList;