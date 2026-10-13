import {
  SYSTEM_ROLES,
  SYSTEM_PERMISSIONS,
  type SystemRole,
  type SystemPermission,
} from '@chikitsaalye/types';

export { SYSTEM_ROLES, SYSTEM_PERMISSIONS, type SystemRole, type SystemPermission };

/**
 * Standard Role-to-Permissions Mapping for Chikitsaalye Health OS
 */
export const ROLE_PERMISSIONS_MAP: Record<string, string[]> = {
  [SYSTEM_ROLES.SUPER_ADMIN]: ['*'],

  [SYSTEM_ROLES.HOSPITAL_ADMIN]: [
    SYSTEM_PERMISSIONS.USER_READ,
    SYSTEM_PERMISSIONS.USER_CREATE,
    SYSTEM_PERMISSIONS.USER_UPDATE,
    SYSTEM_PERMISSIONS.USER_STATUS_CHANGE,
    SYSTEM_PERMISSIONS.ROLE_READ,
    SYSTEM_PERMISSIONS.ROLE_MANAGE,
    SYSTEM_PERMISSIONS.PERMISSION_READ,
    SYSTEM_PERMISSIONS.AUDIT_READ,
    SYSTEM_PERMISSIONS.PATIENT_READ,
    SYSTEM_PERMISSIONS.PATIENT_CREATE,
    SYSTEM_PERMISSIONS.PATIENT_UPDATE,
    SYSTEM_PERMISSIONS.ENCOUNTER_READ,
    SYSTEM_PERMISSIONS.ENCOUNTER_CREATE,
    SYSTEM_PERMISSIONS.ENCOUNTER_UPDATE,
    SYSTEM_PERMISSIONS.BILLING_READ,
    SYSTEM_PERMISSIONS.REPORTS_VIEW,
    SYSTEM_PERMISSIONS.ANALYTICS_VIEW,
    SYSTEM_PERMISSIONS.ADMIN_ACCESS,
  ],

  [SYSTEM_ROLES.DOCTOR]: [
    SYSTEM_PERMISSIONS.PATIENT_READ,
    SYSTEM_PERMISSIONS.PATIENT_UPDATE,
    SYSTEM_PERMISSIONS.ENCOUNTER_READ,
    SYSTEM_PERMISSIONS.ENCOUNTER_CREATE,
    SYSTEM_PERMISSIONS.ENCOUNTER_UPDATE,
    SYSTEM_PERMISSIONS.APPOINTMENT_READ,
    SYSTEM_PERMISSIONS.APPOINTMENT_UPDATE,
    SYSTEM_PERMISSIONS.OPD_ACCESS,
    SYSTEM_PERMISSIONS.IPD_ACCESS,
    SYSTEM_PERMISSIONS.EMERGENCY_ACCESS,
    SYSTEM_PERMISSIONS.LAB_READ,
    SYSTEM_PERMISSIONS.RADIOLOGY_READ,
    SYSTEM_PERMISSIONS.PHARMACY_READ,
  ],

  [SYSTEM_ROLES.NURSE]: [
    SYSTEM_PERMISSIONS.PATIENT_READ,
    SYSTEM_PERMISSIONS.ENCOUNTER_READ,
    SYSTEM_PERMISSIONS.ENCOUNTER_UPDATE,
    SYSTEM_PERMISSIONS.NURSING_ACCESS,
    SYSTEM_PERMISSIONS.IPD_ACCESS,
    SYSTEM_PERMISSIONS.EMERGENCY_ACCESS,
    SYSTEM_PERMISSIONS.LAB_READ,
    SYSTEM_PERMISSIONS.PHARMACY_READ,
  ],

  [SYSTEM_ROLES.REGISTRATION_DESK]: [
    SYSTEM_PERMISSIONS.PATIENT_READ,
    SYSTEM_PERMISSIONS.PATIENT_CREATE,
    SYSTEM_PERMISSIONS.PATIENT_UPDATE,
    SYSTEM_PERMISSIONS.ENCOUNTER_READ,
    SYSTEM_PERMISSIONS.ENCOUNTER_CREATE,
    SYSTEM_PERMISSIONS.APPOINTMENT_READ,
    SYSTEM_PERMISSIONS.APPOINTMENT_CREATE,
    SYSTEM_PERMISSIONS.APPOINTMENT_UPDATE,
  ],

  [SYSTEM_ROLES.BILLING_OPERATOR]: [
    SYSTEM_PERMISSIONS.PATIENT_READ,
    SYSTEM_PERMISSIONS.ENCOUNTER_READ,
    SYSTEM_PERMISSIONS.BILLING_READ,
    SYSTEM_PERMISSIONS.BILLING_CREATE,
    SYSTEM_PERMISSIONS.BILLING_UPDATE,
    SYSTEM_PERMISSIONS.BILLING_COLLECT,
  ],

  [SYSTEM_ROLES.LAB_TECHNICIAN]: [
    SYSTEM_PERMISSIONS.PATIENT_READ,
    SYSTEM_PERMISSIONS.ENCOUNTER_READ,
    SYSTEM_PERMISSIONS.LAB_READ,
    SYSTEM_PERMISSIONS.LAB_WRITE,
    SYSTEM_PERMISSIONS.LAB_VERIFY,
  ],

  [SYSTEM_ROLES.RADIOLOGIST]: [
    SYSTEM_PERMISSIONS.PATIENT_READ,
    SYSTEM_PERMISSIONS.ENCOUNTER_READ,
    SYSTEM_PERMISSIONS.RADIOLOGY_READ,
    SYSTEM_PERMISSIONS.RADIOLOGY_WRITE,
  ],

  [SYSTEM_ROLES.PHARMACIST]: [
    SYSTEM_PERMISSIONS.PATIENT_READ,
    SYSTEM_PERMISSIONS.ENCOUNTER_READ,
    SYSTEM_PERMISSIONS.PHARMACY_READ,
    SYSTEM_PERMISSIONS.PHARMACY_DISPENSE,
    SYSTEM_PERMISSIONS.PHARMACY_INVENTORY,
  ],

  [SYSTEM_ROLES.OT_STAFF]: [
    SYSTEM_PERMISSIONS.PATIENT_READ,
    SYSTEM_PERMISSIONS.ENCOUNTER_READ,
    SYSTEM_PERMISSIONS.ENCOUNTER_UPDATE,
    SYSTEM_PERMISSIONS.OT_ACCESS,
  ],

  [SYSTEM_ROLES.ICU_STAFF]: [
    SYSTEM_PERMISSIONS.PATIENT_READ,
    SYSTEM_PERMISSIONS.ENCOUNTER_READ,
    SYSTEM_PERMISSIONS.ENCOUNTER_UPDATE,
    SYSTEM_PERMISSIONS.ICU_ACCESS,
  ],

  [SYSTEM_ROLES.HOSPITAL_LEADERSHIP]: [
    SYSTEM_PERMISSIONS.PATIENT_READ,
    SYSTEM_PERMISSIONS.ENCOUNTER_READ,
    SYSTEM_PERMISSIONS.BILLING_READ,
    SYSTEM_PERMISSIONS.REPORTS_VIEW,
    SYSTEM_PERMISSIONS.ANALYTICS_VIEW,
    SYSTEM_PERMISSIONS.AUDIT_READ,
  ],

  [SYSTEM_ROLES.PATIENT]: [
    SYSTEM_PERMISSIONS.PATIENT_READ_OWN,
    SYSTEM_PERMISSIONS.ENCOUNTER_READ_OWN,
  ],
};

// Aliases for backward compatibility
ROLE_PERMISSIONS_MAP['CLINICIAN'] = ROLE_PERMISSIONS_MAP[SYSTEM_ROLES.DOCTOR];
ROLE_PERMISSIONS_MAP['RECEPTIONIST'] = ROLE_PERMISSIONS_MAP[SYSTEM_ROLES.REGISTRATION_DESK];
ROLE_PERMISSIONS_MAP['BILLING_EXECUTIVE'] = ROLE_PERMISSIONS_MAP[SYSTEM_ROLES.BILLING_OPERATOR];

/**
 * Get aggregated default permissions for an array of role codes
 */
export function getPermissionsForRoles(roles: string[]): string[] {
  const permSet = new Set<string>();
  for (const role of roles) {
    const perms = ROLE_PERMISSIONS_MAP[role] || [];
    for (const p of perms) {
      permSet.add(p);
    }
  }
  return Array.from(permSet);
}

/**
 * Check if the given auth context has a specific permission
 */
export function hasPermission(
  auth: { permissions?: string[]; roles?: string[] } | null | undefined,
  requiredPermission: string
): boolean {
  if (!auth) return false;

  const roles = auth.roles || [];
  const permissions = auth.permissions || [];

  // Super Admin bypasses all checks
  if (roles.includes(SYSTEM_ROLES.SUPER_ADMIN)) {
    return true;
  }

  // Wildcard permission check
  if (permissions.includes('*')) {
    return true;
  }

  // Exact match
  if (permissions.includes(requiredPermission)) {
    return true;
  }

  // Module level wildcard (e.g., "PATIENT.*" satisfies "PATIENT.READ")
  const [resource] = requiredPermission.split('.');
  if (resource && permissions.includes(`${resource}.*`)) {
    return true;
  }

  return false;
}

/**
 * Check if the given auth context has any of the allowed roles
 */
export function hasAnyRole(
  auth: { roles?: string[] } | null | undefined,
  allowedRoles: string[]
): boolean {
  if (!auth || !auth.roles) return false;
  if (auth.roles.includes(SYSTEM_ROLES.SUPER_ADMIN)) return true;
  return auth.roles.some((role) => allowedRoles.includes(role));
}

/**
 * Context/Ownership Authorization: Patient data access control
 * Staff with PATIENT.READ can access any patient.
 * Users with PATIENT role can ONLY access their own patient record.
 */
export function canAccessPatientRecord(
  auth: {
    userId: string;
    roles?: string[];
    permissions?: string[];
    patientId?: string | null;
  } | null | undefined,
  targetPatientId: string,
  targetUhid?: string | null
): boolean {
  if (!auth) return false;

  // Super admin can access
  if (auth.roles?.includes(SYSTEM_ROLES.SUPER_ADMIN)) return true;

  // Staff with PATIENT.READ permission can access
  if (hasPermission(auth, SYSTEM_PERMISSIONS.PATIENT_READ)) {
    // If user has both staff role and patient role, staff permission takes precedence
    const isStaff = (auth.roles || []).some((r) => r !== SYSTEM_ROLES.PATIENT);
    if (isStaff) return true;
  }

  // If user is a PATIENT, they must own the record
  if (auth.roles?.includes(SYSTEM_ROLES.PATIENT)) {
    if (!auth.patientId) return false;
    return auth.patientId === targetPatientId || (Boolean(targetUhid) && auth.patientId === targetUhid);
  }

  return false;
}
