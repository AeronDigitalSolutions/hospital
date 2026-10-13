import { Router } from 'express';
import {
  listEncounters,
  getEncounterById,
  createEncounter,
  updateEncounter,
} from './encounters.controller.js';
import { idempotencyMiddleware } from '../../middleware/idempotency.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import {
  createEncounterSchema,
  updateEncounterSchema,
  encounterSearchSchema,
} from '@chikitsaalye/validation';
import { authenticate } from '../../middleware/auth.js';

export const encountersRouter = Router();

// List & search encounters
encountersRouter.get('/', authenticate(true), validateQuery(encounterSearchSchema), listEncounters);

// Create new encounter
encountersRouter.post(
  '/',
  authenticate(true),
  idempotencyMiddleware(),
  validateBody(createEncounterSchema),
  createEncounter
);

// Get single encounter
encountersRouter.get('/:id', authenticate(true), getEncounterById);

// Update / status transition encounter
encountersRouter.patch(
  '/:id',
  authenticate(true),
  validateBody(updateEncounterSchema),
  updateEncounter
);
