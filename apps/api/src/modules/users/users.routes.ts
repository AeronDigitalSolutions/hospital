import { Router } from 'express';
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  assignRoles,
} from './users.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';
import { validateBody } from '../../middleware/validate.js';
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from '@chikitsaalye/validation';
import { authenticate, requirePermission } from '../../middleware/auth.js';

export const usersRouter = Router();

// List Users (Requires USER.READ)
usersRouter.get('/', authenticate(), requirePermission('USER.READ'), listUsers);

// Get User by ID (Requires USER.READ)
usersRouter.get('/:id', authenticate(), requirePermission('USER.READ'), getUserById);

// Create New User (Requires USER.CREATE)
usersRouter.post(
  '/',
  authenticate(),
  requirePermission('USER.CREATE'),
  idempotencyMiddleware(),
  validateBody(createUserSchema),
  createUser
);

// Update User (Requires USER.UPDATE)
usersRouter.patch(
  '/:id',
  authenticate(),
  requirePermission('USER.UPDATE'),
  validateBody(updateUserSchema),
  updateUser
);

// Update User Status - Activate / Suspend / Disable (Requires USER.STATUS_CHANGE or USER.UPDATE)
usersRouter.patch(
  '/:id/status',
  authenticate(),
  requirePermission('USER.STATUS_CHANGE'),
  validateBody(updateUserStatusSchema),
  updateUserStatus
);

// Assign Roles to User (Requires ROLE.MANAGE)
usersRouter.post('/:id/roles', authenticate(), requirePermission('ROLE.MANAGE'), assignRoles);
