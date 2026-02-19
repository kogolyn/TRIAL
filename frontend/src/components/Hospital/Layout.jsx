import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, AlertTriangle, Users, UserCheck,
  Bed, ArrowLeftRight, ChevronRight, ChevronLeft,
  Activity, Bell, Clock, Phone, Menu, X, ArrowLeftRight as Transfer
} from "lucide-react";

const navItems = [
  { path: "/dashboard",            label: "Overview",         icon: LayoutDashboard, color: "text-blue-400"   },
  { path: "/dashboard/alerts",     label: "Incoming Alerts",  icon: AlertTriangle,   color: "text-red-400"    },
  { path: "/dashboard/patients",   label: "Active Patients",  icon: Users,           color: "text-orange-400" },
  { path: "/dashboard/staff",      label: "Staff & On-Call",  icon: UserCheck,       color: "text-indigo-400" },
  { path: "/dashboard/beds",       label: "Beds & Resources", icon: Bed,             color: "text-green-400"  },
  { path: "/dashboard/referrals",  label: "Referrals",        icon: ArrowLeftRight,  color: "text-teal-400"   },
];

export default function Layout({ children }) {
  const [expanded,    setExpanded]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const currentPage = navItems.find(n => n.path === location.pathname)?.label || "Dashboard";

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed lg:relative z-40 flex flex-col h-full
        bg-slate-900 border-r border-slate-700/50
        transition-all duration-300 ease-in-out flex-shrink-0
        ${expanded ? "w-56" : "w-16"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>

        {/* Logo area */}
        <div className={`flex items-center h-16 border-b border-slate-700/50 px-3 ${expanded ? "gap-3" : "justify-center"}`}>
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-white text-xl font-black leading-none">+</span>
          </div>
          {expanded && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-tight whitespace-nowrap">Central General</p>
              <p className="text-slate-400 text-xs whitespace-nowrap">ER Command</p>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-3 space-y-1 px-2 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon, color }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/dashboard"}
              onClick={() => setMobileOpen(false)}
              title={!expanded ? label : undefined}
              className={({ isActive }) => `
                flex items-center rounded-lg py-2.5 transition-all duration-150 group relative
                ${expanded ? "px-3 gap-3" : "justify-center px-0"}
                ${isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : color}`} />
                  {expanded && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
                  {/* Tooltip when collapsed */}
                  {!expanded && (
                    <span className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs
                      rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none
                      transition-opacity z-50 shadow-xl border border-slate-700">
                      {label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Expand/Collapse toggle */}
        <div className="p-2 border-t border-slate-700/50">
          <button
            onClick={() => setExpanded(!expanded)}
            className={`w-full flex items-center py-2 rounded-lg text-slate-400
              hover:bg-slate-800 hover:text-white transition-colors
              ${expanded ? "px-3 gap-2" : "justify-center"}`}
          >
            {expanded
              ? <><ChevronLeft className="w-4 h-4" /><span className="text-xs">Collapse</span></>
              : <ChevronRight className="w-4 h-4" />
            }
          </button>
        </div>
      </aside>

      {/* ── RIGHT SIDE ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── TOPBAR ── */}
        <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center px-4 gap-4 flex-shrink-0 z-20">

          {/* Mobile hamburger */}
          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Page title + time */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-slate-800 truncate">{currentPage}</h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{currentTime.toLocaleTimeString()}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                {currentTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert("Connecting to EMS Dispatch...")}
              className="hidden md:flex items-center gap-1.5 bg-green-600 hover:bg-green-700
                text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" /> EMS Dispatch
            </button>

            <button
              onClick={() => alert("Opening transfer request...")}
              className="hidden md:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700
                text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" /> Transfer
            </button>

            <button
              onClick={() => { if (window.confirm("⚠️ Activate Emergency Code — page ALL teams?")) alert("🚨 Emergency Code Activated!"); }}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700
                text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Emergency Code</span>
            </button>

            <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  );
}