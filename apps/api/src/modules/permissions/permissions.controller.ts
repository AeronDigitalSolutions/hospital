import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../middleware/response-envelope.js';
import { authService } from '../auth/auth.service.js';

export async function listPermissions(req: Request, res: Response, next: NextFunction) {
  try {
    const permissions = authService.listPermissions();
    return sendSuccess(req, res, permissions);
  } catch (err) {
    return next(err);
  }
}
