import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { authService } from '../src/modules/auth/auth.service.js';
import { SYSTEM_ROLES } from '@chikitsaalye/types';

describe('CODEx-003: Production-Grade Authentication & RBAC Test Matrix', () => {
  const app = createApp();

  // Role tokens for testing matrix
  const superAdminToken = authService.createTestToken(SYSTEM_ROLES.SUPER_ADMIN);
  const doctorToken = authService.createTestToken(SYSTEM_ROLES.DOCTOR);
  const nurseToken = authService.createTestToken(SYSTEM_ROLES.NURSE);
  const regDeskToken = authService.createTestToken(SYSTEM_ROLES.REGISTRATION_DESK);
  const billingToken = authService.createTestToken(SYSTEM_ROLES.BILLING_OPERATOR);
  const patientRameshToken = authService.createTestToken(SYSTEM_ROLES.PATIENT, {
    patientId: 'patient_ramesh_id',
    username: 'patient.ramesh',
  });
  const patientPriyaToken = authService.createTestToken(SYSTEM_ROLES.PATIENT, {
    patientId: 'patient_priya_id',
    username: 'patient.priya',
  });

  // --------------------------------------------------------------------------
  // 1. Authentication Tests
  // --------------------------------------------------------------------------
  describe('1. Authentication Foundation', () => {
    it('POST /api/v1/auth/login authenticates valid user with username and issues tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          usernameOrEmail: 'dr.sharma',
          password: 'Hospital@123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user.username).toBe('dr.sharma');
      expect(res.body.data.user.roles).toContain(SYSTEM_ROLES.DOCTOR);
      expect(res.body.data).toHaveProperty('tokens');
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
      expect(res.body.data.tokens.tokenType).toBe('Bearer');
    });

    it('POST /api/v1/auth/login authenticates valid user with email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          usernameOrEmail: 'reception@chikitsaalye.org',
          password: 'Hospital@123',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.username).toBe('reg.desk');
    });

    it('POST /api/v1/auth/login rejects invalid password with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          usernameOrEmail: 'dr.sharma',
          password: 'WrongPassword@999',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('POST /api/v1/auth/login rejects non-existent user with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          usernameOrEmail: 'ghost.user',
          password: 'Hospital@123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('POST /api/v1/auth/login rejects suspended user account with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          usernameOrEmail: 'suspended.user',
          password: 'Hospital@123',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toMatch(/suspended/i);
    });

    it('POST /api/v1/auth/login rejects disabled user account with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          usernameOrEmail: 'disabled.user',
          password: 'Hospital@123',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toMatch(/disabled/i);
    });

    it('POST /api/v1/auth/logout terminates session and revokes access token', async () => {
      // 1. Log in to get fresh session and token
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          usernameOrEmail: 'dr.sharma',
          password: 'Hospital@123',
        });

      const token = loginRes.body.data.tokens.accessToken;

      // 2. Call GET /me with fresh token (success)
      const meResBefore = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(meResBefore.status).toBe(200);

      // 3. Log out
      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);
      expect(logoutRes.status).toBe(200);

      // 4. Call GET /me again with revoked token (should reject with 401)
      const meResAfter = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(meResAfter.status).toBe(401);
      expect(meResAfter.body.error.code).toBe('UNAUTHORIZED');
    });

    it('POST /api/v1/auth/refresh provides new tokens for valid refresh token', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          usernameOrEmail: 'nurse.anita',
          password: 'Hospital@123',
        });

      const refreshToken = loginRes.body.data.tokens.refreshToken;

      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.data).toHaveProperty('accessToken');
      expect(refreshRes.body.data).toHaveProperty('refreshToken');
    });
  });

  // --------------------------------------------------------------------------
  // 2. Role-Based Access Control (RBAC) & Authorization Tests
  // --------------------------------------------------------------------------
  describe('2. Role-Based Access Control (RBAC)', () => {
    let testPatientId: string;

    beforeEach(async () => {
      // Create a test patient with Registration Desk token
      const res = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${regDeskToken}`)
        .send({
          firstName: 'Suresh',
          lastName: 'Yadav',
          gender: 'MALE',
          dateOfBirth: '1985-02-14T00:00:00.000Z',
          contacts: [{ type: 'PHONE', value: '+91-9876500001', isPrimary: true }],
        });
      testPatientId = res.body.data.id;
    });

    it('Registration Desk: can create patients and read patients, but CANNOT update role permissions', async () => {
      // 1. Can read patients
      const readRes = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${regDeskToken}`);
      expect(readRes.status).toBe(200);

      // 2. Cannot manage roles (forbidden)
      const roleRes = await request(app)
        .put('/api/v1/roles/DOCTOR/permissions')
        .set('Authorization', `Bearer ${regDeskToken}`)
        .send({ permissions: ['*'] });
      expect(roleRes.status).toBe(403);
      expect(roleRes.body.error.code).toBe('FORBIDDEN');
    });

    it('Doctor: can read patients, create encounters, and update encounters', async () => {
      // 1. Doctor reads patient
      const readRes = await request(app)
        .get(`/api/v1/patients/${testPatientId}`)
        .set('Authorization', `Bearer ${doctorToken}`);
      expect(readRes.status).toBe(200);

      // 2. Doctor creates clinical encounter
      const encRes = await request(app)
        .post('/api/v1/encounters')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          patientId: testPatientId,
          type: 'OPD',
          department: 'GENERAL_MEDICINE',
          reasonForVisit: 'Hypertension evaluation',
        });
      expect(encRes.status).toBe(201);
      const encId = encRes.body.data.id;

      // 3. Doctor updates encounter to IN_PROGRESS
      const updateRes = await request(app)
        .patch(`/api/v1/encounters/${encId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ status: 'IN_PROGRESS' });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.status).toBe('IN_PROGRESS');
    });

    it('Nurse: can read patient and update encounters, but CANNOT create patients', async () => {
      // 1. Nurse reads patient
      const readRes = await request(app)
        .get(`/api/v1/patients/${testPatientId}`)
        .set('Authorization', `Bearer ${nurseToken}`);
      expect(readRes.status).toBe(200);

      // 2. Nurse attempts to create patient (Insufficient permission: PATIENT.CREATE)
      const createRes = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          firstName: 'Illegal',
          lastName: 'Patient',
          gender: 'FEMALE',
          dateOfBirth: '1990-01-01T00:00:00.000Z',
          contacts: [{ type: 'PHONE', value: '+91-9876500002', isPrimary: true }],
        });
      expect(createRes.status).toBe(403);
      expect(createRes.body.error.code).toBe('FORBIDDEN');
    });

    it('Billing Operator: can read patients and encounters, but CANNOT create encounters', async () => {
      // 1. Billing reads encounters
      const readRes = await request(app)
        .get('/api/v1/encounters')
        .set('Authorization', `Bearer ${billingToken}`);
      expect(readRes.status).toBe(200);

      // 2. Billing attempts to create encounter (Forbidden)
      const encRes = await request(app)
        .post('/api/v1/encounters')
        .set('Authorization', `Bearer ${billingToken}`)
        .send({
          patientId: testPatientId,
          type: 'OPD',
          department: 'BILLING',
        });
      expect(encRes.status).toBe(403);
      expect(encRes.body.error.code).toBe('FORBIDDEN');
    });

    it('Super Admin: possesses full administrative and operational authorization', async () => {
      // List all users
      const usersRes = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(usersRes.status).toBe(200);
      expect(usersRes.body.data.length).toBeGreaterThan(0);

      // List system roles
      const rolesRes = await request(app)
        .get('/api/v1/roles')
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(rolesRes.status).toBe(200);
      expect(rolesRes.body.data.length).toBeGreaterThan(0);

      // Query audit trail
      const auditRes = await request(app)
        .get('/api/v1/admin/audit')
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(auditRes.status).toBe(200);
      expect(Array.isArray(auditRes.body.data)).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Patient Ownership Authorization & Context Protection
  // --------------------------------------------------------------------------
  describe('3. Patient Ownership Authorization', () => {
    let rameshRecordId: string;
    let priyaRecordId: string;

    beforeEach(async () => {
      // Register Ramesh's canonical patient record
      const rameshRes = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          firstName: 'Ramesh',
          lastName: 'Verma',
          gender: 'MALE',
          dateOfBirth: '1978-08-15T00:00:00.000Z',
          contacts: [{ type: 'PHONE', value: '+91-9876543210', isPrimary: true }],
        });
      rameshRecordId = rameshRes.body.data.id;

      // Register Priya's canonical patient record
      const priyaRes = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          firstName: 'Priya',
          lastName: 'Singh',
          gender: 'FEMALE',
          dateOfBirth: '1992-11-20T00:00:00.000Z',
          contacts: [{ type: 'PHONE', value: '+91-9876543299', isPrimary: true }],
        });
      priyaRecordId = priyaRes.body.data.id;
    });

    it('Patient Ramesh CAN access his own patient record and 360 cockpit', async () => {
      // Token linked to Ramesh's record
      const ownToken = authService.createTestToken(SYSTEM_ROLES.PATIENT, {
        patientId: rameshRecordId,
        username: 'patient.ramesh',
      });

      const res = await request(app)
        .get(`/api/v1/patients/${rameshRecordId}`)
        .set('Authorization', `Bearer ${ownToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(rameshRecordId);
      expect(res.body.data.firstName).toBe('Ramesh');

      const res360 = await request(app)
        .get(`/api/v1/patients/${rameshRecordId}/360`)
        .set('Authorization', `Bearer ${ownToken}`);

      expect(res360.status).toBe(200);
      expect(res360.body.data.patient.id).toBe(rameshRecordId);
    });

    it('Patient Ramesh is FORBIDDEN from accessing Priya record (Context/Ownership Protection)', async () => {
      const rameshToken = authService.createTestToken(SYSTEM_ROLES.PATIENT, {
        patientId: rameshRecordId,
        username: 'patient.ramesh',
      });

      // Ramesh attempts to access Priya's patient record
      const res = await request(app)
        .get(`/api/v1/patients/${priyaRecordId}`)
        .set('Authorization', `Bearer ${rameshToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toMatch(/patients are only permitted to access their own/i);

      // Ramesh attempts to access Priya's 360 overview
      const res360 = await request(app)
        .get(`/api/v1/patients/${priyaRecordId}/360`)
        .set('Authorization', `Bearer ${rameshToken}`);

      expect(res360.status).toBe(403);
      expect(res360.body.error.code).toBe('FORBIDDEN');
    });

    it('Patient calling list patients only receives their own record', async () => {
      const rameshToken = authService.createTestToken(SYSTEM_ROLES.PATIENT, {
        patientId: rameshRecordId,
        username: 'patient.ramesh',
      });

      const res = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${rameshToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].id).toBe(rameshRecordId);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Negative Cases & Security Enforcements
  // --------------------------------------------------------------------------
  describe('4. Negative Security Cases', () => {
    it('Unauthenticated requests to protected endpoints return 401 Unauthorized', async () => {
      const endpoints = [
        { method: 'get', url: '/api/v1/patients' },
        { method: 'post', url: '/api/v1/patients' },
        { method: 'get', url: '/api/v1/encounters' },
        { method: 'post', url: '/api/v1/encounters' },
        { method: 'get', url: '/api/v1/users' },
        { method: 'get', url: '/api/v1/roles' },
        { method: 'get', url: '/api/v1/admin/audit' },
      ];

      for (const ep of endpoints) {
        const res = await (request(app) as any)[ep.method](ep.url);
        expect(res.status).toBe(401);
        expect(res.body.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('Suspended user with existing bearer token is rejected with 403 Forbidden', async () => {
      // Create token for suspended user
      const suspendedToken = authService.createTestToken(SYSTEM_ROLES.DOCTOR, {
        id: 'usr_suspended_doc',
        status: 'SUSPENDED',
      });

      const res = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${suspendedToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toMatch(/suspended/i);
    });

    it('Disabled user with existing bearer token is rejected with 403 Forbidden', async () => {
      const disabledToken = authService.createTestToken(SYSTEM_ROLES.REGISTRATION_DESK, {
        id: 'usr_disabled_staff',
        status: 'DISABLED',
      });

      const res = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${disabledToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toMatch(/disabled/i);
    });

    it('Admin can dynamically change user status to SUSPENDED, which terminates active access', async () => {
      // 1. Create a new active doctor user
      const createRes = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          username: 'dr.temporary',
          email: 'temporary@chikitsaalye.org',
          password: 'Password@123',
          fullName: 'Dr. Temporary Staff',
          roles: [SYSTEM_ROLES.DOCTOR],
        });

      expect(createRes.status).toBe(201);
      const tempUserId = createRes.body.data.id;

      // 2. Doctor logs in and obtains token
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ usernameOrEmail: 'dr.temporary', password: 'Password@123' });
      const docToken = loginRes.body.data.tokens.accessToken;

      // 3. Doctor accesses protected patient directory
      const accessBefore = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${docToken}`);
      expect(accessBefore.status).toBe(200);

      // 4. Admin suspends this user
      const suspendRes = await request(app)
        .patch(`/api/v1/users/${tempUserId}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'SUSPENDED', reason: 'Disciplinary review pending' });
      expect(suspendRes.status).toBe(200);
      expect(suspendRes.body.data.status).toBe('SUSPENDED');

      // 5. Doctor attempts to use previous token -> Rejected with 403 Forbidden
      const accessAfter = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${docToken}`);
      expect([401, 403]).toContain(accessAfter.status);
      expect(['UNAUTHORIZED', 'FORBIDDEN']).toContain(accessAfter.body.error.code);
    });
  });
});
