export type UserStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'DISABLED' | 'INACTIVE';

export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  LAB_TECHNICIAN: 'LAB_TECHNICIAN',
  RADIOLOGIST: 'RADIOLOGIST',
  PHARMACIST: 'PHARMACIST',
  BILLING_OPERATOR: 'BILLING_OPERATOR',
  REGISTRATION_DESK: 'REGISTRATION_DESK',
  OT_STAFF: 'OT_STAFF',
  ICU_STAFF: 'ICU_STAFF',
  HOSPITAL_LEADERSHIP: 'HOSPITAL_LEADERSHIP',
  PATIENT: 'PATIENT',
  // Backwards compatibility aliases
  CLINICIAN: 'DOCTOR',
  RECEPTIONIST: 'REGISTRATION_DESK',
  BILLING_EXECUTIVE: 'BILLING_OPERATOR',
} as const;

export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

export const SYSTEM_PERMISSIONS = {
  // Patient Master
  PATIENT_READ: 'PATIENT.READ',
  PATIENT_CREATE: 'PATIENT.CREATE',
  PATIENT_UPDATE: 'PATIENT.UPDATE',
  PATIENT_DELETE: 'PATIENT.DELETE',
  PATIENT_READ_OWN: 'PATIENT.READ_OWN',

  // Clinical Encounters
  ENCOUNTER_READ: 'ENCOUNTER.READ',
  ENCOUNTER_CREATE: 'ENCOUNTER.CREATE',
  ENCOUNTER_UPDATE: 'ENCOUNTER.UPDATE',
  ENCOUNTER_CANCEL: 'ENCOUNTER.CANCEL',
  ENCOUNTER_READ_OWN: 'ENCOUNTER.READ_OWN',

  // Appointments
  APPOINTMENT_READ: 'APPOINTMENT.READ',
  APPOINTMENT_CREATE: 'APPOINTMENT.CREATE',
  APPOINTMENT_UPDATE: 'APPOINTMENT.UPDATE',
  APPOINTMENT_CANCEL: 'APPOINTMENT.CANCEL',

  // Clinical Workspaces
  OPD_ACCESS: 'OPD.ACCESS',
  IPD_ACCESS: 'IPD.ACCESS',
  EMERGENCY_ACCESS: 'EMERGENCY.ACCESS',
  NURSING_ACCESS: 'NURSING.ACCESS',
  ICU_ACCESS: 'ICU.ACCESS',
  OT_ACCESS: 'OT.ACCESS',

  // Diagnostics & Labs
  LAB_READ: 'LAB.READ',
  LAB_WRITE: 'LAB.WRITE',
  LAB_VERIFY: 'LAB.VERIFY',
  RADIOLOGY_READ: 'RADIOLOGY.READ',
  RADIOLOGY_WRITE: 'RADIOLOGY.WRITE',

  // Pharmacy & Medications
  PHARMACY_READ: 'PHARMACY.READ',
  PHARMACY_DISPENSE: 'PHARMACY.DISPENSE',
  PHARMACY_INVENTORY: 'PHARMACY.INVENTORY',

  // Billing & Financials
  BILLING_READ: 'BILLING.READ',
  BILLING_CREATE: 'BILLING.CREATE',
  BILLING_UPDATE: 'BILLING.UPDATE',
  BILLING_COLLECT: 'BILLING.COLLECT',

  // Master Data Management
  MASTER_DATA_READ: 'MASTER_DATA.READ',
  MASTER_DATA_CREATE: 'MASTER_DATA.CREATE',
  MASTER_DATA_UPDATE: 'MASTER_DATA.UPDATE',
  MASTER_DATA_DEACTIVATE: 'MASTER_DATA.DEACTIVATE',
  TARIFF_MANAGE: 'TARIFF.MANAGE',
  BED_STATUS_UPDATE: 'BED.STATUS_UPDATE',

  // System Administration, Users & Governance
  USER_READ: 'USER.READ',
  USER_CREATE: 'USER.CREATE',
  USER_UPDATE: 'USER.UPDATE',
  USER_STATUS_CHANGE: 'USER.STATUS_CHANGE',
  ROLE_READ: 'ROLE.READ',
  ROLE_MANAGE: 'ROLE.MANAGE',
  PERMISSION_READ: 'PERMISSION.READ',
  AUDIT_READ: 'AUDIT.READ',
  REPORTS_VIEW: 'REPORTS.VIEW',
  ANALYTICS_VIEW: 'ANALYTICS.VIEW',
  ADMIN_ACCESS: 'ADMIN.ACCESS',
} as const;

export type SystemPermission = (typeof SYSTEM_PERMISSIONS)[keyof typeof SYSTEM_PERMISSIONS];

export interface Permission {
  id: string;
  code: string;
  module: string;
  action: string;
  description: string;
  createdAt?: Date;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  permissions?: Permission[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id: string;
  organizationId: string;
  username: string;
  email: string;
  fullName: string;
  status: UserStatus;
  department?: string | null;
  phone?: string | null;
  designation?: string | null;
  avatarUrl?: string | null;
  patientId?: string | null;
  failedLoginAttempts: number;
  lockoutUntil?: Date | null;
  mfaEnabled: boolean;
  mfaSecret?: string | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  roles: Role[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface AuthContext {
  userId: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  status: UserStatus;
  department?: string | null;
  organizationId: string;
  patientId?: string | null;
  sessionId?: string;
  requestId: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: Date;
  createdAt: Date;
}

export interface LoginResult {
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    status: UserStatus;
    roles: string[];
    permissions: string[];
    patientId?: string | null;
    department?: string | null;
  };
  tokens: AuthTokens;
}
