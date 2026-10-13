import { Request, Response } from 'express';
import { sendSuccess, sendPaginated } from '../../middleware/response-envelope.js';
import { NotFoundError } from '../../middleware/errors.js';

export async function listPatients(req: Request, res: Response) {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;

  // Stub response - schema & business logic to be implemented in CODEx-002
  return sendPaginated(req, res, {
    items: [],
    total: 0,
    page,
    pageSize,
    totalPages: 0,
  });
}

export async function getPatientById(req: Request, res: Response) {
  const { id } = req.params;
  // Patient lookup stub
  return sendSuccess(req, res, {
    id,
    status: 'NOT_LOADED',
    message: 'Patient Master & 360 foundation to be built in CODEx-002',
  });
}

export async function createPatient(req: Request, res: Response) {
  return sendSuccess(
    req,
    res,
    {
      id: 'pat_stub_001',
      message: 'Patient registration foundation established. Full MPI schema in CODEx-002.',
    },
    201
  );
}
