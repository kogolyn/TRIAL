import React, { useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Ambulance, Building2, Clock } from 'lucide-react';
import { api } from "../../lib/api";

const DEFAULT_MONTHLY = [
  { month: 'Jan', emergencies: 320, resolved: 305, avgTime: 12 },
  { month: 'Feb', emergencies: 420, resolved: 410, avgTime: 10 },
  { month: 'Mar', emergencies: 380, resolved: 370, avgTime: 11 },
  { month: 'Apr', emergencies: 450, resolved: 438, avgTime: 9  },
  { month: 'May', emergencies: 510, resolved: 495, avgTime: 8  },
  { month: 'Jun', emergencies: 480, resolved: 472, avgTime: 8  },
];

const DEFAULT_COUNTY = [
  { county: 'Nairobi',    emergencies: 520 },
  { county: 'Mombasa',    emergencies: 180 },
  { county: 'Kisumu',     emergencies: 140 },
  { county: 'Nakuru',     emergencies: 120 },
  { county: 'Eldoret',    emergencies: 95  },
];

const DEFAULT_REGISTRATION = [
  { month: 'Jan', hospitals: 5,  ambulances: 12 },
  { month: 'Feb', hospitals: 8,  ambulances: 18 },
  { month: 'Mar', hospitals: 6,  ambulances: 14 },
  { month: 'Apr', hospitals: 10, ambulances: 22 },
  { month: 'May', hospitals: 7,  ambulances: 16 },
  { month: 'Jun', hospitals: 12, ambulances: 25 },
];

const Analytics = () => {
  const [period, setPeriod] = useState('6months');
  const [monthlyData, setMonthlyData] = useState(DEFAULT_MONTHLY);
  const [countyData, setCountyData] = useState(DEFAULT_COUNTY);
  const [registrationData, setRegistrationData] = useState(DEFAULT_REGISTRATION);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await api.get("/admin/analytics");
        if (!active) return;
        if (Array.isArray(data.monthlyData)) setMonthlyData(data.monthlyData);
        if (Array.isArray(data.countyData)) setCountyData(data.countyData);
        if (Array.isArray(data.registrationData)) setRegistrationData(data.registrationData);
      } catch {
        // keep defaults if request fails
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const kpis = useMemo(() => {
    const totalEmergencies = monthlyData.reduce((sum, r) => sum + (r.emergencies || 0), 0);
    const avgResponse = monthlyData.length
      ? Math.round(monthlyData.reduce((sum, r) => sum + (r.avgTime || 0), 0) / monthlyData.length)
      : 0;
    const newHospitals = registrationData.reduce((sum, r) => sum + (r.hospitals || 0), 0);
    const newAmbulances = registrationData.reduce((sum, r) => sum + (r.ambulances || 0), 0);
    return { totalEmergencies, avgResponse, newHospitals, newAmbulances };
  }, [monthlyData, registrationData]);

  return (
    <div className="space-y-6">

      {/* Header Controls */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">System Analytics</h3>
            <p className="text-sm text-gray-500 mt-1">Performance metrics and trends</p>
          </div>
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
          >
            <option value="7days">Last 7 Days</option>
            <option value="1month">Last Month</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Emergencies"   value={kpis.totalEmergencies || "—"} change="+12.5%" trend="up"   icon={AlertTriangle} color="bg-red-500"   />
        <KpiCard title="Avg Response Time"   value={kpis.avgResponse ? `${kpis.avgResponse} min` : "—"} change="-8.3%" trend="down" icon={Clock}         color="bg-amber-500" />
        <KpiCard title="New Hospitals"       value={kpis.newHospitals || "—"}    change="+3.1%"  trend="up"   icon={Building2}     color="bg-green-500" />
        <KpiCard title="New Ambulances"      value={kpis.newAmbulances || "—"}   change="+5.2%"  trend="up"   icon={Ambulance}     color="bg-blue-500"  />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Emergency Volume" subtitle="Monthly emergencies vs resolved">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="aEmerg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#DC2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="aResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#16A34A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: 12 }} />
              <YAxis stroke="#6B7280" style={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="emergencies" stroke="#DC2626" fill="url(#aEmerg)"    strokeWidth={2} name="Emergencies" />
              <Area type="monotone" dataKey="resolved"    stroke="#16A34A" fill="url(#aResolved)" strokeWidth={2} name="Resolved"    />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Response Time Trend" subtitle="Average response time in minutes">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: 12 }} />
              <YAxis stroke="#6B7280" style={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgTime" stroke="#F59E0B" strokeWidth={2} dot={{ r: 5 }} name="Avg Time (min)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Emergencies by County" subtitle="Top counties by emergency volume">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={countyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="county" stroke="#6B7280" style={{ fontSize: 12 }} />
              <YAxis stroke="#6B7280" style={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="emergencies" fill="#DC2626" radius={[8, 8, 0, 0]} name="Emergencies" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="New Registrations" subtitle="Monthly hospital and ambulance registrations">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={registrationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: 12 }} />
              <YAxis stroke="#6B7280" style={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="hospitals"  fill="#0284C7" radius={[8, 8, 0, 0]} name="Hospitals"  />
              <Bar dataKey="ambulances" fill="#DC2626" radius={[8, 8, 0, 0]} name="Ambulances" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, change, trend, icon, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:scale-105 group">
    <div className="flex items-center justify-between mb-4">
      <div className={`${color} p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform`}>
        {React.createElement(icon, { className: "w-6 h-6 text-white" })}
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

const ChartCard = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
    <div className="mb-6">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
    {children}
  </div>
);

export default Analytics;
