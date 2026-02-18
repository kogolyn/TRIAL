import React from 'react';
import {
  LayoutDashboard,
  Activity,
  UserPlus,
  ClipboardCheck,
  BarChart3,
  Settings,
  HelpCircle,
  Siren,
  Menu,
  X,
  ChevronRight,
  LogOut
} from 'lucide-react';

const Sidebar = ({ activeSection, setActiveSection, sidebarOpen, setSidebarOpen }) => {
  const menuSections = [
    {
      title: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'System overview' },
        { id: 'tracking', label: 'Live Tracking', icon: Activity, description: 'Real-time monitoring' },
      ]
    },
    {
      title: 'Management',
      items: [
        { id: 'registration', label: 'Registration', icon: UserPlus, badge: 3, description: 'New registrations' },
        { id: 'verification', label: 'Verification', icon: ClipboardCheck, badge: 3, description: 'Pending approvals' },
      ]
    },
    {
      title: 'Reports & Settings',
      items: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Reports & insights' },
        { id: 'settings', label: 'Settings', icon: Settings, description: 'System configuration' },
        { id: 'help', label: 'Help & Support', icon: HelpCircle, description: 'Documentation' },
      ]
    }
  ];

  return (
    <aside
      className={`${
        sidebarOpen ? 'w-72' : 'w-20'
      } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 shadow-2xl border-r border-slate-700 flex flex-col relative`}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-red-600/20 to-blue-600/20">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-2.5 rounded-xl shadow-lg">
                <Siren className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Emergency System
                </h1>
                <p className="text-xs text-gray-400 font-medium">Admin Dashboard</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-all hover:scale-110"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
        {menuSections.map((section, index) => (
          <div key={index}>
            {sidebarOpen && (
              <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-2 font-semibold">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  description={item.description}
                  active={activeSection === item.id}
                  onClick={() => setActiveSection(item.id)}
                  collapsed={!sidebarOpen}
                  badge={item.badge}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Quick Stats (when collapsed) */}
      {!sidebarOpen && (
        <div className="p-4 border-t border-slate-700/50">
          <div className="space-y-2">
            <div className="bg-slate-700/30 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-400">Pending</p>
              <p className="text-lg font-bold text-amber-400">3</p>
            </div>
          </div>
        </div>
      )}

      {/* User Profile */}
      {sidebarOpen && (
        <div className="p-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                SA
              </div>
              <div>
                <p className="text-sm font-semibold">System Admin</p>
                <p className="text-xs text-gray-400">admin@emergency.ke</p>
              </div>
            </div>
            <button
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

const NavItem = ({ icon: Icon, label, description, active, onClick, collapsed, badge }) => (
  <button
    onClick={onClick}
    className={`w-full group relative ${
      active
        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
        : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
    } rounded-xl transition-all duration-200`}
  >
    <div className="flex items-center space-x-3 px-4 py-3">
      <div className="relative">
        <Icon
          className={`w-5 h-5 flex-shrink-0 ${
            active ? 'text-white' : 'text-gray-400 group-hover:text-white'
          }`}
        />
        {collapsed && badge > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>

      {!collapsed && (
        <>
          <div className="flex-1 text-left">
            <p className="font-semibold text-sm">{label}</p>
            <p className={`text-xs ${active ? 'text-blue-100' : 'text-gray-500 group-hover:text-gray-400'}`}>
              {description}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {badge > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
            {active && <ChevronRight className="w-4 h-4" />}
          </div>
        </>
      )}
    </div>

    {/* Tooltip for collapsed state */}
    {collapsed && (
      <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
        <p className="font-semibold">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
        {badge > 0 && (
          <span className="inline-block mt-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {badge} pending
          </span>
        )}
      </div>
    )}
  </button>
);

export default Sidebar;