import { Router } from 'express';
import {
  listEncounters,
  getEncountersById,
  createEncounters,
} from './encounters.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const encountersRouter = Router();

encountersRouter.get('/', listEncounters);
encountersRouter.get('/:id', getEncountersById);
encountersRouter.post('/', idempotencyMiddleware(), createEncounters);
