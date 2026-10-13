import { Request, Response } from 'express';
import { sendSuccess, sendPaginated } from '../../middleware/response-envelope.js';

export async function listMasterData(req: Request, res: Response) {
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

export async function getMasterDataById(req: Request, res: Response) {
  const { id } = req.params;
  return sendSuccess(req, res, {
    id,
    module: 'master-data',
    name: 'Master Data & Clinical Taxonomies',
    status: 'FOUNDATION_ESTABLISHED',
  });
}

export async function createMasterData(req: Request, res: Response) {
  return sendSuccess(
    req,
    res,
    {
      module: 'master-data',
      status: 'ACCEPTED',
      message: 'Master Data & Clinical Taxonomies architectural boundary established. Business logic scheduled in subsequent CODEx phases.',
    },
    201
  );
}
