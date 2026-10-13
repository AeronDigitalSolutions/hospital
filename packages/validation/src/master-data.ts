import { z } from 'zod';

export const departmentTypeEnum = z.enum(['CLINICAL', 'DIAGNOSTIC', 'ADMINISTRATIVE', 'SUPPORT']);

export const createDepartmentSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[A-Z0-9_]+$/, 'Code must be uppercase alphanumeric and underscores'),
  name: z.string().min(2).max(100),
  type: departmentTypeEnum.default('CLINICAL'),
  description: z.string().optional(),
  headOfDepartmentId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const createSubdepartmentSchema = z.object({
  departmentId: z.string().min(1, 'Department ID is required'),
  code: z.string().min(2).max(50).regex(/^[A-Z0-9_]+$/, 'Code must be uppercase alphanumeric and underscores'),
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateSubdepartmentSchema = createSubdepartmentSchema.partial();

export const professionalRoleEnum = z.enum([
  'DOCTOR',
  'NURSE',
  'LAB_TECHNICIAN',
  'RADIOLOGIST',
  'PHARMACIST',
  'ADMINISTRATIVE',
  'BILLING_OPERATOR',
  'OTHER',
]);

export const createStaffProfileSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  staffCode: z.string().min(2).max(50),
  departmentId: z.string().min(1, 'Department ID is required'),
  subdepartmentId: z.string().optional(),
  professionalRole: professionalRoleEnum.default('DOCTOR'),
  designation: z.string().min(2).max(100),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().default(true),
});

export const updateStaffProfileSchema = createStaffProfileSchema.partial();

export const createDoctorProfileSchema = z.object({
  staffProfileId: z.string().min(1, 'Staff profile ID is required'),
  departmentId: z.string().min(1, 'Department ID is required'),
  subdepartmentId: z.string().optional(),
  medicalCouncilRegistrationNumber: z.string().min(2).max(50),
  specialization: z.string().min(2).max(100),
  qualifications: z.string().min(2).max(200),
  opdRoomNumber: z.string().optional(),
  consultationFee: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateDoctorProfileSchema = createDoctorProfileSchema.partial();

export const wardTypeEnum = z.enum([
  'GENERAL',
  'ICU',
  'EMERGENCY',
  'PRIVATE',
  'SEMI_PRIVATE',
  'PEDIATRIC',
  'MATERNITY',
  'POST_OP',
]);

export const genderAllowedEnum = z.enum(['ALL', 'MALE', 'FEMALE']);

export const createWardSchema = z.object({
  departmentId: z.string().min(1, 'Department ID is required'),
  code: z.string().min(2).max(50).regex(/^[A-Z0-9_-]+$/, 'Code must be alphanumeric with hyphens or underscores'),
  name: z.string().min(2).max(100),
  wardType: wardTypeEnum.default('GENERAL'),
  floor: z.string().optional(),
  genderAllowed: genderAllowedEnum.default('ALL'),
  totalBeds: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateWardSchema = createWardSchema.partial();

export const roomTypeEnum = z.enum(['GENERAL', 'PRIVATE', 'ISOLATION', 'ICU_BAY']);

export const createRoomSchema = z.object({
  wardId: z.string().min(1, 'Ward ID is required'),
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(100),
  roomType: roomTypeEnum.default('GENERAL'),
  maxOccupancy: z.number().int().min(1).default(1),
  isActive: z.boolean().default(true),
});

export const updateRoomSchema = createRoomSchema.partial();

export const bedStatusEnum = z.enum(['AVAILABLE', 'OCCUPIED', 'CLEANING', 'RESERVED', 'MAINTENANCE']);
export const bedTypeEnum = z.enum(['STANDARD', 'ICU_VENTILATOR', 'OXYGEN_SUPPORTED', 'PEDIATRIC', 'TRAUMA_BAY']);

export const createBedSchema = z.object({
  wardId: z.string().min(1, 'Ward ID is required'),
  roomId: z.string().min(1, 'Room ID is required'),
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(100),
  bedType: bedTypeEnum.default('STANDARD'),
  status: bedStatusEnum.default('AVAILABLE'),
  dailyRate: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateBedSchema = createBedSchema.partial();

export const updateBedStatusSchema = z.object({
  status: bedStatusEnum,
  reason: z.string().optional(),
});

export const serviceCategoryEnum = z.enum([
  'CONSULTATION',
  'NURSING',
  'EMERGENCY',
  'PROCEDURE',
  'ICU',
  'GENERAL',
]);

export const createHospitalServiceSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(150),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  category: serviceCategoryEnum.default('GENERAL'),
  isActive: z.boolean().default(true),
});

export const updateHospitalServiceSchema = createHospitalServiceSchema.partial();

export const investigationCategoryEnum = z.enum([
  'PATHOLOGY',
  'BIOCHEMISTRY',
  'MICROBIOLOGY',
  'HEMATOLOGY',
  'RADIOLOGY_XRAY',
  'RADIOLOGY_CT',
  'RADIOLOGY_MRI',
  'ULTRASOUND',
  'ECG',
  'OTHER',
]);

export const specimenSampleTypeEnum = z.enum([
  'BLOOD',
  'URINE',
  'CSF',
  'TISSUE',
  'SPUTUM',
  'SWAB',
  'NOT_APPLICABLE',
]);

export const createInvestigationSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(150),
  category: investigationCategoryEnum.default('PATHOLOGY'),
  sampleType: specimenSampleTypeEnum.default('NOT_APPLICABLE'),
  departmentId: z.string().optional(),
  turnaroundHours: z.number().int().min(1).default(24),
  isActive: z.boolean().default(true),
});

export const updateInvestigationSchema = createInvestigationSchema.partial();

export const dosageFormEnum = z.enum([
  'TABLET',
  'CAPSULE',
  'SYRUP',
  'INJECTION',
  'OINTMENT',
  'DROPS',
  'INHALER',
  'IV_FLUID',
  'SUSPENSION',
]);

export const medicineUnitEnum = z.enum(['MG', 'ML', 'GM', 'MCG', 'IU', 'PERCENT']);

export const createMedicineSchema = z.object({
  code: z.string().min(2).max(50),
  genericName: z.string().min(2).max(150),
  brandName: z.string().optional(),
  dosageForm: dosageFormEnum.default('TABLET'),
  strength: z.string().min(1).max(50),
  unit: medicineUnitEnum.default('MG'),
  therapeuticCategory: z.string().optional(),
  isHighAlert: z.boolean().default(false),
  isNarcotic: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateMedicineSchema = createMedicineSchema.partial();

export const diagnosisCodingSystemEnum = z.enum(['ICD_10', 'SNOMED_CT', 'INSTITUTIONAL']);

export const createDiagnosisSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(200),
  codingSystem: diagnosisCodingSystemEnum.default('ICD_10'),
  category: z.string().optional(),
  isChronic: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateDiagnosisSchema = createDiagnosisSchema.partial();

export const procedureCategoryEnum = z.enum([
  'MINOR_SURGERY',
  'MAJOR_SURGERY',
  'ENDOSCOPY',
  'CARDIAC_CATH',
  'BIOPSY',
  'PHYSIOTHERAPY',
  'DIALYSIS',
  'OTHER',
]);

export const createProcedureSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(200),
  category: procedureCategoryEnum.default('OTHER'),
  departmentId: z.string().optional(),
  typicalDurationMinutes: z.number().int().min(5).default(60),
  isActive: z.boolean().default(true),
});

export const updateProcedureSchema = createProcedureSchema.partial();

export const tariffRateTypeEnum = z.enum([
  'STANDARD',
  'PMJAY_SCHEME',
  'ECHS',
  'CGHS',
  'CORPORATE_INSURANCE',
]);

export const createTariffSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(150),
  serviceId: z.string().optional(),
  investigationId: z.string().optional(),
  procedureId: z.string().optional(),
  rateType: tariffRateTypeEnum.default('STANDARD'),
  standardPrice: z.number().min(0),
  schemePrice: z.number().min(0).default(0),
  effectiveFrom: z.string().or(z.date()).default(() => new Date()),
  effectiveTo: z.string().or(z.date()).optional(),
  isActive: z.boolean().default(true),
});

export const updateTariffSchema = createTariffSchema.partial();

export const createInsuranceProviderSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(150),
  tpaName: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().default(true),
});

export const updateInsuranceProviderSchema = createInsuranceProviderSchema.partial();

export const createGovernmentSchemeSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(150),
  nodalAgency: z.string().min(2).max(150),
  coverageCap: z.number().min(0).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  isActive: z.boolean().default(true),
});

export const updateGovernmentSchemeSchema = createGovernmentSchemeSchema.partial();

// Schema aliases with Master suffix
export const createInvestigationMasterSchema = createInvestigationSchema;
export const updateInvestigationMasterSchema = updateInvestigationSchema;
export const createMedicineMasterSchema = createMedicineSchema;
export const updateMedicineMasterSchema = updateMedicineSchema;
export const createDiagnosisMasterSchema = createDiagnosisSchema;
export const updateDiagnosisMasterSchema = updateDiagnosisSchema;
export const createProcedureMasterSchema = createProcedureSchema;
export const updateProcedureMasterSchema = updateProcedureSchema;
export const createTariffMasterSchema = createTariffSchema;
export const updateTariffMasterSchema = updateTariffSchema;
export const createInsuranceProviderMasterSchema = createInsuranceProviderSchema;
export const updateInsuranceProviderMasterSchema = updateInsuranceProviderSchema;
export const createGovernmentSchemeMasterSchema = createGovernmentSchemeSchema;
export const updateGovernmentSchemeMasterSchema = updateGovernmentSchemeSchema;

// Inferred TypeScript input types
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

export type CreateSubdepartmentInput = z.infer<typeof createSubdepartmentSchema>;
export type UpdateSubdepartmentInput = z.infer<typeof updateSubdepartmentSchema>;

export type CreateStaffProfileInput = z.infer<typeof createStaffProfileSchema>;
export type UpdateStaffProfileInput = z.infer<typeof updateStaffProfileSchema>;

export type CreateDoctorProfileInput = z.infer<typeof createDoctorProfileSchema>;
export type UpdateDoctorProfileInput = z.infer<typeof updateDoctorProfileSchema>;

export type CreateWardInput = z.infer<typeof createWardSchema>;
export type UpdateWardInput = z.infer<typeof updateWardSchema>;

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;

export type CreateBedInput = z.infer<typeof createBedSchema>;
export type UpdateBedInput = z.infer<typeof updateBedSchema>;
export type UpdateBedStatusInput = z.infer<typeof updateBedStatusSchema>;

export type CreateHospitalServiceInput = z.infer<typeof createHospitalServiceSchema>;
export type UpdateHospitalServiceInput = z.infer<typeof updateHospitalServiceSchema>;

export type CreateInvestigationMasterInput = z.infer<typeof createInvestigationSchema>;
export type UpdateInvestigationMasterInput = z.infer<typeof updateInvestigationSchema>;

export type CreateMedicineMasterInput = z.infer<typeof createMedicineSchema>;
export type UpdateMedicineMasterInput = z.infer<typeof updateMedicineSchema>;

export type CreateDiagnosisMasterInput = z.infer<typeof createDiagnosisSchema>;
export type UpdateDiagnosisMasterInput = z.infer<typeof updateDiagnosisSchema>;

export type CreateProcedureMasterInput = z.infer<typeof createProcedureSchema>;
export type UpdateProcedureMasterInput = z.infer<typeof updateProcedureSchema>;

export type CreateTariffMasterInput = z.infer<typeof createTariffSchema>;
export type UpdateTariffMasterInput = z.infer<typeof updateTariffSchema>;

export type CreateInsuranceProviderMasterInput = z.infer<typeof createInsuranceProviderSchema>;
export type UpdateInsuranceProviderMasterInput = z.infer<typeof updateInsuranceProviderSchema>;

export type CreateGovernmentSchemeMasterInput = z.infer<typeof createGovernmentSchemeSchema>;
export type UpdateGovernmentSchemeMasterInput = z.infer<typeof updateGovernmentSchemeSchema>;
