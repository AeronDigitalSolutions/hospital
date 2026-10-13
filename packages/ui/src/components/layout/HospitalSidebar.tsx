import React from 'react';
import {
  Users,
  Calendar,
  Activity,
  Bed,
  Stethoscope,
  HeartPulse,
  Syringe,
  FlaskConical,
  Scan,
  Pill,
  CreditCard,
  Scissors,
  FileCheck2,
  FileText,
  BarChart3,
  ShieldAlert,
  Settings,
  Share2,
  Database,
  Building2,
  Hospital,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SidebarNavGroup {
  title: string;
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    current?: boolean;
  }[];
}

export interface HospitalSidebarProps {
  isOpen?: boolean;
  isCompact?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
  onToggleCompact?: () => void;
  /** Backwards compatibility for collapsed */
  collapsed?: boolean;
  currentPath?: string;
  className?: string;
}

export const HOSPITAL_NAV_GROUPS: SidebarNavGroup[] = [
  {
    title: 'Core Patient Flow',
    items: [
      { name: 'Patients (MPI / UHID)', href: '/patients', icon: Users },
      { name: 'Encounters', href: '/encounters', icon: Activity },
      { name: 'Appointments', href: '/appointments', icon: Calendar },
    ],
  },
  {
    title: 'Clinical Services',
    items: [
      { name: 'OPD Consultations', href: '/opd', icon: Stethoscope },
      { name: 'Emergency & Triage', href: '/emergency', icon: ShieldAlert, badge: 'RED' },
      { name: 'IPD / Ward Beds', href: '/ipd', icon: Bed },
      { name: 'Nursing Station', href: '/nursing', icon: Syringe },
      { name: 'ICU Monitoring', href: '/icu', icon: HeartPulse },
      { name: 'Operation Theatres', href: '/ot', icon: Scissors },
      { name: 'Discharge Summaries', href: '/discharge', icon: FileCheck2 },
    ],
  },
  {
    title: 'Diagnostics & Pharmacy',
    items: [
      { name: 'Pathology / Lab', href: '/lab', icon: FlaskConical },
      { name: 'Radiology / PACS', href: '/radiology', icon: Scan },
      { name: 'Pharmacy & Formulary', href: '/pharmacy', icon: Pill },
    ],
  },
  {
    title: 'Revenue & Operations',
    items: [
      { name: 'Billing & Counters', href: '/billing', icon: CreditCard },
      { name: 'Reports & Registers', href: '/reports', icon: FileText },
      { name: 'Hospital Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Administration & System',
    items: [
      { name: 'Master Data', href: '/administration/master-data', icon: Database },
      { name: 'ABDM & Integrations', href: '/integrations', icon: Share2 },
      { name: 'Administration & Users', href: '/administration/users', icon: Settings },
    ],
  },
];

export const HospitalSidebar: React.FC<HospitalSidebarProps> = ({
  isOpen = true,
  isCompact = false,
  isMobile = false,
  onClose,
  onToggleCompact,
  collapsed,
  currentPath = '/',
  className = '',
}) => {
  // If legacy collapsed is supplied without isOpen, collapsed=true maps to closed
  const effectiveIsOpen = isOpen !== undefined ? isOpen : !collapsed;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 transition-opacity duration-300 md:hidden',
          effectiveIsOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Hospital Navigation Sidebar */}
      <aside
        className={cn(
          // Base styles
          'bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 select-none z-50 transition-all duration-300 ease-in-out',
          // Mobile responsive: overlay drawer sliding from left
          'fixed inset-y-0 left-0 max-w-[85vw] shadow-2xl md:shadow-none',
          effectiveIsOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop responsive: in-flow sidebar
          'md:static md:translate-x-0 md:h-full md:border-r md:border-slate-800',
          // Desktop width & visibility toggles
          !effectiveIsOpen
            ? 'md:w-0 md:border-r-0 md:overflow-hidden md:opacity-0 md:pointer-events-none'
            : isCompact
              ? 'md:w-16 overflow-y-auto overflow-x-hidden md:opacity-100'
              : 'md:w-64 overflow-y-auto overflow-x-hidden md:opacity-100',
          className
        )}
        aria-label="Hospital Navigation"
      >
        {/* Inner container with constant width to guarantee smooth slide animations without text wrapping */}
        <div
          className={cn(
            'h-full flex flex-col flex-shrink-0 transition-all duration-200',
            isCompact ? 'w-16' : 'w-64'
          )}
        >
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-3.5 bg-slate-950 border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm ring-1 ring-blue-400 flex-shrink-0">
                <Hospital className="w-5 h-5" />
              </div>
              {!isCompact && (
                <div className="flex flex-col truncate">
                  <span className="font-bold text-white text-base tracking-wide leading-none truncate">
                    Chikitsaalye
                  </span>
                  <span className="text-[10px] text-blue-400 font-mono font-medium tracking-tight mt-0.5 truncate">
                    Enterprise Health OS
                  </span>
                </div>
              )}
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Modules */}
          <nav
            className={cn(
              'flex-1 overflow-y-auto py-3 space-y-4 scrollbar-thin',
              isCompact ? 'px-2' : 'px-3'
            )}
          >
            {HOSPITAL_NAV_GROUPS.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                {!isCompact && (
                  <h3 className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                    {group.title}
                  </h3>
                )}
                {isCompact && (
                  <div
                    className="my-2 border-t border-slate-800/80 mx-1"
                    title={group.title}
                  />
                )}
                <ul className="space-y-0.5">
                  {group.items.map((item, itemIdx) => {
                    const Icon = item.icon;
                    const isActive =
                      currentPath === item.href ||
                      (item.href !== '/' && currentPath.startsWith(item.href));

                    return (
                      <li key={itemIdx}>
                        <a
                          href={item.href}
                          onClick={() => {
                            if (isMobile) onClose?.();
                          }}
                          title={isCompact ? item.name : undefined}
                          className={cn(
                            'flex items-center rounded-md text-xs font-medium transition-colors group relative',
                            isCompact ? 'justify-center p-2.5' : 'space-x-3 px-2.5 py-2',
                            isActive
                              ? 'bg-blue-600 text-white font-semibold shadow-xs'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          )}
                        >
                          <Icon
                            className={cn(
                              'w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105',
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                            )}
                          />
                          {!isCompact && (
                            <div className="flex-1 flex items-center justify-between min-w-0">
                              <span className="truncate">{item.name}</span>
                              {item.badge && (
                                <span className="ml-1.5 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 flex-shrink-0">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Hover tooltip when in compact dock mode */}
                          {isCompact && (
                            <div className="hidden group-hover:flex absolute left-full ml-2 px-2.5 py-1 bg-slate-950 text-white text-xs font-medium rounded-md shadow-lg border border-slate-700 whitespace-nowrap z-50 pointer-events-none">
                              {item.name}
                              {item.badge && (
                                <span className="ml-1.5 text-[9px] text-rose-300">
                                  ({item.badge})
                                </span>
                              )}
                            </div>
                          )}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Footer Controls & System Status */}
          <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col space-y-2 flex-shrink-0">
            {/* Desktop Compact / Expand Toggle */}
            {onToggleCompact && (
              <button
                onClick={onToggleCompact}
                className={cn(
                  'hidden md:flex items-center rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors py-1.5 text-xs',
                  isCompact ? 'justify-center px-1' : 'justify-between px-2 w-full'
                )}
                title={isCompact ? 'Expand navigation labels' : 'Collapse to compact icon dock'}
              >
                <span className="flex items-center space-x-2">
                  {isCompact ? (
                    <ChevronRight className="w-4 h-4 text-blue-400" />
                  ) : (
                    <>
                      <ChevronLeft className="w-4 h-4 text-slate-400" />
                      <span>Compact Dock</span>
                    </>
                  )}
                </span>
                {!isCompact && (
                  <span className="text-[10px] text-slate-500 font-mono">rail</span>
                )}
              </button>
            )}

            {!isCompact && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px]">
                <span>v0.1.0</span>
                <span className="flex items-center text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                  System Online
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
