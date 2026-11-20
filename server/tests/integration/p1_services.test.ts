import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import crypto from 'node:crypto';
import { app } from '../../src/app.js';
import { connectDatabase, disconnectDatabase } from '../../src/config/database.js';
import { connectRedis, disconnectRedis, getRedisClient } from '../../src/config/redis.js';
import { UserModel } from '../../src/models/user.model.js';
import { PassportFactModel } from '../../src/models/passportFact.model.js';
import { PlanModel } from '../../src/models/plan.model.js';
import { SessionEventModel } from '../../src/models/sessionEvent.model.js';
import { FoodEntryModel } from '../../src/models/foodEntry.model.js';
import { RecoveryCheckinModel } from '../../src/models/recoveryCheckin.model.js';
import { ExerciseModel } from '../../src/models/exercise.model.js';
import { signAccessToken } from '../../src/utils/jwt.js';

let server: http.Server;
let baseUrl: string;
let athleteToken: string;
let adminToken: string;
let testAthleteId: string;
const testAthleteEmail = 'p1-athlete@test.smackgym.co.uk';
const testAdminEmail = 'p1-admin@test.smackgym.co.uk';

before(async () => {
  await connectDatabase();
  await connectRedis();

  // Clean test data
  await UserModel.deleteMany({ email: { $in: [testAthleteEmail, testAdminEmail] } });
  await PassportFactModel.deleteMany({});
  await PlanModel.deleteMany({});
  await SessionEventModel.deleteMany({});
  await FoodEntryModel.deleteMany({});
  await RecoveryCheckinModel.deleteMany({});
  await ExerciseModel.deleteMany({});

  // Seed sample exercises
  await ExerciseModel.create([
    {
      _id: 'EX-TEST-001',
      name: 'Barbell Back Squat',
      movementPattern: 'squat',
      targetMuscles: ['quadriceps', 'glutes'],
      equipmentRequired: ['barbell', 'rack'],
      setupCues: ['Feet shoulder-width', 'Brace core'],
      videoAssetId: 'vid-test-squat',
      isLicensed: true,
      isCompound: true,
    },
    {
      _id: 'EX-TEST-002',
      name: 'Romanian Deadlift',
      movementPattern: 'hinge',
      targetMuscles: ['hamstrings', 'glutes'],
      equipmentRequired: ['barbell'],
      setupCues: ['Hinge hips back', 'Neutral spine'],
      videoAssetId: 'vid-test-rdl',
      isLicensed: true,
      isCompound: true,
    },
    {
      _id: 'EX-TEST-003',
      name: 'Dumbbell Bench Press',
      movementPattern: 'push',
      targetMuscles: ['pectorals', 'triceps'],
      equipmentRequired: ['dumbbell', 'bench'],
      setupCues: ['Retract scapulae'],
      videoAssetId: 'vid-test-bench',
      isLicensed: true,
      isCompound: true,
    },
    {
      _id: 'EX-TEST-004',
      name: 'Cable Lat Pulldown',
      movementPattern: 'pull',
      targetMuscles: ['latissimus_dorsi'],
      equipmentRequired: ['cable'],
      setupCues: ['Pull to upper chest'],
      videoAssetId: 'vid-test-lat',
      isLicensed: true,
      isCompound: false,
    },
  ]);

  // Create test athlete
  const athlete = await UserModel.create({
    email: testAthleteEmail,
    passwordHash: 'dummy_hash',
    fullName: 'P1 Test Athlete',
    role: 'ATHLETE',
    mode: 'personal',
    is18Plus: true,
    birthDate: new Date('2000-01-01'),
  });
  testAthleteId = athlete._id.toString();
  athleteToken = signAccessToken({
    userId: testAthleteId,
    email: testAthleteEmail,
    role: 'ATHLETE',
    is18Plus: true,
  }).token;

  // Create test admin
  const admin = await UserModel.create({
    email: testAdminEmail,
    passwordHash: 'dummy_hash',
    fullName: 'P1 Test Admin',
    role: 'SUPER_ADMIN',
    mode: 'personal',
    is18Plus: true,
  });
  adminToken = signAccessToken({
    userId: admin._id.toString(),
    email: testAdminEmail,
    role: 'SUPER_ADMIN',
    is18Plus: true,
  }).token;

  // Start test server on random port
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
  await UserModel.deleteMany({ email: { $in: [testAthleteEmail, testAdminEmail] } });
  await PassportFactModel.deleteMany({});
  await PlanModel.deleteMany({});
  await SessionEventModel.deleteMany({});
  await FoodEntryModel.deleteMany({});
  await RecoveryCheckinModel.deleteMany({});
  await ExerciseModel.deleteMany({});
  await disconnectDatabase();
  await disconnectRedis();
  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

describe('Phase P1 Core Services & Verification Gates Suite', () => {
  // Gate T03: Offline Batch Ingestion (< 100ms for 50 sets)
  it('Gate T03 (Ingestion): POST /v1/session-events/batch inserts 50 sets in < 100ms with deduplication', async () => {
    const sessionId = crypto.randomUUID();
    const batchEvents = [];

    for (let i = 0; i < 50; i++) {
      batchEvents.push({
        eventId: crypto.randomUUID(),
        sessionId,
        athleteId: testAthleteId,
        exerciseId: 'EX-TEST-001',
        setData: {
          setId: crypto.randomUUID(),
          setNumber: i + 1,
          targetReps: 10,
          actualReps: 10,
          weightKg: 80,
          rpe: 8,
          isCompleted: true,
          loggedAt: new Date().toISOString(),
        },
        eventTimestamp: new Date().toISOString(),
      });
    }

    const start = Date.now();
    const res = await fetch(`${baseUrl}/v1/session-events/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`,
      },
      body: JSON.stringify({ events: batchEvents }),
    });
    const duration = Date.now() - start;

    assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.data.totalReceived, 50);
    assert.equal(body.data.insertedCount, 50);
    assert.equal(body.data.duplicateCount, 0);
    assert.ok(
      body.data.processingTimeMs < 100,
      `Internal database batch insertion must complete in < 100ms, took ${body.data.processingTimeMs}ms`
    );

    // Verify idempotency: duplicate batch submission
    const resDup = await fetch(`${baseUrl}/v1/session-events/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`,
      },
      body: JSON.stringify({ events: batchEvents }),
    });
    assert.equal(resDup.status, 200);
    const bodyDup = (await resDup.json()) as any;
    assert.equal(bodyDup.data.insertedCount, 0);
    assert.equal(bodyDup.data.duplicateCount, 50);
  });

  // Gate T05: Deterministic Decision Engine (Identical inputs -> Identical plans)
  it('Gate T05 (Engine): POST /v1/plans/generate produces deterministic output diff for identical inputs', async () => {
    const res1 = await fetch(`${baseUrl}/v1/plans/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`,
      },
      body: JSON.stringify({ targetDate: '2026-11-25' }),
    });
    assert.equal(res1.status, 201);
    const body1 = (await res1.json()) as any;

    const res2 = await fetch(`${baseUrl}/v1/plans/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`,
      },
      body: JSON.stringify({ targetDate: '2026-11-25' }),
    });
    assert.equal(res2.status, 201);
    const body2 = (await res2.json()) as any;

    const plan1 = body1.data;
    const plan2 = body2.data;

    assert.equal(plan1.exercises.length, plan2.exercises.length);
    for (let i = 0; i < plan1.exercises.length; i++) {
      assert.equal(plan1.exercises[i].exerciseId, plan2.exercises[i].exerciseId);
      assert.equal(plan1.exercises[i].targetSets, plan2.exercises[i].targetSets);
      assert.equal(plan1.exercises[i].targetReps, plan2.exercises[i].targetReps);
      assert.equal(plan1.exercises[i].targetWeightKg, plan2.exercises[i].targetWeightKg);
    }
  });

  // Gate T04: Optimistic Revisions (Concurrent mutation returns 409 stale_revision)
  it('Gate T04 (Concurrency): POST /v1/plans/accept rejects stale revision with HTTP 409 stale_revision', async () => {
    // 1. Generate plan (revision 1)
    const genRes = await fetch(`${baseUrl}/v1/plans/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`,
      },
      body: JSON.stringify({ targetDate: '2026-11-26' }),
    });
    const plan = ((await genRes.json()) as any).data;
    assert.equal(plan.revision, 1);

    // 2. Accept plan with valid revision 1 -> succeeds, increments to 2
    const accept1 = await fetch(`${baseUrl}/v1/plans/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`,
      },
      body: JSON.stringify({
        planId: plan._id,
        expectedRevision: 1,
      }),
    });
    assert.equal(accept1.status, 200);
    const updatedPlan = ((await accept1.json()) as any).data;
    assert.equal(updatedPlan.status, 'accepted');
    assert.equal(updatedPlan.revision, 2);

    // 3. Stale client attempt to accept with revision 1 -> HTTP 409 Conflict
    const acceptStale = await fetch(`${baseUrl}/v1/plans/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`,
      },
      body: JSON.stringify({
        planId: plan._id,
        expectedRevision: 1, // Stale! Revision is now 2
      }),
    });
    assert.equal(acceptStale.status, 409);
    const errBody = (await acceptStale.json()) as any;
    assert.equal(errBody.code, 'stale_revision');
    assert.ok(errBody.detail.includes('revision mismatch'));
  });

  // Gate T06: "Something hurts" Pain Hold locks loaded movements
  it('Gate T06 (Safety): POST /v1/safety/holds triggers medical hold and eliminates loaded movements', async () => {
    // 1. Trigger knee pain hold
    const holdRes = await fetch(`${baseUrl}/v1/safety/holds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`,
      },
      body: JSON.stringify({
        affectedBodyPart: 'knee',
        reasonCode: 'SH_001_SHARP_PAIN',
        notes: 'Sharp anterior knee pain upon descending into squat',
      }),
    });
    assert.equal(holdRes.status, 200);
    const holdData = ((await holdRes.json()) as any).data;
    assert.equal(holdData.affectedBodyPart, 'knee');
    assert.deepEqual(holdData.restrictedMovements, ['squat', 'lunge']);
    assert.equal(holdData.isCleared, false);

    // 2. Verify Digital Twin compiles the active hold
    const snapRes = await fetch(`${baseUrl}/v1/passport/snapshot`, {
      headers: { Authorization: `Bearer ${athleteToken}` },
    });
    assert.equal(snapRes.status, 200);
    const snapshot = ((await snapRes.json()) as any).data;
    assert.ok(snapshot.activeHolds.length >= 1);
    assert.equal(snapshot.activeHolds[0].affectedBodyPart, 'knee');

    // 3. Generate plan after hold: must NOT contain squat or lunge
    const safePlanRes = await fetch(`${baseUrl}/v1/plans/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`,
      },
      body: JSON.stringify({ targetDate: '2026-11-27' }),
    });
    assert.equal(safePlanRes.status, 201);
    const safePlan = ((await safePlanRes.json()) as any).data;
    assert.equal(safePlan.isRestricted, true);
    for (const ex of safePlan.exercises) {
      assert.notEqual(ex.movementPattern, 'squat', 'Squat must be completely omitted during knee pain hold');
      assert.notEqual(ex.movementPattern, 'lunge', 'Lunge must be completely omitted during knee pain hold');
    }
  });

  // Gate T07: Bunny HLS Token Sign (< 50ms HMAC-SHA256 URL with 15-min expiry)
  it('Gate T07 (Media): GET /v1/content/:id/stream-token returns signed HMAC URL in < 50ms', async () => {
    const start = Date.now();
    const res = await fetch(`${baseUrl}/v1/content/EX-TEST-003/stream-token`, {
      headers: { Authorization: `Bearer ${athleteToken}` },
    });
    const duration = Date.now() - start;

    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.ok(duration < 50, `Stream token signing took ${duration}ms, must be < 50ms`);
    assert.ok(body.data.playbackUrl.includes('token='));
    assert.ok(body.data.playbackUrl.includes('expires='));
    assert.equal(body.data.token.length, 64, 'Token must be 64-char SHA256 hex');

    const ttl = body.data.expiresAt - Math.floor(Date.now() / 1000);
    assert.ok(ttl >= 890 && ttl <= 910, 'TTL must be approximately 900 seconds (15 minutes)');
  });

  // Gate T08: Safety Kill Switches (< 100ms toggle in Redis)
  it('Gate T08 (Admin): Safety Kill Switches toggle in < 100ms and immediately enforce protections', async () => {
    // 1. Admin toggles GLOBAL_AI_KILL_SWITCH to enabled
    const start = Date.now();
    const killRes = await fetch(`${baseUrl}/v1/admin/kill-switches/GLOBAL_AI_KILL_SWITCH`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ enabled: true }),
    });
    const duration = Date.now() - start;

    assert.equal(killRes.status, 200);
    assert.ok(duration < 100, `Kill switch toggle took ${duration}ms, must be < 100ms`);
    const killBody = (await killRes.json()) as any;
    assert.equal(killBody.data.enabled, true);

    // 2. Athlete attempts plan generation -> Forbidden (403 ai_kill_switch_active)
    const blockedGen = await fetch(`${baseUrl}/v1/plans/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`,
      },
      body: JSON.stringify({ targetDate: '2026-11-28' }),
    });
    assert.equal(blockedGen.status, 403);
    const errGen = (await blockedGen.json()) as any;
    assert.equal(errGen.code, 'ai_kill_switch_active');

    // 3. Admin toggles CONTENT_TAKEDOWN_SWITCH to enabled
    await fetch(`${baseUrl}/v1/admin/kill-switches/CONTENT_TAKEDOWN_SWITCH`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ enabled: true }),
    });

    // 4. Content streaming is immediately blocked (403 content_takedown_active)
    const blockedStream = await fetch(`${baseUrl}/v1/content/EX-TEST-003/stream-token`, {
      headers: { Authorization: `Bearer ${athleteToken}` },
    });
    assert.equal(blockedStream.status, 403);
    const errStream = (await blockedStream.json()) as any;
    assert.equal(errStream.code, 'content_takedown_active');

    // 5. Deactivate kill switches
    await fetch(`${baseUrl}/v1/admin/kill-switches/GLOBAL_AI_KILL_SWITCH`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ enabled: false }),
    });
    await fetch(`${baseUrl}/v1/admin/kill-switches/CONTENT_TAKEDOWN_SWITCH`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ enabled: false }),
    });

    // 6. Plan generation resumes cleanly
    const resumed = await fetch(`${baseUrl}/v1/plans/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`,
      },
      body: JSON.stringify({ targetDate: '2026-11-28' }),
    });
    assert.equal(resumed.status, 201);
  });

  // Food & Recovery Logging
  it('Food & Recovery: logs check-in with Daily Readiness Index (0-100) and meals', async () => {
    // 1. Submit recovery checkin
    const recRes = await fetch(`${baseUrl}/v1/recovery/checkins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`,
      },
      body: JSON.stringify({
        sleepQuality: 4,
        sorenessLevel: 2,
        energyLevel: 4,
        stressLevel: 2,
        loggedAt: new Date().toISOString(),
      }),
    });
    assert.equal(recRes.status, 201);
    const recBody = (await recRes.json()) as any;
    assert.ok(
      recBody.data.readinessScore >= 80 && recBody.data.readinessScore <= 100,
      `Expected high readiness score for good recovery, got ${recBody.data.readinessScore}`
    );

    // 2. Submit food log
    const foodRes = await fetch(`${baseUrl}/v1/food/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${athleteToken}`,
      },
      body: JSON.stringify({
        mealName: 'Oats with Whey Protein and Berries',
        mealType: 'breakfast',
        calories: 520,
        proteinGrams: 45,
        carbsGrams: 65,
        fatGrams: 8,
        loggedAt: new Date().toISOString(),
      }),
    });
    assert.equal(foodRes.status, 201);
    const foodBody = (await foodRes.json()) as any;
    assert.equal(foodBody.data.proteinGrams, 45);

    // 3. Query food entries
    const listRes = await fetch(`${baseUrl}/v1/food/entries`, {
      headers: { Authorization: `Bearer ${athleteToken}` },
    });
    assert.equal(listRes.status, 200);
    const listBody = (await listRes.json()) as any;
    assert.equal(listBody.data.length, 1);
    assert.equal(listBody.data[0].mealName, 'Oats with Whey Protein and Berries');
  });

  // Billing Webhook Idempotency
  it('Billing Webhook: Idempotent processing of Stripe event with duplicate rejection', async () => {
    const stripeEvent = {
      id: `evt_test_${crypto.randomUUID()}`,
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          id: `in_test_${crypto.randomUUID()}`,
          customer: `cus_test_${crypto.randomUUID()}`,
          subscription: `sub_test_${crypto.randomUUID()}`,
          amount_paid: 2900,
          currency: 'gbp',
        },
      },
    };

    // First arrival
    const res1 = await fetch(`${baseUrl}/v1/billing/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature_mock',
      },
      body: JSON.stringify(stripeEvent),
    });
    assert.equal(res1.status, 200);
    const body1 = (await res1.json()) as any;
    assert.equal(body1.data.received, true);
    assert.equal(body1.data.deduplicated, false);

    // Duplicate arrival -> Redis deduplication returns deduplicated: true
    const res2 = await fetch(`${baseUrl}/v1/billing/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature_mock',
      },
      body: JSON.stringify(stripeEvent),
    });
    assert.equal(res2.status, 200);
    const body2 = (await res2.json()) as any;
    assert.equal(body2.data.received, true);
    assert.equal(body2.data.deduplicated, true);
  });
});
