import { Router } from 'express';
import {
  listOpd,
  getOpdById,
  createOpd,
} from './opd.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const opdRouter = Router();

opdRouter.get('/', listOpd);
opdRouter.get('/:id', getOpdById);
opdRouter.post('/', idempotencyMiddleware(), createOpd);
