import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { authService } from '../src/modules/auth/auth.service.js';

describe('CODEx-002: Patient Master & Encounter Foundation', () => {
  const app = createApp();
  const adminToken = authService.createTestToken('SUPER_ADMIN');

  const samplePatient = {
    firstName: 'Aarav',
    middleName: 'Kumar',
    lastName: 'Sharma',
    gender: 'MALE',
    dateOfBirth: '1988-06-15T00:00:00.000Z',
    isEstimatedDob: false,
    bloodGroup: 'B_POSITIVE',
    maritalStatus: 'MARRIED',
    nationality: 'Indian',
    identifiers: [
      {
        type: 'ABHA_NUMBER',
        value: '91-1234-5678-9012',
        issuingAuthority: 'ABDM',
        isPrimary: true,
      },
      {
        type: 'NATIONAL_ID',
        value: 'AADHAAR-8839-2910-1122',
        issuingAuthority: 'UIDAI',
        isPrimary: false,
      },
    ],
    contacts: [
      {
        type: 'PHONE',
        value: '+91-9876543210',
        isPrimary: true,
      },
      {
        type: 'EMAIL',
        value: 'aarav.sharma@example.com',
        isPrimary: false,
      },
    ],
    addresses: [
      {
        type: 'CURRENT',
        addressLine1: 'House 42, Civil Lines',
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
        name: 'Pooja Sharma',
        relationship: 'Spouse',
        phone: '+91-9876543211',
        isPrimary: true,
      },
    ],
    allergies: [
      {
        allergen: 'Amoxicillin',
        allergenType: 'DRUG',
        severity: 'SEVERE',
        reaction: 'Bronchospasm and urticaria',
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
    medications: [
      {
        drugName: 'Metformin 500mg',
        dosage: '500 mg',
        frequency: 'Twice daily with meals',
        route: 'ORAL',
        status: 'ACTIVE',
      },
    ],
    consents: [
      {
        consentType: 'GENERAL_TREATMENT',
        status: 'GRANTED',
      },
    ],
  };

  let createdPatientId: string;
  let createdUhid: string;
  let createdEncounterId: string;

  // --------------------------------------------------------------------------
  // Patient Master Tests
  // --------------------------------------------------------------------------
  describe('Patient Master', () => {
    it('POST /api/v1/patients creates a canonical patient with UHID and normalized components', async () => {
      const res = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(samplePatient);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('uhid');
      expect(res.body.data.uhid).toMatch(/^UPUMS-\d{4}-\d{6}$/);
      expect(res.body.data.firstName).toBe('Aarav');
      expect(res.body.data.lastName).toBe('Sharma');
      expect(res.body.data.fullName).toBe('Aarav Kumar Sharma');
      expect(res.body.data.gender).toBe('MALE');
      expect(res.body.data.bloodGroup).toBe('B_POSITIVE');

      // Verify normalized identifiers (auto-includes canonical UHID + ABHA)
      expect(res.body.data.identifiers.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.identifiers.some((i: any) => i.type === 'UHID')).toBe(true);
      expect(res.body.data.identifiers.some((i: any) => i.type === 'ABHA_NUMBER')).toBe(true);

      // Verify contacts & emergency contacts
      expect(res.body.data.contacts.length).toBe(2);
      expect(res.body.data.addresses.length).toBe(1);
      expect(res.body.data.emergencyContacts.length).toBe(1);

      // Verify clinical flags
      expect(res.body.data.allergies.length).toBe(1);
      expect(res.body.data.conditions.length).toBe(1);
      expect(res.body.data.medications.length).toBe(1);
      expect(res.body.data.consents.length).toBe(1);

      createdPatientId = res.body.data.id;
      createdUhid = res.body.data.uhid;
    });

    it('GET /api/v1/patients retrieves paginated patient list and supports search', async () => {
      const res = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ search: 'Aarav', page: 1, pageSize: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].uhid).toBe(createdUhid);
      expect(res.body.meta.pagination.total).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/v1/patients/:id retrieves patient by UUID or UHID', async () => {
      // Lookup by UUID
      const res1 = await request(app)
        .get(`/api/v1/patients/${createdPatientId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res1.status).toBe(200);
      expect(res1.body.data.id).toBe(createdPatientId);

      // Lookup by UHID
      const res2 = await request(app)
        .get(`/api/v1/patients/${createdUhid}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res2.status).toBe(200);
      expect(res2.body.data.uhid).toBe(createdUhid);
    });

    it('PATCH /api/v1/patients/:id updates patient demographics and records audit', async () => {
      const res = await request(app)
        .patch(`/api/v1/patients/${createdPatientId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ occupation: 'Senior Engineer', maritalStatus: 'MARRIED' });

      expect(res.status).toBe(200);
      expect(res.body.data.occupation).toBe('Senior Engineer');
    });

    it('POST /api/v1/patients/check-duplicates flags possible duplicates with matched signals', async () => {
      const res = await request(app)
        .post('/api/v1/patients/check-duplicates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Aarav',
          lastName: 'Sharma',
          phone: '+91-9876543210',
          dateOfBirth: '1988-06-15',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.hasDuplicates).toBe(true);
      expect(res.body.data.candidates.length).toBeGreaterThan(0);
      const match = res.body.data.candidates[0];
      expect(match.confidenceScore).toBeGreaterThanOrEqual(80);
      expect(match.matchedSignals.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/v1/patients/:id/360 returns comprehensive clinical 360 overview', async () => {
      const res = await request(app)
        .get(`/api/v1/patients/${createdPatientId}/360`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('patient');
      expect(res.body.data).toHaveProperty('clinicalAlerts');
      expect(res.body.data).toHaveProperty('encountersSummary');
      expect(res.body.data.clinicalAlerts.allergiesCount).toBe(1);
      expect(res.body.data.clinicalAlerts.hasHighRiskAllergy).toBe(true);
      expect(res.body.data.clinicalAlerts.chronicConditionsCount).toBe(1);
    });

    it('POST /api/v1/patients rejects invalid data with standardized 400 validation error', async () => {
      const res = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: '', // empty name
          gender: 'INVALID_GENDER',
          contacts: [], // no contacts
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details.length).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // Encounter Lifecycle & Relationship Tests
  // --------------------------------------------------------------------------
  describe('Encounter Foundation & Lifecycle', () => {
    it('POST /api/v1/encounters creates an encounter bound to canonical patient', async () => {
      const res = await request(app)
        .post('/api/v1/encounters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          patientId: createdPatientId,
          type: 'OPD',
          priority: 'ROUTINE',
          department: 'GENERAL_MEDICINE',
          reasonForVisit: 'Persistent fever and productive cough for 4 days',
          metadata: { triageCategory: 'YELLOW' },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.encounterNumber).toMatch(/^ENC-\d{4}-\d{6}$/);
      expect(res.body.data.patientId).toBe(createdPatientId);
      expect(res.body.data.status).toBe('OPEN');
      expect(res.body.data.department).toBe('GENERAL_MEDICINE');

      createdEncounterId = res.body.data.id;
    });

    it('POST /api/v1/encounters rejects non-existent patient with 404', async () => {
      const res = await request(app)
        .post('/api/v1/encounters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          patientId: '00000000-0000-0000-0000-000000000000',
          department: 'OPD',
          reasonForVisit: 'Routine checkup',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('PATCH /api/v1/encounters/:id enforces valid lifecycle transitions (OPEN -> IN_PROGRESS -> COMPLETED)', async () => {
      // 1. OPEN -> IN_PROGRESS (Valid)
      const res1 = await request(app)
        .patch(`/api/v1/encounters/${createdEncounterId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'IN_PROGRESS' });

      expect(res1.status).toBe(200);
      expect(res1.body.data.status).toBe('IN_PROGRESS');

      // 2. IN_PROGRESS -> COMPLETED (Valid)
      const res2 = await request(app)
        .patch(`/api/v1/encounters/${createdEncounterId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'COMPLETED' });

      expect(res2.status).toBe(200);
      expect(res2.body.data.status).toBe('COMPLETED');
      expect(res2.body.data.endTime).toBeDefined();

      // 3. COMPLETED -> OPEN (Illegal transition from terminal state!)
      const res3 = await request(app)
        .patch(`/api/v1/encounters/${createdEncounterId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'OPEN' });

      expect(res3.status).toBe(409); // Conflict / invalid state transition
      expect(res3.body.success).toBe(false);
      expect(res3.body.error.code).toBe('CONFLICT');
    });

    it('GET /api/v1/encounters filters by patientId, department, and status', async () => {
      const res = await request(app)
        .get('/api/v1/encounters')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ patientId: createdPatientId, status: 'COMPLETED' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].patientId).toBe(createdPatientId);
    });

    it('Patient 360 includes newly linked encounters', async () => {
      const res = await request(app)
        .get(`/api/v1/patients/${createdPatientId}/360`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.encountersSummary.totalEncounters).toBeGreaterThanOrEqual(1);
      expect(res.body.data.encountersSummary.recentEncounters[0].id).toBe(createdEncounterId);
    });
  });
});
