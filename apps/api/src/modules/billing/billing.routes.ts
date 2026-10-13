import { Router } from 'express';
import {
  listBilling,
  getBillingById,
  createBilling,
} from './billing.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const billingRouter = Router();

billingRouter.get('/', listBilling);
billingRouter.get('/:id', getBillingById);
billingRouter.post('/', idempotencyMiddleware(), createBilling);
