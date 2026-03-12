import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { History, Search, FileText, ChevronLeft, ChevronRight, Activity, Eye, X } from 'lucide-react';

const ActivityLogsTable = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedPayload, setSelectedPayload] = useState(null);
    
    useEffect(() => {
        fetchLogs(page);
    }, [page]);

    const fetchLogs = async (pageNumber) => {
        try {
            setLoading(true);
            const res = await api.get(`/api/auth/audit-logs?page=${pageNumber}&per_page=15`);
            setLogs(res.data.logs);
            setTotalPages(res.data.pages);
        } catch (error) {
            console.error('Failed to fetch activity logs:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const formatAction = (action) => {
        return action.replace(/_/g, ' ');
    };
    
    // Convert abstract JSON payload into human-readable English
    const translatePayloadToEnglish = (action, detailsRaw) => {
        if (!detailsRaw) return "No specific details provided for this action.";
        
        let details = {};
        try {
            details = JSON.parse(detailsRaw);
        } catch (e) {
            return `System tracked: ${detailsRaw}`;
        }

        const actionStr = action.toUpperCase();

        if (actionStr === 'LOGIN_SUCCESS') {
            return `Successfully logged in via ${details.email || 'account credentials'}.`;
        }
        if (actionStr === 'PROFILE_UPDATED') {
            return `Profile settings were updated.`;
        }
        if (actionStr === 'INVOICE_CREATED') {
            const amount = details.total_amount ? `amounting to ₦${details.total_amount}` : '';
            return `Created a new invoice (ID: ${details.invoice_id}) for ${details.customer_name || 'a customer'} ${amount}.`;
        }
        if (actionStr === 'INVOICE_DELETED') {
            return `Deleted invoice (ID: ${details.invoice_id}, Ref: ${details.reference}).`;
        }
        if (actionStr === 'INVOICE_PAID') {
            return `Invoice (ID: ${details.invoice_id}) was marked as Paid. Received payment of ₦${details.amount_paid}.`;
        }
        if (actionStr === 'INVOICE_STATUS_CHANGED') {
            return `Changed status of invoice (ID: ${details.invoice_id}) from ${details.old_status} to ${details.new_status}.`;
        }
        if (actionStr === 'PRODUCT_CREATED') {
            return `Added a new product "${details.product_name}" priced at ₦${details.product_price}.`;
        }
        if (actionStr === 'PRODUCT_DELETED') {
            return `Removed product "${details.product_name}" (ID: ${details.product_id}) from catalog.`;
        }
        if (actionStr === 'SERVICE_CREATED') {
            return `Added a new service "${details.service_name}" priced at ₦${details.service_price}.`;
        }
        if (actionStr === 'SERVICE_DELETED') {
            return `Removed service "${details.service_name}" (ID: ${details.service_id}) from catalog.`;
        }
        if (actionStr === 'TOPUP_INITIALIZED') {
            return `Started wallet top-up process for ₦${details.amount} (Ref: ${details.reference}).`;
        }
        if (actionStr === 'TOPUP_VERIFIED_SUCCESS') {
            return `Successfully received wallet top-up of ₦${details.amount} (Ref: ${details.reference}).`;
        }
        if (actionStr === 'AI_USAGE') {
            return `Used Kasi AI features which consumed ${details.tokens_used} tokens (Cost: ₦${details.cost_naira}).`;
        }

        // Fallback for unknown payloads
        const keys = Object.keys(details);
        return `A ${formatAction(action).toLowerCase()} action occurred involving: ${keys.join(', ')}.`;
    };

    const renderActionBadge = (action) => {
        const actionStr = action.toLowerCase();
        let colorClass = "bg-gray-100 text-gray-700";
        
        if (actionStr.includes('login') || actionStr.includes('success')) {
             colorClass = "bg-green-100 text-green-700";
        } else if (actionStr.includes('delete')) {
             colorClass = "bg-red-100 text-red-700";
        } else if (actionStr.includes('create') || actionStr.includes('add')) {
             colorClass = "bg-blue-100 text-blue-700";
        } else if (actionStr.includes('update') || actionStr.includes('change')) {
             colorClass = "bg-yellow-100 text-yellow-700";
        } else if (actionStr.includes('paid')) {
             colorClass = "bg-emerald-100 text-emerald-800";
        }
        
        return (
            <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${colorClass}`}>
                {formatAction(action)}
            </span>
        );
    }

    if (loading && logs.length === 0) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                   <h2 className="text-xl font-bold text-dark flex items-center gap-2">
                        <History className="text-primary" size={24} />
                        Security & Activity Logs
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">An immutable record of critical actions performed on your account.</p>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">IP Address</th>
                                <th className="px-6 py-4">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Activity size={32} className="text-gray-300 mb-2" />
                                            <p>No activity logs found yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr 
                                        key={log.id} 
                                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                                        onClick={() => setSelectedPayload({action: log.action, details: log.resource_details})}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400 font-medium">
                                            {new Date(log.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {renderActionBadge(log.action)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-500 font-mono text-xs">
                                            {log.ip_address || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 flex items-center justify-between">
                                            <div className="max-w-[200px] sm:max-w-xs truncate text-xs bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-2 py-1 rounded font-mono">
                                                {log.resource_details || '—'}
                                            </div>
                                            <div className="p-1 rounded bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Eye size={14} className="text-primary" />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            Page <span className="font-semibold text-dark">{page}</span> of <span className="font-semibold text-dark">{totalPages}</span>
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Info Notice */}
            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex gap-3 mt-4 text-sm text-blue-800 dark:text-blue-300">
                <FileText size={20} className="text-blue-500 shrink-0" />
                <p>These logs are automatically generated by the Kasi immutable ledger system for your security and compliance. They cannot be altered or deleted manually.</p>
            </div>

            {/* Payload Offcanvas/Modal */}
            {selectedPayload && (
                <div 
                    className="fixed inset-0 z-[100] flex justify-end bg-gray-900/40 backdrop-blur-sm transition-opacity" 
                    onClick={() => setSelectedPayload(null)}
                >
                    <div 
                        className="w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col transform transition-transform"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start bg-gray-50 dark:bg-gray-800/50">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Detailed Audit Record</h3>
                                <div className="mt-2 inline-flex">
                                    {renderActionBadge(selectedPayload.action)}
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedPayload(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800 dark:hover:text-white rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-gray-900 space-y-6">
                            
                            {/* Human Readable English translation */}
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Summary</h4>
                                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-xl text-sm text-gray-800 dark:text-gray-200 leading-relaxed shadow-sm">
                                    {translatePayloadToEnglish(selectedPayload.action, selectedPayload.details)}
                                </div>
                            </div>
                            
                            {/* Raw JSON Developer View */}
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Raw JSON Payload</h4>
                                <pre className="text-xs p-4 rounded-xl bg-gray-900 text-green-400 font-mono overflow-x-auto whitespace-pre-wrap shadow-inner border border-gray-800">
                                    {(() => {
                                        try {
                                            const parsed = JSON.parse(selectedPayload.details);
                                            return JSON.stringify(parsed, null, 2);
                                        } catch (e) {
                                            return selectedPayload.details || 'No additional details provided.';
                                        }
                                    })()}
                                </pre>
                            </div>
                            
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityLogsTable;
