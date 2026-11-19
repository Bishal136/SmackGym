# SMACKGYM Backend Server — Engineering, Clinical Safety & NoSQL Rules (`server/docs/rules.md`)

> **Document Status:** Active & Enforced Invariant Specification  
> **Applicability:** All code in `/server/src/`, background workers, test suites, and database scripts.

---

## 1. Zero-SQL Mandate & Database Persistence Invariants

### 1.1 Strict Zero-SQL Policy (`RULE-DB-01`)
* Under no circumstances may any SQL database (PostgreSQL, MySQL, SQLite, MariaDB, MS SQL) or relational ORM (Prisma, TypeORM, Sequelize, Drizzle, Knex) be introduced to this repository.
* All persistent data must be modeled and stored in **MongoDB 8.0** using **Mongoose ODM**.
* Ephemeral caching, distributed locks, rate limits, session blacklists, and asynchronous job queues must reside in **Redis 7.4+** via **ioredis** and **BullMQ**.
* Client-side offline cache and queue storage must use encrypted **react-native-mmkv** (mobile) and **IndexedDB** (web).

### 1.2 Mongoose Schema & Indexing Standards (`RULE-DB-02`)
* **UUID Primary Keys for Offline Resilience:** High-velocity entities generated on mobile (`SessionEvent`, `CompletedSet`) must use client-generated RFC 4122 UUIDv4 strings as primary keys (`_id: { type: String, default: uuidv4 }`), never auto-incrementing integers.
* **Mandatory Compound Indexes (ESR Rule):** Every query executed in a controller or service must hit a covering or compound index following the **Equality, Sort, Range (ESR)** design pattern:
  ```typescript
  // Example: Querying active session events for an athlete within a date range
  SessionEventSchema.index({ athlete_id: 1, session_id: 1, event_timestamp: -1 });
  ```
* **No Table Scans:** Queries that perform collection scans (`COLLSCAN`) in production are considered critical bugs. Index hints or explain checks must be verified in integration tests.

### 1.3 Optimistic Concurrency Control (`RULE-DB-03`)
* Every mutable business document (`PlanVersion`, `PassportFact`, `FoodEntry`, `Account`) must contain an integer `revision` field initialized to `1`:
  ```typescript
  revision: { type: Number, required: true, default: 1 }
  ```
* Mutation queries must conditionally match the expected revision and atomically increment it:
  ```typescript
  const updated = await PlanVersionModel.findOneAndUpdate(
    { _id: planId, revision: expectedRevision },
    { $set: updatePayload, $inc: { revision: 1 } },
    { new: true }
  );
  if (!updated) {
    throw new ConcurrencyError("Plan was modified by another session", 409, "stale_revision");
  }
  ```
* Any mutation collision must immediately return HTTP `409 Conflict` with the standard RFC 7807 error payload.

### 1.4 ACID Transactions & Outbox Pattern (`RULE-DB-04`)
* Multi-document state updates (such as accepting an adapted plan and archiving the prior version, or emitting an event to the transactional outbox) must execute inside a MongoDB transaction:
  ```typescript
  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    // 1. Mutate primary business entity
    // 2. Insert into OutboxCollection
  });
  await session.endSession();
  ```
* A background BullMQ worker consumes `OutboxCollection` records to dispatch external webhooks, push notifications, and analytics events.

---

## 2. Clinical Safety & Algorithmic Guardrails

### 2.1 Non-Bypassable Pain Safety Hold (`RULE-SAFE-01`)
* If an athlete logs sharp pain or triggers `Something hurts` during a workout session, the server must immediately:
  1. Record an active `MedicalHold` fact in the athlete's `Passport`.
  2. Restrict all loaded compound exercises targeting the affected joint or muscle group.
  3. Emit a real-time WebSocket event freezing workout timers.
* **No Override Invariant:** Neither an automated AI prompt nor a human coach can programmatically override or bypass an active medical safety hold. Only explicit clearance by the athlete or a documented medical resolution by the `SUPER_ADMIN` can clear the hold.

### 2.2 Hard 10-Second Fallback for Generative AI (`RULE-SAFE-02`)
* All calls to external LLM providers (OpenAI, Anthropic, Google Gemini) via `adapters/llm.adapter.ts` must be bounded by a strict `10,000ms` Promise race timeout.
* If the LLM provider fails, returns invalid JSON, throws a rate-limit error (429), or exceeds 10 seconds, the service must catch the failure and immediately return pre-computed, deterministic rule-based advice:
  ```typescript
  const aiExplanation = await Promise.race([
    llmAdapter.generateExplanation(planDiff),
    timeout(10000, fallbackRuleExplanation(planDiff))
  ]);
  ```
* The user must never experience a hanging UI or 504 Gateway Timeout due to AI latency.

### 2.3 18+ Age Invariant Gate (`RULE-SAFE-03`)
* All workout execution, personalized plan generation, and coach messaging endpoints must be protected by the `ageGateMiddleware`.
* If `account.birth_date` indicates an age $< 18$, the request is terminated with HTTP `403 Forbidden` (`code: "forbidden_underage"`).
* Age verification must be enforced server-side and cannot be satisfied by client-side flags alone.

---

## 3. Data Sovereignty & UK GDPR Article 9 Governance

### 3.1 `ScopedGrant` Firewall for Article 9 Data (`RULE-SEC-01`)
* UK GDPR Article 9 Special Category Data includes:
  - Religious fasting windows & practices
  - Menstrual cycle tracking & reproductive symptoms
  - Pregnancy status & postpartum recovery metrics
  - Raw uncurated `Ask SMACK AI` chat transcripts
* When a Coach queries an athlete (`GET /v1/coach/athletes/:id`), the `scopedGrantMiddleware` must intercept the query and apply field projection redaction:
  ```typescript
  // Default redacted fields unless explicitly granted in unexpired ScopedGrant
  const REDACTED_FIELDS = [
    "passport.religious_fasting",
    "passport.menstrual_cycle",
    "passport.pregnancy",
    "ai_chats"
  ];
  ```
* Any unauthorized attempt by a coach to access these fields returns HTTP `403 Forbidden` (`code: "insufficient_grant_scope"`).

### 3.2 Automated PII Redaction in Logging (`RULE-SEC-02`)
* The structured logger (`src/utils/logger.ts`) must filter all payloads before writing to console or file logs.
* The following keys must be automatically sanitized to `[REDACTED]`:
  `password`, `token`, `authorization`, `refresh_token`, `credit_card`, `cvv`, `nhs_number`, `secret`.
* Raw user medical facts and chat prompts must never be logged at `INFO` or `WARN` levels.

### 3.3 Server-Side Request Forgery (SSRF) Prevention (`RULE-SEC-03`)
* All external content ingestion fetchers (PubMed, Crossref, Substack RSS) in `src/adapters/` must resolve hostnames to IP addresses prior to HTTP requests.
* Outbound connections to private IP ranges (RFC 1918 `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, loopback `127.0.0.1`, link-local `169.254.0.0/16`) must be immediately blocked and logged as security anomalies.

### 3.4 Idempotency on State-Mutating APIs (`RULE-SEC-04`)
* All endpoints that mutate plans, financial subscriptions, or session events (`POST`, `PUT`, `PATCH`) must support the `Idempotency-Key` header.
* Cached responses for identical idempotency keys are stored in Redis for 24 hours. Repeating a request with the same key returns the exact cached HTTP response without re-executing business logic.

---

## 4. Layered Code Architecture & Clean Boundaries

To maintain clean separation of concerns and high developer velocity, code in `/server/src/` must adhere to strict layer-by-type boundaries:

```
src/
├── adapters/       --> External network clients (Stripe, Bunny, LLM, PubMed). Zero Express req/res.
├── config/         --> Zod-validated env, Mongo connection pool, Redis client.
├── controllers/    --> Express handlers. Parse req, call service, return JSON. No business logic.
├── middlewares/    --> Request filtering (Auth, RBAC, ScopedGrant, Idempotency, RateLimit).
├── models/         --> Mongoose schemas, document interfaces, compound index definitions.
├── prompts/        --> System prompt templates, clinical red-flag guardrails, few-shot contexts.
├── queues/         --> BullMQ queue instances and job payload definitions.
├── routes/         --> Express Router mounting and endpoint path registration.
├── scripts/        --> One-off maintenance and seeding utilities.
├── services/       --> Pure business logic, Decision Engine, sync reconciliation. No req/res objects.
├── sockets/        --> WebSocket handlers for live workout timers and notifications.
├── utils/          --> Logger, crypto helpers, domain error hierarchy, transaction helpers.
├── validators/     --> Zod DTO validation schemas.
└── workers/        --> BullMQ background consumers (outbox dispatch, media QA, GDPR erasure).
```

### 4.1 Strict Layer Invariants
1. **No Express in Services:** Services must never accept Express `Request` or `Response` objects. They accept pure TypeScript primitives, DTOs, or domain objects, and return pure domain models or throw domain error classes.
2. **No Raw Queries in Controllers:** Controllers must never call Mongoose methods (`Model.find()`, `Model.findOneAndUpdate()`) directly. All database access is encapsulated inside Services.
3. **Zod Validation at the Edge:** Every request body, query parameter, and path parameter must be parsed and validated by a Zod schema in `src/validators/` before reaching a controller.
4. **RFC 7807 Error Responses:** All error responses must adhere to the standard format:
   ```json
   {
     "type": "https://api.smackgym.com/errors/stale_revision",
     "title": "Conflict",
     "status": 409,
     "detail": "Plan has been modified by another concurrent session.",
     "instance": "/v1/plans/plan_123/accept",
     "code": "stale_revision",
     "timestamp": "2026-11-19T08:00:00.000Z"
   }
   ```

---

## 5. TypeScript & Coding Standards

* **TypeScript Version:** Strictly TypeScript 5.8+ under `node26` target.
* **Strict Mode:** `"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true` must be enabled in `tsconfig.json`. Use of `any` is strictly prohibited; use `unknown` with type narrowing.
* **ESM Modules:** 100% native ECMAScript Modules (`"type": "module"` in `package.json`). All relative imports must include the `.js` extension per TypeScript ESM requirements.
* **Environment Secrets:** Secrets must be read exclusively from `src/config/env.ts` which validates `process.env` against a comprehensive Zod schema at process startup. Accessing `process.env` directly in feature files is prohibited.
