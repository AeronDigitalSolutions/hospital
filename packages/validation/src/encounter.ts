import { z } from 'zod';
import { paginationQuerySchema, uuidSchema } from './common.js';

export const encounterTypeSchema = z.enum([
  'OPD',
  'IPD',
  'EMERGENCY',
  'TELEMEDICINE',
  'FOLLOW_UP',
  'DAY_CARE',
  'PROCEDURE',
  'SURGERY',
]);

export const encounterStatusSchema = z.enum([
  'PLANNED',
  'OPEN',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
]);

export const encounterPrioritySchema = z.enum(['ROUTINE', 'URGENT', 'EMERGENCY']);

export const createEncounterSchema = z.object({
  patientId: uuidSchema,
  type: encounterTypeSchema.default('OPD'),
  priority: encounterPrioritySchema.default('ROUTINE'),
  department: z.string().trim().min(1, 'Department is required (e.g. GENERAL_MEDICINE, EMERGENCY)'),
  attendingDoctorId: uuidSchema.optional(),
  reasonForVisit: z.string().trim().min(1, 'Reason for visit / chief complaint is required'),
  metadata: z.record(z.unknown()).optional(),
});

export const updateEncounterSchema = z.object({
  status: encounterStatusSchema.optional(),
  priority: encounterPrioritySchema.optional(),
  department: z.string().trim().min(1).optional(),
  attendingDoctorId: uuidSchema.optional(),
  reasonForVisit: z.string().trim().min(1).optional(),
  endTime: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const encounterSearchSchema = paginationQuerySchema.extend({
  patientId: uuidSchema.optional(),
  type: encounterTypeSchema.optional(),
  status: encounterStatusSchema.optional(),
  department: z.string().trim().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type CreateEncounterInput = z.infer<typeof createEncounterSchema>;
export type UpdateEncounterInput = z.infer<typeof updateEncounterSchema>;
export type EncounterSearchQuery = z.infer<typeof encounterSearchSchema>;
