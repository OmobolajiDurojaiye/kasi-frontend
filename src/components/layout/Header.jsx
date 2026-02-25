import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search invoices, customers..."
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
            <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-dark">Aisha's Fashion</p>
                <p className="text-xs text-gray-500">Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold">
                A
            </div>
            <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;
