export type DepartmentType = 'CLINICAL' | 'DIAGNOSTIC' | 'ADMINISTRATIVE' | 'SUPPORT';

export interface Hospital {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Department {
  id: string;
  hospitalId: string;
  code: string;
  name: string;
  type: DepartmentType;
  description?: string | null;
  headOfDepartmentId?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subdepartment {
  id: string;
  departmentId: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProfessionalRole =
  | 'DOCTOR'
  | 'NURSE'
  | 'LAB_TECHNICIAN'
  | 'RADIOLOGIST'
  | 'PHARMACIST'
  | 'ADMINISTRATIVE'
  | 'BILLING_OPERATOR'
  | 'OTHER';

export interface StaffProfile {
  id: string;
  userId: string;
  staffCode: string;
  departmentId: string;
  subdepartmentId?: string | null;
  professionalRole: ProfessionalRole;
  designation: string;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorProfile {
  id: string;
  staffProfileId: string;
  departmentId: string;
  subdepartmentId?: string | null;
  medicalCouncilRegistrationNumber: string;
  specialization: string;
  qualifications: string;
  opdRoomNumber?: string | null;
  consultationFee: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  staffProfile?: StaffProfile;
}

export type WardType =
  | 'GENERAL'
  | 'ICU'
  | 'EMERGENCY'
  | 'PRIVATE'
  | 'SEMI_PRIVATE'
  | 'PEDIATRIC'
  | 'MATERNITY'
  | 'POST_OP';

export type GenderAllowed = 'ALL' | 'MALE' | 'FEMALE';

export interface Ward {
  id: string;
  hospitalId: string;
  departmentId: string;
  code: string;
  name: string;
  wardType: WardType;
  floor?: string | null;
  genderAllowed: GenderAllowed;
  totalBeds: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type RoomType = 'GENERAL' | 'PRIVATE' | 'ISOLATION' | 'ICU_BAY';

export interface Room {
  id: string;
  wardId: string;
  code: string;
  name: string;
  roomType: RoomType;
  maxOccupancy: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'RESERVED' | 'MAINTENANCE';

export type BedType = 'STANDARD' | 'ICU_VENTILATOR' | 'OXYGEN_SUPPORTED' | 'PEDIATRIC' | 'TRAUMA_BAY';

export interface Bed {
  id: string;
  wardId: string;
  roomId: string;
  code: string;
  name: string;
  bedType: BedType;
  status: BedStatus;
  dailyRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ServiceCategory =
  | 'CONSULTATION'
  | 'NURSING'
  | 'EMERGENCY'
  | 'PROCEDURE'
  | 'ICU'
  | 'GENERAL';

export interface HospitalService {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  departmentId?: string | null;
  category: ServiceCategory;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type InvestigationCategory =
  | 'PATHOLOGY'
  | 'BIOCHEMISTRY'
  | 'MICROBIOLOGY'
  | 'HEMATOLOGY'
  | 'RADIOLOGY_XRAY'
  | 'RADIOLOGY_CT'
  | 'RADIOLOGY_MRI'
  | 'ULTRASOUND'
  | 'ECG'
  | 'OTHER';

export type SpecimenSampleType =
  | 'BLOOD'
  | 'URINE'
  | 'CSF'
  | 'TISSUE'
  | 'SPUTUM'
  | 'SWAB'
  | 'NOT_APPLICABLE';

export interface InvestigationMaster {
  id: string;
  code: string;
  name: string;
  category: InvestigationCategory;
  sampleType: SpecimenSampleType;
  departmentId?: string | null;
  turnaroundHours: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type DosageForm =
  | 'TABLET'
  | 'CAPSULE'
  | 'SYRUP'
  | 'INJECTION'
  | 'OINTMENT'
  | 'DROPS'
  | 'INHALER'
  | 'IV_FLUID'
  | 'SUSPENSION';

export type MedicineUnit = 'MG' | 'ML' | 'GM' | 'MCG' | 'IU' | 'PERCENT';

export interface MedicineMaster {
  id: string;
  code: string;
  genericName: string;
  brandName?: string | null;
  dosageForm: DosageForm;
  strength: string;
  unit: MedicineUnit;
  therapeuticCategory?: string | null;
  isHighAlert: boolean;
  isNarcotic: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type DiagnosisCodingSystem = 'ICD_10' | 'SNOMED_CT' | 'INSTITUTIONAL';

export interface DiagnosisMaster {
  id: string;
  code: string;
  name: string;
  codingSystem: DiagnosisCodingSystem;
  category?: string | null;
  isChronic: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProcedureCategory =
  | 'MINOR_SURGERY'
  | 'MAJOR_SURGERY'
  | 'ENDOSCOPY'
  | 'CARDIAC_CATH'
  | 'BIOPSY'
  | 'PHYSIOTHERAPY'
  | 'DIALYSIS'
  | 'OTHER';

export interface ProcedureMaster {
  id: string;
  code: string;
  name: string;
  category: ProcedureCategory;
  departmentId?: string | null;
  typicalDurationMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TariffRateType =
  | 'STANDARD'
  | 'PMJAY_SCHEME'
  | 'ECHS'
  | 'CGHS'
  | 'CORPORATE_INSURANCE';

export interface TariffMaster {
  id: string;
  code: string;
  name: string;
  serviceId?: string | null;
  investigationId?: string | null;
  procedureId?: string | null;
  rateType: TariffRateType;
  standardPrice: number;
  schemePrice: number;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsuranceProviderMaster {
  id: string;
  code: string;
  name: string;
  tpaName?: string | null;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GovernmentSchemeMaster {
  id: string;
  code: string;
  name: string;
  nodalAgency: string;
  coverageCap?: number | null;
  discountPercentage?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
