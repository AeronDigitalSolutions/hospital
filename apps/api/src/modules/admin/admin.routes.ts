import { Router } from 'express';
import {
  listAdmin,
  getAdminById,
  createAdmin,
  getAuditLogs,
} from './admin.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';
import { authenticate, requirePermission } from '../../middleware/auth.js';

import { masterDataRouter } from '../master-data/index.js';

export const adminRouter = Router();

// Governance & Operations
adminRouter.get('/', authenticate(), requirePermission('ADMIN.ACCESS'), listAdmin);
adminRouter.get('/audit', authenticate(), requirePermission('AUDIT.READ'), getAuditLogs);
adminRouter.get('/:id', authenticate(), requirePermission('ADMIN.ACCESS'), getAdminById);
adminRouter.post('/', authenticate(), requirePermission('ADMIN.ACCESS'), idempotencyMiddleware(), createAdmin);

// Master Data Management alias
adminRouter.use('/master-data', masterDataRouter);
