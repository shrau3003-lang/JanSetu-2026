import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/nav/Sidebar';
import { Navbar } from '../components/nav/Navbar';

export const AdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar role="ADMIN" />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative flex-1 max-w-xs w-full">
            <Sidebar role="ADMIN" onCloseMobile={() => setMobileOpen(false)} className="w-full h-full" />
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          role="ADMIN"
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
