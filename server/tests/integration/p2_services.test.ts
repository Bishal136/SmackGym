import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../../src/app.js';
import { connectDatabase, disconnectDatabase } from '../../src/config/database.js';
import { connectRedis, disconnectRedis, getRedisClient } from '../../src/config/redis.js';
import { UserModel } from '../../src/models/user.model.js';
import { PassportFactModel } from '../../src/models/passportFact.model.js';
import { ResearchCardModel } from '../../src/models/researchCard.model.js';
import { ExerciseModel } from '../../src/models/exercise.model.js';
import { signAccessToken } from '../../src/utils/jwt.js';

let server: http.Server;
let baseUrl: string;
let athleteToken: string;
let testAthleteId: string;
const testAthleteEmail = 'p2-athlete@test.smackgym.co.uk';

before(async () => {
  await connectDatabase();
  await connectRedis();

  // Clear test data
  await UserModel.deleteMany({ email: testAthleteEmail });
  await PassportFactModel.deleteMany({});
  await ResearchCardModel.deleteMany({});
  await ExerciseModel.deleteMany({});

  // Seed sample exercises
  await ExerciseModel.create([
    {
      _id: 'EX-P2-001',
      name: 'Safety Bar Squat',
      movementPattern: 'squat',
      targetMuscles: ['quadriceps', 'glutes'],
      equipmentRequired: ['barbell', 'rack'],
      setupCues: ['Grip handles', 'Brace torso'],
      videoAssetId: 'vid-p2-squat',
      isLicensed: true,
      isCompound: true,
    },
    {
      _id: 'EX-P2-002',
      name: 'Romanian Deadlift',
      movementPattern: 'hinge',
      targetMuscles: ['hamstrings', 'glutes'],
      equipmentRequired: ['barbell'],
      setupCues: ['Hinge hips back', 'Neutral spine'],
      videoAssetId: 'vid-p2-rdl',
      isLicensed: true,
      isCompound: true,
    },
  ]);

  // Create test athlete
  const athlete = await UserModel.create({
    email: testAthleteEmail,
    passwordHash: 'argon2id$v=19$m=65536,t=3,p=4$dummyhash',
    fullName: 'P2 Test Athlete',
    role: 'ATHLETE',
    mode: 'personal',
    is18Plus: true,
    birthDate: new Date('1998-05-15'),
  });
  testAthleteId = athlete._id.toString();

  athleteToken = signAccessToken({
    userId: testAthleteId,
    email: athlete.email,
    role: 'ATHLETE',
    is18Plus: true,
  }).token;

  // Start HTTP server on dynamic port
  server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const address = server.address() as { port: number };
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

after(async () => {
  await UserModel.deleteMany({ email: testAthleteEmail });
  await PassportFactModel.deleteMany({});
  await ResearchCardModel.deleteMany({});
  await ExerciseModel.deleteMany({});

  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
  await disconnectRedis();
  await disconnectDatabase();
});

describe('Phase P2 Scale, Retention & Research Ingestion Services', () => {
  describe('Gate T09: Ramadan Fasting Mode & Circadian Hydration Adaptation', () => {
    it('should configure Ramadan fasting window and calculate night hydration shift', async () => {
      const res = await fetch(`${baseUrl}/v1/fasting/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${athleteToken}`,
        },
        body: JSON.stringify({
          isActive: true,
          fastingType: 'RAMADAN',
          fajrTime: '04:30',
          maghribTime: '18:30',
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.fastingType, 'RAMADAN');
      assert.equal(json.data.hydrationSchedule.suhoorTargetMl, 900); // 30% of 3000ml
      assert.equal(json.data.hydrationSchedule.iftarTargetMl, 2100); // 70% of 3000ml
      assert.equal(json.data.hydrationSchedule.daytimeTargetMl, 0);
    });

    it('should retrieve current fasting status and next meal milestone', async () => {
      const res = await fetch(`${baseUrl}/v1/fasting/status`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${athleteToken}`,
        },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.isFastingRamadan, true);
      assert.ok(['suhoor', 'iftar'].includes(json.data.nextAllowedMeal));
    });

    it('should adapt training plan with ADAPT_RAMADAN_HYDRATION_SHIFT reason code', async () => {
      const res = await fetch(`${baseUrl}/v1/plans/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${athleteToken}`,
        },
        body: JSON.stringify({
          dayOfWeek: 'Monday',
          targetDurationMinutes: 60,
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.data.rationaleCodes.includes('ADAPT_RAMADAN_HYDRATION_SHIFT'));
      for (const item of json.data.exercises) {
        assert.ok(item.targetSets <= 2);
      }
    });
  });

  describe('Gate T10: Menstrual Cycle Load Modulation & Luteal Deload', () => {
    it('should log high-symptom luteal phase and trigger automatic deload recommendation', async () => {
      const res = await fetch(`${baseUrl}/v1/cycle/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${athleteToken}`,
        },
        body: JSON.stringify({
          cycleDay: 22,
          overallSymptomSeverity: 4,
          crampsSeverity: 3,
          fatigueSeverity: 4,
          notes: 'High lethargy and low recovery rate',
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.phase, 'luteal');
      assert.equal(json.data.deloadRecommended, true);
      assert.equal(json.data.volumeMultiplier, 0.75); // 25% volume drop
      assert.equal(json.data.adaptationReasonCode, 'ADAPT_MENSTRUAL_LUTEAL_DELOAD');
    });

    it('should retrieve latest menstrual cycle status from athlete Passport', async () => {
      const res = await fetch(`${baseUrl}/v1/cycle/status`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${athleteToken}`,
        },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.phase, 'luteal');
      assert.equal(json.data.deloadRecommended, true);
    });

    it('should adapt training plan with ADAPT_MENSTRUAL_LUTEAL_DELOAD and 25% set reduction', async () => {
      const res = await fetch(`${baseUrl}/v1/plans/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${athleteToken}`,
        },
        body: JSON.stringify({
          dayOfWeek: 'Tuesday',
          targetDurationMinutes: 45,
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.data.rationaleCodes.includes('ADAPT_MENSTRUAL_LUTEAL_DELOAD'));

      // Check sets reduced (compound sets usually 3 -> reduced to 2)
      for (const item of json.data.exercises) {
        assert.ok(item.targetSets <= 2);
      }
    });
  });

  describe('Gate T11: Scientific Research Ingestion & SSRF Pre-Flight Guard', () => {
    it('should reject SSRF attack against loopback 127.0.0.1 with RFC 7807 400', async () => {
      const res = await fetch(`${baseUrl}/v1/research/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${athleteToken}`,
        },
        body: JSON.stringify({
          targetUrl: 'http://127.0.0.1:4000/api/internal',
          source: 'pubmed',
        }),
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.code, 'ssrf_target_blocked');
      assert.ok(json.detail.includes('prohibited'));
    });

    it('should reject SSRF attack against AWS/GCP metadata service 169.254.169.254', async () => {
      const res = await fetch(`${baseUrl}/v1/research/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${athleteToken}`,
        },
        body: JSON.stringify({
          targetUrl: 'http://169.254.169.254/latest/meta-data/iam/security-credentials/',
          source: 'pubmed',
        }),
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.code, 'ssrf_target_blocked');
    });

    it('should reject SSRF attack against RFC 1918 private range 10.0.0.1', async () => {
      const res = await fetch(`${baseUrl}/v1/research/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${athleteToken}`,
        },
        body: JSON.stringify({
          targetUrl: 'http://10.0.0.1/admin-panel',
          source: 'pubmed',
        }),
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.code, 'ssrf_target_blocked');
    });

    it('should ingest legitimate public research paper and persist verified card', async () => {
      const res = await fetch(`${baseUrl}/v1/research/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${athleteToken}`,
        },
        body: JSON.stringify({
          targetUrl: 'https://pubmed.ncbi.nlm.nih.gov/38291029/',
          source: 'pubmed',
          exerciseIds: ['EX-P2-001'],
          title: 'Mechanical Tension and Hypertrophy in Compound Movements',
          doi: '10.1519/JSC.0000000000004521',
          publishedYear: 2026,
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.evidenceGrade, 'GRADE_A');
      assert.equal(json.data.isVerified, true);
    });

    it('should query verified research cards filtered by exerciseId', async () => {
      const res = await fetch(`${baseUrl}/v1/research/cards?exerciseId=EX-P2-001`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${athleteToken}`,
        },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.data.length >= 1);
      assert.equal(json.data[0].exerciseIds.includes('EX-P2-001'), true);
    });
  });

  describe('Gate T12: Ask SMACK AI Coaching, Clinical Triage & 10s Circuit Breaker', () => {
    it('should triage clinical red-flag prompts (eating disorder/self-harm) without invoking LLM', async () => {
      const res = await fetch(`${baseUrl}/v1/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${athleteToken}`,
        },
        body: JSON.stringify({
          prompt: 'I feel fat and guilty after eating carbs, I want to starve and vomit',
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.clinicalAlert, true);
      assert.equal(json.data.model, 'clinical-safety-triage-v1');
      assert.equal(json.data.fallbackApplied, false);
      assert.ok(json.data.emergencyResources.length > 0);
      assert.ok(json.data.content.includes('Beat Eating Disorders'));
    });

    it('should generate conversational coaching advice under normal latency', async () => {
      const res = await fetch(`${baseUrl}/v1/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${athleteToken}`,
        },
        body: JSON.stringify({
          prompt: 'How should I optimize my rest intervals for safety bar squats?',
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.fallbackApplied, false);
      assert.ok(json.data.tokensUsed > 0);
      assert.ok(json.data.durationMs < 1000);
    });

    it('should trigger deterministic 10s fallback circuit breaker when LLM latency exceeds 10s', async () => {
      const start = Date.now();
      const res = await fetch(`${baseUrl}/v1/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${athleteToken}`,
        },
        body: JSON.stringify({
          prompt: 'Give me complex biomechanical analysis of Romanian deadlifts',
          simulateDelayMs: 12000, // Exceeds 10,000ms circuit breaker
        }),
      });

      const elapsedMs = Date.now() - start;

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.fallbackApplied, true);
      assert.equal(json.data.model, 'deterministic-decision-engine-fallback');
      assert.ok(json.data.content.includes('SMACKGYM Decision Engine'));

      // Strict Gate T12 verification: Must complete in <= 10.1s
      assert.ok(elapsedMs >= 9900 && elapsedMs <= 10200, `Elapsed time ${elapsedMs}ms outside circuit breaker window`);
    });
  });

  describe('Observability: Prometheus Metrics Exposition Endpoint', () => {
    it('should expose Prometheus metrics on GET /metrics with text/plain format', async () => {
      const res = await fetch(`${baseUrl}/metrics`, {
        method: 'GET',
      });

      assert.equal(res.status, 200);
      assert.ok(res.headers.get('content-type')?.includes('text/plain'));
      const text = await res.text();
      assert.ok(text.includes('# HELP process_resident_memory_bytes'));
      assert.ok(text.includes('# HELP http_requests_total'));
      assert.ok(text.includes('smackgym_system_status 1'));
    });

    it('should expose Prometheus metrics on GET /v1/metrics', async () => {
      const res = await fetch(`${baseUrl}/v1/metrics`, {
        method: 'GET',
      });

      assert.equal(res.status, 200);
      const text = await res.text();
      assert.ok(text.includes('http_requests_total'));
    });
  });
});
