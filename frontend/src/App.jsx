import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import ProtectedRoute from "./components/ProtectedRoute";

// Admin COMPONENTS ───────────────────────────────────────────────────────────
import Sidebar       from './components/Admin/Sidebar';
import Navbar        from './components/Admin/Navbar';
import Dashboard     from './pages/Admin/Dashboard';
import Registration  from './pages/Admin/Registration';
import Verification  from './pages/Admin/Verification';
import Analytics     from './pages/Admin/Analytics';
import SystemLogs          from './pages/Admin/Logs';
import Tracking             from './pages/Admin/Tracking';
import Settings             from './pages/Admin/Settings';
import Resources            from './pages/Admin/Resources';

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
import AmbulanceRoutes from './routes/AmbulanceRoutes';
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
      <EmergencyRequest
        onLogin={() => navigate('/login')}
        onRegister={() => navigate('/login?mode=register')}
      />
    </div>
  );
}

function LoginPage({ setUser }) {
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(() => {
    const mode = new URLSearchParams(location.search).get('mode');
    return mode !== 'register';
  });

  useEffect(() => {
    const mode = new URLSearchParams(location.search).get('mode');
    setShowLogin(mode !== 'register');
  }, [location.search]);

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
    resources:    { title: 'Hospital Resources',        subtitle: 'Manage beds, equipment, and blood bank' },
    analytics:    { title: 'System Analytics',          subtitle: 'Detailed analytics and reports' },
    settings:     { title: 'System Settings',           subtitle: 'Configure system settings and preferences' },
    help:         { title: 'Logs',             subtitle: 'System logs and activity tracking' },

  };

  const current = pageInfo[activeSection] || pageInfo.dashboard;

  const renderPage = () => {
    switch (activeSection) {
      case 'dashboard':    return <Dashboard />;
      case 'registration': return <Registration />;
      case 'verification': return <Verification />;
      case 'resources':    return <Resources />;
      case 'analytics':    return <Analytics />;
      case 'logs':     return <SystemLogs />;
      case 'tracking': return <Tracking />;
      case 'settings': return <Settings />;
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
        <Route path="/register" element={<Navigate to="/login?mode=register" replace />} />

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
          path="/ambulance/*"
          element={
            <ProtectedRoute user={user} role="ambulance">
              <AmbulanceRoutes />
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
            <ProtectedRoute user={user} role={["medical", "hospital"]}>
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


