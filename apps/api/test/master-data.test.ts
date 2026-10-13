import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { authService } from '../src/modules/auth/auth.service.js';
import { SYSTEM_ROLES } from '@chikitsaalye/types';

describe('CODEx-004: Master Data Management Test Matrix', () => {
  const app = createApp();

  const superAdminToken = authService.createTestToken(SYSTEM_ROLES.SUPER_ADMIN);
  const adminToken = authService.createTestToken(SYSTEM_ROLES.HOSPITAL_ADMIN);
  const doctorToken = authService.createTestToken(SYSTEM_ROLES.DOCTOR);
  const nurseToken = authService.createTestToken(SYSTEM_ROLES.NURSE);
  const regDeskToken = authService.createTestToken(SYSTEM_ROLES.REGISTRATION_DESK);
  const billingToken = authService.createTestToken(SYSTEM_ROLES.BILLING_OPERATOR);
  const patientToken = authService.createTestToken(SYSTEM_ROLES.PATIENT);

  // --------------------------------------------------------------------------
  // 1. Central Catalog Summary & Metrics
  // --------------------------------------------------------------------------
  describe('1. Central Catalog Overview & Summary', () => {
    it('GET /api/v1/master-data/summary returns UPUMS hospital metadata and active counts', async () => {
      const res = await request(app)
        .get('/api/v1/master-data/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hospital.code).toBe('UPUMS_SAIFAI');
      expect(res.body.data.counts.departments).toBeGreaterThanOrEqual(10);
      expect(res.body.counts?.beds ?? res.body.data.counts.beds).toBeGreaterThan(0);
      expect(res.body.data.counts.medicines).toBeGreaterThan(0);
      expect(res.body.data.counts.tariffs).toBeGreaterThan(0);
      expect(res.body.data.counts.schemes).toBeGreaterThanOrEqual(3);
    });

    it('GET /api/v1/admin/master-data/summary resolves identically via admin route alias', async () => {
      const res = await request(app)
        .get('/api/v1/admin/master-data/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hospital.name).toContain('UPUMS');
    });
  });

  // --------------------------------------------------------------------------
  // 2. Department & Subdepartment Lifecycle
  // --------------------------------------------------------------------------
  describe('2. Department & Subdepartment Lifecycle', () => {
    it('GET /api/v1/master-data/departments lists departments with clinical and diagnostic filters', async () => {
      const res = await request(app)
        .get('/api/v1/master-data/departments?type=CLINICAL')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data.every((d: any) => d.type === 'CLINICAL')).toBe(true);
    });

    it('POST /api/v1/master-data/departments creates new department with 201', async () => {
      const res = await request(app)
        .post('/api/v1/master-data/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'PULMONOLOGY',
          name: 'Department of Pulmonary & Chest Medicine',
          type: 'CLINICAL',
          description: 'Specialized respiratory and broncho-alveolar care',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.code).toBe('PULMONOLOGY');
      expect(res.body.data.isActive).toBe(true);
    });

    it('POST /api/v1/master-data/departments rejects duplicate department code with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/v1/master-data/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'GEN_MED',
          name: 'Duplicate General Medicine',
          type: 'CLINICAL',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('PATCH /api/v1/master-data/departments/:id updates department details', async () => {
      const res = await request(app)
        .patch('/api/v1/master-data/departments/dept-cardio')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Updated tertiary cardiac center and cath lab',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.description).toBe('Updated tertiary cardiac center and cath lab');
    });

    it('DELETE /api/v1/master-data/departments/:id soft-deactivates department', async () => {
      const res = await request(app)
        .delete('/api/v1/master-data/departments/PULMONOLOGY')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(false);
    });

    it('POST /api/v1/master-data/subdepartments creates subdepartment linked to department', async () => {
      const res = await request(app)
        .post('/api/v1/master-data/subdepartments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          departmentId: 'dept-gen-surg',
          code: 'LAPAROSCOPIC_SURG',
          name: 'Minimal Access & Laparoscopic Surgery Unit',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.departmentId).toBe('dept-gen-surg');
      expect(res.body.data.code).toBe('LAPAROSCOPIC_SURG');
    });

    it('POST /api/v1/master-data/subdepartments rejects invalid foreign key departmentId', async () => {
      const res = await request(app)
        .post('/api/v1/master-data/subdepartments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          departmentId: 'non-existent-dept-id',
          code: 'INVALID_SUB',
          name: 'Invalid Subdepartment',
        });

      expect(res.status).toBe(404);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Staff & Doctor Profiles
  // --------------------------------------------------------------------------
  describe('3. Staff & Doctor Profiles Master Data', () => {
    it('GET /api/v1/master-data/doctors returns active doctors with registration and fee', async () => {
      const res = await request(app)
        .get('/api/v1/master-data/doctors')
        .set('Authorization', `Bearer ${regDeskToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      const drSharma = res.body.data.find((d: any) => d.medicalCouncilRegistrationNumber === 'UP-MCI-48921');
      expect(drSharma).toBeDefined();
      expect(drSharma.specialization).toBe('Internal Medicine');
      expect(drSharma.consultationFee).toBe(100);
    });

    it('POST /api/v1/master-data/staff creates staff profile linked to User and Department', async () => {
      const res = await request(app)
        .post('/api/v1/master-data/staff')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: 'usr-new-doctor-99',
          staffCode: 'DOC-CARD-002',
          departmentId: 'dept-cardio',
          professionalRole: 'DOCTOR',
          designation: 'Assistant Professor Cardiology',
          email: 'cardio.faculty@upums.ac.in',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.staffCode).toBe('DOC-CARD-002');
    });

    it('POST /api/v1/master-data/doctors creates clinical doctor profile linked to staff profile', async () => {
      const staffRes = await request(app)
        .get('/api/v1/master-data/staff/DOC-CARD-002')
        .set('Authorization', `Bearer ${adminToken}`);

      const staffId = staffRes.body.data.id;

      const res = await request(app)
        .post('/api/v1/master-data/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          staffProfileId: staffId,
          departmentId: 'dept-cardio',
          medicalCouncilRegistrationNumber: 'UP-MCI-99881',
          specialization: 'Interventional Cardiology',
          qualifications: 'MBBS, MD (Medicine), DM (Cardiology)',
          opdRoomNumber: 'OPD-CARD-201',
          consultationFee: 200,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.medicalCouncilRegistrationNumber).toBe('UP-MCI-99881');
      expect(res.body.data.consultationFee).toBe(200);
    });

    it('POST /api/v1/master-data/doctors rejects duplicate medical council registration', async () => {
      const res = await request(app)
        .post('/api/v1/master-data/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          staffProfileId: 'staff-dr-sharma',
          departmentId: 'dept-gen-med',
          medicalCouncilRegistrationNumber: 'UP-MCI-48921',
          specialization: 'Internal Medicine',
          qualifications: 'MBBS, MD',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });
  });

  // --------------------------------------------------------------------------
  // 4. Wards, Rooms & Beds with Status Transitions
  // --------------------------------------------------------------------------
  describe('4. Wards, Rooms & Bed Status Transitions', () => {
    it('GET /api/v1/master-data/wards lists wards with wardType and gender constraints', async () => {
      const res = await request(app)
        .get('/api/v1/master-data/wards')
        .set('Authorization', `Bearer ${nurseToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);
      const icuWard = res.body.data.find((w: any) => w.wardType === 'ICU');
      expect(icuWard).toBeDefined();
    });

    it('POST /api/v1/master-data/rooms creates room inside ward', async () => {
      const res = await request(app)
        .post('/api/v1/master-data/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          wardId: 'ward-ticu-01',
          code: 'RM_TICU_ISOLATION_01',
          name: 'Trauma ICU Negative-Pressure Isolation Room 1',
          roomType: 'ISOLATION',
          maxOccupancy: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.roomType).toBe('ISOLATION');
    });

    it('POST /api/v1/master-data/beds creates bed linked to ward and room', async () => {
      const res = await request(app)
        .post('/api/v1/master-data/beds')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          wardId: 'ward-ticu-01',
          roomId: 'RM_TICU_ISOLATION_01',
          code: 'BED_TICU_ISO_01',
          name: 'Isolation ICU Bed 01',
          bedType: 'ICU_VENTILATOR',
          status: 'AVAILABLE',
          dailyRate: 3500,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('AVAILABLE');
      expect(res.body.data.dailyRate).toBe(3500);
    });

    it('PATCH /api/v1/master-data/beds/:id/status updates bed lifecycle: AVAILABLE -> OCCUPIED -> CLEANING -> AVAILABLE', async () => {
      // 1. Admit patient -> OCCUPIED
      const res1 = await request(app)
        .patch('/api/v1/master-data/beds/BED_TICU_ISO_01/status')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          status: 'OCCUPIED',
          reason: 'Patient admission from Trauma Emergency',
        });

      expect(res1.status).toBe(200);
      expect(res1.body.data.status).toBe('OCCUPIED');

      // 2. Discharge patient -> CLEANING
      const res2 = await request(app)
        .patch('/api/v1/master-data/beds/BED_TICU_ISO_01/status')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          status: 'CLEANING',
          reason: 'Patient discharged, housekeeping terminal cleaning dispatched',
        });

      expect(res2.status).toBe(200);
      expect(res2.body.data.status).toBe('CLEANING');

      // 3. Sanitized -> AVAILABLE
      const res3 = await request(app)
        .patch('/api/v1/master-data/beds/BED_TICU_ISO_01/status')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          status: 'AVAILABLE',
          reason: 'Sanitization complete and inspected',
        });

      expect(res3.status).toBe(200);
      expect(res3.body.data.status).toBe('AVAILABLE');
    });

    it('PATCH /api/v1/master-data/beds/:id/status rejects invalid bed status with 400', async () => {
      const res = await request(app)
        .patch('/api/v1/master-data/beds/BED_TICU_ISO_01/status')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          status: 'INVALID_STATUS_CODE',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // --------------------------------------------------------------------------
  // 5. Investigations & Medicines Master Data
  // --------------------------------------------------------------------------
  describe('5. Investigations & Medicines Master Data', () => {
    it('GET /api/v1/master-data/investigations lists pathology and radiology masters', async () => {
      const res = await request(app)
        .get('/api/v1/master-data/investigations')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(8);
      const cbc = res.body.data.find((i: any) => i.code === 'INV_CBC');
      expect(cbc.turnaroundHours).toBe(4);
      expect(cbc.sampleType).toBe('BLOOD');
    });

    it('GET /api/v1/master-data/medicines supports narcotic filter and generic search', async () => {
      const res = await request(app)
        .get('/api/v1/master-data/medicines?isNarcotic=true')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data.every((m: any) => m.isNarcotic === true)).toBe(true);
    });

    it('POST /api/v1/master-data/medicines registers new medicine with dosage form and unit', async () => {
      const res = await request(app)
        .post('/api/v1/master-data/medicines')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'MED_ATOR_20',
          genericName: 'Atorvastatin Calcium',
          brandName: 'Atorva 20',
          dosageForm: 'TABLET',
          strength: '20',
          unit: 'MG',
          therapeuticCategory: 'Lipid-Lowering / Statin',
          isHighAlert: false,
          isNarcotic: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.code).toBe('MED_ATOR_20');
      expect(res.body.data.dosageForm).toBe('TABLET');
    });
  });

  // --------------------------------------------------------------------------
  // 6. Centralized Tariffs & Schemes
  // --------------------------------------------------------------------------
  describe('6. Centralized Tariffs & Scheme Pricing', () => {
    it('GET /api/v1/master-data/tariffs lists standard and government scheme rates', async () => {
      const res = await request(app)
        .get('/api/v1/master-data/tariffs')
        .set('Authorization', `Bearer ${billingToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      const pmjayCbc = res.body.data.find((t: any) => t.code === 'TRF_PMJAY_CBC');
      expect(pmjayCbc).toBeDefined();
      expect(pmjayCbc.standardPrice).toBe(250);
      expect(pmjayCbc.schemePrice).toBe(120);
    });

    it('POST /api/v1/master-data/tariffs creates new tariff entry linked to service/investigation', async () => {
      const res = await request(app)
        .post('/api/v1/master-data/tariffs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'TRF_STD_URINE',
          name: 'Standard Rate: Urine Routine',
          investigationId: 'inv-urine-re',
          rateType: 'STANDARD',
          standardPrice: 150,
          schemePrice: 150,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.code).toBe('TRF_STD_URINE');
    });

    it('PATCH /api/v1/master-data/tariffs/:id updates tariff rates and records audit', async () => {
      const res = await request(app)
        .patch('/api/v1/master-data/tariffs/TRF_STD_URINE')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          standardPrice: 180,
          schemePrice: 180,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.standardPrice).toBe(180);
    });

    it('POST /api/v1/master-data/tariffs rejects orphan tariff without service, investigation, or procedure', async () => {
      const res = await request(app)
        .post('/api/v1/master-data/tariffs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'TRF_ORPHAN',
          name: 'Orphan Tariff Without Link',
          rateType: 'STANDARD',
          standardPrice: 500,
        });

      expect(res.status).toBe(400);
    });

    it('GET /api/v1/master-data/schemes lists PMJAY, MMJAY and ECHS government schemes', async () => {
      const res = await request(app)
        .get('/api/v1/master-data/schemes')
        .set('Authorization', `Bearer ${billingToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      const pmjay = res.body.data.find((s: any) => s.code === 'SCH_PMJAY');
      expect(pmjay.nodalAgency).toBe('National Health Authority (NHA)');
      expect(pmjay.coverageCap).toBe(500000);
    });
  });

  // --------------------------------------------------------------------------
  // 7. Security & Server-Side Authorization Matrix
  // --------------------------------------------------------------------------
  describe('7. Server-Side Authorization & Negative Security', () => {
    it('Unauthenticated requests to /api/v1/master-data/summary return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/master-data/summary');
      expect(res.status).toBe(401);
    });

    it('Registration Desk has MASTER_DATA.READ but cannot create departments (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/v1/master-data/departments')
        .set('Authorization', `Bearer ${regDeskToken}`)
        .send({
          code: 'UNAUTH_DEPT',
          name: 'Unauthorized Department Creation',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('Doctor has MASTER_DATA.READ and can read departments', async () => {
      const res = await request(app)
        .get('/api/v1/master-data/departments')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
    });

    it('Billing operator cannot modify bed status (403 Forbidden)', async () => {
      const res = await request(app)
        .patch('/api/v1/master-data/beds/bed-emr-01/status')
        .set('Authorization', `Bearer ${billingToken}`)
        .send({
          status: 'CLEANING',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('Nurse CAN modify bed status (200 OK)', async () => {
      const res = await request(app)
        .patch('/api/v1/master-data/beds/bed-emr-01/status')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          status: 'CLEANING',
          reason: 'Housekeeping requested bed turnover',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CLEANING');
    });

    it('Doctor cannot create or modify tariffs (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/v1/master-data/tariffs')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          code: 'TRF_DOC_UNAUTH',
          name: 'Doctor tariff edit',
          rateType: 'STANDARD',
          standardPrice: 100,
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('Patient role cannot read or modify master data (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/master-data/departments')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(403);
    });
  });
});
