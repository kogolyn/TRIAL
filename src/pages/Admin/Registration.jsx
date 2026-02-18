import React, { useState } from 'react';
import {
  Building2,
  Ambulance,
  CheckCheck,
  FileText,
  Upload
} from 'lucide-react';

const Registration = () => {
  const [activeTab, setActiveTab] = useState('hospital');

  const emergencyServices = [
    'Emergency Room', 'ICU', 'Trauma Center', 'Burn Unit',
    'Cardiac Care', 'Maternity', 'Pediatric Emergency', 'Surgery'
  ];

  const ambulanceEquipment = [
    'Defibrillator', 'Oxygen Supply', 'Ventilator', 'Stretcher',
    'First Aid Kit', 'Spine Board', 'IV Equipment', 'Cardiac Monitor'
  ];

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

          <form className="space-y-6">
            {/* Facility Information */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-bold text-blue-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Facility Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Facility Name" placeholder="e.g., Kenyatta National Hospital" required />
                <FormSelect
                  label="Facility Type"
                  options={['Public Hospital', 'Private Hospital', 'Clinic', 'Medical Center']}
                  required
                />
                <FormInput label="License Number" placeholder="e.g., MED-2024-001" required />
                <FormInput label="County" placeholder="e.g., Nairobi" required />
                <FormInput label="Address" placeholder="Complete address" required className="md:col-span-2" />
                <FormInput label="GPS Coordinates" placeholder="e.g., -1.2921, 36.8219" />
              </div>
            </div>

            {/* Capacity Information */}
            <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl p-6 border border-green-200">
              <h4 className="font-bold text-green-900 mb-4">Capacity & Resources</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput label="Total Beds" type="number" placeholder="e.g., 150" required />
                <FormInput label="ICU Beds" type="number" placeholder="e.g., 20" required />
                <FormInput label="Emergency Beds" type="number" placeholder="e.g., 30" required />
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200">
              <h4 className="font-bold text-purple-900 mb-4">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Contact Person" placeholder="Full name" required />
                <FormInput label="Phone Number" type="tel" placeholder="+254 7XX XXX XXX" required />
                <FormInput label="Email Address" type="email" placeholder="contact@hospital.ke" required className="md:col-span-2" />
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
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{service}</span>
                  </label>
                ))}
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
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2"
              >
                <CheckCheck className="w-5 h-5" />
                <span>Submit Registration</span>
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

          <form className="space-y-6">
            {/* Vehicle Information */}
            <div className="bg-gradient-to-r from-red-50 to-red-100/50 rounded-xl p-6 border border-red-200">
              <h4 className="font-bold text-red-900 mb-4 flex items-center">
                <Ambulance className="w-5 h-5 mr-2" />
                Vehicle Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Plate Number" placeholder="e.g., KBZ 123A" required />
                <FormInput label="Vehicle Model" placeholder="e.g., Toyota Land Cruiser" required />
                <FormInput label="Year of Manufacture" type="number" placeholder="e.g., 2022" required />
                <FormInput label="GPS Tracking ID" placeholder="Device ID or tracking code" />
              </div>
            </div>

            {/* Operator Information */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-bold text-blue-900 mb-4">Operator Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Operator Name" placeholder="e.g., Kenya Red Cross" required />
                <FormInput label="Operator License Number" placeholder="License/Registration number" required />
                <FormInput label="Contact Phone" type="tel" placeholder="+254 7XX XXX XXX" required />
                <FormInput label="Contact Email" type="email" placeholder="operator@emergency.ke" required />
              </div>
            </div>

            {/* Staff Information */}
            <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl p-6 border border-green-200">
              <h4 className="font-bold text-green-900 mb-4">Staff Credentials</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Driver Name" placeholder="Full name" required />
                <FormInput label="Driver License Number" placeholder="License number" required />
                <FormInput label="Paramedic Name" placeholder="Full name" required />
                <FormInput label="Paramedic Certificate Number" placeholder="Certificate number" required />
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
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2"
              >
                <CheckCheck className="w-5 h-5" />
                <span>Submit Registration</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// Reusable form components
const FormInput = ({ label, type = 'text', placeholder, required, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
    />
  </div>
);

const FormSelect = ({ label, options, required, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
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

export default Registration;