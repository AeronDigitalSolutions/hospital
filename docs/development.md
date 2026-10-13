# Chikitsaalye — Local Development Guide

## 1. Prerequisites

- **Node.js**: `v20.x` or higher (LTS recommended)
- **pnpm**: `v9.x` or higher (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Docker & Docker Compose**: Optional but recommended for local PostgreSQL and Redis

---

## 2. Quickstart

### Step 1: Install Dependencies
```bash
pnpm install
```

### Step 2: Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Step 3: Start Local Database & Redis (Docker)
```bash
docker compose up -d
```
Verify containers are healthy:
```bash
docker ps
```

### Step 4: Generate Prisma Client & Run Migrations
```bash
pnpm db:generate
pnpm db:migrate
```

### Step 5: Seed Baseline Hospital Data
```bash
pnpm db:seed
```
This initializes the UPUMS hospital organization, standard system roles (SUPER_ADMIN, CLINICIAN, NURSE, etc.), baseline permissions, and the initial administrator account:
- **Email**: `admin@chikitsaalye.upums.ac.in`
- **Password**: `Admin@Chikitsaalye2024!`

### Step 6: Start Development Servers
Run both API and Web concurrently:
```bash
pnpm dev
```
Or start individually:
```bash
# Start API (port 4000)
pnpm dev:api

# Start Web client (port 3000)
pnpm dev:web
```

---

## 3. Testing & Verification

Run automated test suite:
```bash
pnpm test
```

Run quality and build verification script:
```bash
bash scripts/check.sh
```

---

## 4. Building for Production

Compile all packages and applications:
```bash
pnpm build
```
Build outputs:
- Shared packages: `packages/*/dist`
- API service: `apps/api/dist`
- Web application: `apps/web/.next`
