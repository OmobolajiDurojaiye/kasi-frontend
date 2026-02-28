import React, { useState, useEffect } from 'react';
import { X, Loader2, ListOrdered, UserCircle, Users } from 'lucide-react';
import api from '../../../api/axios';

const formatNaira = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const AdminInvoiceDetailModal = ({ isOpen, onClose, invoiceId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !invoiceId) return;

    let isMounted = true;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/admin/invoices/${invoiceId}`);
        if (isMounted) {
          if (response.data?.status === 'success') {
            setData(response.data.data);
          } else {
            setError("Failed to fetch invoice details.");
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
  }, [isOpen, invoiceId]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto transform transition-transform duration-300 translate-x-0">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoice Inspector</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-4" />
              <p className="text-gray-500">Decrypting invoice parameters...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center">{error}</div>
          ) : data ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Top Banner */}
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Receipt ID</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{data.reference}</h3>
                </div>
                <div className="md:text-right">
                   <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Status</p>
                   <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      data.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      data.status === 'Overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                   }`}>{data.status}</span>
                </div>
              </div>

              {/* People Context */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 border border-green-100 dark:border-green-900/40 bg-green-50/50 dark:bg-green-500/5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                        <UserCircle className="text-green-600 w-5 h-5"/>
                        <p className="font-semibold text-gray-900 dark:text-white">Billed From (Merchant)</p>
                    </div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{data.merchant?.business_name}</p>
                    <p className="text-sm text-gray-500 mt-1">{data.merchant?.email}</p>
                </div>
                <div className="p-5 border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="text-blue-600 w-5 h-5"/>
                        <p className="font-semibold text-gray-900 dark:text-white">Billed To (Client)</p>
                    </div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{data.customer?.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{data.customer?.email}</p>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
                      <ListOrdered size={18} className="text-gray-500" />
                      Line Items ({data.items?.length || 0})
                    </div>
                </div>
                {data.items?.length > 0 ? (
                  <div className="space-y-3">
                    {data.items.map(item => (
                      <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white leading-snug">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-6 sm:w-1/3 justify-between">
                            <div className="text-sm text-gray-500">
                                {item.quantity} x {formatNaira(item.unit_price)}
                            </div>
                            <div className="font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                {formatNaira(item.total_price)}
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No line items recorded.</p>
                )}
              </div>

              {/* Totals Summary */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                 <div className="w-full md:w-1/2 ml-auto space-y-3">
                    <div className="flex justify-between text-sm text-gray-500 p-2">
                        <span>Subtotal</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatNaira(data.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 p-2 rounded bg-gray-50 dark:bg-gray-800/30">
                        <span>VAT (Tax)</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatNaira(data.tax_amount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white p-3 bg-gray-100 dark:bg-gray-800 rounded-xl mt-2">
                        <span>Total Paid</span>
                        <span className="text-green-600 dark:text-green-500">{formatNaira(data.total_amount)}</span>
                    </div>
                 </div>
              </div>

            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default AdminInvoiceDetailModal;
