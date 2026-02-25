import React, { createContext, useContext, useState, useEffect } from 'react';

const LayoutContext = createContext();

const LAYOUT_KEY = 'bfm-layout-mode';

export const LayoutProvider = ({ children }) => {
  const [layout, setLayout] = useState(() => {
    try {
      return localStorage.getItem(LAYOUT_KEY) || 'topbar';
    } catch {
      return 'topbar';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_KEY, layout);
    } catch {}
  }, [layout]);

  const toggleLayout = () => {
    setLayout((prev) => (prev === 'sidebar' ? 'topbar' : 'sidebar'));
  };

  return (
    <LayoutContext.Provider value={{ layout, setLayout, toggleLayout }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used inside LayoutProvider');
  return ctx;
};

export default LayoutContext;
