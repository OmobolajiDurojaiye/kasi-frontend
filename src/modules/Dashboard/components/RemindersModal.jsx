import React from 'react';
import { X, MessageCircle, ExternalLink } from 'lucide-react';
import Button from '../../../components/ui/Button';

const RemindersModal = ({ isOpen, onClose, overdueInvoices }) => {
    if (!isOpen) return null;

    const generateWhatsAppLink = (invoice) => {
        const phone = invoice.customer.phone || '';
        // Format phone: remove leading 0, add 234 if missing (assuming NG context for MVP)
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) formattedPhone = '234' + formattedPhone.substring(1);
        
        const message = `Hello ${invoice.customer.name}, just a friendly reminder that your invoice ${invoice.reference} for ₦${invoice.total_amount.toLocaleString()} is overdue. Please make payment soon. Thank you!`;
        
        return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50">
                    <div>
                        <h2 className="text-xl font-bold text-red-900">Overdue Reminders</h2>
                        <p className="text-sm text-red-700">You have {overdueInvoices.length} invoices urging for attention.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-full text-red-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* List */}
                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                    {overdueInvoices.map(inv => (
                        <div key={inv.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-red-100 hover:shadow-sm transition-all">
                            <div>
                                <h4 className="font-bold text-dark">{inv.customer.name}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                    <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{inv.reference}</span>
                                    <span>•</span>
                                    <span className="font-bold text-red-600">₦{inv.total_amount.toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-red-500 mt-1">Due: {inv.due_date}</p>
                            </div>
                            
                            <a 
                                href={generateWhatsAppLink(inv)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                <MessageCircle size={16} />
                                Remind
                            </a>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-500">
                        Click "Remind" to open WhatsApp with a pre-filled message.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RemindersModal;
