import React from 'react';
import {
  AlertTriangle,
  Ambulance,
  Building2,
  Zap,
  CheckCircle,
  Clock,
  Shield,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  MapPin
} from 'lucide-react';

const recentActivities = [
  { id: 1, title: 'Emergency Request #1247', description: 'Cardiac emergency in Westlands',       time: '2 min ago',  status: 'active',  icon: AlertTriangle },
  { id: 2, title: 'New Hospital Registration', description: 'Nairobi West Hospital submitted',    time: '15 min ago', status: 'pending', icon: Building2 },
  { id: 3, title: 'Ambulance Dispatched',      description: 'KBZ 123A en route to Karen',        time: '23 min ago', status: 'success', icon: Ambulance },
  { id: 4, title: 'Emergency Resolved',        description: 'Patient delivered to Aga Khan',     time: '45 min ago', status: 'success', icon: CheckCircle },
  { id: 5, title: 'System Health Check',       description: 'All systems operational',           time: '1 hr ago',   status: 'success', icon: Shield },
  { id: 6, title: 'Verification Approved',     description: 'Red Cross Ambulance approved',      time: '2 hrs ago',  status: 'success', icon: CheckCircle },
];

const liveAmbulances = [
  { id: 1, plate: 'KBZ 123A', status: 'en-route',  location: 'Westlands',  patient: 'Cardiac',   distance: '2.3 km', eta: '5 min'  },
  { id: 2, plate: 'KCA 456B', status: 'available', location: 'CBD',        patient: '-',         distance: '-',      eta: '-'      },
  { id: 3, plate: 'KCB 789C', status: 'at-scene',  location: 'Karen',      patient: 'Trauma',    distance: '8.7 km', eta: '12 min' },
  { id: 4, plate: 'KDA 012D', status: 'returning', location: 'Upper Hill', patient: 'Completed', distance: '1.2 km', eta: '3 min'  },
  { id: 5, plate: 'KBE 345E', status: 'available', location: 'Parklands',  patient: '-',         distance: '-',      eta: '-'      },
];

const activityStatusColor = (s) => ({
  success: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  active:  'bg-blue-100  text-blue-700',
}[s] || 'bg-gray-100 text-gray-700');

const ambulanceStatusColor = (s) => ({
  available:  'bg-green-100  text-green-800',
  'en-route': 'bg-blue-100   text-blue-800',
  'at-scene': 'bg-amber-100  text-amber-800',
  returning:  'bg-purple-100 text-purple-800',
}[s] || 'bg-gray-100 text-gray-800');

const Dashboard = () => (
  <div className="space-y-6">

    {/* Primary Stats */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Emergencies"   value="1,247" change="+12.5%" icon={AlertTriangle} color="bg-red-500"   trend="up" />
      <StatCard title="Active Ambulances"   value="87"    change="+5.2%"  icon={Ambulance}     color="bg-blue-500"  trend="up" />
      <StatCard title="Registered Hospitals" value="156"  change="+3.1%"  icon={Building2}     color="bg-green-500" trend="up" />
      <StatCard title="Avg Response Time"   value="8.5 min" change="-15.3%" icon={Zap}         color="bg-amber-500" trend="down" />
    </div>

    {/* Secondary Stats */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MiniStat label="Resolved Today"        value="47"      icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
      <MiniStat label="Pending Registrations" value="12"      icon={Clock}       color="text-amber-600" bg="bg-amber-100" />
      <MiniStat label="System Uptime"         value="99.97%"  icon={Shield}      color="text-green-600" bg="bg-green-100" />
      <MiniStat label="Active Users"          value="2,341"   icon={Users}       color="text-blue-600"  bg="bg-blue-100"  />
    </div>

    {/* Activity + Live Ambulances */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Activities */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Recent Activities</h3>
          <p className="text-sm text-gray-500 mt-1">Latest system events</p>
        </div>
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {recentActivities.map(a => {
            const Icon = a.icon;
            return (
              <div key={a.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${activityStatusColor(a.status)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">{a.title}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{a.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{a.time}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Ambulances Summary */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Live Ambulances</h3>
          <p className="text-sm text-gray-500 mt-1">Current fleet status overview</p>
        </div>
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {liveAmbulances.map(a => (
            <div key={a.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Ambulance className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm font-mono text-gray-900">{a.plate}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-0.5">
                      <MapPin className="w-3 h-3 mr-1" />{a.location}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ambulanceStatusColor(a.status)}`}>
                  {a.status.replace('-', ' ')}
                </span>
              </div>
              {a.patient !== '-' && (
                <div className="ml-11 grid grid-cols-3 gap-2 text-xs">
                  <div><p className="text-gray-400">Patient</p><p className="font-semibold text-gray-900">{a.patient}</p></div>
                  <div><p className="text-gray-400">Distance</p><p className="font-semibold text-gray-900">{a.distance}</p></div>
                  <div><p className="text-gray-400">ETA</p><p className="font-semibold text-gray-900">{a.eta}</p></div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
          <p className="text-sm text-gray-600">
            View full map and details in <span className="text-blue-600 font-semibold">Live Tracking</span> page
          </p>
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({ title, value, change, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:scale-105 group">
    <div className="flex items-center justify-between mb-4">
      <div className={`${color} p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={`flex items-center space-x-1 text-sm font-semibold px-2 py-1 rounded-full ${trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
        {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span>{change}</span>
      </div>
    </div>
    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

const MiniStat = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all">
    <div className="flex items-center space-x-3">
      <div className={`${bg} p-2.5 rounded-lg`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  </div>
);

export default Dashboard;