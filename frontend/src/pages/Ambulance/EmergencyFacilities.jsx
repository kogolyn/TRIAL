import React from 'react';

function EmergencyFacilities({ facilities }) {
  return (
    <div className="rounded-xl border border-[#2a3142] overflow-hidden shadow-lg bg-[#111827]">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#2a3142] flex justify-between items-center bg-[#1a1f2e]">
        <h3 className="text-base font-semibold text-blue-400">🏥 Emergency Facilities</h3>
        <button className="text-gray-400 hover:text-white transition-colors text-xl">⛶</button>
      </div>

      {/* Facilities List */}
      <div className="p-4 space-y-3 bg-[#111827]">
        {facilities.map((facility) => (
          <div
            key={facility.id}
            className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg cursor-pointer ${
              facility.status === 'available'
                ? 'bg-green-900/20 border-green-600 hover:bg-green-900/30'
                : 'bg-red-900/20 border-red-600 hover:bg-red-900/30'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="text-white font-semibold text-base mb-1">
                  {facility.name}
                </h4>
                <p className="text-gray-400 text-xs">{facility.level}</p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  facility.status === 'available'
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'
                }`}
              >
                {facility.status === 'available' ? '✓ Available' : '⚠ Busy'}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-[#2a3142]">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛏️</span>
                <span className="text-gray-300">{facility.beds}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏱️</span>
                <span
                  className={`font-semibold ${
                    parseInt(facility.wait) < 20
                      ? 'text-green-400'
                      : 'text-yellow-400'
                  }`}
                >
                  {facility.wait} wait
                </span>
              </div>
            </div>

            <button
              className={`w-full mt-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                facility.status === 'available'
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
              disabled={facility.status !== 'available'}
            >
              {facility.status === 'available' ? 'Select Facility' : 'Currently Full'}
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-[#1a1f2e] border-t border-[#2a3142]">
        <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
          <span>📍</span>
          <span>View All Facilities on Map</span>
        </button>
      </div>
    </div>
  );
}

export default EmergencyFacilities;