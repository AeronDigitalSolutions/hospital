import { Router } from 'express';
import {
  listLab,
  getLabById,
  createLab,
} from './lab.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const labRouter = Router();

labRouter.get('/', listLab);
labRouter.get('/:id', getLabById);
labRouter.post('/', idempotencyMiddleware(), createLab);
