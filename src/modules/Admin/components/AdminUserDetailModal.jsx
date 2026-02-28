import React, { useState, useEffect } from 'react';
import { X, Loader2, Package, Users, FileText, Ban, ShieldAlert, CheckCircle, LogIn } from 'lucide-react';
import api from '../../../api/axios';

const AdminUserDetailModal = ({ isOpen, onClose, userId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !userId) return;

    let isMounted = true;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/admin/users/${userId}`);
        if (isMounted) {
          if (response.data?.status === 'success') {
            setData(response.data.data);
          } else {
            setError("Failed to fetch user details.");
          }
        }
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || "An error occurred");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDetail();
    
    return () => { isMounted = false; };
  }, [isOpen, userId]);

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      const res = await api.post(`/api/admin/users/${userId}/status`, { account_status: newStatus });
      if (res.data.status === 'success') {
         setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${newStatus} user`);
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async () => {
      try {
          const res = await api.post(`/api/admin/users/${userId}/impersonate`);
          if (res.data.status === 'success') {
              // Save the current admin token securely before swapping
              const currentToken = localStorage.getItem('token');
              localStorage.setItem('admin_token', currentToken);
              
              // Inject the target user's token and hard-reload the app state
              localStorage.setItem('token', res.data.access_token);
              window.location.href = '/'; 
          }
      } catch (err) {
          setError(err.response?.data?.message || "Failed to impersonate user.");
      }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto transform transition-transform duration-300 translate-x-0">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Intelligence</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-4" />
              <p className="text-gray-500">Compiling user records...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center">{error}</div>
          ) : data ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Profile Card */}
              <div className="bg-green-50/50 dark:bg-green-900/10 p-6 rounded-2xl border border-green-100 dark:border-green-800 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                    {data.business_name}
                    {data.account_status === 'suspended' && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-bold uppercase">Suspended</span>}
                    {data.account_status === 'banned' && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold uppercase">Banned</span>}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{data.email}</p>
                  <div className="mt-4 flex gap-4 text-sm font-medium flex-wrap">
                    <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">ID: #{data.id}</span>
                    <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">Joined: {new Date(data.created_at).toLocaleDateString()}</span>
                    <span className={`px-3 py-1 rounded-full shadow-sm border font-bold ${data.kasi_credits < 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        Credits: {data.kasi_credits}
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                  {data.account_status !== 'active' ? (
                    <button onClick={() => handleStatusChange('active')} className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-bold transition-colors">
                      <CheckCircle size={16} /> Activate
                    </button>
                  ) : null}
                  {data.account_status !== 'suspended' ? (
                    <button onClick={() => handleStatusChange('suspended')} className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg text-sm font-bold transition-colors">
                      <ShieldAlert size={16} /> Suspend
                    </button>
                  ) : null}
                  {data.account_status !== 'banned' ? (
                    <button onClick={() => handleStatusChange('banned')} className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-bold transition-colors">
                      <Ban size={16} /> Ban User
                    </button>
                  ) : null}
                  <button onClick={handleImpersonate} className="flex items-center justify-center gap-2 w-full mt-2 py-2 px-3 bg-gray-900 hover:bg-black text-white dark:bg-gray-100 dark:text-gray-900 rounded-lg text-sm font-bold transition-colors">
                    <LogIn size={16} /> Login As User
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Clients List */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                    <Users size={18} className="text-green-600" />
                    Clients ({data.clients?.length || 0})
                  </div>
                  {data.clients?.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {data.clients.map(c => (
                        <div key={c.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{c.name}</p>
                          <p className="text-xs text-gray-500">{c.email}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No clients compiled.</p>
                  )}
                </div>

                {/* Products List */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                    <Package size={18} className="text-green-600" />
                    Products ({data.products?.length || 0})
                  </div>
                  {data.products?.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {data.products.map(p => (
                        <div key={p.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex justify-between items-center">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate mr-4">{p.name}</p>
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">₦{p.price}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No products configured.</p>
                  )}
                </div>
              </div>

              {/* Invoices List */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                  <FileText size={18} className="text-green-600" />
                  Associated Invoices ({data.invoices?.length || 0})
                </div>
                {data.invoices?.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {data.invoices.map(inv => (
                      <div key={inv.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-green-200 transition-colors flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{inv.reference}</p>
                          <p className="text-xs text-gray-500 mt-1">{inv.customer?.name} &bull; {inv.date_issued}</p>
                        </div>
                        <div className="text-right">
                           <p className="font-bold text-gray-900 dark:text-white text-sm">₦{inv.total_amount?.toLocaleString()}</p>
                           <p className={`text-[10px] uppercase font-bold mt-1 px-2 py-0.5 rounded-full inline-block ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{inv.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No invoices generated.</p>
                )}
              </div>

            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default AdminUserDetailModal;
