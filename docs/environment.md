# Chikitsaalye — Environment Configuration

All environment variables are validated at runtime via Zod in `packages/config/src/env.ts`.

## Variable Matrix

| Variable | Required | Default / Example | Purpose |
|---|---|---|---|
| `NODE_ENV` | No | `development` | Environment mode (`development`, `test`, `production`). |
| `PORT` | No | `4000` | HTTP port for the API server. |
| `API_URL` | No | `http://localhost:4000` | Public URL for API consumers. |
| `WEB_APP_URL` | No | `http://localhost:3000` | URL for the clinical web interface. |
| `PATIENT_APP_URL` | No | `http://localhost:3001` | URL for the patient portal. |
| `HOSPITAL_CODE` | No | `UPUMS-MAIN` | Facility identifier code. |
| `HOSPITAL_NAME` | No | `Uttar Pradesh University of Medical Sciences Hospital` | Facility legal name. |
| `DATABASE_URL` | Yes | `postgresql://chikitsaalye_user:chikitsaalye_password@localhost:5432/chikitsaalye_db?schema=public` | Primary PostgreSQL connection string. |
| `DATABASE_POOL_MIN` | No | `2` | Minimum connection pool size. |
| `DATABASE_POOL_MAX` | No | `10` | Maximum connection pool size. |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection URI for caching and sessions. |
| `JWT_ACCESS_SECRET` | Yes (in prod) | (min 32 chars) | Secret used to sign access tokens. |
| `JWT_REFRESH_SECRET`| Yes (in prod) | (min 32 chars) | Secret used to sign refresh tokens. |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Access token lifespan. |
| `JWT_REFRESH_EXPIRES_IN`| No | `7d` | Refresh token lifespan. |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:3000,http://localhost:3001` | Comma-delimited CORS allowed origins. |
| `STORAGE_DRIVER` | No | `local` | Document store (`local`, `s3`, `minio`). |
| `STORAGE_LOCAL_PATH` | No | `./storage` | Directory for local file storage. |
| `LOG_LEVEL` | No | `info` | Logging verbosity (`debug`, `info`, `warn`, `error`). |
| `AUDIT_LOG_ENABLED` | No | `true` | Toggle for audit trail logging. |

> [!CAUTION]
> Never commit real secrets or production credentials to git. Use environment secret managers (AWS Secrets Manager, HashiCorp Vault, Doppler) in production deployments.
