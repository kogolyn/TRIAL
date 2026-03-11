import React, { useCallback, useEffect, useState } from "react";
import { AlertTriangle, MapPin, Clock, X, CheckCircle } from "lucide-react";
import { api } from "../../lib/api";
import NotificationCenter from "../../components/common/NotificationCenter";
import useRoleNotifications from "../../hooks/useRoleNotifications";

const SEV = {
  critical: {
    bar: "bg-red-600",
    badge: "bg-red-600 text-white",
    border: "border-red-200",
    label: "CRITICAL",
  },
  urgent: {
    bar: "bg-orange-500",
    badge: "bg-orange-500 text-white",
    border: "border-orange-200",
    label: "URGENT",
  },
  moderate: {
    bar: "bg-yellow-500",
    badge: "bg-yellow-500 text-white",
    border: "border-yellow-200",
    label: "MODERATE",
  },
};

const TEAM_COLOR = {
  Cardiology: "bg-red-100 text-red-700",
  Neurology: "bg-indigo-100 text-indigo-700",
  Trauma: "bg-orange-100 text-orange-700",
  "ER Team": "bg-blue-100 text-blue-700",
};

function ETATimer({ eta }) {
  const [secs, setSecs] = useState(Math.max(0, eta * 60));

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const m = Math.floor(secs / 60);
  const s = String(secs % 60).padStart(2, "0");

  return (
    <div className="text-right">
      <p className={`text-2xl font-black tabular-nums ${secs < 120 ? "text-red-600 animate-pulse" : "text-slate-800"}`}>
        {m}:{s}
      </p>
      <p className="text-xs text-slate-400 uppercase tracking-wide">ETA</p>
    </div>
  );
}

export default function IncomingAlerts() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const notifications = useRoleNotifications(user, { hospitalId: user?.hospitalId });

  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [notif, setNotif] = useState(null);
  const [paging, setPaging] = useState(false);
  const [loading, setLoading] = useState(true);

  const toast = useCallback((msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
  }, []);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get("/api/hospitals/alerts");
      setAlerts(data.alerts || []);
    } catch (error) {
      toast(error.message || "Failed to load alerts", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const patchAlert = (updated) => {
    setAlerts((rows) => rows.map((a) => (a.id === updated.id ? updated : a)));
    if (modal?.id === updated.id) setModal(updated);
  };

  const pageTeam = async (a) => {
    try {
      setPaging(true);
      const updated = await api.patch(`/api/hospitals/alerts/${a.id}/page-team`);
      patchAlert(updated);
      toast(`${a.team} paged for ${a.name}`);
    } catch (error) {
      toast(error.message || "Failed to page team", "error");
    } finally {
      setPaging(false);
    }
  };

  const confirm = async (a) => {
    try {
      const updated = await api.patch(`/api/hospitals/alerts/${a.id}/confirm-room`, { room: a.room });
      patchAlert(updated);
      toast(`${a.name} confirmed -> ${updated.room}`);
      setModal(updated);
    } catch (error) {
      toast(error.message || "Failed to confirm room", "error");
    }
  };

  const reassign = async (a) => {
    const room = prompt("New room:", a.room);
    if (!room) return;
    try {
      const updated = await api.patch(`/api/hospitals/alerts/${a.id}/reassign-room`, { room });
      patchAlert(updated);
      toast(`${a.name} reassigned to ${room}`);
      setModal(updated);
    } catch (error) {
      toast(error.message || "Failed to reassign room", "error");
    }
  };

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <div className="max-w-screen-xl mx-auto space-y-5">
      <NotificationCenter
        title="Hospital Alerts"
        connected={notifications.connected}
        notifications={notifications.notifications}
        unreadCount={notifications.unreadCount}
        onAcknowledge={notifications.acknowledge}
        onMarkAsRead={notifications.markAsRead}
      />

      {notif && (
        <div className={`fixed top-20 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-white min-w-64 ${notif.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{notif.msg}</span>
          <button onClick={() => setNotif(null)}>
            <X className="w-4 h-4 opacity-70 hover:opacity-100" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            <h2 className="text-lg font-bold text-slate-800">Live Incoming Alerts</h2>
          </div>
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">{filtered.length} en route</span>
        </div>

        <div className="flex items-center gap-2">
          {["all", "critical", "urgent", "moderate"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize
                ${
                  filter === f
                    ? f === "all"
                      ? "bg-slate-800 text-white"
                      : f === "critical"
                        ? "bg-red-600 text-white"
                        : f === "urgent"
                          ? "bg-orange-500 text-white"
                          : "bg-yellow-500 text-white"
                    : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-100 p-16 text-center text-slate-500">Loading alerts...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-16 text-center text-slate-400">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No {filter} alerts at this time</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map((a) => {
            const s = SEV[a.severity] || SEV.moderate;
            const ambulanceLabel = a.ambulanceId || a.id;
            return (
              <div
                key={a.id}
                className={`bg-white rounded-xl border-2 ${s.border} shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer`}
                onClick={() => setModal(a)}
              >
                <div className={`h-1.5 ${s.bar} w-full`} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800 text-lg">{a.name}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${s.badge}`}>
                          {s.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">
                        {a.age}y - {a.gender} - {ambulanceLabel}
                      </p>
                      <p className="text-sm font-semibold text-slate-700 mt-1">{a.condition}</p>
                    </div>
                    <ETATimer eta={a.eta} />
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { l: "HR", v: `${a.vitals.hr}`, warn: a.vitals.hr > 100 },
                      { l: "BP", v: a.vitals.bp, warn: false },
                      { l: "SpO2", v: `${a.vitals.spo2}%`, warn: a.vitals.spo2 < 92 },
                      { l: "Temp", v: `${a.vitals.temp}C`, warn: a.vitals.temp > 38 },
                    ].map((v) => (
                      <div key={v.l} className={`rounded-lg p-2.5 text-center border ${v.warn ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
                        <p className="text-xs text-slate-400 mb-0.5">{v.l}</p>
                        <p className={`text-sm font-black ${v.warn ? "text-red-600" : "text-slate-800"}`}>
                          {v.v}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                    <p className="text-xs font-bold text-amber-700 mb-0.5">Paramedic Notes</p>
                    <p className="text-xs text-slate-700 italic">{a.notes}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {a.unit}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {a.distance}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${TEAM_COLOR[a.team] || "bg-blue-100 text-blue-700"}`}>
                        {a.team}
                      </span>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                        {"->"} {a.room}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className={`${(SEV[modal.severity] || SEV.moderate).bar} h-2 rounded-t-2xl`} />
            <div className="p-6">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{modal.name}</h3>
                  <p className="text-sm text-slate-500">
                    {(modal.ambulanceId || modal.id)} - {modal.age}y - {modal.gender} - {modal.condition}
                  </p>
                </div>
                <button onClick={() => setModal(null)}>
                  <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                {[
                  ["ETA", `${modal.eta} minutes`],
                  ["Distance", modal.distance],
                  ["Ambulance", modal.ambulanceId || modal.id],
                  ["Paramedic", modal.unit],
                  ["Assigned Room", modal.room],
                  ["Rec. Team", modal.team],
                ].map(([l, v]) => (
                  <div key={l} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-0.5">{l}</p>
                    <p className="font-bold text-slate-800">{v}</p>
                  </div>
                ))}
              </div>

              <h4 className="text-sm font-bold text-slate-700 mb-2">Live Vitals</h4>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  ["Heart Rate", `${modal.vitals.hr} bpm`, modal.vitals.hr > 100],
                  ["Blood Pressure", modal.vitals.bp, false],
                  ["SpO2", `${modal.vitals.spo2}%`, modal.vitals.spo2 < 92],
                  ["Temperature", `${modal.vitals.temp}C`, modal.vitals.temp > 38],
                ].map(([l, v, warn]) => (
                  <div key={l} className={`flex justify-between items-center p-2.5 rounded-lg border ${warn ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                    <span className="text-xs text-slate-500">{l}</span>
                    <span className={`text-sm font-bold ${warn ? "text-red-600" : "text-green-700"}`}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
                <p className="text-xs font-bold text-amber-700 mb-1">Paramedic Notes</p>
                <p className="text-sm text-slate-700">{modal.notes}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5">
                <p className="text-xs font-bold text-blue-700 mb-1">Recommended Team</p>
                <p className="text-sm font-bold text-blue-900 mb-2">{modal.team}</p>
                <button
                  onClick={() => pageTeam(modal)}
                  disabled={paging}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm py-2 rounded-lg font-bold transition-colors"
                >
                  {paging ? "Paging..." : `Page ${modal.team} Now`}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => confirm(modal)}
                  className="bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
                >
                  Confirm Room
                </button>
                <button
                  onClick={() => reassign(modal)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-colors"
                >
                  Reassign
                </button>
                <button
                  onClick={() => pageTeam(modal)}
                  disabled={paging}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
                >
                  {paging ? "Paging..." : "Page Team"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
