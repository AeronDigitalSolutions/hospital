import { Router } from 'express';
import { listPatients, getPatientById, createPatient } from './patients.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const patientsRouter = Router();

patientsRouter.get('/', listPatients);
patientsRouter.get('/:id', getPatientById);
patientsRouter.post('/', idempotencyMiddleware(), createPatient);
