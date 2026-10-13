import { Router } from 'express';
import {
  listAnalytics,
  getAnalyticsById,
  createAnalytics,
} from './analytics.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const analyticsRouter = Router();

analyticsRouter.get('/', listAnalytics);
analyticsRouter.get('/:id', getAnalyticsById);
analyticsRouter.post('/', idempotencyMiddleware(), createAnalytics);
