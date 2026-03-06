import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationMap from './NavigationMap';
import EmergencyFacilities from './EmergencyFacilities';
import DispatchComms from './DispatchComms';

function AmbulanceDashboard() {
  const navigate = useNavigate();
  
  const [ambulance, setAmbulance] = useState({
    id: 'AMB-04',
    status: 'Active Duty',
    currentSpeed: 68,
    lat: -0.2827,
    lng: 36.0800,
  });

  const [navigation, setNavigation] = useState({
    nextManeuver: 'Continue onto Oak Avenue',
    distance: '400m',
    destinationName: 'Central General',
    timeToDestination: '4 min',
    distanceToDestination: '1.8 km',
  });

  const [trafficConditions, setTrafficConditions] = useState([
    { type: 'congestion', location: '5th & Main', status: 'red' },
    { type: 'clear', location: 'Express route clear via High St', status: 'green' },
  ]);

  // Patient data - editable
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    gender: '',
    medicalCondition: '',
    severity: '',
    estimatedTime: '',
    paramedicReport: '',
    vitals: {
      heartRate: '',
      bloodPressure: '',
      oxygenLevel: '',
      temperature: '',
      respiratoryRate: '',
    }
  });

  const [facilities, setFacilities] = useState([
    {
      id: 1,
      name: 'Central General',
      level: 'Level 1',
      beds: '4 beds avail.',
      wait: '12m',
      status: 'available',
    },
    {
      id: 2,
      name: 'City Medical Center',
      level: 'Level 2',
      beds: '0 beds avail.',
      wait: '45m',
      status: 'busy',
    },
    {
      id: 3,
      name: "St. Jude Children's",
      level: 'Specialty',
      beds: '12 beds avail.',
      wait: '5m',
      status: 'available',
    },
  ]);

  const [dispatchMessages, setDispatchMessages] = useState([
    {
      id: 1,
      sender: 'Dispatch',
      code: 'J-1402',
      message: 'Congestion on 5th Ave. Map rerouted via Oak Avenue.',
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: 2,
      sender: 'Central General',
      code: 'J-1258',
      message: 'ER prepped for REQ-001. Cardiac unit standby.',
      timestamp: new Date(Date.now() - 120000),
    },
  ]);

  const [incident] = useState({
    lat: -0.2900,
    lng: 36.0700,
  });

  const [hospital] = useState({
    name: 'Central General',
    lat: -0.3031,
    lng: 36.0800,
  });

  // Modal states
  const [showPatientCare, setShowPatientCare] = useState(false);
  const [showLiveVitals, setShowLiveVitals] = useState(false);

  const handleRadioDispatch = () => {
    console.log('Radio dispatch activated');
  };

  const handleLogout = () => {
    navigate('/login');
  };

  // Handle patient data changes
  const handlePatientDataChange = (field, value) => {
    setPatientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle vitals changes
  const handleVitalsChange = (field, value) => {
    setPatientData(prev => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [field]: value
      }
    }));
  };

  // Submit patient care data
  const handleSubmitPatientCare = () => {
    console.log('Patient Care Data Submitted:', patientData);
    alert('Patient care information saved successfully!');
    setShowPatientCare(false);
  };

  // Submit vitals data
  const handleSubmitVitals = () => {
    console.log('Vitals Data Submitted:', patientData.vitals);
    alert('Vital signs recorded successfully!');
    setShowLiveVitals(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative">

      {/* ========== SIMPLIFIED TOP HEADER ========== */}
      <header className="w-full bg-[#0a1628] flex justify-between items-center px-8 py-4 shadow-xl border-b border-blue-900/50 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
            U
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">UzimaNode</h1>
            <p className="text-xs text-blue-300 tracking-widest">AMBULANCE CREW DASHBOARD</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-sm text-white">
            Unit: <span className="text-red-400 font-semibold">{ambulance.id}</span>
            {' '}| Status:{' '}
            <span className="text-green-400 font-semibold">{ambulance.status}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="px-6 py-2.5 rounded-lg bg-red-600 border border-red-500 text-white font-semibold shadow-md hover:bg-red-700 transition-all text-sm"
          >
            🚪 Logout
          </button>
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <div className="grid lg:grid-cols-[3fr_1fr] gap-6 p-6 flex-1 relative z-0">

        {/* Left Column */}
        <div className="flex flex-col gap-6">

          {/* Navigation Card */}
          <div className="rounded-xl border border-gray-300 overflow-hidden shadow-lg flex-1 flex flex-col bg-white">
            <div className="px-6 py-4 border-b border-gray-300 flex justify-between items-center bg-gray-50">
              <h3 className="text-base font-semibold text-gray-800">🧭 Driver Navigation System</h3>
            </div>

            <NavigationMap
              ambulance={ambulance}
              incident={incident}
              hospital={hospital}
              navigation={navigation}
              currentSpeed={ambulance.currentSpeed}
            />

            {/* Traffic Feed */}
            <div className="px-6 py-4 border-t border-gray-300 bg-gray-50">
              <h4 className="text-xs text-gray-600 mb-3 tracking-wider font-semibold">
                LIVE TRAFFIC FEED
              </h4>
              <div className="flex flex-col gap-3">
                {trafficConditions.map((condition, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 px-4 py-3 bg-white rounded-lg text-sm border-l-4 ${
                      condition.status === 'red' ? 'border-red-500' : 'border-green-500'
                    } hover:bg-gray-50 transition-colors shadow-sm`}
                  >
                    <span className="text-lg">
                      {condition.status === 'red' ? '🔴' : '🟢'}
                    </span>
                    <span className="text-gray-700">
                      {condition.type === 'congestion'
                        ? `Congestion at ${condition.location}`
                        : condition.location}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ========== PATIENT CARE ACCESS BUTTON ========== */}
          <div className="rounded-xl border border-gray-300 overflow-hidden shadow-lg bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">🏥 Patient Information</h3>
                <p className="text-sm text-gray-500">Access patient care details and live vitals</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowPatientCare(true)}
                className="px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span className="text-2xl">👤</span>
                <span>Patient Care</span>
              </button>
              <button
                onClick={() => setShowLiveVitals(true)}
                className="px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span className="text-2xl">💓</span>
                <span>Live Vitals</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <EmergencyFacilities facilities={facilities} />
          <DispatchComms
            messages={dispatchMessages}
            onRadioDispatch={handleRadioDispatch}
          />
        </div>
      </div>

      {/* ========== PATIENT CARE FORM MODAL ========== */}
      {showPatientCare && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-[9998]"
            onClick={() => setShowPatientCare(false)}
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
              <div className="px-6 py-4 border-b border-gray-300 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                <h3 className="text-xl font-bold text-gray-800">🏥 Patient Care Form</h3>
                <button
                  onClick={() => setShowPatientCare(false)}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none hover:bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center transition-all"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Name *</label>
                    <input
                      type="text"
                      value={patientData.name}
                      onChange={(e) => handlePatientDataChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter patient name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Medical Condition *</label>
                    <input
                      type="text"
                      value={patientData.medicalCondition}
                      onChange={(e) => handlePatientDataChange('medicalCondition', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Cardiac Arrest"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Severity *</label>
                    <select
                      value={patientData.severity}
                      onChange={(e) => handlePatientDataChange('severity', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select severity</option>
                      <option value="Critical">Critical</option>
                      <option value="Severe">Severe</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Mild">Mild</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Time to Hospital</label>
                    <input
                      type="text"
                      value={patientData.estimatedTime}
                      onChange={(e) => handlePatientDataChange('estimatedTime', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 4 min"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                    <input
                      type="number"
                      value={patientData.age}
                      onChange={(e) => handlePatientDataChange('age', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter age"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                    <select
                      value={patientData.gender}
                      onChange={(e) => handlePatientDataChange('gender', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">📋 Paramedic Report *</label>
                  <textarea
                    value={patientData.paramedicReport}
                    onChange={(e) => handlePatientDataChange('paramedicReport', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    placeholder="Describe patient condition, treatments administered, and observations..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowPatientCare(false)}
                    className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitPatientCare}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md"
                  >
                    Save Patient Information
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========== LIVE VITALS FORM MODAL ========== */}
      {showLiveVitals && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-[9998]"
            onClick={() => setShowLiveVitals(false)}
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
              <div className="px-6 py-4 border-b border-gray-300 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                <h3 className="text-xl font-bold text-gray-800">💓 Record Vital Signs</h3>
                <button
                  onClick={() => setShowLiveVitals(false)}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none hover:bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center transition-all"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <label className="block text-sm font-semibold text-red-600 mb-2">❤️ Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={patientData.vitals.heartRate}
                      onChange={(e) => handleVitalsChange('heartRate', e.target.value)}
                      className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., 72"
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <label className="block text-sm font-semibold text-blue-600 mb-2">🩺 Blood Pressure (mmHg)</label>
                    <input
                      type="text"
                      value={patientData.vitals.bloodPressure}
                      onChange={(e) => handleVitalsChange('bloodPressure', e.target.value)}
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 120/80"
                    />
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <label className="block text-sm font-semibold text-green-600 mb-2">🫁 Oxygen Level (%)</label>
                    <input
                      type="number"
                      value={patientData.vitals.oxygenLevel}
                      onChange={(e) => handleVitalsChange('oxygenLevel', e.target.value)}
                      className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 98"
                    />
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <label className="block text-sm font-semibold text-orange-600 mb-2">🌡️ Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={patientData.vitals.temperature}
                      onChange={(e) => handleVitalsChange('temperature', e.target.value)}
                      className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g., 37.2"
                    />
                  </div>

                  <div className="col-span-2 bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <label className="block text-sm font-semibold text-purple-600 mb-2">💨 Respiratory Rate (breaths/min)</label>
                    <input
                      type="number"
                      value={patientData.vitals.respiratoryRate}
                      onChange={(e) => handleVitalsChange('respiratoryRate', e.target.value)}
                      className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 16"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowLiveVitals(false)}
                    className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitVitals}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-md"
                  >
                    Record Vital Signs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AmbulanceDashboard;