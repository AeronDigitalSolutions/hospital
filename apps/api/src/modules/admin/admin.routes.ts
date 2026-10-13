import { Router } from 'express';
import {
  listAdmin,
  getAdminById,
  createAdmin,
} from './admin.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const adminRouter = Router();

adminRouter.get('/', listAdmin);
adminRouter.get('/:id', getAdminById);
adminRouter.post('/', idempotencyMiddleware(), createAdmin);
