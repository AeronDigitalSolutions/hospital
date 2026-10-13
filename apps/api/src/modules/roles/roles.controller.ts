import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../middleware/response-envelope.js';
import { NotFoundError } from '../../middleware/errors.js';
import { authService } from '../auth/auth.service.js';

export async function listRoles(req: Request, res: Response, next: NextFunction) {
  try {
    const roles = await authService.listRoles();
    return sendSuccess(req, res, roles);
  } catch (err) {
    return next(err);
  }
}

export async function getRoleById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const role = await authService.getRoleByCode(id.toUpperCase());
    if (!role) {
      throw new NotFoundError(`Role '${id}' not found`);
    }

    return sendSuccess(req, res, role);
  } catch (err) {
    return next(err);
  }
}

export async function updateRolePermissions(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    const actorId = req.auth?.userId || 'system';

    const updated = await authService.updateRolePermissions(id.toUpperCase(), permissions, {
      actorId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      requestId: req.requestId,
    });

    return sendSuccess(req, res, updated);
  } catch (err) {
    return next(err);
  }
}
