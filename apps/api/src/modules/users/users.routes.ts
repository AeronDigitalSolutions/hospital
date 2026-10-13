import { Router } from 'express';
import {
  listUsers,
  getUsersById,
  createUsers,
} from './users.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const usersRouter = Router();

usersRouter.get('/', listUsers);
usersRouter.get('/:id', getUsersById);
usersRouter.post('/', idempotencyMiddleware(), createUsers);
