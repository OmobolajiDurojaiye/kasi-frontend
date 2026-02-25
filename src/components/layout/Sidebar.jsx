import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, CreditCard, Users, Settings, HelpCircle, LogOut, BookOpen, MessageCircle, PanelTop, Sun, Moon, Package, ChevronsLeft, ChevronsRight } from 'lucide-react';
import clsx from 'clsx';
import { useLayout } from '../../context/LayoutContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const SIDEBAR_KEY = 'bfm-sidebar-collapsed';

const Sidebar = ({ onWidthChange }) => {
  const { toggleLayout } = useLayout();
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_KEY, collapsed); } catch {}
    onWidthChange?.(collapsed ? 72 : 240);
  }, [collapsed]);

  // Notify parent on mount
  useEffect(() => {
    onWidthChange?.(collapsed ? 72 : 240);
  }, []);

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
    <div
      className="h-screen bg-white hidden md:flex flex-col fixed left-0 top-0 shadow-sm z-50 border-r border-gray-100"
      style={{ width: collapsed ? 72 : 240, transition: 'width 0.25s ease' }}
    >
      <div className={clsx('p-4', collapsed && 'px-3')}>
        {/* Header */}
        <div className={clsx('flex items-center mb-6', collapsed ? 'justify-center' : 'justify-between px-2')}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Kasi" className="w-7 h-7 rounded-lg" />
              <span className="text-xl font-extrabold tracking-tight" style={{ background: 'linear-gradient(135deg, #0F8C55, #0BBF6A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>kasi</span>
            </div>
          )}
          {collapsed && (
            <img src="/logo.png" alt="K" className="w-7 h-7 rounded-lg" />
          )}
        </div>

        {/* Nav */}
        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                clsx(
                  'flex items-center rounded-lg transition-all duration-200 group font-medium text-sm',
                  collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'text-green-700 bg-green-50'
                    : 'text-gray-500 hover:text-dark hover:bg-gray-50'
                )
              }
            >
              <item.icon size={18} className="transition-colors duration-200 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="mt-auto p-4 border-t border-gray-50 space-y-1">
        {/* Action buttons row */}
        <div className={clsx('flex gap-1', collapsed ? 'flex-col items-center' : 'items-center')}>
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={toggleLayout}
            title="Switch to topbar layout"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
          >
            <PanelTop size={16} />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-2 text-gray-400 hover:text-primary hover:bg-green-50 rounded-lg transition-all duration-200"
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        {/* Logout */}
        <button
          className={clsx(
            'flex items-center w-full text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium text-sm',
            collapsed ? 'justify-center py-2.5' : 'gap-3 px-3 py-2.5'
          )}
          onClick={logout}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
