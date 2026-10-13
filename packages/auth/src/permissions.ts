import type { AuthContext } from '@chikitsaalye/types';

export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',
  CHIEF_MEDICAL_OFFICER: 'CHIEF_MEDICAL_OFFICER',
  CLINICIAN: 'CLINICIAN',
  NURSE: 'NURSE',
  PHARMACIST: 'PHARMACIST',
  LAB_TECHNICIAN: 'LAB_TECHNICIAN',
  RADIOLOGIST: 'RADIOLOGIST',
  BILLING_EXECUTIVE: 'BILLING_EXECUTIVE',
  RECEPTIONIST: 'RECEPTIONIST',
  AUDITOR: 'AUDITOR',
} as const;

export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

export const PERMISSIONS = {
  // System & Users
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  ROLES_MANAGE: 'roles:manage',
  AUDIT_READ: 'audit:read',

  // Clinical & Patients
  PATIENTS_READ: 'patients:read',
  PATIENTS_WRITE: 'patients:write',
  ENCOUNTERS_READ: 'encounters:read',
  ENCOUNTERS_WRITE: 'encounters:write',
  APPOINTMENTS_READ: 'appointments:read',
  APPOINTMENTS_WRITE: 'appointments:write',
  OPD_ACCESS: 'opd:access',
  IPD_ACCESS: 'ipd:access',
  EMERGENCY_ACCESS: 'emergency:access',
  NURSING_ACCESS: 'nursing:access',
  ICU_ACCESS: 'icu:access',
  OT_ACCESS: 'ot:access',

  // Diagnostics & Pharmacy
  LAB_ORDERS_READ: 'lab:read',
  LAB_ORDERS_WRITE: 'lab:write',
  RADIOLOGY_READ: 'radiology:read',
  RADIOLOGY_WRITE: 'radiology:write',
  PHARMACY_DISPENSE: 'pharmacy:dispense',
  PHARMACY_INVENTORY: 'pharmacy:inventory',

  // Billing & Reports
  BILLING_READ: 'billing:read',
  BILLING_WRITE: 'billing:write',
  REPORTS_VIEW: 'reports:view',
  ANALYTICS_VIEW: 'analytics:view',
  INTEGRATIONS_MANAGE: 'integrations:manage',
} as const;

export type SystemPermission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export function hasPermission(
  auth: { permissions: string[]; roles: string[] } | null | undefined,
  requiredPermission: string
): boolean {
  if (!auth) return false;
  // Super admin bypasses permission checks
  if (auth.roles.includes(SYSTEM_ROLES.SUPER_ADMIN)) return true;
  return auth.permissions.includes(requiredPermission) || auth.permissions.includes('*');
}

export function hasAnyRole(
  auth: { roles: string[] } | null | undefined,
  allowedRoles: string[]
): boolean {
  if (!auth) return false;
  if (auth.roles.includes(SYSTEM_ROLES.SUPER_ADMIN)) return true;
  return auth.roles.some((role) => allowedRoles.includes(role));
}
