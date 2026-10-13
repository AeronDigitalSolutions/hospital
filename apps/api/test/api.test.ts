import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('Chikitsaalye Enterprise API Foundation (CODEx-001)', () => {
  const app = createApp();

  it('GET /api/v1/health returns structured health check response', async () => {
    const res = await request(app).get('/api/v1/health');

    // Health endpoint can be 200 (if DB connected) or 503 (if DB offline in dev), but envelope is valid
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('version');
    expect(res.body.data).toHaveProperty('uptimeSeconds');
    expect(res.body.data).toHaveProperty('checks');
    expect(res.body.data.checks).toHaveProperty('database');
    expect(res.body.data.checks).toHaveProperty('memory');
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('requestId');
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('GET /api/v1/patients returns standardized paginated envelope', async () => {
    const res = await request(app).get('/api/v1/patients?page=1&pageSize=20');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('pagination');
    expect(res.body.meta.pagination.page).toBe(1);
    expect(res.body.meta.pagination.pageSize).toBe(20);
  });

  it('POST /api/v1/patients returns 201 with idempotency support', async () => {
    const idempotencyKey = 'idem_test_' + Date.now();
    const res = await request(app)
      .post('/api/v1/patients')
      .set('x-idempotency-key', idempotencyKey)
      .send({ firstName: 'Test' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('message');

    // Second request with same idempotency key returns cached response
    const res2 = await request(app)
      .post('/api/v1/patients')
      .set('x-idempotency-key', idempotencyKey)
      .send({ firstName: 'Test' });

    expect(res2.status).toBe(201);
    expect(res2.headers['x-cache-lookup']).toBe('HIT');
  });

  it('GET /api/v1/unknown-route returns standardized 404 error envelope without leaking stack traces', async () => {
    const res = await request(app).get('/api/v1/unknown-route');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
    expect(res.body.error).toHaveProperty('message');
    expect(res.body.error).toHaveProperty('requestId');
    expect(res.body.error).not.toHaveProperty('stack');
  });

  it('POST /api/v1/auth/login with invalid payload triggers standardized 400 validation error', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ usernameOrEmail: 'a', password: '1' }); // Fails minimum length

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(res.body.error).toHaveProperty('details');
    expect(Array.isArray(res.body.error.details)).toBe(true);
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });
});
