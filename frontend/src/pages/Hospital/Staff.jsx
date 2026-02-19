import React, { useState } from "react";
import { UserCheck, Phone, Heart, Brain, Activity, Stethoscope, AlertTriangle, X, CheckCircle } from "lucide-react";

const DOCTORS = [
  { name: "Dr. Sarah Miller",  specialty: "Cardiology",         status: "busy",      cases: 2, phone: "+1-555-0123", location: "Cath Lab 1",  availability: "In Procedure"      },
  { name: "Dr. James Wilson",  specialty: "Neurology",          status: "available", cases: 0, phone: "+1-555-0124", location: "ER Desk",      availability: "Available"          },
  { name: "Dr. Elena Rossi",   specialty: "Trauma Surgery",     status: "critical",  cases: 1, phone: "+1-555-0125", location: "OR-2",         availability: "In Surgery"         },
  { name: "Dr. Michael Chen",  specialty: "Emergency Medicine", status: "busy",      cases: 3, phone: "+1-555-0126", location: "ICU-3",        availability: "Attending Patient"  },
  { name: "Dr. Priya Patel",   specialty: "Anesthesiology",     status: "available", cases: 1, phone: "+1-555-0127", location: "OR Wing",      availability: "On Standby"         },
  { name: "Dr. Omar Hassan",   specialty: "Orthopedics",        status: "available", cases: 0, phone: "+1-555-0128", location: "On Call",      availability: "Available"          },
];

const STATUS = {
  available: { dot: "bg-green-500",  ring: "ring-green-300", label: "Available",    badge: "bg-green-100 text-green-800"  },
  busy:      { dot: "bg-yellow-500", ring: "ring-yellow-300",label: "Busy",         badge: "bg-yellow-100 text-yellow-800"},
  critical:  { dot: "bg-red-500",    ring: "ring-red-300",   label: "In Emergency", badge: "bg-red-100 text-red-800"      },
};

const SPECIALTIES = [
  { label: "Cardiology", icon: Heart,       color: "bg-red-600    hover:bg-red-700",    team: "Cardiology"         },
  { label: "Neurology",  icon: Brain,       color: "bg-purple-600 hover:bg-purple-700", team: "Neurology"          },
  { label: "Trauma",     icon: Activity,    color: "bg-orange-600 hover:bg-orange-700", team: "Trauma Surgery"     },
  { label: "ER Team",    icon: Stethoscope, color: "bg-blue-600   hover:bg-blue-700",   team: "Emergency Medicine" },
];

export default function Staff() {
  const [notif,   setNotif]   = useState(null);
  const [paging,  setPaging]  = useState(false);
  const [modal,   setModal]   = useState(null);

  const toast = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const pageTeam = async (teamName) => {
    setPaging(true);
    await new Promise(r => setTimeout(r, 900));
    toast(`${teamName} paged successfully`);
    setPaging(false);
  };

  const codeBlue = async () => {
    if (!window.confirm("⚠️ Activate Code Blue — page ALL teams immediately?")) return;
    setPaging(true);
    await new Promise(r => setTimeout(r, 1200));
    toast("🚨 CODE BLUE ACTIVATED — All teams alerted!", "warning");
    setPaging(false);
  };

  const available = DOCTORS.filter(d => d.status === "available").length;
  const busy      = DOCTORS.filter(d => d.status === "busy").length;
  const emergency = DOCTORS.filter(d => d.status === "critical").length;

  return (
    <div className="max-w-screen-xl mx-auto space-y-5">

      {/* Toast */}
      {notif && (
        <div className={`fixed top-20 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-white min-w-64
          ${notif.type === "warning" ? "bg-yellow-600" : "bg-green-600"}`}>
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium flex-1">{notif.msg}</span>
          <button onClick={() => setNotif(null)}><X className="w-4 h-4 opacity-70" /></button>
        </div>
      )}

      {/* Page header */}
      <div>
        <h2 className="text-lg font-bold text-slate-800">Staff & On-Call</h2>
        <p className="text-sm text-slate-500">{available} available · {busy} busy · {emergency} in emergency</p>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Available",    count: available, color: "green",  desc: "Ready to respond" },
          { label: "Busy",         count: busy,      color: "yellow", desc: "With patients"    },
          { label: "In Emergency", count: emergency, color: "red",    desc: "Code situation"   },
        ].map(({ label, count, color, desc }) => (
          <div key={label} className={`bg-white rounded-xl p-4 shadow-sm border border-slate-100 border-l-4 border-l-${color}-500`}>
            <p className={`text-3xl font-black text-${color}-600`}>{count}</p>
            <p className="text-sm font-bold text-slate-700 mt-1">{label}</p>
            <p className="text-xs text-slate-400">{desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Doctor cards - 2/3 width */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3">On-Call Roster</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DOCTORS.map(doc => {
              const s = STATUS[doc.status];
              const initials = doc.name.split(" ").slice(1).map(n => n[0]).join("");
              return (
                <div key={doc.name} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4
                  hover:shadow-md transition-all">

                  <div className="flex items-start gap-3 mb-3">
                    {/* Avatar with status ring */}
                    <div className={`relative w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center
                      text-indigo-700 font-black text-sm flex-shrink-0 ring-2 ${s.ring}`}>
                      {initials}
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${s.dot}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{doc.name}</p>
                      <p className="text-xs text-slate-500">{doc.specialty}</p>
                      <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${s.badge}`}>
                        {s.label}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 mb-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 text-center">📍</span>
                      <span className="font-medium text-slate-700">{doc.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{doc.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 text-center">📋</span>
                      <span>{doc.cases} active case{doc.cases !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  {/* Page button */}
                  <button
                    onClick={() => pageTeam(doc.specialty)}
                    disabled={paging}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400
                      text-white py-2 rounded-lg text-xs font-bold transition-colors"
                  >
                    {paging ? "Paging..." : `Page ${doc.name.split(" ")[1]}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Page Panel - 1/3 width */}
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-xl p-5 text-white">
            <h3 className="font-bold text-white mb-1 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-400" /> Quick Page
            </h3>
            <p className="text-xs text-slate-400 mb-4">Alert only the team relevant to the emergency</p>

            <div className="space-y-2 mb-4">
              {SPECIALTIES.map(({ label, icon: Icon, color, team }) => (
                <button
                  key={label}
                  onClick={() => pageTeam(team)}
                  disabled={paging}
                  className={`w-full ${color} disabled:opacity-50 text-white py-2.5 px-3 rounded-lg
                    text-sm font-bold transition-colors flex items-center gap-2.5`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-slate-400 mb-2">Mass Alert — Use only when absolutely necessary</p>
              <button
                onClick={codeBlue}
                disabled={paging}
                className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50
                  text-white py-3 rounded-lg font-black text-sm transition-colors
                  flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                {paging ? "Paging..." : "Code Blue — All Teams"}
              </button>
            </div>
          </div>

          {/* Availability key */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Status Key</h3>
            <div className="space-y-2">
              {Object.entries(STATUS).map(([key, val]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${val.dot} flex-shrink-0`} />
                  <div>
                    <p className="text-xs font-bold text-slate-700">{val.label}</p>
                    <p className="text-xs text-slate-400">{
                      key === "available" ? "Free to take new cases" :
                      key === "busy"      ? "Currently with a patient" :
                                           "Responding to emergency"
                    }</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal - individual doctor detail */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{modal.name}</h3>
                <p className="text-sm text-slate-500">{modal.specialty}</p>
              </div>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-2 mb-5">
              {[["Status", STATUS[modal.status].label], ["Location", modal.location], ["Cases", `${modal.cases} active`], ["Phone", modal.phone]].map(([l, v]) => (
                <div key={l} className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-400">{l}</span>
                  <span className="text-sm font-bold text-slate-800">{v}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { toast(`Paging ${modal.name}`); setModal(null); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold">
                Page Now
              </button>
              <button onClick={() => { toast(`Calling ${modal.phone}`); setModal(null); }}
                className="bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1">
                <Phone className="w-4 h-4" /> Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}