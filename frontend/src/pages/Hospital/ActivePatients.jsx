import React, { useState } from "react";
import { Users, Bed, X, CheckCircle, Search } from "lucide-react";

const PATIENTS = [
  {
    id: "ER-9034", name: "Sarah Johnson", age: 45, gender: "F",
    condition: "Acute MI", location: "Cath Lab 1", admitted: "14:15",
    status: "In Procedure", severity: "critical", doctor: "Dr. Sarah Miller",
    vitals: { hr: 102, bp: "140/90", spo2: 94, temp: 37.8 },
    notes: "Patient stable. Procedure ongoing. Family in waiting room.",
  },
  {
    id: "ER-9031", name: "David Park", age: 29, gender: "M",
    condition: "Acute Appendicitis", location: "OR-2", admitted: "13:20",
    status: "In Surgery", severity: "urgent", doctor: "Dr. Elena Rossi",
    vitals: { hr: 88, bp: "118/72", spo2: 99, temp: 37.2 },
    notes: "Laparoscopic appendectomy. Estimated completion 15:30.",
  },
];

const STATUS = {
  "In Procedure": { bg: "bg-blue-100",   text: "text-blue-800"   },
  "In Surgery":   { bg: "bg-purple-100", text: "text-purple-800" },
  "Ventilated":   { bg: "bg-red-100",    text: "text-red-800"    },
  "Monitoring":   { bg: "bg-yellow-100", text: "text-yellow-800" },
  "Stabilizing":  { bg: "bg-orange-100", text: "text-orange-800" },
};

const SEVERITY = {
  critical: { badge: "bg-red-600 text-white",    row: "border-l-4 border-l-red-500"    },
  urgent:   { badge: "bg-orange-500 text-white", row: "border-l-4 border-l-orange-500" },
  moderate: { badge: "bg-yellow-500 text-white", row: "border-l-4 border-l-yellow-500" },
};

export default function ActivePatients() {
  const [modal,  setModal]  = useState(null);
  const [notif,  setNotif]  = useState(null);
  const [search, setSearch] = useState("");

  const toast = (msg) => { setNotif(msg); setTimeout(() => setNotif(null), 3500); };

  const displayed = PATIENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.condition.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-screen-xl mx-auto space-y-5">

      {/* Toast */}
      {notif && (
        <div className="fixed top-20 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl
          shadow-2xl bg-green-600 text-white min-w-64">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{notif}</span>
          <button onClick={() => setNotif(null)}><X className="w-4 h-4 opacity-70" /></button>
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Active Patients</h2>
          <p className="text-sm text-slate-500">{PATIENTS.length} patients currently in treatment</p>
        </div>
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID, condition..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm
              focus:outline-none focus:border-blue-400 transition-colors"
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Active",  value: PATIENTS.length,                                       color: "blue"   },
          { label: "Critical",      value: PATIENTS.filter(p => p.severity === "critical").length, color: "red"    },
          { label: "In Surgery/OR", value: PATIENTS.filter(p => p.status.includes("Surg")).length, color: "purple" },
          { label: "Monitoring",    value: PATIENTS.filter(p => p.status === "Monitoring").length,  color: "yellow" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-white rounded-xl p-4 shadow-sm border border-slate-100 border-l-4 border-l-${color}-500`}>
            <p className={`text-2xl font-black text-${color}-600`}>{value}</p>
            <p className="text-xs font-semibold text-slate-600 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-500" />
          <h3 className="font-bold text-slate-800">Patient Records</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Case ID", "Patient", "Condition", "Location", "Vitals", "Doctor", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayed.map(p => {
                const sv = SEVERITY[p.severity] || SEVERITY.moderate;
                const st = STATUS[p.status]     || { bg: "bg-gray-100", text: "text-gray-700" };
                return (
                  <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${sv.row}`}>

                    {/* Case ID */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-blue-600">{p.id}</span>
                    </td>

                    {/* Patient */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center
                          text-xs font-bold text-slate-600 flex-shrink-0">
                          {p.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.age}y • {p.gender} • {p.admitted}</p>
                        </div>
                      </div>
                    </td>

                    {/* Condition */}
                    <td className="px-4 py-3">
                      <div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${sv.badge}`}>
                          {p.severity.toUpperCase()}
                        </span>
                        <p className="text-sm text-slate-700 mt-1">{p.condition}</p>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200
                        rounded-lg px-2.5 py-1.5 w-fit">
                        <Bed className="w-3 h-3 text-purple-600" />
                        <span className="text-xs font-bold text-purple-700">{p.location}</span>
                      </div>
                    </td>

                    {/* Vitals */}
                    <td className="px-4 py-3">
                      <div className="space-y-0.5 text-xs">
                        <p className={`font-semibold ${p.vitals.hr > 100 ? "text-red-600" : "text-slate-600"}`}>
                          HR {p.vitals.hr} bpm
                        </p>
                        <p className={`font-semibold ${p.vitals.spo2 < 92 ? "text-red-600" : "text-slate-600"}`}>
                          SpO2 {p.vitals.spo2}%
                        </p>
                        <p className="text-slate-500">BP {p.vitals.bp}</p>
                      </div>
                    </td>

                    {/* Doctor */}
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-700">{p.doctor}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.text}`}>
                        {p.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setModal(p)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5
                            rounded-lg text-xs font-bold transition-colors whitespace-nowrap">
                          View
                        </button>
                        <button onClick={() => toast(`Paging ${p.doctor}...`)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5
                            rounded-lg text-xs font-bold transition-colors whitespace-nowrap">
                          Page Dr.
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {displayed.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    No patients matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>

            <div className={`h-2 rounded-t-2xl ${SEVERITY[modal.severity]?.badge.includes("red") ? "bg-red-500" : "bg-orange-500"}`} />

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{modal.name}</h3>
                  <p className="text-sm text-slate-500">{modal.id} • {modal.condition}</p>
                </div>
                <button onClick={() => setModal(null)}><X className="w-5 h-5 text-slate-400 hover:text-slate-700" /></button>
              </div>

              {/* Vitals grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  ["Heart Rate",     `${modal.vitals.hr} bpm`, modal.vitals.hr > 100  ],
                  ["Blood Pressure", modal.vitals.bp,           false                  ],
                  ["SpO2",           `${modal.vitals.spo2}%`,  modal.vitals.spo2 < 92 ],
                  ["Temperature",    `${modal.vitals.temp}°C`, modal.vitals.temp > 38 ],
                ].map(([l, v, warn]) => (
                  <div key={l} className={`p-3 rounded-xl border ${warn ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                    <p className="text-xs text-slate-400 mb-0.5">{l}</p>
                    <p className={`font-black text-sm ${warn ? "text-red-600" : "text-green-700"}`}>{v}</p>
                  </div>
                ))}
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                {[["Location", modal.location], ["Doctor", modal.doctor], ["Status", modal.status], ["Admitted", modal.admitted]].map(([l, v]) => (
                  <div key={l} className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-400">{l}</span>
                    <span className="text-sm font-semibold text-slate-800">{v}</span>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 text-sm text-slate-700">
                {modal.notes}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { toast(`Status updated for ${modal.name}`); setModal(null); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold transition-colors">
                  Update Status
                </button>
                <button onClick={() => { toast(`Paging ${modal.doctor}...`); setModal(null); }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold transition-colors">
                  Page Doctor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}