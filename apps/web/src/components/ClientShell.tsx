'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { HospitalLayout } from '@chikitsaalye/ui';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SYSTEM_ROLES } from '@chikitsaalye/auth';
import { Shield, UserCheck } from 'lucide-react';

export interface ClientShellProps {
  children: React.ReactNode;
}

const ShellContent: React.FC<ClientShellProps> = ({ children }) => {
  const { user, switchDemoUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {/* Dev / Clinical Role Switcher Strip */}
      <div className="bg-slate-950 text-slate-400 text-[11px] px-4 py-1 flex items-center justify-between border-b border-slate-800 z-50">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center text-blue-400 font-semibold space-x-1">
            <Shield className="w-3 h-3" />
            <span>Active Security Context:</span>
          </span>
          <span className="bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded font-mono font-medium border border-blue-800/60">
            {user ? `${user.fullName} (${user.roles.join(', ')})` : 'Unauthenticated'}
          </span>
          {user?.status && (
            <span className="text-[10px] bg-emerald-950/50 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800/40">
              {user.status}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400">Switch Role:</span>
          {[
            { label: 'Admin', role: SYSTEM_ROLES.SUPER_ADMIN },
            { label: 'Doctor', role: SYSTEM_ROLES.DOCTOR },
            { label: 'Nurse', role: SYSTEM_ROLES.NURSE },
            { label: 'Reg Desk', role: SYSTEM_ROLES.REGISTRATION_DESK },
            { label: 'Billing', role: SYSTEM_ROLES.BILLING_OPERATOR },
            { label: 'Patient', role: SYSTEM_ROLES.PATIENT },
          ].map((item) => (
            <button
              key={item.role}
              onClick={() => switchDemoUser(item.role)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                user?.roles.includes(item.role)
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <HospitalLayout
          currentPath={pathname}
          onNavigate={(href) => router.push(href)}
          headerProps={{
            hospitalName: 'Uttar Pradesh University of Medical Sciences Hospital',
            facilityCode: 'UPUMS-MAIN',
            activeDepartment: user?.department || 'Central Hospital Operations',
            activeShift: 'MORNING',
            currentUser: {
              name: user?.fullName || 'Hospital Staff',
              role: user?.roles[0] || 'Clinician',
              department: user?.department || 'Medical Services',
            },
            emergencyAlertCount: 2,
          }}
        >
          {children}
        </HospitalLayout>
      </div>
    </div>
  );
};

export const ClientShell: React.FC<ClientShellProps> = ({ children }) => {
  return (
    <AuthProvider>
      <ShellContent>{children}</ShellContent>
    </AuthProvider>
  );
};
