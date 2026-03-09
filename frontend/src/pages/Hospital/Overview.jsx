import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, AlertTriangle, Bed, Clock, Calendar, ChevronRight } from "lucide-react";
import { api } from "../../lib/api";

const severityBadge = {
  critical: "bg-red-600 text-white",
  urgent: "bg-orange-500 text-white",
  moderate: "bg-yellow-500 text-white",
};

const KPI_STYLES = {
  Incoming: { border: "border-l-red-500", iconBg: "bg-red-50", iconColor: "text-red-600", value: "text-red-600" },
  "Available Beds": { border: "border-l-green-500", iconBg: "bg-green-50", iconColor: "text-green-600", value: "text-green-600" },
  "Avg Triage Time": { border: "border-l-yellow-500", iconBg: "bg-yellow-50", iconColor: "text-yellow-600", value: "text-yellow-600" },
  "24h Intake": { border: "border-l-indigo-500", iconBg: "bg-indigo-50", iconColor: "text-indigo-600", value: "text-indigo-600" },
};

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const payload = await api.get("/hospital/overview");
        setData(payload);
      } catch (e) {
        setError(e.message || "Failed to load overview");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="bg-white rounded-xl border border-slate-100 p-10 text-center text-slate-500">Loading overview...</div>;
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">{error}</div>;
  }

  const kpis = [
    { icon: AlertTriangle, label: "Incoming", value: String(data?.kpis?.incoming ?? 0), sub: "En route", path: "/dashboard/alerts" },
    { icon: Bed, label: "Available Beds", value: String(data?.kpis?.availableBeds ?? 0), sub: "Across all depts", path: "/dashboard/beds" },
    { icon: Clock, label: "Avg Triage Time", value: data?.kpis?.avgTriageTime ?? "14m", sub: "Target < 15m", path: "/dashboard" },
    { icon: Calendar, label: "24h Intake", value: String(data?.kpis?.intake24h ?? 0), sub: "Patients today", path: "/dashboard" },
  ];

  const bedSnapshot = data?.bedSnapshot ?? [];
  const alertsPreview = data?.alertsPreview ?? [];
  const capacity = data?.capacity ?? {};

  return (
    <div className="space-y-5 max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map(({ icon: Icon, label, value, sub, path }) => {
          const style = KPI_STYLES[label];
          return (
            <Link key={label} to={path} className={`bg-white rounded-xl p-4 shadow-sm border border-slate-100 border-l-4 ${style.border} hover:shadow-md transition-all`}>
              <div className="flex justify-between items-start mb-3">
                <div className={`w-8 h-8 rounded-lg ${style.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${style.iconColor}`} />
                </div>
                <span className={`text-2xl font-black ${style.value}`}>{value}</span>
              </div>
              <p className="text-xs font-bold text-slate-700">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </Link>
          );
        })}
      </div>

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
          {alertsPreview.length === 0 && <div className="text-sm text-slate-500">No incoming alerts.</div>}
          {alertsPreview.map((a) => (
            <div key={a.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-1 rounded ${severityBadge[a.severity] || severityBadge.moderate}`}>{a.severity.toUpperCase()}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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
            {bedSnapshot.map((b) => {
              const pct = b.total > 0 ? Math.round((b.available / b.total) * 100) : 0;
              return (
                <div key={b.dept} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-semibold text-slate-700">{b.dept}</p>
                    <span className="text-sm font-black text-blue-600">{b.available}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {b.available}/{b.total} free
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-sm p-5 text-white">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h2 className="font-bold">Capacity Forecast</h2>
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-slate-400">Current Occupancy</span>
              <span className="text-xs font-bold text-white">{capacity.occupancyPct ?? 0}%</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${capacity.occupancyPct > 80 ? "bg-red-500" : capacity.occupancyPct > 60 ? "bg-yellow-500" : "bg-green-500"}`}
                style={{ width: `${capacity.occupancyPct ?? 0}%` }}
              />
            </div>
          </div>

          <div className="space-y-2.5">
            {[
              ["Projected in 2h", capacity.projectedIn2h ?? "-"],
              ["Peak Time Today", capacity.peakTimeToday ?? "-"],
              ["Today's Intake", capacity.todayIntake ?? "-"],
              ["Avg Stay", capacity.avgStay ?? "-"],
            ].map(([label, value]) => (
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
