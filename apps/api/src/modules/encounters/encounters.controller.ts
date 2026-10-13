import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendPaginated } from '../../middleware/response-envelope.js';
import { encountersService } from './encounters.service.js';

export async function listEncounters(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await encountersService.searchEncounters(req.query as any);
    return sendPaginated(req, res, result);
  } catch (err) {
    return next(err);
  }
}

export async function getEncounterById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const encounter = await encountersService.getEncounterById(id, req.auth);
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
