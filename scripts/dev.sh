#!/usr/bin/env bash
set -e

echo "Starting Chikitsaalye local development environment..."

# Start Postgres & Redis containers
if command -v docker &> /dev/null && docker info &> /dev/null; then
  echo "Spinning up PostgreSQL 16 and Redis 7 containers..."
  docker compose up -d
else
  echo "Docker is not running or not found. Ensure PostgreSQL is accessible at localhost:5432."
fi

# Run database migrations / Prisma client generation
pnpm --filter @chikitsaalye/database generate

# Start concurrent development servers
pnpm dev
