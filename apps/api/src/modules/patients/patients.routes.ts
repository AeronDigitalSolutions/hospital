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
import { authenticate } from '../../middleware/auth.js';

export const patientsRouter = Router();

// Duplicate check
patientsRouter.post('/check-duplicates', validateBody(checkDuplicateSchema), checkDuplicates);

// List & Search
patientsRouter.get('/', authenticate(true), validateQuery(patientSearchSchema), listPatients);

// Register New Patient
patientsRouter.post(
  '/',
  authenticate(true),
  idempotencyMiddleware(),
  validateBody(createPatientSchema),
  createPatient
);

// Patient 360 View
patientsRouter.get('/:id/360', authenticate(true), getPatient360);

// Single Patient Lookup
patientsRouter.get('/:id', authenticate(true), getPatientById);

// Update Patient Demographics
patientsRouter.patch('/:id', authenticate(true), validateBody(updatePatientSchema), updatePatient);
