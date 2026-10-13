import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { authService } from '../src/modules/auth/auth.service.js';
import { auditService } from '../src/services/audit.service.js';
import { SYSTEM_ROLES } from '@chikitsaalye/types';

describe('CODEx-005: Patient Registration + Patient 360 Operational Workflow', () => {
  const app = createApp();

  // Test Tokens for Roles
  const superAdminToken = authService.createTestToken(SYSTEM_ROLES.SUPER_ADMIN);
  const regDeskToken = authService.createTestToken(SYSTEM_ROLES.REGISTRATION_DESK);
  const doctorToken = authService.createTestToken(SYSTEM_ROLES.DOCTOR);
  const pharmacistToken = authService.createTestToken(SYSTEM_ROLES.PHARMACIST);
  const billingToken = authService.createTestToken(SYSTEM_ROLES.BILLING_OPERATOR);

  let registeredPatientId: string;
  let canonicalUhid: string;

  const testPatientData = {
    firstName: 'Devendra',
    middleName: 'Prasad',
    lastName: 'Yadav',
    gender: 'MALE',
    dateOfBirth: '1975-08-12T00:00:00.000Z',
    isEstimatedDob: false,
    bloodGroup: 'O_POSITIVE',
    maritalStatus: 'MARRIED',
    nationality: 'Indian',
    religion: 'Hindu',
    occupation: 'Teacher',
    identifiers: [
      {
        type: 'ABHA_NUMBER',
        value: '91-9988-7766-5544',
        issuingAuthority: 'ABDM',
        isPrimary: true,
      },
      {
        type: 'NATIONAL_ID',
        value: 'AADHAAR-9900-1122-3344',
        issuingAuthority: 'UIDAI',
        isPrimary: false,
      },
    ],
    contacts: [
      {
        type: 'PHONE',
        value: '+91-9876000001',
        isPrimary: true,
      },
      {
        type: 'EMAIL',
        value: 'devendra.yadav@example.in',
        isPrimary: false,
      },
    ],
    addresses: [
      {
        type: 'CURRENT',
        addressLine1: 'Gram Panchayat Road, Post Saifai',
        city: 'Saifai',
        district: 'Etawah',
        state: 'Uttar Pradesh',
        postalCode: '206130',
        country: 'India',
        isPrimary: true,
      },
    ],
    emergencyContacts: [
      {
        name: 'Sarita Yadav',
        relationship: 'Spouse',
        phone: '+91-9876000002',
        isPrimary: true,
      },
    ],
    allergies: [
      {
        allergen: 'Ciprofloxacin',
        allergenType: 'DRUG',
        severity: 'SEVERE',
        reaction: 'Anaphylactoid facial angioedema',
        status: 'ACTIVE',
      },
    ],
    conditions: [
      {
        conditionCode: 'E11.9',
        conditionName: 'Type 2 Diabetes Mellitus',
        clinicalStatus: 'ACTIVE',
        verificationStatus: 'CONFIRMED',
      },
    ],
    consents: [
      {
        consentType: 'GENERAL_TREATMENT',
        status: 'GRANTED',
      },
    ],
  };

  // --------------------------------------------------------------------------
  // 1. End-to-End Registration Workflow & Canonical UHID Generation
  // --------------------------------------------------------------------------
  describe('1. End-to-End Patient Registration & UHID Generation', () => {
    it('Step 1: Check duplicates before registration returns no matches for brand-new patient', async () => {
      const res = await request(app)
        .post('/api/v1/patients/check-duplicates')
        .set('Authorization', `Bearer ${regDeskToken}`)
        .send({
          firstName: 'Devendra',
          lastName: 'Yadav',
          phone: '+91-9876000001',
          dateOfBirth: '1975-08-12',
          identifierValue: '91-9988-7766-5544',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hasDuplicates).toBe(false);
      expect(res.body.data.candidates).toHaveLength(0);
    });

    it('Step 2: POST /api/v1/patients creates canonical patient record with institutional UHID format', async () => {
      const res = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${regDeskToken}`)
        .send(testPatientData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('uhid');

      registeredPatientId = res.body.data.id;
      canonicalUhid = res.body.data.uhid;

      // Validate UPUMS canonical UHID pattern (e.g. UPUMS-2026-001001)
      const currentYear = new Date().getFullYear();
      const uhidRegex = new RegExp(`^UPUMS-${currentYear}-\\d{6}$`);
      expect(canonicalUhid).toMatch(uhidRegex);

      expect(res.body.data.fullName).toBe('Devendra Prasad Yadav');
      expect(res.body.data.gender).toBe('MALE');
      expect(res.body.data.bloodGroup).toBe('O_POSITIVE');
      expect(res.body.data.primaryPhone).toBe('+91-9876000001');
      expect(res.body.data.emergencyContacts).toHaveLength(1);
      expect(res.body.data.emergencyContacts[0].name).toBe('Sarita Yadav');
    });

    it('Step 3: Verifies server logged PATIENT_REGISTERED and PATIENT_IDENTIFIER_ADDED audit events', async () => {
      const auditLogs = await auditService.queryEvents({ resourceId: registeredPatientId });
      const regEvent = auditLogs.find((l) => l.action === 'PATIENT_REGISTERED');
      expect(regEvent).toBeDefined();
      expect(regEvent?.metadata).toHaveProperty('uhid', canonicalUhid);

      const allLogs = await auditService.queryEvents();
      const abhaEvent = allLogs.find(
        (l) =>
          l.action === 'PATIENT_IDENTIFIER_ADDED' &&
          l.metadata?.uhid === canonicalUhid &&
          l.metadata?.type === 'ABHA_NUMBER'
      );
      expect(abhaEvent).toBeDefined();
      expect(abhaEvent?.metadata).toHaveProperty('value', '91-9988-7766-5544');
    });
  });

  // --------------------------------------------------------------------------
  // 2. Existing Patient Search
  // --------------------------------------------------------------------------
  describe('2. Existing Patient Search Directory', () => {
    it('Searches patient directory by exact UHID', async () => {
      const res = await request(app)
        .get(`/api/v1/patients?uhid=${canonicalUhid}`)
        .set('Authorization', `Bearer ${regDeskToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].uhid).toBe(canonicalUhid);
      expect(res.body.data[0].fullName).toBe('Devendra Prasad Yadav');
    });

    it('Searches patient directory by Name', async () => {
      const res = await request(app)
        .get('/api/v1/patients?name=Devendra')
        .set('Authorization', `Bearer ${regDeskToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.some((p: any) => p.uhid === canonicalUhid)).toBe(true);
    });

    it('Searches patient directory by Phone number', async () => {
      const res = await request(app)
        .get('/api/v1/patients?phone=9876000001')
        .set('Authorization', `Bearer ${regDeskToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.some((p: any) => p.uhid === canonicalUhid)).toBe(true);
    });

    it('Searches patient directory by External Identifier (ABHA)', async () => {
      const res = await request(app)
        .get('/api/v1/patients?identifier=9988-7766-5544')
        .set('Authorization', `Bearer ${regDeskToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.some((p: any) => p.uhid === canonicalUhid)).toBe(true);
    });

    it('Verifies PATIENT_SEARCHED audit event was logged', async () => {
      const logs = await auditService.queryEvents();
      const searchLogs = logs.filter((l) => l.action === 'PATIENT_SEARCHED');
      expect(searchLogs.length).toBeGreaterThan(0);
      expect(searchLogs[0].metadata).toHaveProperty('criteria');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Proactive Duplicate Detection & Signal Matching
  // --------------------------------------------------------------------------
  describe('3. Proactive Duplicate Prevention & Scoring', () => {
    it('Detects duplicate with DEFINITIVE (100%) confidence on matching ABHA identifier', async () => {
      const res = await request(app)
        .post('/api/v1/patients/check-duplicates')
        .set('Authorization', `Bearer ${regDeskToken}`)
        .send({
          firstName: 'Another',
          lastName: 'Person',
          phone: '+91-9999999999',
          identifierValue: '91-9988-7766-5544',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hasDuplicates).toBe(true);
      expect(res.body.data.count).toBeGreaterThanOrEqual(1);

      const candidate = res.body.data.candidates[0];
      expect(candidate.patient.uhid).toBe(canonicalUhid);
      expect(candidate.confidenceLevel).toBe('DEFINITIVE');
      expect(candidate.confidenceScore).toBe(100);
      expect(candidate.matchedSignals).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'identifier' })])
      );
    });

    it('Detects duplicate with VERY_HIGH confidence on matching phone + DOB', async () => {
      const res = await request(app)
        .post('/api/v1/patients/check-duplicates')
        .set('Authorization', `Bearer ${regDeskToken}`)
        .send({
          firstName: 'Dev',
          lastName: 'Yadav',
          phone: '+91-9876000001',
          dateOfBirth: '1975-08-12',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.hasDuplicates).toBe(true);

      const candidate = res.body.data.candidates.find((c: any) => c.patient.uhid === canonicalUhid);
      expect(candidate).toBeDefined();
      expect(candidate.confidenceScore).toBeGreaterThanOrEqual(90);
      expect(candidate.confidenceLevel).toBe('VERY_HIGH');
    });

    it('Detects duplicate on matching phone alone with MEDIUM confidence', async () => {
      const res = await request(app)
        .post('/api/v1/patients/check-duplicates')
        .set('Authorization', `Bearer ${regDeskToken}`)
        .send({
          firstName: 'Completely',
          lastName: 'Different',
          phone: '+91-9876000001',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.hasDuplicates).toBe(true);

      const candidate = res.body.data.candidates.find((c: any) => c.patient.uhid === canonicalUhid);
      expect(candidate).toBeDefined();
      expect(candidate.confidenceLevel).toBe('MEDIUM');
      expect(candidate.confidenceScore).toBe(50);
    });

    it('Verifies DUPLICATE_DETECTED audit event was logged', async () => {
      const logs = await auditService.queryEvents();
      const dupLogs = logs.filter((l) => l.action === 'DUPLICATE_DETECTED');
      expect(dupLogs.length).toBeGreaterThan(0);
      expect(dupLogs[0].metadata).toHaveProperty('topMatchUhid', canonicalUhid);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Patient 360 Cockpit View
  // --------------------------------------------------------------------------
  describe('4. Patient 360 Longitudinal Record', () => {
    it('GET /api/v1/patients/:id/360 returns comprehensive cockpit with clinical alerts & encounters summary', async () => {
      const res = await request(app)
        .get(`/api/v1/patients/${registeredPatientId}/360`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const p360 = res.body.data;
      expect(p360.patient.uhid).toBe(canonicalUhid);
      expect(p360.patient.fullName).toBe('Devendra Prasad Yadav');

      // Clinical Alerts
      expect(p360.clinicalAlerts.allergiesCount).toBe(1);
      expect(p360.clinicalAlerts.hasHighRiskAllergy).toBe(true); // Ciprofloxacin severe
      expect(p360.clinicalAlerts.activeAllergies[0].allergen).toBe('Ciprofloxacin');
      expect(p360.clinicalAlerts.chronicConditionsCount).toBe(1);
      expect(p360.clinicalAlerts.activeConditions[0].conditionName).toBe('Type 2 Diabetes Mellitus');

      // Encounters Summary
      expect(p360.encountersSummary.totalEncounters).toBe(0);
      expect(p360.encountersSummary.openEncountersCount).toBe(0);

      // Embedded Timeline
      expect(p360).toHaveProperty('timeline');
      expect(Array.isArray(p360.timeline)).toBe(true);
      expect(p360.timeline.length).toBeGreaterThanOrEqual(1);
    });

    it('Verifies PATIENT_VIEWED audit event was logged on 360 inquiry', async () => {
      const logs = await auditService.queryEvents({ resourceId: registeredPatientId });
      const viewEvent = logs.find((l) => l.action === 'PATIENT_VIEWED');
      expect(viewEvent).toBeDefined();
      expect(viewEvent?.metadata).toHaveProperty('uhid', canonicalUhid);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Longitudinal Timeline Endpoint & Ordering
  // --------------------------------------------------------------------------
  describe('5. Longitudinal Patient Timeline Generation & Ordering', () => {
    it('GET /api/v1/patients/:id/timeline returns chronological events including registration, identifiers, and allergies', async () => {
      const res = await request(app)
        .get(`/api/v1/patients/${registeredPatientId}/timeline`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      const timeline = res.body.data;
      expect(timeline.length).toBeGreaterThanOrEqual(2);

      // Verify event structure
      const regEvent = timeline.find((e: any) => e.type === 'REGISTRATION');
      expect(regEvent).toBeDefined();
      expect(regEvent.title).toContain('Canonical Patient Master Created');
      expect(regEvent.category).toBe('ADMINISTRATIVE');
      expect(regEvent.status).toBe('COMPLETED');
      expect(regEvent.timestamp).toBeDefined();

      const allergyEvent = timeline.find((e: any) => e.title.includes('Ciprofloxacin'));
      expect(allergyEvent).toBeDefined();
      expect(allergyEvent.category).toBe('CLINICAL');

      // Verify strict descending chronological order (newest first)
      for (let i = 0; i < timeline.length - 1; i++) {
        const curr = new Date(timeline[i].timestamp).getTime();
        const next = new Date(timeline[i + 1].timestamp).getTime();
        expect(curr).toBeGreaterThanOrEqual(next);
      }
    });

    it('Adds an encounter and verifies encounter appears in patient timeline', async () => {
      // Create encounter for patient
      const encRes = await request(app)
        .post('/api/v1/encounters')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          patientId: registeredPatientId,
          type: 'OPD',
          priority: 'ROUTINE',
          department: 'GENERAL_MEDICINE',
          reasonForVisit: 'Routine diabetic follow-up consultation',
        });

      expect(encRes.status).toBe(201);
      const enc = encRes.body.data;

      // Check updated timeline
      const timelineRes = await request(app)
        .get(`/api/v1/patients/${registeredPatientId}/timeline`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(timelineRes.status).toBe(200);
      const encounterEvent = timelineRes.body.data.find((e: any) => e.type === 'ENCOUNTER');
      expect(encounterEvent).toBeDefined();
      expect(encounterEvent.title).toContain('OPD Encounter Started');
      expect(encounterEvent.category).toBe('CLINICAL');
      expect(encounterEvent.metadata.encounterNumber).toBe(enc.encounterNumber);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Demographic Updates & Emergency Contact Audit
  // --------------------------------------------------------------------------
  describe('6. Demographic Updates & Emergency Contact Auditing', () => {
    it('PATCH /api/v1/patients/:id updates marital status, address, and emergency contact', async () => {
      const res = await request(app)
        .patch(`/api/v1/patients/${registeredPatientId}`)
        .set('Authorization', `Bearer ${regDeskToken}`)
        .send({
          maritalStatus: 'DIVORCED',
          contacts: [
            { type: 'PHONE', value: '+91-9876009999', isPrimary: true },
          ],
          emergencyContacts: [
            {
              name: 'Amitabh Yadav',
              relationship: 'Brother',
              phone: '+91-9876008888',
              isPrimary: true,
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.maritalStatus).toBe('DIVORCED');
      expect(res.body.data.primaryPhone).toBe('+91-9876009999');
      expect(res.body.data.emergencyContacts[0].name).toBe('Amitabh Yadav');
      expect(res.body.data.emergencyContacts[0].relationship).toBe('Brother');
    });

    it('Verifies PATIENT_UPDATED and EMERGENCY_CONTACT_UPDATED audit events', async () => {
      const logs = await auditService.queryEvents({ resourceId: registeredPatientId });
      const updateEvent = logs.find((l) => l.action === 'PATIENT_UPDATED');
      expect(updateEvent).toBeDefined();

      const emergencyEvent = logs.find((l) => l.action === 'EMERGENCY_CONTACT_UPDATED');
      expect(emergencyEvent).toBeDefined();
      expect(emergencyEvent?.metadata).toHaveProperty('emergencyContactsCount', 1);
    });
  });

  // --------------------------------------------------------------------------
  // 7. Security, Authorization & Role Boundaries
  // --------------------------------------------------------------------------
  describe('7. Security & Role-Based Authorization Enforcement', () => {
    it('Unauthenticated POST /api/v1/patients returns 401 Unauthorized', async () => {
      const res = await request(app).post('/api/v1/patients').send(testPatientData);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('Role without PATIENT.CREATE (PHARMACIST) is forbidden from registering patients (403)', async () => {
      const res = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${pharmacistToken}`)
        .send(testPatientData);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Role without PATIENT.UPDATE (BILLING_OPERATOR) is forbidden from updating demographics (403)', async () => {
      const res = await request(app)
        .patch(`/api/v1/patients/${registeredPatientId}`)
        .set('Authorization', `Bearer ${billingToken}`)
        .send({ maritalStatus: 'MARRIED' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Patient user is forbidden from viewing another patient 360 record (403)', async () => {
      const otherPatientToken = authService.createTestToken(SYSTEM_ROLES.PATIENT, {
        patientId: 'different_patient_id',
        username: 'patient.different',
      });

      const res = await request(app)
        .get(`/api/v1/patients/${registeredPatientId}/360`)
        .set('Authorization', `Bearer ${otherPatientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Patient user is permitted to view their own patient 360 record', async () => {
      const ownPatientToken = authService.createTestToken(SYSTEM_ROLES.PATIENT, {
        patientId: registeredPatientId,
        username: 'patient.devendra',
      });

      const res = await request(app)
        .get(`/api/v1/patients/${registeredPatientId}/360`)
        .set('Authorization', `Bearer ${ownPatientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.patient.id).toBe(registeredPatientId);
    });
  });
});
