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
} from 'lucide-react';

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
  collapsed = false,
  currentPath = '/',
  className = '',
}) => {
  return (
    <aside
      className={`w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800 transition-all duration-200 select-none ${
        collapsed ? 'w-16' : 'w-64'
      } ${className}`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm ring-1 ring-blue-400">
            <Hospital className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-white text-base tracking-wide leading-none">Chikitsaalye</span>
              <span className="text-[10px] text-blue-400 font-mono font-medium tracking-tight mt-0.5">
                Enterprise Health OS
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Modules */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5 scrollbar-thin">
        {HOSPITAL_NAV_GROUPS.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!collapsed && (
              <h3 className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.title}
              </h3>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isActive = currentPath === item.href;
                return (
                  <li key={itemIdx}>
                    <a
                      href={item.href}
                      title={collapsed ? item.name : undefined}
                      className={`flex items-center space-x-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      {!collapsed && (
                        <div className="flex-1 flex items-center justify-between">
                          <span className="truncate">{item.name}</span>
                          {item.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              {item.badge}
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

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>v0.1.0 (CODEx-001)</span>
          <span className="text-emerald-400 font-mono">System Online</span>
        </div>
      )}
    </aside>
  );
};
