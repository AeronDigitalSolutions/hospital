import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, hasPermission, hasAnyRole } from '@chikitsaalye/auth';
import type { AuthContext } from '@chikitsaalye/types';
import { UnauthorizedError, ForbiddenError } from './errors.js';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export function authenticate(optional = false) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (optional) {
        return next();
      }
      return next(new UnauthorizedError('Missing or malformed Authorization header'));
    }

    const token = authHeader.substring(7).trim();
    try {
      const decoded = verifyAccessToken(token);
      req.auth = {
        userId: decoded.sub,
        email: decoded.email,
        roles: decoded.roles,
        permissions: decoded.permissions,
        department: decoded.department,
        organizationId: decoded.organizationId,
        requestId: req.requestId,
      };
      next();
    } catch (err) {
      if (optional) {
        return next();
      }
      next(new UnauthorizedError('Invalid or expired authentication token'));
    }
  };
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new UnauthorizedError('Authentication required to verify permissions'));
    }

    if (!hasPermission(req.auth, permission)) {
      return next(
        new ForbiddenError(`Forbidden: Clinical role lacks required permission '${permission}'`)
      );
    }

    next();
  };
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new UnauthorizedError('Authentication required to verify role'));
    }

    if (!hasAnyRole(req.auth, roles)) {
      return next(
        new ForbiddenError(`Forbidden: User does not possess an authorized role (${roles.join(', ')})`)
      );
    }

    next();
  };
}
