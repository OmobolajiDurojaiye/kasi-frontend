import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Search, CheckCircle, Calendar, ArrowUpRight, Eye, CreditCard } from 'lucide-react';
import Button from '../../../components/ui/Button';
import DetailModal from '../../../components/ui/DetailModal';
import { TableSkeleton } from '../../../components/ui/Skeleton';

/* ── Payment Detail Modal Content ─────────────────── */
const PaymentDetail = ({ payment }) => {
    if (!payment) return null;

    return (
        <div className="space-y-5">
            {/* Status */}
            <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                    <CheckCircle size={12} /> Paid
                </span>
                <span className="text-xs text-gray-400">Ref: {payment.reference}</span>
            </div>

            {/* Customer */}
            <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Paid By</p>
                <div className="flex items-center gap-3 mt-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                        {payment.customer?.name?.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{payment.customer?.name}</p>
                        {payment.customer?.phone && <p className="text-sm text-gray-500">{payment.customer.phone}</p>}
                    </div>
                </div>
            </div>

            {/* Date */}
            <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Payment Date</p>
                <p className="font-semibold text-gray-800 text-sm">{payment.date_issued}</p>
            </div>

            {/* Line Items */}
            <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Items Paid For</p>
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
                            {payment.items?.map((item, i) => (
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

            {/* Amount */}
            <div className="bg-green-50 rounded-xl p-4">
                <div className="flex justify-between">
                    <span className="font-bold text-green-800">Amount Paid</span>
                    <span className="font-bold text-green-800 text-lg">₦{payment.total_amount?.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

/* ── Main Payments Page ───────────────────────────── */
const Payments = () => {
    const { token, logout } = useAuth();
    const { addToast } = useToast();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);

    useEffect(() => {
        if (token) {
            fetchPayments();
        }
    }, [token]);

    const fetchPayments = async () => {
        try {
            const response = await api.get('/api/invoices/');
            const paidInvoices = response.data.filter(inv => inv.status === 'Paid');
            setPayments(paidInvoices);
        } catch (error) {
            console.error('Error fetching payments:', error);
            if (error.response && error.response.status === 401) {
                logout();
            } else {
                addToast('Failed to load payments', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = payments.filter(payment =>
        payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalRevenue = payments.reduce((sum, p) => sum + p.total_amount, 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-dark mb-1">Payments</h1>
                    <p className="text-gray-500 text-sm">Track your verified income.</p>
                </div>

                {/* Stat Box */}
                <div className="bg-primary/10 px-6 py-3 rounded-2xl border border-primary/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                        <ArrowUpRight size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Revenue</p>
                        <p className="text-xl font-bold text-primary">₦{totalRevenue.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by reference or client..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-gray-100">
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide">Reference</th>
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide">Client</th>
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide">Date Received</th>
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide text-right">Amount</th>
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide text-center">Status</th>
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide text-center">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <TableSkeleton rows={5} cols={6} />
                            ) : filteredPayments.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-12">
                                    <CheckCircle size={36} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-sm font-semibold text-dark mb-1">No paid invoices yet</p>
                                    <p className="text-xs text-gray-400">Payments will appear here when invoices are marked as paid.</p>
                                </td></tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="group hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedPayment(payment)}>
                                        <td className="py-4 font-medium text-dark">{payment.reference}</td>
                                        <td className="py-4 text-gray-600">{payment.customer.name}</td>
                                        <td className="py-4 text-gray-500 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                {payment.date_issued}
                                            </div>
                                        </td>
                                        <td className="py-4 text-right font-bold text-dark">
                                            ₦{payment.total_amount.toLocaleString()}
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                                <CheckCircle size={12} /> Paid
                                            </span>
                                        </td>
                                        <td className="py-4 text-center">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedPayment(payment); }}
                                                className="text-gray-400 hover:text-primary p-2 rounded-lg hover:bg-green-50 transition-colors"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Detail Modal */}
            <DetailModal
                isOpen={!!selectedPayment}
                onClose={() => setSelectedPayment(null)}
                title={selectedPayment?.customer?.name || 'Payment'}
                subtitle={selectedPayment?.reference}
                icon={CreditCard}
                accentColor="primary"
            >
                <PaymentDetail payment={selectedPayment} />
            </DetailModal>
        </div>
    );
};

export default Payments;
