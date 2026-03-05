import React, { useState } from 'react';
import { Save, User, Shield, Bell, Server, Phone, Mail } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile',        label: 'Profile',        icon: User    },
    { id: 'notifications',  label: 'Notifications',  icon: Bell    },
    { id: 'security',       label: 'Security',        icon: Shield  },
    { id: 'system',         label: 'System',          icon: Server  },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Profile Settings</h3>
          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                SA
              </div>
              <div>
                <p className="font-semibold text-gray-900">System Administrator</p>
                <p className="text-sm text-gray-500 mt-1">admin@emergency.ke</p>
                <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-semibold">
                  Change Photo
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingsInput label="First Name"    defaultValue="System"         icon={User}  />
              <SettingsInput label="Last Name"     defaultValue="Administrator"   icon={User}  />
              <SettingsInput label="Email"         defaultValue="admin@emergency.ke" type="email" icon={Mail} />
              <SettingsInput label="Phone Number"  defaultValue="+254 700 000 000"   type="tel"   icon={Phone} />
            </div>

            <SaveButton />
          </div>
        </div>
      )}

      {/* Notifications Settings */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Notification Preferences</h3>
          <div className="space-y-4">
            <Toggle label="New Emergency Alerts"        description="Get notified when a new emergency is reported"  defaultChecked />
            <Toggle label="Registration Submissions"    description="Alerts when new hospitals or ambulances apply"  defaultChecked />
            <Toggle label="Verification Reminders"      description="Reminders for pending verification tasks"       defaultChecked />
            <Toggle label="System Health Alerts"        description="Notifications about system uptime and errors"   defaultChecked />
            <Toggle label="Weekly Summary Report"       description="Receive a weekly analytics summary via email"   />
            <Toggle label="SMS Notifications"           description="Receive critical alerts via SMS"                />
          </div>
          <SaveButton />
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Security Settings</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingsInput label="Current Password"  type="password" placeholder="Enter current password" />
              <SettingsInput label="New Password"      type="password" placeholder="Enter new password"     />
              <SettingsInput label="Confirm Password"  type="password" placeholder="Confirm new password" className="md:col-span-2" />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">Two-Factor Authentication</h4>
              <Toggle label="Enable 2FA" description="Add an extra layer of security to your account" />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">Active Sessions</h4>
              <div className="space-y-3">
                {[
                  { device: 'Chrome on Windows', location: 'Nairobi, KE', time: 'Current session', active: true },
                  { device: 'Safari on iPhone',  location: 'Nairobi, KE', time: '2 hours ago',     active: false },
                ].map((session, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{session.device}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{session.location} · {session.time}</p>
                    </div>
                    {session.active
                      ? <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Active</span>
                      : <button className="text-xs text-red-600 font-semibold hover:text-red-700">Revoke</button>
                    }
                  </div>
                ))}
              </div>
            </div>

            <SaveButton label="Update Password" />
          </div>
        </div>
      )}

      {/* System Settings */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">System Configuration</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingsInput label="System Name"       defaultValue="Emergency Response System" />
              <SettingsInput label="Support Email"     defaultValue="support@emergency.ke" type="email" />
              <SettingsInput label="Emergency Hotline" defaultValue="+254 999 000 000" type="tel" />
              <SettingsSelect label="Default Country" options={['Kenya', 'Uganda', 'Tanzania', 'Rwanda']} />
              <SettingsSelect label="Timezone" options={['Africa/Nairobi (EAT)', 'Africa/Lagos', 'UTC']} />
              <SettingsSelect label="Language" options={['English', 'Swahili', 'French']} />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">System Preferences</h4>
              <div className="space-y-4">
                <Toggle label="Maintenance Mode"        description="Temporarily disable public access"           />
                <Toggle label="Auto-approve Ambulances" description="Skip manual verification for ambulances"     />
                <Toggle label="Debug Logging"           description="Enable verbose system logging"               />
              </div>
            </div>

            <SaveButton label="Save System Settings" />
          </div>
        </div>
      )}
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────
const SettingsInput = ({ label, type = 'text', defaultValue, placeholder, icon: Icon, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />}
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`w-full py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${Icon ? 'pl-10 pr-4' : 'px-4'}`}
      />
    </div>
  </div>
);

const SettingsSelect = ({ label, options }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
);

const Toggle = ({ label, description, defaultChecked = false }) => {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div>
        <p className="font-semibold text-sm text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${on ? 'bg-blue-500' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${on ? 'translate-x-7' : 'translate-x-1'}`} />
      </button>
    </div>
  );
};

const SaveButton = ({ label = 'Save Changes' }) => (
  <div className="flex justify-end pt-4">
    <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center space-x-2">
      <Save className="w-5 h-5" />
      <span>{label}</span>
    </button>
  </div>
);

export default Settings;