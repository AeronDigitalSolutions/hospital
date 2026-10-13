import { Router } from 'express';
import {
  listNotifications,
  getNotificationsById,
  createNotifications,
} from './notifications.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const notificationsRouter = Router();

notificationsRouter.get('/', listNotifications);
notificationsRouter.get('/:id', getNotificationsById);
notificationsRouter.post('/', idempotencyMiddleware(), createNotifications);
