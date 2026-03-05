import React from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, AlertTriangle, Bed, Users, Clock, Calendar,
  Activity, ArrowRight, Heart, CheckCircle, ChevronRight
} from "lucide-react";

/* ── DATA ─────────────────────────────────── */
const kpis = [
  { icon: AlertTriangle, label: "Incoming",        value: "2",   sub: "En route",         color: "red",    path: "/dashboard/alerts"   },
  { icon: Heart,         label: "Critical Cases",  value: "3",   sub: "Need attention",   color: "orange", path: "/dashboard/patients" },
  { icon: Bed,           label: "Available Beds",  value: "15",  sub: "Across all depts", color: "green",  path: "/dashboard/beds"     },
  { icon: Users,         label: "In Treatment",    value: "2",   sub: "Active patients",  color: "blue",   path: "/dashboard/patients" },
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

const staffSnapshot = [
  { name: "Dr. Sarah Miller", specialty: "Cardiology",     status: "busy",      dot: "bg-yellow-500" },
  { name: "Dr. James Wilson", specialty: "Neurology",      status: "available", dot: "bg-green-500"  },
  { name: "Dr. Elena Rossi",  specialty: "Trauma Surgery", status: "critical",  dot: "bg-red-500"    },
];

const activityLog = [
  { time: "14:32", icon: "➕", msg: "Patient ER-9034 admitted to ICU-3",          type: "admission" },
  { time: "14:15", icon: "🚨", msg: "Code Blue activated — Trauma Bay 2",          type: "critical"  },
  { time: "13:58", icon: "✅", msg: "Patient ER-9012 discharged",                  type: "discharge" },
  { time: "13:45", icon: "➡️", msg: "Patient ER-9028 transferred to OR-2",         type: "transfer"  },
  { time: "13:20", icon: "⚠️", msg: "Blood O- critically low — 3 units remaining", type: "alert"     },
];

const quickLinks = [
  { to: "/dashboard/alerts",    label: "Incoming Alerts",  detail: "2 en route",    bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700"    },
  { to: "/dashboard/patients",  label: "Active Patients",  detail: "2 in treatment",bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  { to: "/dashboard/staff",     label: "Staff On-Call",    detail: "2 available",   bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
  { to: "/dashboard/beds",      label: "Beds & Resources", detail: "15 available",  bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700"  },
  { to: "/dashboard/referrals", label: "Referrals",        detail: "1 pending",     bg: "bg-teal-50",   border: "border-teal-200",   text: "text-teal-700"   },
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
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
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

      {/* ── ROW 2: Alerts Preview + Staff Snapshot ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Incoming Alerts Preview */}
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
          <div className="p-4 space-y-3">
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

        {/* On-Call Staff Snapshot */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              <h2 className="font-bold text-slate-800">On-Call Staff</h2>
            </div>
            <Link to="/dashboard/staff" className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {staffSnapshot.map(doc => (
              <div key={doc.name} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center
                    text-indigo-700 font-bold text-xs flex-shrink-0">
                    {doc.name.split(" ").slice(1).map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                    <p className="text-xs text-slate-500">{doc.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${doc.dot}`} />
                  <span className="text-xs text-slate-500 capitalize">{doc.status}</span>
                </div>
              </div>
            ))}
          </div>
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
              { label: "Projected in 2h", value: "75%",  highlight: false },
              { label: "Peak Time Today", value: "18:00", highlight: false },
              { label: "Today's Intake",  value: "47",   highlight: false },
              { label: "Avg Stay",        value: "3.2h", highlight: false },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-white/10 last:border-0">
                <span className="text-xs text-slate-400">{label}</span>
                <span className="text-sm font-bold text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 4: Activity Log + Quick Links ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Activity Log */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
            <Activity className="w-4 h-4 text-blue-500" />
            <h2 className="font-bold text-slate-800">Recent Activity</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {activityLog.map((e, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                <span className="text-slate-300 font-mono text-xs w-10 flex-shrink-0">{e.time}</span>
                <span className="text-base flex-shrink-0">{e.icon}</span>
                <span className="text-sm text-slate-700">{e.msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Navigation Links */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
            <ArrowRight className="w-4 h-4 text-blue-500" />
            <h2 className="font-bold text-slate-800">Quick Navigation</h2>
          </div>
          <div className="p-4 grid grid-cols-1 gap-2">
            {quickLinks.map(({ to, label, detail, bg, border, text }) => (
              <Link key={to} to={to}
                className={`flex items-center justify-between px-4 py-3 rounded-lg
                  ${bg} border ${border} hover:opacity-80 transition-opacity`}>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${text}`}>{label}</span>
                  <span className={`text-xs ${text} opacity-70`}>{detail}</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${text}`} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}