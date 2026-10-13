import { Router } from 'express';
import {
  listEmergency,
  getEmergencyById,
  createEmergency,
} from './emergency.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const emergencyRouter = Router();

emergencyRouter.get('/', listEmergency);
emergencyRouter.get('/:id', getEmergencyById);
emergencyRouter.post('/', idempotencyMiddleware(), createEmergency);
