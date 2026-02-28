import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
  const { addToast } = useToast();
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    // Paystack usually returns `reference` or `trxref`
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    const packageId = localStorage.getItem('pending_topup_package');

    if (!reference) {
      setStatus('error');
      setMessage('No payment reference found.');
      return;
    }

    if (!packageId) {
      setStatus('error');
      setMessage('Session expired. Please contact support if you were charged.');
      return;
    }

    try {
      const res = await api.post('/api/billing/verify-topup', {
        reference,
        package_id: packageId
      });
      
      setStatus('success');
      setMessage('Payment successful! Your credits have been updated.');
      
      // Clean up
      localStorage.removeItem('pending_topup_package');
      
      // Optionally refresh user data if auth context holds credits
      await fetchUser();
      
      // Redirect back to wallet after 3 seconds
      setTimeout(() => navigate('/billing'), 3000);
      
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Payment verification failed.');
      localStorage.removeItem('pending_topup_package');
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-sm w-full text-center">
        
        {status === 'verifying' && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 size={48} className="animate-spin text-primary" />
            <h2 className="text-xl font-bold text-dark">Processing Payment</h2>
            <p className="text-gray-500 text-sm">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
               <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-dark">Top Up Successful!</h2>
            <p className="text-gray-500 text-sm">{message}</p>
            <p className="text-xs text-gray-400 mt-4">Redirecting you back to your wallet...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
               <XCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-dark">Payment Failed</h2>
            <p className="text-gray-500 text-sm">{message}</p>
            <button 
              onClick={() => navigate('/billing')}
              className="mt-6 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-dark font-medium rounded-xl transition-colors"
            >
              Return to Wallet
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentCallback;
