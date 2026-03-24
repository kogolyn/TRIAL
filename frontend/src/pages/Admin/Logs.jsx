import React, { useEffect, useState } from 'react';
import {
  FileText, Search, Download, Filter, AlertTriangle, CheckCircle,
  XCircle, Info, Activity, RefreshCw, Calendar, User, Clock
} from 'lucide-react';
import { api } from "../../lib/api";

const SystemLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState('today');

  const [logs, setLogs] = useState([
    { id: 1, timestamp: '2024-02-17 14:32:15', level: 'info',    category: 'authentication', user: 'admin@emergency.ke', action: 'User logged in', ip: '102.68.75.23', details: 'Successful authentication' },
    { id: 2, timestamp: '2024-02-17 14:30:42', level: 'success', category: 'registration',  user: 'john.k@emergency.ke', action: 'Hospital registered', ip: '102.68.75.24', details: 'Kenyatta National Hospital submitted' },
    { id: 3, timestamp: '2024-02-17 14:28:19', level: 'warning', category: 'verification',  user: 'jane.w@emergency.ke', action: 'Verification attempt failed', ip: '102.68.75.25', details: 'Missing required documents' },
    { id: 4, timestamp: '2024-02-17 14:25:03', level: 'error',   category: 'api',           user: 'system',              action: 'Database connection timeout', ip: '127.0.0.1', details: 'PostgreSQL connection pool exhausted' },
    { id: 5, timestamp: '2024-02-17 14:20:47', level: 'info',    category: 'emergency',     user: 'dispatch@emergency.ke', action: 'Emergency created', ip: '102.68.75.26', details: 'Emergency #1247 - Cardiac in Westlands' },
    { id: 6, timestamp: '2024-02-17 14:18:22', level: 'success', category: 'verification',  user: 'admin@emergency.ke',  action: 'Registration approved', ip: '102.68.75.23', details: 'Red Cross Ambulance 001 approved' },
    { id: 7, timestamp: '2024-02-17 14:15:38', level: 'warning', category: 'system',        user: 'system',              action: 'High memory usage', ip: '127.0.0.1', details: 'Memory usage at 87%' },
    { id: 8, timestamp: '2024-02-17 14:12:55', level: 'info',    category: 'authentication', user: 'peter.o@emergency.ke', action: 'User logged out', ip: '102.68.75.27', details: 'Session ended' },
    { id: 9, timestamp: '2024-02-17 14:10:14', level: 'error',   category: 'api',           user: 'system',              action: 'API rate limit exceeded', ip: '41.90.22.134', details: 'Client exceeded 100 requests/minute' },
    { id: 10, timestamp: '2024-02-17 14:08:31', level: 'success', category: 'emergency',    user: 'dispatch@emergency.ke', action: 'Emergency resolved', ip: '102.68.75.26', details: 'Emergency #1246 - Patient delivered' },
    { id: 11, timestamp: '2024-02-17 14:05:09', level: 'info',   category: 'tracking',      user: 'system',              action: 'GPS update received', ip: '127.0.0.1', details: 'Ambulance KBZ 123A location updated' },
    { id: 12, timestamp: '2024-02-17 14:02:47', level: 'warning', category: 'system',       user: 'system',              action: 'Disk space low', ip: '127.0.0.1', details: 'Available space: 12GB (15%)' },
  ]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await api.get("/admin/logs?limit=200");
        if (!active) return;
        if (Array.isArray(data) && data.length) {
          setLogs(
            data.map((row) => ({
              id: row.id,
              timestamp: row.timestamp
                ? new Date(row.timestamp).toLocaleString("en-US")
                : "",
              level: row.level || "info",
              category: row.category || "system",
              user: row.user || "system",
              action: row.action || "System event",
              ip: row.ip || "-",
              details: row.details || "",
            })),
          );
        }
      } catch {
        // keep defaults
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const levels = ['info', 'success', 'warning', 'error'];
  const categories = ['authentication', 'registration', 'verification', 'emergency', 'api', 'system', 'tracking'];

  const getLevelColor = (level) => {
    switch (level) {
      case 'info':    return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'success': return 'bg-green-100 text-green-800 border-green-300';
      case 'warning': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'error':   return 'bg-red-100 text-red-800 border-red-300';
      default:        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'info':    return <Info className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error':   return <XCircle className="w-4 h-4" />;
      default:        return <Activity className="w-4 h-4" />;
    }
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      authentication: 'bg-purple-100 text-purple-800',
      registration:   'bg-blue-100 text-blue-800',
      verification:   'bg-green-100 text-green-800',
      emergency:      'bg-red-100 text-red-800',
      api:            'bg-indigo-100 text-indigo-800',
      system:         'bg-gray-100 text-gray-800',
      tracking:       'bg-cyan-100 text-cyan-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filtered = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const counts = {
    total: logs.length,
    info: logs.filter(l => l.level === 'info').length,
    success: logs.filter(l => l.level === 'success').length,
    warning: logs.filter(l => l.level === 'warning').length,
    error: logs.filter(l => l.level === 'error').length,
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <LogStatCard label="Total Logs" value={counts.total} color="bg-gray-500" icon={FileText} />
        <LogStatCard label="Info" value={counts.info} color="bg-blue-500" icon={Info} />
        <LogStatCard label="Success" value={counts.success} color="bg-green-500" icon={CheckCircle} />
        <LogStatCard label="Warnings" value={counts.warning} color="bg-amber-500" icon={AlertTriangle} />
        <LogStatCard label="Errors" value={counts.error} color="bg-red-500" icon={XCircle} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="all">All time</option>
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
            >
              <option value="all">All Levels</option>
              {levels.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>

            <button
              onClick={() => window.location.reload()}
              className="px-4 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>

            <button className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                {['Timestamp', 'Level', 'Category', 'User', 'Action', 'IP Address', 'Details'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No logs found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    {/* Timestamp */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="font-mono">{log.timestamp}</span>
                      </div>
                    </td>

                    {/* Level */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center space-x-1 w-fit ${getLevelColor(log.level)}`}>
                        {getLevelIcon(log.level)}
                        <span className="capitalize ml-1">{log.level}</span>
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryBadgeColor(log.category)}`}>
                        {log.category}
                      </span>
                    </td>

                    {/* User */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-700">{log.user}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 font-medium">{log.action}</p>
                    </td>

                    {/* IP */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded">
                        {log.ip}
                      </span>
                    </td>

                    {/* Details */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate" title={log.details}>
                        {log.details}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filtered.length}</span> of <span className="font-semibold">{logs.length}</span> logs
          </p>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              Previous
            </button>
            <button className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
              1
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LogStatCard = ({ label, value, color, icon }) => (
  <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all">
    <div className="flex items-center justify-between mb-3">
      <div className={`${color} p-2.5 rounded-lg shadow-md`}>
        {React.createElement(icon, { className: "w-5 h-5 text-white" })}
      </div>
    </div>
    <p className="text-sm text-gray-600 font-medium">{label}</p>
    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

export default SystemLogs;
