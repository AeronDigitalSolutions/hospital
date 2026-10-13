import { Request, Response } from 'express';
import { sendSuccess } from '../../middleware/response-envelope.js';
import { UnauthorizedError } from '../../middleware/errors.js';

export async function login(req: Request, res: Response) {
  // Stub for auth login endpoint - will be implemented in CODEx-003
  const { usernameOrEmail } = req.body;
  return sendSuccess(req, res, {
    message: 'Authentication service foundation ready. Full credentials verification in CODEx-003.',
    account: usernameOrEmail,
  });
}

export async function getCurrentUser(req: Request, res: Response) {
  if (!req.auth) {
    throw new UnauthorizedError();
  }
  return sendSuccess(req, res, {
    user: req.auth,
  });
}

export async function refreshToken(req: Request, res: Response) {
  return sendSuccess(req, res, {
    message: 'Token refresh foundation established.',
  });
}
