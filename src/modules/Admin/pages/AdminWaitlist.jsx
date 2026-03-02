import React, { useState, useEffect } from 'react';
import { Users, Search, X, Mail, Phone, Instagram, Clock } from 'lucide-react';
import api from '../../../api/axios';
import { useToast } from '../../../context/ToastContext';

const AdminWaitlist = () => {
  const [waitlist, setWaitlist] = useState([]);
  const [filteredWaitlist, setFilteredWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    try {
      const response = await api.get('/api/admin/waitlist');
      setWaitlist(response.data);
      setFilteredWaitlist(response.data);
    } catch (error) {
      console.error('Error fetching waitlist:', error);
      addToast('Failed to load waitlist entries.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = waitlist.filter(entry => 
      entry.name?.toLowerCase().includes(term) ||
      entry.email?.toLowerCase().includes(term) ||
      entry.phone_number?.toLowerCase().includes(term) ||
      entry.instagram_handle?.toLowerCase().includes(term)
    );
    setFilteredWaitlist(filtered);
  }, [searchTerm, waitlist]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">WhatsApp Beta Waitlist</h1>
          <p className="text-gray-500 text-sm">Review individuals looking to join the WhatsApp Integration Beta.</p>
        </div>
        <div className="flex gap-3">
           <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium rounded-xl border border-green-100 dark:border-green-900/30 flex items-center gap-2">
             <Users size={18} />
             {waitlist.length} Sign Ups
           </div>
        </div>
      </div>

      {/* Global Search */}
      <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-dark-border flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name, email, phone, or IG handle..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none focus:outline-none flex-1 text-gray-900 dark:text-white placeholder-gray-400"
        />
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Instagram</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                {filteredWaitlist.length === 0 ? (
                  <tr>
                     <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                        No waitlist entries found.
                     </td>
                  </tr>
                ) : (
                  filteredWaitlist.map((entry) => (
                    <tr 
                      key={entry.id} 
                      onClick={() => setSelectedEntry(entry)}
                      className="hover:bg-gray-50/50 dark:hover:bg-dark-bg cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {new Date(entry.created_at).toLocaleDateString()}
                        <div className="text-xs">{new Date(entry.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900 dark:text-white">{entry.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-light flex items-center gap-2">
                           <Mail size={14} className="text-gray-400"/> {entry.email}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                           <Phone size={14} className="text-gray-400"/> {entry.phone_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry.instagram_handle ? (
                           <a 
                             href={`https://instagram.com/${entry.instagram_handle.replace('@', '')}`}
                             target="_blank" rel="noopener noreferrer"
                             onClick={(e) => e.stopPropagation()}
                             className="text-primary hover:underline font-medium text-sm flex items-center gap-1"
                           >
                             <Instagram size={14} /> {entry.instagram_handle}
                           </a>
                        ) : (
                           <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
        </div>
      </div>

      {/* Slide-out Offcanvas for Waitlist Entry Details */}
      {selectedEntry && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedEntry(null)}
          />
          
          {/* Offcanvas Panel */}
          <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white dark:bg-dark-card shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-100 dark:border-dark-border">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shadow-inner">
                   <Users size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Waitlist Details</h2>
                  <p className="text-xs text-gray-500">ID: #{selectedEntry.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEntry(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               
               {/* Identity Display */}
               <div className="text-center py-8 bg-gray-50 dark:bg-dark-bg rounded-2xl border border-gray-100 dark:border-dark-border relative overflow-hidden">
                 <div className="w-16 h-16 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-full flex items-center justify-center text-gray-500 font-black text-2xl mx-auto mb-3 shadow-sm">
                   {selectedEntry.name.charAt(0).toUpperCase()}
                 </div>
                 <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                   {selectedEntry.name}
                 </h1>
                 {selectedEntry.instagram_handle && (
                   <div className="inline-flex items-center gap-1 text-sm font-medium text-pink-600 bg-pink-50 dark:bg-pink-900/20 px-3 py-1 rounded-full mt-2">
                     <Instagram size={14} /> {selectedEntry.instagram_handle}
                   </div>
                 )}
               </div>

               {/* Complete Data Grid */}
               <div className="space-y-4">
                 
                 <div className="flex items-start gap-4">
                   <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                     <Mail size={18} />
                   </div>
                   <div className="w-full">
                     <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Email Address</p>
                     <p className="text-sm font-medium text-gray-900 dark:text-light mb-0.5">{selectedEntry.email}</p>
                   </div>
                 </div>

                 <div className="flex items-start gap-4">
                   <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg">
                     <Phone size={18} />
                   </div>
                   <div>
                     <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">WhatsApp Number</p>
                     <p className="text-sm font-medium text-gray-900 dark:text-light flex items-center justify-between gap-4">
                        {selectedEntry.phone_number}
                        <a 
                          href={`https://wa.me/${selectedEntry.phone_number.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold hover:bg-green-200 transition-colors"
                        >
                          Message
                        </a>
                     </p>
                   </div>
                 </div>

                 <div className="flex items-start gap-4">
                   <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-lg">
                     <Clock size={18} />
                   </div>
                   <div className="w-full">
                     <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Registered At</p>
                     <p className="text-sm font-medium text-gray-900 dark:text-light">{new Date(selectedEntry.created_at).toLocaleString()}</p>
                   </div>
                 </div>

               </div>
               
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg flex gap-3">
               <button 
                 onClick={() => setSelectedEntry(null)}
                 className="flex-1 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg text-gray-700 dark:text-light font-medium rounded-xl transition-colors shadow-sm"
               >
                 Close
               </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default AdminWaitlist;
