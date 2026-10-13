# Chikitsaalye — Enterprise Digital Healthcare Operating System

> **Enterprise Teaching Hospital Operating System (UPUMS)**
> Repository Bootstrap & Architecture Foundation — `CODEx-001`

Chikitsaalye is a digital healthcare operating system engineered for tertiary teaching hospitals and high-volume clinical institutions. Built with a modular monolith first architecture, it unifies clinical operations, diagnostics, pharmacy, patient flows, and administrative governance under consistent architectural boundaries.

---

## Architecture At A Glance

```text
Web / Admin Clients                 Patient Portal
         \                               /
          \                             /
           v                           v
     ┌───────────────────────────────────────┐
     │           REST API (/api/v1)          │
     │  - Request ID Correlation             │
     │  - Centralized Error Envelopes        │
     │  - Audit Logging Engine               │
     │  - Idempotency Gate (x-idempotency)   │
     └───────────────────┬───────────────────┘
                         │
                         v
     ┌───────────────────────────────────────┐
     │    Authentication & Authorization     │
     │  - JWT Bearer Tokens                  │
     │  - RBAC (Roles & Granular Permissions)│
     └───────────────────┬───────────────────┘
                         │
                         v
     ┌───────────────────────────────────────┐
     │       Modular Application Layer       │
     │  apps/api/src/modules/ (24 Subsystems)│
     │  - patients      - encounters - opd   │
     │  - ipd           - emergency  - lab   │
     │  - radiology     - pharmacy   - billing
     └───────────────────┬───────────────────┘
                         │
                         v
     ┌───────────────────────────────────────┐
     │       Data & Persistence Layer        │
     │  - PostgreSQL 16 (Prisma 5 ORM)       │
     │  - Redis 7 (Cache & Sessions)         │
     └───────────────────────────────────────┘
```

---

## Monorepo Layout

```text
chikitsaalye/
├── apps/
│   ├── web/               # Next.js 14 App Router enterprise hospital shell
│   ├── patient/           # Patient portal foundation
│   └── api/               # Express + TypeScript modular monolith API service
│
├── packages/
│   ├── ui/                # Hospital UI shell, layouts, states, table, and forms
│   ├── database/          # Prisma client, migrations, schema, seed strategy
│   ├── auth/              # JWT issuance, password hashing, and RBAC helpers
│   ├── types/             # Domain types, DTOs, API responses, envelopes
│   ├── validation/        # Zod schemas & error formatting
│   └── config/            # Runtime environment validation & constants
│
├── infrastructure/        # Docker Compose & container configurations
├── docs/                  # Architecture, conventions, development guides
├── scripts/               # Developer automation scripts
├── .env.example           # Environment variables template
├── docker-compose.yml     # Local Postgres 16 & Redis 7 services
└── README.md
```

---

## Quickstart

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env

# 3. Start local Postgres & Redis
docker compose up -d

# 4. Generate Prisma client & run database migrations
pnpm db:generate
pnpm db:migrate

# 5. Seed initial hospital organization (UPUMS) & roles
pnpm db:seed

# 6. Start development servers
pnpm dev
```

- **Clinical Web Shell**: [http://localhost:3000](http://localhost:3000)
- **API Health Check**: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)

---

## Quality & Verification

```bash
# Run unit and API integration tests
pnpm test

# Build all packages and applications
pnpm build

# Run end-to-end repository check
bash scripts/check.sh
```

---

## Roadmap

- [x] **CODEx-001**: Repository Architecture & Engineering Foundation
- [ ] **CODEx-002**: Master Patient Index (MPI / UHID) & Clinical Encounter Foundation
- [ ] **CODEx-003**: Enterprise Role-Based Access Control (RBAC) & Shift Management
- [ ] **CODEx-004**: Outpatient Department (OPD) & Queue Engine
- [ ] **CODEx-005**: Emergency Triage & Resuscitation Center
- [ ] **CODEx-006**: Hospital Billing, Tariffs & PMJAY Claims

---

## Documentation

- [Architecture Blueprint](docs/architecture.md)
- [API Conventions & Error Model](docs/api-conventions.md)
- [Local Development Guide](docs/development.md)
- [Environment Variables](docs/environment.md)
