'use client';

import React, { useState } from 'react';
import AppSidebar from '@/components/layout/AppSidebar';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface text-on-surface flex">
      {/* Persistent Stitch Left Navigation Sidebar */}
      <AppSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Viewport */}
      <div
        className={`flex-1 transition-all duration-200 min-h-screen flex flex-col ${
          isCollapsed ? 'ml-16' : 'ml-0 md:ml-64'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
