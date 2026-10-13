'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { HospitalSidebar } from './HospitalSidebar';
import { HospitalHeader, type HospitalHeaderProps } from './HospitalHeader';

export interface HospitalLayoutProps {
  children: React.ReactNode;
  headerProps?: Partial<HospitalHeaderProps>;
  currentPath?: string;
  defaultSidebarOpen?: boolean;
}

export const HospitalLayout: React.FC<HospitalLayoutProps> = ({
  children,
  headerProps,
  currentPath = '/',
  defaultSidebarOpen = true,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(defaultSidebarOpen);
  const [isCompact, setIsCompact] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };

    // Run initial screen check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleToggleCompact = useCallback(() => {
    setIsCompact((prev) => !prev);
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Hospital Navigation Sidebar (supports responsive mobile drawer & desktop collapse) */}
      <HospitalSidebar
        isOpen={isSidebarOpen}
        isCompact={isCompact}
        isMobile={isMobile}
        onClose={handleCloseSidebar}
        onToggleCompact={handleToggleCompact}
        currentPath={currentPath}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out">
        {/* Hospital Operational Header */}
        <HospitalHeader
          {...headerProps}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
        />

        {/* Scrollable Work Area */}
        <main className="flex-1 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
