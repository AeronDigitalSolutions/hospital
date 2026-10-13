'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserStatus } from '@chikitsaalye/types';
import { SYSTEM_ROLES, hasPermission as checkPermission, hasAnyRole } from '@chikitsaalye/auth';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  status: UserStatus;
  department?: string | null;
  patientId?: string | null;
  organizationId: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password?: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  switchDemoUser: (role: string) => void;
}

const DEFAULT_DEMO_USERS: Record<string, AuthUser> = {
  [SYSTEM_ROLES.SUPER_ADMIN]: {
    id: 'usr_super_admin',
    username: 'superadmin',
    email: 'superadmin@chikitsaalye.org',
    fullName: 'Super Administrator',
    roles: [SYSTEM_ROLES.SUPER_ADMIN],
    permissions: ['*'],
    status: 'ACTIVE',
    department: 'Administration',
    organizationId: 'UPUMS-MAIN',
  },
  [SYSTEM_ROLES.DOCTOR]: {
    id: 'usr_doctor_sharma',
    username: 'dr.sharma',
    email: 'dr.sharma@chikitsaalye.org',
    fullName: 'Dr. S. K. Sharma',
    roles: [SYSTEM_ROLES.DOCTOR],
    permissions: [
      'PATIENT.READ',
      'PATIENT.UPDATE',
      'ENCOUNTER.READ',
      'ENCOUNTER.CREATE',
      'ENCOUNTER.UPDATE',
      'APPOINTMENT.READ',
      'OPD.ACCESS',
      'IPD.ACCESS',
      'EMERGENCY.ACCESS',
      'LAB.READ',
      'RADIOLOGY.READ',
      'PHARMACY.READ',
    ],
    status: 'ACTIVE',
    department: 'General Medicine',
    organizationId: 'UPUMS-MAIN',
  },
  [SYSTEM_ROLES.NURSE]: {
    id: 'usr_nurse_anita',
    username: 'nurse.anita',
    email: 'nurse.anita@chikitsaalye.org',
    fullName: 'Sister Anita Verma',
    roles: [SYSTEM_ROLES.NURSE],
    permissions: [
      'PATIENT.READ',
      'ENCOUNTER.READ',
      'ENCOUNTER.UPDATE',
      'NURSING.ACCESS',
      'IPD.ACCESS',
      'EMERGENCY.ACCESS',
      'LAB.READ',
      'PHARMACY.READ',
    ],
    status: 'ACTIVE',
    department: 'Emergency & Triage',
    organizationId: 'UPUMS-MAIN',
  },
  [SYSTEM_ROLES.REGISTRATION_DESK]: {
    id: 'usr_reg_desk',
    username: 'reg.desk',
    email: 'reception@chikitsaalye.org',
    fullName: 'Vikas Kumar',
    roles: [SYSTEM_ROLES.REGISTRATION_DESK],
    permissions: [
      'PATIENT.READ',
      'PATIENT.CREATE',
      'PATIENT.UPDATE',
      'ENCOUNTER.READ',
      'ENCOUNTER.CREATE',
      'APPOINTMENT.READ',
      'APPOINTMENT.CREATE',
      'APPOINTMENT.UPDATE',
    ],
    status: 'ACTIVE',
    department: 'Central Registration Desk',
    organizationId: 'UPUMS-MAIN',
  },
  [SYSTEM_ROLES.BILLING_OPERATOR]: {
    id: 'usr_billing_op',
    username: 'billing.user',
    email: 'billing@chikitsaalye.org',
    fullName: 'Rajesh Gupta',
    roles: [SYSTEM_ROLES.BILLING_OPERATOR],
    permissions: [
      'PATIENT.READ',
      'ENCOUNTER.READ',
      'BILLING.READ',
      'BILLING.CREATE',
      'BILLING.UPDATE',
      'BILLING.COLLECT',
    ],
    status: 'ACTIVE',
    department: 'Central Cashier & Billing',
    organizationId: 'UPUMS-MAIN',
  },
  [SYSTEM_ROLES.PATIENT]: {
    id: 'usr_patient_ramesh',
    username: 'patient.ramesh',
    email: 'ramesh.verma@example.com',
    fullName: 'Ramesh Verma',
    roles: [SYSTEM_ROLES.PATIENT],
    permissions: ['PATIENT.READ_OWN', 'ENCOUNTER.READ_OWN'],
    status: 'ACTIVE',
    patientId: 'patient_ramesh_id',
    organizationId: 'UPUMS-MAIN',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(DEFAULT_DEMO_USERS[SYSTEM_ROLES.DOCTOR]);
  const [token, setToken] = useState<string | null>('demo_bearer_token');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check saved session in localStorage/sessionStorage
    const saved = typeof window !== 'undefined' ? localStorage.getItem('chikitsaalye_auth') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.user) {
          setUser(parsed.user);
          setToken(parsed.token || 'saved_session_token');
        }
      } catch (e) {
        // use default
      }
    }
  }, []);

  const login = async (usernameOrEmail: string, password = 'Hospital@123'): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Find matching demo user or default to doctor
      const matched = Object.values(DEFAULT_DEMO_USERS).find(
        (u) =>
          u.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
          u.email.toLowerCase() === usernameOrEmail.toLowerCase()
      );

      const activeUser = matched || DEFAULT_DEMO_USERS[SYSTEM_ROLES.DOCTOR];
      setUser(activeUser);
      setToken('live_token_' + Date.now());

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'chikitsaalye_auth',
          JSON.stringify({ user: activeUser, token: 'live_token_' + Date.now() })
        );
      }
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chikitsaalye_auth');
    }
  };

  const switchDemoUser = (role: string) => {
    const selected = DEFAULT_DEMO_USERS[role] || DEFAULT_DEMO_USERS[SYSTEM_ROLES.DOCTOR];
    setUser(selected);
    setToken('demo_token_' + role.toLowerCase());
    if (typeof window !== 'undefined') {
      localStorage.setItem('chikitsaalye_auth', JSON.stringify({ user: selected, token: 'demo_token_' + role }));
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return checkPermission({ permissions: user.permissions, roles: user.roles }, permission);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return hasAnyRole({ roles: user.roles }, [role]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        logout,
        hasPermission,
        hasRole,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
