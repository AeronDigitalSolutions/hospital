import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env, API_VERSION_PREFIX } from '@chikitsaalye/config';
import { requestIdMiddleware } from './middleware/request-id.js';
import { auditLoggerMiddleware } from './middleware/audit-logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { NotFoundError } from './middleware/errors.js';
import { v1Router } from './routes/v1.js';

export function createApp(): Express {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  const allowedOrigins = env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          return callback(null, true);
        }
        return callback(new Error('Origin not permitted by CORS policy'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Idempotency-Key'],
    })
  );

  // Parsing Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request Tracking & Audit
  app.use(requestIdMiddleware);
  app.use(auditLoggerMiddleware);

  // API v1 Routes
  app.use(API_VERSION_PREFIX, v1Router);

  // Root redirect/status
  app.get('/', (req, res) => {
    res.json({
      name: 'Chikitsaalye Enterprise Digital Healthcare OS API',
      version: '0.1.0',
      apiPrefix: API_VERSION_PREFIX,
      documentation: '/docs',
      health: `${API_VERSION_PREFIX}/health`,
    });
  });

  // Catch-all 404 Route Handler
  app.use((req, res, next) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found on this server.`));
  });

  // Global Centralized Error Handler
  app.use(errorHandler);

  return app;
}
