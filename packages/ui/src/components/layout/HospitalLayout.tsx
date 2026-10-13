'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { HospitalSidebar } from './HospitalSidebar';
import { HospitalHeader, type HospitalHeaderProps } from './HospitalHeader';

export interface HospitalLayoutProps {
  children: React.ReactNode;
  headerProps?: Partial<HospitalHeaderProps>;
  currentPath?: string;
  defaultCollapsed?: boolean;
}

export const HospitalLayout: React.FC<HospitalLayoutProps> = ({
  children,
  headerProps,
  currentPath = '/',
  defaultCollapsed = false,
}) => {
  // Desktop collapsed state (false = expanded with labels, true = collapsed icon dock)
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setMobileDrawerOpen(false);
      }
    };

    // Run initial screen size check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileDrawerOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  }, [isMobile]);

  const handleCloseMobileDrawer = useCallback(() => {
    setMobileDrawerOpen(false);
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Hospital Navigation Sidebar (Full expanded mode, Collapsed icon dock, & Mobile drawer) */}
      <HospitalSidebar
        collapsed={collapsed}
        mobileDrawerOpen={mobileDrawerOpen}
        isMobile={isMobile}
        onCloseMobile={handleCloseMobileDrawer}
        onToggleCollapse={handleToggleCollapse}
        currentPath={currentPath}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out">
        {/* Hospital Operational Header */}
        <HospitalHeader
          {...headerProps}
          isSidebarOpen={!collapsed}
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
