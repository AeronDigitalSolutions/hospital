import type { PaginatedResult } from '@chikitsaalye/types';
import type { PatientSearchInput } from '@chikitsaalye/validation';

export interface PatientDto {
  id: string;
  uhid: string;
  fullName: string;
  gender: string;
  dateOfBirth?: string;
  phone?: string;
}

export interface IPatientsService {
  searchPatients(query: PatientSearchInput): Promise<PaginatedResult<PatientDto>>;
  getPatientById(id: string): Promise<PatientDto | null>;
  createPatient(data: any): Promise<PatientDto>;
}

export class PatientsService implements IPatientsService {
  async searchPatients(query: PatientSearchInput): Promise<PaginatedResult<PatientDto>> {
    throw new Error('Method not implemented: CODEx-002 Patient Master & Encounter Foundation.');
  }

  async getPatientById(id: string): Promise<PatientDto | null> {
    throw new Error('Method not implemented: CODEx-002 Patient Master & Encounter Foundation.');
  }

  async createPatient(data: any): Promise<PatientDto> {
    throw new Error('Method not implemented: CODEx-002 Patient Master & Encounter Foundation.');
  }
}

export const patientsService = new PatientsService();
