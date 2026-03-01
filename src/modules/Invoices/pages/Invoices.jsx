import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, MoreHorizontal, FileText, Download, Share2, Eye, Trash, CheckCircle } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../context/ToastContext';
import DeleteConfirmModal from '../../../components/ui/DeleteConfirmModal';
import DetailModal from '../../../components/ui/DetailModal';
import { TableSkeleton } from '../../../components/ui/Skeleton';

/* ── Invoice Detail Modal Content ─────────────────── */
const InvoiceDetail = ({ invoice }) => {
    if (!invoice) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-700';
            case 'Unpaid': return 'bg-red-100 text-red-700';
            case 'Pending': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const subtotal = invoice.items?.reduce((sum, item) => sum + (item.total_price || item.quantity * item.unit_price), 0) || invoice.total_amount;
    const tax = subtotal * 0.075;

    return (
        <div className="space-y-5">
            {/* Status + Dates */}
            <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                </span>
                <span className="text-xs text-gray-400">Ref: {invoice.reference}</span>
            </div>

            {/* Customer info */}
            <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Billed To</p>
                <p className="font-bold text-gray-900">{invoice.customer?.name}</p>
                {invoice.customer?.phone && <p className="text-sm text-gray-500">{invoice.customer.phone}</p>}
                {invoice.customer?.email && <p className="text-sm text-gray-500">{invoice.customer.email}</p>}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date Issued</p>
                    <p className="font-semibold text-gray-800 text-sm">{invoice.date_issued}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Due Date</p>
                    <p className="font-semibold text-gray-800 text-sm">{invoice.due_date}</p>
                </div>
            </div>

            {/* Line Items */}
            <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Items</p>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-left">
                                <th className="px-4 py-2.5 text-xs text-gray-400 font-semibold">Item</th>
                                <th className="px-4 py-2.5 text-xs text-gray-400 font-semibold text-center">Qty</th>
                                <th className="px-4 py-2.5 text-xs text-gray-400 font-semibold text-right">Price</th>
                                <th className="px-4 py-2.5 text-xs text-gray-400 font-semibold text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {invoice.items?.map((item, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3 text-gray-800">{item.description}</td>
                                    <td className="px-4 py-3 text-gray-500 text-center">{item.quantity}</td>
                                    <td className="px-4 py-3 text-gray-500 text-right">₦{item.unit_price?.toLocaleString()}</td>
                                    <td className="px-4 py-3 font-semibold text-gray-800 text-right">₦{(item.total_price || item.quantity * item.unit_price)?.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Totals */}
            <div className="bg-green-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-800">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">VAT (7.5%)</span>
                    <span className="text-gray-800">₦{tax.toLocaleString()}</span>
                </div>
                <div className="h-px bg-green-200 my-1" />
                <div className="flex justify-between">
                    <span className="font-bold text-green-800">Total</span>
                    <span className="font-bold text-green-800 text-lg">₦{(subtotal + tax).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

/* ── Invoice Actions Dropdown ─────────────────────── */
const InvoiceActions = ({ invoice, onInvoiceUpdated, onInvoiceDeleted, onViewDetails }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const { token } = useAuth();
    const { addToast } = useToast();
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleShare = () => {
        const message = `Hello ${invoice.customer.name}, here is your invoice for ₦${invoice.total_amount.toLocaleString()}. Please transfer to the bank details listed in the attached PDF!`;
        const whatsappUrl = `https://wa.me/${invoice.customer.phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        setIsOpen(false);
    };

    const handleDownload = async () => {
        try {
            const response = await api.get(`/api/invoices/${invoice.id}/pdf`);
            if (response.data.pdf_url) {
                window.open(response.data.pdf_url, '_blank');
            } else {
                addToast('PDF generation failed', 'error');
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
            addToast('Failed to download PDF', 'error');
        }
        setIsOpen(false);
    };

    const handleDeleteConfirm = async () => {
        setDeleting(true);
        try {
            await api.delete(`/api/invoices/${invoice.id}`);
            addToast('Invoice deleted successfully', 'success');
            onInvoiceDeleted(invoice.id);
        } catch (error) {
            console.error('Error deleting invoice:', error);
            addToast('Failed to delete invoice', 'error');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const handleMarkAsPaid = async () => {
        try {
            const response = await api.patch(`/api/invoices/${invoice.id}`,
                { status: 'Paid' }
            );
            addToast('Invoice marked as paid', 'success');
            onInvoiceUpdated(response.data);
        } catch (error) {
            console.error('Error updating invoice:', error);
            addToast('Failed to update invoice', 'error');
        }
        setIsOpen(false);
    };

    return (
        <>
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-gray-400 hover:text-dark p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <MoreHorizontal size={20} />
                </button>

                {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                        <div className="p-1">
                            <button
                                onClick={() => { onViewDetails(); setIsOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                            >
                                <Eye size={16} /> View Details
                            </button>
                            <button
                                onClick={handleDownload}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                            >
                                <Download size={16} /> Download PDF
                            </button>
                            <button
                                onClick={handleShare}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                            >
                                <Share2 size={16} /> Share via WhatsApp
                            </button>
                            {invoice.status !== 'Paid' && (
                                <button
                                    onClick={handleMarkAsPaid}
                                    className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg flex items-center gap-2"
                                >
                                    <CheckCircle size={16} /> Mark as Paid
                                </button>
                            )}
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button
                                onClick={() => { setShowDeleteModal(true); setIsOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                            >
                                <Trash size={16} /> Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                loading={deleting}
                title="Delete this invoice?"
                message={`This will permanently remove invoice ${invoice.reference} for ${invoice.customer.name}. This cannot be undone.`}
            />
        </>
    );
};

/* ── Main Invoices Page ───────────────────────────── */
const Invoices = () => {
    const { token, logout } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        if (token) {
            fetchInvoices();
        }
    }, [token]);

    const fetchInvoices = async () => {
        try {
            const response = await api.get('/api/invoices/');
            setInvoices(response.data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            if (error.response && error.response.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-700';
            case 'Unpaid': return 'bg-red-100 text-red-700';
            case 'Pending': return 'bg-orange-100 text-orange-700';
            case 'Draft': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.reference.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'All' || invoice.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                <div className="w-full">
                    <h1 className="text-2xl font-bold text-dark mb-1">Invoices</h1>
                    <p className="text-gray-500 text-sm">Manage and track all your invoices here.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="hidden md:flex items-center justify-center gap-2 bg-white border-gray-200 hover:bg-gray-50 text-gray-700 w-full sm:w-auto">
                        <Filter size={20} />
                        Filters
                    </Button>
                    <Link to="/invoices/create" className="w-full sm:w-auto">
                        <Button className="w-full flex justify-center items-center gap-2 bg-primary hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-green-200 transition-all">
                            <Plus size={20} />
                            Create Invoice
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 w-full">
                <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="text-left border-b border-gray-100">
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide">Name/Client</th>
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide">Date</th>
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide">Orders/Type</th>
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide">Amount</th>
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide">Status</th>
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <TableSkeleton rows={5} cols={6} />
                            ) : filteredInvoices.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-12">
                                    <FileText size={36} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-sm font-semibold text-dark mb-1">No invoices found</p>
                                    <p className="text-xs text-gray-400">Create one to get started.</p>
                                </td></tr>
                            ) : (
                                filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="group hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedInvoice(invoice)}>
                                        <td className="py-4 pr-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                    {invoice.customer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-dark">{invoice.customer.name}</p>
                                                    <p className="text-xs text-gray-400">{invoice.reference}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-gray-500 text-sm">
                                            <p className="font-medium text-gray-700">{invoice.date_issued}</p>
                                        </td>
                                        <td className="py-4 text-gray-500 text-sm">
                                            {invoice.items ? invoice.items.length : 0} items
                                        </td>
                                        <td className="py-4 font-bold text-dark">
                                            ₦{invoice.total_amount.toLocaleString()}
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-center relative" onClick={(e) => e.stopPropagation()}>
                                            <InvoiceActions
                                                invoice={invoice}
                                                onViewDetails={() => setSelectedInvoice(invoice)}
                                                onInvoiceUpdated={(updatedInvoice) => {
                                                    setInvoices(invoices.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
                                                }}
                                                onInvoiceDeleted={(deletedId) => {
                                                    setInvoices(invoices.filter(inv => inv.id !== deletedId));
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && filteredInvoices.length > 0 && (
                    <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
                        <p>Showing {filteredInvoices.length} entries</p>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                            <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Invoice Detail Modal */}
            <DetailModal
                isOpen={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
                title={selectedInvoice?.customer?.name || 'Invoice'}
                subtitle={selectedInvoice?.reference}
                icon={FileText}
                accentColor="primary"
            >
                <InvoiceDetail invoice={selectedInvoice} />
            </DetailModal>
        </div>
    );
};

export default Invoices;
