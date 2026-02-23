import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, AlertTriangle, Bed, ArrowLeftRight,
  ChevronRight, ChevronLeft, Clock, Menu, X, LogOut
} from "lucide-react";

const navItems = [
  { path: "/dashboard",            label: "Overview",         icon: LayoutDashboard, color: "text-blue-400"   },
  { path: "/dashboard/alerts",     label: "Incoming Alerts",  icon: AlertTriangle,   color: "text-red-400"    },
  { path: "/dashboard/beds",       label: "Beds & Resources", icon: Bed,             color: "text-green-400"  },
  { path: "/dashboard/referrals",  label: "Referrals",        icon: ArrowLeftRight,  color: "text-teal-400"   },
];

export default function Layout({ children }) {
  const [expanded,    setExpanded]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const currentPage = navItems.find(n => n.path === location.pathname)?.label || "Dashboard";

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      navigate("/login");
    }
  };

  // Mock user data - replace with actual user data from your auth system
  const user = {
    name: "Dr. Sarah Johnson",
    role: "ER Administrator",
    email: "sarah.johnson@hospital.com",
    avatar: "SJ"
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed lg:relative z-40 flex flex-col h-full
        bg-[#0369A1] border-r border-[#0284C7]/30
        transition-all duration-300 ease-in-out flex-shrink-0
        ${expanded ? "w-56" : "w-16"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>

        {/* Logo area */}
        <div className={`flex items-center h-16 border-b border-[#0284C7]/30 px-3 ${expanded ? "gap-3" : "justify-center"}`}>
          <div className="w-9 h-9 bg-white/90 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-[#0369A1] text-xl font-black leading-none">+</span>
          </div>
          {expanded && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-tight whitespace-nowrap">Central General</p>
              <p className="text-blue-200 text-xs whitespace-nowrap">ER Command</p>
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
                  ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
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
        <div className="p-2 border-t border-[#0284C7]/30">
          <button
            onClick={() => setExpanded(!expanded)}
            className={`w-full flex items-center py-2 rounded-lg text-blue-100
              hover:bg-white/10 hover:text-white transition-colors
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

          {/* User Profile Section */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#0369A1] flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user.avatar}
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-40">
                  {/* Profile Header */}
                  <div className="bg-gradient-to-r from-[#0369A1] to-[#0284C7] p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#0369A1] font-bold text-lg shadow-md">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{user.name}</p>
                        <p className="text-blue-100 text-xs">{user.role}</p>
                        <p className="text-blue-200 text-xs mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Logout Action */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-left group"
                    >
                      <LogOut className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-red-600 group-hover:text-red-700">Logout</p>
                        <p className="text-xs text-red-400">Sign out of your account</p>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
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