import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../middleware/response-envelope.js';
import { UnauthorizedError } from '../../middleware/errors.js';
import { authService } from './auth.service.js';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { usernameOrEmail, password } = req.body;
    const result = await authService.login(usernameOrEmail, password, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      requestId: req.requestId,
    });

    return sendSuccess(req, res, result);
  } catch (err) {
    return next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.header('authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';

    await authService.logout(token, {
      userId: req.auth?.userId,
      sessionId: req.auth?.sessionId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      requestId: req.requestId,
    });

    return sendSuccess(req, res, { message: 'Logged out successfully. Session invalidated.' });
  } catch (err) {
    return next(err);
  }
}

export async function getCurrentUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = authService.getUser(req.auth.userId);

    return sendSuccess(req, res, {
      user: {
        id: req.auth.userId,
        username: req.auth.username,
        email: req.auth.email,
        fullName: user?.fullName || req.auth.username,
        roles: req.auth.roles,
        permissions: req.auth.permissions,
        status: req.auth.status,
        department: req.auth.department,
        patientId: req.auth.patientId,
        organizationId: req.auth.organizationId,
      },
    });
  } catch (err) {
    return next(err);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken: tokenStr } = req.body;
    const tokens = await authService.refreshToken(tokenStr, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      requestId: req.requestId,
    });

    return sendSuccess(req, res, tokens);
  } catch (err) {
    return next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) {
      throw new UnauthorizedError('Authentication required');
    }

    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.auth.userId, currentPassword, newPassword, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      requestId: req.requestId,
    });

    return sendSuccess(req, res, { message: 'Password changed successfully. Please log in again.' });
  } catch (err) {
    return next(err);
  }
}
