import { Request, Response } from 'express';
import { sendSuccess, sendPaginated } from '../../middleware/response-envelope.js';

export async function listOt(req: Request, res: Response) {
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

export async function getOtById(req: Request, res: Response) {
  const { id } = req.params;
  return sendSuccess(req, res, {
    id,
    module: 'ot',
    name: 'Operation Theatre Management',
    status: 'FOUNDATION_ESTABLISHED',
  });
}

export async function createOt(req: Request, res: Response) {
  return sendSuccess(
    req,
    res,
    {
      module: 'ot',
      status: 'ACCEPTED',
      message: 'Operation Theatre Management architectural boundary established. Business logic scheduled in subsequent CODEx phases.',
    },
    201
  );
}
