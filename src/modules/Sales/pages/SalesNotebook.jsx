import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import api from '../../../api/axios';
import { Plus, Search, Filter, Calendar, UploadCloud, FileText, Eye } from 'lucide-react';
import Button from '../../../components/ui/Button';
import DetailModal from '../../../components/ui/DetailModal';
import { TableSkeleton } from '../../../components/ui/Skeleton';

/* ── Sale Detail Modal Content ────────────────────── */
const SaleDetail = ({ sale }) => {
    if (!sale) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-700';
            case 'Overdue': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-5">
            {/* Status + Ref */}
            <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(sale.status)}`}>
                    {sale.status}
                </span>
                <span className="text-xs text-gray-400">Ref: {sale.reference}</span>
            </div>

            {/* Customer  */}
            <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Customer</p>
                <div className="flex items-center gap-3 mt-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                        {sale.customer?.name?.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{sale.customer?.name}</p>
                        {sale.customer?.phone && <p className="text-sm text-gray-500">{sale.customer.phone}</p>}
                    </div>
                </div>
            </div>

            {/* Date */}
            <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date</p>
                <p className="font-semibold text-gray-800 text-sm">{sale.date_issued}</p>
            </div>

            {/* Items */}
            <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Items Sold</p>
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
                            {sale.items?.map((item, i) => (
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

            {/* Total */}
            <div className="bg-green-50 rounded-xl p-4">
                <div className="flex justify-between">
                    <span className="font-bold text-green-800">Total Amount</span>
                    <span className="font-bold text-green-800 text-lg">₦{sale.total_amount?.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

/* ── Main Sales Notebook Page ─────────────────────── */
const SalesNotebook = () => {
    const { token } = useAuth();
    const { addToast } = useToast();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);

    // Quick Add Form State
    const [quickForm, setQuickForm] = useState({
        customer_name: '',
        amount: '',
        description: 'Sales',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchInvoices();
    }, [token]);

    const fetchInvoices = async () => {
        try {
            const response = await api.get('/api/invoices/');
            setInvoices(response.data);
        } catch (error) {
            console.error('Error loading notebook:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAdd = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                customer_name: quickForm.customer_name,
                reference: `SALE-${Date.now().toString().slice(-6)}`,
                date_issued: quickForm.date,
                due_date: quickForm.date,
                status: 'Paid',
                subtotal: parseFloat(quickForm.amount),
                tax_amount: 0,
                total_amount: parseFloat(quickForm.amount),
                items: [
                    {
                        description: quickForm.description,
                        quantity: 1,
                        unit_price: parseFloat(quickForm.amount),
                        total_price: parseFloat(quickForm.amount)
                    }
                ]
            };

            await api.post('/api/invoices/', payload);

            addToast('Sale recorded successfully!', 'success');
            fetchInvoices();
            setShowQuickAdd(false);
            setQuickForm({ ...quickForm, customer_name: '', amount: '' });

        } catch (error) {
            console.error('Error adding sale:', error);
            addToast('Failed to add sale. Please try again.', 'error');
        }
    };

    // Calculations
    const today = new Date().toISOString().split('T')[0];
    const salesToday = invoices
        .filter(inv => inv.date_issued === today)
        .reduce((sum, inv) => sum + inv.total_amount, 0);

    const countToday = invoices.filter(inv => inv.date_issued === today).length;

    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const response = await api.post('/api/invoices/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            addToast(`Success! Created ${response.data.created} invoices.`, 'success');
            fetchInvoices();
        } catch (error) {
            console.error('Upload failed:', error);
            addToast('Upload failed. Please check your CSV format.', 'error');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-5">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                <div className="w-full">
                    <h1 className="text-2xl font-bold text-dark mb-1">Sales Notebook</h1>
                    <p className="text-gray-500 text-sm">Track your daily sales instantly.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        variant="outline"
                        className="w-full sm:w-auto flex justify-center items-center gap-2 shadow-sm text-sm font-medium transition-colors"
                    >
                        <UploadCloud size={16} />
                        {uploading ? 'Uploading...' : 'Import CSV'}
                    </Button>
                    <Button onClick={() => setShowQuickAdd(!showQuickAdd)} className="w-full sm:w-auto flex justify-center items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow-md shadow-green-100 text-sm font-medium hover:bg-green-700 transition-colors">
                        <Plus size={16} />
                        Quick Sale
                    </Button>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 min-w-0">
                    <p className="text-[10px] sm:text-xs text-green-600 font-medium uppercase tracking-wider truncate" title="Sales Today">Sales Today</p>
                    <p className="text-xl sm:text-3xl font-bold text-dark mt-2 truncate" title={`₦${salesToday.toLocaleString()}`}>₦{salesToday.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 min-w-0">
                    <p className="text-[10px] sm:text-xs text-green-600 font-medium uppercase tracking-wider truncate" title="Transactions">Transactions</p>
                    <p className="text-xl sm:text-3xl font-bold text-dark mt-2 truncate" title={countToday}>{countToday}</p>
                </div>
            </div>

            {/* Quick Add Form (Collapsible) */}
            {showQuickAdd && (
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                        <Plus size={18} /> New Quick Sale
                    </h3>
                    <form onSubmit={handleQuickAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-green-700">Customer Name</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Mama Tola"
                                className="w-full rounded-lg border-green-200 focus:border-green-500 focus:ring-green-500"
                                value={quickForm.customer_name}
                                onChange={e => setQuickForm({ ...quickForm, customer_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-green-700">Amount (₦)</label>
                            <input
                                required
                                type="number"
                                placeholder="0.00"
                                className="w-full rounded-lg border-green-200 focus:border-green-500 focus:ring-green-500"
                                value={quickForm.amount}
                                onChange={e => setQuickForm({ ...quickForm, amount: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-green-700">Description</label>
                            <input
                                type="text"
                                placeholder="What did they buy?"
                                className="w-full rounded-lg border-green-200 focus:border-green-500 focus:ring-green-500"
                                value={quickForm.description}
                                onChange={e => setQuickForm({ ...quickForm, description: e.target.value })}
                            />
                        </div>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white w-full py-2.5 rounded-lg">
                            Record Sale
                        </Button>
                    </form>
                </div>
            )}

            {/* Notebook Table */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="relative flex-1 w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Search notebook..." className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-base" />
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button className="flex items-center gap-2 text-gray-700 hover:text-dark px-4 py-2 rounded-xl hover:bg-gray-50 border border-gray-200 text-sm font-medium">
                            <Filter size={18} />
                            Filter
                        </button>
                        <button className="flex items-center gap-2 text-gray-700 hover:text-dark px-4 py-2 rounded-xl hover:bg-gray-50 border border-gray-200 text-sm font-medium">
                            <Calendar size={18} />
                            Date
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="text-left border-b border-gray-100">
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide">Date</th>
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide">Customer</th>
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide">Description</th>
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide text-right">Amount</th>
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide">Status</th>
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide text-center">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <TableSkeleton rows={5} cols={6} />
                            ) : invoices.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-12">
                                    <FileText size={36} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-sm font-semibold text-dark mb-1">No sales recorded yet</p>
                                    <p className="text-xs text-gray-400">Use "Quick Sale" to add your first entry.</p>
                                </td></tr>
                            ) : (
                                invoices.map((inv) => (
                                    <tr key={inv.id} className="group hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedSale(inv)}>
                                        <td className="py-4 text-gray-500 text-sm">
                                            <p className="font-medium text-gray-700">{inv.date_issued}</p>
                                        </td>
                                        <td className="py-4 font-medium text-dark">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                    {inv.customer.name.charAt(0)}
                                                </div>
                                                {inv.customer.name}
                                            </div>
                                        </td>
                                        <td className="py-4 text-gray-500 text-sm">
                                            {inv.items[0]?.description || 'Sale'}
                                            {inv.items.length > 1 && <span className="text-xs text-gray-400 ml-1">(+{inv.items.length - 1} more)</span>}
                                        </td>
                                        <td className="py-4 font-bold text-dark text-right">₦{inv.total_amount.toLocaleString()}</td>
                                        <td className="py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                                ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                    inv.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-center">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedSale(inv); }}
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

            {/* Sale Detail Modal */}
            <DetailModal
                isOpen={!!selectedSale}
                onClose={() => setSelectedSale(null)}
                title={selectedSale?.customer?.name || 'Sale'}
                subtitle={selectedSale?.reference}
                icon={FileText}
                accentColor="primary"
            >
                <SaleDetail sale={selectedSale} />
            </DetailModal>
        </div>
    );
};

export default SalesNotebook;
