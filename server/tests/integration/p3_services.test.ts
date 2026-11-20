import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../../src/app.js';
import { connectDatabase, disconnectDatabase } from '../../src/config/database.js';
import { connectRedis, disconnectRedis } from '../../src/config/redis.js';
import { UserModel } from '../../src/models/user.model.js';
import { PassportFactModel } from '../../src/models/passportFact.model.js';
import { PlanModel } from '../../src/models/plan.model.js';
import { CoachRosterModel } from '../../src/models/coachRoster.model.js';
import { TrainingGroupModel } from '../../src/models/trainingGroup.model.js';
import { CoachProgramModel } from '../../src/models/coachProgram.model.js';
import { PlanAdjustmentAuditModel } from '../../src/models/planAdjustmentAudit.model.js';
import { ScopedGrantModel } from '../../src/models/scopedGrant.model.js';
import { InstitutionModel } from '../../src/models/institution.model.js';
import { InstitutionalSeatModel } from '../../src/models/institutionalSeat.model.js';
import { signAccessToken } from '../../src/utils/jwt.js';

let server: http.Server;
let baseUrl: string;

let athleteToken: string;
let testAthleteId: string;
const testAthleteEmail = 'p3-athlete@test.smackgym.co.uk';

let coachToken: string;
let testCoachId: string;
const testCoachEmail = 'p3-coach@test.smackgym.co.uk';

let adminToken: string;
let testAdminId: string;
const testAdminEmail = 'p3-admin@test.smackgym.co.uk';

let uniStudentToken: string;
let uniStudentId: string;
const uniStudentEmail = 'student.athlete@kcl.ac.uk';

before(async () => {
  await connectDatabase();
  await connectRedis();

  // Clear specific test data
  const testEmails = [testAthleteEmail, testCoachEmail, testAdminEmail, uniStudentEmail, 'varsity_captain@kcl.ac.uk'];
  await UserModel.deleteMany({ email: { $in: testEmails } });
  await CoachRosterModel.deleteMany({});
  await TrainingGroupModel.deleteMany({});
  await CoachProgramModel.deleteMany({});
  await PlanAdjustmentAuditModel.deleteMany({});
  await ScopedGrantModel.deleteMany({});
  await InstitutionModel.deleteMany({});
  await InstitutionalSeatModel.deleteMany({});

  // 1. Create Athlete
  const athlete = await UserModel.create({
    email: testAthleteEmail,
    passwordHash: 'argon2id$v=19$m=65536,t=3,p=4$dummyhash',
    fullName: 'P3 Test Athlete',
    role: 'ATHLETE',
    mode: 'personal',
    is18Plus: true,
    birthDate: new Date('1999-05-10'),
  });
  testAthleteId = athlete._id.toString();
  athleteToken = signAccessToken({
    userId: testAthleteId,
    email: athlete.email,
    role: 'ATHLETE',
    is18Plus: true,
  }).token;

  // 2. Create Coach
  const coach = await UserModel.create({
    email: testCoachEmail,
    passwordHash: 'argon2id$v=19$m=65536,t=3,p=4$dummyhash',
    fullName: 'Coach Alex Henderson',
    role: 'COACH',
    mode: 'professional',
    is18Plus: true,
    birthDate: new Date('1985-03-20'),
  });
  testCoachId = coach._id.toString();
  coachToken = signAccessToken({
    userId: testCoachId,
    email: coach.email,
    role: 'COACH',
    is18Plus: true,
  }).token;

  // 3. Create Super Admin
  const admin = await UserModel.create({
    email: testAdminEmail,
    passwordHash: 'argon2id$v=19$m=65536,t=3,p=4$dummyhash',
    fullName: 'Platform Super Admin',
    role: 'SUPER_ADMIN',
    mode: 'professional',
    is18Plus: true,
    birthDate: new Date('1980-01-01'),
  });
  testAdminId = admin._id.toString();
  adminToken = signAccessToken({
    userId: testAdminId,
    email: admin.email,
    role: 'SUPER_ADMIN',
    is18Plus: true,
  }).token;

  // 4. Create University Student Athlete (@kcl.ac.uk)
  const uniStudent = await UserModel.create({
    email: uniStudentEmail,
    passwordHash: 'argon2id$v=19$m=65536,t=3,p=4$dummyhash',
    fullName: 'KCL Varsity Rower',
    role: 'ATHLETE',
    mode: 'personal',
    is18Plus: true,
    birthDate: new Date('2002-09-15'),
  });
  uniStudentId = uniStudent._id.toString();
  uniStudentToken = signAccessToken({
    userId: uniStudentId,
    email: uniStudent.email,
    role: 'ATHLETE',
    is18Plus: true,
  }).token;

  // Start HTTP server
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
  const testEmails = [testAthleteEmail, testCoachEmail, testAdminEmail, uniStudentEmail, 'varsity_captain@kcl.ac.uk'];
  await UserModel.deleteMany({ email: { $in: testEmails } });
  await CoachRosterModel.deleteMany({});
  await TrainingGroupModel.deleteMany({});
  await CoachProgramModel.deleteMany({});
  await PlanAdjustmentAuditModel.deleteMany({});
  await ScopedGrantModel.deleteMany({});
  await InstitutionModel.deleteMany({});
  await InstitutionalSeatModel.deleteMany({});

  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
  await disconnectRedis();
  await disconnectDatabase();
});

describe('Phase P3 Professional Mode & Multi-Tenant Expansion Services', () => {
  let createdPlanId: string;
  let createdGroupId: string;
  let createdInstitutionId: string;
  let activeGrantId: string;

  describe('1. Coach & Mentor Professional Workspace Subsystem', () => {
    it('should assign an athlete to coach active roster', async () => {
      const res = await fetch(`${baseUrl}/v1/coach/roster/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${coachToken}`,
        },
        body: JSON.stringify({
          athleteId: testAthleteId,
          notes: 'Focus on progressive overload for university squash championship',
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.coachId, testCoachId);
      assert.equal(json.data.athleteId, testAthleteId);
      assert.equal(json.data.status, 'active');
    });

    it('should list coach roster with enriched athlete details', async () => {
      const res = await fetch(`${baseUrl}/v1/coach/roster`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${coachToken}`,
        },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.count >= 1);
      assert.equal(json.data[0].athlete.email, testAthleteEmail);
    });

    it('should create a training group and add athlete', async () => {
      const createRes = await fetch(`${baseUrl}/v1/coach/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${coachToken}`,
        },
        body: JSON.stringify({
          name: 'Varsity Squad A',
          description: 'High-intensity power and rate of force development cohort',
        }),
      });

      assert.equal(createRes.status, 201);
      const createJson = await createRes.json();
      assert.equal(createJson.success, true);
      createdGroupId = createJson.data._id;

      const addRes = await fetch(`${baseUrl}/v1/coach/groups/${createdGroupId}/athletes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${coachToken}`,
        },
        body: JSON.stringify({
          athleteId: testAthleteId,
        }),
      });

      assert.equal(addRes.status, 200);
      const addJson = await addRes.json();
      assert.ok(addJson.data.athleteIds.includes(testAthleteId));
    });

    it('should author a structured multi-week training program', async () => {
      const res = await fetch(`${baseUrl}/v1/coach/programs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${coachToken}`,
        },
        body: JSON.stringify({
          title: 'Off-Season Power Periodization',
          description: '12-week undulating periodization cycle for explosive power',
          weeksCount: 12,
          difficulty: 'advanced',
          weeklySchedule: [
            { dayNumber: 1, focus: 'Lower Body Max Strength', exerciseIds: ['EX-0001', 'EX-0002'] },
            { dayNumber: 2, focus: 'Upper Body Hypertrophy', exerciseIds: ['EX-0003'] },
          ],
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.title, 'Off-Season Power Periodization');
      assert.equal(json.data.weeksCount, 12);
    });

    it('should allow coach to propose plan adjustments and create immutable audit log', async () => {
      // 1. Athlete generates a training plan first
      const planRes = await fetch(`${baseUrl}/v1/plans/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${athleteToken}`,
        },
        body: JSON.stringify({
          targetDate: '2026-04-01',
        }),
      });
      assert.equal(planRes.status, 201);
      const planJson = await planRes.json();
      createdPlanId = planJson.data._id;

      // 2. Coach adjusts athlete plan
      const adjustRes = await fetch(`${baseUrl}/v1/coach/athletes/${testAthleteId}/plans/${createdPlanId}/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${coachToken}`,
        },
        body: JSON.stringify({
          rationale: 'Increasing back squat working sets from 3 to 4 based on velocity threshold',
          proposedExercises: [
            {
              exerciseId: 'EX-0001',
              name: 'Barbell Back Squat',
              targetSets: 4,
              targetReps: 6,
              targetWeightKg: 100,
            },
            {
              exerciseId: 'EX-0002',
              name: 'Romanian Deadlift',
              targetSets: 3,
              targetReps: 8,
              targetWeightKg: 85,
            },
          ],
        }),
      });

      assert.equal(adjustRes.status, 200);
      const adjustJson = await adjustRes.json();
      assert.equal(adjustJson.success, true);
      assert.equal(adjustJson.data.plan.status, 'adapted');
      assert.equal(adjustJson.data.auditLog.coachId, testCoachId);
      assert.equal(adjustJson.data.auditLog.athleteId, testAthleteId);

      // 3. Verify audit log retrieval
      const auditRes = await fetch(`${baseUrl}/v1/coach/athletes/${testAthleteId}/plans/${createdPlanId}/audit-logs`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${coachToken}`,
        },
      });
      assert.equal(auditRes.status, 200);
      const auditJson = await auditRes.json();
      assert.ok(auditJson.count >= 1);
      assert.ok(auditJson.data[0].rationale.includes('velocity threshold'));
    });
  });

  describe('2. Gate T13: UK GDPR Article 9 ScopedGrant Projection Firewall', () => {
    before(async () => {
      // Configure athlete's special category data:
      // A) Religious fasting data
      await fetch(`${baseUrl}/v1/fasting/config`, {
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

      // B) Menstrual cycle health data
      await fetch(`${baseUrl}/v1/cycle/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${athleteToken}`,
        },
        body: JSON.stringify({
          cycleDay: 21,
          overallSymptomSeverity: 4,
          fatigueSeverity: 4,
          notes: 'Luteal fatigue',
        }),
      });
    });

    it('Gate T13 (Default / No Grant): Coach query strictly redacts faith and menstrual data', async () => {
      const res = await fetch(`${baseUrl}/v1/coach/athletes/${testAthleteId}/passport`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${coachToken}`,
        },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.gdprArticle9Protected, true);

      // Verify Passport Facts redaction
      const fastingFact = json.data.facts.find((f: any) => f.key === 'fasting_config');
      assert.ok(fastingFact);
      assert.equal(fastingFact.value.redacted, true);
      assert.equal(fastingFact.value.reason, 'REDACTED_GDPR_ARTICLE_9_NO_GRANT');

      const cycleFact = json.data.facts.find((f: any) => f.key === 'menstrual_cycle_status');
      assert.ok(cycleFact);
      assert.equal(cycleFact.value.redacted, true);
      assert.equal(cycleFact.value.reason, 'REDACTED_GDPR_ARTICLE_9_NO_GRANT');

      // Verify Digital Twin flags
      assert.equal(json.data.digitalTwin.fastingRedacted, true);
      assert.equal(json.data.digitalTwin.cycleRedacted, true);
      assert.equal(json.data.digitalTwin.isFastingRamadan, false);
      assert.equal(json.data.digitalTwin.menstrualPhase, undefined);
    });

    it('Gate T13 (With ScopedGrant): Athlete grants access and coach can view unredacted data', async () => {
      // 1. Athlete grants fasting_data and cycle_data scopes to coach
      const grantRes = await fetch(`${baseUrl}/v1/grants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${athleteToken}`,
        },
        body: JSON.stringify({
          coachId: testCoachId,
          scopes: ['fasting_data', 'cycle_data', 'training_logs'],
          durationDays: 30,
        }),
      });

      assert.equal(grantRes.status, 201);
      const grantJson = await grantRes.json();
      activeGrantId = grantJson.data._id;
      assert.equal(grantJson.data.isActive, true);
      assert.ok(grantJson.data.scopes.includes('fasting_data'));
      assert.ok(grantJson.data.scopes.includes('cycle_data'));

      // 2. Coach queries athlete passport again
      const queryRes = await fetch(`${baseUrl}/v1/coach/athletes/${testAthleteId}/passport`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${coachToken}`,
        },
      });

      assert.equal(queryRes.status, 200);
      const queryJson = await queryRes.json();
      assert.equal(queryJson.success, true);

      // Verified: Values are now unredacted
      const fastingFact = queryJson.data.facts.find((f: any) => f.key === 'fasting_config');
      assert.equal(fastingFact.value.redacted, undefined);
      assert.equal(fastingFact.value.fastingType, 'RAMADAN');

      const cycleFact = queryJson.data.facts.find((f: any) => f.key === 'menstrual_cycle_status');
      assert.equal(cycleFact.value.redacted, undefined);
      assert.equal(cycleFact.value.phase, 'luteal');

      assert.equal(queryJson.data.digitalTwin.fastingRedacted, undefined);
      assert.equal(queryJson.data.digitalTwin.cycleRedacted, undefined);
      assert.equal(queryJson.data.digitalTwin.isFastingRamadan, true);
      assert.equal(queryJson.data.digitalTwin.menstrualPhase, 'luteal');
    });

    it('Gate T13 (Revocation): Athlete revokes grant and data is immediately re-redacted', async () => {
      // 1. Athlete revokes grant
      const revokeRes = await fetch(`${baseUrl}/v1/grants/${activeGrantId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${athleteToken}`,
        },
      });

      assert.equal(revokeRes.status, 200);
      const revokeJson = await revokeRes.json();
      assert.equal(revokeJson.data.isActive, false);

      // 2. Coach queries passport -> immediately protected again
      const queryRes = await fetch(`${baseUrl}/v1/coach/athletes/${testAthleteId}/passport`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${coachToken}`,
        },
      });

      assert.equal(queryRes.status, 200);
      const queryJson = await queryRes.json();
      const fastingFact = queryJson.data.facts.find((f: any) => f.key === 'fasting_config');
      assert.equal(fastingFact.value.redacted, true);
    });
  });

  describe('3. Gate T14: Institutional University Licensing & Bulk Seat Provisioning', () => {
    it('should create an institutional university account with domain pattern @*.ac.uk', async () => {
      const res = await fetch(`${baseUrl}/v1/institutions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: "King's College London Athletic Union",
          domainPattern: '@.*\\.ac\\.uk$',
          totalSeats: 500,
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.totalSeats, 500);
      assert.equal(json.data.usedSeats, 0);
      createdInstitutionId = json.data._id;
    });

    it('Gate T14 (Enterprise Bulk Provision): Single purchase provisions 500 additional active seats', async () => {
      const res = await fetch(`${baseUrl}/v1/institutions/${createdInstitutionId}/provision-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          seatsToAdd: 500,
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      // 500 initial + 500 added = 1,000 total seats
      assert.equal(json.data.totalSeats, 1000);
      assert.equal(json.data.usedSeats, 0);
    });

    it('Gate T14 (Student Seat Claim): Student with @kcl.ac.uk email claims institutional seat', async () => {
      const res = await fetch(`${baseUrl}/v1/institutions/claim-seat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${uniStudentToken}`,
        },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.seat.status, 'active');
      assert.equal(json.data.institution.usedSeats, 1);
    });

    it('Gate T14 (Domain Rejection): Non-accredited email domain is rejected with 403', async () => {
      // Standard athlete with non-ac.uk domain tries to claim institutional seat
      const res = await fetch(`${baseUrl}/v1/institutions/claim-seat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${athleteToken}`,
        },
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.code, 'institutional_domain_mismatch');
    });

    it('should support SAML 2.0 / OIDC enterprise SSO assertion login', async () => {
      const res = await fetch(`${baseUrl}/v1/institutions/sso/saml`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'varsity_captain@kcl.ac.uk',
          fullName: 'Varsity Captain',
          institutionDomain: 'kcl.ac.uk',
          samlAssertionToken: 'saml-assert-token-2026',
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.data.tokens.accessToken);
      assert.equal(json.data.user.email, 'varsity_captain@kcl.ac.uk');
      assert.equal(json.data.institution.name, "King's College London Athletic Union");
    });
  });

  describe('4. Regional Language Localization (Bengali, Hindi, Urdu, English)', () => {
    it('should retrieve Bengali localization bundle on GET /v1/i18n/translations?lang=bn', async () => {
      const res = await fetch(`${baseUrl}/v1/i18n/translations?lang=bn`, {
        method: 'GET',
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.locale, 'bn');
      assert.ok(json.translations.forbidden_underage.includes('বয়স ১৮ বছর'));
      assert.ok(json.translations.ramadan_suhoor_reminder.includes('সেহরি'));
    });

    it('should translate individual key dynamically for Hindi and Urdu', async () => {
      // Hindi
      const hiRes = await fetch(`${baseUrl}/v1/i18n/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'forbidden_underage', lang: 'hi' }),
      });
      assert.equal(hiRes.status, 200);
      const hiJson = await hiRes.json();
      assert.ok(hiJson.translation.includes('आयु 18 वर्ष'));

      // Urdu
      const urRes = await fetch(`${baseUrl}/v1/i18n/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'forbidden_underage', lang: 'ur' }),
      });
      assert.equal(urRes.status, 200);
      const urJson = await urRes.json();
      assert.ok(urJson.translation.includes('عمر 18 سال'));
    });

    it('should localize RFC 7807 problem details error message based on Accept-Language header', async () => {
      // Trigger underage registration with Bengali header
      const res = await fetch(`${baseUrl}/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'bn-BD,bn;q=0.9',
        },
        body: JSON.stringify({
          email: 'underage_bengali@test.smackgym.co.uk',
          password: 'Password123!',
          fullName: 'Anik Rahman',
          is18Plus: false,
          birthDate: '2012-01-01T00:00:00.000Z',
          consentGiven: true,
        }),
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.code, 'forbidden_underage');
      assert.ok(json.detail.includes('বয়স ১৮ বছর বা তার বেশি'));
    });
  });
});
