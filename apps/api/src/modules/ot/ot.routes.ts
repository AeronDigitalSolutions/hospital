import { Router } from 'express';
import {
  listOt,
  getOtById,
  createOt,
} from './ot.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const otRouter = Router();

otRouter.get('/', listOt);
otRouter.get('/:id', getOtById);
otRouter.post('/', idempotencyMiddleware(), createOt);
