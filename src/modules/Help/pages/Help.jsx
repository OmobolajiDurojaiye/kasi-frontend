import React from 'react';
import { HelpCircle, Mail, MessageCircle, FileText, ChevronRight } from 'lucide-react';
import Button from '../../../components/ui/Button';

const Help = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-dark mb-1">Help & Support</h1>
                <p className="text-gray-500 text-sm">Find answers or contact our team.</p>
            </div>

            {/* Support Channels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-primary">
                        <Mail size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-dark">Email Support</h3>
                        <p className="text-gray-500 text-sm mt-1">Get a response within 24 hours.</p>
                    </div>
                    <Button variant="primary" className="mt-4">
                        Contact Support
                    </Button>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                        <MessageCircle size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-dark">Live Chat</h3>
                        <p className="text-gray-500 text-sm mt-1">Available Mon-Fri, 9am - 5pm.</p>
                    </div>
                    <Button variant="secondary" className="mt-4">
                        Start Chat
                    </Button>
                </div>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
                    <HelpCircle className="text-primary" size={24} /> 
                    Frequently Asked Questions
                </h2>
                
                <div className="space-y-4">
                    <FaqItem 
                        question="How do I add my logo to invoices?" 
                        answer="Go to Settings > Business Details. Upload your logo file, and it will automatically appear on all future invoices." 
                    />
                    <FaqItem 
                        question="How can I accept online payments?" 
                        answer="We integrate with Paystack. When you create an invoice, a payment link is automatically generated (if configured). Share this link with your client." 
                    />
                    <FaqItem 
                        question="Can I customize the invoice colors?" 
                        answer="Currently, invoices use the standard BizFlow premium design. Advanced customization is coming in the Pro plan." 
                    />
                    <FaqItem 
                        question="Is my data secure?" 
                        answer="Yes, all data is encrypted and stored securely. We use industry-standard security protocols to protect your business information." 
                    />
                </div>
            </div>
            
             {/* Documentation Link */}
             <div className="bg-gray-900 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Read the Documentation</h3>
                        <p className="text-gray-400 text-sm">Detailed guides on using BizFlow.</p>
                    </div>
                </div>
                
                <a href="#" className="flex items-center gap-2 text-primary-light hover:text-white transition-colors font-medium">
                    View Docs <ChevronRight size={16} />
                </a>
             </div>
        </div>
    );
};

const FaqItem = ({ question, answer }) => (
    <div className="border border-gray-100 rounded-xl p-6 hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer">
        <h3 className="font-bold text-dark mb-2">{question}</h3>
        <p className="text-gray-500 text-sm">{answer}</p>
    </div>
);

export default Help;
