import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, CreditCard, BookOpen, MoreHorizontal, Users, Settings, HelpCircle, MessageCircle, LogOut, X, Sun, Moon, PanelLeft, PanelTop, Package } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '../../context/ThemeContext';
import { useLayout } from '../../context/LayoutContext';
import { useAuth } from '../../context/AuthContext';

const BottomNav = () => {
  const [moreOpen, setMoreOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { layout, toggleLayout } = useLayout();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const mainTabs = [
    { icon: LayoutDashboard, label: 'Home', path: '/' },
    { icon: BookOpen, label: 'Sales', path: '/sales' },
    { icon: FileText, label: 'Invoices', path: '/invoices' },
    { icon: CreditCard, label: 'Payments', path: '/payments' },
  ];

  const moreItems = [
    { icon: Users, label: 'Clients', path: '/clients' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: MessageCircle, label: 'Integrations', path: '/integrations' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help', path: '/help' },
  ];

  const handleLogout = () => {
    setMoreOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* More menu overlay */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
      )}

      {/* More menu slide-up panel */}
      {moreOpen && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-[999] px-3 pb-2 animate-in slide-in-from-bottom-4 duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header strip */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-bold text-dark">More</span>
              <div className="flex items-center gap-1">
                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                {/* Layout toggle */}
                <button
                  onClick={toggleLayout}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {layout === 'sidebar' ? <PanelTop size={18} /> : <PanelLeft size={18} />}
                </button>
                {/* Close */}
                <button
                  onClick={() => setMoreOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-2">
              {moreItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-medium text-sm',
                      isActive
                        ? 'text-green-700 bg-green-50'
                        : 'text-gray-600 hover:text-dark hover:bg-gray-50'
                    )
                  }
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}

              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-3 w-full text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium text-sm"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[997] bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {mainTabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors duration-200',
                  isActive
                    ? 'text-primary'
                    : 'text-gray-400'
                )
              }
            >
              <tab.icon size={22} strokeWidth={1.8} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </NavLink>
          ))}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={clsx(
              'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors duration-200',
              moreOpen ? 'text-primary' : 'text-gray-400'
            )}
          >
            <MoreHorizontal size={22} strokeWidth={1.8} />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
