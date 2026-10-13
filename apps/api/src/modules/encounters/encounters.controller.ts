import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendPaginated } from '../../middleware/response-envelope.js';
import { NotFoundError, ForbiddenError } from '../../middleware/errors.js';
import { encountersService } from './encounters.service.js';

export async function listEncounters(req: Request, res: Response, next: NextFunction) {
  try {
    const query = { ...req.query } as any;

    // Scope queries for users who are solely patients
    if (req.auth?.roles.includes('PATIENT') && !req.auth.roles.some((r) => r !== 'PATIENT')) {
      query.patientId = req.auth.patientId || 'none';
    }

    const result = await encountersService.searchEncounters(query);
    return sendPaginated(req, res, result);
  } catch (err) {
    return next(err);
  }
}

export async function getEncounterById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const encounter = await encountersService.getEncounterById(id, req.auth);
    if (!encounter) {
      throw new NotFoundError(`Encounter '${id}' not found`);
    }

    // Verify patient ownership
    if (req.auth?.roles.includes('PATIENT') && !req.auth.roles.some((r) => r !== 'PATIENT')) {
      if (encounter.patientId !== req.auth.patientId) {
        throw new ForbiddenError('Forbidden: Patients are only permitted to access their own clinical encounters');
      }
    }

    return sendSuccess(req, res, encounter);
  } catch (err) {
    return next(err);
  }
}

export async function createEncounter(req: Request, res: Response, next: NextFunction) {
  try {
    const encounter = await encountersService.createEncounter(req.body, req.auth);
    return sendSuccess(req, res, encounter, 201);
  } catch (err) {
    return next(err);
  }
}

export async function updateEncounter(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updated = await encountersService.updateEncounter(id, req.body, req.auth);
    return sendSuccess(req, res, updated);
  } catch (err) {
    return next(err);
  }
}
