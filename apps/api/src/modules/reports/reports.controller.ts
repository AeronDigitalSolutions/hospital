import { Request, Response } from 'express';
import { sendSuccess, sendPaginated } from '../../middleware/response-envelope.js';

export async function listReports(req: Request, res: Response) {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;

  return sendPaginated(req, res, {
    items: [],
    total: 0,
    page,
    pageSize,
    totalPages: 0,
  });
}

export async function getReportsById(req: Request, res: Response) {
  const { id } = req.params;
  return sendSuccess(req, res, {
    id,
    module: 'reports',
    name: 'Operational & Regulatory Reports',
    status: 'FOUNDATION_ESTABLISHED',
  });
}

export async function createReports(req: Request, res: Response) {
  return sendSuccess(
    req,
    res,
    {
      module: 'reports',
      status: 'ACCEPTED',
      message: 'Operational & Regulatory Reports architectural boundary established. Business logic scheduled in subsequent CODEx phases.',
    },
    201
  );
}
