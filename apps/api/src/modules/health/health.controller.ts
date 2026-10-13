import { Request, Response } from 'express';
import { checkDatabaseConnection } from '@chikitsaalye/database';
import { APP_VERSION, env } from '@chikitsaalye/config';
import type { HealthCheckResponse } from '@chikitsaalye/types';
import { sendSuccess } from '../../middleware/response-envelope.js';

export async function getHealthStatus(req: Request, res: Response) {
  const dbCheck = await checkDatabaseConnection();

  const mem = process.memoryUsage();
  const heapUsedMb = Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100;
  const heapTotalMb = Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100;
  const rssMb = Math.round((mem.rss / 1024 / 1024) * 100) / 100;

  const dbStatus: 'up' | 'down' | 'unconfigured' = dbCheck.ok ? 'up' : 'down';
  const overallStatus = dbCheck.ok ? 'healthy' : 'degraded';

  const healthPayload: HealthCheckResponse = {
    status: overallStatus,
    version: APP_VERSION,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    checks: {
      database: {
        status: dbStatus,
        latencyMs: dbCheck.latencyMs,
      },
      redis: {
        status: 'unconfigured', // Can be wired up when Redis client is instantiated
      },
      memory: {
        heapUsedMb,
        heapTotalMb,
        rssMb,
      },
    },
  };

  const httpStatus = overallStatus === 'healthy' ? 200 : 503;
  return sendSuccess(req, res, healthPayload, httpStatus);
}
