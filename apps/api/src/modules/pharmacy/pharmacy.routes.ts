import { Router } from 'express';
import {
  listPharmacy,
  getPharmacyById,
  createPharmacy,
} from './pharmacy.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const pharmacyRouter = Router();

pharmacyRouter.get('/', listPharmacy);
pharmacyRouter.get('/:id', getPharmacyById);
pharmacyRouter.post('/', idempotencyMiddleware(), createPharmacy);
