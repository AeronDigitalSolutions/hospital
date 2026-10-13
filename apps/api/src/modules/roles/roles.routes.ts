import { Router } from 'express';
import {
  listRoles,
  getRoleById,
  updateRolePermissions,
} from './roles.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { updateRolePermissionsSchema } from '@chikitsaalye/validation';
import { authenticate, requirePermission } from '../../middleware/auth.js';

export const rolesRouter = Router();

// List Roles (Requires ROLE.READ)
rolesRouter.get('/', authenticate(), requirePermission('ROLE.READ'), listRoles);

// Get Single Role (Requires ROLE.READ)
rolesRouter.get('/:id', authenticate(), requirePermission('ROLE.READ'), getRoleById);

// Update Role Permissions (Requires ROLE.MANAGE)
rolesRouter.put(
  '/:id/permissions',
  authenticate(),
  requirePermission('ROLE.MANAGE'),
  validateBody(updateRolePermissionsSchema),
  updateRolePermissions
);
