import { z } from 'zod';
import { paginationQuerySchema } from './common.js';

export const genderSchema = z.enum(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']);
export const bloodGroupSchema = z.enum([
  'A_POSITIVE',
  'A_NEGATIVE',
  'B_POSITIVE',
  'B_NEGATIVE',
  'AB_POSITIVE',
  'AB_NEGATIVE',
  'O_POSITIVE',
  'O_NEGATIVE',
  'UNKNOWN',
]);
export const maritalStatusSchema = z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'OTHER']);
export const patientStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'DECEASED', 'MERGED']);

export const identifierTypeSchema = z.enum([
  'UHID',
  'ABHA_NUMBER',
  'ABHA_ADDRESS',
  'NATIONAL_ID',
  'PASSPORT',
  'VOTER_ID',
  'DRIVING_LICENSE',
  'EXTERNAL_HOSPITAL_ID',
  'OTHER',
]);

export const contactTypeSchema = z.enum(['PHONE', 'EMAIL', 'LANDLINE']);
export const addressTypeSchema = z.enum(['CURRENT', 'PERMANENT', 'TEMPORARY']);
export const policyTypeSchema = z.enum([
  'PMJAY',
  'CGHS',
  'PRIVATE_TPA',
  'CORPORATE',
  'GOVERNMENT',
  'SELF',
]);

export const patientIdentifierInputSchema = z.object({
  type: identifierTypeSchema,
  value: z.string().trim().min(1, 'Identifier value cannot be empty'),
  issuingAuthority: z.string().trim().optional(),
  isPrimary: z.boolean().default(false),
});

export const patientContactInputSchema = z.object({
  type: contactTypeSchema.default('PHONE'),
  value: z.string().trim().min(3, 'Contact value must be at least 3 characters'),
  isPrimary: z.boolean().default(true),
});

export const patientAddressInputSchema = z.object({
  type: addressTypeSchema.default('CURRENT'),
  addressLine1: z.string().trim().min(2, 'Address line 1 is required'),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(1, 'City is required'),
  district: z.string().trim().min(1, 'District is required'),
  state: z.string().trim().default('Uttar Pradesh'),
  postalCode: z.string().trim().min(4, 'Postal code is required'),
  country: z.string().trim().default('India'),
  isPrimary: z.boolean().default(true),
});

export const emergencyContactInputSchema = z.object({
  name: z.string().trim().min(1, 'Emergency contact name is required'),
  relationship: z.string().trim().min(1, 'Relationship is required'),
  phone: z.string().trim().min(7, 'Emergency contact phone is required'),
  alternatePhone: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal('')),
  isPrimary: z.boolean().default(true),
});

export const patientInsuranceInputSchema = z.object({
  policyNumber: z.string().trim().min(1, 'Policy number is required'),
  providerName: z.string().trim().min(1, 'Provider name is required'),
  policyType: policyTypeSchema.default('PMJAY'),
  coverageDetails: z.record(z.unknown()).optional(),
  validTill: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});

export const patientAllergyInputSchema = z.object({
  allergen: z.string().trim().min(1, 'Allergen name is required'),
  allergenType: z.enum(['DRUG', 'FOOD', 'ENVIRONMENTAL', 'BIOLOGICAL', 'OTHER']).default('DRUG'),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING']).default('MODERATE'),
  reaction: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'RESOLVED', 'SUSPECTED']).default('ACTIVE'),
  notes: z.string().trim().optional(),
});

export const patientConditionInputSchema = z.object({
  conditionCode: z.string().trim().optional(),
  conditionName: z.string().trim().min(1, 'Condition name is required'),
  clinicalStatus: z
    .enum(['ACTIVE', 'RECURRENCE', 'RELAPSE', 'INACTIVE', 'REMISSION', 'RESOLVED'])
    .default('ACTIVE'),
  verificationStatus: z.enum(['CONFIRMED', 'PROVISIONAL', 'DIFFERENTIAL']).default('CONFIRMED'),
  onsetDate: z.string().datetime().optional(),
  notes: z.string().trim().optional(),
});

export const patientMedicationInputSchema = z.object({
  drugName: z.string().trim().min(1, 'Drug name is required'),
  dosage: z.string().trim().optional(),
  frequency: z.string().trim().optional(),
  route: z.string().trim().default('ORAL'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  prescribedBy: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'DISCONTINUED', 'COMPLETED']).default('ACTIVE'),
  notes: z.string().trim().optional(),
});

export const patientConsentInputSchema = z.object({
  consentType: z
    .enum(['GENERAL_TREATMENT', 'ABDM_DATA_SHARING', 'PROCEDURE_SURGERY', 'RESEARCH_USE', 'BILLING_DISCLOSURE'])
    .default('GENERAL_TREATMENT'),
  status: z.enum(['GRANTED', 'REVOKED', 'EXPIRED']).default('GRANTED'),
  validUntil: z.string().datetime().optional(),
  notes: z.string().trim().optional(),
});

export const createPatientSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, 'Last name is required'),
  gender: genderSchema,
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid date of birth is required (YYYY-MM-DD or ISO timestamp)',
  }),
  isEstimatedDob: z.boolean().default(false),
  bloodGroup: bloodGroupSchema.default('UNKNOWN'),
  maritalStatus: maritalStatusSchema.optional(),
  nationality: z.string().trim().default('Indian'),
  religion: z.string().trim().optional(),
  occupation: z.string().trim().optional(),
  identifiers: z.array(patientIdentifierInputSchema).default([]),
  contacts: z.array(patientContactInputSchema).min(1, 'At least one contact (phone) is required'),
  addresses: z.array(patientAddressInputSchema).optional().default([]),
  emergencyContacts: z.array(emergencyContactInputSchema).optional().default([]),
  insurances: z.array(patientInsuranceInputSchema).optional().default([]),
  allergies: z.array(patientAllergyInputSchema).optional().default([]),
  conditions: z.array(patientConditionInputSchema).optional().default([]),
  medications: z.array(patientMedicationInputSchema).optional().default([]),
  consents: z.array(patientConsentInputSchema).optional().default([]),
});

export const updatePatientSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1).optional(),
  gender: genderSchema.optional(),
  dateOfBirth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Valid date of birth is required',
    })
    .optional(),
  isEstimatedDob: z.boolean().optional(),
  bloodGroup: bloodGroupSchema.optional(),
  maritalStatus: maritalStatusSchema.optional(),
  nationality: z.string().trim().optional(),
  religion: z.string().trim().optional(),
  occupation: z.string().trim().optional(),
  status: patientStatusSchema.optional(),
});

export const patientSearchSchema = paginationQuerySchema.extend({
  uhid: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  name: z.string().trim().optional(),
  identifier: z.string().trim().optional(),
  gender: genderSchema.optional(),
  status: patientStatusSchema.optional(),
});

export const checkDuplicateSchema = z.object({
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  dateOfBirth: z.string().optional(),
  phone: z.string().trim().optional(),
  identifierValue: z.string().trim().optional(),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type PatientSearchQuery = z.infer<typeof patientSearchSchema>;
export type CheckDuplicateInput = z.infer<typeof checkDuplicateSchema>;
