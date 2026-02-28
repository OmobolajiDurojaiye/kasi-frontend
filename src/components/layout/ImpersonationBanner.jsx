import React from 'react';
import { LogOut, Eye } from 'lucide-react';

const ImpersonationBanner = () => {
  const adminToken = localStorage.getItem('admin_token');

  if (!adminToken) return null;

  const handleReturnToAdmin = () => {
    localStorage.setItem('token', adminToken);
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/users';
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-orange-600 dark:bg-orange-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm font-medium">
        <div className="flex items-center gap-2">
            <Eye className="animate-pulse" size={18} />
            You are currently impersonating this user account.
        </div>
        <button 
          onClick={handleReturnToAdmin}
          className="flex items-center gap-2 bg-white text-orange-700 hover:bg-orange-50 px-4 py-1.5 rounded-full font-bold transition-colors shadow-sm whitespace-nowrap"
        >
          <LogOut size={16} /> Return to Admin
        </button>
      </div>
    </div>
  );
};

export default ImpersonationBanner;
