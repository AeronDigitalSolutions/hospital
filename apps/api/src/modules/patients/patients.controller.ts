import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendPaginated } from '../../middleware/response-envelope.js';
import { patientsService } from './patients.service.js';

export async function listPatients(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await patientsService.searchPatients(req.query as any);
    return sendPaginated(req, res, result);
  } catch (err) {
    return next(err);
  }
}

export async function getPatientById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const patient = await patientsService.getPatientById(id, req.auth);
    return sendSuccess(req, res, patient);
  } catch (err) {
    return next(err);
  }
}

export async function createPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const patient = await patientsService.createPatient(req.body, req.auth);
    return sendSuccess(req, res, patient, 201);
  } catch (err) {
    return next(err);
  }
}

export async function updatePatient(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updated = await patientsService.updatePatient(id, req.body, req.auth);
    return sendSuccess(req, res, updated);
  } catch (err) {
    return next(err);
  }
}

export async function checkDuplicates(req: Request, res: Response, next: NextFunction) {
  try {
    const duplicates = await patientsService.checkDuplicates(req.body);
    return sendSuccess(req, res, {
      count: duplicates.length,
      hasDuplicates: duplicates.length > 0,
      candidates: duplicates,
    });
  } catch (err) {
    return next(err);
  }
}

export async function getPatient360(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const patient360 = await patientsService.getPatient360(id, req.auth);
    return sendSuccess(req, res, patient360);
  } catch (err) {
    return next(err);
  }
}
