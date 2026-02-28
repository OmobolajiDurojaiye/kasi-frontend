import React, { useState, useEffect } from 'react';
import { Shield, Users, FileText, CreditCard, Package, Loader2 } from 'lucide-react';
import api from '../../../api/axios';

const formatNaira = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/admin/stats');
        if (isMounted) {
          if (response.data && response.data.status === 'success') {
            setData(response.data.data);
          } else {
            setError("Failed to load admin stats");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || "An error occurred");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-theme(spacing.16))]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-[#FCFAFA] dark:bg-gray-900 min-h-[calc(100vh-theme(spacing.16))] relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h1>
        </div>
      </div>

      {/* Top Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="bg-green-50 dark:bg-green-500/10 p-3 rounded-lg text-green-600 dark:text-green-500">
            <Users className="w-6 h-6 shrink-0" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Users</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.total_users.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="bg-green-50 dark:bg-green-500/10 p-3 rounded-lg text-green-600 dark:text-green-500">
            <CreditCard className="w-6 h-6 shrink-0" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Platform Revenue</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatNaira(data.total_platform_revenue)}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="bg-green-50 dark:bg-green-500/10 p-3 rounded-lg text-green-600 dark:text-green-500">
            <FileText className="w-6 h-6 shrink-0" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Invoices</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.total_invoices.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="bg-green-50 dark:bg-green-500/10 p-3 rounded-lg text-green-600 dark:text-green-500">
            <Package className="w-6 h-6 shrink-0" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Products</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.total_products.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-700 flex items-center gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-lg text-emerald-600 dark:text-emerald-500">
            <CreditCard className="w-6 h-6 shrink-0" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Circulating Credits</div>
            <div className={`text-2xl font-bold ${data.total_platform_credits < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {data.total_platform_credits.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Users</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Business Name</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credits</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {data.users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">#{u.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{u.business_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                <span className={`px-2 py-1 rounded-full ${u.kasi_credits < 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {u.kasi_credits}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {u.is_admin ? (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Admin</span>
                                ) : (
                                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">User</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {new Date(u.created_at).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    
    </div>
  );
};

export default AdminDashboard;
