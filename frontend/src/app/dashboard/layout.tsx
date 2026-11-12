'use client';

import React, { Suspense } from 'react';
import AppSidebar from '@/components/layout/AppSidebar';
import { SidebarProvider, useSidebar } from '@/components/layout/SidebarContext';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, toggleCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-surface text-on-surface flex">
      {/* Persistent Stitch Left Navigation Sidebar & Mobile Drawer */}
      <Suspense fallback={<aside className="w-64 bg-surface-container-low" />}>
        <AppSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapsed}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />
      </Suspense>

      {/* Main Content Viewport */}
      <div
        className={`flex-1 transition-all duration-200 min-h-screen flex flex-col ${
          isCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-64'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
