import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import { useLayout } from '../../context/LayoutContext';

const MainLayout = () => {
  const { layout } = useLayout();
  const [sidebarWidth, setSidebarWidth] = useState(240);

  if (layout === 'sidebar') {
    return (
      <div className="min-h-screen bg-white font-sans text-dark flex">
        <Sidebar onWidthChange={setSidebarWidth} />
        <main
          className="flex-1 p-4 md:p-6 pb-20 md:pb-6 ml-0"
          style={{ marginLeft: undefined }}
        >
          {/* Dynamic margin for desktop only */}
          <style>{`@media(min-width:768px){.main-content-area{margin-left:${sidebarWidth}px !important;transition:margin-left 0.25s ease}}`}</style>
          <div className="max-w-7xl mx-auto main-content-area">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-dark flex flex-col">
      <TopBar />
      <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default MainLayout;
