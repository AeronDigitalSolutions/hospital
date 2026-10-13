import { Router } from 'express';
import {
  listMasterData,
  getMasterDataById,
  createMasterData,
} from './master-data.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';

export const masterDataRouter = Router();

masterDataRouter.get('/', listMasterData);
masterDataRouter.get('/:id', getMasterDataById);
masterDataRouter.post('/', idempotencyMiddleware(), createMasterData);
