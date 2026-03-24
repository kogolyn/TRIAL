import React, { useEffect, useState } from "react";
import { Building2, Plus, Save, Trash2 } from "lucide-react";
import { api } from "../../lib/api";

const DEFAULT_BEDS = [
  { department: "Emergency Room", total: 12, available: 4 },
  { department: "ICU", total: 10, available: 2 },
  { department: "Trauma Bay", total: 3, available: 1 },
  { department: "Operating Room", total: 5, available: 2 },
  { department: "Neuro Bay", total: 2, available: 1 },
  { department: "Pediatric", total: 8, available: 5 },
];

const DEFAULT_EQUIPMENT = [
  { name: "Ventilators", category: "ventilator", totalQuantity: 8, availableQuantity: 3 },
  { name: "CT Scanner", category: "imaging", totalQuantity: 2, availableQuantity: 1 },
];

const DEFAULT_BLOOD = [
  { bloodType: "O+", unitsAvailable: 12, minimumThreshold: 5 },
  { bloodType: "A+", unitsAvailable: 9, minimumThreshold: 5 },
];

const Resources = () => {
  const [hospitals, setHospitals] = useState([]);
  const [selected, setSelected] = useState("");
  const [beds, setBeds] = useState(DEFAULT_BEDS);
  const [equipment, setEquipment] = useState(DEFAULT_EQUIPMENT);
  const [blood, setBlood] = useState(DEFAULT_BLOOD);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    api.get("/admin/hospitals")
      .then((rows) => {
        if (!active) return;
        if (Array.isArray(rows)) {
          setHospitals(rows);
          if (!selected && rows[0]?.id) {
            setSelected(rows[0].id);
          }
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const updateBed = (idx, field, value) => {
    const next = beds.slice();
    next[idx] = { ...next[idx], [field]: value };
    setBeds(next);
  };

  const updateEquipment = (idx, field, value) => {
    const next = equipment.slice();
    next[idx] = { ...next[idx], [field]: value };
    setEquipment(next);
  };

  const updateBlood = (idx, field, value) => {
    const next = blood.slice();
    next[idx] = { ...next[idx], [field]: value };
    setBlood(next);
  };

  const submit = async () => {
    if (!selected) {
      setStatus({ type: "error", text: "Select a hospital first." });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      await api.patch(`/admin/hospitals/${selected}/resources`, {
        beds,
        equipment,
        blood,
      });
      setStatus({ type: "success", text: "Resources updated." });
    } catch (error) {
      setStatus({ type: "error", text: error.message || "Failed to update." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Hospital Resources</h3>
            <p className="text-sm text-gray-600">Set beds, equipment, and blood for a specific hospital</p>
          </div>
          <div className="flex items-center gap-3">
            <Building2 className="w-4 h-4 text-gray-500" />
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        </div>
        {status && (
          <div className={`mt-4 text-sm font-semibold px-4 py-3 rounded-lg ${
            status.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}>
            {status.text}
          </div>
        )}
      </div>

      <Section title="Beds">
        {beds.map((row, idx) => (
          <div key={`${row.department}-${idx}`} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              className="px-3 py-2 border rounded-lg text-sm"
              value={row.department}
              onChange={(e) => updateBed(idx, "department", e.target.value)}
              placeholder="Department"
            />
            <input
              type="number"
              className="px-3 py-2 border rounded-lg text-sm"
              value={row.total}
              onChange={(e) => updateBed(idx, "total", Number(e.target.value))}
              placeholder="Total"
            />
            <input
              type="number"
              className="px-3 py-2 border rounded-lg text-sm"
              value={row.available}
              onChange={(e) => updateBed(idx, "available", Number(e.target.value))}
              placeholder="Available"
            />
            <button
              className="px-3 py-2 border rounded-lg text-sm text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
              onClick={() => setBeds(beds.filter((_, i) => i !== idx))}
            >
              <Trash2 className="w-4 h-4" /> Remove
            </button>
          </div>
        ))}
        <button
          className="mt-3 px-4 py-2 bg-gray-100 rounded-lg text-sm font-semibold flex items-center gap-2"
          onClick={() => setBeds([...beds, { department: "", total: 0, available: 0 }])}
        >
          <Plus className="w-4 h-4" /> Add Bed Group
        </button>
      </Section>

      <Section title="Equipment">
        {equipment.map((row, idx) => (
          <div key={`${row.name}-${idx}`} className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              className="px-3 py-2 border rounded-lg text-sm"
              value={row.name}
              onChange={(e) => updateEquipment(idx, "name", e.target.value)}
              placeholder="Name"
            />
            <input
              className="px-3 py-2 border rounded-lg text-sm"
              value={row.category}
              onChange={(e) => updateEquipment(idx, "category", e.target.value)}
              placeholder="Category"
            />
            <input
              type="number"
              className="px-3 py-2 border rounded-lg text-sm"
              value={row.totalQuantity}
              onChange={(e) => updateEquipment(idx, "totalQuantity", Number(e.target.value))}
              placeholder="Total"
            />
            <input
              type="number"
              className="px-3 py-2 border rounded-lg text-sm"
              value={row.availableQuantity}
              onChange={(e) => updateEquipment(idx, "availableQuantity", Number(e.target.value))}
              placeholder="Available"
            />
            <button
              className="px-3 py-2 border rounded-lg text-sm text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
              onClick={() => setEquipment(equipment.filter((_, i) => i !== idx))}
            >
              <Trash2 className="w-4 h-4" /> Remove
            </button>
          </div>
        ))}
        <button
          className="mt-3 px-4 py-2 bg-gray-100 rounded-lg text-sm font-semibold flex items-center gap-2"
          onClick={() => setEquipment([...equipment, { name: "", category: "other", totalQuantity: 0, availableQuantity: 0 }])}
        >
          <Plus className="w-4 h-4" /> Add Equipment
        </button>
      </Section>

      <Section title="Blood Bank">
        {blood.map((row, idx) => (
          <div key={`${row.bloodType}-${idx}`} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              className="px-3 py-2 border rounded-lg text-sm"
              value={row.bloodType}
              onChange={(e) => updateBlood(idx, "bloodType", e.target.value)}
              placeholder="Type"
            />
            <input
              type="number"
              className="px-3 py-2 border rounded-lg text-sm"
              value={row.unitsAvailable}
              onChange={(e) => updateBlood(idx, "unitsAvailable", Number(e.target.value))}
              placeholder="Units"
            />
            <input
              type="number"
              className="px-3 py-2 border rounded-lg text-sm"
              value={row.minimumThreshold}
              onChange={(e) => updateBlood(idx, "minimumThreshold", Number(e.target.value))}
              placeholder="Min"
            />
            <button
              className="px-3 py-2 border rounded-lg text-sm text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
              onClick={() => setBlood(blood.filter((_, i) => i !== idx))}
            >
              <Trash2 className="w-4 h-4" /> Remove
            </button>
          </div>
        ))}
        <button
          className="mt-3 px-4 py-2 bg-gray-100 rounded-lg text-sm font-semibold flex items-center gap-2"
          onClick={() => setBlood([...blood, { bloodType: "", unitsAvailable: 0, minimumThreshold: 0 }])}
        >
          <Plus className="w-4 h-4" /> Add Blood Type
        </button>
      </Section>

      <div className="flex justify-end">
        <button
          onClick={submit}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Resources"}
        </button>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
    <h4 className="text-lg font-bold text-gray-900">{title}</h4>
    {children}
  </div>
);

export default Resources;
