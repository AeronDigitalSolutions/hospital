import { Router } from 'express';
import {
  listIpd,
  getIpdById,
  createIpd,
} from './ipd.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const ipdRouter = Router();

ipdRouter.get('/', listIpd);
ipdRouter.get('/:id', getIpdById);
ipdRouter.post('/', idempotencyMiddleware(), createIpd);
