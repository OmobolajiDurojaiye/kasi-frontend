import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, ArrowRight, ShieldCheck, Zap, AlertCircle, TrendingUp, History, Download } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

// We can load Paystack dynamically when needed
const loadPaystack = () => {
  return new Promise((resolve) => {
    if (window.PaystackPop) {
      resolve(window.PaystackPop);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => resolve(window.PaystackPop);
    document.body.appendChild(script);
  });
};

const BillingDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [balance, setBalance] = useState(0);
  const [packages, setPackages] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPkg, setProcessingPkg] = useState(null);

  useEffect(() => {
    fetchWalletData();
    loadPaystack();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [walletRes, pkgsRes] = await Promise.all([
        api.get('/api/billing/wallet'),
        api.get('/api/billing/packages')
      ]);
      setBalance(walletRes.data.kasi_credits);
      setTransactions(walletRes.data.transactions);
      setPackages(pkgsRes.data);
    } catch (err) {
      addToast('Failed to load wallet data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async (pkgId, pkgData) => {
    setProcessingPkg(pkgId);
    try {
      // 1. Initialize Paystack
      const initRes = await api.post('/api/billing/initialize-topup', { 
        package_id: pkgId,
        callback_url: `${window.location.origin}/payment/callback`
      });
      const { authorization_url, reference } = initRes.data;
      
      // Store package_id for the callback verification
      localStorage.setItem('pending_package_id', pkgId);
      
      // Redirect to the returned `authorization_url`.
      window.location.href = authorization_url;
      
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to initialize payment', 'error');
      setProcessingPkg(null);
    }
  };

  const isDebt = balance < 0;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-dark mb-1">Wallet & Billing</h1>
        <p className="text-gray-500 text-sm">Manage your Kasi Credits to keep your AI Sales Agent running.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Balance Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-green-600 to-green-800 rounded-2xl shadow-lg p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-green-100 mb-2">
                <Wallet size={20} />
                <span className="font-medium">Current Kasi Credits</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black tracking-tight flex items-baseline">
                  {balance}
                </span>
                <span className="text-green-200 font-medium">Credits</span>
              </div>
              
              {isDebt ? (
                <div className="mt-4 flex items-center gap-2 text-orange-200 bg-orange-900/30 px-3 py-1.5 rounded-lg text-sm font-medium w-fit border border-orange-500/30">
                  <AlertCircle size={16} />
                  Your agent is operating on credit debt limit ({balance}/-20)
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2 text-green-100 bg-green-900/40 px-3 py-1.5 rounded-lg text-sm font-medium w-fit">
                  <Zap size={16} className="text-yellow-400" />
                  Your AI Agent is active and ready
                </div>
              )}
            </div>
            
            <div className="bg-white/10 rounded-xl p-4 w-full sm:w-auto backdrop-blur-md border border-white/20">
              <div className="text-sm text-green-100 mb-1">Estimated Value</div>
              <div className="font-bold text-xl">₦ {(balance > 0 ? balance * 20 : 0).toLocaleString()}</div>
              <div className="text-xs text-green-200 mt-1">1 Credit = 1 AI Invoice</div>
            </div>
          </div>
        </div>

        {/* How it works info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <h3 className="font-bold text-dark mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            Pay-As-You-Go
          </h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="text-green-500 font-bold">•</span>
              No monthly subscriptions. 
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 font-bold">•</span>
              1 Credit is deducted only when the AI successfully closes a deal and generates an invoice.
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 font-bold">•</span>
              If your balance reaches -20 (Debt Limit), the AI stops negotiating until you top up.
            </li>
          </ul>
        </div>
      </div>

      {/* Top Up Packages */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-dark mb-4">Recharge Credits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(packages).map(([pkgId, pkg]) => (
            <div key={pkgId} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-primary/30 transition-all p-6 relative overflow-hidden group">
              {pkg.credits >= 500 && (
                <div className="absolute top-0 right-0 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-bl-xl border-b border-l border-orange-200">
                  POPULAR
                </div>
              )}
              
              <div className="text-gray-500 text-sm font-medium mb-1">{pkg.name}</div>
              <div className="text-3xl font-black text-dark mb-4 tracking-tight">
                ₦{pkg.price_ngn.toLocaleString()}
              </div>
              
              <div className="space-y-2 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary" />
                  {pkg.credits} AI Sales Conversions
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary" />
                  Lifetime Validity
                </div>
              </div>
              
              <button
                onClick={() => handleTopup(pkgId, pkg)}
                disabled={processingPkg === pkgId}
                className="w-full py-2.5 bg-gray-50 hover:bg-primary hover:text-white text-dark font-semibold rounded-xl transition-colors border border-gray-200 hover:border-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processingPkg === pkgId ? (
                  <span className="animate-pulse">Connecting to Paystack...</span>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Buy Now
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="border-b border-gray-100 p-5 sm:p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <History size={18} className="text-gray-400" />
            <h2 className="text-lg font-bold text-dark">Recent Transactions</h2>
          </div>
        </div>
        
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No credit history found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-dark">{tx.description}</td>
                    <td className="px-6 py-4">
                      {tx.transaction_type === 'purchase' ? (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">Top Up</span>
                      ) : tx.transaction_type === 'ai_generation' ? (
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">AI Usage</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">{tx.transaction_type}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

// CheckCircle2 icon
const CheckCircle2 = ({ size = 24, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
);

export default BillingDashboard;
