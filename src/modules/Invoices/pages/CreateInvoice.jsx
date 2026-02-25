import React, { useState } from 'react';
import { Plus, Trash, Save, Share2, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

const CreateInvoice = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([
        { description: '', quantity: 1, unit_price: 0, total_price: 0 }
    ]);
    const [customer, setCustomer] = useState({
        name: '',
        whatsapp: '',
        address: ''
    });
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    
    // Auto-calculate VAT
    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    const vat = subtotal * 0.075; // 7.5% VAT
    const total = subtotal + vat;

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unit_price: 0, total_price: 0 }]);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const [successData, setSuccessData] = useState(null);

    const handleSave = async (status = 'Draft') => {
        if (!customer.name) {
            addToast('Please enter a customer name', 'error');
            return;
        }

        setLoading(true);
        try {
            const invoiceData = {
                customer_name: customer.name,
                customer_phone: customer.whatsapp,
                customer_address: customer.address,
                reference: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
                date_issued: invoiceDate,
                due_date: dueDate,
                status: status,
                subtotal: subtotal,
                tax_amount: vat,
                total_amount: total,
                items: items
            };

            const response = await axios.post('/api/invoices/', invoiceData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSuccessData(response.data);
            addToast('Invoice created successfully!', 'success');
            // Don't navigate immediately, show success modal
        } catch (error) {
            console.error('Error creating invoice:', error);
            addToast('Failed to create invoice. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (successData) {
        const message = `Hello ${successData.customer.name}, here is your invoice for N${successData.total_amount.toLocaleString()}. Please pay via: ${successData.payment_link}`;
        const whatsappUrl = `https://wa.me/${successData.customer.phone}?text=${encodeURIComponent(message)}`;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="max-w-md w-full p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                        <Save size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-dark">Invoice Created!</h2>
                        <p className="text-gray-500 mt-2">What would you like to do next?</p>
                    </div>
                    
                    <div className="space-y-3">
                         <a 
                            href={whatsappUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block w-full"
                        >
                            <Button className="w-full justify-center bg-green-600 hover:bg-green-700 text-white gap-2">
                                <Share2 size={18} /> Send via WhatsApp
                            </Button>
                        </a>
                        
                        {successData.payment_link && (
                            <a 
                                href={successData.payment_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block w-full"
                            >
                                <Button variant="outline" className="w-full justify-center border-gray-200">
                                    Open Payment Link
                                </Button>
                            </a>
                        )}
                        
                        {successData.pdf_url && (
                             <a 
                                href={successData.pdf_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block w-full"
                            >
                                <Button variant="outline" className="w-full justify-center border-gray-200">
                                    Download PDF
                                </Button>
                            </a>
                        )}

                        <Button 
                            variant="secondary" 
                            className="w-full justify-center"
                            onClick={() => navigate('/')}
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-dark">Create New Invoice</h1>
                    <p className="text-gray-500 text-sm">Fill in the details below</p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        variant="secondary" 
                        className="bg-gray-100 text-dark hover:bg-gray-200"
                        onClick={() => handleSave('Draft')}
                        disabled={loading}
                    >
                       {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} className="mr-2" />}
                       Save Draft
                    </Button>
                    <Button 
                        className="flex items-center gap-2 bg-primary hover:bg-green-700 text-white min-w-[140px] justify-center"
                        onClick={() => handleSave('Sent')}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader size={18} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Share2 size={18} />
                                Save & Share
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <Card className="p-8">
                {/* Dates & Reference */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-6 border-b border-gray-100">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                        <input 
                            type="date" 
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input 
                            type="date" 
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Customer Details */}
                <h3 className="text-lg font-bold text-dark mb-4 pb-2 border-b border-gray-100">Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="e.g. Aunty Kemi"
                            value={customer.name}
                            onChange={(e) => setCustomer({...customer, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                        <input 
                            type="tel" 
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="e.g. 08012345678"
                            value={customer.whatsapp}
                            onChange={(e) => setCustomer({...customer, whatsapp: e.target.value})}
                        />
                    </div>
                </div>

                {/* Items */}
                <h3 className="text-lg font-bold text-dark mb-4 pb-2 border-b border-gray-100">Invoice Items</h3>
                <div className="overflow-x-auto mb-6">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-gray-500">
                                <th className="pb-3 w-[40%]">Description</th>
                                <th className="pb-3 w-[15%]">Qty</th>
                                <th className="pb-3 w-[20%]">Unit Price (₦)</th>
                                <th className="pb-3 w-[20%]">Total (₦)</th>
                                <th className="pb-3 w-[5%]"></th>
                            </tr>
                        </thead>
                        <tbody className="space-y-4">
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td className="pr-4 py-2">
                                        <input 
                                            type="text" 
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                            placeholder="Item description"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                        />
                                    </td>
                                    <td className="pr-4 py-2">
                                        <input 
                                            type="number" 
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td className="pr-4 py-2">
                                        <input 
                                            type="number" 
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={item.unit_price}
                                            onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td className="pr-4 py-2 text-dark font-medium">
                                        ₦{item.total_price.toLocaleString()}
                                    </td>
                                    <td className="py-2">
                                        <button 
                                            onClick={() => removeItem(index)}
                                            className="text-red-500 hover:text-red-700 p-2"
                                        >
                                            <Trash size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Button 
                    variant="secondary" 
                    onClick={addItem}
                    className="flex items-center gap-2 text-sm bg-gray-50 text-gray-700 hover:bg-gray-100"
                >
                    <Plus size={16} /> Add Item
                </Button>

                {/* Summary */}
                <div className="flex justify-end mt-8">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal:</span>
                            <span>₦{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>VAT (7.5%):</span>
                            <span>₦{vat.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-dark pt-3 border-t border-gray-100">
                            <span>Total:</span>
                            <span className="text-primary">₦{total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};


export default CreateInvoice;
