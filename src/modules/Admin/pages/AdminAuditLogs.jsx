import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, ChevronLeft, ChevronRight, Info, Eye } from 'lucide-react';
import api from '../../../api/axios';

const AdminAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal state
    const [selectedPayload, setSelectedPayload] = useState(null);

    useEffect(() => {
        fetchLogs(page, searchQuery);
    }, [page, searchQuery]);

    const fetchLogs = async (pageNumber, filter) => {
        try {
            setLoading(true);
            const queryURL = `/api/admin/audit-logs?page=${pageNumber}&per_page=50${filter ? `&action=${filter}` : ''}`;
            const res = await api.get(queryURL);
            setLogs(res.data.logs);
            setTotalPages(res.data.pages);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch admin audit logs:', err);
            setError(err.response?.data?.message || 'Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setPage(1); // Reset to first page on new search
    };

    const formatAction = (action) => {
        return action.replace(/_/g, ' ');
    };
    
    const renderActionBadge = (action) => {
        const actionStr = action.toLowerCase();
        let colorClass = "bg-gray-100 text-gray-700";
        
        if (actionStr.includes('login') || actionStr.includes('success')) {
             colorClass = "bg-green-100/50 text-green-700 dark:bg-green-500/10 dark:text-green-400";
        } else if (actionStr.includes('delete')) {
             colorClass = "bg-red-100/50 text-red-700 dark:bg-red-500/10 dark:text-red-400";
        } else if (actionStr.includes('create') || actionStr.includes('add') || actionStr.includes('initialized')) {
             colorClass = "bg-blue-100/50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
        } else if (actionStr.includes('update') || actionStr.includes('change')) {
             colorClass = "bg-yellow-100/50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400";
        } else if (actionStr.includes('paid')) {
             colorClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400";
        }
        
        return (
            <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${colorClass}`}>
                {formatAction(action)}
            </span>
        );
    };

    if (error) {
        return (
            <div className="p-6 md:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center max-w-md">
                    <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Global Audit Logs</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Immutable, system-wide ledger of critical security and monetary events.</p>
                    </div>
                </div>
                
                {/* Search */}
                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search by action (e.g. INVOICE_PAID)" 
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all text-sm"
                    />
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP Address</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Payload</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No audit records found.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 font-mono">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.user ? (
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{log.user.business_name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">ID: {log.user.id} | {log.user.email}</div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">System / Unknown</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {renderActionBadge(log.action)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500 dark:text-gray-400">
                                            {log.ip_address || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button 
                                                onClick={() => setSelectedPayload({action: log.action, details: log.resource_details})}
                                                disabled={!log.resource_details}
                                                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                title="View JSON Payload"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Showing page <span className="font-semibold text-gray-900 dark:text-white">{page}</span> of <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
                        </span>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-1"
                            >
                                <ChevronLeft size={16} /> Prev
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-1"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Payload Modal */}
            {selectedPayload && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm z-[100]">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Audit Payload Details</h3>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedPayload.action}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedPayload(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <pre className="text-xs p-4 rounded-xl bg-gray-900 text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">
                                {(() => {
                                    try {
                                        // Try to pretty print JSON if it's a valid JSON string
                                        const parsed = JSON.parse(selectedPayload.details);
                                        return JSON.stringify(parsed, null, 2);
                                    } catch (e) {
                                        // If not JSON, just return the raw string
                                        return selectedPayload.details;
                                    }
                                })()}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default AdminAuditLogs;
