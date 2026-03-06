import React from 'react';

function PatientCare({ patientData }) {
  if (!patientData || !patientData.name) {
    return (
      <div className="rounded-xl border border-gray-300 shadow-lg bg-white p-8 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h4 className="text-xl font-bold text-gray-800 mb-2">No Patient Data</h4>
        <p className="text-gray-600">Patient information has not been recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white">
      <div className="px-6 py-4 bg-blue-600 text-white">
        <h3 className="text-lg font-semibold">🏥 Patient Care</h3>
      </div>

      <div className="p-6">
        {/* Patient Information */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Patient Name</p>
            <p className="text-lg font-bold text-gray-800">{patientData.name}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Medical Condition</p>
            <p className="text-lg font-bold text-gray-800">{patientData.medicalCondition}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-xs text-red-600 mb-1">Severity</p>
            <p className="text-lg font-bold text-red-600">{patientData.severity}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-600 mb-1">ETA to Hospital</p>
            <p className="text-lg font-bold text-blue-600">{patientData.estimatedTime}</p>
          </div>
        </div>

        {/* Paramedic Report */}
        {patientData.paramedicReport && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">📋 Paramedic Report</h4>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">{patientData.paramedicReport}</p>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4">
          {patientData.age && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Age</p>
              <p className="text-lg font-bold text-gray-800">{patientData.age} years</p>
            </div>
          )}
          {patientData.gender && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Gender</p>
              <p className="text-lg font-bold text-gray-800">{patientData.gender}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientCare;