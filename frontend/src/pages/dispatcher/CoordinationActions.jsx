import React, { useState, useRef, useEffect } from 'react';

const nakuruAmbulances = [
    { id: 'AMB-001', name: 'AMB-001 – Nakuru War Memorial', status: 'Available' },
    { id: 'AMB-002', name: 'AMB-002 – Rift Valley PGH', status: 'Available' },
    { id: 'AMB-003', name: 'AMB-003 – Nakuru Level 5 Hospital', status: 'Available' },
    { id: 'AMB-004', name: 'AMB-004 – Flamboyant Medical Centre', status: 'En Route' },
    { id: 'AMB-005', name: 'AMB-005 – Nakuru East Sub-County', status: 'Available' },
];

const nakuruHospitals = [
    { id: 'H-001', name: 'Nakuru War Memorial Hospital', beds: 12 },
    { id: 'H-002', name: 'Rift Valley Provincial General Hospital', beds: 8 },
    { id: 'H-003', name: 'Nakuru Level 5 Hospital', beds: 5 },
    { id: 'H-004', name: 'Flamboyant Medical Centre', beds: 3 },
    { id: 'H-005', name: 'Nakuru East Sub-County Hospital', beds: 7 },
];

function Dropdown({ options, onSelect, renderItem, placeholder, open, setOpen, buttonLabel, buttonClass }) {
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setOpen]);

    return (
        <div className="relative flex-1" ref={ref}>
            <button
                className={`w-full py-4 px-4 border-none text-white font-bold text-xs rounded shadow hover:shadow-md hover:opacity-90 transition-all ${buttonClass}`}
                onClick={() => setOpen(!open)}
            >
                {buttonLabel}
                <span className="ml-2">▾</span>
            </button>
            {open && (
                <div className="absolute top-full left-0 z-50 mt-1 w-64 bg-white border border-gray-200 rounded shadow-lg overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
                        {placeholder}
                    </div>
                    <ul className="max-h-52 overflow-y-auto">
                        {options.map((opt) => (
                            <li
                                key={opt.id}
                                className="px-4 py-3 text-xs text-gray-700 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                                onClick={() => { onSelect(opt); setOpen(false); }}
                            >
                                {renderItem(opt)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function CoordinationActions() {
    const [ambulanceOpen, setAmbulanceOpen] = useState(false);
    const [hospitalOpen, setHospitalOpen] = useState(false);
    const [selectedAmbulance, setSelectedAmbulance] = useState(null);
    const [selectedHospital, setSelectedHospital] = useState(null);

    return (
        <div className="bg-white rounded-lg shadow-sm flex flex-col overflow-visible border border-gray-200 pb-5">
            <div className="bg-gray-50 text-gray-800 px-4 py-3 text-sm font-bold uppercase border-b border-gray-200">
                <h3>COORDINATION ACTIONS</h3>
            </div>
            <div className="p-5 flex gap-5">
                {/* Assign Ambulance Dropdown */}
                <Dropdown
                    open={ambulanceOpen}
                    setOpen={(val) => { setAmbulanceOpen(val); if (val) setHospitalOpen(false); }}
                    buttonLabel={selectedAmbulance ? selectedAmbulance.id : 'ASSIGN AMBULANCE'}
                    buttonClass="bg-blue-600"
                    placeholder="Nakuru – Available Units"
                    options={nakuruAmbulances}
                    onSelect={setSelectedAmbulance}
                    renderItem={(a) => (
                        <div>
                            <span className="font-semibold text-gray-800">{a.name}</span>
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${a.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {a.status}
                            </span>
                        </div>
                    )}
                />

                {/* Notify Hospital Dropdown */}
                <Dropdown
                    open={hospitalOpen}
                    setOpen={(val) => { setHospitalOpen(val); if (val) setAmbulanceOpen(false); }}
                    buttonLabel={selectedHospital ? selectedHospital.id : 'NOTIFY HOSPITAL'}
                    buttonClass="bg-green-700"
                    placeholder="Nakuru – Hospitals"
                    options={nakuruHospitals}
                    onSelect={setSelectedHospital}
                    renderItem={(h) => (
                        <div>
                            <span className="font-semibold text-gray-800">{h.name}</span>
                            <span className="ml-2 text-gray-400">· {h.beds} beds avail.</span>
                        </div>
                    )}
                />

                {/* Update Status */}
                <button className="flex-1 py-4 px-4 border-none text-white font-bold text-xs rounded shadow hover:shadow-md hover:opacity-90 active:translate-y-0 active:shadow-sm transition-all bg-orange-600">
                    UPDATE STATUS
                </button>
            </div>

            {/* Selection Summary */}
            {(selectedAmbulance || selectedHospital) && (
                <div className="mx-5 mb-1 p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 flex gap-4">
                    {selectedAmbulance && (
                        <span>🚑 <strong>Ambulance:</strong> {selectedAmbulance.name}</span>
                    )}
                    {selectedHospital && (
                        <span>🏥 <strong>Hospital:</strong> {selectedHospital.name}</span>
                    )}
                </div>
            )}
        </div>
    );
}

