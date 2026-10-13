import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service.js';

export function auditLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Capture on response finish
  res.on('finish', () => {
    // Only audit mutating actions or explicit clinical views
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) || req.originalUrl.includes('/patients/')) {
      const actorId = req.auth?.userId || 'anonymous';
      const actorType = req.auth ? 'USER' : 'SYSTEM';

      const pathSegments = req.path.split('/').filter(Boolean);
      const resource = pathSegments[2] || 'root'; // e.g., 'patients', 'billing'

      auditService.logEvent({
        actor: {
          id: actorId,
          type: actorType as any,
          department: req.auth?.department,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        },
        action: `${req.method}_${resource.toUpperCase()}`,
        resource,
        resourceId: req.params.id,
        requestId: req.requestId || 'req_unknown',
        metadata: {
          statusCode: res.statusCode,
          url: req.originalUrl,
          query: req.query,
        },
      }).catch((err) => {
        console.error('[Audit Logger] Failed to capture event:', err);
      });
    }
  });

  next();
}
