# Chikitsaalye — Architecture Blueprint & Foundations (CODEx-001)

## 1. Architectural Philosophy: Modular Monolith First

Chikitsaalye is designed as an enterprise digital healthcare operating system for large teaching hospitals (such as UPUMS with 1,000+ beds, extensive OPD queues, intensive care units, and emergency trauma facilities).

Following modern enterprise best practices, the system is architected as a **modular monolith first** rather than premature microservices. This provides:
- **Transactional consistency**: Single database transactional integrity across clinical encounters, billing, and pharmacy dispensing.
- **Low latency**: In-process calls and unified domain entities rather than network serialization bottlenecks.
- **Clean bounded contexts**: Each hospital department and functional domain has clear structural boundaries, type interfaces, and API contracts.
- **Future extraction path**: If a high-throughput domain (e.g., telemetry, PACS imaging ingestion) requires independent scaling later, its well-bounded module can be cleanly extracted.

```text
               Web Client (apps/web)          Patient Portal (apps/patient)
                         \                             /
                          \                           /
                           v                         v
                       ┌───────────────────────────────────┐
                       │   API Layer (/api/v1/*)           │
                       │   - Correlation Tracking (UUID)   │
                       │   - Audit Logging Engine          │
                       │   - Idempotency Gate              │
                       │   - Centralized Error Envelopes   │
                       └─────────────────┬─────────────────┘
                                         │
                                         v
                       ┌───────────────────────────────────┐
                       │  Authentication & Authorization   │
                       │  - JWT Bearer Tokens              │
                       │  - RBAC (Role/Permission Matrix)  │
                       └─────────────────┬─────────────────┘
                                         │
                                         v
         ┌───────────────────────────────────────────────────────────────┐
         │              Modular Application Subsystems                   │
         │  apps/api/src/modules/                                        │
         ├───────────────┬───────────────┬───────────────┬───────────────┤
         │ Core Clinical │ Diagnostics   │ Ancillary     │ Governance &  │
         │ - patients    │ - lab         │ - billing     │ Operations    │
         │ - encounters  │ - radiology   │ - ot          │ - reports     │
         │ - opd         │ - pharmacy    │ - icu         │ - analytics   │
         │ - ipd         │               │ - nursing     │ - admin       │
         │ - emergency   │               │ - discharge   │ - integrations│
         └───────────────┴───────────────┴───────────────┴───────────────┘
                                         │
                                         v
                       ┌───────────────────────────────────┐
                       │      Shared Data & Storage        │
                       │  - PostgreSQL 16 (Prisma 5 ORM)   │
                       │  - Redis 7 (Cache & Sessions)     │
                       └───────────────────────────────────┘
```

---

## 2. Monorepo Organization

The codebase is organized into independent workspace packages and applications:

```text
chikitsaalye/
├── apps/
│   ├── web/               # Next.js 14 App Router enterprise hospital shell
│   ├── patient/           # Patient self-service portal placeholder
│   └── api/               # Express + TypeScript modular monolith REST API
│
├── packages/
│   ├── ui/                # Shared enterprise medical UI design system & components
│   ├── database/          # Prisma schema, connection pooling, migrations, seed strategy
│   ├── auth/              # JWT issuance, password hashing, and RBAC helpers
│   ├── types/             # Shared TypeScript domain contracts, DTOs, envelopes
│   ├── validation/        # Zod validation schemas and error formatters
│   └── config/            # Environment variable validation & shared constants
│
├── infrastructure/        # Docker and deployment assets
├── docs/                  # Architecture, API conventions, and development documentation
├── scripts/               # Developer automation scripts
├── .env.example           # Environment template (no secrets)
├── docker-compose.yml     # Local Postgres 16 & Redis 7 services
└── pnpm-workspace.yaml    # Workspace definition
```

---

## 3. Subsystem Domain Boundaries

The 24 architectural modules established in `apps/api/src/modules/` reflect hospital operational divisions:

| Domain Group | Subsystems | Responsibility |
|---|---|---|
| **Identity & Security** | `auth`, `users`, `roles`, `permissions` | User authentication, session management, clinical role-based permissions, password policies. |
| **Foundational Master Data** | `master-data` | Clinical departments, ICD-10 codes, hospital beds, tariff schedules, wards, tariffs. |
| **Patient Flow** | `patients`, `encounters`, `appointments` | Master Patient Index (MPI / UHID), clinical encounters, OPD booking & queues. |
| **Clinical Services** | `opd`, `ipd`, `emergency`, `nursing`, `ot`, `icu`, `discharge` | Consultation notes, ward bed allocations, emergency triage, nursing care, surgery scheduling, critical care, discharge summaries. |
| **Diagnostics & Meds** | `lab`, `radiology`, `pharmacy` | Pathology orders & analyzer interfaces, PACS imaging & radiology reports, pharmacy formulary & dispensing. |
| **Financials & Admin** | `billing`, `reports`, `analytics`, `admin` | Cash counters, insurance/PMJAY claims, regulatory reporting, executive hospital dashboards, user administration. |
| **Interoperability** | `integrations`, `notifications` | ABDM (Ayushman Bharat Digital Mission) M1/M2/M3 interfaces, HL7/FHIR, DICOM, SMS/Email alerts. |

---

## 4. Cross-Cutting Concerns

### A. Correlation Tracking (`X-Request-Id`)
Every incoming HTTP request is assigned a unique `requestId` via `requestIdMiddleware`. This identifier flows through log messages, audit events, and API error envelopes, enabling instant tracing across distributed clinical stations.

### B. Audit Trail (`IAuditService`)
Clinical governance requires immutable tracking of who accessed or altered patient health information (PHI). The `IAuditService` captures:
- Actor (ID, user/system type, department, IP, user-agent)
- Action (e.g. `PATIENT_READ`, `ENCOUNTER_CREATE`)
- Resource and Resource ID
- Correlation `requestId` and timestamp
- Contextual metadata

### C. Idempotency Safeguards (`X-Idempotency-Key`)
Critical mutating transactions (e.g., patient admission, billing payment, drug dispensing) support or mandate the `x-idempotency-key` header to prevent duplicate operations in poor network environments (such as remote hospital terminals).

### D. Zero-Leak Error Envelope
Errors never leak raw JavaScript exception traces, SQL queries, or internal file paths to clients. All errors are normalized by `errorHandler` into standard error codes (`VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `INTERNAL_ERROR`).
