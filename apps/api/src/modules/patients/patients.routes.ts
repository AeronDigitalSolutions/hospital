import { Router } from 'express';
import {
  listPatients,
  getPatientById,
  createPatient,
  updatePatient,
  checkDuplicates,
  getPatient360,
} from './patients.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import {
  createPatientSchema,
  updatePatientSchema,
  patientSearchSchema,
  checkDuplicateSchema,
} from '@chikitsaalye/validation';
import {
  authenticate,
  requirePermission,
  requirePatientAccess,
} from '../../middleware/auth.js';

export const patientsRouter = Router();

// Duplicate check (Requires PATIENT.READ)
patientsRouter.post(
  '/check-duplicates',
  authenticate(),
  requirePermission('PATIENT.READ'),
  validateBody(checkDuplicateSchema),
  checkDuplicates
);

// List & Search (Requires PATIENT.READ or PATIENT role scoped to own record)
patientsRouter.get(
  '/',
  authenticate(),
  (req, res, next) => {
    if (req.auth?.roles.includes('PATIENT')) return next();
    return requirePermission('PATIENT.READ')(req, res, next);
  },
  validateQuery(patientSearchSchema),
  listPatients
);

// Register New Patient (Requires PATIENT.CREATE)
patientsRouter.post(
  '/',
  authenticate(),
  requirePermission('PATIENT.CREATE'),
  idempotencyMiddleware(),
  validateBody(createPatientSchema),
  createPatient
);

// Patient 360 View (Requires PATIENT.READ or Patient Ownership)
patientsRouter.get('/:id/360', authenticate(), requirePatientAccess(), getPatient360);

// Single Patient Lookup (Requires PATIENT.READ or Patient Ownership)
patientsRouter.get('/:id', authenticate(), requirePatientAccess(), getPatientById);

// Update Patient Demographics (Requires PATIENT.UPDATE)
patientsRouter.patch(
  '/:id',
  authenticate(),
  requirePermission('PATIENT.UPDATE'),
  validateBody(updatePatientSchema),
  updatePatient
);
