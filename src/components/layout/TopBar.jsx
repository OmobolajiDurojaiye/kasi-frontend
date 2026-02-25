import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, CreditCard, Users, Settings, HelpCircle, LogOut, BookOpen, MessageCircle, PanelLeft, Sun, Moon, Package } from 'lucide-react';
import clsx from 'clsx';
import { useLayout } from '../../context/LayoutContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const TopBar = () => {
  const { toggleLayout } = useLayout();
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: BookOpen, label: 'Sales Notebook', path: '/sales' },
    { icon: FileText, label: 'Invoices', path: '/invoices' },
    { icon: CreditCard, label: 'Payments', path: '/payments' },
    { icon: Users, label: 'Clients', path: '/clients' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: MessageCircle, label: 'Integrations', path: '/integrations' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help', path: '/help' },
  ];

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="Kasi" className="w-7 h-7 rounded-lg" />
            <span className="text-lg font-extrabold tracking-tight" style={{ background: 'linear-gradient(135deg, #0F8C55, #0BBF6A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>kasi</span>
          </div>

          {/* Desktop nav */}
          <nav className="flex items-center gap-1 ml-8">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-200 font-medium text-[13px] whitespace-nowrap',
                    isActive
                      ? 'text-green-700 bg-green-50'
                      : 'text-gray-500 hover:text-dark hover:bg-gray-50'
                  )
                }
              >
                <item.icon size={15} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex items-center gap-1.5 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-all duration-200"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Layout toggle */}
            <button
              onClick={toggleLayout}
              title="Switch to sidebar layout"
              className="flex items-center gap-1.5 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-all duration-200"
            >
              <PanelLeft size={16} />
            </button>

            <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 font-medium text-[13px]">
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
