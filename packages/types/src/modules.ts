export const HOSPITAL_MODULES = [
  'auth',
  'users',
  'roles',
  'permissions',
  'master-data',
  'patients',
  'encounters',
  'appointments',
  'opd',
  'ipd',
  'emergency',
  'nursing',
  'lab',
  'radiology',
  'pharmacy',
  'billing',
  'ot',
  'icu',
  'discharge',
  'notifications',
  'reports',
  'analytics',
  'integrations',
  'administration',
] as const;

export type HospitalModule = (typeof HOSPITAL_MODULES)[number];

export type DepartmentType =
  | 'OPD'
  | 'IPD'
  | 'EMERGENCY'
  | 'ICU'
  | 'OT'
  | 'PHARMACY'
  | 'PATHOLOGY'
  | 'RADIOLOGY'
  | 'CARDIOLOGY'
  | 'NEUROLOGY'
  | 'ORTHOPEDICS'
  | 'PEDIATRICS'
  | 'BILLING'
  | 'ADMINISTRATION';

export interface ModuleManifest {
  name: HospitalModule;
  title: string;
  category: 'clinical' | 'diagnostics' | 'administrative' | 'governance' | 'platform';
  description: string;
  apiPrefix: string;
  permissions: string[];
}
