import crypto from 'crypto';
import {
  generateAuthTokens,
  verifyAccessToken,
  verifyRefreshToken,
  hashPassword,
  hashPasswordSync,
  verifyPassword,
  getPermissionsForRoles,
  ROLE_PERMISSIONS_MAP,
  SYSTEM_ROLES,
  SYSTEM_PERMISSIONS,
} from '@chikitsaalye/auth';
import type {
  User,
  Role,
  Permission,
  Session,
  UserStatus,
  AuthTokens,
  LoginResult,
} from '@chikitsaalye/types';
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from '../../middleware/errors.js';
import { auditService } from '../../services/audit.service.js';
import { prisma, checkDatabaseConnection } from '@chikitsaalye/database';

export interface StoredUser {
  id: string;
  organizationId: string;
  username: string;
  email: string;
  fullName: string;
  passwordHash: string;
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
  roles: string[]; // Role codes
}

export interface StoredRole {
  id: string;
  code: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class AuthService {
  private usersMap = new Map<string, StoredUser>();
  private sessionsMap = new Map<string, Session>();
  private rolesMap = new Map<string, StoredRole>();
  private blacklistedTokens = new Set<string>();
  private initialized = false;

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    if (this.initialized) return;
    this.initialized = true;

    // Seed Roles
    Object.entries(ROLE_PERMISSIONS_MAP).forEach(([roleCode, perms]) => {
      this.rolesMap.set(roleCode, {
        id: `role_${roleCode.toLowerCase()}`,
        code: roleCode,
        name: roleCode.replace(/_/g, ' '),
        description: `Standard system role for ${roleCode}`,
        isSystem: true,
        permissions: [...perms],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      });
    });

    // Default password hash for seeded accounts: "Hospital@123"
    const defaultPasswordHash = hashPasswordSync('Hospital@123');

    const defaultUsers: StoredUser[] = [
      {
        id: 'usr_super_admin',
        organizationId: 'UPUMS-MAIN',
        username: 'superadmin',
        email: 'superadmin@chikitsaalye.org',
        fullName: 'Super Administrator',
        passwordHash: defaultPasswordHash,
        status: 'ACTIVE',
        department: 'Administration',
        designation: 'System Administrator',
        roles: [SYSTEM_ROLES.SUPER_ADMIN],
        failedLoginAttempts: 0,
        mfaEnabled: false,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
      {
        id: 'usr_hospital_admin',
        organizationId: 'UPUMS-MAIN',
        username: 'hospitaladmin',
        email: 'admin@chikitsaalye.org',
        fullName: 'Hospital Administrator',
        passwordHash: defaultPasswordHash,
        status: 'ACTIVE',
        department: 'Governance & Operations',
        designation: 'Medical Superintendent',
        roles: [SYSTEM_ROLES.HOSPITAL_ADMIN],
        failedLoginAttempts: 0,
        mfaEnabled: false,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
      {
        id: 'usr_doctor_sharma',
        organizationId: 'UPUMS-MAIN',
        username: 'dr.sharma',
        email: 'dr.sharma@chikitsaalye.org',
        fullName: 'Dr. S. K. Sharma',
        passwordHash: defaultPasswordHash,
        status: 'ACTIVE',
        department: 'General Medicine',
        designation: 'Senior Consultant & HOD',
        roles: [SYSTEM_ROLES.DOCTOR],
        failedLoginAttempts: 0,
        mfaEnabled: false,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
      {
        id: 'usr_nurse_anita',
        organizationId: 'UPUMS-MAIN',
        username: 'nurse.anita',
        email: 'nurse.anita@chikitsaalye.org',
        fullName: 'Sister Anita Verma',
        passwordHash: defaultPasswordHash,
        status: 'ACTIVE',
        department: 'Emergency & Triage',
        designation: 'Senior Nursing Officer',
        roles: [SYSTEM_ROLES.NURSE],
        failedLoginAttempts: 0,
        mfaEnabled: false,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
      {
        id: 'usr_reg_desk',
        organizationId: 'UPUMS-MAIN',
        username: 'reg.desk',
        email: 'reception@chikitsaalye.org',
        fullName: 'Vikas Kumar',
        passwordHash: defaultPasswordHash,
        status: 'ACTIVE',
        department: 'Central Registration Desk',
        designation: 'Registration Officer',
        roles: [SYSTEM_ROLES.REGISTRATION_DESK],
        failedLoginAttempts: 0,
        mfaEnabled: false,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
      {
        id: 'usr_billing_op',
        organizationId: 'UPUMS-MAIN',
        username: 'billing.user',
        email: 'billing@chikitsaalye.org',
        fullName: 'Rajesh Gupta',
        passwordHash: defaultPasswordHash,
        status: 'ACTIVE',
        department: 'Central Cashier & Billing',
        designation: 'Billing Executive',
        roles: [SYSTEM_ROLES.BILLING_OPERATOR],
        failedLoginAttempts: 0,
        mfaEnabled: false,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
      {
        id: 'usr_patient_ramesh',
        organizationId: 'UPUMS-MAIN',
        username: 'patient.ramesh',
        email: 'ramesh.verma@example.com',
        fullName: 'Ramesh Verma',
        passwordHash: defaultPasswordHash,
        status: 'ACTIVE',
        patientId: 'patient_ramesh_id',
        roles: [SYSTEM_ROLES.PATIENT],
        failedLoginAttempts: 0,
        mfaEnabled: false,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
      {
        id: 'usr_patient_priya',
        organizationId: 'UPUMS-MAIN',
        username: 'patient.priya',
        email: 'priya.singh@example.com',
        fullName: 'Priya Singh',
        passwordHash: defaultPasswordHash,
        status: 'ACTIVE',
        patientId: 'patient_priya_id',
        roles: [SYSTEM_ROLES.PATIENT],
        failedLoginAttempts: 0,
        mfaEnabled: false,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
      {
        id: 'usr_suspended_doc',
        organizationId: 'UPUMS-MAIN',
        username: 'suspended.user',
        email: 'suspended@chikitsaalye.org',
        fullName: 'Suspended Clinician',
        passwordHash: defaultPasswordHash,
        status: 'SUSPENDED',
        department: 'Surgery',
        designation: 'Consultant',
        roles: [SYSTEM_ROLES.DOCTOR],
        failedLoginAttempts: 0,
        mfaEnabled: false,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
      {
        id: 'usr_disabled_staff',
        organizationId: 'UPUMS-MAIN',
        username: 'disabled.user',
        email: 'disabled@chikitsaalye.org',
        fullName: 'Disabled Staff Member',
        passwordHash: defaultPasswordHash,
        status: 'DISABLED',
        department: 'Housekeeping',
        designation: 'Assistant',
        roles: [SYSTEM_ROLES.REGISTRATION_DESK],
        failedLoginAttempts: 0,
        mfaEnabled: false,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
    ];

    defaultUsers.forEach((u) => this.usersMap.set(u.id, u));
  }

  /**
   * Primary Authenticate / Login Operation
   */
  async login(
    usernameOrEmail: string,
    plainPassword: string,
    context: { ipAddress?: string; userAgent?: string; requestId?: string } = {}
  ): Promise<LoginResult> {
    const identifier = usernameOrEmail.trim().toLowerCase();

    // Find user by username or email
    let user: StoredUser | undefined;
    for (const u of this.usersMap.values()) {
      if (u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier) {
        user = u;
        break;
      }
    }

    if (!user) {
      await auditService.logEvent({
        actor: { id: 'anonymous', type: 'SYSTEM', ipAddress: context.ipAddress, userAgent: context.userAgent },
        action: 'LOGIN_FAILURE',
        resource: 'auth',
        requestId: context.requestId || 'req_unknown',
        metadata: { reason: 'User not found', identifier },
      });
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check account status
    if (user.status === 'SUSPENDED') {
      await auditService.logEvent({
        actor: { id: user.id, type: 'USER', ipAddress: context.ipAddress, userAgent: context.userAgent },
        action: 'LOGIN_FAILURE',
        resource: 'auth',
        requestId: context.requestId || 'req_unknown',
        metadata: { reason: 'Account suspended' },
      });
      throw new ForbiddenError('Account is suspended. Please contact hospital administration.');
    }

    if (user.status === 'DISABLED' || user.status === 'INACTIVE') {
      await auditService.logEvent({
        actor: { id: user.id, type: 'USER', ipAddress: context.ipAddress, userAgent: context.userAgent },
        action: 'LOGIN_FAILURE',
        resource: 'auth',
        requestId: context.requestId || 'req_unknown',
        metadata: { reason: 'Account disabled or inactive' },
      });
      throw new ForbiddenError('Account is disabled. Access denied.');
    }

    // Check lockout protection
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const waitMinutes = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
      await auditService.logEvent({
        actor: { id: user.id, type: 'USER', ipAddress: context.ipAddress, userAgent: context.userAgent },
        action: 'LOGIN_FAILURE',
        resource: 'auth',
        requestId: context.requestId || 'req_unknown',
        metadata: { reason: 'Account locked due to consecutive failed attempts' },
      });
      throw new ForbiddenError(
        `Account temporarily locked due to failed attempts. Please retry in ${waitMinutes} minute(s).`
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(plainPassword, user.passwordHash);
    if (!isPasswordValid) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lockout
      }

      await auditService.logEvent({
        actor: { id: user.id, type: 'USER', ipAddress: context.ipAddress, userAgent: context.userAgent },
        action: 'LOGIN_FAILURE',
        resource: 'auth',
        requestId: context.requestId || 'req_unknown',
        metadata: {
          reason: 'Invalid password',
          failedAttempts: user.failedLoginAttempts,
          locked: Boolean(user.lockoutUntil),
        },
      });
      throw new UnauthorizedError('Invalid credentials');
    }

    // Reset failed attempts on success
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    user.lastLoginAt = new Date();

    // Create session
    const sessionId = `sess_${crypto.randomUUID().replace(/-/g, '')}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session: Session = {
      id: sessionId,
      userId: user.id,
      token: sessionId,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      expiresAt,
      createdAt: new Date(),
    };
    this.sessionsMap.set(sessionId, session);

    // Aggregate permissions
    const permissions = getPermissionsForRoles(user.roles);

    // Generate tokens
    const tokens = generateAuthTokens(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        status: user.status,
        patientId: user.patientId,
        department: user.department,
        organizationId: user.organizationId,
      },
      user.roles,
      permissions,
      sessionId
    );

    // Audit Login Success
    await auditService.logEvent({
      actor: {
        id: user.id,
        type: user.roles.includes(SYSTEM_ROLES.PATIENT) ? 'PATIENT' : 'USER',
        department: user.department || undefined,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      },
      action: 'LOGIN_SUCCESS',
      resource: 'auth',
      requestId: context.requestId || 'req_unknown',
      metadata: {
        sessionId,
        roles: user.roles,
        patientId: user.patientId,
      },
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        roles: user.roles,
        permissions,
        patientId: user.patientId,
        department: user.department,
      },
      tokens,
    };
  }

  /**
   * Session Termination / Logout
   */
  async logout(
    token: string,
    context: { userId?: string; sessionId?: string; ipAddress?: string; userAgent?: string; requestId?: string } = {}
  ): Promise<void> {
    this.blacklistedTokens.add(token);

    if (context.sessionId) {
      this.sessionsMap.delete(context.sessionId);
    }

    if (context.userId) {
      await auditService.logEvent({
        actor: { id: context.userId, type: 'USER', ipAddress: context.ipAddress, userAgent: context.userAgent },
        action: 'LOGOUT',
        resource: 'auth',
        requestId: context.requestId || 'req_unknown',
        metadata: { sessionId: context.sessionId },
      });
    }
  }

  /**
   * Refresh Token
   */
  async refreshToken(
    refreshTokenStr: string,
    context: { ipAddress?: string; userAgent?: string; requestId?: string } = {}
  ): Promise<AuthTokens> {
    try {
      const decoded = verifyRefreshToken(refreshTokenStr);
      const user = this.usersMap.get(decoded.sub);

      if (!user || user.status === 'SUSPENDED' || user.status === 'DISABLED') {
        throw new UnauthorizedError('User account not eligible for token refresh');
      }

      if (decoded.sessionId && !this.sessionsMap.has(decoded.sessionId)) {
        throw new UnauthorizedError('Session has expired or been terminated');
      }

      const permissions = getPermissionsForRoles(user.roles);
      return generateAuthTokens(
        {
          id: user.id,
          email: user.email,
          username: user.username,
          status: user.status,
          patientId: user.patientId,
          department: user.department,
          organizationId: user.organizationId,
        },
        user.roles,
        permissions,
        decoded.sessionId
      );
    } catch (err: any) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Password Change
   */
  async changePassword(
    userId: string,
    currentPass: string,
    newPass: string,
    context: { ipAddress?: string; userAgent?: string; requestId?: string } = {}
  ): Promise<void> {
    const user = this.usersMap.get(userId);
    if (!user) throw new NotFoundError('User not found');

    const isValid = await verifyPassword(currentPass, user.passwordHash);
    if (!isValid) throw new UnauthorizedError('Current password is incorrect');

    user.passwordHash = await hashPassword(newPass);
    user.updatedAt = new Date();

    // Revoke existing sessions to enforce re-login
    for (const [sId, sess] of this.sessionsMap.entries()) {
      if (sess.userId === userId) {
        this.sessionsMap.delete(sId);
      }
    }

    await auditService.logEvent({
      actor: { id: userId, type: 'USER', ipAddress: context.ipAddress, userAgent: context.userAgent },
      action: 'PASSWORD_CHANGE',
      resource: 'users',
      resourceId: userId,
      requestId: context.requestId || 'req_unknown',
      metadata: { reason: 'User-initiated password change' },
    });
  }

  /**
   * Token and Session Validation Helpers
   */
  isTokenRevoked(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  isSessionRevoked(sessionId: string): boolean {
    return !this.sessionsMap.has(sessionId);
  }

  getUserStatus(userId: string): UserStatus | null {
    const user = this.usersMap.get(userId);
    return user ? user.status : null;
  }

  getUser(userId: string): StoredUser | undefined {
    return this.usersMap.get(userId);
  }

  /**
   * User Management (CRUD)
   */
  async listUsers(filter?: { search?: string; status?: string; role?: string }): Promise<StoredUser[]> {
    let result = Array.from(this.usersMap.values());

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.department && u.department.toLowerCase().includes(q))
      );
    }

    if (filter?.status) {
      result = result.filter((u) => u.status === filter.status);
    }

    if (filter?.role) {
      result = result.filter((u) => u.roles.includes(filter.role!));
    }

    return result;
  }

  async createUser(
    input: {
      username: string;
      email: string;
      password: string;
      fullName: string;
      roles: string[];
      department?: string;
      phone?: string;
      designation?: string;
      patientId?: string;
      status?: UserStatus;
    },
    context: { actorId: string; ipAddress?: string; userAgent?: string; requestId?: string }
  ): Promise<StoredUser> {
    const existingUsername = Array.from(this.usersMap.values()).find(
      (u) => u.username.toLowerCase() === input.username.toLowerCase()
    );
    if (existingUsername) {
      throw new ConflictError(`Username '${input.username}' is already in use`);
    }

    const existingEmail = Array.from(this.usersMap.values()).find(
      (u) => u.email.toLowerCase() === input.email.toLowerCase()
    );
    if (existingEmail) {
      throw new ConflictError(`Email '${input.email}' is already registered`);
    }

    const id = `usr_${crypto.randomUUID().replace(/-/g, '')}`;
    const passwordHash = await hashPassword(input.password);

    const newUser: StoredUser = {
      id,
      organizationId: 'UPUMS-MAIN',
      username: input.username,
      email: input.email,
      fullName: input.fullName,
      passwordHash,
      status: input.status || 'ACTIVE',
      department: input.department || null,
      phone: input.phone || null,
      designation: input.designation || null,
      patientId: input.patientId || null,
      failedLoginAttempts: 0,
      mfaEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: input.roles,
    };

    this.usersMap.set(id, newUser);

    await auditService.logEvent({
      actor: { id: context.actorId, type: 'USER', ipAddress: context.ipAddress, userAgent: context.userAgent },
      action: 'USER_CREATED',
      resource: 'users',
      resourceId: id,
      requestId: context.requestId || 'req_unknown',
      metadata: { username: newUser.username, roles: newUser.roles },
    });

    await auditService.logEvent({
      actor: { id: context.actorId, type: 'USER', ipAddress: context.ipAddress, userAgent: context.userAgent },
      action: 'ROLE_ASSIGNED',
      resource: 'users',
      resourceId: id,
      requestId: context.requestId || 'req_unknown',
      metadata: { assignedRoles: newUser.roles },
    });

    return newUser;
  }

  async updateUser(
    id: string,
    input: {
      fullName?: string;
      email?: string;
      department?: string;
      phone?: string;
      designation?: string;
      roles?: string[];
      status?: UserStatus;
      patientId?: string | null;
    },
    context: { actorId: string; ipAddress?: string; userAgent?: string; requestId?: string }
  ): Promise<StoredUser> {
    const user = this.usersMap.get(id);
    if (!user) throw new NotFoundError(`User '${id}' not found`);

    if (input.fullName !== undefined) user.fullName = input.fullName;
    if (input.email !== undefined) user.email = input.email;
    if (input.department !== undefined) user.department = input.department;
    if (input.phone !== undefined) user.phone = input.phone;
    if (input.designation !== undefined) user.designation = input.designation;
    if (input.patientId !== undefined) user.patientId = input.patientId;

    if (input.status !== undefined && input.status !== user.status) {
      await this.updateUserStatus(id, input.status, 'Admin updated status', context);
    }

    if (input.roles !== undefined) {
      const oldRoles = user.roles;
      user.roles = input.roles;
      await auditService.logEvent({
        actor: { id: context.actorId, type: 'USER', ipAddress: context.ipAddress, userAgent: context.userAgent },
        action: 'ROLE_ASSIGNED',
        resource: 'users',
        resourceId: id,
        requestId: context.requestId || 'req_unknown',
        metadata: { oldRoles, newRoles: input.roles },
      });
    }

    user.updatedAt = new Date();

    await auditService.logEvent({
      actor: { id: context.actorId, type: 'USER', ipAddress: context.ipAddress, userAgent: context.userAgent },
      action: 'USER_UPDATED',
      resource: 'users',
      resourceId: id,
      requestId: context.requestId || 'req_unknown',
      metadata: { updatedFields: Object.keys(input) },
    });

    return user;
  }

  async updateUserStatus(
    id: string,
    status: UserStatus,
    reason = '',
    context: { actorId: string; ipAddress?: string; userAgent?: string; requestId?: string }
  ): Promise<StoredUser> {
    const user = this.usersMap.get(id);
    if (!user) throw new NotFoundError(`User '${id}' not found`);

    const prevStatus = user.status;
    user.status = status;
    user.updatedAt = new Date();

    // If disabled or suspended, terminate active sessions
    if (status === 'DISABLED' || status === 'SUSPENDED') {
      for (const [sId, sess] of this.sessionsMap.entries()) {
        if (sess.userId === id) {
          this.sessionsMap.delete(sId);
        }
      }
    }

    const action = status === 'DISABLED' ? 'USER_DISABLED' : 'USER_UPDATED';

    await auditService.logEvent({
      actor: { id: context.actorId, type: 'USER', ipAddress: context.ipAddress, userAgent: context.userAgent },
      action,
      resource: 'users',
      resourceId: id,
      requestId: context.requestId || 'req_unknown',
      metadata: { previousStatus: prevStatus, newStatus: status, reason },
    });

    return user;
  }

  /**
   * Roles & Permissions Management
   */
  async listRoles(): Promise<StoredRole[]> {
    return Array.from(this.rolesMap.values());
  }

  async getRoleByCode(code: string): Promise<StoredRole | undefined> {
    return this.rolesMap.get(code);
  }

  async updateRolePermissions(
    roleCode: string,
    permissions: string[],
    context: { actorId: string; ipAddress?: string; userAgent?: string; requestId?: string }
  ): Promise<StoredRole> {
    const role = this.rolesMap.get(roleCode);
    if (!role) throw new NotFoundError(`Role '${roleCode}' not found`);

    const prevPermissions = role.permissions;
    role.permissions = [...permissions];
    role.updatedAt = new Date();

    await auditService.logEvent({
      actor: { id: context.actorId, type: 'USER', ipAddress: context.ipAddress, userAgent: context.userAgent },
      action: 'PERMISSION_CHANGED',
      resource: 'roles',
      resourceId: roleCode,
      requestId: context.requestId || 'req_unknown',
      metadata: { previousPermissions: prevPermissions, newPermissions: permissions },
    });

    return role;
  }

  listPermissions(): { code: string; module: string; description: string }[] {
    return Object.entries(SYSTEM_PERMISSIONS).map(([key, code]) => {
      const [module, action] = code.split('.');
      return {
        code,
        module: module || 'SYSTEM',
        description: `Allows ${action?.toLowerCase() || 'operation'} on ${module?.toLowerCase() || 'resource'}`,
      };
    });
  }

  /**
   * Helper for tests to create pre-authorized token
   */
  createTestToken(role: string, customPayload: Partial<StoredUser> = {}): string {
    const matchedUser = customPayload.id
      ? this.usersMap.get(customPayload.id)
      : Array.from(this.usersMap.values()).find((u) => u.roles.includes(role));

    const baseUser: StoredUser = matchedUser || {
      id: `test_${role.toLowerCase()}`,
      organizationId: 'UPUMS-MAIN',
      username: `test.${role.toLowerCase()}`,
      email: `test.${role.toLowerCase()}@chikitsaalye.org`,
      fullName: `Test ${role}`,
      passwordHash: '',
      status: 'ACTIVE' as UserStatus,
      roles: [role],
      failedLoginAttempts: 0,
      mfaEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const user: StoredUser = {
      ...baseUser,
      ...customPayload,
      roles: customPayload.roles || baseUser.roles || [role],
    };

    // Keep usersMap updated so getUserStatus checks work during tests
    this.usersMap.set(user.id, user);

    const permissions = getPermissionsForRoles(user.roles);
    const tokens = generateAuthTokens(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        status: user.status,
        patientId: user.patientId,
        department: user.department,
        organizationId: user.organizationId,
      },
      user.roles,
      permissions
    );
    return tokens.accessToken;
  }
}

export const authService = new AuthService();
