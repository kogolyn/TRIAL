import React from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, AlertTriangle, Bed, Clock, Calendar,
  Activity, ChevronRight
} from "lucide-react";

/* ── DATA ─────────────────────────────────── */
const kpis = [
  { icon: AlertTriangle, label: "Incoming",        value: "2",   sub: "En route",         color: "red",    path: "/dashboard/alerts"   },
  { icon: Bed,           label: "Available Beds",  value: "15",  sub: "Across all depts", color: "green",  path: "/dashboard/beds"     },
  { icon: Clock,         label: "Avg Triage Time", value: "14m", sub: "Target < 15m",     color: "yellow", path: "/dashboard"          },
  { icon: Calendar,      label: "24h Intake",      value: "47",  sub: "Patients today",   color: "purple", path: "/dashboard"          },
];

const bedSnapshot = [
  { dept: "Emergency Room",  available: 4, total: 12, color: "blue"   },
  { dept: "ICU",             available: 2, total: 10, color: "red"    },
  { dept: "Trauma Bay",      available: 1, total: 3,  color: "orange" },
  { dept: "Operating Room",  available: 2, total: 5,  color: "purple" },
  { dept: "Neuro Bay",       available: 1, total: 2,  color: "indigo" },
  { dept: "Pediatric",       available: 5, total: 8,  color: "green"  },
];

const alertsPreview = [
  { id: "AMB-2401", name: "John Doe",   condition: "Cardiac Arrest",         eta: "4 min",  severity: "critical" },
  { id: "AMB-2402", name: "Jane Smith", condition: "Motor Vehicle Accident",  eta: "8 min",  severity: "urgent"   },
];

const severityBadge = {
  critical: "bg-red-600 text-white",
  urgent:   "bg-orange-500 text-white",
  moderate: "bg-yellow-500 text-white",
};

export default function Overview() {
  const totalBeds     = bedSnapshot.reduce((s, b) => s + b.total, 0);
  const availBeds     = bedSnapshot.reduce((s, b) => s + b.available, 0);
  const occupancyPct  = Math.round(((totalBeds - availBeds) / totalBeds) * 100);

  return (
    <div className="space-y-5 max-w-screen-2xl mx-auto">

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map(({ icon: Icon, label, value, sub, color, path }) => (
          <Link key={label} to={path}
            className={`bg-white rounded-xl p-4 shadow-sm border border-slate-100
              border-l-4 border-l-${color}-500 hover:shadow-md transition-all`}>
            <div className="flex justify-between items-start mb-3">
              <div className={`w-8 h-8 rounded-lg bg-${color}-50 flex items-center justify-center`}>
                <Icon className={`w-4 h-4 text-${color}-600`} />
              </div>
              <span className={`text-2xl font-black text-${color}-600`}>{value}</span>
            </div>
            <p className="text-xs font-bold text-slate-700">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>

      {/* ── ROW 2: Incoming Alerts Preview (Full Width) ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <h2 className="font-bold text-slate-800">Incoming Alerts</h2>
          </div>
          <Link to="/dashboard/alerts" className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {alertsPreview.map(a => (
            <div key={a.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-1 rounded ${severityBadge[a.severity]}`}>
                  {a.severity.toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{a.name}</p>
                  <p className="text-xs text-slate-500">{a.condition}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-red-600">{a.eta}</p>
                <p className="text-xs text-slate-400">{a.id}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ROW 3: Bed Snapshot + Capacity Forecast ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Bed Snapshot - takes 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-green-500" />
              <h2 className="font-bold text-slate-800">Bed Availability</h2>
            </div>
            <Link to="/dashboard/beds" className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            {bedSnapshot.map(b => {
              const pct = Math.round((b.available / b.total) * 100);
              return (
                <div key={b.dept} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-semibold text-slate-700">{b.dept}</p>
                    <span className={`text-sm font-black text-${b.color}-600`}>{b.available}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className={`bg-${b.color}-500 h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{b.available}/{b.total} free</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Capacity Forecast */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-sm p-5 text-white">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h2 className="font-bold">Capacity Forecast</h2>
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-slate-400">Current Occupancy</span>
              <span className="text-xs font-bold text-white">{occupancyPct}%</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${occupancyPct > 80 ? "bg-red-500" : occupancyPct > 60 ? "bg-yellow-500" : "bg-green-500"}`}
                style={{ width: `${occupancyPct}%` }} />
            </div>
          </div>

          <div className="space-y-2.5">
            {[
              { label: "Projected in 2h", value: "75%"  },
              { label: "Peak Time Today", value: "18:00" },
              { label: "Today's Intake",  value: "47"   },
              { label: "Avg Stay",        value: "3.2h" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-white/10 last:border-0">
                <span className="text-xs text-slate-400">{label}</span>
                <span className="text-sm font-bold text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}