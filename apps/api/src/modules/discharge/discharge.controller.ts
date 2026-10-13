import { Request, Response } from 'express';
import { sendSuccess, sendPaginated } from '../../middleware/response-envelope.js';

export async function listDischarge(req: Request, res: Response) {
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

export async function getDischargeById(req: Request, res: Response) {
  const { id } = req.params;
  return sendSuccess(req, res, {
    id,
    module: 'discharge',
    name: 'Discharge Planning & Summaries',
    status: 'FOUNDATION_ESTABLISHED',
  });
}

export async function createDischarge(req: Request, res: Response) {
  return sendSuccess(
    req,
    res,
    {
      module: 'discharge',
      status: 'ACCEPTED',
      message: 'Discharge Planning & Summaries architectural boundary established. Business logic scheduled in subsequent CODEx phases.',
    },
    201
  );
}
