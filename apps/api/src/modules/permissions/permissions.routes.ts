import { Router } from 'express';
import {
  listPermissions,
  getPermissionsById,
  createPermissions,
} from './permissions.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const permissionsRouter = Router();

permissionsRouter.get('/', listPermissions);
permissionsRouter.get('/:id', getPermissionsById);
permissionsRouter.post('/', idempotencyMiddleware(), createPermissions);
