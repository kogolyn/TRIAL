import React, { useEffect, useState } from 'react';
import {
  Building2,
  Ambulance,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Download,
  AlertCircle,
  Activity
} from 'lucide-react';
import { api } from "../../lib/api";

const Verification = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [credentials, setCredentials] = useState(null);

  const [registrations, setRegistrations] = useState([
    { id: 1, type: 'hospital', name: 'Kenyatta National Hospital', location: 'Nairobi CBD', capacity: 1800, status: 'pending', dateSubmitted: '2024-02-08', contact: '+254 712 345 678' },
    { id: 2, type: 'ambulance', name: 'Red Cross Ambulance 001', plateNumber: 'KBZ 123A', status: 'approved', dateSubmitted: '2024-02-07', operator: 'Kenya Red Cross', contact: '+254 700 123 456' },
    { id: 3, type: 'hospital', name: 'Aga Khan University Hospital', location: 'Parklands', capacity: 254, status: 'approved', dateSubmitted: '2024-02-06', contact: '+254 722 111 222' },
    { id: 4, type: 'ambulance', name: 'St. John Ambulance 015', plateNumber: 'KCA 456B', status: 'rejected', dateSubmitted: '2024-02-05', operator: 'St. John Ambulance', contact: '+254 711 222 333' },
    { id: 5, type: 'hospital', name: 'Nairobi Hospital', location: 'Upper Hill', capacity: 150, status: 'pending', dateSubmitted: '2024-02-09', contact: '+254 733 444 555' },
    { id: 6, type: 'ambulance', name: 'Rescue Ambulance 007', plateNumber: 'KCX 789Z', status: 'pending', dateSubmitted: '2024-02-09', operator: 'Emergency Rescue Services', contact: '+254 722 555 666' },
  ]);

  const fetchRegistrations = async () => {
    try {
      const data = await api.get(
        `/admin/registrations${selectedFilter !== "all" ? `?status=${selectedFilter}` : ""}`,
      );
      if (Array.isArray(data)) {
        setRegistrations(
          data.map((row) => {
            if (row.type === "hospital") {
              return {
                id: row._id || row.id,
                type: "hospital",
                name: row.hospital?.facilityName || "Hospital",
                location: row.hospital?.county || row.hospital?.address || "",
                capacity: row.hospital?.totalBeds || 0,
                status: row.status,
                dateSubmitted: row.createdAt ? new Date(row.createdAt).toISOString().slice(0, 10) : "",
                contact: row.hospital?.contactPhone || "",
              };
            }
            return {
              id: row._id || row.id,
              type: "ambulance",
              name: row.ambulance?.operatorName || "Ambulance",
              plateNumber: row.ambulance?.plateNumber || "",
              status: row.status,
              dateSubmitted: row.createdAt ? new Date(row.createdAt).toISOString().slice(0, 10) : "",
              operator: row.ambulance?.operatorName || "",
              contact: row.ambulance?.contactPhone || "",
            };
          }),
        );
      }
    } catch {
      // keep defaults
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [selectedFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      if (newStatus === "approved") {
        const res = await api.patch(`/admin/registrations/${id}/approve`, {});
        if (res?.tempPassword && res?.createdUser?.email) {
          setCredentials({
            email: res.createdUser.email,
            password: res.tempPassword,
          });
        }
      } else if (newStatus === "rejected") {
        await api.patch(`/admin/registrations/${id}/reject`, { reason: "Rejected by admin" });
      }
      fetchRegistrations();
    } catch {
      // no-op
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':  return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      default:         return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending':  return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default:         return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filtered = registrations.filter(reg => {
    const matchesFilter = selectedFilter === 'all' || reg.status === selectedFilter;
    const matchesSearch =
      reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reg.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reg.plateNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reg.operator || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Summary counts
  const counts = {
    all: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {credentials && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setCredentials(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">New User Created</h3>
            <p className="text-sm text-gray-600 mb-4">
              Share these credentials with the hospital or ambulance admin. They will be required to reset the password on first login.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
              <div className="mb-2"><span className="font-semibold">Email:</span> {credentials.email}</div>
              <div><span className="font-semibold">Temp Password:</span> {credentials.password}</div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setCredentials(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total" value={counts.all} color="bg-blue-500" onClick={() => setSelectedFilter('all')} active={selectedFilter === 'all'} />
        <SummaryCard label="Pending" value={counts.pending} color="bg-amber-500" onClick={() => setSelectedFilter('pending')} active={selectedFilter === 'pending'} />
        <SummaryCard label="Approved" value={counts.approved} color="bg-green-500" onClick={() => setSelectedFilter('approved')} active={selectedFilter === 'approved'} />
        <SummaryCard label="Rejected" value={counts.rejected} color="bg-red-500" onClick={() => setSelectedFilter('rejected')} active={selectedFilter === 'rejected'} />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, location or plate number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter + Export */}
          <div className="flex items-center space-x-3">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                {['Type', 'Name / Details', 'Location / Operator', 'Contact', 'Date Submitted', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No registrations found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50 transition-colors duration-200">
                    {/* Type */}
                    <td className="px-6 py-4">
                      <div className={`p-2 rounded-lg inline-flex ${reg.type === 'hospital' ? 'bg-blue-100' : 'bg-red-100'}`}>
                        {reg.type === 'hospital'
                          ? <Building2 className="w-5 h-5 text-blue-600" />
                          : <Ambulance className="w-5 h-5 text-red-600" />
                        }
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{reg.name}</p>
                      {reg.plateNumber && (
                        <span className="inline-block bg-gray-100 px-2 py-0.5 rounded font-mono text-xs mt-1">
                          {reg.plateNumber}
                        </span>
                      )}
                      {reg.capacity && (
                        <p className="text-sm text-gray-500 mt-1">{reg.capacity} beds</p>
                      )}
                    </td>

                    {/* Location / Operator */}
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{reg.location || reg.operator}</p>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{reg.contact}</p>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{reg.dateSubmitted}</p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center space-x-1 w-fit ${getStatusColor(reg.status)}`}>
                        {getStatusIcon(reg.status)}
                        <span className="capitalize ml-1">{reg.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors group" title="View Details">
                          <Eye className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                        </button>
                        {reg.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(reg.id, 'approved')}
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4 text-gray-600 group-hover:text-green-600" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(reg.id, 'rejected')}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filtered.length}</span> of <span className="font-semibold">{registrations.length}</span> registrations
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

const SummaryCard = ({ label, value, color, onClick, active }) => (
  <button
    onClick={onClick}
    className={`bg-white rounded-xl p-5 shadow-md border-2 transition-all duration-200 hover:shadow-lg text-left w-full ${
      active ? 'border-blue-500 scale-105' : 'border-gray-100 hover:border-gray-300'
    }`}
  >
    <div className="flex items-center space-x-3">
      <div className={`${color} w-3 h-3 rounded-full`}></div>
      <p className="text-sm text-gray-600 font-medium">{label}</p>
    </div>
    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
  </button>
);

export default Verification;
