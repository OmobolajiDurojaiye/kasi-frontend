import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Power, PowerOff, Loader2, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../../../api/axios';

const AdminBroadcasts = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isDrafting, setIsDrafting] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '', type: 'info', is_active: false });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/announcements');
      if (res.data.status === 'success') {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load broadcasts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      const payload = { ...formData, is_active: true }; // New broadcasts are active by default
      await api.post('/api/admin/announcements', payload);
      setIsDrafting(false);
      setFormData({ title: '', message: '', type: 'info', is_active: false });
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish broadcast');
    } finally {
      setSubmitLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.post(`/api/admin/announcements/${id}/toggle`);
      fetchAnnouncements();
    } catch (err) {
      setError('Failed to toggle broadcast status');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={20} className="text-yellow-600" />;
      case 'success': return <CheckCircle size={20} className="text-green-600" />;
      default: return <Info size={20} className="text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Megaphone className="text-orange-500" /> Global Broadcasts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Push real-time system alerts to all users across the platform.</p>
        </div>
        <button 
          onClick={() => setIsDrafting(!isDrafting)}
          className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {isDrafting ? <X size={18} /> : <Plus size={18} />}
          {isDrafting ? 'Cancel Draft' : 'New Broadcast'}
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      {isDrafting && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-orange-100 dark:border-orange-900/30">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Draft New Broadcast</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alert Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white" placeholder="e.g. Scheduled Maintenance" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banner Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white">
                  <option value="info">Information (Blue)</option>
                  <option value="warning">Warning (Yellow)</option>
                  <option value="success">Success (Green)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description Message</label>
              <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-green-500 outline-none min-h-[100px] text-gray-900 dark:text-white" placeholder="Write your broadcast message here..."></textarea>
            </div>
            <button disabled={submitLoading} type="submit" className="w-full md:w-auto px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 justify-center disabled:opacity-50">
              {submitLoading ? <Loader2 size={18} className="animate-spin" /> : <Megaphone size={18} />} Publish Now
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Broadcast</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Message</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Date Posted</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {getIcon(item.type)}
                        <span className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">{item.title}</span>
                      </div>
                    </td>
                    <td className="p-4 max-w-sm truncate text-sm text-gray-600 dark:text-gray-400">{item.message}</td>
                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full whitespace-nowrap ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {item.is_active ? 'Live' : 'Archived'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => toggleStatus(item.id)} 
                        className={`p-2 rounded-lg transition-colors ${item.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                        title={item.is_active ? "Take Offline" : "Make Live"}
                      >
                        {item.is_active ? <PowerOff size={18} /> : <Power size={18} />}
                      </button>
                    </td>
                  </tr>
                ))}
                {announcements.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">No broadcasts found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBroadcasts;
