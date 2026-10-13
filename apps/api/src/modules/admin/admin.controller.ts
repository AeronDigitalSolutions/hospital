import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendPaginated } from '../../middleware/response-envelope.js';
import { auditService } from '../../services/audit.service.js';

export async function listAdmin(req: Request, res: Response) {
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

export async function getAdminById(req: Request, res: Response) {
  const { id } = req.params;
  return sendSuccess(req, res, {
    id,
    module: 'admin',
    name: 'Hospital Administration & Governance',
    status: 'ACTIVE',
  });
}

export async function createAdmin(req: Request, res: Response) {
  return sendSuccess(
    req,
    res,
    {
      module: 'admin',
      status: 'ACCEPTED',
      message: 'Hospital Administration & Governance operational.',
    },
    201
  );
}

export async function getAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const resource = req.query.resource as string | undefined;
    const resourceId = req.query.resourceId as string | undefined;
    const actorId = req.query.actorId as string | undefined;

    const events = await auditService.queryEvents({ resource, resourceId, actorId });
    return sendSuccess(req, res, events);
  } catch (err) {
    return next(err);
  }
}
