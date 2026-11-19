# SMACKGYM Backend Server — Phased Rollout & Release Capability Register (`server/docs/phases.md`)

> **Document Status:** Authoritative Rollout Roadmap  
> **Alignment:** SMACKGYM Master Monorepo Plan, Milestones M0–M6, Staging Verification Gates T01–T16.

---

## 1. Phased Delivery Roadmap Overview

The backend implementation follows a structured 5-phase rollout designed to guarantee clinical safety, sub-100ms gym logging, and strict data sovereignty from day one, scaling progressively from the UK university pilot to global multi-tenant federation:

```text
+---------------------------------------------------------------------------------------------------------+
| Phase P0: Core Foundations & Security Baseline (Milestone M0)                                           |
|   - Zero-SQL MongoDB 8.0 Replica Set, Redis 7.4, 18+ Age Gate, Argon2id/JWT Auth, Zod Validation Pipeline |
+---------------------------------------------------------------------------------------------------------+
                                                     │
                                                     ▼
+---------------------------------------------------------------------------------------------------------+
| Phase P1: MVP / University Pilot Core Services (Milestones M1–M2)                                       |
|   - Performance Passport, Deterministic Decision Engine, <100ms UUID Batch Sync, Bunny HLS, Stripe UK   |
+---------------------------------------------------------------------------------------------------------+
                                                     │
                                                     ▼
+---------------------------------------------------------------------------------------------------------+
| Phase P2: Scale, Retention & Research Ingestion (Milestones M3–M4)                                      |
|   - Ramadan/Fasting Mode, Menstrual Phase Logic, SSRF-Safe PubMed/Crossref Workers, OpenTelemetry       |
+---------------------------------------------------------------------------------------------------------+
                                                     │
                                                     ▼
+---------------------------------------------------------------------------------------------------------+
| Phase P3: Professional Mode & Multi-Tenant Expansion (Milestone M5)                                     |
|   - Coach Workspace, ScopedGrant Article 9 Firewall, University Bulk Seats, Bengali/Hindi/Urdu Strings  |
+---------------------------------------------------------------------------------------------------------+
                                                     │
                                                     ▼
+---------------------------------------------------------------------------------------------------------+
| Phase P4: Specialist Pathways & Global Commerce (Milestone M6)                                          |
|   - Stripe Connect Coach Payouts, Postpartum Safety Protocols, Arabic RTL Support, Multi-Region Replicas |
+---------------------------------------------------------------------------------------------------------+
```

---

## 2. Detailed Phase Breakdown & Capability Register

### Phase P0: Core Foundations & Security Baseline
* **Target Milestone:** Milestone `M0`  
* **Objective:** Establish the containerized runtime, database connectivity, security middleware, and authentication boundaries.
* **Core Capabilities Delivered:**
  1. **Runtime & Infrastructure Configuration:**
     - Docker Compose configuration for single-node MongoDB 8.0 Replica Set (enabling multi-document ACID transactions) and Redis 7.4.
     - Environment validation module (`src/config/env.ts`) using strict Zod parsing.
     - Mongoose connection manager (`src/config/database.ts`) with automated reconnection backoff and replica set health monitoring.
  2. **Security & Identity Pipeline:**
     - Registration and authentication routes (`/v1/auth/register`, `/v1/auth/login`, `/v1/auth/refresh`).
     - Argon2id password hashing and asymmetric RS256 JWT generation with 15-minute access tokens.
     - Token revocation blacklist in Redis for instant logout and session invalidation.
     - Mandatory `18+` Age Gate middleware (`src/middlewares/ageGate.ts`) terminating underage requests with HTTP `403`.
     - Granular UK GDPR consent collection and audit storage (`ConsentRecordModel`).
  3. **Foundational Middlewares & Utilities:**
     - Correlation ID tracing (`X-Correlation-ID`) across all request logs.
     - Redis sliding-window distributed rate limiter (`src/middlewares/rateLimiter.ts`).
     - RFC 7807 Problem Details error handler (`src/middlewares/errorHandler.ts`).
     - Zod request DTO validation middleware (`src/middlewares/validateRequest.ts`).
* **Verification Gate:** Zero `COLLSCAN` queries on auth tables; 100% pass rate on unit test suite.

---

### Phase P1: MVP / University Pilot Core Services
* **Target Milestones:** Milestones `M1` & `M2`  
* **Objective:** Deliver the complete personal athlete loop, offline sync, media streaming, subscriptions, and administrative controls for the UK university pilot.
* **Core Capabilities Delivered:**
  1. **Performance Passport & Digital Twin:**
     - Mongoose schemas for atomic `PassportFactModel` with category tags (injuries, equipment, preferences).
     - Fact compilation service generating consolidated `DigitalTwinSnapshot`.
     - User memory endpoints allowing athletes to inspect, download, or delete personal facts.
  2. **Deterministic 6-Step Decision Engine:**
     - Core algorithm evaluating: Safety/Injury holds $\rightarrow$ Consent $\rightarrow$ Time/Equipment constraints $\rightarrow$ Deload/Fatigue $\rightarrow$ Primary Goals $\rightarrow$ Modality Preferences.
     - Plan generation (`POST /v1/plans/generate`) and adaptation (`POST /v1/plans/:id/adapt`).
     - Change Today diff calculation with human-readable rationale codes.
     - Non-bypassable `Something hurts` pain hold engine freezing timers and restricting compound movements.
     - Optimistic concurrency control enforcing `expected_revision` and returning HTTP `409 stale_revision`.
  3. **High-Velocity Offline Workout Sync:**
     - Batch ingestion endpoint (`POST /v1/session-events/batch`) logging sets in $< 100\text{ms}$.
     - Client-generated RFC 4122 UUIDv4 deduplication handling network drops and retries idempotently.
  4. **Media Streaming & Rights Engine:**
     - Bunny Stream / Cloudflare HLS video token signer (`src/adapters/bunnyStream.adapter.ts`).
     - HMAC-SHA256 signed URL generation with 15-minute expiry.
     - Content catalogue schemas (`ExerciseModel`, `ProgramModel`) with equipment requirements and muscle tags.
  5. **Food Intelligence & Recovery Logging:**
     - Meal and macro logging with null-safe calorie and macronutrient storage.
     - Morning recovery check-ins (1–5 scale for Sleep, Soreness, Energy, Stress, Cycle).
     - Normalised 0–100 Daily Readiness Index computation.
  6. **Stripe UK Subscriptions & Entitlements:**
     - Webhook handler processing Stripe events (`customer.subscription.*`, `invoice.payment_*`).
     - Subscription tiers: Free, Monthly (£9.99), Annual (£79.99), Student (£4.99).
  7. **Admin Command Centre & Safety Kill Switches:**
     - Unified RBAC authorization middleware (`src/middlewares/rbac.ts`) securing Super Admin access (`SUPER_ADMIN`).
     - Global AI Kill Switch disabling LLM calls instantly via Redis flag.
     - Emergency Content Takedown invalidating Bunny video tokens via Redis pub/sub.
* **Staging Verification Gates Passed:** Gates `T01` through `T08` (Auth, 18+ Gate, Batch Sync Latency, Decision Engine Determinism, Safety Holds, Video HLS Signing, Stripe Webhooks, Admin RBAC).

---

### Phase P2: Scale, Retention & Research Ingestion
* **Target Milestones:** Milestones `M3` & `M4`  
* **Objective:** Expand personalization, support cultural training patterns, ingest scientific research continuously, and optimize system observability.
* **Core Capabilities Delivered:**
  1. **Cultural & Physiological Adaptations:**
     - Ramadan & intermittent fasting window calculator: shifts meal targets and suppresses daytime hydration reminders during daylight hours.
     - Menstrual cycle tracking module adapting training volume/intensity across follicular, ovulatory, and luteal phases.
  2. **Continuous Research Ingestion Pipeline:**
     - BullMQ worker pulling scientific studies from PubMed API and Crossref API.
     - SSRF-safe HTTP client with DNS resolution and private IP (RFC 1918) blacklist validation.
     - Substack RSS feed connector for verified exercise science publishers.
     - Automated generation of evidence-backed Research Cards linked to exercise IDs.
  3. **Ask SMACK AI Orchestrator:**
     - Natural language formatter wrapping pre-computed Decision Engine diffs.
     - Hard 10-second circuit-breaker fallback to deterministic templates.
     - Clinical red-flag prompt filter detecting eating disorder or self-harm keywords.
     - User token budget tracking in Redis (e.g., 5,000 tokens/day cap).
  4. **Observability & Health Telemetry:**
     - OpenTelemetry tracing integration for distributed spans across Express, Mongo, and Redis.
     - Prometheus metrics endpoint (`/metrics`) exposing P95/P99 latency, queue depth, and error rates.
* **Staging Verification Gates Passed:** Gates `T09` through `T12` (Fasting Engine, Cycle Engine, Research Ingestion SSRF Guard, AI Fallback Timeout).

---

### Phase P3: Professional Mode & Multi-Tenant Expansion
* **Target Milestone:** Milestone `M5`  
* **Objective:** Unlock coach workspaces, institutional university athletic department seats, and regional language localization.
* **Core Capabilities Delivered:**
  1. **Coach & Mentor Professional Mode:**
     - Coach workspace API (`/v1/coach/*`): athlete roster management, training group assignments, and course authoring.
     - Athlete-to-coach proposed plan adjustments with audit logging.
  2. **UK GDPR Article 9 `ScopedGrant` Firewall:**
     - Granular grant lifecycle management (`POST /v1/grants`, `DELETE /v1/grants/:id`).
     - Middleware-level field projection filtering redacting religious fasting, menstrual symptoms, pregnancy notes, and raw AI chat unless explicitly granted.
  3. **Institutional University Licensing:**
     - Domain-based bulk seat provisioning for UK universities (e.g., `@*.ac.uk`).
     - SAML 2.0 / OIDC enterprise single sign-on integration.
  4. **Regional Localization Support:**
     - Multi-lingual error message and system notification templates for South Asian languages (Bengali `bn`, Hindi `hi`, Urdu `ur`).
* **Staging Verification Gates Passed:** Gates `T13` and `T14` (ScopedGrant Article 9 Redaction, Bulk University Seat Provisioning).

---

### Phase P4: Specialist Pathways & Global Commerce
* **Target Milestone:** Milestone `M6`  
* **Objective:** Enable marketplace monetization for certified coaches, clinical specialist pathways, Arabic localization, and multi-region database scaling.
* **Core Capabilities Delivered:**
  1. **Stripe Connect Coach Payouts:**
     - Split payment engine deducting platform fees and routing earnings directly to verified personal trainers.
     - Automated generation of UK VAT-compliant invoices.
  2. **Specialist Clinical Protocols:**
     - Certified pregnancy and postpartum recovery protocols with mandatory certified pelvic floor specialist gate.
  3. **Arabic RTL Regional Support:**
     - Right-to-Left (RTL) localized notification strings and Arabic (`ar`) language bundle support.
  4. **Multi-Region Database Architecture:**
     - Read-replica federation across secondary European zones while maintaining primary write cluster and GDPR Article 9 data in London (`eu-west-2`).
* **Staging Verification Gates Passed:** Gates `T15` and `T16` (Stripe Connect Split Payouts, Multi-Region Read Consistency).

---

## 3. Staging Acceptance Gates Register (T01–T16)

| Gate | Category | Description | Success Criteria | Phase |
| :--- | :--- | :--- | :--- | :--- |
| **T01** | Auth | Registration & Login | Argon2id hash verified; valid JWT issued; refresh token stored in Redis | P0 |
| **T02** | Safety | 18+ Age Invariant | Registration under 18 returns HTTP `403 forbidden_underage` | P0 |
| **T03** | Ingestion | Offline Batch Set Sync | `POST /v1/session-events/batch` inserts 50 sets in $< 100\text{ms}$ | P1 |
| **T04** | Concurrency| Optimistic Revisions | Concurrent mutation returns HTTP `409 stale_revision` | P1 |
| **T05** | Engine | Deterministic Diff | Identical inputs produce identical plan recommendation diffs | P1 |
| **T06** | Safety | Something Hurts Hold | Sharp pain freezes workout, locks loaded movements, overrides coach | P1 |
| **T07** | Media | Bunny HLS Token Sign | Signed HMAC-SHA256 URL generated with 15-min expiry in $< 50\text{ms}$ | P1 |
| **T08** | Admin | Safety Kill Switches | `GLOBAL_AI_KILL_SWITCH` turns off LLM calls within $< 100\text{ms}$ | P1 |
| **T09** | Engine | Ramadan Fasting Mode | Meal reminders suppressed during daylight; hydration shifted to night | P2 |
| **T10** | Engine | Menstrual Cycle Load | Deload automatically suggested during high-symptom luteal phase | P2 |
| **T11** | Security | Ingestion SSRF Guard | Outbound fetch to `10.0.0.1` or `127.0.0.1` is aborted and logged | P2 |
| **T12** | Resilience| AI 10s Fallback | Simulated 12s LLM timeout returns deterministic template in $\le 10.1\text{s}$ | P2 |
| **T13** | Privacy | ScopedGrant Article 9 | Coach query without grant redacts faith, cycle, pregnancy, chat | P3 |
| **T14** | Billing | University Bulk Seats | Single enterprise purchase provisions 500 `@*.ac.uk` active seats | P3 |
| **T15** | Commerce | Stripe Connect Payout | Coach payout executed minus 15% platform commission fee | P4 |
| **T16** | Scale | Multi-Region Read | Secondary replica serves read queries within $< 20\text{ms}$ of sync | P4 |
