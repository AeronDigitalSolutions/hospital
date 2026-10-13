import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendPaginated } from '../../middleware/response-envelope.js';
import { NotFoundError, ForbiddenError } from '../../middleware/errors.js';
import { patientsService } from './patients.service.js';

export async function listPatients(req: Request, res: Response, next: NextFunction) {
  try {
    // If authenticated user has only the PATIENT role, scope search strictly to their own record
    if (req.auth?.roles.includes('PATIENT') && !req.auth.roles.some((r) => r !== 'PATIENT')) {
      if (!req.auth.patientId) {
        return sendPaginated(req, res, { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 });
      }
      const ownPatient = await patientsService.getPatientById(req.auth.patientId, req.auth);
      const items = ownPatient ? [ownPatient] : [];
      return sendPaginated(req, res, { items, total: items.length, page: 1, pageSize: 20, totalPages: 1 });
    }

    const result = await patientsService.searchPatients(req.query as any, req.auth);
    return sendPaginated(req, res, result);
  } catch (err) {
    return next(err);
  }
}

export async function getPatientById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const patient = await patientsService.getPatientById(id, req.auth);
    if (!patient) {
      throw new NotFoundError(`Patient '${id}' not found`);
    }

    // Patient ownership verification
    if (req.auth?.roles.includes('PATIENT') && !req.auth.roles.some((r) => r !== 'PATIENT')) {
      if (patient.id !== req.auth.patientId && patient.uhid !== req.auth.patientId) {
        throw new ForbiddenError('Forbidden: Patients are only permitted to access their own clinical records');
      }
    }

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
    const duplicates = await patientsService.checkDuplicates(req.body, req.auth);
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
    if (!patient360) {
      throw new NotFoundError(`Patient '${id}' not found`);
    }

    // Patient ownership verification
    if (req.auth?.roles.includes('PATIENT') && !req.auth.roles.some((r) => r !== 'PATIENT')) {
      const patientRecord = (patient360 as any).patient || patient360;
      if (patientRecord.id !== req.auth.patientId && patientRecord.uhid !== req.auth.patientId) {
        throw new ForbiddenError('Forbidden: Patients are only permitted to access their own clinical records');
      }
    }

    return sendSuccess(req, res, patient360);
  } catch (err) {
    return next(err);
  }
}

export async function getPatientTimeline(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const timeline = await patientsService.getPatientTimeline(id, req.auth);
    return sendSuccess(req, res, timeline);
  } catch (err) {
    return next(err);
  }
}
