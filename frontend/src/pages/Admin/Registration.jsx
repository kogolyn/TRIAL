import React, { useState } from 'react';
import {
  Building2,
  Ambulance,
  CheckCheck,
  FileText,
  Upload
} from 'lucide-react';
import { api } from "../../lib/api";

const Registration = () => {
  const [activeTab, setActiveTab] = useState('hospital');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [bedRows, setBedRows] = useState([
    { department: "Emergency Room", total: 12, available: 4 },
  ]);
  const [equipmentRows, setEquipmentRows] = useState([
    { name: "Ventilators", category: "ventilator", totalQuantity: 8, availableQuantity: 3 },
  ]);
  const [bloodRows, setBloodRows] = useState([
    { bloodType: "O+", unitsAvailable: 12, minimumThreshold: 5 },
  ]);

  const emergencyServices = [
    'Emergency Room', 'ICU', 'Trauma Center', 'Burn Unit',
    'Cardiac Care', 'Maternity', 'Pediatric Emergency', 'Surgery'
  ];

  const ambulanceEquipment = [
    'Defibrillator', 'Oxygen Supply', 'Ventilator', 'Stretcher',
    'First Aid Kit', 'Spine Board', 'IV Equipment', 'Cardiac Monitor'
  ];

  const handleHospitalSubmit = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    setMessage(null);
    setLoading(true);
    try {
      const form = new FormData(formEl);
      const payload = {
        facilityName: form.get("facilityName") || "",
        facilityType: form.get("facilityType") || "",
        licenseNumber: form.get("licenseNumber") || "",
        county: form.get("county") || "",
        address: form.get("address") || "",
        gps: form.get("gps") || "",
        totalBeds: form.get("totalBeds") || 0,
        icuBeds: form.get("icuBeds") || 0,
        emergencyBeds: form.get("emergencyBeds") || 0,
        contactPerson: form.get("contactPerson") || "",
        contactPhone: form.get("contactPhone") || "",
        contactEmail: form.get("contactEmail") || "",
        services: form.getAll("services"),
        resources: {
          beds: bedRows.filter((b) => b.department),
          equipment: equipmentRows.filter((e) => e.name),
          blood: bloodRows.filter((b) => b.bloodType),
        },
      };
      await api.post("/admin/registrations/hospital", payload);
      setMessage({ type: "success", text: "Hospital registration submitted." });
      if (formEl) formEl.reset();
      setBedRows([{ department: "Emergency Room", total: 12, available: 4 }]);
      setEquipmentRows([{ name: "Ventilators", category: "ventilator", totalQuantity: 8, availableQuantity: 3 }]);
      setBloodRows([{ bloodType: "O+", unitsAvailable: 12, minimumThreshold: 5 }]);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to submit." });
    } finally {
      setLoading(false);
    }
  };

  const handleAmbulanceSubmit = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    setMessage(null);
    setLoading(true);
    try {
      const form = new FormData(formEl);
      const payload = {
        plateNumber: form.get("plateNumber") || "",
        vehicleModel: form.get("vehicleModel") || "",
        year: form.get("year") || 0,
        gpsId: form.get("gpsId") || "",
        operatorName: form.get("operatorName") || "",
        operatorLicense: form.get("operatorLicense") || "",
        contactPhone: form.get("operatorPhone") || "",
        contactEmail: form.get("operatorEmail") || "",
        driverName: form.get("driverName") || "",
        driverLicense: form.get("driverLicense") || "",
        paramedicName: form.get("paramedicName") || "",
        paramedicCert: form.get("paramedicCert") || "",
        equipment: form.getAll("equipment"),
      };
      await api.post("/admin/registrations/ambulance", payload);
      setMessage({ type: "success", text: "Ambulance registration submitted." });
      if (formEl) formEl.reset();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to submit." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('hospital')}
            className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === 'hospital'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span>Hospital Registration</span>
          </button>
          <button
            onClick={() => setActiveTab('ambulance')}
            className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === 'ambulance'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Ambulance className="w-5 h-5" />
            <span>Ambulance Registration</span>
          </button>
        </div>
      </div>

      {/* Hospital Registration Form */}
      {activeTab === 'hospital' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Register New Hospital</h3>
            <p className="text-gray-600">Complete all required fields to register a healthcare facility</p>
          </div>

          {message && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-semibold ${
              message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}>
              {message.text}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleHospitalSubmit}>
            {/* Facility Information */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-bold text-blue-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Facility Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Facility Name" name="facilityName" placeholder="e.g., Kenyatta National Hospital" required />
                <FormSelect
                  label="Facility Type"
                  name="facilityType"
                  options={['Public Hospital', 'Private Hospital', 'Clinic', 'Medical Center']}
                  required
                />
                <FormInput label="License Number" name="licenseNumber" placeholder="e.g., MED-2024-001" required />
                <FormInput label="County" name="county" placeholder="e.g., Nairobi" required />
                <FormInput label="Address" name="address" placeholder="Complete address" required className="md:col-span-2" />
                <FormInput label="GPS Coordinates" name="gps" placeholder="e.g., -1.2921, 36.8219" />
              </div>
            </div>

            {/* Capacity Information */}
            <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl p-6 border border-green-200">
              <h4 className="font-bold text-green-900 mb-4">Capacity & Resources</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput label="Total Beds" name="totalBeds" type="number" placeholder="e.g., 150" required />
                <FormInput label="ICU Beds" name="icuBeds" type="number" placeholder="e.g., 20" required />
                <FormInput label="Emergency Beds" name="emergencyBeds" type="number" placeholder="e.g., 30" required />
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200">
              <h4 className="font-bold text-purple-900 mb-4">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Contact Person" name="contactPerson" placeholder="Full name" required />
                <FormInput label="Phone Number" name="contactPhone" type="tel" placeholder="+254 7XX XXX XXX" required />
                <FormInput label="Email Address" name="contactEmail" type="email" placeholder="contact@hospital.ke" required className="md:col-span-2" />
              </div>
            </div>

            {/* Emergency Services */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl p-6 border border-amber-200">
              <h4 className="font-bold text-amber-900 mb-4">Emergency Services Available</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {emergencyServices.map((service) => (
                  <label key={service} className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="services"
                      value={service}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Resource Snapshot */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100/60 rounded-xl p-6 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-4">Resources Snapshot (Optional)</h4>
              <div className="space-y-5">
                <ResourceTable
                  title="Beds"
                  columns={["Department", "Total", "Available"]}
                  rows={bedRows}
                  onChange={(idx, field, value) => {
                    const next = bedRows.slice();
                    next[idx] = { ...next[idx], [field]: value };
                    setBedRows(next);
                  }}
                  onAdd={() => setBedRows([...bedRows, { department: "", total: 0, available: 0 }])}
                  onRemove={(idx) => setBedRows(bedRows.filter((_, i) => i !== idx))}
                  renderRow={(row, idx, onChange) => (
                    <>
                      <input
                        className="px-3 py-2 border rounded-lg text-sm"
                        value={row.department}
                        onChange={(e) => onChange(idx, "department", e.target.value)}
                        placeholder="Department"
                      />
                      <input
                        type="number"
                        className="px-3 py-2 border rounded-lg text-sm"
                        value={row.total}
                        onChange={(e) => onChange(idx, "total", Number(e.target.value))}
                        placeholder="Total"
                      />
                      <input
                        type="number"
                        className="px-3 py-2 border rounded-lg text-sm"
                        value={row.available}
                        onChange={(e) => onChange(idx, "available", Number(e.target.value))}
                        placeholder="Available"
                      />
                    </>
                  )}
                />

                <ResourceTable
                  title="Equipment"
                  columns={["Name", "Category", "Total", "Available"]}
                  rows={equipmentRows}
                  onChange={(idx, field, value) => {
                    const next = equipmentRows.slice();
                    next[idx] = { ...next[idx], [field]: value };
                    setEquipmentRows(next);
                  }}
                  onAdd={() =>
                    setEquipmentRows([
                      ...equipmentRows,
                      { name: "", category: "other", totalQuantity: 0, availableQuantity: 0 },
                    ])
                  }
                  onRemove={(idx) => setEquipmentRows(equipmentRows.filter((_, i) => i !== idx))}
                  renderRow={(row, idx, onChange) => (
                    <>
                      <input
                        className="px-3 py-2 border rounded-lg text-sm"
                        value={row.name}
                        onChange={(e) => onChange(idx, "name", e.target.value)}
                        placeholder="Equipment"
                      />
                      <input
                        className="px-3 py-2 border rounded-lg text-sm"
                        value={row.category}
                        onChange={(e) => onChange(idx, "category", e.target.value)}
                        placeholder="Category"
                      />
                      <input
                        type="number"
                        className="px-3 py-2 border rounded-lg text-sm"
                        value={row.totalQuantity}
                        onChange={(e) => onChange(idx, "totalQuantity", Number(e.target.value))}
                        placeholder="Total"
                      />
                      <input
                        type="number"
                        className="px-3 py-2 border rounded-lg text-sm"
                        value={row.availableQuantity}
                        onChange={(e) => onChange(idx, "availableQuantity", Number(e.target.value))}
                        placeholder="Available"
                      />
                    </>
                  )}
                />

                <ResourceTable
                  title="Blood Bank"
                  columns={["Type", "Units", "Min"]}
                  rows={bloodRows}
                  onChange={(idx, field, value) => {
                    const next = bloodRows.slice();
                    next[idx] = { ...next[idx], [field]: value };
                    setBloodRows(next);
                  }}
                  onAdd={() => setBloodRows([...bloodRows, { bloodType: "", unitsAvailable: 0, minimumThreshold: 0 }])}
                  onRemove={(idx) => setBloodRows(bloodRows.filter((_, i) => i !== idx))}
                  renderRow={(row, idx, onChange) => (
                    <>
                      <input
                        className="px-3 py-2 border rounded-lg text-sm"
                        value={row.bloodType}
                        onChange={(e) => onChange(idx, "bloodType", e.target.value)}
                        placeholder="Type"
                      />
                      <input
                        type="number"
                        className="px-3 py-2 border rounded-lg text-sm"
                        value={row.unitsAvailable}
                        onChange={(e) => onChange(idx, "unitsAvailable", Number(e.target.value))}
                        placeholder="Units"
                      />
                      <input
                        type="number"
                        className="px-3 py-2 border rounded-lg text-sm"
                        value={row.minimumThreshold}
                        onChange={(e) => onChange(idx, "minimumThreshold", Number(e.target.value))}
                        placeholder="Min"
                      />
                    </>
                  )}
                />
              </div>
            </div>

            {/* Document Upload */}
            <div className="bg-gradient-to-r from-red-50 to-red-100/50 rounded-xl p-6 border border-red-200">
              <h4 className="font-bold text-red-900 mb-4">Required Documents</h4>
              <div className="space-y-3">
                <FileUpload label="Medical License" />
                <FileUpload label="Facility Registration Certificate" />
                <FileUpload label="Insurance Certificate" />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2"
              >
                <CheckCheck className="w-5 h-5" />
                <span>{loading ? "Submitting..." : "Submit Registration"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ambulance Registration Form */}
      {activeTab === 'ambulance' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Register New Ambulance</h3>
            <p className="text-gray-600">Complete all required fields to register an emergency vehicle</p>
          </div>

          {message && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-semibold ${
              message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}>
              {message.text}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleAmbulanceSubmit}>
            {/* Vehicle Information */}
            <div className="bg-gradient-to-r from-red-50 to-red-100/50 rounded-xl p-6 border border-red-200">
              <h4 className="font-bold text-red-900 mb-4 flex items-center">
                <Ambulance className="w-5 h-5 mr-2" />
                Vehicle Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Plate Number" name="plateNumber" placeholder="e.g., KBZ 123A" required />
                <FormInput label="Vehicle Model" name="vehicleModel" placeholder="e.g., Toyota Land Cruiser" required />
                <FormInput label="Year of Manufacture" name="year" type="number" placeholder="e.g., 2022" required />
                <FormInput label="GPS Tracking ID" name="gpsId" placeholder="Device ID or tracking code" />
              </div>
            </div>

            {/* Operator Information */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-bold text-blue-900 mb-4">Operator Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Operator Name" name="operatorName" placeholder="e.g., Kenya Red Cross" required />
                <FormInput label="Operator License Number" name="operatorLicense" placeholder="License/Registration number" required />
                <FormInput label="Contact Phone" name="operatorPhone" type="tel" placeholder="+254 7XX XXX XXX" required />
                <FormInput label="Contact Email" name="operatorEmail" type="email" placeholder="operator@emergency.ke" required />
              </div>
            </div>

            {/* Staff Information */}
            <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl p-6 border border-green-200">
              <h4 className="font-bold text-green-900 mb-4">Staff Credentials</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Driver Name" name="driverName" placeholder="Full name" required />
                <FormInput label="Driver License Number" name="driverLicense" placeholder="License number" required />
                <FormInput label="Paramedic Name" name="paramedicName" placeholder="Full name" required />
                <FormInput label="Paramedic Certificate Number" name="paramedicCert" placeholder="Certificate number" required />
              </div>
            </div>

            {/* Equipment */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200">
              <h4 className="font-bold text-purple-900 mb-4">Medical Equipment On Board</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ambulanceEquipment.map((equipment) => (
                  <label key={equipment} className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="equipment"
                      value={equipment}
                      className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{equipment}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Document Upload */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl p-6 border border-amber-200">
              <h4 className="font-bold text-amber-900 mb-4">Required Documents</h4>
              <div className="space-y-3">
                <FileUpload label="Vehicle Registration (Logbook)" />
                <FileUpload label="Insurance Certificate" />
                <FileUpload label="Driver License" />
                <FileUpload label="Paramedic Certification" />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2"
              >
                <CheckCheck className="w-5 h-5" />
                <span>{loading ? "Submitting..." : "Submit Registration"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// Reusable form components
const FormInput = ({ label, name, type = 'text', placeholder, required, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
    />
  </div>
);

const FormSelect = ({ label, name, options, required, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      required={required}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const FileUpload = ({ label }) => (
  <div className="flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-all duration-200 group cursor-pointer">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
        <FileText className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
      </div>
      <div>
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
      </div>
    </div>
    <button
      type="button"
      className="px-4 py-2 bg-gray-100 hover:bg-blue-500 hover:text-white rounded-lg font-semibold text-sm transition-all duration-200 flex items-center space-x-2"
    >
      <Upload className="w-4 h-4" />
      <span>Upload</span>
    </button>
  </div>
);

const ResourceTable = ({ title, columns, rows, onAdd, onRemove, onChange, renderRow }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <p className="font-semibold text-slate-800">{title}</p>
      <button
        type="button"
        onClick={onAdd}
        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
      >
        + Add
      </button>
    </div>
    <div className="grid grid-cols-1 gap-3">
      {rows.map((row, idx) => (
        <div key={`${title}-${idx}`} className={`grid gap-3 ${
          columns.length === 3 ? "md:grid-cols-4" : "md:grid-cols-5"
        }`}>
          {renderRow(row, idx, onChange)}
          <button
            type="button"
            onClick={() => onRemove(idx)}
            className="px-3 py-2 border rounded-lg text-sm text-red-600 hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default Registration;
