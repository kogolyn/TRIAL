import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ProtectedRoute from "./components/ProtectedRoute";

// Admin COMPONENTS ───────────────────────────────────────────────────────────
import Sidebar       from './components/Admin/Sidebar';
import Navbar        from './components/Admin/Navbar';
import Dashboard     from './pages/Admin/Dashboard';
import Registration  from './pages/Admin/Registration';
import Verification  from './pages/Admin/Verification';

//  AUTH & EMERGENCY PAGES ─────────────────────────────────────────
import EmergencyRequest from './pages/Landing/EmergencyRequest';
import LoginForm        from './pages/Authentication/LoginForm';
import RegisterForm     from './pages/Authentication/RegisterForm';
import logo             from './assets/logo.png';

//  DASHBOARD LAYOUT & PAGES ───────────────────────────────────────
import Layout         from './components/Hospital/Layout';
import Overview       from './pages/Hospital/Overview';
import IncomingAlerts from './pages/Hospital/IncomingAlerts';
import BedsResources  from './pages/Hospital/BedsResources';
import Referrals      from './pages/Hospital/Referrals';

//  AMBULANCE COMPONENTS ───────────────────────────────────────────
import NavigationMap       from './pages/Ambulance/NavigationMap';
import EmergencyFacilities from './pages/Ambulance/EmergencyFacilities';
import DispatchComms       from './pages/Ambulance/DispatchComms';
import PatientCare         from './pages/Ambulance/PatientCare';
import Dispatcher          from './pages/dispatcher/Dispatcher';

//  DISPATCHER COMPONENTS ─────────────────────────────────────────
import ActiveIncidents    from './pages/dispatcher/ActiveIncidents';
import IncidentMap        from './components/dispatcher/IncidentMap';
import CoordinationActions from './pages/dispatcher/CoordinationActions';
import StatusCards        from './pages/dispatcher/StatusCards';


// ═══════════════════════════════════════════════════════════════════════════════
// TEAMMATE'S PAGES (unchanged)
// ═══════════════════════════════════════════════════════════════════════════════

function LandingPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', width: '100%' }}>
      <EmergencyRequest onProceed={() => navigate('/login')} />
    </div>
  );
}

function LoginPage({ setUser }) {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '448px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={logo} alt="UzimaNode Logo" style={{ width: '48px', height: '48px', marginRight: '16px' }} />
            UzimaNode
          </h1>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e3a8a' }}>
            Emergency Response System
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>
            sign in as staff
          </span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '32px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#f3f4f6', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setShowLogin(true)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: showLogin ? '#2563eb' : 'transparent',
                color: showLogin ? '#fff' : '#4b5563'
              }}
            >
              Login
            </button>
            <button
              onClick={() => setShowLogin(false)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: !showLogin ? '#2563eb' : 'transparent',
                color: !showLogin ? '#fff' : '#4b5563'
              }}
            >
              Register
            </button>
          </div>

          {/* ✅ IMPORTANT FIX — pass setUser */}
          {showLogin
            ? <LoginForm setUser={setUser} />
            : <RegisterForm />
          }

        </div>

        <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '14px', marginTop: '24px' }}>
          Emergency Hotline: <span style={{ fontWeight: '700', color: '#dc2626' }}>999</span>
        </p>
      </div>
    </div>
  );
}


 //── YOUR AMBULANCE DASHBOARD ────────────────────────────────────────────────

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

  // Patient data
  const [patientData] = useState({
    name: 'John Doe',
    age: 58,
    gender: 'Male',
    medicalCondition: 'Cardiac Arrest',
    severity: 'Critical',
    estimatedTime: '4 min',
    paramedicReport: 'Patient found unconscious, CPR initiated at scene. Pulse weak but present. Responding to treatment.',
    vitals: {
      heartRate: 45,
      bloodPressure: '90/60',
      oxygenLevel: 88,
      temperature: 36.2,
      respiratoryRate: 18,
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

          {/* PATIENT CARE ACCESS BUTTON  */}
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

      {/* ========== PATIENT CARE MODAL ========== */}
      {showPatientCare && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-70 z-[9998]"
            onClick={() => setShowPatientCare(false)}
          />
         
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
              <div className="px-6 py-4 border-b border-gray-300 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                <h3 className="text-xl font-bold text-gray-800">🏥 Patient Care</h3>
                <button
                  onClick={() => setShowPatientCare(false)}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none hover:bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center transition-all"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                {/* Key Information Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
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
                    <p className="text-xs text-blue-600 mb-1">Estimated Time to Hospital</p>
                    <p className="text-lg font-bold text-blue-600">{patientData.estimatedTime}</p>
                  </div>
                </div>

                {/* Paramedic Report Section */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">📋 Paramedic Report</h4>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">{patientData.paramedicReport}</p>
                  </div>
                </div>

                {/* Additional Patient Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Age</p>
                    <p className="text-lg font-bold text-gray-800">{patientData.age} years</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Gender</p>
                    <p className="text-lg font-bold text-gray-800">{patientData.gender}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========== LIVE VITALS MODAL ========== */}
      {showLiveVitals && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-70 z-[9998]"
            onClick={() => setShowLiveVitals(false)}
          />
         
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
              <div className="px-6 py-4 border-b border-gray-300 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                <h3 className="text-xl font-bold text-gray-800">💓 Live Vitals Monitor</h3>
                <button
                  onClick={() => setShowLiveVitals(false)}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none hover:bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center transition-all"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
                    <p className="text-sm text-red-600 mb-2">❤️ Heart Rate</p>
                    <p className="text-4xl font-bold text-red-600">{patientData.vitals.heartRate}</p>
                    <p className="text-xs text-red-500 mt-1">bpm</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 text-center">
                    <p className="text-sm text-blue-600 mb-2">🩺 Blood Pressure</p>
                    <p className="text-4xl font-bold text-blue-600">{patientData.vitals.bloodPressure}</p>
                    <p className="text-xs text-blue-500 mt-1">mmHg</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
                    <p className="text-sm text-green-600 mb-2">🫁 Oxygen Level</p>
                    <p className="text-4xl font-bold text-green-600">{patientData.vitals.oxygenLevel}%</p>
                    <p className="text-xs text-green-500 mt-1">SpO2</p>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-lg border border-orange-200 text-center">
                    <p className="text-sm text-orange-600 mb-2">🌡️ Temperature</p>
                    <p className="text-4xl font-bold text-orange-600">{patientData.vitals.temperature}°C</p>
                    <p className="text-xs text-orange-500 mt-1">Body Temp</p>
                  </div>
                  <div className="col-span-2 bg-purple-50 p-6 rounded-lg border border-purple-200 text-center">
                    <p className="text-sm text-purple-600 mb-2">💨 Respiratory Rate</p>
                    <p className="text-4xl font-bold text-purple-600">{patientData.vitals.respiratoryRate}</p>
                    <p className="text-xs text-purple-500 mt-1">breaths/min</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// YOUR ADMIN DASHBOARD (sidebar + navbar layout)
// ═══════════════════════════════════════════════════════════════════════════════

function AdminApp() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen]     = useState(true);

  const pageInfo = {
    dashboard:    { title: 'System Dashboard',         subtitle: 'Complete overview of emergency response system' },
    tracking:     { title: 'Live Emergency Tracking',   subtitle: 'Real-time tracking of ambulances and emergencies' },
    registration: { title: 'Registration Portal',       subtitle: 'Register new hospitals and ambulances' },
    verification: { title: 'Verification Center',       subtitle: 'Review and verify pending registrations' },
    analytics:    { title: 'System Analytics',          subtitle: 'Detailed analytics and reports' },
    settings:     { title: 'System Settings',           subtitle: 'Configure system settings and preferences' },
    help:         { title: 'Help & Support',             subtitle: 'Documentation and support resources' },
  };

  const current = pageInfo[activeSection] || pageInfo.dashboard;

  const renderPage = () => {
    switch (activeSection) {
      case 'dashboard':    return <Dashboard />;
      case 'registration': return <Registration />;
      case 'verification': return <Verification />;
      default:
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <p className="text-2xl font-bold text-gray-900 mb-2">{current.title}</p>
            <p className="text-gray-500">{current.subtitle}</p>
            <p className="mt-6 text-sm text-gray-400">This page is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-red-50 overflow-hidden">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <main className="flex-1 overflow-y-auto">
        <Navbar title={current.title} subtitle={current.subtitle} />
        <div className="p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// TEAMMATE'S HOSPITAL DASHBOARD ROUTES (wrapped in Layout)
// ═══════════════════════════════════════════════════════════════════════════════

function DashboardRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/alerts" element={<IncomingAlerts />} />
        <Route path="/beds" element={<BedsResources />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP — all routes in one place
// ═══════════════════════════════════════════════════════════════════════════════

function App() {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />

        {/* Protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} role="admin">
              <AdminApp />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ambulance"
          element={
            <ProtectedRoute user={user} role="ambulance">
              <AmbulanceDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dispatcher"
          element={
            <ProtectedRoute user={user} role="dispatcher">
              <Dispatcher />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute user={user} role="medical">
              <DashboardRoutes />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
export default App;