import React, { useState, useEffect } from 'react';
import { CreditCard, Search, ArrowDownIcon, ArrowUpIcon, DollarSign, Activity, X, Calendar, User, FileText, Hash } from 'lucide-react';
import api from '../../../api/axios';
import { useToast } from '../../../context/ToastContext';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, purchase, ai_generation
  const [selectedTx, setSelectedTx] = useState(null); // For offcanvas details
  const { addToast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/api/admin/transactions');
      setTransactions(res.data.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.business_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      tx.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.reference_id && tx.reference_id.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesFilter = filterType === 'all' || tx.transaction_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = transactions
    .filter(t => t.transaction_type === 'purchase' && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalAiUsage = transactions
    .filter(t => t.transaction_type === 'ai_generation' && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Transactions</h1>
        <p className="text-gray-500 text-sm mt-1">
          Monitor all Kasi Credit top-ups and AI consumption across the platform.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-dark-card rounded-xl p-5 border border-gray-100 dark:border-dark-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Top-up Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">₦ {totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <DollarSign size={24} />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-xl p-5 border border-gray-100 dark:border-dark-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Credits Consumed (AI Invoices)</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalAiUsage.toLocaleString()} Credits</h3>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
            <Activity size={24} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-dark-card p-4 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm">
        <div className="relative w-full sm:w-96 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search merchants, emails, or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
          >
            <option value="all">All Transactions</option>
            <option value="purchase">Top-ups Only (Purchases)</option>
            <option value="ai_generation">Usage Only (AI Generation)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 pl-4 text-center text-gray-500 text-sm">
            {searchTerm ? 'No transactions found matching your search.' : 'No transactions found.'}
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-dark-bg text-gray-500 font-medium border-b border-gray-100 dark:border-dark-border">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Merchant</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                {filteredTransactions.map((tx) => (
                  <tr 
                    key={tx.id} 
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-gray-50/50 dark:hover:bg-dark-bg cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString()}
                      <div className="text-xs">{new Date(tx.created_at).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 dark:text-white">{tx.business_name}</div>
                      <div className="text-xs text-gray-500">{tx.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-light">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.transaction_type === 'purchase' ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                          <ArrowUpIcon size={12} /> Top Up
                        </span>
                      ) : tx.transaction_type === 'ai_generation' ? (
                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
                          <ArrowDownIcon size={12} /> AI Usage
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold uppercase">{tx.transaction_type}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="text-xs font-mono bg-gray-100 dark:bg-dark-bg px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                         {tx.reference_id || 'N/A'}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-out Offcanvas for Transaction Details */}
      {selectedTx && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedTx(null)}
          />
          
          {/* Offcanvas Panel */}
          <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white dark:bg-dark-card shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-100 dark:border-dark-border">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedTx.transaction_type === 'purchase' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                   {selectedTx.transaction_type === 'purchase' ? <ArrowUpIcon size={20} /> : <ArrowDownIcon size={20} />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Transaction Details</h2>
                  <p className="text-xs text-gray-500">{new Date(selectedTx.created_at).toLocaleString()}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTx(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               
               {/* Amount Gigantic Display */}
               <div className="text-center py-6 bg-gray-50 dark:bg-dark-bg rounded-2xl border border-gray-100 dark:border-dark-border">
                 <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                 <h1 className={`text-4xl font-black tracking-tight ${selectedTx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                   {selectedTx.amount > 0 ? '+' : ''}{selectedTx.amount} <span className="text-lg text-gray-400 font-medium">CR</span>
                 </h1>
               </div>

               {/* Meta Details Grid */}
               <div className="space-y-4">
                 
                 <div className="flex items-start gap-4">
                   <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                     <User size={18} />
                   </div>
                   <div>
                     <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Merchant Info</p>
                     <p className="text-sm font-medium text-gray-900 dark:text-light mb-0.5">{selectedTx.business_name}</p>
                     <p className="text-xs text-gray-500">{selectedTx.email}</p>
                   </div>
                 </div>

                 <div className="flex items-start gap-4">
                   <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-lg">
                     <FileText size={18} />
                   </div>
                   <div>
                     <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Description</p>
                     <p className="text-sm font-medium text-gray-900 dark:text-light">{selectedTx.description}</p>
                   </div>
                 </div>

                 <div className="flex items-start gap-4">
                   <div className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg">
                     <Hash size={18} />
                   </div>
                   <div className="w-full">
                     <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Reference ID</p>
                     <div className="text-xs font-mono bg-gray-50 dark:bg-dark-bg p-2 rounded border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 break-all">
                       {selectedTx.reference_id || 'N/A'}
                     </div>
                   </div>
                 </div>

               </div>
               
               {selectedTx.transaction_type === 'purchase' && (
                 <div className="mt-8 p-4 bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl">
                   <p className="text-xs font-medium text-green-800 dark:text-green-400 flex items-center gap-2">
                     <DollarSign size={14} /> This transaction was a successful Paystack top-up.
                   </p>
                 </div>
               )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
               <button 
                 onClick={() => setSelectedTx(null)}
                 className="w-full py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg text-gray-700 dark:text-light font-medium rounded-xl transition-colors shadow-sm"
               >
                 Close Details
               </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default AdminTransactions;
