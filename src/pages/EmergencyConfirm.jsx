import { useState } from "react";

function EmergencyConfirm({ onCancel }) {
  const [emergencyType, setEmergencyType] = useState("");
  const [locationNotes, setLocationNotes] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  const confirmEmergency = () => {
    if (!emergencyType) {
      alert("Please select an emergency type");
      return;
    }
    setIsConfirmed(true);
  };

  const handleReset = () => {
    setIsConfirmed(false);
    setEmergencyType("");
    setLocationNotes("");
    onCancel();
  };

  if (isConfirmed) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-green-50 p-5 text-center">
        <div className="bg-white px-10 py-14 rounded-3xl shadow-2xl max-w-lg w-full border-4 border-green-500">

          {/* Animated Icon */}
          <div className="relative w-28 h-28 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-ping opacity-75"></div>
            <div className="relative flex items-center justify-center h-full text-6xl">🚑</div>
          </div>

          <h2 className="text-4xl font-black mb-5 text-gray-900 tracking-wide">HELP IS ON THE WAY</h2>

          <span className="inline-flex items-center gap-2 bg-green-500 text-white px-7 py-3 rounded-full text-lg font-black mb-6 tracking-widest shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
            EN ROUTE
          </span>

          <p className="text-lg text-gray-500 mb-8 leading-relaxed font-medium">
            Emergency services have received your alert and are heading to your location.
          </p>

          {/* ETA Box */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl mb-8 flex items-center gap-4 border-2 border-green-200 text-left">
            <span className="text-4xl">⏱</span>
            <div>
              <div className="text-sm text-gray-500 mb-1">Estimated Arrival</div>
              <div className="text-2xl font-black text-green-600">4 minutes</div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-2 text-sm font-semibold text-gray-500">
              <span className="text-xl">📍</span> Location Confirmed
            </div>
            <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-2 text-sm font-semibold text-gray-500">
              <span className="text-xl">📞</span> Stay Available
            </div>
          </div>

          <button
            className="bg-none border-none text-green-500 cursor-pointer text-base font-semibold underline"
            onClick={handleReset}
          >
            Report another incident
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 font-sans bg-green-50 flex flex-col justify-center items-center">
      <button
        className="self-start mb-3 bg-transparent border-none cursor-pointer text-gray-500 text-base"
        onClick={onCancel}
      >
        ← Back
      </button>

      <div className="bg-white rounded-2xl p-6 shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-extrabold mb-5">Select Emergency Type</h2>

        <div className="flex flex-col gap-3 mb-6">
          {types.map((type) => {
            const active = emergencyType === type.key;
            return (
              <div
                key={type.key}
                className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                  active
                    ? "border-red-500 bg-red-50 scale-102"
                    : "border-gray-200 bg-white"
                }`}
                onClick={() => setEmergencyType(type.key)}
              >
                <span className="text-3xl mr-4">{type.icon}</span>
                <span className="text-base font-semibold text-gray-900">{type.label}</span>
              </div>
            );
          })}
        </div>

        <div className="mb-5">
          <label className="block text-xs font-bold mb-2 text-gray-500 uppercase tracking-wider">
            Location Notes (Optional)
          </label>
          <textarea
            className="w-full p-3 rounded-xl border border-gray-200 text-sm resize-none outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            placeholder="e.g. near the main gate, second floor"
            value={locationNotes}
            onChange={(e) => setLocationNotes(e.target.value)}
            rows={3}
          />
        </div>

        <button
          className="w-full py-5 rounded-xl bg-red-600 text-white text-base font-bold border-none cursor-pointer shadow-lg hover:bg-red-700 transition duration-200"
          onClick={confirmEmergency}
        >
          Confirm Emergency →
        </button>
      </div>
    </div>
  );
}

const types = [
  { key: "Medical", label: "Medical Emergency", icon: "🩺" },
  { key: "Accident", label: "Traffic Accident", icon: "🚗" },
  { key: "Fire", label: "Fire / Smoke", icon: "🔥" },
];

export default EmergencyConfirm;