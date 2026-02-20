import { useState, useEffect } from "react";

function EmergencyConfirm({ onCancel }) {
  const [emergencyType, setEmergencyType] = useState("");
  const [subType, setSubType] = useState("");
  const [customSubType, setCustomSubType] = useState("");
  const [locationNotes, setLocationNotes] = useState("");
  const [userLocation, setUserLocation] = useState("Detecting location...");
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            const address = data.address || {};
            const area =
              address.suburb ||
              address.neighbourhood ||
              address.village ||
              address.town ||
              address.city ||
              "Unknown area";
            setUserLocation(area);
          } catch {
            setUserLocation("Location unavailable");
          }
        },
        () => setUserLocation("Location access denied")
      );
    }
  }, []);

  const confirmEmergency = () => {
    if (!emergencyType) {
      alert("Please select an emergency type");
      return;
    }
    if (!subType) {
      alert("Please specify the emergency details");
      return;
    }
    if (subType === "Other" && !customSubType.trim()) {
      alert("Please describe the emergency");
      return;
    }
    setIsConfirmed(true);
  };

  const handleReset = () => {
    setIsConfirmed(false);
    setEmergencyType("");
    setSubType("");
    setCustomSubType("");
    setLocationNotes("");
    onCancel();
  };

  // Get sub-types based on selected emergency type
  const getSubTypes = () => {
    const selected = types.find(t => t.key === emergencyType);
    return selected ? selected.subTypes : [];
  };

  // Get the display name for the emergency (use custom if "Other" selected)
  const getEmergencyDisplay = () => {
    return subType === "Other" ? customSubType : subType;
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

          {/* Status Box */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl mb-8 border-2 border-green-200">
            <div className="text-sm text-gray-500 mb-2">Emergency Type</div>
            <div className="text-xl font-black text-green-600 mb-3">{getEmergencyDisplay()}</div>
            <div className="text-sm text-gray-600 bg-white/60 rounded-lg py-2 px-3">
              📍 Ambulance dispatched to your location
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-gray-50 p-4 rounded-xl flex flex-col items-center gap-1 text-sm font-semibold text-gray-500">
              <span className="text-xl">📍</span> 
              <span className="text-xs text-center">{userLocation}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-2 text-sm font-semibold text-gray-500">
              <span className="text-xl">📞</span> Stay Available
            </div>
          </div>

          <button
            className="bg-none border-none text-green-500 cursor-pointer text-base font-semibold underline hover:text-green-600"
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
        className="self-start mb-3 bg-transparent border-none cursor-pointer text-gray-500 text-base hover:text-gray-700"
        onClick={onCancel}
      >
        ← Back
      </button>

      <div className="bg-white rounded-2xl p-6 shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-extrabold mb-5">Select Emergency Type</h2>

        {/* Main Emergency Types */}
        <div className="flex flex-col gap-3 mb-6">
          {types.map((type) => {
            const active = emergencyType === type.key;
            return (
              <div
                key={type.key}
                className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                  active
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                onClick={() => {
                  setEmergencyType(type.key);
                  setSubType(""); // Reset sub-type when changing main type
                  setCustomSubType(""); // Reset custom input
                }}
              >
                <span className="text-3xl mr-4">{type.icon}</span>
                <span className="text-base font-semibold text-gray-900">{type.label}</span>
              </div>
            );
          })}
        </div>

        {/* Sub-Types (shown when main type is selected) */}
        {emergencyType && (
          <div className="mb-6">
            <label className="block text-xs font-bold mb-3 text-gray-500 uppercase tracking-wider">
              Specify Emergency Details *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {getSubTypes().map((sub) => (
                <button
                  key={sub}
                  className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                    subType === sub
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    setSubType(sub);
                    if (sub !== "Other") {
                      setCustomSubType(""); // Clear custom input if not "Other"
                    }
                  }}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Custom Emergency Input (shown when "Other" is selected) */}
            {subType === "Other" && (
              <div className="mt-4">
                <label className="block text-xs font-bold mb-2 text-gray-500 uppercase tracking-wider">
                  Describe the Emergency *
                </label>
                <input
                  type="text"
                  className="w-full p-3 rounded-xl border-2 border-gray-200 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  placeholder="e.g. Electric shock, Dog bite, Fall from height..."
                  value={customSubType}
                  onChange={(e) => setCustomSubType(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        <div className="mb-5">
          <label className="block text-xs font-bold mb-2 text-gray-500 uppercase tracking-wider">
            Location Notes (Optional)
          </label>
          <textarea
            className="w-full p-3 rounded-xl border border-gray-200 text-sm resize-none outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            placeholder="e.g. near the main gate, second floor, blue building"
            value={locationNotes}
            onChange={(e) => setLocationNotes(e.target.value)}
            rows={3}
          />
        </div>

        <button
          className="w-full py-5 rounded-xl bg-red-600 text-white text-base font-bold border-none cursor-pointer shadow-lg hover:bg-red-700 transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
          onClick={confirmEmergency}
          disabled={!emergencyType || !subType || (subType === "Other" && !customSubType.trim())}
        >
          Confirm Emergency →
        </button>
      </div>
    </div>
  );
}

const types = [
  { 
    key: "Medical", 
    label: "Medical Emergency", 
    icon: "🩺",
    subTypes: [
      "Severe Bleeding",
      "Unconscious/Fainted",
      "Heart Attack",
      "Stroke",
      "Snake Bite",
      "Difficulty Breathing",
      "Seizure",
      "Childbirth/Delivery",
      "Severe Burns",
      "Allergic Reaction",
      "Choking",
      "Poisoning",
      "Other"
    ]
  },
  { 
    key: "Accident", 
    label: "Traffic Accident", 
    icon: "🚗",
    subTypes: [
      "Car Collision",
      "Motorcycle Accident",
      "Pedestrian Hit",
      "Multiple Vehicles",
      "Vehicle Rollover",
      "Head-On Collision",
      "Bus Accident",
      "Truck Accident",
      "Other"
    ]
  },
  { 
    key: "Fire", 
    label: "Fire ", 
    icon: "🔥",
    subTypes: [
      "Building Fire",
      "Vehicle Fire",
      "Electrical Fire",
      "Kitchen Fire",
      "Gas Explosion",
      "Smoke Inhalation",
      "Forest/Bush Fire",
      "Chemical Fire",
      "Other"
    ]
  },
];

export default EmergencyConfirm;