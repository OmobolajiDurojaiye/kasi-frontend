import React, { useState, useEffect } from 'react';
import { Shield, Plus, Loader2, Search, UserCheck } from 'lucide-react';
import api from '../../../api/axios';

const AdminStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [formData, setFormData] = useState({ email: '', admin_role: 'Finance Admin', first_name: '' });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/list-admins');
      if (response.data?.status === 'success') {
        setStaff(response.data.data);
      } else {
        setError("Failed to load staff list.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e) => {
      e.preventDefault();
      setFormLoading(true);
      setFormError(null);
      setFormSuccess(null);

      try {
          const res = await api.post('/api/admin/create-admin', formData);
          if (res.data?.status === 'success') {
              setFormSuccess(res.data.message + (res.data.temp_password ? ` Temp Password: ${res.data.temp_password}` : ''));
              setFormData({ email: '', admin_role: 'Finance Admin', first_name: '' });
              fetchStaff(); // Refresh the table
              setTimeout(() => setIsAdding(false), 5000);
          }
      } catch (err) {
          setFormError(err.response?.data?.message || err.message || "Failed to create staff member");
      } finally {
          setFormLoading(false);
      }
  };

  const filteredStaff = staff.filter(s => 
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (s.business_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
      switch (role) {
          case 'Super Admin': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
          case 'Finance Admin': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
          case 'Support Admin': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
          default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      }
  };

  if (loading && staff.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-theme(spacing.16))]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error && staff.length === 0) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 min-h-[calc(100vh-theme(spacing.16))] flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl shadow border border-red-100 max-w-md text-center">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 min-h-[calc(100vh-theme(spacing.16))] relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search staff..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          <button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-green-600 dark:hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Staff</span>
          </button>
        </div>
      </div>

      {isAdding && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 animate-in slide-in-from-top-4 fade-in duration-300">
              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <UserCheck size={20} className="text-green-600" />
                  Invite / Upgrade Staff Member
              </h2>
              {formError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{formError}</div>}
              {formSuccess && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200 break-all">{formSuccess}</div>}
              
              <form onSubmit={handleCreateStaff} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Email Address</label>
                      <input 
                          type="email" 
                          required
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                          placeholder="staff@kasi.com"
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">First Name</label>
                      <input 
                          type="text" 
                          required
                          value={formData.first_name}
                          onChange={e => setFormData({...formData, first_name: e.target.value})}
                          className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                          placeholder="John"
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Admin Role</label>
                      <select 
                          value={formData.admin_role}
                          onChange={e => setFormData({...formData, admin_role: e.target.value})}
                          className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      >
                          <option value="Finance Admin">Finance Admin</option>
                          <option value="Support Admin">Support Admin</option>
                          <option value="Super Admin">Super Admin</option>
                      </select>
                  </div>
                  <div>
                      <button 
                          type="submit" 
                          disabled={formLoading}
                          className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg p-2.5 font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                          {formLoading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
                      </button>
                  </div>
              </form>
          </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account ID</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Staff Email</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Display Name</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin Role</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredStaff.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                No staff members found.
                            </td>
                        </tr>
                    ) : (
                        filteredStaff.map((u, i) => (
                            <tr 
                              key={u.id} 
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors animate-in fade-in slide-in-from-bottom-2"
                              style={{ animationFillMode: 'both', animationDelay: `${i * 50}ms` }}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-300">#{u.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{u.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.business_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                     <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadge(u.admin_role || 'Super Admin')}`}>
                                        {u.admin_role || 'Super Admin (Legacy)'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(u.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    
    </div>
  );
};

export default AdminStaff;
