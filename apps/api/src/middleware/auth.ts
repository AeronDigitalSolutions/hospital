import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, hasPermission, hasAnyRole } from '@chikitsaalye/auth';
import type { AuthContext } from '@chikitsaalye/types';
import { UnauthorizedError, ForbiddenError } from './errors.js';
import { authService } from '../modules/auth/auth.service.js';
import { auditService } from '../services/audit.service.js';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

/**
 * Authentication Middleware
 * Enforces valid Bearer JWT tokens, active sessions, and account status
 */
export function authenticate(optional = false) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (optional) {
        return next();
      }
      return next(new UnauthorizedError('Missing or malformed Authorization header'));
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      if (optional) return next();
      return next(new UnauthorizedError('Missing token'));
    }

    try {
      // Check if token was explicitly revoked on logout
      if (authService.isTokenRevoked(token)) {
        return next(new UnauthorizedError('Authentication token has been revoked'));
      }

      const decoded = verifyAccessToken(token);

      // Check session validity if sessionId is present
      if (decoded.sessionId && authService.isSessionRevoked(decoded.sessionId)) {
        return next(new UnauthorizedError('Session has expired or been terminated'));
      }

      // Check account status dynamically
      const currentStatus = authService.getUserStatus(decoded.sub);
      if (currentStatus === 'SUSPENDED' || currentStatus === 'DISABLED') {
        await auditService.logEvent({
          actor: {
            id: decoded.sub,
            type: 'USER',
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
          },
          action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          resource: req.baseUrl + req.path,
          requestId: req.requestId || 'req_unknown',
          metadata: { reason: `Account status is ${currentStatus}` },
        });
        return next(new ForbiddenError(`Forbidden: User account is ${currentStatus.toLowerCase()}`));
      }

      req.auth = {
        userId: decoded.sub,
        username: decoded.username || decoded.email,
        email: decoded.email,
        roles: decoded.roles || [],
        permissions: decoded.permissions || [],
        status: (currentStatus || decoded.status || 'ACTIVE') as any,
        department: decoded.department || null,
        organizationId: decoded.organizationId || 'UPUMS-MAIN',
        patientId: decoded.patientId || null,
        sessionId: decoded.sessionId,
        requestId: req.requestId || 'req_unknown',
      };

      return next();
    } catch (err: any) {
      if (optional) {
        return next();
      }
      return next(new UnauthorizedError('Invalid or expired authentication token'));
    }
  };
}

/**
 * Server-Side Permission Authorization Middleware
 * Enforces fine-grained RESOURCE.ACTION permissions
 */
export function requirePermission(...permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new UnauthorizedError('Authentication required to verify permissions'));
    }

    const missing = permissions.filter((p) => !hasPermission(req.auth, p));
    if (missing.length > 0) {
      auditService
        .logEvent({
          actor: {
            id: req.auth.userId,
            type: req.auth.roles.includes('PATIENT') ? 'PATIENT' : 'USER',
            department: req.auth.department || undefined,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
          },
          action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          resource: req.baseUrl + req.path,
          requestId: req.requestId || 'req_unknown',
          metadata: {
            reason: 'Insufficient permissions',
            requiredPermissions: permissions,
            missingPermissions: missing,
            userRoles: req.auth.roles,
          },
        })
        .catch(() => {});

      return next(
        new ForbiddenError(
          `Forbidden: Role lacks required permission '${missing[0]}'`
        )
      );
    }

    return next();
  };
}

/**
 * Server-Side Role Authorization Middleware
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new UnauthorizedError('Authentication required to verify role'));
    }

    if (!hasAnyRole(req.auth, roles)) {
      auditService
        .logEvent({
          actor: {
            id: req.auth.userId,
            type: 'USER',
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
          },
          action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          resource: req.baseUrl + req.path,
          requestId: req.requestId || 'req_unknown',
          metadata: {
            reason: 'Role requirement not met',
            allowedRoles: roles,
            userRoles: req.auth.roles,
          },
        })
        .catch(() => {});

      return next(
        new ForbiddenError(
          `Forbidden: User does not possess an authorized role (${roles.join(', ')})`
        )
      );
    }

    return next();
  };
}

/**
 * Patient Ownership / Context Authorization Middleware
 * Enforces that PATIENT users can ONLY access their own records
 * Staff with PATIENT.READ permission can access records across the facility
 */
export function requirePatientAccess(
  getPatientId: (req: Request) => string | undefined = (req) => req.params.id
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const targetPatientId = getPatientId(req);

    // If Super Admin, allow
    if (req.auth.roles.includes('SUPER_ADMIN')) {
      return next();
    }

    // If staff with PATIENT.READ permission, allow
    const isStaff = req.auth.roles.some((r) => r !== 'PATIENT');
    if (isStaff && hasPermission(req.auth, 'PATIENT.READ')) {
      return next();
    }

    // If user is a PATIENT: verify record ownership
    if (req.auth.roles.includes('PATIENT')) {
      if (
        req.auth.patientId &&
        targetPatientId &&
        (req.auth.patientId === targetPatientId ||
          req.auth.patientId.toLowerCase() === targetPatientId.toLowerCase())
      ) {
        return next();
      }

      auditService
        .logEvent({
          actor: {
            id: req.auth.userId,
            type: 'PATIENT',
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
          },
          action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          resource: 'patients',
          resourceId: targetPatientId,
          requestId: req.requestId || 'req_unknown',
          metadata: {
            reason: 'Patient attempted to access another patient record',
            authPatientId: req.auth.patientId,
            targetPatientId,
          },
        })
        .catch(() => {});

      return next(
        new ForbiddenError('Forbidden: Patients are only permitted to access their own clinical records')
      );
    }

    return next(new ForbiddenError('Forbidden: Insufficient privileges to access patient record'));
  };
}
