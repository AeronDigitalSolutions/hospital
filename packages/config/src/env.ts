import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file if available
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),

  // URLs
  API_URL: z.string().url().default('http://localhost:4000'),
  WEB_APP_URL: z.string().url().default('http://localhost:3000'),
  PATIENT_APP_URL: z.string().url().default('http://localhost:3001'),

  // Hospital Context
  HOSPITAL_CODE: z.string().default('UPUMS-MAIN'),
  HOSPITAL_NAME: z.string().default('Uttar Pradesh University of Medical Sciences Hospital'),
  FACILITY_TIMEZONE: z.string().default('Asia/Kolkata'),

  // Database
  DATABASE_URL: z.string().default('postgresql://chikitsaalye_user:chikitsaalye_password@localhost:5432/chikitsaalye_db?schema=public'),
  DATABASE_DIRECT_URL: z.string().optional(),
  DATABASE_POOL_MIN: z.coerce.number().default(2),
  DATABASE_POOL_MAX: z.coerce.number().default(10),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_KEY_PREFIX: z.string().default('chikitsaalye:'),

  // Security
  JWT_ACCESS_SECRET: z.string().min(16).default('chikitsaalye-dev-access-secret-replace-in-production-min-32-chars-long'),
  JWT_REFRESH_SECRET: z.string().min(16).default('chikitsaalye-dev-refresh-secret-replace-in-production-min-32-chars-long'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:3001'),

  // Storage
  STORAGE_DRIVER: z.enum(['local', 's3', 'minio']).default('local'),
  STORAGE_LOCAL_PATH: z.string().default('./storage'),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  AUDIT_LOG_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function loadEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errorDetails = result.error.errors.map((e) => `  - ${e.path.join('.')}: ${e.message}`).join('\n');
    console.error(`[Chikitsaalye Config] Environment configuration validation failed:\n${errorDetails}`);
    // In production, throw. In development, return parsed with fallbacks
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Invalid environment configuration: \n${errorDetails}`);
    }
  }
  const config = result.success ? result.data : (envSchema.parse({}) as EnvConfig);
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = config.DATABASE_URL;
  }
  return config;
}

export const env = loadEnv();
