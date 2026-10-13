import React, { useState, useCallback } from 'react';
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
  Hospital,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SidebarNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description: string;
  category: string;
}

export interface SidebarNavGroup {
  title: string;
  items: SidebarNavItem[];
}

export interface HospitalSidebarProps {
  collapsed?: boolean;
  mobileDrawerOpen?: boolean;
  isMobile?: boolean;
  onCloseMobile?: () => void;
  onToggleCollapse?: () => void;
  currentPath?: string;
  className?: string;
  onNavigate?: (href: string) => void;
  /** Backwards compatibility aliases */
  isOpen?: boolean;
  isCompact?: boolean;
  onClose?: () => void;
  onToggleCompact?: () => void;
}

export const HOSPITAL_NAV_GROUPS: SidebarNavGroup[] = [
  {
    title: 'Core Patient Flow',
    items: [
      {
        name: 'Patients (MPI / UHID)',
        href: '/patients',
        icon: Users,
        description: 'Canonical UHID registry, demographics & longitudinal clinical 360',
        category: 'Core Patient Flow',
      },
      {
        name: 'Encounters',
        href: '/encounters',
        icon: Activity,
        description: 'Outpatient, Emergency & Inpatient clinical encounter timelines',
        category: 'Core Patient Flow',
      },
      {
        name: 'Appointments',
        href: '/appointments',
        icon: Calendar,
        description: 'Clinician rosters, department sessions & patient slot bookings',
        category: 'Core Patient Flow',
      },
    ],
  },
  {
    title: 'Clinical Services',
    items: [
      {
        name: 'OPD Consultations',
        href: '/opd',
        icon: Stethoscope,
        description: 'Outpatient clinic queue, chief complaints, ICD-10 notes & CPOE orders',
        category: 'Clinical Services',
      },
      {
        name: 'Emergency & Triage',
        href: '/emergency',
        icon: ShieldAlert,
        badge: 'RED',
        description: 'High-acuity triage (Red/Amber/Green), trauma resuscitation & acute care',
        category: 'Acute & Emergency',
      },
      {
        name: 'IPD / Ward Beds',
        href: '/ipd',
        icon: Bed,
        description: 'Real-time ward bed grid, occupancy tracking, transfers & daily rounds',
        category: 'Inpatient Care',
      },
      {
        name: 'Nursing Station',
        href: '/nursing',
        icon: Syringe,
        description: 'Bedside vital signs flowsheets, doctor order execution & shift handover',
        category: 'Inpatient Care',
      },
      {
        name: 'ICU Monitoring',
        href: '/icu',
        icon: HeartPulse,
        description: 'Continuous hemodynamic telemetry, ventilator charting & critical alerts',
        category: 'Critical Care',
      },
      {
        name: 'Operation Theatres',
        href: '/ot',
        icon: Scissors,
        description: 'Surgical scheduling, WHO safety checklist, anesthesia & recovery',
        category: 'Surgical Care',
      },
      {
        name: 'Discharge Summaries',
        href: '/discharge',
        icon: FileCheck2,
        description: 'Multi-disciplinary clinical handover, home medications & clearance',
        category: 'Inpatient Care',
      },
    ],
  },
  {
    title: 'Diagnostics & Pharmacy',
    items: [
      {
        name: 'Pathology / Lab',
        href: '/lab',
        icon: FlaskConical,
        description: 'Specimen accessioning, analyzer telemetry & verified lab results',
        category: 'Diagnostics',
      },
      {
        name: 'Radiology / PACS',
        href: '/radiology',
        icon: Scan,
        description: 'Imaging worklist, DICOM viewer integration & radiological reports',
        category: 'Diagnostics',
      },
      {
        name: 'Pharmacy & Formulary',
        href: '/pharmacy',
        icon: Pill,
        description: 'Drug dispensing, national essential formulary, stock & batch tracks',
        category: 'Pharmacy Services',
      },
    ],
  },
  {
    title: 'Revenue & Operations',
    items: [
      {
        name: 'Billing & Counters',
        href: '/billing',
        icon: CreditCard,
        description: 'Unified patient billing, scheme tariffs, cash counters & TPA insurance',
        category: 'Revenue Operations',
      },
      {
        name: 'Reports & Registers',
        href: '/reports',
        icon: FileText,
        description: 'Statutory hospital registers, MLC tracking & clinical audit extracts',
        category: 'Administrative Operations',
      },
      {
        name: 'Hospital Analytics',
        href: '/analytics',
        icon: BarChart3,
        description: 'Bed occupancy %, average length of stay (ALOS) & executive KPIs',
        category: 'Executive Intelligence',
      },
    ],
  },
  {
    title: 'Administration & System',
    items: [
      {
        name: 'Master Data',
        href: '/administration/master-data',
        icon: Database,
        description: 'Central hospital taxonomy: Departments, Wards, Beds, Tariffs & Drugs',
        category: 'Central Master Data',
      },
      {
        name: 'ABDM & Integrations',
        href: '/integrations',
        icon: Share2,
        description: 'Ayushman Bharat Digital Mission (ABHA, M1/M2/M3 & FHIR Gateway)',
        category: 'National Integrations',
      },
      {
        name: 'Administration & Users',
        href: '/administration/users',
        icon: Settings,
        description: 'Role-based access control (RBAC), staff credentials & security audit',
        category: 'Security & Administration',
      },
    ],
  },
];

interface HoveredTooltipData {
  item: SidebarNavItem;
  isActive: boolean;
  x: number;
  y: number;
}

export const HospitalSidebar: React.FC<HospitalSidebarProps> = ({
  collapsed = false,
  mobileDrawerOpen = false,
  isMobile = false,
  onCloseMobile,
  onToggleCollapse,
  currentPath = '/',
  className = '',
  onNavigate,
  // Backwards compatibility mappings
  isOpen,
  isCompact,
  onClose,
  onToggleCompact,
}) => {
  // Support legacy props
  const effectiveCollapsed = isCompact !== undefined ? isCompact : (isOpen !== undefined ? !isOpen : collapsed);
  const effectiveMobileOpen = mobileDrawerOpen || (isOpen !== undefined && isMobile && isOpen);
  const handleClose = onCloseMobile || onClose;
  const handleToggle = onToggleCollapse || onToggleCompact;

  // Hover state for collapsed dock bubbly expansion popover
  const [hoveredData, setHoveredData] = useState<HoveredTooltipData | null>(null);

  const handleMouseEnter = useCallback(
    (item: SidebarNavItem, isActive: boolean, e: React.MouseEvent<HTMLElement>) => {
      if (!effectiveCollapsed) return;
      const rect = e.currentTarget.getBoundingClientRect();
      setHoveredData({
        item,
        isActive,
        x: rect.right,
        y: rect.top + rect.height / 2,
      });
    },
    [effectiveCollapsed]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredData(null);
  }, []);

  const handleLinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      setHoveredData(null);
      if (isMobile) handleClose?.();
      if (onNavigate) {
        onNavigate(href);
      } else {
        window.location.href = href;
      }
    },
    [isMobile, handleClose, onNavigate]
  );

  return (
    <>
      {/* Dynamic Keyframes for the Bubbly Pop Animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bubblyExpansion {
          0% {
            opacity: 0;
            transform: translateY(-50%) scale(0.8) translateX(-12px);
          }
          60% {
            opacity: 1;
            transform: translateY(-50%) scale(1.05) translateX(3px);
          }
          100% {
            opacity: 1;
            transform: translateY(-50%) scale(1) translateX(0);
          }
        }
      `}} />

      {/* Mobile Drawer Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-40 transition-opacity duration-300 md:hidden',
          effectiveMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Hospital Navigation Sidebar */}
      <aside
        className={cn(
          // Base styles
          'bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 select-none z-50 transition-all duration-300 ease-in-out',
          // Mobile responsive: overlay drawer sliding from left
          'fixed inset-y-0 left-0 max-w-[85vw] shadow-2xl md:shadow-none',
          effectiveMobileOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop responsive: in-flow sidebar
          'md:static md:translate-x-0 md:h-full md:border-r md:border-slate-800',
          // Desktop Width toggling: expanded w-64 vs collapsed dock w-[76px]
          effectiveCollapsed
            ? 'w-[76px] md:w-[76px] overflow-visible'
            : 'w-64 md:w-64 overflow-hidden',
          className
        )}
        aria-label="Hospital Navigation"
      >
        <div
          className={cn(
            'h-full flex flex-col flex-shrink-0 transition-all duration-300',
            effectiveCollapsed ? 'w-[76px]' : 'w-64'
          )}
        >
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-3 bg-slate-950 border-b border-slate-800 flex-shrink-0">
            <div className={cn('flex items-center space-x-2.5 overflow-hidden', effectiveCollapsed && 'w-full justify-center')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md ring-1 ring-blue-400/50 flex-shrink-0">
                <Hospital className="w-5 h-5" />
              </div>
              {!effectiveCollapsed && (
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

            {/* Mobile Close Button */}
            <button
              onClick={handleClose}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Modules List */}
          <nav
            onScroll={handleMouseLeave}
            className={cn(
              'flex-1 overflow-y-auto py-3 scrollbar-thin',
              effectiveCollapsed ? 'px-2 space-y-2' : 'px-3 space-y-4'
            )}
          >
            {HOSPITAL_NAV_GROUPS.map((group, groupIdx) => (
              <div key={groupIdx} className={cn(effectiveCollapsed ? 'space-y-1.5' : 'space-y-1')}>
                {/* Group Title in Expanded Mode */}
                {!effectiveCollapsed && (
                  <h3 className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                    {group.title}
                  </h3>
                )}

                {/* Subtle Divider in Collapsed Dock Mode */}
                {effectiveCollapsed && groupIdx > 0 && (
                  <div
                    className="my-2 border-t border-slate-800/80 mx-2"
                    title={group.title}
                  />
                )}

                <ul className={cn(effectiveCollapsed ? 'space-y-2' : 'space-y-0.5')}>
                  {group.items.map((item, itemIdx) => {
                    const Icon = item.icon;
                    const isActive =
                      currentPath === item.href ||
                      (item.href !== '/' && currentPath.startsWith(item.href));

                    // ==========================================
                    // 1. COLLAPSED DOCK MODE
                    // ==========================================
                    if (effectiveCollapsed) {
                      return (
                        <li key={itemIdx} className="flex justify-center">
                          <a
                            href={item.href}
                            onClick={(e) => handleLinkClick(e, item.href)}
                            onMouseEnter={(e) => handleMouseEnter(item, isActive, e)}
                            onMouseLeave={handleMouseLeave}
                            aria-label={item.name}
                            className={cn(
                              'relative flex items-center justify-center transition-all duration-300 ease-out select-none',
                              // ACTIVE MODULE: Highlighted bigger icon in a rounded corner square / circle
                              isActive
                                ? 'w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-xl shadow-blue-500/50 ring-2 ring-white/35 z-10'
                                // INACTIVE MODULES: Sleek compact icons with bubbly hover animation
                                : 'w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/90 hover:ring-2 hover:ring-blue-400/60 hover:shadow-lg hover:shadow-blue-500/30 hover:bg-gradient-to-tr hover:from-blue-600/30 hover:to-indigo-600/30',
                              // Bubbly expansion animation on hover
                              'hover:scale-120 hover:-translate-y-0.5'
                            )}
                          >
                            {/* Distinct active glowing indicator on left */}
                            {isActive && (
                              <span className="absolute -left-2 w-1.5 h-6 rounded-r-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                            )}

                            <Icon
                              className={cn(
                                'transition-transform duration-300 flex-shrink-0',
                                isActive ? 'w-6 h-6 text-white drop-shadow-sm' : 'w-5 h-5'
                              )}
                            />

                            {/* Red priority dot on collapsed icon */}
                            {item.badge && !isActive && (
                              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-pulse" />
                            )}
                          </a>
                        </li>
                      );
                    }

                    // ==========================================
                    // 2. EXPANDED FULL SIDEBAR MODE
                    // ==========================================
                    return (
                      <li key={itemIdx}>
                        <a
                          href={item.href}
                          onClick={(e) => handleLinkClick(e, item.href)}
                          className={cn(
                            'flex items-center space-x-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group relative',
                            isActive
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          )}
                        >
                          <Icon
                            className={cn(
                              'w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110',
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                            )}
                          />
                          <div className="flex-1 flex items-center justify-between min-w-0">
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <span className="ml-1.5 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 flex-shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </div>
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
            {/* Desktop Collapse / Expand Toggle Button */}
            {handleToggle && (
              <button
                onClick={handleToggle}
                className={cn(
                  'hidden md:flex items-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors py-1.5 text-xs',
                  effectiveCollapsed ? 'justify-center w-full px-1' : 'justify-between px-2.5 w-full'
                )}
                title={effectiveCollapsed ? 'Expand sidebar labels' : 'Collapse to icon dock'}
              >
                <span className="flex items-center space-x-2">
                  {effectiveCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-blue-400" />
                  ) : (
                    <>
                      <ChevronLeft className="w-4 h-4 text-slate-400" />
                      <span>Collapse Sidebar</span>
                    </>
                  )}
                </span>
                {!effectiveCollapsed && (
                  <span className="text-[10px] text-slate-500 font-mono">dock</span>
                )}
              </button>
            )}

            {!effectiveCollapsed && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px]">
                <span>v0.1.0 (CODEx-001)</span>
                <span className="flex items-center text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                  System Online
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================
          BUBBLY EXPANSION POPOVER (Floats to the right on hover)
          ======================================================== */}
      {effectiveCollapsed && hoveredData && (
        <div
          style={{
            position: 'fixed',
            left: hoveredData.x + 14,
            top: hoveredData.y,
            transform: 'translateY(-50%)',
            zIndex: 9999,
            animation: 'bubblyExpansion 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
          className="pointer-events-none flex items-center select-none"
        >
          {/* Bubbly Speech-bubble triangle pointer */}
          <div className="w-3 h-3 bg-slate-900 border-l border-b border-slate-700/80 -rotate-45 translate-x-1.5 z-10 shadow-sm" />

          {/* Expanded Bubbly Card */}
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 text-white rounded-2xl p-3.5 shadow-[0_12px_40px_-5px_rgba(0,0,0,0.65),0_0_25px_rgba(59,130,246,0.25)] flex items-center space-x-3.5 min-w-[280px] max-w-[340px]">
            {/* Expanded Icon Bubble */}
            <div
              className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md',
                hoveredData.isActive
                  ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white ring-2 ring-cyan-400/50'
                  : 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
              )}
            >
              {React.createElement(hoveredData.item.icon, { className: 'w-5 h-5 text-white' })}
            </div>

            {/* Expanded Content Details & Clinical Meaning */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-white tracking-tight truncate">
                  {hoveredData.item.name}
                </span>
                {hoveredData.isActive ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ACTIVE
                  </span>
                ) : hoveredData.item.badge ? (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex-shrink-0">
                    {hoveredData.item.badge}
                  </span>
                ) : null}
              </div>

              <p className="text-[11px] text-slate-300 leading-snug font-normal">
                {hoveredData.item.description}
              </p>

              <div className="flex items-center space-x-1.5 pt-0.5">
                <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                  {hoveredData.item.category}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[9px] font-mono text-slate-400">
                  Click to open
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
