import { Request, Response, NextFunction } from 'express';
import { ConflictError } from './errors.js';

// Cache for idempotency keys (in-memory for bootstrap phase, can swap to Redis)
const processedKeys = new Map<string, { timestamp: number; statusCode: number; response: any }>();
const IDEMPOTENCY_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function idempotencyMiddleware(required = false) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only apply to mutating requests
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next();
    }

    const idempotencyKey = req.header('x-idempotency-key');

    if (!idempotencyKey) {
      if (required) {
        throw new ConflictError('Header x-idempotency-key is required for this critical clinical transaction');
      }
      return next();
    }

    // Clean up expired keys periodically
    const now = Date.now();
    for (const [key, data] of processedKeys.entries()) {
      if (now - data.timestamp > IDEMPOTENCY_TTL_MS) {
        processedKeys.delete(key);
      }
    }

    const cached = processedKeys.get(idempotencyKey);
    if (cached) {
      res.setHeader('X-Cache-Lookup', 'HIT');
      return res.status(cached.statusCode).json(cached.response);
    }

    // Intercept response to store result
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        processedKeys.set(idempotencyKey, {
          timestamp: Date.now(),
          statusCode: res.statusCode,
          response: body,
        });
      }
      return originalJson(body);
    };

    next();
  };
}
