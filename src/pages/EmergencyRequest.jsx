import { useEffect, useState } from "react";
import EmergencyConfirm from "./EmergencyConfirm";
import ambulanceImg from "../assets/ambulanceimage.jpg";
import logoImg from "../assets/logo.png";
import Navbar from "../components/Navbar";

function EmergencyRequest({ onProceed }) {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("Idle");
  const [showConfirmPage, setShowConfirmPage] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

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
            setLocation(area);
          } catch {
            setLocation("Unknown area");
          }
        },
        () => setLocation("Location denied")
      );
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setStatus("Enroute"), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (showConfirmPage) {
    return <EmergencyConfirm onCancel={() => setShowConfirmPage(false)} />;
  }

  return (
    <div className="min-h-screen p-5 font-sans bg-green-50">

      <Navbar onProceed={onProceed} />

      {/* HEADER WITH AMBULANCE BACKGROUND */}
      <div
        className="rounded-2xl overflow-hidden mb-8 relative text-center mt-16"
        style={{
          backgroundImage: `url(${ambulanceImg})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundColor: "#000",
          padding: "100px 20px",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10">
          <img src={logoImg} alt="UzimaNode Logo" className="h-72 mx-auto" />
          <p className="text-white text-xl font-semibold mt-3">Fast Reliable Lifesaving</p>
        </div>
      </div>

      {/* EMERGENCY BUTTON */}
      <div className="relative flex justify-center mb-8">
        <div className="absolute w-48 h-48 border-4 border-red-500 rounded-full animate-ping opacity-75"></div>
        <div className="absolute w-48 h-48 border-4 border-red-500 rounded-full animate-ping opacity-75" style={{ animationDelay: "1s" }}></div>
        <button
          className={`relative z-10 bg-red-500 text-white rounded-3xl p-10 border-none cursor-pointer w-full max-w-sm transition-transform duration-200 ${isHovering ? "scale-105" : "scale-100"}`}
          onClick={() => setShowConfirmPage(true)}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="text-5xl mb-2">🚨</div>
          <div className="text-2xl font-bold">REQUEST HELP NOW</div>
          <div className="text-sm opacity-90 mt-1">⚡ ~4 min response time</div>
        </button>
      </div>

      {/* INFO CARDS */}
      <div className="flex gap-4 max-w-lg mx-auto mb-8">
        {/* Status Card */}
        <div className="flex-1 rounded-2xl p-6 text-center shadow-lg border-2 border-white/60 bg-gradient-to-br from-green-100 to-green-200">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center text-2xl bg-white/90 shadow-md">⏱</div>
          <div className="text-xs font-bold tracking-wider uppercase text-emerald-800 mb-1">STATUS</div>
          <div className="text-lg font-extrabold text-emerald-900">{status}</div>
        </div>

        {/* Location Card */}
        <div className="flex-1 rounded-2xl p-6 text-center shadow-lg border-2 border-white/60 bg-gradient-to-br from-blue-100 to-blue-300">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center text-2xl bg-white/90 shadow-md">📍</div>
          <div className="text-xs font-bold tracking-wider uppercase text-blue-900 mb-1">YOUR LOCATION</div>
          <div className="text-lg font-extrabold text-blue-800">{location || "Detecting..."}</div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center">
        <div className="inline-block bg-gradient-to-r from-white to-slate-100 px-6 py-3 rounded-2xl shadow-md">
          <span className="text-sm text-slate-500 font-extrabold">24/7 Emergency Support</span>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

export default EmergencyRequest;