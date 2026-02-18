import React from "react";
import { Bed, Zap, AlertTriangle, CheckCircle, Activity } from "lucide-react";

const BEDS = [
  { dept: "Emergency Room",  available: 4, total: 12, icon: "🚨", color: "blue",   },
  { dept: "ICU",             available: 2, total: 10, icon: "❤️", color: "red",    },
  { dept: "Trauma Bay",      available: 1, total: 3,  icon: "🚑", color: "orange", },
  { dept: "Operating Room",  available: 2, total: 5,  icon: "🏥", color: "purple", },
  { dept: "Neuro Bay",       available: 1, total: 2,  icon: "🧠", color: "indigo", },
  { dept: "Pediatric",       available: 5, total: 8,  icon: "👶", color: "green",  },
];

const EQUIPMENT = [
  { name: "Ventilators",    available: 3, total: 8  },
  { name: "CT Scanner",     available: 1, total: 2  },
  { name: "MRI Machine",    available: 1, total: 1  },
  { name: "X-Ray Unit",     available: 2, total: 3  },
  { name: "Ultrasound",     available: 3, total: 4  },
  { name: "Defibrillator",  available: 4, total: 6  },
  { name: "ECG Machine",    available: 5, total: 7  },
  { name: "Infusion Pump",  available: 8, total: 15 },
];

const BLOOD = [
  { type: "O−",  units: 3,  min: 5 },
  { type: "O+",  units: 12, min: 5 },
  { type: "A−",  units: 6,  min: 5 },
  { type: "A+",  units: 9,  min: 5 },
  { type: "B−",  units: 4,  min: 5 },
  { type: "B+",  units: 8,  min: 5 },
  { type: "AB−", units: 2,  min: 5 },
  { type: "AB+", units: 7,  min: 5 },
];

const bedStatus = (available, total) => {
  const pct = (available / total) * 100;
  if (pct === 0)  return { label: "Full",     color: "red",    bar: "bg-red-500"    };
  if (pct <= 25)  return { label: "Critical", color: "red",    bar: "bg-red-500"    };
  if (pct <= 50)  return { label: "Low",      color: "orange", bar: "bg-orange-500" };
  if (pct <= 75)  return { label: "Moderate", color: "yellow", bar: "bg-yellow-500" };
  return               { label: "Good",      color: "green",  bar: "bg-green-500"  };
};

const eqStatus = (available, total) => {
  const pct = (available / total) * 100;
  if (pct === 0)   return { label: "None Available", color: "red"    };
  if (pct <= 33)   return { label: "Low",            color: "orange" };
  if (pct <= 66)   return { label: "Moderate",       color: "yellow" };
  return                  { label: "Available",      color: "green"  };
};

const bloodStatus = (units, min) => {
  if (units < min)        return { label: "Critical", color: "red",    bg: "bg-red-50 border-red-300",    text: "text-red-700"    };
  if (units < min * 1.5)  return { label: "Low",      color: "orange", bg: "bg-orange-50 border-orange-300", text: "text-orange-700" };
  return                         { label: "OK",       color: "green",  bg: "bg-green-50 border-green-200", text: "text-green-700"  };
};

export default function BedsResources() {
  const totalBeds   = BEDS.reduce((s, b) => s + b.total,     0);
  const availBeds   = BEDS.reduce((s, b) => s + b.available, 0);
  const occupancy   = Math.round(((totalBeds - availBeds) / totalBeds) * 100);
  const criticalBlood = BLOOD.filter(b => b.units < b.min).length;

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">

      {/* Top summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Beds",       value: totalBeds,       color: "blue",   icon: Bed          },
          { label: "Available Beds",   value: availBeds,       color: "green",  icon: CheckCircle  },
          { label: "Occupancy",        value: `${occupancy}%`, color: occupancy > 80 ? "red" : occupancy > 60 ? "yellow" : "green", icon: Activity },
          { label: "Blood Alerts",     value: criticalBlood,   color: criticalBlood > 0 ? "red" : "green", icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`bg-white rounded-xl p-4 shadow-sm border border-slate-100 border-l-4 border-l-${color}-500`}>
            <div className="flex justify-between items-start mb-2">
              <Icon className={`w-5 h-5 text-${color}-600`} />
              <span className={`text-2xl font-black text-${color}-600`}>{value}</span>
            </div>
            <p className="text-xs font-bold text-slate-600">{label}</p>
          </div>
        ))}
      </div>

      {/* ── BED AVAILABILITY ── */}
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

        {/* Overall progress bar */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Overall capacity</span>
            <span>{availBeds} of {totalBeds} beds free</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${occupancy > 80 ? "bg-red-500" : occupancy > 60 ? "bg-yellow-500" : "bg-green-500"}`}
              style={{ width: `${occupancy}%` }}
            />
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {BEDS.map(b => {
            const pct = Math.round((b.available / b.total) * 100);
            const s   = bedStatus(b.available, b.total);
            return (
              <div key={b.dept} className="border-2 border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{b.icon}</span>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{b.dept}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-${s.color}-100 text-${s.color}-700`}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-black text-${b.color}-600`}>{b.available}</p>
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

      {/* ── BOTTOM ROW: Equipment + Blood Bank ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Equipment */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h2 className="font-bold text-slate-800">Equipment Availability</h2>
          </div>

          <div className="divide-y divide-slate-50">
            {EQUIPMENT.map(eq => {
              const pct = Math.round((eq.available / eq.total) * 100);
              const s   = eqStatus(eq.available, eq.total);
              return (
                <div key={eq.name} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-800">{eq.name}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-${s.color}-100 text-${s.color}-700`}>
                          {s.label}
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          {eq.available}/{eq.total}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className={`bg-${s.color}-500 h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Blood Bank */}
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
              {BLOOD.map(b => {
                const s = bloodStatus(b.units, b.min);
                return (
                  <div key={b.type} className={`border-2 rounded-xl p-3 text-center ${s.bg}`}>
                    <p className="font-black text-slate-800 text-sm mb-1">{b.type}</p>
                    <p className={`text-2xl font-black ${s.text}`}>{b.units}</p>
                    <p className="text-xs text-slate-400">units</p>
                    <div className="mt-1.5">
                      {b.units < b.min
                        ? <AlertTriangle className={`w-3.5 h-3.5 ${s.text} mx-auto`} />
                        : <CheckCircle className="w-3.5 h-3.5 text-green-500 mx-auto" />
                      }
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Min stock legend */}
            <p className="text-xs text-slate-400 text-center mb-3">Minimum threshold: 5 units per type</p>

            <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl
              font-bold text-sm transition-colors flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Request Blood Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}