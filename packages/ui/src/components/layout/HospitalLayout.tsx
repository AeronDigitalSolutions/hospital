'use client';

import React, { useState } from 'react';
import { HospitalSidebar } from './HospitalSidebar';
import { HospitalHeader, type HospitalHeaderProps } from './HospitalHeader';

export interface HospitalLayoutProps {
  children: React.ReactNode;
  headerProps?: Partial<HospitalHeaderProps>;
  currentPath?: string;
}

export const HospitalLayout: React.FC<HospitalLayoutProps> = ({
  children,
  headerProps,
  currentPath = '/',
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Hospital Navigation Sidebar */}
      <HospitalSidebar
        collapsed={collapsed}
        currentPath={currentPath}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Hospital Operational Header */}
        <HospitalHeader
          {...headerProps}
          onToggleSidebar={() => setCollapsed(!collapsed)}
        />

        {/* Scrollable Work Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
