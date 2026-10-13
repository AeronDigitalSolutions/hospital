import { Router } from 'express';
import {
  listReports,
  getReportsById,
  createReports,
} from './reports.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const reportsRouter = Router();

reportsRouter.get('/', listReports);
reportsRouter.get('/:id', getReportsById);
reportsRouter.post('/', idempotencyMiddleware(), createReports);
