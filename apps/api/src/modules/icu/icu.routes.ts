import { Router } from 'express';
import {
  listIcu,
  getIcuById,
  createIcu,
} from './icu.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const icuRouter = Router();

icuRouter.get('/', listIcu);
icuRouter.get('/:id', getIcuById);
icuRouter.post('/', idempotencyMiddleware(), createIcu);
