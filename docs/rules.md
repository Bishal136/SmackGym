# SMACKGYM — Master Engineering, Safety & UX Rules (`rules.md`)

> **Authority:** Derived from **SMACKGYM Developer Handover v5.1 (Approved UX Revision)** and `docs/PRD.md`. Every developer, reviewer, and AI coding assistant contributing to this repository must enforce these rules strictly.

---

## 1. Tech Stack & Zero-SQL Mandate

1. **100% TypeScript Across All Workspaces:**
   - Every file in `apps/web`, `apps/mobile`, `packages/shared`, and `server` must be written in strict TypeScript (`.ts` / `.tsx`).
   - Never use `any`; define canonical interfaces in `packages/shared/src/types/` and runtime validators in `packages/shared/src/schemas/` using **Zod**.
2. **Strict NoSQL Architecture (Zero SQL):**
   - **Backend Database:** Use **MongoDB** with **Mongoose ODM** exclusively.
   - **Mobile Offline Storage:** Use **`react-native-mmkv`** (encrypted JSON key-value storage) exclusively.
   - **Prohibited:** Never install or import SQLite (`expo-sqlite`), PostgreSQL, MySQL, Prisma, or TypeORM anywhere in the repository.
3. **Shared Code Discipline:**
   - Redux Toolkit slices, RTK Query API definitions, Zod validation schemas, brand tokens, and i18n locale keys must live in `packages/shared`—never duplicated between Web and Mobile.
4. **Feature-Based Folder Structure:**
   - Organize UI and backend code by domain modules (`features/daily-home`, `features/workout-player`, `modules/decision-engine`), never as loose page dumps.

---

## 2. Visual Identity & UX Rules (`Daily Home v4`)

1. **Approved Light Coaching Canvas:**
   - Maintain **80–85% White (`#FFFFFF`) and Warm Off-White (`#F6F7F3`)** surfaces with `#E4E7DF` dividers on signed-in coaching screens.
   - Use **Electric Lime (`#C7FF00`)** strictly for primary CTAs (`Start session →`), active states, and progress arcs, paired with **Near-Black (`#101212`)** text.
   - **Contrast Rule:** Never render `#C7FF00` text on a white or light background.
2. **Locked Typography:**
   - Use **`Anton`** (uppercase condensed) for display headlines and **`Inter`** (`16px` baseline) for all UI controls and body text.
   - Include shaping-capable companion fonts for South Asian and Arabic scripts (`Bangla`, `Hindi`, `Urdu`, `Arabic`) in P3/P4.
3. **Homepage Hierarchy (`Daily Home v4`):**
   - Signed-in `Home` must always prioritize:
     1. **5 Daily Circles:** `Progress` (measured arc; displays `Set a plan` instead of `0%` when unscheduled), `Today` (`completed/scheduled`), `Check-in`, `Recovery`, and `Your team`.
     2. **Primary Action Card (`Your Next Move`):** Must expose **`Start session →`**, **`Adapt`**, and **`Why this?`**.
     3. **Feed & Private Feedback:** Support public social actions (`Like`, `Comment`, `Share`, `Save`) alongside private usefulness feedback (**`Was this useful? [Yes] [Not for me]`**).
4. **Accessibility (WCAG 2.2 AA):**
   - Minimum `44x44` logical-unit touch targets on all interactive buttons.
   - Support `200%` font scaling, full keyboard navigation, screen-reader labels, and `prefers-reduced-motion`.
   - Never rely on colour or swipe gestures alone to convey state or complete actions.
5. **Localisation & RTL Rules:**
   - Store interface language separately from user nationality, religion, or location.
   - For Right-to-Left locales (`Urdu`, `Arabic`), mirror navigation bars and text alignment, **but NEVER mirror exercise demonstration videos or anatomical left/right cues**.
   - Never use unreviewed machine translation for injury, pain, or safety instructions.

---

## 3. Clinical Safety & Performance Decision Engine Rules

1. **Deterministic Engine Owns Prescriptions:**
   - All workout prescriptions, schedule changes (`Adapt` / `Change Today`), and exercise substitutions are computed by the rule-based **Performance Decision Engine** in this exact 6-step priority order:
     1. `Safety & Supported Population (18+ / Pain Holds / Pregnancy Gate)`
     2. `Data Validity & Active User Consent`
     3. `Hard Constraints (Available Time, Equipment, Schedule Collisions)`
     4. `Reviewed Programme Progression & Deload Rules`
     5. `Primary & Secondary Goals`
     6. `User Exercise Preferences & Variety`
2. **Pain & Injury Safety Hold (`Something hurts`):**
   - Tapping `Something hurts` during a workout must immediately pause the affected movement, block normal load progression, and display reviewed stop/seek-advice guidance.
   - **Non-Bypassable:** Neither `Ask SMACK AI`, coach overrides, cached plans, nor old deep links may bypass an active safety hold.
3. **No Medical Diagnosis or Harmful Prompts:**
   - SMACKGYM provides performance guidance—never medical diagnoses, injury predictions, or emergency monitoring.
   - Prohibit extreme calorie-deficit targets, weight-loss competitions, disordered-eating reinforcement, or punitive "guilt" streak alerts.
   - **Safe Streaks:** Planned rest days, deload weeks, and illness/exam pauses must preserve user streaks.
4. **Honest Unknowns (Null Over Zero):**
   - Never convert missing nutrition macros into `0`; store and display unknown values as `null` / `Unknown`.
   - Never interpret missing sleep or recovery check-ins as `"100% recovered"`.

---

## 4. SMACK AI (LLM) Guardrails & Cost Controls

1. **Explain & Assist Only — Never Mutate Directly:**
   - `Ask SMACK AI` may only invoke allowlisted structured tool intents (`draft_plan_change`, `explain_recommendation`, `find_approved_content`).
   - Any plan modification proposed by AI must pass schema and safety rule validation, generate a before/after diff preview, and wait for explicit user confirmation.
2. **Prompt Injection & Untrusted Input Defence:**
   - Treat all user chat messages, uploaded media metadata, and ingested RSS/Substack/PubMed text as untrusted data. Prompt instructions can never override RBAC, `ScopedGrants`, or safety rules.
3. **Graceful Degradation & Token Budgets:**
   - Enforce a strict **`10-second` timeout** and per-user/global daily token caps on LLM calls.
   - If the LLM provider times out or exhausts its budget, the app must immediately fall back to deterministic rule explanations and keep Home, plans, and workout logging 100% operational.
4. **No External Model Training on Private Data:**
   - User health logs, `Performance Passport` facts, private chats, and sensitive context (`faith`, `cycle`, `pregnancy`) must never be sent to third-party LLM training pipelines.

---

## 5. Data Sovereignty, Privacy & Role Access Rules (UK GDPR)

1. **One Account, Two Modes (`Personal` vs. `Professional`):**
   - Athletes own 100% of their `Personal Mode` data.
   - Coaches/Mentors operate in `Professional Mode` and can only read athlete data through explicit, user-approved, time-bound **`ScopedGrants`**.
   - Sensitive domains (`Religion/Fasting`, `Cycle`, `Pregnancy`, `Raw AI Chat`) are **excluded from coach grants by default**.
   - University and club administrators have **zero automatic access** to students' personal health or workout histories.
2. **Age Gate (`18+` in P1):**
   - Enforce `18+` age eligibility at signup. Users indicating pregnancy/postpartum or minor status are routed out of generic adult plan generation into reviewed guidance pathways.
3. **UK GDPR Special Category Isolation:**
   - Encrypt health, injury, fasting, and cycle records at rest, isolate them from general analytics telemetry, and purge derived caches/search indexes immediately upon user fact deletion or consent revocation.
4. **Admin RBAC & Audit Trails:**
   - Enforce server-side Role-Based Access Control for the unified `Super Admin` role (`SUPER_ADMIN`).
   - Every content publication, rights change, kill-switch toggle, or administrative intervention must write an immutable `AuditEvent` (`actor`, `timestamp`, `reason`, `before/after revision`).

---

## 6. Offline Durability, Concurrency & API Reliability Rules

1. **Offline-First Workout Queue (`< 100ms` Local Write):**
   - Mobile apps must cache active weekly sessions and HLS assets locally under an encrypted **7-day rights lease**.
   - Every completed set must write an immutable JSON event with a client-generated **`UUID`** to `react-native-mmkv` immediately and sync idempotently via `POST /v1/session-events/batch`.
2. **Optimistic Concurrency Control (`revision`):**
   - Every mutable MongoDB document (`PassportFact`, `PlanVersion`, `FoodEntry`) must track an integer `revision`.
   - Update requests must supply `expected_revision`; if mismatched, the server must reject with **`409 stale_revision`** rather than silently overwriting concurrent edits.
3. **Idempotency & Atomic Transactions:**
   - Require an **`Idempotency-Key`** header on all state-mutating POST commands (plan acceptance, batch sync, grant creation, billing webhooks).
   - Wrap multi-document plan acceptances in MongoDB replica-set transactions.
4. **Rights & Kill-Switch Enforcement:**
   - Validate `RightsRecord` expiry, territory (`GB`), and Admin `KillSwitch` status before returning search results, Discover items, or signed HLS video playback tokens.
   - Knowledge connectors (`PubMed`, `Crossref`, `Substack`) must enforce SSRF protection (HTTPS allowlists, private IP blocking) and never republish paywalled full text.

---

## 7. Release & Staging QA Gate (`T01–T16`)

No feature or release may be deployed to production until:
1. All **16 staging acceptance tests (`T01–T16`)** in `docs/PRD.md` pass with zero critical/high safety, security, or data-loss defects.
2. Core SLO baselines are verified: Core API `99.9%` availability, offline set save `< 100ms` (p95), `GET /v1/home` `< 2.0s` (p95), and verified MongoDB backup restoration with deletion tombstone replay.