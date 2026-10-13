import { Router } from 'express';
import {
  listRoles,
  getRolesById,
  createRoles,
} from './roles.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const rolesRouter = Router();

rolesRouter.get('/', listRoles);
rolesRouter.get('/:id', getRolesById);
rolesRouter.post('/', idempotencyMiddleware(), createRoles);
