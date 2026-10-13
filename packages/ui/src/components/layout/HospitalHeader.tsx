import React from 'react';
import {
  Search,
  Bell,
  AlertTriangle,
  User,
  Shield,
  Activity,
  Menu,
} from 'lucide-react';

export interface HospitalHeaderProps {
  hospitalName?: string;
  facilityCode?: string;
  activeDepartment?: string;
  activeShift?: 'MORNING' | 'EVENING' | 'NIGHT';
  currentUser?: {
    name: string;
    role: string;
    department?: string;
  };
  emergencyAlertCount?: number;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onPatientSearch?: (query: string) => void;
  className?: string;
}

export const HospitalHeader: React.FC<HospitalHeaderProps> = ({
  hospitalName = 'UPUMS Teaching Hospital',
  facilityCode = 'UPUMS-MAIN',
  activeDepartment = 'Emergency & Trauma Center',
  activeShift = 'MORNING',
  currentUser = {
    name: 'Dr. S. K. Sharma',
    role: 'Lead Clinician (HOD)',
    department: 'General Medicine',
  },
  emergencyAlertCount = 3,
  onToggleSidebar,
  isSidebarOpen = true,
  onPatientSearch,
  className = '',
}) => {
  return (
    <header
      className={`h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-30 ${className}`}
    >
      {/* Left: Sidebar Toggle + Hospital Identity */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Hide navigation menu' : 'Show navigation menu'}
          title={isSidebarOpen ? 'Hide navigation menu (collapse sidebar)' : 'Show navigation menu (open sidebar)'}
          className={`p-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            !isSidebarOpen
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 ring-1 ring-blue-300'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900 text-sm tracking-tight">{hospitalName}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
              {facilityCode}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-slate-700">{activeDepartment}</span>
            <span>•</span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
              Shift: {activeShift}
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Universal UHID & Patient Fast-Search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search Patient by UHID, Mobile, or Name (Press / to focus)..."
            onChange={(e) => onPatientSearch?.(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right: Hospital Status Indicators & User Badge */}
      <div className="flex items-center space-x-3">
        {/* Emergency Alert indicator */}
        <button
          title={`${emergencyAlertCount} Active Critical Alerts`}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors text-xs font-semibold"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
          <span>Alerts ({emergencyAlertCount})</span>
        </button>

        {/* System Notifications */}
        <button
          aria-label="Notifications"
          className="p-1.5 rounded-full text-slate-600 hover:bg-slate-100 relative focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
        </button>

        {/* User Badge */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-100">
            {currentUser.name.charAt(0)}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</div>
            <div className="text-[10px] text-slate-500 flex items-center space-x-1">
              <Shield className="w-2.5 h-2.5 text-blue-600" />
              <span>{currentUser.role}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
