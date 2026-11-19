# SMACKGYM Backend Server — Product Requirements Document (`server/docs/prd.md`)

> **Document Version:** 1.0.0 (Aligned with Master PRD v5.1 & Daily Home v4)  
> **Target Platform:** Node.js 26 LTS + Express.js + TypeScript + MongoDB 8.0 + Redis 7.4  
> **API Version:** `/v1` RESTful JSON API + WebSockets  
> **Geographic & Legal Scope:** United Kingdom (`eu-west-2` London), UK GDPR, Data Protection Act 2018  

---

## 1. Executive Summary & Server Mission

The SMACKGYM Backend Server provides the mission-critical, high-availability engine powering the SMACKGYM fitness ecosystem across responsive Web and companion Mobile applications. It executes the core business logic, user identity lifecycle, real-time telemetry ingestion, deterministic training decision algorithms, UK GDPR Article 9 data sovereignty, and media rights authorization.

### 1.1 Core Architectural Mandates
1. **Zero-SQL Architecture:** Exclusively powered by MongoDB 8.0 (Mongoose ODM) for flexible, versioned document persistence and Redis for high-speed distributed locks, rate limiting, and BullMQ task queues. No relational SQL databases (PostgreSQL, MySQL, SQLite) or SQL ORMs (Prisma, TypeORM) are permitted.
2. **Deterministic-First AI Pipeline:** The 6-step Performance Decision Engine computes workout adjustments deterministically. Generative AI (`Ask SMACK AI`) operates strictly as a natural-language explainer wrapped in guardrails and subject to a hard 10-second fallback timeout.
3. **Sub-100ms Offline Sync:** High-throughput batch ingestion of offline workout sets with client-generated RFC 4122 UUIDv4 idempotency to guarantee reliable gym logging under poor cellular connectivity.
4. **Data Sovereignty & Privacy by Design:** Strict enforcement of UK GDPR Article 9 special category isolation for biometric, religious/fasting, menstrual cycle, and private AI chat data via explicit `ScopedGrant` ACL filters.

---

## 2. User Roles & Server Authorization Matrix

The server enforces an authorization hierarchy dividing actors into **Athletes (Personal Mode)**, **Coaches (Professional Mode)**, and a unified **Super Administrator (`SUPER_ADMIN`)**:

| Role Code | Role Name | System Capabilities & Permissions | Data Visibility Scope |
| :--- | :--- | :--- | :--- |
| `ATHLETE` | **Personal Athlete** | Self account management, workout tracking, plan generation, food logs, memory facts control. | Self records only. Cannot query other athletes. |
| `COACH` | **Coach / Mentor** | Roster management, workout/course authoring, proposed plan adjustments. | Athletes who have explicitly issued an active `ScopedGrant`. Article 9 fields redacted by default. |
| `SUPER_ADMIN` | **Super Administrator** | Complete platform administration: Safety Kill Switches, system health monitoring, exercise/video catalogue & rights management, billing overrides, user support triage, and immutable audit inspection. | Complete platform visibility, fully audited with cryptographic log chaining. |

---

## 3. Functional Requirements by Subsystem

### 3.1 Subsystem 1: Identity, Consent & 18+ Age Gate (`/v1/auth`, `/v1/consent`)
* **PRD-AUTH-01 (18+ Eligibility Invariant):** Registration strictly requires explicit verification that the user is 18 years of age or older. Accounts under 18 are rejected at the edge with HTTP `403 forbidden_underage`.
* **PRD-AUTH-02 (Authentication & Session Lifecycle):** 
  - Email/password signup using Argon2id password hashing.
  - OAuth 2.0 / OIDC integrations (Google, Apple Sign-In).
  - Short-lived asymmetric JWT Access Tokens (15-minute expiry) and rotating Refresh Tokens (30-day sliding expiry).
  - Instant session revocation via Redis-backed token blacklist.
* **PRD-AUTH-03 (UK GDPR Consent Management):** Explicit, granular consent capture for general data processing, marketing communications, and Article 9 biometric/health tracking. Immutable audit trail of consent timestamp, version, and IP address.

### 3.2 Subsystem 2: Performance Passport & Digital Twin (`/v1/passport`)
* **PRD-PASS-01 (Fact-Based User Memory):** The server maintains a collection of atomic `PassportFact` records representing verified user traits (e.g., equipment access, injuries, training preferences, dietary restrictions).
* **PRD-PASS-02 (User Memory Controls):** Athletes retain the absolute right to view, correct, export, or permanently delete individual memory facts with immediate cache invalidation.
* **PRD-PASS-03 (Digital Twin Snapshot Generation):** On demand, the server compiles all active, valid facts into a consolidated `DigitalTwinSnapshot` consumed by the Decision Engine.

### 3.3 Subsystem 3: Deterministic Decision Engine (`/v1/plans`)
* **PRD-DEC-01 (6-Step Priority Evaluation):** Plan generation and daily adaptation must execute through a deterministic pipeline following strict priority order:
  1. *Safety & Clinical Holds:* Injury freezes and medical hold constraints.
  2. *Consent & Age Gate:* Invariant eligibility check.
  3. *Time & Equipment Constraints:* Available gym equipment and session duration limits.
  4. *Periodisation & Deload:* Fatigue score, training monotony, and planned deload cycles.
  5. *Primary Goals:* Hypertrophy, strength, conditioning, or fat loss progressions.
  6. *User Preferences:* Modality preferences, music, and exercise substitutions.
* **PRD-DEC-02 (Change Today Diff Generation):** When an athlete requests a daily change (`POST /v1/plans/:id/adapt`), the engine generates a structured diff highlighting modified exercises, volume changes, and the exact clinical/physiological reason code.
* **PRD-DEC-03 (Optimistic Concurrency on Plan Acceptance):** Plan revisions require matching `expected_revision`. Mismatched revisions return HTTP `409 stale_revision`.

### 3.4 Subsystem 4: Training Sessions & Offline Batch Sync (`/v1/training-sessions`, `/v1/session-events`)
* **PRD-SESS-01 (Sub-100ms Batch Ingestion):** `POST /v1/session-events/batch` receives arrays of completed sets logged offline in `react-native-mmkv`. Processing must complete within 100ms.
* **PRD-SESS-02 (RFC 4122 UUIDv4 Idempotency):** Each completed set contains a client-generated UUIDv4 `event_id`. Duplicate event submissions are silently deduplicated with HTTP `200 OK` returning the existing commit status.
* **PRD-SESS-03 (Live Session State):** Active workouts track exercise order, target vs. actual reps, RPE (Rating of Perceived Exertion), rest intervals, and drop-off rates.

### 3.5 Subsystem 5: Food Intelligence & Recovery Check-Ins (`/v1/food`, `/v1/recovery`)
* **PRD-FOOD-01 (Manual Macro & Meal Logging):** Athletes log meals with calories, protein (g), carbs (g), fat (g), and hydration (ml). All macro fields are null-safe and optional to support intuitive, low-friction entry.
* **PRD-FOOD-02 (Ramadan & Fasting Mode):** When fasting mode is active, the server suppresses hydration and daytime meal reminders, shifting nutrition and hydration targets to the non-fasting window (Iftar to Suhoor).
* **PRD-REC-01 (Morning Readiness & Recovery Score):** Athletes log subjective recovery scores (1–5 scale for Sleep Quality, Soreness, Energy, Stress, and Menstrual Symptoms). The server computes a normalized 0–100 Readiness Index that informs the Decision Engine.

### 3.6 Subsystem 6: Content Rights, Exercises & Media Streaming (`/v1/content`, `/v1/exercises`)
* **PRD-CONT-01 (Canonical Exercise Library):** Exercises are stored with versioned movement mechanics, target muscle groups, setup cues, regression/progression mappings, and required equipment.
* **PRD-CONT-02 (HLS Token Signing):** Video demonstrations are streamed via Bunny Stream / Cloudflare HLS CDN. The server generates signed HMAC playback tokens with a strict 15-minute Time-To-Live (TTL).
* **PRD-CONT-03 (License Expiry & Kill-Switch Revocation):** Video licenses track expiration timestamps. Expired content or content targeted by an administrative takedown is immediately rendered unplayable by revoking token signing keys and broadcasting cache purge events to Redis.

### 3.7 Subsystem 7: Knowledge Ingestion Engine (`/v1/knowledge`)
* **PRD-KNOW-01 (Automated Evidence Harvesting):** BullMQ workers poll approved scientific literature repositories (PubMed, Crossref) and verified coaches' Substack feeds.
* **PRD-KNOW-02 (SSRF Protection):** Ingestion fetchers strictly validate target domains and verify resolved IPs against private network blacklists (RFC 1918, loopback, link-local).
* **PRD-KNOW-03 (Evidence-Linked Research Cards):** Ingested citations are parsed into structured research cards linked directly to related exercises and training guidelines.

### 3.8 Subsystem 8: Ask SMACK AI Orchestration (`/v1/ai`)
* **PRD-AI-01 (Natural Language Formatting):** AI models (OpenAI GPT-4o / Google Gemini 2.5 Flash) format user-facing explanations for workout adjustments based on pre-validated Decision Engine outputs.
* **PRD-AI-02 (Hard 10-Second Fallback):** LLM calls are bounded by a strict 10-second timeout. Upon timeout or service failure, the server transparently returns deterministic rule-based explanation text without user disruption.
* **PRD-AI-03 (Clinical Guardrails):** Incoming prompts pass through red-flag detectors for eating disorders, self-harm, or severe injury symptoms, returning clinical disclaimers and emergency resources.
* **PRD-AI-04 (Token Quota Enforcement):** Users are allocated a daily token budget (e.g. 5,000 tokens/day). Exceeded quotas gracefully degrade to deterministic advice.

### 3.9 Subsystem 9: Billing, Subscriptions & Entitlements (`/v1/billing`)
* **PRD-BILL-01 (Stripe UK Integration):** Support for UK GBP subscriptions (Free, Monthly Pro £9.99, Annual Pro £79.99, Student £4.99).
* **PRD-BILL-02 (Webhook Idempotency):** Stripe webhook events (`customer.subscription.created`, `invoice.payment_succeeded`, `customer.subscription.deleted`) are processed idempotently using the Stripe Event ID.
* **PRD-BILL-03 (Institutional University Licensing):** Bulk domain-based seat provisioning for university athletic departments with automated SAML/SSO domain mapping.

### 3.10 Subsystem 10: Admin Command Centre, Audit & Kill Switches (`/v1/admin`)
* **PRD-ADM-01 (Real-Time Safety Kill Switches):** Instant global or localized feature toggles:
  - `GLOBAL_AI_KILL_SWITCH`: Disables all generative AI calls, falling back 100% to deterministic rules.
  - `CONTENT_TAKEDOWN_SWITCH`: Invalidate video streaming tokens immediately.
  - `NEW_REGISTRATIONS_PAUSE`: Pauses signups during incidents.
* **PRD-ADM-02 (Immutable Audit Logging):** All administrative actions, role changes, medical hold overrides, and data erasures are written to an append-only MongoDB collection with cryptographic hash chaining.

---

## 4. Non-Functional Requirements & Performance Budgets

| Metric | Target SLA | Measurement Point | Failure Action |
| :--- | :--- | :--- | :--- |
| **Offline Batch Sync Latency** | $< 100\text{ms}$ (P95) | `POST /v1/session-events/batch` | Queue to BullMQ background worker if Mongo write contention |
| **Daily Home Composite API** | $< 2.0\text{s}$ (P95) | `GET /v1/home/daily` | Return cached readiness + yesterday's streak snapshot |
| **Standard REST Endpoint Read** | $< 500\text{ms}$ (P95) | All GET requests | Cache query in Redis for 60 seconds |
| **API Availability** | $\ge 99.9\%$ | Monthly uptime across all services | Auto-scale container instances in cluster |
| **LLM Call Circuit Breaker** | $\le 10.0\text{s}$ | `POST /v1/ai/ask` | Fallback to deterministic template string |
| **HLS Token Generation** | $< 50\text{ms}$ (P95) | `GET /v1/content/:id/stream-token` | Local HMAC-SHA256 signature calculation |

---

## 5. Security, Privacy & Compliance Mandates

1. **UK GDPR Article 9 Data Isolation:** Sensitive personal data (faith, menstrual cycle, pregnancy status, raw AI chat) must never be returned in bulk coach queries or standard team rosters. Access requires an explicit, unexpired `ScopedGrant` document.
2. **KMS Envelope Encryption:** At-rest encryption for sensitive health fields and PII using AES-256-GCM.
3. **Structured PII Redaction:** The Winston logging pipeline automatically scrubs passwords, authorization tokens, credit card digits, and NHS numbers before emission to stdout or disk.
4. **Rate Limiting & Abuse Prevention:** Redis sliding-window limiters:
   - Unauthenticated endpoints (`/v1/auth/login`, `/v1/auth/register`): 10 requests per minute per IP.
   - Authenticated standard API: 300 requests per minute per User ID.
   - AI Generation endpoints (`/v1/ai/ask`): 20 requests per minute per User ID.
