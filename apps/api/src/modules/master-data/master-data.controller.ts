import { Request, Response, NextFunction } from 'express';
import { masterDataService } from './master-data.service.js';
import { sendSuccess } from '../../middleware/response-envelope.js';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  createSubdepartmentSchema,
  updateSubdepartmentSchema,
  createStaffProfileSchema,
  updateStaffProfileSchema,
  createDoctorProfileSchema,
  updateDoctorProfileSchema,
  createWardSchema,
  updateWardSchema,
  createRoomSchema,
  updateRoomSchema,
  createBedSchema,
  updateBedSchema,
  updateBedStatusSchema,
  createHospitalServiceSchema,
  updateHospitalServiceSchema,
  createInvestigationMasterSchema,
  updateInvestigationMasterSchema,
  createMedicineMasterSchema,
  updateMedicineMasterSchema,
  createDiagnosisMasterSchema,
  updateDiagnosisMasterSchema,
  createProcedureMasterSchema,
  updateProcedureMasterSchema,
  createTariffMasterSchema,
  updateTariffMasterSchema,
  createInsuranceProviderMasterSchema,
  updateInsuranceProviderMasterSchema,
  createGovernmentSchemeMasterSchema,
  updateGovernmentSchemeMasterSchema,
} from '@chikitsaalye/validation';

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const getMasterDataSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await masterDataService.getSummary();
  return sendSuccess(req, res, summary);
});

// ----------------------------------------------------------------------------
// Departments
// ----------------------------------------------------------------------------
export const listDepartments = asyncHandler(async (req: Request, res: Response) => {
  const { type, search, isActive } = req.query;
  const items = await masterDataService.listDepartments({
    type: type as any,
    search: search as string,
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
  });
  return sendSuccess(req, res, items);
});

export const getDepartmentById = asyncHandler(async (req: Request, res: Response) => {
  const item = await masterDataService.getDepartmentById(req.params.id);
  return sendSuccess(req, res, item);
});

export const createDepartment = asyncHandler(async (req: Request, res: Response) => {
  const input = createDepartmentSchema.parse(req.body);
  const created = await masterDataService.createDepartment(input, req.auth);
  return sendSuccess(req, res, created, 201);
});

export const updateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const input = updateDepartmentSchema.parse(req.body);
  const updated = await masterDataService.updateDepartment(req.params.id, input, req.auth);
  return sendSuccess(req, res, updated);
});

export const deactivateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const deactivated = await masterDataService.deactivateDepartment(req.params.id, req.auth);
  return sendSuccess(req, res, deactivated);
});

// ----------------------------------------------------------------------------
// Subdepartments
// ----------------------------------------------------------------------------
export const listSubdepartments = asyncHandler(async (req: Request, res: Response) => {
  const { departmentId, search } = req.query;
  const items = await masterDataService.listSubdepartments({
    departmentId: departmentId as string,
    search: search as string,
  });
  return sendSuccess(req, res, items);
});

export const getSubdepartmentById = asyncHandler(async (req: Request, res: Response) => {
  const item = await masterDataService.getSubdepartmentById(req.params.id);
  return sendSuccess(req, res, item);
});

export const createSubdepartment = asyncHandler(async (req: Request, res: Response) => {
  const input = createSubdepartmentSchema.parse(req.body);
  const created = await masterDataService.createSubdepartment(input, req.auth);
  return sendSuccess(req, res, created, 201);
});

export const updateSubdepartment = asyncHandler(async (req: Request, res: Response) => {
  const input = updateSubdepartmentSchema.parse(req.body);
  const updated = await masterDataService.updateSubdepartment(req.params.id, input, req.auth);
  return sendSuccess(req, res, updated);
});

export const deactivateSubdepartment = asyncHandler(async (req: Request, res: Response) => {
  const deactivated = await masterDataService.deactivateSubdepartment(req.params.id, req.auth);
  return sendSuccess(req, res, deactivated);
});

// ----------------------------------------------------------------------------
// Staff Profiles
// ----------------------------------------------------------------------------
export const listStaff = asyncHandler(async (req: Request, res: Response) => {
  const { departmentId, role, search } = req.query;
  const items = await masterDataService.listStaff({
    departmentId: departmentId as string,
    role: role as any,
    search: search as string,
  });
  return sendSuccess(req, res, items);
});

export const getStaffById = asyncHandler(async (req: Request, res: Response) => {
  const item = await masterDataService.getStaffById(req.params.id);
  return sendSuccess(req, res, item);
});

export const createStaff = asyncHandler(async (req: Request, res: Response) => {
  const input = createStaffProfileSchema.parse(req.body);
  const created = await masterDataService.createStaff(input, req.auth);
  return sendSuccess(req, res, created, 201);
});

export const updateStaff = asyncHandler(async (req: Request, res: Response) => {
  const input = updateStaffProfileSchema.parse(req.body);
  const updated = await masterDataService.updateStaff(req.params.id, input, req.auth);
  return sendSuccess(req, res, updated);
});

export const deactivateStaff = asyncHandler(async (req: Request, res: Response) => {
  const deactivated = await masterDataService.deactivateStaff(req.params.id, req.auth);
  return sendSuccess(req, res, deactivated);
});

// ----------------------------------------------------------------------------
// Doctors
// ----------------------------------------------------------------------------
export const listDoctors = asyncHandler(async (req: Request, res: Response) => {
  const { departmentId, specialization, search } = req.query;
  const items = await masterDataService.listDoctors({
    departmentId: departmentId as string,
    specialization: specialization as string,
    search: search as string,
  });
  return sendSuccess(req, res, items);
});

export const getDoctorById = asyncHandler(async (req: Request, res: Response) => {
  const item = await masterDataService.getDoctorById(req.params.id);
  return sendSuccess(req, res, item);
});

export const createDoctor = asyncHandler(async (req: Request, res: Response) => {
  const input = createDoctorProfileSchema.parse(req.body);
  const created = await masterDataService.createDoctor(input, req.auth);
  return sendSuccess(req, res, created, 201);
});

export const updateDoctor = asyncHandler(async (req: Request, res: Response) => {
  const input = updateDoctorProfileSchema.parse(req.body);
  const updated = await masterDataService.updateDoctor(req.params.id, input, req.auth);
  return sendSuccess(req, res, updated);
});

export const deactivateDoctor = asyncHandler(async (req: Request, res: Response) => {
  const deactivated = await masterDataService.deactivateDoctor(req.params.id, req.auth);
  return sendSuccess(req, res, deactivated);
});

// ----------------------------------------------------------------------------
// Wards
// ----------------------------------------------------------------------------
export const listWards = asyncHandler(async (req: Request, res: Response) => {
  const { departmentId, wardType, search } = req.query;
  const items = await masterDataService.listWards({
    departmentId: departmentId as string,
    wardType: wardType as any,
    search: search as string,
  });
  return sendSuccess(req, res, items);
});

export const getWardById = asyncHandler(async (req: Request, res: Response) => {
  const item = await masterDataService.getWardById(req.params.id);
  return sendSuccess(req, res, item);
});

export const createWard = asyncHandler(async (req: Request, res: Response) => {
  const input = createWardSchema.parse(req.body);
  const created = await masterDataService.createWard(input, req.auth);
  return sendSuccess(req, res, created, 201);
});

export const updateWard = asyncHandler(async (req: Request, res: Response) => {
  const input = updateWardSchema.parse(req.body);
  const updated = await masterDataService.updateWard(req.params.id, input, req.auth);
  return sendSuccess(req, res, updated);
});

export const deactivateWard = asyncHandler(async (req: Request, res: Response) => {
  const deactivated = await masterDataService.deactivateWard(req.params.id, req.auth);
  return sendSuccess(req, res, deactivated);
});

// ----------------------------------------------------------------------------
// Rooms
// ----------------------------------------------------------------------------
export const listRooms = asyncHandler(async (req: Request, res: Response) => {
  const { wardId, roomType, search } = req.query;
  const items = await masterDataService.listRooms({
    wardId: wardId as string,
    roomType: roomType as any,
    search: search as string,
  });
  return sendSuccess(req, res, items);
});

export const getRoomById = asyncHandler(async (req: Request, res: Response) => {
  const item = await masterDataService.getRoomById(req.params.id);
  return sendSuccess(req, res, item);
});

export const createRoom = asyncHandler(async (req: Request, res: Response) => {
  const input = createRoomSchema.parse(req.body);
  const created = await masterDataService.createRoom(input, req.auth);
  return sendSuccess(req, res, created, 201);
});

export const updateRoom = asyncHandler(async (req: Request, res: Response) => {
  const input = updateRoomSchema.parse(req.body);
  const updated = await masterDataService.updateRoom(req.params.id, input, req.auth);
  return sendSuccess(req, res, updated);
});

export const deactivateRoom = asyncHandler(async (req: Request, res: Response) => {
  const deactivated = await masterDataService.deactivateRoom(req.params.id, req.auth);
  return sendSuccess(req, res, deactivated);
});

// ----------------------------------------------------------------------------
// Beds & Status Transitions
// ----------------------------------------------------------------------------
export const listBeds = asyncHandler(async (req: Request, res: Response) => {
  const { wardId, roomId, status, bedType, search } = req.query;
  const items = await masterDataService.listBeds({
    wardId: wardId as string,
    roomId: roomId as string,
    status: status as any,
    bedType: bedType as any,
    search: search as string,
  });
  return sendSuccess(req, res, items);
});

export const getBedById = asyncHandler(async (req: Request, res: Response) => {
  const item = await masterDataService.getBedById(req.params.id);
  return sendSuccess(req, res, item);
});

export const createBed = asyncHandler(async (req: Request, res: Response) => {
  const input = createBedSchema.parse(req.body);
  const created = await masterDataService.createBed(input, req.auth);
  return sendSuccess(req, res, created, 201);
});

export const updateBed = asyncHandler(async (req: Request, res: Response) => {
  const input = updateBedSchema.parse(req.body);
  const updated = await masterDataService.updateBed(req.params.id, input, req.auth);
  return sendSuccess(req, res, updated);
});

export const updateBedStatus = asyncHandler(async (req: Request, res: Response) => {
  const input = updateBedStatusSchema.parse(req.body);
  const updated = await masterDataService.updateBedStatus(req.params.id, input, req.auth);
  return sendSuccess(req, res, updated);
});

export const deactivateBed = asyncHandler(async (req: Request, res: Response) => {
  const deactivated = await masterDataService.deactivateBed(req.params.id, req.auth);
  return sendSuccess(req, res, deactivated);
});

// ----------------------------------------------------------------------------
// Services
// ----------------------------------------------------------------------------
export const listServices = asyncHandler(async (req: Request, res: Response) => {
  const { category, departmentId, search } = req.query;
  const items = await masterDataService.listServices({
    category: category as any,
    departmentId: departmentId as string,
    search: search as string,
  });
  return sendSuccess(req, res, items);
});

export const getServiceById = asyncHandler(async (req: Request, res: Response) => {
  const item = await masterDataService.getServiceById(req.params.id);
  return sendSuccess(req, res, item);
});

export const createService = asyncHandler(async (req: Request, res: Response) => {
  const input = createHospitalServiceSchema.parse(req.body);
  const created = await masterDataService.createService(input, req.auth);
  return sendSuccess(req, res, created, 201);
});

export const updateService = asyncHandler(async (req: Request, res: Response) => {
  const input = updateHospitalServiceSchema.parse(req.body);
  const updated = await masterDataService.updateService(req.params.id, input, req.auth);
  return sendSuccess(req, res, updated);
});

export const deactivateService = asyncHandler(async (req: Request, res: Response) => {
  const deactivated = await masterDataService.deactivateService(req.params.id, req.auth);
  return sendSuccess(req, res, deactivated);
});

// ----------------------------------------------------------------------------
// Investigations
// ----------------------------------------------------------------------------
export const listInvestigations = asyncHandler(async (req: Request, res: Response) => {
  const { category, departmentId, search } = req.query;
  const items = await masterDataService.listInvestigations({
    category: category as any,
    departmentId: departmentId as string,
    search: search as string,
  });
  return sendSuccess(req, res, items);
});

export const getInvestigationById = asyncHandler(async (req: Request, res: Response) => {
  const item = await masterDataService.getInvestigationById(req.params.id);
  return sendSuccess(req, res, item);
});

export const createInvestigation = asyncHandler(async (req: Request, res: Response) => {
  const input = createInvestigationMasterSchema.parse(req.body);
  const created = await masterDataService.createInvestigation(input, req.auth);
  return sendSuccess(req, res, created, 201);
});

export const updateInvestigation = asyncHandler(async (req: Request, res: Response) => {
  const input = updateInvestigationMasterSchema.parse(req.body);
  const updated = await masterDataService.updateInvestigation(req.params.id, input, req.auth);
  return sendSuccess(req, res, updated);
});

export const deactivateInvestigation = asyncHandler(async (req: Request, res: Response) => {
  const deactivated = await masterDataService.deactivateInvestigation(req.params.id, req.auth);
  return sendSuccess(req, res, deactivated);
});

// ----------------------------------------------------------------------------
// Medicines
// ----------------------------------------------------------------------------
export const listMedicines = asyncHandler(async (req: Request, res: Response) => {
  const { dosageForm, isNarcotic, search } = req.query;
  const items = await masterDataService.listMedicines({
    dosageForm: dosageForm as any,
    isNarcotic: isNarcotic !== undefined ? isNarcotic === 'true' : undefined,
    search: search as string,
  });
  return sendSuccess(req, res, items);
});

export const getMedicineById = asyncHandler(async (req: Request, res: Response) => {
  const item = await masterDataService.getMedicineById(req.params.id);
  return sendSuccess(req, res, item);
});

export const createMedicine = asyncHandler(async (req: Request, res: Response) => {
  const input = createMedicineMasterSchema.parse(req.body);
  const created = await masterDataService.createMedicine(input, req.auth);
  return sendSuccess(req, res, created, 201);
});

export const updateMedicine = asyncHandler(async (req: Request, res: Response) => {
  const input = updateMedicineMasterSchema.parse(req.body);
  const updated = await masterDataService.updateMedicine(req.params.id, input, req.auth);
  return sendSuccess(req, res, updated);
});

export const deactivateMedicine = asyncHandler(async (req: Request, res: Response) => {
  const deactivated = await masterDataService.deactivateMedicine(req.params.id, req.auth);
  return sendSuccess(req, res, deactivated);
});

// ----------------------------------------------------------------------------
// Diagnoses
// ----------------------------------------------------------------------------
export const listDiagnoses = asyncHandler(async (req: Request, res: Response) => {
  const { codingSystem, isChronic, search } = req.query;
  const items = await masterDataService.listDiagnoses({
    codingSystem: codingSystem as any,
    isChronic: isChronic !== undefined ? isChronic === 'true' : undefined,
    search: search as string,
  });
  return sendSuccess(req, res, items);
});

export const getDiagnosisById = asyncHandler(async (req: Request, res: Response) => {
  const item = await masterDataService.getDiagnosisById(req.params.id);
  return sendSuccess(req, res, item);
});

export const createDiagnosis = asyncHandler(async (req: Request, res: Response) => {
  const input = createDiagnosisMasterSchema.parse(req.body);
  const created = await masterDataService.createDiagnosis(input, req.auth);
  return sendSuccess(req, res, created, 201);
});

export const updateDiagnosis = asyncHandler(async (req: Request, res: Response) => {
  const input = updateDiagnosisMasterSchema.parse(req.body);
  const updated = await masterDataService.updateDiagnosis(req.params.id, input, req.auth);
  return sendSuccess(req, res, updated);
});

export const deactivateDiagnosis = asyncHandler(async (req: Request, res: Response) => {
  const deactivated = await masterDataService.deactivateDiagnosis(req.params.id, req.auth);
  return sendSuccess(req, res, deactivated);
});

// ----------------------------------------------------------------------------
// Procedures
// ----------------------------------------------------------------------------
export const listProcedures = asyncHandler(async (req: Request, res: Response) => {
  const { category, departmentId, search } = req.query;
  const items = await masterDataService.listProcedures({
    category: category as any,
    departmentId: departmentId as string,
    search: search as string,
  });
  return sendSuccess(req, res, items);
});

export const getProcedureById = asyncHandler(async (req: Request, res: Response) => {
  const item = await masterDataService.getProcedureById(req.params.id);
  return sendSuccess(req, res, item);
});

export const createProcedure = asyncHandler(async (req: Request, res: Response) => {
  const input = createProcedureMasterSchema.parse(req.body);
  const created = await masterDataService.createProcedure(input, req.auth);
  return sendSuccess(req, res, created, 201);
});

export const updateProcedure = asyncHandler(async (req: Request, res: Response) => {
  const input = updateProcedureMasterSchema.parse(req.body);
  const updated = await masterDataService.updateProcedure(req.params.id, input, req.auth);
  return sendSuccess(req, res, updated);
});

export const deactivateProcedure = asyncHandler(async (req: Request, res: Response) => {
  const deactivated = await masterDataService.deactivateProcedure(req.params.id, req.auth);
  return sendSuccess(req, res, deactivated);
});

// ----------------------------------------------------------------------------
// Tariffs
// ----------------------------------------------------------------------------
export const listTariffs = asyncHandler(async (req: Request, res: Response) => {
  const { rateType, search } = req.query;
  const items = await masterDataService.listTariffs({
    rateType: rateType as any,
    search: search as string,
  });
  return sendSuccess(req, res, items);
});

export const getTariffById = asyncHandler(async (req: Request, res: Response) => {
  const item = await masterDataService.getTariffById(req.params.id);
  return sendSuccess(req, res, item);
});

export const createTariff = asyncHandler(async (req: Request, res: Response) => {
  const input = createTariffMasterSchema.parse(req.body);
  const created = await masterDataService.createTariff(input, req.auth);
  return sendSuccess(req, res, created, 201);
});

export const updateTariff = asyncHandler(async (req: Request, res: Response) => {
  const input = updateTariffMasterSchema.parse(req.body);
  const updated = await masterDataService.updateTariff(req.params.id, input, req.auth);
  return sendSuccess(req, res, updated);
});

export const deactivateTariff = asyncHandler(async (req: Request, res: Response) => {
  const deactivated = await masterDataService.deactivateTariff(req.params.id, req.auth);
  return sendSuccess(req, res, deactivated);
});

// ----------------------------------------------------------------------------
// Insurance Providers
// ----------------------------------------------------------------------------
export const listInsuranceProviders = asyncHandler(async (req: Request, res: Response) => {
  const { search } = req.query;
  const items = await masterDataService.listInsuranceProviders({
    search: search as string,
  });
  return sendSuccess(req, res, items);
});

export const getInsuranceProviderById = asyncHandler(async (req: Request, res: Response) => {
  const item = await masterDataService.getInsuranceProviderById(req.params.id);
  return sendSuccess(req, res, item);
});

export const createInsuranceProvider = asyncHandler(async (req: Request, res: Response) => {
  const input = createInsuranceProviderMasterSchema.parse(req.body);
  const created = await masterDataService.createInsuranceProvider(input, req.auth);
  return sendSuccess(req, res, created, 201);
});

export const updateInsuranceProvider = asyncHandler(async (req: Request, res: Response) => {
  const input = updateInsuranceProviderMasterSchema.parse(req.body);
  const updated = await masterDataService.updateInsuranceProvider(req.params.id, input, req.auth);
  return sendSuccess(req, res, updated);
});

export const deactivateInsuranceProvider = asyncHandler(async (req: Request, res: Response) => {
  const deactivated = await masterDataService.deactivateInsuranceProvider(req.params.id, req.auth);
  return sendSuccess(req, res, deactivated);
});

// ----------------------------------------------------------------------------
// Government Schemes
// ----------------------------------------------------------------------------
export const listSchemes = asyncHandler(async (req: Request, res: Response) => {
  const { search } = req.query;
  const items = await masterDataService.listSchemes({
    search: search as string,
  });
  return sendSuccess(req, res, items);
});

export const getSchemeById = asyncHandler(async (req: Request, res: Response) => {
  const item = await masterDataService.getSchemeById(req.params.id);
  return sendSuccess(req, res, item);
});

export const createScheme = asyncHandler(async (req: Request, res: Response) => {
  const input = createGovernmentSchemeMasterSchema.parse(req.body);
  const created = await masterDataService.createScheme(input, req.auth);
  return sendSuccess(req, res, created, 201);
});

export const updateScheme = asyncHandler(async (req: Request, res: Response) => {
  const input = updateGovernmentSchemeMasterSchema.parse(req.body);
  const updated = await masterDataService.updateScheme(req.params.id, input, req.auth);
  return sendSuccess(req, res, updated);
});

export const deactivateScheme = asyncHandler(async (req: Request, res: Response) => {
  const deactivated = await masterDataService.deactivateScheme(req.params.id, req.auth);
  return sendSuccess(req, res, deactivated);
});
