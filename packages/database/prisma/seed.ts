import { PrismaClient, UserStatus, AuditActorType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Seeding Chikitsaalye baseline infrastructure...');

  // 1. Hospital Organization
  const org = await prisma.hospitalOrganization.upsert({
    where: { code: 'UPUMS-MAIN' },
    update: {},
    create: {
      code: 'UPUMS-MAIN',
      name: 'Uttar Pradesh University of Medical Sciences Hospital',
      legalName: 'UPUMS Teaching Hospital & Research Center',
      address: 'Saifai, Etawah, Uttar Pradesh, India - 206130',
      phone: '+91-5688-276563',
      email: 'info@upums.ac.in',
      website: 'https://www.upums.ac.in',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      isActive: true,
      metadata: {
        totalBeds: 1050,
        type: 'Autonomous Teaching Hospital & Medical Institute',
      },
    },
  });
  console.log(`[Seed] Organization verified: ${org.name} (${org.code})`);

  // 2. Baseline Permissions
  const permissionsData = [
    // Auth & Admin
    { code: 'users:read', module: 'users', action: 'read', description: 'View system users' },
    { code: 'users:write', module: 'users', action: 'write', description: 'Create and update users' },
    { code: 'roles:manage', module: 'roles', action: 'manage', description: 'Manage roles and permissions' },
    { code: 'audit:read', module: 'audit', action: 'read', description: 'Inspect system audit logs' },
    { code: 'admin:access', module: 'administration', action: 'access', description: 'Access administration module' },

    // Clinical & Operations
    { code: 'patients:read', module: 'patients', action: 'read', description: 'Search and view patient records' },
    { code: 'patients:write', module: 'patients', action: 'write', description: 'Register and update patient records' },
    { code: 'encounters:read', module: 'encounters', action: 'read', description: 'View encounter records' },
    { code: 'encounters:write', module: 'encounters', action: 'write', description: 'Create and update encounters' },
    { code: 'appointments:read', module: 'appointments', action: 'read', description: 'View appointments' },
    { code: 'appointments:write', module: 'appointments', action: 'write', description: 'Book and manage appointments' },
    { code: 'opd:access', module: 'opd', action: 'access', description: 'OPD queue and consultations' },
    { code: 'ipd:access', module: 'ipd', action: 'access', description: 'Inpatient ward and bed management' },
    { code: 'emergency:access', module: 'emergency', action: 'access', description: 'Emergency triage and admissions' },
    { code: 'nursing:access', module: 'nursing', action: 'access', description: 'Nursing care and vitals recording' },
    { code: 'ot:access', module: 'ot', action: 'access', description: 'Operating theatre schedules and notes' },
    { code: 'icu:access', module: 'icu', action: 'access', description: 'Intensive care unit monitoring' },
    { code: 'discharge:access', module: 'discharge', action: 'access', description: 'Patient discharge summaries and clearance' },

    // Diagnostics, Pharmacy, Billing
    { code: 'lab:read', module: 'lab', action: 'read', description: 'View pathology orders and results' },
    { code: 'lab:write', module: 'lab', action: 'write', description: 'Order lab tests and record results' },
    { code: 'radiology:read', module: 'radiology', action: 'read', description: 'View imaging orders and reports' },
    { code: 'radiology:write', module: 'radiology', action: 'write', description: 'Report radiology studies' },
    { code: 'pharmacy:dispense', module: 'pharmacy', action: 'dispense', description: 'Dispense medications' },
    { code: 'pharmacy:inventory', module: 'pharmacy', action: 'inventory', description: 'Manage pharmacy stocks' },
    { code: 'billing:read', module: 'billing', action: 'read', description: 'View patient invoices and receipts' },
    { code: 'billing:write', module: 'billing', action: 'write', description: 'Generate bills and collect payments' },

    // Governance & Reporting
    { code: 'reports:view', module: 'reports', action: 'view', description: 'Generate operational reports' },
    { code: 'analytics:view', module: 'analytics', action: 'view', description: 'Access executive dashboards' },
    { code: 'integrations:manage', module: 'integrations', action: 'manage', description: 'Manage ABDM and external interfaces' },
  ];

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { description: perm.description },
      create: perm,
    });
  }
  console.log(`[Seed] Seeded ${permissionsData.length} baseline permissions.`);

  // 3. System Roles
  const rolesData = [
    { code: 'SUPER_ADMIN', name: 'Super Administrator', description: 'Full system root access', isSystem: true },
    { code: 'HOSPITAL_ADMIN', name: 'Hospital Administrator', description: 'Operational administration', isSystem: true },
    { code: 'CLINICIAN', name: 'Doctor / Clinician', description: 'OPD, IPD, and clinical workflows', isSystem: true },
    { code: 'NURSE', name: 'Nursing Officer', description: 'Vitals, medication administration, nursing care', isSystem: true },
    { code: 'PHARMACIST', name: 'Pharmacist', description: 'Prescription dispensing and formulary', isSystem: true },
    { code: 'LAB_TECHNICIAN', name: 'Pathology Lab Technician', description: 'Sample collection and results entry', isSystem: true },
    { code: 'RADIOLOGIST', name: 'Radiologist / Radiographer', description: 'Imaging orders and PACS viewing', isSystem: true },
    { code: 'BILLING_EXECUTIVE', name: 'Billing Executive', description: 'Cash counters, invoicing, TPA/PMJAY desk', isSystem: true },
    { code: 'RECEPTIONIST', name: 'Registration Desk', description: 'Patient registration and appointments', isSystem: true },
    { code: 'AUDITOR', name: 'Compliance Auditor', description: 'Read-only audit trail and compliance reports', isSystem: true },
  ];

  for (const role of rolesData) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: { name: role.name, description: role.description },
      create: role,
    });
  }
  console.log(`[Seed] Seeded ${rolesData.length} system roles.`);

  // 4. Default Super Admin User
  const adminPassword = await bcrypt.hash('Admin@Chikitsaalye2024!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@chikitsaalye.upums.ac.in' },
    update: {},
    create: {
      organizationId: org.id,
      username: 'admin',
      email: 'admin@chikitsaalye.upums.ac.in',
      fullName: 'System Administrator',
      passwordHash: adminPassword,
      status: UserStatus.ACTIVE,
      department: 'ADMINISTRATION',
      designation: 'Lead Health Systems Administrator',
    },
  });

  const superAdminRole = await prisma.role.findUnique({ where: { code: 'SUPER_ADMIN' } });
  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: superAdminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    });
  }

  // 5. Baseline Audit Event
  await prisma.auditEvent.create({
    data: {
      actorId: adminUser.id,
      actorType: AuditActorType.SYSTEM,
      action: 'SYSTEM_BOOTSTRAP',
      resource: 'HospitalOrganization',
      resourceId: org.id,
      requestId: 'boot_001',
      metadata: { notes: 'Chikitsaalye enterprise repository initialized with UPUMS baseline schema' },
    },
  });

  console.log('[Seed] Database initialization complete.');
}

main()
  .catch((e) => {
    console.error('[Seed] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
