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

        {/* All dashboard pages live under /dashboard/* */}
        <Route path="/dashboard/*" element={<DashboardRoutes />} />

        {/* Catch-all → back to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;