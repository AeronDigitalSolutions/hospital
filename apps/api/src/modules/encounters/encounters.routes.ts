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
import { authenticate, requirePermission } from '../../middleware/auth.js';

export const encountersRouter = Router();

// List & search encounters (Requires ENCOUNTER.READ or PATIENT role)
encountersRouter.get(
  '/',
  authenticate(),
  (req, res, next) => {
    if (req.auth?.roles.includes('PATIENT')) return next();
    return requirePermission('ENCOUNTER.READ')(req, res, next);
  },
  validateQuery(encounterSearchSchema),
  listEncounters
);

// Create new encounter (Requires ENCOUNTER.CREATE)
encountersRouter.post(
  '/',
  authenticate(),
  requirePermission('ENCOUNTER.CREATE'),
  idempotencyMiddleware(),
  validateBody(createEncounterSchema),
  createEncounter
);

// Get single encounter (Requires ENCOUNTER.READ or Patient Ownership)
encountersRouter.get(
  '/:id',
  authenticate(),
  (req, res, next) => {
    if (req.auth?.roles.includes('PATIENT')) return next();
    return requirePermission('ENCOUNTER.READ')(req, res, next);
  },
  getEncounterById
);

// Update / status transition encounter (Requires ENCOUNTER.UPDATE)
encountersRouter.patch(
  '/:id',
  authenticate(),
  requirePermission('ENCOUNTER.UPDATE'),
  validateBody(updateEncounterSchema),
  updateEncounter
);
