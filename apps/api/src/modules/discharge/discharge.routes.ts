import { Router } from 'express';
import {
  listDischarge,
  getDischargeById,
  createDischarge,
} from './discharge.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const dischargeRouter = Router();

dischargeRouter.get('/', listDischarge);
dischargeRouter.get('/:id', getDischargeById);
dischargeRouter.post('/', idempotencyMiddleware(), createDischarge);
