import React, { useState, useEffect } from 'react';
import { Users, Loader2, Search } from 'lucide-react';
import api from '../../../api/axios';
import AdminUserDetailModal from '../components/AdminUserDetailModal';

const formatNaira = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (id) => {
      setSelectedUserId(id);
      setIsModalOpen(true);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/admin/users');
        if (isMounted) {
          if (response.data && response.data.status === 'success') {
            setUsers(response.data.data);
          } else {
            setError("Failed to load global users");
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
    fetchUsers();
    return () => { isMounted = false; };
  }, []);

  const filteredUsers = users.filter(u => 
      u.business_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 min-h-[calc(100vh-theme(spacing.16))] relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Platform Users</h1>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search business or email..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Business Name</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined Date</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Invoices</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credits</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredUsers.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                No users found matching your search.
                            </td>
                        </tr>
                    ) : (
                        filteredUsers.map((u, index) => (
                            <tr 
                              key={u.id} 
                              onClick={() => handleRowClick(u.id)}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer hover:shadow-md hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-2"
                              style={{ animationFillMode: 'both', animationDelay: `${index * 50}ms` }}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">#{u.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{u.business_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(u.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center text-gray-900 dark:text-white">{u.total_invoices}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                    <span className={`px-3 py-1 rounded-full ${u.kasi_credits < 0 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                                        {u.kasi_credits}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-600 dark:text-gray-400">{formatNaira(u.total_revenue)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    
      <AdminUserDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userId={selectedUserId} 
      />
    </div>
  );
};

export default AdminUsers;
