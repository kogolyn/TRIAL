import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Teammate's pages
import EmergencyRequest from "./pages/EmergencyRequest";
import LoginForm        from './components/LoginForm';
import RegisterForm     from './components/RegisterForm';
import logo             from './assets/logo.png';

// Dashboard layout + pages
import Layout         from "./components/Layout";
import Overview       from "./pages/Overview";
import IncomingAlerts from "./pages/IncomingAlerts";
import ActivePatients from "./pages/ActivePatients";
import Staff          from "./pages/Staff";
import BedsResources  from "./pages/BedsResources";
import Referrals      from "./pages/Referrals";

// 👇 YOUR AMBULANCE COMPONENTS
import NavigationMap from "./components/NavigationMap";
import EmergencyFacilities from './components/EmergencyFacilities';
import DispatchComms from './components/DispatchComms';
import PatientCare from './components/PatientCare';
// Pages
import Dispatcher from './pages/Dispatcher';

// Dispatcher components (imported for specific routes if needed, though Dispatcher page aggregates them)
import ActiveIncidents from './components/dispatcher/ActiveIncidents'
import IncidentMap from './components/dispatcher/IncidentMap'
import CoordinationActions from './components/dispatcher/CoordinationActions'
import StatusCards from './components/dispatcher/StatusCards'
// ── TEAMMATE'S PAGES (unchanged) ─────────────────────────────────────────────

function LandingPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", width: "100%" }}>
      <EmergencyRequest onProceed={() => navigate('/login')} />
    </div>
  );
}

function LoginPage() {
  const [showLogin, setShowLogin] = useState(true);
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "448px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#dc2626", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={logo} alt="UzimaNode Logo" style={{ width: "48px", height: "48px", marginRight: "16px" }} />
            UzimaNode
          </h1>
          <p style={{ fontSize: "24px", fontWeight: "700", color: "#1e3a8a" }}>Emergency Response System</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
          <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "500" }}>sign in as staff</span>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
        </div>

        <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", padding: "32px" }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px", background: "#f3f4f6", padding: "4px", borderRadius: "8px" }}>
            <button
              onClick={() => setShowLogin(true)}
              style={{ flex: 1, padding: "8px", borderRadius: "8px", fontWeight: "600", border: "none", cursor: "pointer", background: showLogin ? "#2563eb" : "transparent", color: showLogin ? "#fff" : "#4b5563" }}
            >
              Login
            </button>
            <button
              onClick={() => setShowLogin(false)}
              style={{ flex: 1, padding: "8px", borderRadius: "8px", fontWeight: "600", border: "none", cursor: "pointer", background: !showLogin ? "#2563eb" : "transparent", color: !showLogin ? "#fff" : "#4b5563" }}
            >
              Register
            </button>
          </div>
          {showLogin ? <LoginForm /> : <RegisterForm />}
        </div>

        <p style={{ textAlign: "center", color: "#4b5563", fontSize: "14px", marginTop: "24px" }}>
          Emergency Hotline: <span style={{ fontWeight: "700", color: "#dc2626" }}>999</span>
        </p>
      </div>
    </div>
  );
}

// ── YOUR AMBULANCE DASHBOARD ────────────────────────────────────────────────

function AmbulanceDashboard() {
  const [ambulance, setAmbulance] = useState({
    id: 'AMB-04',
    status: 'Active Duty',
    casesHandled: 0,
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

  const [patientCare, setPatientCare] = useState({
    status: 'EN-ROUTE',
    requestId: 'REQ-001',
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

  const handleRadioDispatch = () => {
    console.log('Radio dispatch activated');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#cdd0db]">

      {/* ========== TOP NAVIGATION BAR ========== */}
      <header className="w-full bg-[#0a1628] flex justify-between items-center px-8 py-4 shadow-xl border-b border-blue-900/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
            U
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">UzimaNode</h1>
            <p className="text-xs text-blue-300 tracking-widest">EMERGENCY INTELLIGENCE</p>
          </div>
        </div>

        <nav className="flex gap-2">
          <button className="px-5 py-2.5 rounded-lg border border-blue-800 text-blue-300 hover:bg-blue-900/50 transition-all text-sm font-medium">
            🌐 Public
          </button>
          <button className="px-5 py-2.5 rounded-lg bg-red-600 border border-red-500 text-white font-semibold shadow-md hover:bg-red-700 transition-all text-sm">
            🚑 Ambulance Crew
          </button>
          <button className="px-5 py-2.5 rounded-lg border border-blue-800 text-blue-300 hover:bg-blue-900/50 transition-all text-sm font-medium">
            🏥 Hospital ER
          </button>
          <button className="px-5 py-2.5 rounded-lg border border-blue-800 text-blue-300 hover:bg-blue-900/50 transition-all text-sm font-medium">
            👤 System Admin
          </button>
        </nav>

        <div className="flex items-center gap-5">
          <div className="text-xl cursor-pointer hover:scale-110 transition-transform text-blue-300">
            🔔
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900 border border-blue-700 rounded-full flex items-center justify-center text-lg shadow-md">
              👤
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-blue-400">Command Center</span>
              <span className="text-sm font-semibold text-white">Duty Officer</span>
            </div>
          </div>
        </div>
      </header>

      {/* ========== DASHBOARD HEADER ========== */}
      <div className="w-full bg-[#0a1628] px-8 py-5 flex justify-between items-center border-b border-blue-900/50 shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Crew & Driver Dashboard</h2>
          <p className="text-sm text-blue-300">
            Unit: <span className="text-red-400 font-semibold">{ambulance.id}</span>
            {' '}| Status:{' '}
            <span className="text-green-400 font-semibold">{ambulance.status}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-blue-900/40 border border-blue-800 px-5 py-2.5 rounded-lg text-white text-sm shadow-md">
            📋 Cases Handled: <span className="font-bold text-white">{ambulance.casesHandled}</span>
          </div>
          <button className="bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg text-sm">
            ⚡ Check-In
          </button>
        </div>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="grid lg:grid-cols-[3fr_1fr] gap-6 p-6 flex-1">

        {/* Left Column */}
        <div className="flex flex-col gap-6">

          {/* Navigation Card */}
          <div className="rounded-xl border border-[#2a3142] overflow-hidden shadow-lg flex-1 flex flex-col bg-[#111827]">

            {/* Card Header */}
            <div className="px-6 py-4 border-b border-[#2a3142] flex justify-between items-center bg-[#1a1f2e]">
              <h3 className="text-base font-semibold text-blue-400">🧭 Driver Navigation System</h3>
              <button className="bg-transparent border-none text-gray-400 cursor-pointer text-xl hover:text-white transition-colors">
                ⛶
              </button>
            </div>

            <NavigationMap
              ambulance={ambulance}
              incident={incident}
              hospital={hospital}
              navigation={navigation}
              currentSpeed={ambulance.currentSpeed}
            />

            {/* Traffic Feed */}
            <div className="px-6 py-4 border-t border-[#2a3142] bg-[#1a1f2e]">
              <h4 className="text-xs text-gray-400 mb-3 tracking-wider font-semibold">
                LIVE TRAFFIC FEED
              </h4>
              <div className="flex flex-col gap-3">
                {trafficConditions.map((condition, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 px-4 py-3 bg-[#111827] rounded-lg text-sm border-l-4 ${
                      condition.status === 'red' ? 'border-red-500' : 'border-green-500'
                    } hover:bg-[#1f2937] transition-colors`}
                  >
                    <span className="text-lg">
                      {condition.status === 'red' ? '🔴' : '🟢'}
                    </span>
                    <span className="text-gray-300">
                      {condition.type === 'congestion'
                        ? `Congestion at ${condition.location}`
                        : condition.location}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Patient Care */}
          <PatientCare patientCare={patientCare} />
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
    </div>
  );
}

// ── DASHBOARD (wrapped in Layout) ────────────────────────────────────────────

function DashboardRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/"          element={<Overview />}       />
        <Route path="/alerts"    element={<IncomingAlerts />} />
        <Route path="/patients"  element={<ActivePatients />} />
        <Route path="/staff"     element={<Staff />}          />
        <Route path="/beds"      element={<BedsResources />}  />
        <Route path="/referrals" element={<Referrals />}      />
        <Route path="*"          element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

// ── ROOT APP ─────────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Teammate's auth flow */}
        <Route path="/"      element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />}   />

        {/* 👇 YOUR AMBULANCE DASHBOARD */}
        <Route path="/ambulance" element={<AmbulanceDashboard />} />

        {/* All dashboard pages live under /dashboard/* */}
        <Route path="/dashboard/*" element={<DashboardRoutes />} />

        {/* Catch-all → back to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      {/* Main Dispatcher Dashboard Route */}
        <Route path="/" element={<Navigate to="/dispatcher" replace />} />
        <Route path="/dispatcher" element={<Dispatcher />} />

        {/* Individual Component Routes (as requested) */}
        <Route path="/active-incidents" element={<ActiveIncidents />} />
        <Route path="/incident-map" element={<IncidentMap />} />
        <Route path="/coordination-actions" element={<CoordinationActions />} />
        <Route path="/status-cards" element={<StatusCards />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
