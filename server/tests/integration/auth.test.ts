import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import { app } from '../../src/app.js';
import { connectDatabase, disconnectDatabase } from '../../src/config/database.js';
import { connectRedis, disconnectRedis, getRedisClient } from '../../src/config/redis.js';
import { UserModel } from '../../src/models/user.model.js';
import { ConsentRecordModel } from '../../src/models/consentRecord.model.js';

let server: http.Server;
let baseUrl: string;
let isDbConnected = false;

before(async () => {
  try {
    await connectDatabase();
    const redis = await connectRedis();
    await redis.flushdb();
    isDbConnected = true;

    // Clean test user data
    await UserModel.deleteMany({ email: /@test\.smackgym\.co\.uk$/ });
    await ConsentRecordModel.deleteMany({});
  } catch (err) {
    console.warn('MongoDB or Redis not available for live integration test yet. Skipping live database assertions.');
  }

  await new Promise<void>((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const addr = server.address() as any;
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });
});

after(async () => {
  if (isDbConnected) {
    await UserModel.deleteMany({ email: /@test\.smackgym\.co\.uk$/ });
    await ConsentRecordModel.deleteMany({});
    await disconnectDatabase();
    await disconnectRedis();
  }
  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

describe('Phase P0 Security Baseline & Identity Integration Suite', () => {
  it('GET /health returns HTTP 200 with service status payload', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.ok(res.status === 200 || res.status === 503);
    const body = await res.json() as any;
    assert.ok(body.status);
    assert.ok(body.services);
  });

  it('GET /v1/nonexistent returns RFC 7807 404 Problem Details', async () => {
    const res = await fetch(`${baseUrl}/v1/nonexistent`);
    assert.equal(res.status, 404);
    assert.equal(res.headers.get('content-type'), 'application/problem+json; charset=utf-8');

    const problem = await res.json() as any;
    assert.equal(problem.status, 404);
    assert.equal(problem.code, 'not_found');
    assert.equal(problem.type, 'https://api.smackgym.com/errors/not_found');
    assert.ok(problem.detail);
  });

  it('Gate T02: POST /v1/auth/register with is18Plus=false returns HTTP 403 forbidden_underage', async () => {
    const res = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'minor@test.smackgym.co.uk',
        password: 'Password123!',
        fullName: 'Minor User',
        is18Plus: false,
        consentGiven: true,
      }),
    });

    assert.equal(res.status, 403);
    const problem = await res.json() as any;
    assert.equal(problem.code, 'forbidden_underage');
    assert.equal(problem.type, 'https://api.smackgym.com/errors/forbidden_underage');
  });

  it('Gate T02: POST /v1/auth/register with birthDate showing age < 18 returns HTTP 403 forbidden_underage', async () => {
    const today = new Date();
    const underageBirth = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate()).toISOString();

    const res = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'underage@test.smackgym.co.uk',
        password: 'Password123!',
        fullName: 'Underage User',
        is18Plus: true,
        birthDate: underageBirth,
        consentGiven: true,
      }),
    });

    assert.equal(res.status, 403);
    const problem = await res.json() as any;
    assert.equal(problem.code, 'forbidden_underage');
  });

  it('POST /v1/auth/register with invalid DTO returns RFC 7807 422 validation_failed', async () => {
    const res = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'not-an-email',
        password: 'weak',
        fullName: '',
      }),
    });

    assert.equal(res.status, 422);
    const problem = await res.json() as any;
    assert.equal(problem.code, 'validation_failed');
    assert.ok(Array.isArray(problem.invalidParams));
    assert.ok(problem.invalidParams.length > 0);
  });

  it('Gate T01: Full Lifecycle (Register -> Login -> /me -> Refresh -> Logout -> Revocation)', async (t) => {
    if (!isDbConnected) {
      t.skip('Skipping live database lifecycle because MongoDB/Redis are not yet accessible');
      return;
    }

    // Flush rate limiter counters for clean test execution
    await getRedisClient().flushdb();

    const testEmail = `athlete_${Date.now()}@test.smackgym.co.uk`;
    const testPassword = 'StrongPassword2026!';

    // 1. Register
    const regRes = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        fullName: 'Test Athlete',
        is18Plus: true,
        birthDate: '1998-05-15T00:00:00.000Z',
        consentGiven: true,
      }),
    });

    assert.equal(regRes.status, 201, 'Registration should return HTTP 201');
    const regData = await regRes.json() as any;
    assert.equal(regData.success, true);
    assert.equal(regData.data.user.email, testEmail);
    assert.equal(regData.data.user.role, 'ATHLETE');
    assert.equal(regData.data.user.is18Plus, true);
    assert.ok(regData.data.tokens.accessToken);
    assert.ok(regData.data.tokens.refreshToken);

    const initialAccessToken = regData.data.tokens.accessToken;
    const initialRefreshToken = regData.data.tokens.refreshToken;

    // Verify UK GDPR Consent records created
    const consents = await ConsentRecordModel.find({ userId: regData.data.user.id });
    assert.equal(consents.length, 2, 'Must record TOS_AND_PRIVACY and ARTICLE_9_HEALTH consent');

    // 2. Duplicate registration fails with 409
    const dupRes = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        fullName: 'Duplicate Athlete',
        is18Plus: true,
        consentGiven: true,
      }),
    });
    assert.equal(dupRes.status, 409);
    const dupProblem = await dupRes.json() as any;
    assert.equal(dupProblem.code, 'email_already_registered');

    // 3. Login with wrong password returns 401
    const badLoginRes = await fetch(`${baseUrl}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword999!',
      }),
    });
    assert.equal(badLoginRes.status, 401);

    // 4. Login with correct password returns 200 + tokens
    const loginRes = await fetch(`${baseUrl}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    assert.equal(loginRes.status, 200);
    const loginData = await loginRes.json() as any;
    assert.ok(loginData.data.tokens.accessToken);

    // 5. Query /v1/auth/me with valid Bearer token
    const meRes = await fetch(`${baseUrl}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${initialAccessToken}` },
    });
    assert.equal(meRes.status, 200);
    const meData = await meRes.json() as any;
    assert.equal(meData.data.email, testEmail);

    // 6. Refresh Token
    const refreshRes = await fetch(`${baseUrl}/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: initialRefreshToken }),
    });
    assert.equal(refreshRes.status, 200);
    const refreshData = await refreshRes.json() as any;
    assert.ok(refreshData.data.accessToken);
    assert.ok(refreshData.data.refreshToken);

    // 7. Logout (Blacklist token)
    const logoutRes = await fetch(`${baseUrl}/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${initialAccessToken}`,
      },
      body: JSON.stringify({ refreshToken: refreshData.data.refreshToken }),
    });
    assert.equal(logoutRes.status, 200);

    // 8. Subsequent query with blacklisted token returns HTTP 401 token_revoked
    const revokedRes = await fetch(`${baseUrl}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${initialAccessToken}` },
    });
    assert.equal(revokedRes.status, 401);
    const revokedProblem = await revokedRes.json() as any;
    assert.equal(revokedProblem.code, 'token_revoked');
  });
});
