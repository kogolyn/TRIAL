import React, { useState, useEffect } from 'react';

function PatientCare({ patientCare }) {
  const [vitals, setVitals] = useState({
    heartRate: 78,
    bloodPressure: '120/80',
    oxygen: 98,
    temperature: 37.2,
    respiratory: 16,
  });

  const [treatments, setTreatments] = useState([
    { id: 1, name: 'Oxygen administered', time: '14:32', completed: true },
    { id: 2, name: 'IV line established', time: '14:35', completed: true },
    { id: 3, name: 'Monitor vitals q5min', time: '14:40', completed: false },
  ]);

  const [activeTab, setActiveTab] = useState('details');

  const [extraInfo, setExtraInfo] = useState({
    condition: '',
    severity: '',
    eta: '',
    ambulance: '',
    paramedicUnit: '',
    roomAssignment: '',
    notes: ''
  });

  const [patientInfo, setPatientInfo] = useState({
    name: patientCare.name || '',
    age: patientCare.age || '',
    sex: patientCare.sex || '',
    address: patientCare.address || '',
    contact: patientCare.contact || '',
    symptoms: patientCare.symptoms || '',
    allergies: patientCare.allergies || '',
  });

  useEffect(() => {
    setPatientInfo({
      name: patientCare.name ?? '',
      age: patientCare.age ?? '',
      sex: patientCare.sex ?? '',
      address: patientCare.address ?? '',
      contact: patientCare.contact ?? '',
      symptoms: patientCare.symptoms ?? '',
      allergies: patientCare.allergies ?? '',
    });
  }, [patientCare]);

  const handleVitalsChange = (e) => {
    const { name, value } = e.target;
    setVitals((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white">
      <div className="px-6 py-4 flex items-center gap-4 bg-rose-500 text-white font-semibold">
        <div className="text-xl">⚠️</div>
        <div className="flex-1">PATIENT CARE <span className="ml-2 text-sm">({patientCare.status})</span></div>
        <div className="bg-white/20 px-3 py-1 rounded text-sm">{patientCare.requestId}</div>
      </div>

      <div className="flex bg-slate-800 border-b border-slate-700">
        <button
          className={`w-1/2 text-sm font-semibold py-3 ${activeTab === 'details' ? 'bg-slate-900 text-white border-b-2 border-rose-500' : 'text-slate-300'}`}
          onClick={() => setActiveTab('details')}
        >
          PATIENT DETAILS
        </button>
        <button
          className={`w-1/2 text-sm font-semibold py-3 ${activeTab === 'vitals' ? 'bg-slate-900 text-white border-b-2 border-rose-500' : 'text-slate-300'}`}
          onClick={() => setActiveTab('vitals')}
        >
          LIVE VITALS
        </button>
      </div>

      <div className="px-6 py-4 border-b border-slate-200">
        <div className="">
          {activeTab === 'details' ? (
            <div>
              <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Patient Details</h4>

              <div>
                <div className="mb-4">
                  <label className="block text-sm text-slate-500 mb-1">Name</label>
                  <input
                    className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900"
                    value={patientInfo.name}
                    onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                    placeholder=""
                  />
                </div>

                <div className="flex gap-4 mb-4">
                  <div className="w-28">
                    <label className="block text-sm text-slate-500 mb-1">Age</label>
                    <input className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900" value={patientInfo.age} onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })} />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm text-slate-500 mb-1">Sex</label>
                    <select className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900" value={patientInfo.sex} onChange={(e) => setPatientInfo({ ...patientInfo, sex: e.target.value })}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-slate-500 mb-1">Medical condition</label>
                  <input className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900" name="condition" value={extraInfo.condition} onChange={(e) => setExtraInfo({ ...extraInfo, condition: e.target.value })} placeholder="Medical condition" />
                </div>

                <div className="flex gap-4 mb-4">
                  <div className="w-40">
                    <label className="block text-sm text-slate-500 mb-1">Severity</label>
                    <select className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900" name="severity" value={extraInfo.severity} onChange={(e) => setExtraInfo({ ...extraInfo, severity: e.target.value })}>
                      <option value="">Select</option>
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="SEVERE">SEVERE</option>
                      <option value="MODERATE">MODERATE</option>
                      <option value="STABLE">STABLE</option>
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm text-slate-500 mb-1">Estimated time of arrival</label>
                    <input className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900" name="eta" value={extraInfo.eta} onChange={(e) => setExtraInfo({ ...extraInfo, eta: e.target.value })} placeholder="Estimated time of arrival" />
                  </div>
                </div>

                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm text-slate-500 mb-1">Ambulance ID</label>
                    <input className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900" name="ambulance" value={extraInfo.ambulance} onChange={(e) => setExtraInfo({ ...extraInfo, ambulance: e.target.value })} placeholder="Ambulance ID" />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm text-slate-500 mb-1">Paramedic unit</label>
                    <input className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900" name="paramedicUnit" value={extraInfo.paramedicUnit} onChange={(e) => setExtraInfo({ ...extraInfo, paramedicUnit: e.target.value })} placeholder="Paramedic unit" />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-slate-500 mb-1">Room assignment</label>
                  <input className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900" name="roomAssignment" value={extraInfo.roomAssignment} onChange={(e) => setExtraInfo({ ...extraInfo, roomAssignment: e.target.value })} placeholder="Room assignment" />
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-slate-500 mb-1">Paramedic notes</label>
                  <textarea className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900" name="notes" rows="3" value={extraInfo.notes} onChange={(e) => setExtraInfo({ ...extraInfo, notes: e.target.value })} placeholder="Enter paramedic notes" />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Live Vitals</h4>
              <div>
                <div className="flex gap-4">
                  <div className="w-40">
                    <label className="block text-sm text-slate-500 mb-1">Heart rate</label>
                    <input className="w-full p-2 rounded border border-slate-300 text-red-600 font-bold" name="heartRate" value={vitals.heartRate} onChange={handleVitalsChange} />
                    <small className="text-xs text-slate-500">bpm</small>
                  </div>

                  <div className="w-44">
                    <label className="block text-sm text-slate-500 mb-1">Blood pressure</label>
                    <input className="w-full p-2 rounded border border-slate-300 text-blue-600 font-bold" name="bloodPressure" value={vitals.bloodPressure} onChange={handleVitalsChange} />
                    <small className="text-xs text-slate-500">mmHg</small>
                  </div>

                  <div className="w-32">
                    <label className="block text-sm text-slate-500 mb-1">O₂ Sat</label>
                    <input className="w-full p-2 rounded border border-slate-300 text-green-600 font-bold" name="oxygen" value={vitals.oxygen} onChange={handleVitalsChange} />
                    <small className="text-xs text-slate-500">%</small>
                  </div>

                  <div className="w-32">
                    <label className="block text-sm text-slate-500 mb-1">Temperature</label>
                    <input className="w-full p-2 rounded border border-slate-300 text-yellow-600 font-bold" name="temperature" value={vitals.temperature} onChange={handleVitalsChange} />
                    <small className="text-xs text-slate-500">°C</small>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Treatment Checklist */}
      <div className="p-6">
        <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
          Treatment Checklist
        </h4>
        <div className="space-y-2">
          {treatments.map((treatment) => (
            <div
              key={treatment.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                treatment.completed
                  ? 'bg-green-900/20 border-green-600/50'
                  : 'bg-card-bg border-border-dark hover:bg-gray-800'
              }`}
            >
              <input
                type="checkbox"
                checked={treatment.completed}
                onChange={() => {
                  setTreatments(treatments.map(t =>
                    t.id === treatment.id ? { ...t, completed: !t.completed } : t
                  ));
                }}
                className="w-5 h-5 rounded border-gray-600 text-green-600 focus:ring-green-500 focus:ring-offset-gray-800 cursor-pointer"
              />
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  treatment.completed ? 'text-gray-400 line-through' : 'text-white'
                }`}>
                  {treatment.name}
                </p>
                <p className="text-xs text-gray-500">{treatment.time}</p>
              </div>
              {treatment.completed && (
                <span className="text-green-500 text-xl">✓</span>
              )}
            </div>
          ))}
        </div>

        <button className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
          <span>➕</span>
          <span>Add Treatment</span>
        </button>
      </div>
    </div>
  );
}

export default PatientCare;