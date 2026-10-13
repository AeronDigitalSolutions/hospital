import { Router } from 'express';
import {
  listAppointments,
  getAppointmentsById,
  createAppointments,
} from './appointments.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const appointmentsRouter = Router();

appointmentsRouter.get('/', listAppointments);
appointmentsRouter.get('/:id', getAppointmentsById);
appointmentsRouter.post('/', idempotencyMiddleware(), createAppointments);
