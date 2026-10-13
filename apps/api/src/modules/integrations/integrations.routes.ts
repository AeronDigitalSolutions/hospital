import { Router } from 'express';
import {
  listIntegrations,
  getIntegrationsById,
  createIntegrations,
} from './integrations.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const integrationsRouter = Router();

integrationsRouter.get('/', listIntegrations);
integrationsRouter.get('/:id', getIntegrationsById);
integrationsRouter.post('/', idempotencyMiddleware(), createIntegrations);
