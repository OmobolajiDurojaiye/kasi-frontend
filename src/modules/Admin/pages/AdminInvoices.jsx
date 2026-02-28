import React, { useState, useEffect } from 'react';
import { FileText, Loader2, Search } from 'lucide-react';
import api from '../../../api/axios';
import AdminInvoiceDetailModal from '../components/AdminInvoiceDetailModal';

const formatNaira = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'Sent': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
};

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (id) => {
      setSelectedInvoiceId(id);
      setIsModalOpen(true);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/admin/invoices');
        if (isMounted) {
          if (response.data && response.data.status === 'success') {
            setInvoices(response.data.data);
          } else {
            setError("Failed to load global invoices");
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
    fetchInvoices();
    return () => { isMounted = false; };
  }, []);

  const filteredInvoices = invoices.filter(inv => 
      inv.business_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      inv.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <FileText className="w-8 h-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Global Invoices</h1>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search invoice or business..."
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
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reference</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Business Generator</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date Issued</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredInvoices.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                No invoices found matching your search.
                            </td>
                        </tr>
                    ) : (
                        filteredInvoices.map((inv, index) => (
                            <tr 
                              key={inv.id} 
                              onClick={() => handleRowClick(inv.id)}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer hover:shadow-md hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-2"
                              style={{ animationFillMode: 'both', animationDelay: `${index * 50}ms` }}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{inv.reference}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{inv.business_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{inv.customer_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{inv.date_issued}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{formatNaira(inv.total_amount)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(inv.status)}`}>
                                        {inv.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    
      <AdminInvoiceDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        invoiceId={selectedInvoiceId} 
      />
    </div>
  );
};

export default AdminInvoices;
