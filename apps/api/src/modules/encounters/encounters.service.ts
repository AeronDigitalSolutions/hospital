import crypto from 'crypto';
import { prisma, checkDatabaseConnection } from '@chikitsaalye/database';
import type {
  CreateEncounterInput,
  UpdateEncounterInput,
  EncounterSearchQuery,
} from '@chikitsaalye/validation';
import type {
  EncounterDto,
  EncounterStatus,
  PaginatedResult,
  AuthContext,
} from '@chikitsaalye/types';
import { NotFoundError, ConflictError } from '../../middleware/errors.js';
import { auditService } from '../../services/audit.service.js';
import { patientsService } from '../patients/patients.service.js';

export interface IEncountersService {
  createEncounter(data: CreateEncounterInput, auth?: AuthContext): Promise<EncounterDto>;
  searchEncounters(query: EncounterSearchQuery): Promise<PaginatedResult<EncounterDto>>;
  getEncounterById(id: string, auth?: AuthContext): Promise<EncounterDto>;
  updateEncounter(id: string, data: UpdateEncounterInput, auth?: AuthContext): Promise<EncounterDto>;
}

export class EncountersService implements IEncountersService {
  private inMemoryEncounters = new Map<string, any>();
  private counter = 1000;

  // Explicit allowed lifecycle state transitions
  private static readonly ALLOWED_TRANSITIONS: Record<EncounterStatus, EncounterStatus[]> = {
    PLANNED: ['OPEN', 'CANCELLED'],
    OPEN: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [], // Terminal state
    CANCELLED: [], // Terminal state
  };

  private generateEncounterNumber(): string {
    const year = new Date().getFullYear();
    const seq = ++this.counter;
    return `ENC-${year}-${String(seq).padStart(6, '0')}`;
  }

  private mapToDto(e: any): EncounterDto {
    return {
      id: e.id,
      encounterNumber: e.encounterNumber,
      patientId: e.patientId,
      patientUhid: e.patientUhid || e.patient?.uhid || undefined,
      patientName:
        e.patientName ||
        (e.patient ? `${e.patient.firstName} ${e.patient.lastName}`.trim() : undefined),
      type: e.type,
      status: e.status,
      priority: e.priority || 'ROUTINE',
      department: e.department,
      attendingDoctorId: e.attendingDoctorId || undefined,
      attendingDoctorName: e.attendingDoctor?.fullName || undefined,
      startTime: new Date(e.startTime).toISOString(),
      endTime: e.endTime ? new Date(e.endTime).toISOString() : undefined,
      reasonForVisit: e.reasonForVisit,
      metadata: e.metadata || undefined,
      createdAt: new Date(e.createdAt).toISOString(),
      updatedAt: new Date(e.updatedAt).toISOString(),
    };
  }

  async createEncounter(data: CreateEncounterInput, auth?: AuthContext): Promise<EncounterDto> {
    // 1. Verify that canonical Patient exists!
    const patient = await patientsService.getPatientById(data.patientId, auth);
    if (!patient) {
      throw new NotFoundError(`Patient with ID '${data.patientId}' does not exist.`);
    }

    const id = crypto.randomUUID();
    const encounterNumber = this.generateEncounterNumber();
    const dbStatus = await checkDatabaseConnection();

    const record = {
      id,
      encounterNumber,
      patientId: patient.id,
      patientUhid: patient.uhid,
      patientName: patient.fullName,
      type: data.type || 'OPD',
      status: 'OPEN' as EncounterStatus,
      priority: data.priority || 'ROUTINE',
      department: data.department,
      attendingDoctorId: data.attendingDoctorId || null,
      startTime: new Date(),
      endTime: null,
      reasonForVisit: data.reasonForVisit,
      metadata: data.metadata || null,
      createdById: auth?.userId || null,
      updatedById: auth?.userId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    if (dbStatus.ok) {
      try {
        await prisma.encounter.create({
          data: {
            id: record.id,
            encounterNumber: record.encounterNumber,
            patientId: record.patientId,
            type: record.type as any,
            status: record.status as any,
            priority: record.priority as any,
            department: record.department,
            attendingDoctorId: record.attendingDoctorId,
            startTime: record.startTime,
            reasonForVisit: record.reasonForVisit,
            metadata: record.metadata as any,
            createdById: record.createdById,
          },
        });
      } catch (err: any) {
        console.error('[EncountersService] DB create failed, fallback to memory:', err.message);
      }
    }

    this.inMemoryEncounters.set(record.id, record);
    // Link encounter to patient in memory for 360 views
    patientsService.attachEncounterToPatient(patient.id, record);

    // Audit Event
    await auditService.logEvent({
      actor: {
        id: auth?.userId || 'system',
        type: auth ? 'USER' : 'SYSTEM',
        department: auth?.department || record.department,
      },
      action: 'ENCOUNTER_CREATED',
      resource: 'Encounter',
      resourceId: record.id,
      requestId: auth?.requestId || `req_${Date.now()}`,
      metadata: {
        encounterNumber: record.encounterNumber,
        patientId: record.patientId,
        department: record.department,
        type: record.type,
      },
    });

    return this.mapToDto(record);
  }

  async searchEncounters(query: EncounterSearchQuery): Promise<PaginatedResult<EncounterDto>> {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const dbStatus = await checkDatabaseConnection();

    if (dbStatus.ok) {
      try {
        const where: any = { deletedAt: null };
        if (query.patientId) where.patientId = query.patientId;
        if (query.department) where.department = query.department;
        if (query.type) where.type = query.type;
        if (query.status) where.status = query.status;
        if (query.startDate || query.endDate) {
          where.startTime = {};
          if (query.startDate) where.startTime.gte = new Date(query.startDate);
          if (query.endDate) where.startTime.lte = new Date(query.endDate);
        }

        const [items, total] = await Promise.all([
          prisma.encounter.findMany({
            where,
            include: {
              patient: true,
              attendingDoctor: true,
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { startTime: query.sortOrder === 'asc' ? 'asc' : 'desc' },
          }),
          prisma.encounter.count({ where }),
        ]);

        return {
          items: items.map((e) => this.mapToDto(e)),
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      } catch (err: any) {
        console.error('[EncountersService] DB search failed, fallback to memory:', err.message);
      }
    }

    // In-memory search fallback
    let all = Array.from(this.inMemoryEncounters.values()).filter((e) => !e.deletedAt);

    if (query.patientId) {
      all = all.filter((e) => e.patientId === query.patientId);
    }
    if (query.department) {
      all = all.filter((e) => e.department.toLowerCase() === query.department!.toLowerCase());
    }
    if (query.type) {
      all = all.filter((e) => e.type === query.type);
    }
    if (query.status) {
      all = all.filter((e) => e.status === query.status);
    }
    if (query.startDate) {
      const start = new Date(query.startDate);
      all = all.filter((e) => new Date(e.startTime) >= start);
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      all = all.filter((e) => new Date(e.startTime) <= end);
    }

    const total = all.length;
    const startIdx = (page - 1) * pageSize;
    const paginated = all.slice(startIdx, startIdx + pageSize);

    return {
      items: paginated.map((e) => this.mapToDto(e)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getEncounterById(id: string, auth?: AuthContext): Promise<EncounterDto> {
    const dbStatus = await checkDatabaseConnection();

    if (dbStatus.ok) {
      try {
        const encounter = await prisma.encounter.findFirst({
          where: { id, deletedAt: null },
          include: {
            patient: true,
            attendingDoctor: true,
          },
        });
        if (encounter) {
          return this.mapToDto(encounter);
        }
      } catch (err: any) {
        console.error('[EncountersService] DB get failed, fallback to memory:', err.message);
      }
    }

    const enc = this.inMemoryEncounters.get(id);
    if (!enc || enc.deletedAt) {
      throw new NotFoundError(`Encounter with ID '${id}' not found.`);
    }

    return this.mapToDto(enc);
  }

  async updateEncounter(id: string, data: UpdateEncounterInput, auth?: AuthContext): Promise<EncounterDto> {
    const existing = await this.getEncounterById(id, auth);

    // Lifecycle state machine validation
    if (data.status && data.status !== existing.status) {
      const allowed = EncountersService.ALLOWED_TRANSITIONS[existing.status];
      if (!allowed || !allowed.includes(data.status)) {
        throw new ConflictError(
          `Invalid encounter status transition from '${existing.status}' to '${data.status}'. Allowed transitions: ${
            allowed && allowed.length > 0 ? allowed.join(', ') : 'none (terminal state)'
          }`
        );
      }
    }

    const dbStatus = await checkDatabaseConnection();
    const updatedRecord: any = {
      ...this.inMemoryEncounters.get(id),
      ...data,
      endTime: data.endTime
        ? new Date(data.endTime)
        : data.status === 'COMPLETED' || data.status === 'CANCELLED'
        ? new Date()
        : existing.endTime,
      updatedAt: new Date(),
      updatedById: auth?.userId || null,
    };

    if (dbStatus.ok) {
      try {
        await prisma.encounter.update({
          where: { id },
          data: {
            status: data.status as any,
            priority: data.priority as any,
            department: data.department,
            attendingDoctorId: data.attendingDoctorId,
            reasonForVisit: data.reasonForVisit,
            endTime: updatedRecord.endTime,
            metadata: data.metadata as any,
            updatedById: auth?.userId,
          },
        });
      } catch (err: any) {
        console.error('[EncountersService] DB update failed, fallback to memory:', err.message);
      }
    }

    this.inMemoryEncounters.set(id, updatedRecord);

    // Audit Event
    await auditService.logEvent({
      actor: {
        id: auth?.userId || 'system',
        type: auth ? 'USER' : 'SYSTEM',
        department: auth?.department || existing.department,
      },
      action: data.status && data.status !== existing.status ? 'ENCOUNTER_STATUS_CHANGED' : 'ENCOUNTER_UPDATED',
      resource: 'Encounter',
      resourceId: id,
      requestId: auth?.requestId || `req_${Date.now()}`,
      metadata: {
        previousStatus: existing.status,
        newStatus: data.status || existing.status,
        encounterNumber: existing.encounterNumber,
      },
    });

    return this.getEncounterById(id, auth);
  }
}

export const encountersService = new EncountersService();
