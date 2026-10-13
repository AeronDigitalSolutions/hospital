export type EncounterType =
  | 'OPD'
  | 'IPD'
  | 'EMERGENCY'
  | 'TELEMEDICINE'
  | 'FOLLOW_UP'
  | 'DAY_CARE'
  | 'PROCEDURE'
  | 'SURGERY';

export type EncounterStatus = 'PLANNED' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type EncounterPriority = 'ROUTINE' | 'URGENT' | 'EMERGENCY';

export interface EncounterDto {
  id: string;
  encounterNumber: string;
  patientId: string;
  patientUhid?: string;
  patientName?: string;
  type: EncounterType;
  status: EncounterStatus;
  priority: EncounterPriority;
  department: string;
  attendingDoctorId?: string;
  attendingDoctorName?: string;
  startTime: string;
  endTime?: string;
  reasonForVisit: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface EncounterCreateInput {
  patientId: string;
  type?: EncounterType;
  priority?: EncounterPriority;
  department: string;
  attendingDoctorId?: string;
  reasonForVisit: string;
  metadata?: Record<string, unknown>;
}

export interface EncounterUpdateInput {
  status?: EncounterStatus;
  priority?: EncounterPriority;
  department?: string;
  attendingDoctorId?: string;
  reasonForVisit?: string;
  endTime?: string;
  metadata?: Record<string, unknown>;
}
