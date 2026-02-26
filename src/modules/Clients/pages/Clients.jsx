import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Search, User, Users, Mail, Phone, MapPin, FileText, Eye, ShoppingBag } from 'lucide-react';
import Button from '../../../components/ui/Button';
import DetailModal from '../../../components/ui/DetailModal';
import { TableSkeleton } from '../../../components/ui/Skeleton';

/* ── Client Detail Modal Content ──────────────────── */
const ClientDetail = ({ client, invoices }) => {
    if (!client) return null;

    const clientInvoices = invoices.filter(inv => inv.customer?.id === client.id);
    const totalSpent = clientInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const paidCount = clientInvoices.filter(inv => inv.status === 'Paid').length;

    return (
        <div className="space-y-5">
            {/* Client Info Card */}
            <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xl">
                        {client.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-gray-900 text-lg">{client.name}</p>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                            {client.email && (
                                <span className="flex items-center gap-1"><Mail size={13} /> {client.email}</span>
                            )}
                            {client.phone && (
                                <span className="flex items-center gap-1"><Phone size={13} /> {client.phone}</span>
                            )}
                        </div>
                        {client.address && (
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin size={13} /> {client.address}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-green-600 font-medium uppercase tracking-wider">Total Spent</p>
                    <p className="text-lg font-bold text-green-800 mt-1">₦{totalSpent.toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Orders</p>
                    <p className="text-lg font-bold text-blue-800 mt-1">{clientInvoices.length}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-purple-600 font-medium uppercase tracking-wider">Paid</p>
                    <p className="text-lg font-bold text-purple-800 mt-1">{paidCount}</p>
                </div>
            </div>

            {/* Purchase History */}
            <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Purchase History</p>
                {clientInvoices.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                        <ShoppingBag size={24} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No purchase history yet</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {clientInvoices.map((inv) => (
                            <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-gray-800 text-sm">{inv.reference}</p>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                                            ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                inv.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-gray-100 text-gray-700'}`}>
                                            {inv.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {inv.date_issued} • {inv.items?.length || 0} item{inv.items?.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <p className="font-bold text-gray-800">₦{inv.total_amount.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── Main Clients Page ────────────────────────────── */
const Clients = () => {
    const { token, logout } = useAuth();
    const { addToast } = useToast();
    const [clients, setClients] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);

    useEffect(() => {
        if (token) {
            fetchClients();
            fetchInvoices();
        }
    }, [token]);

    const fetchClients = async () => {
        try {
            const response = await api.get('/api/invoices/customers');
            setClients(response.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
            if (error.response && error.response.status === 401) {
                logout();
            } else {
                addToast('Failed to load clients', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchInvoices = async () => {
        try {
            const response = await api.get('/api/invoices/');
            setInvoices(response.data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        }
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.phone && client.phone.includes(searchTerm))
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-dark mb-1">Clients</h1>
                    <p className="text-gray-500 text-sm">View and manage your customer list.</p>
                </div>
                <div className="relative flex-1 md:w-64 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-gray-100">
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide">Name</th>
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide">Contact Info</th>
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide">Address</th>
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide text-center">Invoices</th>
                                <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wide text-center">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <TableSkeleton rows={5} cols={5} />
                            ) : filteredClients.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-12">
                                    <Users size={36} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-sm font-semibold text-dark mb-1">No clients yet</p>
                                    <p className="text-xs text-gray-400">Clients appear here when you create invoices.</p>
                                </td></tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="group hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedClient(client)}>
                                        <td className="py-4 pr-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                                                    {client.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-dark">{client.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-sm">
                                            <div className="space-y-1">
                                                {client.email && (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Mail size={14} /> {client.email}
                                                    </div>
                                                )}
                                                {client.phone && (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Phone size={14} /> {client.phone}
                                                    </div>
                                                )}
                                                {!client.email && !client.phone && <span className="text-gray-400">No contact info</span>}
                                            </div>
                                        </td>
                                        <td className="py-4 text-sm text-gray-600">
                                            {client.address ? (
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} /> {client.address}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                                                <FileText size={12} /> {client.invoice_count}
                                            </span>
                                        </td>
                                        <td className="py-4 text-center">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedClient(client); }}
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

            {/* Client Detail Modal */}
            <DetailModal
                isOpen={!!selectedClient}
                onClose={() => setSelectedClient(null)}
                title={selectedClient?.name || 'Client'}
                subtitle={`${selectedClient?.invoice_count || 0} invoices`}
                icon={User}
                accentColor="primary"
            >
                <ClientDetail client={selectedClient} invoices={invoices} />
            </DetailModal>
        </div>
    );
};

export default Clients;
