import { Router } from 'express';
import {
  listRadiology,
  getRadiologyById,
  createRadiology,
} from './radiology.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const radiologyRouter = Router();

radiologyRouter.get('/', listRadiology);
radiologyRouter.get('/:id', getRadiologyById);
radiologyRouter.post('/', idempotencyMiddleware(), createRadiology);
