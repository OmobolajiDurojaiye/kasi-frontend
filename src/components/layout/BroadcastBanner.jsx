import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import api from '../../api/axios';

const BroadcastBanner = () => {
  const [broadcast, setBroadcast] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchActiveBroadcast = async () => {
      try {
        const res = await api.get('/api/auth/announcements/active');
        if (isMounted && res.data.status === 'success' && res.data.data) {
          setBroadcast(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch broadcast", error);
      }
    };
    fetchActiveBroadcast();
    return () => { isMounted = false; };
  }, []);

  if (!broadcast || !isVisible) return null;

  const bgColors = {
    info: 'bg-blue-600 dark:bg-blue-700 text-white',
    warning: 'bg-yellow-500 text-yellow-950 dark:bg-yellow-600 dark:text-white',
    success: 'bg-green-600 dark:bg-green-700 text-white',
  };

  const getIcon = () => {
    switch(broadcast.type) {
      case 'warning': return <AlertTriangle size={18} />;
      case 'success': return <CheckCircle size={18} />;
      default: return <Info size={18} />;
    }
  };

  return (
    <div className={`relative z-[90] shadow-sm animate-in fade-in slide-in-from-top-4 ${bgColors[broadcast.type] || bgColors.info}`}>
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 w-full">
          <div className="mt-0.5 sm:mt-0 opacity-80">{getIcon()}</div>
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="text-sm font-bold">{broadcast.title}</span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-current opacity-30"></span>
            <span className="text-sm opacity-90">{broadcast.message}</span>
          </div>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-black/10 rounded-full transition-colors shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default BroadcastBanner;
