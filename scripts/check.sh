#!/usr/bin/env bash
set -e

echo "Running Chikitsaalye quality and verification checks..."

echo "1. Generating database client..."
pnpm --filter @chikitsaalye/database generate

echo "2. Building shared packages..."
pnpm build:packages

echo "3. Running tests..."
pnpm test

echo "4. Building API service..."
pnpm --filter @chikitsaalye/api build

echo "5. Building Web client..."
pnpm --filter @chikitsaalye/web build

echo "All checks passed successfully!"
