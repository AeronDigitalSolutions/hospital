import { Router } from 'express';
import { listPermissions } from './permissions.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.js';

export const permissionsRouter = Router();

// List Permissions Catalogue (Requires PERMISSION.READ or ROLE.READ)
permissionsRouter.get('/', authenticate(), requirePermission('PERMISSION.READ'), listPermissions);
