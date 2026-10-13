import crypto from 'crypto';
import { prisma, checkDatabaseConnection } from '@chikitsaalye/database';
import type {
  CreatePatientInput,
  UpdatePatientInput,
  PatientSearchQuery,
  CheckDuplicateInput,
} from '@chikitsaalye/validation';
import type {
  PatientSummaryDto,
  PatientDetailDto,
  Patient360Dto,
  DuplicatePatientCandidate,
  DuplicateMatchSignal,
  PaginatedResult,
  AuthContext,
} from '@chikitsaalye/types';
import { NotFoundError, ConflictError, ValidationError } from '../../middleware/errors.js';
import { auditService } from '../../services/audit.service.js';

export interface IPatientsService {
  createPatient(data: CreatePatientInput, auth?: AuthContext): Promise<PatientDetailDto>;
  searchPatients(query: PatientSearchQuery): Promise<PaginatedResult<PatientSummaryDto>>;
  getPatientById(idOrUhid: string, auth?: AuthContext): Promise<PatientDetailDto>;
  updatePatient(id: string, data: UpdatePatientInput, auth?: AuthContext): Promise<PatientDetailDto>;
  checkDuplicates(input: CheckDuplicateInput): Promise<DuplicatePatientCandidate[]>;
  getPatient360(idOrUhid: string, auth?: AuthContext): Promise<Patient360Dto>;
}

export class PatientsService implements IPatientsService {
  // In-memory backing store for testing / offline environments
  private inMemoryPatients = new Map<string, any>();
  private counter = 1000;

  private generateUhid(): string {
    const year = new Date().getFullYear();
    const seq = ++this.counter;
    return `UPUMS-${year}-${String(seq).padStart(6, '0')}`;
  }

  private calculateAge(dob: Date | string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return Math.max(0, age);
  }

  private mapToSummary(p: any): PatientSummaryDto {
    const primaryPhone =
      p.contacts?.find((c: any) => c.type === 'PHONE' && c.isPrimary)?.value ||
      p.contacts?.find((c: any) => c.type === 'PHONE')?.value ||
      p.contacts?.[0]?.value;

    const primaryAddr = p.addresses?.find((a: any) => a.isPrimary) || p.addresses?.[0];
    const addrString = primaryAddr
      ? `${primaryAddr.city}, ${primaryAddr.district}, ${primaryAddr.state}`
      : undefined;

    return {
      id: p.id,
      uhid: p.uhid,
      firstName: p.firstName,
      middleName: p.middleName || undefined,
      lastName: p.lastName,
      fullName: [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' '),
      gender: p.gender,
      dateOfBirth: new Date(p.dateOfBirth).toISOString(),
      ageYears: this.calculateAge(p.dateOfBirth),
      isEstimatedDob: p.isEstimatedDob || false,
      bloodGroup: p.bloodGroup || 'UNKNOWN',
      status: p.status || 'ACTIVE',
      primaryPhone,
      primaryAddress: addrString,
      createdAt: new Date(p.createdAt).toISOString(),
    };
  }

  private mapToDetail(p: any): PatientDetailDto {
    const summary = this.mapToSummary(p);
    return {
      ...summary,
      maritalStatus: p.maritalStatus || undefined,
      nationality: p.nationality || 'Indian',
      religion: p.religion || undefined,
      occupation: p.occupation || undefined,
      photoUrl: p.photoUrl || undefined,
      deceasedAt: p.deceasedAt ? new Date(p.deceasedAt).toISOString() : undefined,
      identifiers: (p.identifiers || []).map((i: any) => ({
        id: i.id,
        type: i.type,
        value: i.value,
        issuingAuthority: i.issuingAuthority || undefined,
        isPrimary: i.isPrimary || false,
      })),
      contacts: (p.contacts || []).map((c: any) => ({
        id: c.id,
        type: c.type,
        value: c.value,
        isPrimary: c.isPrimary || false,
        isVerified: c.isVerified || false,
      })),
      addresses: (p.addresses || []).map((a: any) => ({
        id: a.id,
        type: a.type,
        addressLine1: a.addressLine1,
        addressLine2: a.addressLine2 || undefined,
        city: a.city,
        district: a.district,
        state: a.state,
        postalCode: a.postalCode,
        country: a.country,
        isPrimary: a.isPrimary || false,
      })),
      emergencyContacts: (p.emergencyContacts || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        relationship: e.relationship,
        phone: e.phone,
        alternatePhone: e.alternatePhone || undefined,
        email: e.email || undefined,
        isPrimary: e.isPrimary || false,
      })),
      insurances: (p.insurances || []).map((ins: any) => ({
        id: ins.id,
        policyNumber: ins.policyNumber,
        providerName: ins.providerName,
        policyType: ins.policyType,
        coverageDetails: ins.coverageDetails || undefined,
        validTill: ins.validTill ? new Date(ins.validTill).toISOString() : undefined,
        isActive: ins.isActive ?? true,
      })),
      allergies: (p.allergies || []).map((al: any) => ({
        id: al.id,
        allergen: al.allergen,
        allergenType: al.allergenType,
        severity: al.severity,
        reaction: al.reaction || undefined,
        status: al.status,
        recordedAt: new Date(al.recordedAt || Date.now()).toISOString(),
        recordedById: al.recordedById || undefined,
        notes: al.notes || undefined,
      })),
      conditions: (p.conditions || []).map((cond: any) => ({
        id: cond.id,
        conditionCode: cond.conditionCode || undefined,
        conditionName: cond.conditionName,
        clinicalStatus: cond.clinicalStatus,
        verificationStatus: cond.verificationStatus,
        onsetDate: cond.onsetDate ? new Date(cond.onsetDate).toISOString() : undefined,
        recordedAt: new Date(cond.recordedAt || Date.now()).toISOString(),
        recordedById: cond.recordedById || undefined,
        notes: cond.notes || undefined,
      })),
      medications: (p.medications || []).map((m: any) => ({
        id: m.id,
        drugName: m.drugName,
        dosage: m.dosage || undefined,
        frequency: m.frequency || undefined,
        route: m.route || 'ORAL',
        startDate: m.startDate ? new Date(m.startDate).toISOString() : undefined,
        endDate: m.endDate ? new Date(m.endDate).toISOString() : undefined,
        prescribedBy: m.prescribedBy || undefined,
        status: m.status,
        notes: m.notes || undefined,
      })),
      consents: (p.consents || []).map((c: any) => ({
        id: c.id,
        consentType: c.consentType,
        status: c.status,
        grantedAt: new Date(c.grantedAt || Date.now()).toISOString(),
        validUntil: c.validUntil ? new Date(c.validUntil).toISOString() : undefined,
        documentedBy: c.documentedBy || undefined,
        notes: c.notes || undefined,
      })),
    };
  }

  async createPatient(data: CreatePatientInput, auth?: AuthContext): Promise<PatientDetailDto> {
    const dbStatus = await checkDatabaseConnection();
    const uhid = this.generateUhid();
    const id = crypto.randomUUID();

    // Prepare normalized identifiers (including generated canonical UHID)
    const identifiers = [
      {
        id: crypto.randomUUID(),
        type: 'UHID',
        value: uhid,
        issuingAuthority: 'UPUMS',
        isPrimary: true,
      },
      ...data.identifiers.map((ident) => ({
        id: crypto.randomUUID(),
        type: ident.type,
        value: ident.value,
        issuingAuthority: ident.issuingAuthority,
        isPrimary: ident.isPrimary,
      })),
    ];

    const contacts = data.contacts.map((c) => ({
      id: crypto.randomUUID(),
      type: c.type,
      value: c.value,
      isPrimary: c.isPrimary,
      isVerified: false,
    }));

    const addresses = (data.addresses || []).map((a) => ({
      id: crypto.randomUUID(),
      type: a.type,
      addressLine1: a.addressLine1,
      addressLine2: a.addressLine2,
      city: a.city,
      district: a.district,
      state: a.state,
      postalCode: a.postalCode,
      country: a.country,
      isPrimary: a.isPrimary,
    }));

    const emergencyContacts = (data.emergencyContacts || []).map((e) => ({
      id: crypto.randomUUID(),
      name: e.name,
      relationship: e.relationship,
      phone: e.phone,
      alternatePhone: e.alternatePhone,
      email: e.email,
      isPrimary: e.isPrimary,
    }));

    const insurances = (data.insurances || []).map((ins) => ({
      id: crypto.randomUUID(),
      policyNumber: ins.policyNumber,
      providerName: ins.providerName,
      policyType: ins.policyType,
      coverageDetails: ins.coverageDetails,
      validTill: ins.validTill ? new Date(ins.validTill) : undefined,
      isActive: ins.isActive,
    }));

    const allergies = (data.allergies || []).map((al) => ({
      id: crypto.randomUUID(),
      allergen: al.allergen,
      allergenType: al.allergenType,
      severity: al.severity,
      reaction: al.reaction,
      status: al.status,
      recordedAt: new Date(),
      recordedById: auth?.userId,
      notes: al.notes,
    }));

    const conditions = (data.conditions || []).map((cond) => ({
      id: crypto.randomUUID(),
      conditionCode: cond.conditionCode,
      conditionName: cond.conditionName,
      clinicalStatus: cond.clinicalStatus,
      verificationStatus: cond.verificationStatus,
      onsetDate: cond.onsetDate ? new Date(cond.onsetDate) : undefined,
      recordedAt: new Date(),
      recordedById: auth?.userId,
      notes: cond.notes,
    }));

    const medications = (data.medications || []).map((m) => ({
      id: crypto.randomUUID(),
      drugName: m.drugName,
      dosage: m.dosage,
      frequency: m.frequency,
      route: m.route,
      startDate: m.startDate ? new Date(m.startDate) : undefined,
      endDate: m.endDate ? new Date(m.endDate) : undefined,
      prescribedBy: m.prescribedBy,
      status: m.status,
      notes: m.notes,
    }));

    const consents = (data.consents || []).map((c) => ({
      id: crypto.randomUUID(),
      consentType: c.consentType,
      status: c.status,
      grantedAt: new Date(),
      validUntil: c.validUntil ? new Date(c.validUntil) : undefined,
      documentedBy: auth?.userId,
      notes: c.notes,
    }));

    const record = {
      id,
      organizationId: auth?.organizationId || 'UPUMS-MAIN',
      uhid,
      firstName: data.firstName,
      middleName: data.middleName || null,
      lastName: data.lastName,
      gender: data.gender,
      dateOfBirth: new Date(data.dateOfBirth),
      isEstimatedDob: data.isEstimatedDob,
      bloodGroup: data.bloodGroup,
      maritalStatus: data.maritalStatus || null,
      nationality: data.nationality || 'Indian',
      religion: data.religion || null,
      occupation: data.occupation || null,
      photoUrl: null,
      status: 'ACTIVE',
      deceasedAt: null,
      mergedIntoPatientId: null,
      createdById: auth?.userId || null,
      updatedById: auth?.userId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      identifiers,
      contacts,
      addresses,
      emergencyContacts,
      insurances,
      allergies,
      conditions,
      medications,
      consents,
      encounters: [],
    };

    if (dbStatus.ok) {
      try {
        await prisma.patient.create({
          data: {
            id: record.id,
            organizationId: record.organizationId,
            uhid: record.uhid,
            firstName: record.firstName,
            middleName: record.middleName,
            lastName: record.lastName,
            gender: record.gender as any,
            dateOfBirth: record.dateOfBirth,
            isEstimatedDob: record.isEstimatedDob,
            bloodGroup: record.bloodGroup as any,
            maritalStatus: record.maritalStatus as any,
            nationality: record.nationality,
            religion: record.religion,
            occupation: record.occupation,
            status: 'ACTIVE',
            createdById: record.createdById,
            identifiers: {
              create: identifiers.map((i) => ({
                id: i.id,
                type: i.type as any,
                value: i.value,
                issuingAuthority: i.issuingAuthority,
                isPrimary: i.isPrimary,
              })),
            },
            contacts: {
              create: contacts.map((c) => ({
                id: c.id,
                type: c.type as any,
                value: c.value,
                isPrimary: c.isPrimary,
              })),
            },
            addresses: {
              create: addresses.map((a) => ({
                id: a.id,
                type: a.type as any,
                addressLine1: a.addressLine1,
                addressLine2: a.addressLine2,
                city: a.city,
                district: a.district,
                state: a.state,
                postalCode: a.postalCode,
                country: a.country,
                isPrimary: a.isPrimary,
              })),
            },
            emergencyContacts: {
              create: emergencyContacts.map((e) => ({
                id: e.id,
                name: e.name,
                relationship: e.relationship,
                phone: e.phone,
                alternatePhone: e.alternatePhone,
                email: e.email,
                isPrimary: e.isPrimary,
              })),
            },
            insurances: {
              create: insurances.map((ins) => ({
                id: ins.id,
                policyNumber: ins.policyNumber,
                providerName: ins.providerName,
                policyType: ins.policyType as any,
                validTill: ins.validTill,
                isActive: ins.isActive,
              })),
            },
            allergies: {
              create: allergies.map((al) => ({
                id: al.id,
                allergen: al.allergen,
                allergenType: al.allergenType as any,
                severity: al.severity as any,
                reaction: al.reaction,
                status: al.status as any,
                recordedById: al.recordedById,
                notes: al.notes,
              })),
            },
            conditions: {
              create: conditions.map((cond) => ({
                id: cond.id,
                conditionCode: cond.conditionCode,
                conditionName: cond.conditionName,
                clinicalStatus: cond.clinicalStatus as any,
                verificationStatus: cond.verificationStatus as any,
                onsetDate: cond.onsetDate,
                recordedById: cond.recordedById,
                notes: cond.notes,
              })),
            },
            medications: {
              create: medications.map((m) => ({
                id: m.id,
                drugName: m.drugName,
                dosage: m.dosage,
                frequency: m.frequency,
                route: m.route,
                startDate: m.startDate,
                endDate: m.endDate,
                prescribedBy: m.prescribedBy,
                status: m.status as any,
                notes: m.notes,
              })),
            },
            consents: {
              create: consents.map((c) => ({
                id: c.id,
                consentType: c.consentType as any,
                status: c.status as any,
                validUntil: c.validUntil,
                documentedBy: c.documentedBy,
                notes: c.notes,
              })),
            },
          },
        });
      } catch (err: any) {
        console.error('[PatientsService] Prisma create error, falling back to in-memory store:', err.message);
      }
    }

    // Always keep in-memory store synchronized
    this.inMemoryPatients.set(record.id, record);
    this.inMemoryPatients.set(record.uhid, record);

    // Audit Event
    await auditService.logEvent({
      actor: {
        id: auth?.userId || 'system',
        type: auth ? 'USER' : 'SYSTEM',
        department: auth?.department || 'REGISTRATION',
      },
      action: 'PATIENT_CREATED',
      resource: 'Patient',
      resourceId: record.id,
      requestId: auth?.requestId || `req_${Date.now()}`,
      metadata: {
        uhid: record.uhid,
        fullName: `${record.firstName} ${record.lastName}`,
        contactsCount: contacts.length,
      },
    });

    return this.mapToDetail(record);
  }

  async searchPatients(query: PatientSearchQuery): Promise<PaginatedResult<PatientSummaryDto>> {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const dbStatus = await checkDatabaseConnection();

    if (dbStatus.ok) {
      try {
        const where: any = { deletedAt: null };

        if (query.uhid) {
          where.uhid = { contains: query.uhid, mode: 'insensitive' };
        }
        if (query.gender) {
          where.gender = query.gender;
        }
        if (query.status) {
          where.status = query.status;
        }
        if (query.name) {
          where.OR = [
            { firstName: { contains: query.name, mode: 'insensitive' } },
            { lastName: { contains: query.name, mode: 'insensitive' } },
          ];
        }
        if (query.phone) {
          where.contacts = {
            some: {
              type: 'PHONE',
              value: { contains: query.phone },
            },
          };
        }
        if (query.identifier) {
          where.identifiers = {
            some: {
              value: { contains: query.identifier },
            },
          };
        }
        if (query.search) {
          const s = query.search.trim();
          where.OR = [
            { uhid: { contains: s, mode: 'insensitive' } },
            { firstName: { contains: s, mode: 'insensitive' } },
            { lastName: { contains: s, mode: 'insensitive' } },
            { contacts: { some: { value: { contains: s } } } },
            { identifiers: { some: { value: { contains: s } } } },
          ];
        }

        const [items, total] = await Promise.all([
          prisma.patient.findMany({
            where,
            include: {
              contacts: true,
              addresses: true,
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: query.sortOrder === 'asc' ? 'asc' : 'desc' },
          }),
          prisma.patient.count({ where }),
        ]);

        return {
          items: items.map((p) => this.mapToSummary(p)),
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      } catch (err: any) {
        console.error('[PatientsService] DB search failed, falling back to memory:', err.message);
      }
    }

    // In-memory search fallback
    let all = Array.from(new Set(this.inMemoryPatients.values())).filter((p) => !p.deletedAt);

    if (query.uhid) {
      const q = query.uhid.toLowerCase();
      all = all.filter((p) => p.uhid.toLowerCase().includes(q));
    }
    if (query.gender) {
      all = all.filter((p) => p.gender === query.gender);
    }
    if (query.status) {
      all = all.filter((p) => p.status === query.status);
    }
    if (query.name) {
      const q = query.name.toLowerCase();
      all = all.filter(
        (p) => p.firstName.toLowerCase().includes(q) || p.lastName.toLowerCase().includes(q)
      );
    }
    if (query.phone) {
      all = all.filter((p) => (p.contacts || []).some((c: any) => c.value.includes(query.phone)));
    }
    if (query.identifier) {
      all = all.filter((p) =>
        (p.identifiers || []).some((i: any) => i.value.includes(query.identifier))
      );
    }
    if (query.search) {
      const s = query.search.trim().toLowerCase();
      all = all.filter((p) => {
        return (
          p.uhid.toLowerCase().includes(s) ||
          p.firstName.toLowerCase().includes(s) ||
          p.lastName.toLowerCase().includes(s) ||
          (p.contacts || []).some((c: any) => c.value.toLowerCase().includes(s)) ||
          (p.identifiers || []).some((i: any) => i.value.toLowerCase().includes(s))
        );
      });
    }

    const total = all.length;
    const start = (page - 1) * pageSize;
    const paginated = all.slice(start, start + pageSize);

    return {
      items: paginated.map((p) => this.mapToSummary(p)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getPatientById(idOrUhid: string, auth?: AuthContext): Promise<PatientDetailDto> {
    const dbStatus = await checkDatabaseConnection();

    if (dbStatus.ok) {
      try {
        const patient = await prisma.patient.findFirst({
          where: {
            OR: [{ id: idOrUhid }, { uhid: idOrUhid }],
            deletedAt: null,
          },
          include: {
            identifiers: true,
            contacts: true,
            addresses: true,
            emergencyContacts: true,
            insurances: true,
            allergies: true,
            conditions: true,
            medications: true,
            consents: true,
          },
        });

        if (patient) {
          // Audit View
          await auditService.logEvent({
            actor: {
              id: auth?.userId || 'system',
              type: auth ? 'USER' : 'SYSTEM',
              department: auth?.department,
            },
            action: 'PATIENT_VIEWED',
            resource: 'Patient',
            resourceId: patient.id,
            requestId: auth?.requestId || `req_${Date.now()}`,
            metadata: { uhid: patient.uhid },
          });

          return this.mapToDetail(patient);
        }
      } catch (err: any) {
        console.error('[PatientsService] DB lookup failed, falling back to memory:', err.message);
      }
    }

    const p = this.inMemoryPatients.get(idOrUhid);
    if (!p || p.deletedAt) {
      throw new NotFoundError(`Patient with ID or UHID '${idOrUhid}' not found in canonical master.`);
    }

    await auditService.logEvent({
      actor: {
        id: auth?.userId || 'system',
        type: auth ? 'USER' : 'SYSTEM',
        department: auth?.department,
      },
      action: 'PATIENT_VIEWED',
      resource: 'Patient',
      resourceId: p.id,
      requestId: auth?.requestId || `req_${Date.now()}`,
      metadata: { uhid: p.uhid },
    });

    return this.mapToDetail(p);
  }

  async updatePatient(id: string, data: UpdatePatientInput, auth?: AuthContext): Promise<PatientDetailDto> {
    const patient = await this.getPatientById(id, auth);
    const dbStatus = await checkDatabaseConnection();

    const updatedData: any = {
      ...patient,
      ...data,
      updatedAt: new Date(),
      updatedById: auth?.userId || null,
    };

    if (data.dateOfBirth) {
      updatedData.dateOfBirth = new Date(data.dateOfBirth);
    }

    if (dbStatus.ok) {
      try {
        await prisma.patient.update({
          where: { id: patient.id },
          data: {
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            gender: data.gender as any,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
            isEstimatedDob: data.isEstimatedDob,
            bloodGroup: data.bloodGroup as any,
            maritalStatus: data.maritalStatus as any,
            nationality: data.nationality,
            religion: data.religion,
            occupation: data.occupation,
            status: data.status as any,
            updatedById: auth?.userId,
          },
        });
      } catch (err: any) {
        console.error('[PatientsService] DB update failed, falling back to memory:', err.message);
      }
    }

    this.inMemoryPatients.set(patient.id, updatedData);
    this.inMemoryPatients.set(patient.uhid, updatedData);

    await auditService.logEvent({
      actor: {
        id: auth?.userId || 'system',
        type: auth ? 'USER' : 'SYSTEM',
        department: auth?.department,
      },
      action: 'PATIENT_UPDATED',
      resource: 'Patient',
      resourceId: patient.id,
      requestId: auth?.requestId || `req_${Date.now()}`,
      metadata: { changes: Object.keys(data) },
    });

    return this.getPatientById(patient.id, auth);
  }

  async checkDuplicates(input: CheckDuplicateInput): Promise<DuplicatePatientCandidate[]> {
    const candidates: DuplicatePatientCandidate[] = [];
    const all = Array.from(new Set(this.inMemoryPatients.values())).filter((p) => !p.deletedAt);

    for (const p of all) {
      const signals: DuplicateMatchSignal[] = [];
      let score = 0;

      // 1. Exact Identifier match (e.g., ABHA or National ID)
      if (input.identifierValue) {
        const hasIdent = (p.identifiers || []).some(
          (i: any) => i.value.toLowerCase() === input.identifierValue!.toLowerCase()
        );
        if (hasIdent) {
          signals.push({ field: 'identifier', value: input.identifierValue, weight: 100 });
          score += 100;
        }
      }

      // 2. Exact Phone match
      const pPhones = (p.contacts || [])
        .filter((c: any) => c.type === 'PHONE')
        .map((c: any) => c.value.replace(/\D/g, ''));
      const inputPhone = input.phone?.replace(/\D/g, '');

      const isPhoneMatch = inputPhone && inputPhone.length >= 7 && pPhones.includes(inputPhone);

      // 3. Name & DOB match
      const pFullName = `${p.firstName} ${p.lastName}`.toLowerCase().trim();
      const inFullName = `${input.firstName || ''} ${input.lastName || ''}`.toLowerCase().trim();
      const isNameMatch = inFullName.length > 2 && pFullName === inFullName;

      const pDob = p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : '';
      const inDob = input.dateOfBirth ? new Date(input.dateOfBirth).toISOString().split('T')[0] : '';
      const isDobMatch = inDob && pDob && inDob === pDob;

      if (isPhoneMatch && isDobMatch) {
        signals.push({ field: 'phone', value: input.phone!, weight: 50 });
        signals.push({ field: 'name_dob', value: inDob!, weight: 40 });
        score += 90;
      } else if (isNameMatch && isDobMatch) {
        signals.push({ field: 'name_dob', value: `${inFullName} (${inDob})`, weight: 80 });
        score += 80;
      } else if (isNameMatch && isPhoneMatch) {
        signals.push({ field: 'name_phone', value: `${inFullName} (${input.phone})`, weight: 80 });
        score += 80;
      } else if (isPhoneMatch) {
        signals.push({ field: 'phone', value: input.phone!, weight: 50 });
        score += 50;
      }

      if (score >= 30) {
        let confidenceLevel: DuplicatePatientCandidate['confidenceLevel'] = 'LOW';
        if (score >= 100) confidenceLevel = 'DEFINITIVE';
        else if (score >= 90) confidenceLevel = 'VERY_HIGH';
        else if (score >= 70) confidenceLevel = 'HIGH';
        else if (score >= 50) confidenceLevel = 'MEDIUM';

        candidates.push({
          patient: this.mapToSummary(p),
          confidenceScore: Math.min(100, score),
          confidenceLevel,
          matchedSignals: signals,
        });
      }
    }

    return candidates.sort((a, b) => b.confidenceScore - a.confidenceScore);
  }

  async getPatient360(idOrUhid: string, auth?: AuthContext): Promise<Patient360Dto> {
    const patient = await this.getPatientById(idOrUhid, auth);

    // Filter active clinical flags
    const activeAllergies = (patient.allergies || []).filter((a) => a.status === 'ACTIVE');
    const activeConditions = (patient.conditions || []).filter((c) => c.clinicalStatus === 'ACTIVE');
    const currentMedications = (patient.medications || []).filter((m) => m.status === 'ACTIVE');
    const hasHighRiskAllergy = activeAllergies.some(
      (a) => a.severity === 'SEVERE' || a.severity === 'LIFE_THREATENING'
    );

    // Encounters summary
    const raw = this.inMemoryPatients.get(patient.id) || this.inMemoryPatients.get(patient.uhid);
    const encounters = raw?.encounters || [];
    const openEncounters = encounters.filter((e: any) => e.status === 'OPEN' || e.status === 'IN_PROGRESS');

    return {
      patient,
      clinicalAlerts: {
        allergiesCount: activeAllergies.length,
        activeAllergies,
        chronicConditionsCount: activeConditions.length,
        activeConditions,
        currentMedicationsCount: currentMedications.length,
        currentMedications,
        hasHighRiskAllergy,
      },
      encountersSummary: {
        totalEncounters: encounters.length,
        openEncountersCount: openEncounters.length,
        lastVisitDate: encounters[0]?.startTime ? new Date(encounters[0].startTime).toISOString() : undefined,
        recentEncounters: encounters.slice(0, 10).map((e: any) => ({
          id: e.id,
          encounterNumber: e.encounterNumber,
          type: e.type,
          status: e.status,
          priority: e.priority,
          department: e.department,
          startTime: new Date(e.startTime).toISOString(),
          endTime: e.endTime ? new Date(e.endTime).toISOString() : undefined,
          reasonForVisit: e.reasonForVisit,
        })),
      },
    };
  }

  // Internal helper to attach an encounter to a patient's in-memory record
  attachEncounterToPatient(patientId: string, encounter: any) {
    const p = this.inMemoryPatients.get(patientId);
    if (p) {
      if (!p.encounters) p.encounters = [];
      p.encounters.unshift(encounter);
    }
  }
}

export const patientsService = new PatientsService();
