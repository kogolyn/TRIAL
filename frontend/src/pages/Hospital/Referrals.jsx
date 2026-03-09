import React, { useEffect, useState } from "react";
import { ArrowLeftRight, Plus, X, CheckCircle, Clock, XCircle, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { api } from "../../lib/api";

const SEV = {
  critical: { badge: "bg-red-600 text-white", border: "border-l-red-500" },
  urgent: { badge: "bg-orange-500 text-white", border: "border-l-orange-500" },
  moderate: { badge: "bg-yellow-500 text-white", border: "border-l-yellow-500" },
};

const STATUS = {
  pending: { icon: Clock, bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
  accepted: { icon: CheckCircle, bg: "bg-green-100", text: "text-green-800", label: "Accepted" },
  rejected: { icon: XCircle, bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
};

const EMPTY_FORM = {
  patient: "",
  toFacility: "",
  condition: "",
  reason: "",
  severity: "urgent",
  transport: "Ground Ambulance",
  notes: "",
};

export default function Referrals() {
  const [tab, setTab] = useState("incoming");
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [modal, setModal] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [notif, setNotif] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const toast = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const data = await api.get("/hospital/referrals");
      setIncoming(data.incoming || []);
      setOutgoing(data.outgoing || []);
    } catch (error) {
      toast(error.message || "Failed to load referrals", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();
  }, []);

  const accept = async (id) => {
    try {
      const updated = await api.patch(`/hospital/referrals/${id}/accept`);
      setIncoming((rs) => rs.map((r) => (r.id === id ? updated : r)));
      toast("Patient accepted, prepare receiving team and room");
      setModal(null);
    } catch (error) {
      toast(error.message || "Failed to accept referral", "error");
    }
  };

  const reject = async (id, name) => {
    if (!window.confirm(`Reject incoming referral for ${name}? The sending facility will be notified.`)) return;
    try {
      const updated = await api.patch(`/hospital/referrals/${id}/reject`);
      setIncoming((rs) => rs.map((r) => (r.id === id ? updated : r)));
      toast("Referral rejected, sending facility has been notified", "error");
      setModal(null);
    } catch (error) {
      toast(error.message || "Failed to reject referral", "error");
    }
  };

  const cancel = async (id, name) => {
    if (!window.confirm(`Cancel transfer request for ${name}?`)) return;
    try {
      await api.delete(`/hospital/referrals/${id}/cancel`);
      setOutgoing((rs) => rs.filter((r) => r.id !== id));
      toast(`Transfer request for ${name} cancelled`);
      setModal(null);
    } catch (error) {
      toast(error.message || "Failed to cancel transfer request", "error");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.patient || !form.toFacility || !form.condition || !form.reason) {
      toast("Please fill in all required fields", "error");
      return;
    }

    try {
      const created = await api.post("/hospital/referrals", form);
      setOutgoing((rs) => [created, ...rs]);
      toast(`Transfer request for ${form.patient} submitted, awaiting response from ${form.toFacility}`);
      setShowForm(false);
      setForm(EMPTY_FORM);
      setTab("outgoing");
      setFilter("all");
    } catch (error) {
      toast(error.message || "Failed to submit referral", "error");
    }
  };

  const displayedIncoming = filter === "all" ? incoming : incoming.filter((r) => r.status === filter);
  const displayedOutgoing = filter === "all" ? outgoing : outgoing.filter((r) => r.status === filter);
  const displayed = tab === "incoming" ? displayedIncoming : displayedOutgoing;
  const incomingPending = incoming.filter((r) => r.status === "pending").length;

  return (
    <div className="max-w-screen-xl mx-auto space-y-5">
      {notif && (
        <div
          className={`fixed top-20 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl
          shadow-2xl text-white min-w-72
          ${notif.type === "error" ? "bg-red-600" : "bg-green-600"}`}
        >
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium flex-1">{notif.msg}</span>
          <button onClick={() => setNotif(null)}>
            <X className="w-4 h-4 opacity-70" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Referrals & Transfers</h2>
          <p className="text-sm text-slate-500">
            {incomingPending > 0
              ? `${incomingPending} incoming request${incomingPending > 1 ? "s" : ""} awaiting your decision`
              : "All incoming requests handled"}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700
            text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Transfer Request
        </button>
      </div>

      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => {
            setTab("incoming");
            setFilter("all");
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all
            ${tab === "incoming" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <ArrowDownLeft className="w-4 h-4 text-green-600" />
          Incoming
          {incomingPending > 0 && (
            <span className="bg-red-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full">{incomingPending}</span>
          )}
        </button>
        <button
          onClick={() => {
            setTab("outgoing");
            setFilter("all");
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all
            ${tab === "outgoing" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <ArrowUpRight className="w-4 h-4 text-blue-600" />
          Outgoing
        </button>
      </div>

      <div
        className={`rounded-xl px-4 py-3 text-sm border
        ${tab === "incoming" ? "bg-green-50 border-green-200 text-green-800" : "bg-blue-50  border-blue-200  text-blue-800"}`}
      >
        {tab === "incoming"
          ? "Other hospitals are requesting to send patients here. Review and accept or reject."
          : "These are transfers your hospital requested to other facilities. You can cancel a pending request."}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Filter:</span>
        {["all", "pending", "accepted", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize
              ${
                filter === f
                  ? f === "all"
                    ? "bg-slate-800 text-white"
                    : f === "pending"
                      ? "bg-yellow-500 text-white"
                      : f === "accepted"
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
              }`}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-100 p-10 text-center text-slate-500">Loading referrals...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map((ref) => {
            const sev = SEV[ref.severity] || SEV.moderate;
            const st = STATUS[ref.status] || STATUS.pending;
            const StatusIcon = st.icon;
            const isIncoming = tab === "incoming";

            return (
              <div
                key={ref.id}
                className={`bg-white rounded-xl shadow-sm border border-slate-100 border-l-4 ${sev.border} hover:shadow-md transition-all`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-400">{ref.id}</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {st.label}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800">{ref.patient}</h3>
                      {ref.age > 0 && <p className="text-xs text-slate-400">Age {ref.age}</p>}
                      <p className="text-sm font-semibold text-slate-600 mt-0.5">{ref.condition}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded flex-shrink-0 ${sev.badge}`}>{ref.severity.toUpperCase()}</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs font-semibold
                  ${isIncoming ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}
                  >
                    {isIncoming ? (
                      <>
                        <ArrowDownLeft className="w-3.5 h-3.5 flex-shrink-0" />
                        From: {ref.fromFacility || "External Facility"}
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />
                        To: {ref.toFacility || "External Facility"}
                      </>
                    )}
                  </div>

                  <div className="space-y-1.5 mb-4 text-xs">
                    {[
                      ["Reason", ref.reason],
                      ["Transport", ref.transport],
                      [isIncoming ? "Their Dr." : "Our Dr.", isIncoming ? `${ref.sendingDoctor || "-"} · ${ref.time}` : `${ref.ourDoctor || "-"} · ${ref.time}`],
                    ].map(([label, val]) => (
                      <div key={label} className="flex items-start gap-2">
                        <span className="text-slate-400 w-16 flex-shrink-0">{label}</span>
                        <span className="font-medium text-slate-700">{val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setModal({ ...ref, isIncoming })}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold transition-colors"
                    >
                      View Details
                    </button>
                    {isIncoming && ref.status === "pending" && (
                      <>
                        <button
                          onClick={() => accept(ref.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-bold transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => reject(ref.id, ref.patient)}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-2 rounded-lg text-xs font-bold transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {!isIncoming && ref.status === "pending" && (
                      <button
                        onClick={() => cancel(ref.id, ref.patient)}
                        className="flex-1 bg-slate-200 hover:bg-red-100 hover:text-red-700 text-slate-600 py-2 rounded-lg text-xs font-bold transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {!loading && displayed.length === 0 && (
            <div className="col-span-full bg-white rounded-xl border border-slate-100 p-16 text-center text-slate-400">
              <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No {filter !== "all" ? filter : ""} {tab} referrals</p>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className={`h-2 rounded-t-2xl ${modal.severity === "critical" ? "bg-red-500" : "bg-orange-500"}`} />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{modal.patient}</h3>
                  <p className="text-sm text-slate-500">
                    {modal.id} · {modal.condition}
                  </p>
                </div>
                <button onClick={() => setModal(null)}>
                  <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
                </button>
              </div>

              <div
                className={`flex items-center gap-2 mb-4 px-3 py-2.5 rounded-lg text-sm font-semibold border
                ${modal.isIncoming ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}
              >
                {modal.isIncoming ? (
                  <>
                    <ArrowDownLeft className="w-4 h-4" />
                    Incoming from {modal.fromFacility || "External Facility"}
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    Outgoing to {modal.toFacility || "External Facility"}
                  </>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {[
                  ["Condition", modal.condition],
                  ["Reason", modal.reason],
                  ["Severity", modal.severity.toUpperCase()],
                  ["Status", (STATUS[modal.status] || STATUS.pending).label],
                  ["Transport", modal.transport],
                  ["Time", modal.time],
                  [modal.isIncoming ? "Sending Dr." : "Our Dr.", modal.isIncoming ? modal.sendingDoctor || "-" : modal.ourDoctor || "-"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-400">{l}</span>
                    <span className="text-sm font-semibold text-slate-800">{v}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 text-sm text-slate-700">
                <p className="text-xs font-bold text-slate-500 mb-1">Clinical Notes</p>
                {modal.notes || "-"}
              </div>

              {modal.isIncoming && modal.status === "pending" && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => accept(modal.id)}
                    className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors"
                  >
                    Accept Patient
                  </button>
                  <button
                    onClick={() => reject(modal.id, modal.patient)}
                    className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
              {!modal.isIncoming && modal.status === "pending" && (
                <button
                  onClick={() => cancel(modal.id, modal.patient)}
                  className="w-full bg-slate-200 hover:bg-red-100 hover:text-red-700 text-slate-700 py-3 rounded-xl font-bold transition-colors"
                >
                  Cancel Transfer Request
                </button>
              )}
              {modal.status !== "pending" && (
                <div className={`text-center py-3 rounded-xl font-bold text-sm ${(STATUS[modal.status] || STATUS.pending).bg} ${(STATUS[modal.status] || STATUS.pending).text}`}>
                  This request has been {modal.status}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-teal-600 rounded-t-2xl px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">New Transfer Request</h3>
                <p className="text-teal-100 text-xs mt-0.5">Sending a patient to another facility</p>
              </div>
              <button onClick={() => setShowForm(false)}>
                <X className="w-5 h-5 text-white/70 hover:text-white" />
              </button>
            </div>

            <form onSubmit={submit} className="p-6 space-y-4">
              {[
                { label: "Patient Name *", key: "patient", placeholder: "Full name" },
                { label: "Destination Facility *", key: "toFacility", placeholder: "Hospital or specialist centre" },
                { label: "Patient Condition *", key: "condition", placeholder: "e.g. Severe Burns" },
                { label: "Reason for Transfer *", key: "reason", placeholder: "Why cannot we treat them here?" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none text-sm transition-colors"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Severity</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                    className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none text-sm"
                  >
                    <option value="critical">Critical</option>
                    <option value="urgent">Urgent</option>
                    <option value="moderate">Moderate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Transport</label>
                  <select
                    value={form.transport}
                    onChange={(e) => setForm({ ...form, transport: e.target.value })}
                    className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none text-sm"
                  >
                    <option>Ground Ambulance</option>
                    <option>Air Ambulance</option>
                    <option>Private Transport</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Clinical Notes</label>
                <textarea
                  value={form.notes}
                  rows={3}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Summary for the receiving facility"
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold transition-colors">
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
