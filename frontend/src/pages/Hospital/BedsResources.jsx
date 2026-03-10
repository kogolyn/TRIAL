import React, { useEffect, useState } from "react";
import { Bed, Zap, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import { api } from "../../lib/api";

const ICONS = {
  "Emergency Room": "ER",
  ICU: "ICU",
  "Trauma Bay": "TB",
  "Operating Room": "OR",
  "Neuro Bay": "NB",
  Pediatric: "PD",
  "General Ward": "GW",
};

const bedStatus = (available, total) => {
  const pct = total > 0 ? (available / total) * 100 : 0;
  if (pct === 0) return { label: "Full", color: "red", bar: "bg-red-500", pill: "bg-red-100 text-red-700" };
  if (pct <= 25) return { label: "Critical", color: "red", bar: "bg-red-500", pill: "bg-red-100 text-red-700" };
  if (pct <= 50) return { label: "Low", color: "orange", bar: "bg-orange-500", pill: "bg-orange-100 text-orange-700" };
  if (pct <= 75) return { label: "Moderate", color: "yellow", bar: "bg-yellow-500", pill: "bg-yellow-100 text-yellow-700" };
  return { label: "Good", color: "green", bar: "bg-green-500", pill: "bg-green-100 text-green-700" };
};

const eqStatus = (available, total) => {
  const pct = total > 0 ? (available / total) * 100 : 0;
  if (pct === 0) return { label: "None Available", color: "red", pill: "bg-red-100 text-red-700", bar: "bg-red-500" };
  if (pct <= 33) return { label: "Low", color: "orange", pill: "bg-orange-100 text-orange-700", bar: "bg-orange-500" };
  if (pct <= 66) return { label: "Moderate", color: "yellow", pill: "bg-yellow-100 text-yellow-700", bar: "bg-yellow-500" };
  return { label: "Available", color: "green", pill: "bg-green-100 text-green-700", bar: "bg-green-500" };
};

const bloodStatus = (units, min) => {
  if (units < min) return { bg: "bg-red-50 border-red-300", text: "text-red-700", critical: true };
  if (units < min * 1.5) return { bg: "bg-orange-50 border-orange-300", text: "text-orange-700", critical: false };
  return { bg: "bg-green-50 border-green-200", text: "text-green-700", critical: false };
};

export default function BedsResources() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const payload = await api.get("/api/hospitals/resources");
        setData(payload);
      } catch (e) {
        setError(e.message || "Failed to load resources");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="bg-white rounded-xl border border-slate-100 p-10 text-center text-slate-500">Loading resources...</div>;
  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">{error}</div>;

  const BEDS = data?.bedSnapshot ?? [];
  const EQUIPMENT = data?.equipment ?? [];
  const BLOOD = data?.blood ?? [];
  const totalBeds = data?.summary?.totalBeds ?? 0;
  const availBeds = data?.summary?.availableBeds ?? 0;
  const occupancy = data?.summary?.occupancyPct ?? 0;
  const criticalBlood = BLOOD.filter((b) => b.units < b.min).length;

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Beds", value: totalBeds, color: "text-blue-600 border-l-blue-500", icon: Bed },
          { label: "Available Beds", value: availBeds, color: "text-green-600 border-l-green-500", icon: CheckCircle },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className={`bg-white rounded-xl p-4 shadow-sm border border-slate-100 border-l-4 ${color}`}>
            <div className="flex justify-between items-start mb-2">
              {React.createElement(icon, { className: `w-5 h-5 ${color.split(" ")[0]}` })}
              <span className={`text-2xl font-black ${color.split(" ")[0]}`}>{value}</span>
            </div>
            <p className="text-xs font-bold text-slate-600">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bed className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-slate-800">Bed Availability by Department</h2>
          </div>
          <div className="bg-slate-100 px-3 py-1 rounded-lg">
            <span className="text-xs font-bold text-slate-600">{occupancy}% Occupied</span>
          </div>
        </div>

        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Overall capacity</span>
            <span>
              {availBeds} of {totalBeds} beds free
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div className={`h-3 rounded-full transition-all ${occupancy > 80 ? "bg-red-500" : occupancy > 60 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${occupancy}%` }} />
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {BEDS.map((b) => {
            const pct = b.total > 0 ? Math.round((b.available / b.total) * 100) : 0;
            const s = bedStatus(b.available, b.total);
            return (
              <div key={b.dept} className="border-2 border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-1 bg-slate-100 rounded">{ICONS[b.dept] || "D"}</span>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{b.dept}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.pill}`}>{s.label}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-blue-600">{b.available}</p>
                    <p className="text-xs text-slate-400">of {b.total}</p>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={`${s.bar} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between mt-1.5 text-xs text-slate-400">
                  <span>{pct}% available</span>
                  <span>{b.total - b.available} occupied</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h2 className="font-bold text-slate-800">Equipment Availability</h2>
          </div>

          <div className="divide-y divide-slate-50">
            {EQUIPMENT.map((eq) => {
              const pct = eq.total > 0 ? Math.round((eq.available / eq.total) * 100) : 0;
              const s = eqStatus(eq.available, eq.total);
              return (
                <div key={eq.name} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-800">{eq.name}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.pill}`}>{s.label}</span>
                        <span className="text-xs font-bold text-slate-600">
                          {eq.available}/{eq.total}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className={`${s.bar} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-500" />
              <h2 className="font-bold text-slate-800">Blood Bank Inventory</h2>
            </div>
            {criticalBlood > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5" /> {criticalBlood} critical
              </span>
            )}
          </div>

          <div className="p-5">
            <div className="grid grid-cols-4 gap-2 mb-4">
              {BLOOD.map((b) => {
                const s = bloodStatus(b.units, b.min);
                return (
                  <div key={b.type} className={`border-2 rounded-xl p-3 text-center ${s.bg}`}>
                    <p className="font-black text-slate-800 text-sm mb-1">{b.type}</p>
                    <p className={`text-2xl font-black ${s.text}`}>{b.units}</p>
                    <p className="text-xs text-slate-400">units</p>
                    <div className="mt-1.5">
                      {s.critical ? (
                        <AlertTriangle className={`w-3.5 h-3.5 ${s.text} mx-auto`} />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 mx-auto" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 text-center">Minimum threshold: 5 units per type</p>
          </div>
        </div>
      </div>
    </div>
  );
}
