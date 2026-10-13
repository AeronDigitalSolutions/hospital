import { Router } from 'express';
import {
  listNursing,
  getNursingById,
  createNursing,
} from './nursing.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const nursingRouter = Router();

nursingRouter.get('/', listNursing);
nursingRouter.get('/:id', getNursingById);
nursingRouter.post('/', idempotencyMiddleware(), createNursing);
