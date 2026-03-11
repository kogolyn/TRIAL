import React from "react";

function EmergencyFacilities({
  facilities,
  requiredBeds = 1,
  selectedFacilityId,
  onSelectFacility,
  onViewAllMap,
  onRefreshFacilities,
}) {
  const availableFacilities = facilities.filter((facility) => facility.canAccept);
  const sortedFacilities = [...facilities].sort((a, b) => {
    const aAvailable = a.canAccept ? 1 : 0;
    const bAvailable = b.canAccept ? 1 : 0;
    if (aAvailable !== bAvailable) return bAvailable - aAvailable;
    return Number(a.distanceKm || 0) - Number(b.distanceKm || 0);
  });

  return (
    <div className="rounded-2xl border border-[#2a3142] overflow-hidden shadow-xl bg-[#111827]">
      <div className="px-6 py-5 border-b border-[#2a3142] bg-[#171d33] flex items-center justify-between">
        <div>
          <h3 className="text-lg leading-none font-bold text-[#4da3ff]">
            Emergency Facilities
          </h3>
          <p className="mt-2 text-xs text-gray-400">Beds needed: {requiredBeds}</p>
        </div>
        <button
          onClick={onRefreshFacilities}
          className="w-9 h-9 rounded-full border border-[#334155] text-gray-300 hover:text-white hover:border-[#4da3ff] transition-colors"
          aria-label="Refresh facilities"
        >
          +
        </button>
      </div>

      <div className="px-4 pt-4 pb-2 bg-[#111827]">
        <p className="text-xs font-semibold text-gray-300 mb-2">Available Hospitals</p>
        {availableFacilities.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availableFacilities.map((facility) => {
              const isSelected = selectedFacilityId === facility.id;
              return (
                <button
                  key={`quick-${facility.id}`}
                  onClick={() => onSelectFacility?.(facility)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isSelected
                      ? "bg-[#1d4ed8] border-[#1d4ed8] text-white"
                      : "bg-[#1a1f2e] border-[#00d37d] text-[#8af5c0] hover:bg-[#12302f]"
                  }`}
                >
                  {facility.name} ({facility.bedsAvailable} beds)
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-yellow-400">No hospital currently has enough available beds.</p>
        )}
      </div>

      <div className="p-4 pt-2 space-y-3 bg-[#111827]">
        {sortedFacilities.map((facility) => {
          const isSelected = selectedFacilityId === facility.id;
          const isAvailable = facility.canAccept;

          return (
            <div
              key={facility.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                isAvailable
                  ? "bg-gradient-to-br from-[#0e2a2e] to-[#10253c] border-[#00d37d]"
                  : "bg-gradient-to-br from-[#311622] to-[#1f1834] border-[#ff3e54]"
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h4 className="text-white font-bold text-lg leading-tight">{facility.name}</h4>
                  <p className="text-gray-300 text-xs mt-1">{facility.level}</p>
                </div>
                <span
                  className={`px-4 py-1.5 rounded-full text-[11px] font-bold ${
                    isAvailable ? "bg-[#16c46a] text-white" : "bg-[#ef3333] text-white"
                  }`}
                >
                  {isAvailable ? "Available" : "Busy"}
                </span>
              </div>

              <div className="my-3 h-px bg-[#3a445b]" />

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-200">Beds available: {facility.bedsAvailable}</span>
                <span
                  className={`font-bold ${
                    parseInt(facility.wait, 10) < 20 ? "text-green-400" : "text-yellow-400"
                  }`}
                >
                  {facility.wait} wait
                </span>
              </div>

              <button
                onClick={() => onSelectFacility?.(facility)}
                disabled={!isAvailable || isSelected}
                className={`w-full mt-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  isSelected
                    ? "bg-[#1d4ed8] text-white"
                    : isAvailable
                      ? "bg-[#16a34a] hover:bg-[#15803d] text-white"
                      : "bg-[#475569] text-gray-200 cursor-not-allowed"
                }`}
              >
                {isSelected
                  ? "Selected Facility"
                  : isAvailable
                    ? "Select Facility"
                    : "Currently Full"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-4 bg-[#171d33] border-t border-[#2a3142]">
        <button
          onClick={onViewAllMap}
          className="w-full py-3.5 bg-[#2f66de] hover:bg-[#2558c9] text-white font-bold rounded-xl transition-all"
        >
          View All Facilities on Map
        </button>
      </div>
    </div>
  );
}

export default EmergencyFacilities;
