# Chikitsaalye — API Standard & Conventions

All endpoints conform to `/api/v1` versioning and uniform request/response specifications.

---

## 1. URL Structure & Resources

- All APIs are prefixed with `/api/v1/`.
- Resource collections use lowercase plural nouns (e.g., `/api/v1/patients`, `/api/v1/encounters`).
- Individual resources are addressed by ID: `/api/v1/patients/:id`.
- Sub-resources follow parent-child hierarchy: `/api/v1/patients/:id/encounters`.

---

## 2. Standard Success Response Envelope

Every successful API response returns HTTP status `2xx` and conforms to `ApiSuccessResponse<T>`:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_a1b2c3d4e5f6",
    "timestamp": "2026-10-13T10:00:00.000Z",
    "durationMs": 14,
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 145,
      "totalPages": 8
    }
  }
}
```

- `success`: Always `true` for successful operations.
- `data`: The primary resource object or array of items.
- `meta.requestId`: Unique request correlation ID.
- `meta.pagination`: Included when returning paginated lists.

---

## 3. Standard Error Envelope

Errors return standard HTTP 4xx/5xx status codes and conform to `ApiErrorResponse`:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload or query parameters",
    "requestId": "req_a1b2c3d4e5f6",
    "details": [
      {
        "field": "body.phone",
        "message": "Must be a valid 10-digit mobile number",
        "code": "invalid_string"
      }
    ]
  }
}
```

### Standard Error Codes
| HTTP Status | Error Code | Description |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Request failed schema validation (missing fields, wrong types). |
| `401` | `UNAUTHORIZED` | Authentication missing, invalid, or expired. |
| `403` | `FORBIDDEN` | Authenticated role lacks required clinical permission. |
| `404` | `NOT_FOUND` | Resource not found on this server. |
| `409` | `CONFLICT` | Resource collision (e.g., duplicate UHID, unique constraint). |
| `500` | `INTERNAL_ERROR` | Unexpected server failure (stack traces withheld from client). |
| `503` | `SERVICE_UNAVAILABLE` | Health check failure or dependency outage. |

---

## 4. Query Parameters: Pagination, Filtering & Sorting

Standard list endpoints accept:

- `page`: 1-based page number (default: `1`).
- `pageSize`: Items per page, maximum 100 (default: `20`).
- `sortBy`: Field to order by (e.g., `createdAt`, `uhid`, `name`).
- `sortOrder`: Sorting direction: `asc` or `desc` (default: `desc`).
- `search`: Full-text or partial string search query.

Example:
```http
GET /api/v1/patients?page=2&pageSize=25&sortBy=createdAt&sortOrder=desc&search=Sharma
```

---

## 5. Security & Headers

- `Authorization: Bearer <accessToken>`: Required for authenticated endpoints.
- `X-Request-Id: <string>`: Optional client-provided correlation ID (generated automatically if omitted).
- `X-Idempotency-Key: <string>`: Required or recommended for critical financial or clinical mutations to guarantee at-most-once execution.
- `Content-Type: application/json`: Required for POST/PUT/PATCH bodies.
