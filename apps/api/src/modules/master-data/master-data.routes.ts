import { Router } from 'express';
import {
  getMasterDataSummary,
  listDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deactivateDepartment,
  listSubdepartments,
  getSubdepartmentById,
  createSubdepartment,
  updateSubdepartment,
  deactivateSubdepartment,
  listStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deactivateStaff,
  listDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deactivateDoctor,
  listWards,
  getWardById,
  createWard,
  updateWard,
  deactivateWard,
  listRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deactivateRoom,
  listBeds,
  getBedById,
  createBed,
  updateBed,
  updateBedStatus,
  deactivateBed,
  listServices,
  getServiceById,
  createService,
  updateService,
  deactivateService,
  listInvestigations,
  getInvestigationById,
  createInvestigation,
  updateInvestigation,
  deactivateInvestigation,
  listMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deactivateMedicine,
  listDiagnoses,
  getDiagnosisById,
  createDiagnosis,
  updateDiagnosis,
  deactivateDiagnosis,
  listProcedures,
  getProcedureById,
  createProcedure,
  updateProcedure,
  deactivateProcedure,
  listTariffs,
  getTariffById,
  createTariff,
  updateTariff,
  deactivateTariff,
  listInsuranceProviders,
  getInsuranceProviderById,
  createInsuranceProvider,
  updateInsuranceProvider,
  deactivateInsuranceProvider,
  listSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  deactivateScheme,
} from './master-data.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const masterDataRouter = Router();

// ----------------------------------------------------------------------------
// Summary & Metrics
// ----------------------------------------------------------------------------
masterDataRouter.get('/summary', authenticate(), requirePermission('MASTER_DATA.READ'), getMasterDataSummary);

// ----------------------------------------------------------------------------
// Departments
// ----------------------------------------------------------------------------
masterDataRouter.get('/departments', authenticate(), requirePermission('MASTER_DATA.READ'), listDepartments);
masterDataRouter.get('/departments/:id', authenticate(), requirePermission('MASTER_DATA.READ'), getDepartmentById);
masterDataRouter.post(
  '/departments',
  authenticate(),
  requirePermission('MASTER_DATA.CREATE'),
  idempotencyMiddleware(),
  createDepartment
);
masterDataRouter.patch('/departments/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateDepartment);
masterDataRouter.put('/departments/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateDepartment);
masterDataRouter.delete('/departments/:id', authenticate(), requirePermission('MASTER_DATA.DEACTIVATE'), deactivateDepartment);

// ----------------------------------------------------------------------------
// Subdepartments
// ----------------------------------------------------------------------------
masterDataRouter.get('/subdepartments', authenticate(), requirePermission('MASTER_DATA.READ'), listSubdepartments);
masterDataRouter.get('/subdepartments/:id', authenticate(), requirePermission('MASTER_DATA.READ'), getSubdepartmentById);
masterDataRouter.post(
  '/subdepartments',
  authenticate(),
  requirePermission('MASTER_DATA.CREATE'),
  idempotencyMiddleware(),
  createSubdepartment
);
masterDataRouter.patch('/subdepartments/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateSubdepartment);
masterDataRouter.put('/subdepartments/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateSubdepartment);
masterDataRouter.delete('/subdepartments/:id', authenticate(), requirePermission('MASTER_DATA.DEACTIVATE'), deactivateSubdepartment);

// ----------------------------------------------------------------------------
// Staff Profiles
// ----------------------------------------------------------------------------
masterDataRouter.get('/staff', authenticate(), requirePermission('MASTER_DATA.READ'), listStaff);
masterDataRouter.get('/staff/:id', authenticate(), requirePermission('MASTER_DATA.READ'), getStaffById);
masterDataRouter.post(
  '/staff',
  authenticate(),
  requirePermission('MASTER_DATA.CREATE'),
  idempotencyMiddleware(),
  createStaff
);
masterDataRouter.patch('/staff/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateStaff);
masterDataRouter.put('/staff/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateStaff);
masterDataRouter.delete('/staff/:id', authenticate(), requirePermission('MASTER_DATA.DEACTIVATE'), deactivateStaff);

// ----------------------------------------------------------------------------
// Doctors
// ----------------------------------------------------------------------------
masterDataRouter.get('/doctors', authenticate(), requirePermission('MASTER_DATA.READ'), listDoctors);
masterDataRouter.get('/doctors/:id', authenticate(), requirePermission('MASTER_DATA.READ'), getDoctorById);
masterDataRouter.post(
  '/doctors',
  authenticate(),
  requirePermission('MASTER_DATA.CREATE'),
  idempotencyMiddleware(),
  createDoctor
);
masterDataRouter.patch('/doctors/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateDoctor);
masterDataRouter.put('/doctors/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateDoctor);
masterDataRouter.delete('/doctors/:id', authenticate(), requirePermission('MASTER_DATA.DEACTIVATE'), deactivateDoctor);

// ----------------------------------------------------------------------------
// Wards
// ----------------------------------------------------------------------------
masterDataRouter.get('/wards', authenticate(), requirePermission('MASTER_DATA.READ'), listWards);
masterDataRouter.get('/wards/:id', authenticate(), requirePermission('MASTER_DATA.READ'), getWardById);
masterDataRouter.post(
  '/wards',
  authenticate(),
  requirePermission('MASTER_DATA.CREATE'),
  idempotencyMiddleware(),
  createWard
);
masterDataRouter.patch('/wards/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateWard);
masterDataRouter.put('/wards/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateWard);
masterDataRouter.delete('/wards/:id', authenticate(), requirePermission('MASTER_DATA.DEACTIVATE'), deactivateWard);

// ----------------------------------------------------------------------------
// Rooms
// ----------------------------------------------------------------------------
masterDataRouter.get('/rooms', authenticate(), requirePermission('MASTER_DATA.READ'), listRooms);
masterDataRouter.get('/rooms/:id', authenticate(), requirePermission('MASTER_DATA.READ'), getRoomById);
masterDataRouter.post(
  '/rooms',
  authenticate(),
  requirePermission('MASTER_DATA.CREATE'),
  idempotencyMiddleware(),
  createRoom
);
masterDataRouter.patch('/rooms/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateRoom);
masterDataRouter.put('/rooms/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateRoom);
masterDataRouter.delete('/rooms/:id', authenticate(), requirePermission('MASTER_DATA.DEACTIVATE'), deactivateRoom);

// ----------------------------------------------------------------------------
// Beds & Status Transitions
// ----------------------------------------------------------------------------
masterDataRouter.get('/beds', authenticate(), requirePermission('MASTER_DATA.READ'), listBeds);
masterDataRouter.get('/beds/:id', authenticate(), requirePermission('MASTER_DATA.READ'), getBedById);
masterDataRouter.post(
  '/beds',
  authenticate(),
  requirePermission('MASTER_DATA.CREATE'),
  idempotencyMiddleware(),
  createBed
);
masterDataRouter.patch('/beds/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateBed);
masterDataRouter.put('/beds/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateBed);
masterDataRouter.patch('/beds/:id/status', authenticate(), requirePermission('BED.STATUS_UPDATE'), updateBedStatus);
masterDataRouter.delete('/beds/:id', authenticate(), requirePermission('MASTER_DATA.DEACTIVATE'), deactivateBed);

// ----------------------------------------------------------------------------
// Services
// ----------------------------------------------------------------------------
masterDataRouter.get('/services', authenticate(), requirePermission('MASTER_DATA.READ'), listServices);
masterDataRouter.get('/services/:id', authenticate(), requirePermission('MASTER_DATA.READ'), getServiceById);
masterDataRouter.post(
  '/services',
  authenticate(),
  requirePermission('MASTER_DATA.CREATE'),
  idempotencyMiddleware(),
  createService
);
masterDataRouter.patch('/services/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateService);
masterDataRouter.put('/services/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateService);
masterDataRouter.delete('/services/:id', authenticate(), requirePermission('MASTER_DATA.DEACTIVATE'), deactivateService);

// ----------------------------------------------------------------------------
// Investigations
// ----------------------------------------------------------------------------
masterDataRouter.get('/investigations', authenticate(), requirePermission('MASTER_DATA.READ'), listInvestigations);
masterDataRouter.get('/investigations/:id', authenticate(), requirePermission('MASTER_DATA.READ'), getInvestigationById);
masterDataRouter.post(
  '/investigations',
  authenticate(),
  requirePermission('MASTER_DATA.CREATE'),
  idempotencyMiddleware(),
  createInvestigation
);
masterDataRouter.patch('/investigations/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateInvestigation);
masterDataRouter.put('/investigations/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateInvestigation);
masterDataRouter.delete('/investigations/:id', authenticate(), requirePermission('MASTER_DATA.DEACTIVATE'), deactivateInvestigation);

// ----------------------------------------------------------------------------
// Medicines
// ----------------------------------------------------------------------------
masterDataRouter.get('/medicines', authenticate(), requirePermission('MASTER_DATA.READ'), listMedicines);
masterDataRouter.get('/medicines/:id', authenticate(), requirePermission('MASTER_DATA.READ'), getMedicineById);
masterDataRouter.post(
  '/medicines',
  authenticate(),
  requirePermission('MASTER_DATA.CREATE'),
  idempotencyMiddleware(),
  createMedicine
);
masterDataRouter.patch('/medicines/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateMedicine);
masterDataRouter.put('/medicines/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateMedicine);
masterDataRouter.delete('/medicines/:id', authenticate(), requirePermission('MASTER_DATA.DEACTIVATE'), deactivateMedicine);

// ----------------------------------------------------------------------------
// Diagnoses
// ----------------------------------------------------------------------------
masterDataRouter.get('/diagnoses', authenticate(), requirePermission('MASTER_DATA.READ'), listDiagnoses);
masterDataRouter.get('/diagnoses/:id', authenticate(), requirePermission('MASTER_DATA.READ'), getDiagnosisById);
masterDataRouter.post(
  '/diagnoses',
  authenticate(),
  requirePermission('MASTER_DATA.CREATE'),
  idempotencyMiddleware(),
  createDiagnosis
);
masterDataRouter.patch('/diagnoses/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateDiagnosis);
masterDataRouter.put('/diagnoses/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateDiagnosis);
masterDataRouter.delete('/diagnoses/:id', authenticate(), requirePermission('MASTER_DATA.DEACTIVATE'), deactivateDiagnosis);

// ----------------------------------------------------------------------------
// Procedures
// ----------------------------------------------------------------------------
masterDataRouter.get('/procedures', authenticate(), requirePermission('MASTER_DATA.READ'), listProcedures);
masterDataRouter.get('/procedures/:id', authenticate(), requirePermission('MASTER_DATA.READ'), getProcedureById);
masterDataRouter.post(
  '/procedures',
  authenticate(),
  requirePermission('MASTER_DATA.CREATE'),
  idempotencyMiddleware(),
  createProcedure
);
masterDataRouter.patch('/procedures/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateProcedure);
masterDataRouter.put('/procedures/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateProcedure);
masterDataRouter.delete('/procedures/:id', authenticate(), requirePermission('MASTER_DATA.DEACTIVATE'), deactivateProcedure);

// ----------------------------------------------------------------------------
// Tariffs
// ----------------------------------------------------------------------------
masterDataRouter.get('/tariffs', authenticate(), requirePermission('MASTER_DATA.READ'), listTariffs);
masterDataRouter.get('/tariffs/:id', authenticate(), requirePermission('MASTER_DATA.READ'), getTariffById);
masterDataRouter.post(
  '/tariffs',
  authenticate(),
  requirePermission('TARIFF.MANAGE'),
  idempotencyMiddleware(),
  createTariff
);
masterDataRouter.patch('/tariffs/:id', authenticate(), requirePermission('TARIFF.MANAGE'), updateTariff);
masterDataRouter.put('/tariffs/:id', authenticate(), requirePermission('TARIFF.MANAGE'), updateTariff);
masterDataRouter.delete('/tariffs/:id', authenticate(), requirePermission('TARIFF.MANAGE'), deactivateTariff);

// ----------------------------------------------------------------------------
// Insurance Providers
// ----------------------------------------------------------------------------
masterDataRouter.get('/insurance-providers', authenticate(), requirePermission('MASTER_DATA.READ'), listInsuranceProviders);
masterDataRouter.get('/insurance-providers/:id', authenticate(), requirePermission('MASTER_DATA.READ'), getInsuranceProviderById);
masterDataRouter.post(
  '/insurance-providers',
  authenticate(),
  requirePermission('MASTER_DATA.CREATE'),
  idempotencyMiddleware(),
  createInsuranceProvider
);
masterDataRouter.patch('/insurance-providers/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateInsuranceProvider);
masterDataRouter.put('/insurance-providers/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateInsuranceProvider);
masterDataRouter.delete('/insurance-providers/:id', authenticate(), requirePermission('MASTER_DATA.DEACTIVATE'), deactivateInsuranceProvider);

// ----------------------------------------------------------------------------
// Government Schemes
// ----------------------------------------------------------------------------
masterDataRouter.get('/schemes', authenticate(), requirePermission('MASTER_DATA.READ'), listSchemes);
masterDataRouter.get('/schemes/:id', authenticate(), requirePermission('MASTER_DATA.READ'), getSchemeById);
masterDataRouter.post(
  '/schemes',
  authenticate(),
  requirePermission('MASTER_DATA.CREATE'),
  idempotencyMiddleware(),
  createScheme
);
masterDataRouter.patch('/schemes/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateScheme);
masterDataRouter.put('/schemes/:id', authenticate(), requirePermission('MASTER_DATA.UPDATE'), updateScheme);
masterDataRouter.delete('/schemes/:id', authenticate(), requirePermission('MASTER_DATA.DEACTIVATE'), deactivateScheme);
