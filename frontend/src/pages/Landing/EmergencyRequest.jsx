import { useEffect, useState } from "react";
import EmergencyConfirm from "./EmergencyConfirm";
import ambulanceImg from "../../assets/ambulanceimage.jpg";
import logoImg from "../../assets/logo.png";
import Navbar from "../../components/Landing/Navbar";

function EmergencyRequest({ onLogin, onRegister }) {
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
    <div className="min-h-screen font-sans bg-green-50">

      <Navbar onLogin={onLogin} onRegister={onRegister} />

      {/* HOME SECTION */}
      <section
        id="home"
        className="scroll-mt-20 px-3 sm:px-5 md:px-8 py-4 
        min-h-[calc(100vh-80px)] flex flex-col justify-between"
      >
        {/* HEADER WITH AMBULANCE BACKGROUND */}
        <div
          className="rounded-2xl overflow-hidden relative text-center mt-14 sm:mt-16"
          style={{
            backgroundImage: `url(${ambulanceImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "#000",
            padding: "35px 15px",
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative z-10">
            <img
              src={logoImg}
              alt="UzimaNode Logo"
              className="h-28 sm:h-36 md:h-44 mx-auto"
            />
            <p className="text-white text-sm sm:text-lg font-semibold mt-2 px-2">
              Fast Reliable Lifesaving
            </p>
          </div>
        </div>

        {/* EMERGENCY BUTTON */}
        <div className="relative flex justify-center my-4">
          <div className="absolute w-32 h-32 sm:w-40 sm:h-40 border-4 border-red-500 rounded-full animate-ping opacity-75"></div>
          <div
            className="absolute w-32 h-32 sm:w-40 sm:h-40 border-4 border-red-500 rounded-full animate-ping opacity-75"
            style={{ animationDelay: "1s" }}
          ></div>

          <button
            className={`relative z-10 bg-red-500 text-white rounded-3xl p-6 sm:p-8 border-none cursor-pointer w-full max-w-xs transition-transform duration-200 ${
              isHovering ? "scale-105" : "scale-100"
            }`}
            onClick={() => setShowConfirmPage(true)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="text-4xl mb-2">🚨</div>
            <div className="text-xl font-bold">REQUEST HELP NOW</div>
            <div className="text-xs opacity-90 mt-1">
              ⚡ fast response time
            </div>
          </button>
        </div>

        {/* INFO CARDS */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          {/* Status Card */}
          <div className="flex-1 rounded-xl p-4 text-center shadow-lg border-2 border-white/60 bg-gradient-to-br from-green-100 to-green-200">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center text-xl bg-white/90 shadow-md">
              ⏱
            </div>
            <div className="text-xs font-bold uppercase text-emerald-800 mb-1">
              STATUS
            </div>
            <div className="text-base font-extrabold text-emerald-900">
              {status}
            </div>
          </div>

          {/* Location Card */}
          <div className="flex-1 rounded-xl p-4 text-center shadow-lg border-2 border-white/60 bg-gradient-to-br from-blue-100 to-blue-300">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center text-xl bg-white/90 shadow-md">
              📍
            </div>
            <div className="text-xs font-bold uppercase text-blue-900 mb-1">
              YOUR LOCATION
            </div>
            <div className="text-base font-extrabold text-blue-800 break-words">
              {location || "Detecting..."}
            </div>
          </div>
        </div>
      </section>

      {/* EVERYTHING BELOW REMAINS EXACTLY THE SAME */}
      {/* ABOUT SECTION */}
      <section id="about" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center mb-3 sm:mb-4 text-gray-900">
            About UzimaNode
          </h2>
          <p className="text-center text-gray-600 mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base md:text-lg max-w-3xl mx-auto px-2">
            Your trusted emergency response partner, saving lives through smart technology
          </p>

          {/* rest unchanged... */}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Mission */}
            <div className="bg-gradient-to-br from-green-50 to-white p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border-2 border-green-200 shadow-lg">
              <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">🎯</div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">Our Mission</h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                To provide the fastest, most reliable emergency medical response system 
                that connects patients with help.
              </p>
            </div>

            {/* Technology */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border-2 border-blue-200 shadow-lg">
              <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">💡</div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">Smart Tech</h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                Smart dispatch system with real-time GPS tracking, traffic optimization, 
                and instant hospital coordination.
              </p>
            </div>

            {/* Impact */}
            <div className="bg-gradient-to-br from-red-50 to-white p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border-2 border-red-200 shadow-lg sm:col-span-2 md:col-span-1">
              <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">❤️</div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">Our Impact</h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                Over 500+ lives saved, 24/7 coverage across Nakuru, with a 98% 
                patient satisfaction rate.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-10 sm:mt-12 md:mt-16 grid grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#FF3B30]">500+</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Lives Saved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#FF3B30]">24/7</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Availability</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#FF3B30]">98%</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-[#e8f5e9] scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center mb-3 sm:mb-4 text-gray-900">
            Our Services
          </h2>
          <p className="text-center text-gray-600 mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base md:text-lg max-w-3xl mx-auto px-2">
            Comprehensive emergency medical services at your fingertips
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
            {/* Emergency Response */}
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-xl border-2 border-gray-200 hover:shadow-2xl transition-shadow">
              <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="text-3xl sm:text-4xl md:text-5xl flex-shrink-0">🚑</div>
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Emergency Ambulance</h3>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    One-tap emergency response with GPS-tracked ambulances, 
                    paramedic support, and direct hospital coordination.
                  </p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex gap-2 flex-wrap">
                <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs sm:text-sm font-semibold">Medical Emergency</span>
                <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs sm:text-sm font-semibold">Accidents</span>
                <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs sm:text-sm font-semibold">Critical Care</span>
              </div>
            </div>

            {/* Real-Time Tracking */}
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-xl border-2 border-gray-200 hover:shadow-2xl transition-shadow">
              <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="text-3xl sm:text-4xl md:text-5xl flex-shrink-0">📍</div>
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Live GPS Tracking</h3>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    Track your ambulance in real-time. Know exactly when help will arrive 
                    with accurate ETA and route optimization.
                  </p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex gap-2 flex-wrap">
                <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold">Real-Time Updates</span>
                <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold">Route Optimization</span>
              </div>
            </div>

            {/* Hospital Network */}
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-xl border-2 border-gray-200 hover:shadow-2xl transition-shadow">
              <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="text-3xl sm:text-4xl md:text-5xl flex-shrink-0">🏥</div>
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Hospital Network</h3>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    Connected to top hospitals in Nakuru. Pre-alert emergency rooms 
                    and ensure beds are ready before you arrive.
                  </p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex gap-2 flex-wrap">
                <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-semibold">Bed Availability</span>
                <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-semibold">Pre-Registration</span>
              </div>
            </div>

            {/* 24/7 Support */}
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-xl border-2 border-gray-200 hover:shadow-2xl transition-shadow">
              <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="text-3xl sm:text-4xl md:text-5xl flex-shrink-0">☎️</div>
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">24/7 Support</h3>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    24/7 emergency dispatch and customer support. 
                    We're always here when you need us most.
                  </p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex gap-2 flex-wrap">
                <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-semibold">Always Available</span>
                <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-semibold">Instant Response</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 sm:mt-10 md:mt-12 text-center">
            <button 
              onClick={() => document.getElementById('home').scrollIntoView({ behavior: 'smooth' })}
              className="px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-[#FF3B30] text-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg shadow-lg hover:bg-[#e63329] transition-all hover:shadow-xl w-full sm:w-auto"
            >
              Request Emergency Help Now →
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 sm:py-8 bg-green-50 px-4">
        <div className="inline-block bg-gradient-to-r from-white to-slate-100 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-md">
          <span className="text-xs sm:text-sm text-slate-500 font-extrabold">24/7 Emergency Support</span>
        </div>
      </footer>

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
