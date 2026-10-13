export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';

export type BloodGroup =
  | 'A_POSITIVE'
  | 'A_NEGATIVE'
  | 'B_POSITIVE'
  | 'B_NEGATIVE'
  | 'AB_POSITIVE'
  | 'AB_NEGATIVE'
  | 'O_POSITIVE'
  | 'O_NEGATIVE'
  | 'UNKNOWN';

export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'OTHER';

export type PatientStatus = 'ACTIVE' | 'INACTIVE' | 'DECEASED' | 'MERGED';

export type IdentifierType =
  | 'UHID'
  | 'ABHA_NUMBER'
  | 'ABHA_ADDRESS'
  | 'NATIONAL_ID'
  | 'PASSPORT'
  | 'VOTER_ID'
  | 'DRIVING_LICENSE'
  | 'EXTERNAL_HOSPITAL_ID'
  | 'OTHER';

export type ContactType = 'PHONE' | 'EMAIL' | 'LANDLINE';

export type AddressType = 'CURRENT' | 'PERMANENT' | 'TEMPORARY';

export type PolicyType = 'PMJAY' | 'CGHS' | 'PRIVATE_TPA' | 'CORPORATE' | 'GOVERNMENT' | 'SELF';

export type AllergenType = 'DRUG' | 'FOOD' | 'ENVIRONMENTAL' | 'BIOLOGICAL' | 'OTHER';

export type AllergySeverity = 'MILD' | 'MODERATE' | 'SEVERE' | 'LIFE_THREATENING';

export type AllergyStatus = 'ACTIVE' | 'RESOLVED' | 'SUSPECTED';

export type ConditionClinicalStatus =
  | 'ACTIVE'
  | 'RECURRENCE'
  | 'RELAPSE'
  | 'INACTIVE'
  | 'REMISSION'
  | 'RESOLVED';

export type ConditionVerificationStatus = 'CONFIRMED' | 'PROVISIONAL' | 'DIFFERENTIAL';

export type MedicationStatus = 'ACTIVE' | 'DISCONTINUED' | 'COMPLETED';

export type ConsentType =
  | 'GENERAL_TREATMENT'
  | 'ABDM_DATA_SHARING'
  | 'PROCEDURE_SURGERY'
  | 'RESEARCH_USE'
  | 'BILLING_DISCLOSURE';

export type ConsentStatus = 'GRANTED' | 'REVOKED' | 'EXPIRED';

export interface PatientIdentifierDto {
  id?: string;
  type: IdentifierType;
  value: string;
  issuingAuthority?: string;
  isPrimary: boolean;
}

export interface PatientContactDto {
  id?: string;
  type: ContactType;
  value: string;
  isPrimary: boolean;
  isVerified?: boolean;
}

export interface PatientAddressDto {
  id?: string;
  type: AddressType;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
}

export interface EmergencyContactDto {
  id?: string;
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  isPrimary: boolean;
}

export interface PatientInsuranceDto {
  id?: string;
  policyNumber: string;
  providerName: string;
  policyType: PolicyType;
  coverageDetails?: Record<string, unknown>;
  validTill?: string;
  isActive: boolean;
}

export interface PatientAllergyDto {
  id?: string;
  allergen: string;
  allergenType: AllergenType;
  severity: AllergySeverity;
  reaction?: string;
  status: AllergyStatus;
  recordedAt: string;
  recordedById?: string;
  notes?: string;
}

export interface PatientConditionDto {
  id?: string;
  conditionCode?: string;
  conditionName: string;
  clinicalStatus: ConditionClinicalStatus;
  verificationStatus: ConditionVerificationStatus;
  onsetDate?: string;
  recordedAt: string;
  recordedById?: string;
  notes?: string;
}

export interface PatientMedicationDto {
  id?: string;
  drugName: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  startDate?: string;
  endDate?: string;
  prescribedBy?: string;
  status: MedicationStatus;
  notes?: string;
}

export interface PatientConsentDto {
  id?: string;
  consentType: ConsentType;
  status: ConsentStatus;
  grantedAt: string;
  validUntil?: string;
  documentedBy?: string;
  notes?: string;
}

export interface PatientSummaryDto {
  id: string;
  uhid: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  gender: Gender;
  dateOfBirth: string;
  ageYears: number;
  isEstimatedDob: boolean;
  bloodGroup: BloodGroup;
  status: PatientStatus;
  primaryPhone?: string;
  primaryAddress?: string;
  createdAt: string;
}

export interface PatientDetailDto extends PatientSummaryDto {
  maritalStatus?: MaritalStatus;
  nationality: string;
  religion?: string;
  occupation?: string;
  photoUrl?: string;
  deceasedAt?: string;
  identifiers: PatientIdentifierDto[];
  contacts: PatientContactDto[];
  addresses: PatientAddressDto[];
  emergencyContacts: EmergencyContactDto[];
  insurances: PatientInsuranceDto[];
  allergies?: PatientAllergyDto[];
  conditions?: PatientConditionDto[];
  medications?: PatientMedicationDto[];
  consents?: PatientConsentDto[];
}

export interface DuplicateMatchSignal {
  field: 'phone' | 'uhid' | 'identifier' | 'name_dob' | 'name_phone';
  value: string;
  weight: number;
}

export interface DuplicatePatientCandidate {
  patient: PatientSummaryDto;
  confidenceScore: number; // 0 - 100
  confidenceLevel: 'DEFINITIVE' | 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  matchedSignals: DuplicateMatchSignal[];
}

export interface Patient360Dto {
  patient: PatientDetailDto;
  clinicalAlerts: {
    allergiesCount: number;
    activeAllergies: PatientAllergyDto[];
    chronicConditionsCount: number;
    activeConditions: PatientConditionDto[];
    currentMedicationsCount: number;
    currentMedications: PatientMedicationDto[];
    hasHighRiskAllergy: boolean;
  };
  encountersSummary: {
    totalEncounters: number;
    openEncountersCount: number;
    lastVisitDate?: string;
    recentEncounters: Array<{
      id: string;
      encounterNumber: string;
      type: string;
      status: string;
      priority: string;
      department: string;
      startTime: string;
      endTime?: string;
      reasonForVisit: string;
    }>;
  };
}
