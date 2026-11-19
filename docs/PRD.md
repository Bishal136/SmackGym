# Product Requirements Document (PRD): SMACKGYM

| Document Metadata | Details |
| :--- | :--- |
| **Product Name** | **SMACKGYM** — Personal Performance Ecosystem |
| **Core Tagline** | *Know What To Do Next* / *All sports performance training in one place* |
| **Document Version** | v5.1 (Aligned with Approved UX Revision `Daily Home v4`) |
| **Target Launch Market** | United Kingdom (`en-GB`) — 18+ University & Young Athlete Pilot |
| **Supported Platforms** | Responsive Web App, Web Admin Command Centre, Android App, Apple iOS App |
| **Architecture Stack** | 100% TypeScript MERN + React Native (Expo) + NoSQL (MongoDB & MMKV) |

---

## 1. Executive Summary & Product Vision

**SMACKGYM** is a cross-platform Personal Performance Ecosystem that unifies **Training, Nutrition (Fuel), Recovery, Science-Backed Education (Learn), Progress Intelligence, and Community** into a single daily coaching loop. 

Benchmarked against **iFIT** for seamless trainer-led follow-along video execution and **Volt Athletics** for adaptive load management, SMACKGYM differentiates itself through **fixture- and schedule-aware deterministic coaching**, **user-owned data sovereignty (`Performance Passport`)**, and a **two-mode architecture (`Personal Mode` + `Professional Mode`)**.

### Core Product Principles
1. **Action-First Hierarchy:** `Coaching → Action → Progress → Content → Social`. The signed-in Home screen answers *"What should I do next?"* before showing discovery feeds.
2. **One Account, Two Modes:** Every user owns their `Personal Mode` data (`Passport`, workout logs, health history). Coaches, mentors, and institutions operate in `Professional Mode` and can only view athlete data via explicit, revocable, time-bound `ScopedGrants`.
3. **Deterministic Safety Over Unchecked AI:** A rule-based **Performance Decision Engine** governs exercise prescription, schedule adaptation, and injury safety holds. **SMACK AI (LLM)** acts strictly as a conversational explainer and assistant—never bypassing safety rules or mutating plans directly.
4. **Offline-First Gym Reliability:** Workouts, video cues, and set logging function seamlessly in low-connectivity gym environments via encrypted local NoSQL caching (`react-native-mmkv`) and idempotent batch syncing.

---

## 2. Target Audience & Competitive Positioning

### 2.1 Beachhead & Rollout Strategy
* **Phase P1 (MVP Launch):** UK adults aged **18+**, initially targeting university students, recreational club athletes, and gym-goers (`en-GB`).
* **Phase P2–P3 (Retention & Regional Expansion):** Multi-sport expansion (Cricket, Football, Basketball, Rugby, Badminton), verified freelance Personal Trainers (PTs), university clubs, and South Asian localisation (`Bangla`, `Hindi`, `Urdu`).
* **Phase P4 (Global & Specialist Expansion):** Arabic (`RTL`) expansion, live coaching marketplace, and medically/expert-reviewed specialist pathways (Pregnancy/Postpartum, Minors/Family under UK Children's Code).

### 2.2 Competitive Differentiation Matrix

| Capability | iFIT / Fiit (UK) | Volt Athletics | TrainHeroic | **SMACKGYM (Target)** |
| :--- | :---: | :---: | :---: | :---: |
| **Follow-Along Video & 3D Demos** | ✅ | ⚠️ Basic | ⚠️ Basic | **✅ HLS Video + Owned 3D Rig** |
| **Schedule & Fixture-Aware Adaptation** | ❌ | ⚠️ Session-level | ❌ | **✅ Full Week + Explainable Diff (`Why this?`)** |
| **Integrated Diet & Recovery Tracking** | ❌ | ❌ | ❌ | **✅ Manual Food Intelligence + Check-ins** |
| **User-Owned Data (`ScopedGrant` Privacy)** | ❌ | ❌ | ⚠️ Coach-centric | **✅ 100% Athlete-Controlled Grants** |
| **Reviewed Science & Substack Feed** | ❌ | ❌ | ❌ | **✅ PubMed + Crossref + Substack Engine** |

---

## 3. Technical Architecture & 100% NoSQL Stack

SMACKGYM uses a unified **TypeScript-first** monorepo architecture so domain types, Zod validation schemas, and Redux Toolkit (RTK Query) API slices are shared across Web, Mobile, and Backend without any SQL dependencies.

```text
smackgym-ecosystem/
├── apps/
│   ├── web/                 # React 19 + TypeScript + Tailwind CSS v4 (User Web + Admin)
│   └── mobile/              # React Native (Expo SDK 58) + NativeWind v4 (Android & iOS)
├── packages/
│   └── shared/              # Shared TypeScript interfaces, Zod schemas, Redux slices & i18n
└── server/                  # Node.js 26 LTS + Express.js + TypeScript + MongoDB (Modular Monolith)
```

### 3.1 Stack Specifications
* **Web App & Admin Command Centre:** React, TypeScript, Tailwind CSS v4, Redux Toolkit (RTK Query).
* **Android & Apple iOS Apps:** React Native (Expo SDK + Expo Router), TypeScript, NativeWind v4, `expo-video` (Adaptive HLS `.m3u8` streaming), `expo-secure-store` (Keychain/Keystore auth tokens), and **`react-native-mmkv`** (ultra-fast encrypted NoSQL JSON storage for offline gym queues—zero SQL).
* **Backend Server:** Node.js + Express.js (TypeScript) structured as a **Modular Monolith** with strict domain boundaries (`Identity/Consent`, `Passport/Twin`, `Decision Engine`, `Session/Logging`, `Content/Rights`, `Knowledge Ingestion`, `Billing/Admin`).
* **Database:** **MongoDB** with **Mongoose ODM** (strict schema validation, optimistic concurrency via `revision` counters, and MongoDB transactions for atomic plan acceptance).
* **Media & AI Infrastructure:** Bunny Stream or Cloudflare Stream (signed HLS playback tokens), Redis + BullMQ (background ingestion & outbox workers), and LLM Provider Adapter (OpenAI/Gemini with strict token budgets and deterministic fallbacks).

---

## 4. Brand Identity & UX Design System (`Daily Home v4`)

Per **Approved UX Revision (29 September 2026)**, SMACKGYM replaces dark-mode coaching screens with a high-contrast, light, action-focused coaching canvas.

### 4.1 Locked Visual Tokens
* **Canvas & Surfaces:** `80–85%` White (`#FFFFFF`) and Warm Off-White (`#F6F7F3`), Dividers (`#E4E7DF`).
* **Primary Brand Action:** Electric Lime (`#C7FF00`) paired with Near-Black text (`#101212`). *(Rule: Never use lime text on white backgrounds).*
* **Typography:**
  * **Display Headlines:** `Anton` (condensed uppercase display style).
  * **UI & Body Copy:** `Inter` (`16px` baseline, high legibility), with shaping-capable script fonts for Bangla, Hindi, Urdu, and Arabic in P3/P4.
* **Accessibility (WCAG 2.2 AA):** Minimum `44x44` touch targets, `200%` text zoom support, screen-reader labels, reduced-motion support, and non-colour status indicators.

### 4.2 Approved Signed-In Home Layout (`Daily Home v4`)
1. **Navigation Shell:**
   * **Desktop Web:** Left sidebar (`Home`, `Search`, `Discover`, `Train`, `Progress`, `Community`, `Messages`, `Profile`, `Settings`).
   * **Mobile (Android/iOS):** Bottom tab bar (`Home`, `Train`, `Discover`, `Progress`, `Profile`) + top header icons (`Messages`, `Notifications`).
2. **Your Daily Snapshot (5 Daily Circles):**
   * **Progress:** Weekly planned session completion arc (`completed / planned`; shows `Set a plan` instead of `0%` when no plan exists).
   * **Today:** Completed vs. scheduled daily actions (e.g., `1/3`).
   * **Check-in:** Optional daily sleep, fatigue, stress, and soreness log.
   * **Recovery:** Recommended rest or mobility action (rest counts as a valid completed action).
   * **Your Team:** University/club updates or `Find your team` CTA.
3. **Primary Action Card (`Your Next Move`):**
   * Displays session title (e.g., *25-minute strength*), duration, equipment, and difficulty level.
   * Three explicit actions: **`Start session →`** (Electric Lime CTA), **`Adapt`** (adjust time/equipment/recovery with before/after diff preview), and **`Why this?`** (transparent explanation of confirmed facts and rules used).
4. **Right Rail / Secondary Widgets:**
   * **Your Performance Passport:** Incremental profile completion bar (excludes sensitive health/faith/cycle fields from completion scores).
   * **This Week Calendar:** 7-day strip showing workouts, matches/fixtures, and recovery days.
   * **Ask SMACK AI:** Inline prompt box for training advice and quick answers.
5. **Social & Educational Feed (`For You` / `Following`):**
   * Vertical cards with `Like`, `Comment`, `Share`, `Save`, `Add to my plan`, and private usefulness feedback: **`Was this useful? [Yes] [Not for me]`** (with optional structured reasons like *Wrong equipment*, *Fits my goal*, or *Report concern*).

---

## 5. Role-Based Functional Requirements

### 5.1 Role 1: Personal User / Athlete (`Personal Mode` — Web + Android + iOS)

#### A. Onboarding & Performance Passport (`P1 MVP`)
* **Fast Signup:** Email/password and OAuth (Google/Apple) with `18+` age gate and separate consents for Terms of Service, Optional Personalisation, and Marketing.
* **Progressive Profiling:** Users receive immediate starter value without a coercive 20-question intake form. Core context cards (`Goal`, `Experience`, `Available Days/Time`, `Equipment`, `Movement Restrictions`) update the **Performance Passport**.
* **User Memory Controls (`What SMACK knows about me`):** Users can view, edit, snooze, or permanently delete any Passport fact. Deleting a fact immediately invalidates derived Twin snapshots and recommendations.

#### B. Digital Performance Twin & Decision Engine (`P1 MVP`)
* **Digital Performance Twin:** A read-only, deterministic derived snapshot computing weekly workload, recovery trends, and per-domain data confidence (`low`, `medium`, `high`, `insufficient`). Never invents physiological scores or injury predictions.
* **Performance Decision Engine (6-Step Priority Order):**
  1. Safety & supported population boundaries.
  2. Data validity & active user consent.
  3. Hard constraints (available minutes, equipment, schedule collisions, pain holds).
  4. Reviewed programme progression & deload rules.
  5. Primary & secondary user goals (triggers a tradeoff prompt if goals conflict).
  6. User exercise preferences & variety.
* **`Change Today` / `Adapt` Flow:** If a user has only 20 minutes instead of 45, lacks gym equipment, or has a match rescheduled, the engine generates a validated preview diff showing what moved and why, requiring explicit user acceptance (`POST /v1/plan-previews/{id}/accept`).

#### C. iFIT-Style Follow-Along Workout Player & Offline Gym Mode (`P1 MVP`)
* **Workout Execution:** Displays looping HLS video or **SMACKGYM 3D** technique animation, textual coaching cues, previous logged weights/reps, target sets/reps/RPE, and an auto-starting rest timer that persists across backgrounding.
* **In-Session Exercise Substitution:** Swap any movement for an equipment-compatible reviewed alternative without losing completed sets.
* **Offline Gym Mode (`OFF-01` to `OFF-04`):**
  * Caches active weekly sessions, textual cues, and video renditions locally with an encrypted **7-day rights lease**.
  * Every completed set writes an immutable JSON event with a client-generated `UUID` into an append-only **`react-native-mmkv`** queue. Reconnecting triggers idempotent batch sync (`POST /v1/session-events/batch`) with duplicate protection.
* **Pain & Safety Hold (`Something hurts`):** Pressing `Something hurts` mid-set immediately pauses the affected movement, logs optional pain location/severity, blocks unsafe progression, and displays reviewed stop/seek-advice guidance. Safety holds cannot be bypassed via AI chat or deep links.

#### D. Food Intelligence & Recovery Check-In (`P1 MVP`)
* **Manual Food Log:** Add, edit, and delete meals with ingredients, quantities, and units. Sourced calories and macros (Protein, Carbs, Fat) are displayed as estimates; unknown nutrient values remain `null/unknown` (never converted to `0`).
* **Recovery Check-In:** Optional daily self-report for sleep quality, fatigue, stress, and muscle soreness.

#### E. Discover, Universal Search & Reviewed Research Library (`P1 MVP`)
* **Discover Feed & Search:** Rule-based ranking filtered strictly by rights/territory, age, safety status, and equipment. Universal search queries exercises, programmes, and reviewed articles with typo tolerance.
* **Learn / Research Cards:** Displays plain-English summaries of peer-reviewed papers (PubMed/Crossref) and approved Substack/blog articles, clearly tagged with author, reviewer, review date, evidence limitations, and a `Read original` link.

#### F. Progress Intelligence, Safe Streaks & Sharing (`P1 MVP`)
* **Progress Analytics:** Tracks true adherence (`completed planned sessions / original scheduled sessions`), Personal Bests (`PBs` keyed by exercise variant and unit), and recovery trends.
* **Safe Streaks:** Planned rest days, deload weeks, and illness/exam pauses do not break user streaks or trigger guilt prompts.
* **Privacy-Safe Share Cards:** Generates shareable visual milestone cards via native OS share sheets or revocable web links, stripping exact bodyweight, age, location, and sensitive health data by default.

#### G. Sensitive Context & Future User Phases (`P2–P4`)
* **Ramadan / Fasting Mode (`P2`):** Opt-in fasting window, prayer-aware scheduling, and Halal food filters without requiring religious identity disclosure.
* **Optional Symptom & Cycle Tracking (`P2`):** Opt-in energy/symptom logging excluded from coach dashboards by default.
* **Community Circles, Buddies & Challenges (`P2`):** University/club verified groups, mutual buddy invites, and consistency-focused challenges.
* **Pregnancy / Postpartum (`P4`):** In P1, indicating pregnancy stops generic prescriptions and routes to NHS/maternity guidance; P4 introduces expert-approved specialist programmes.

---

### 5.2 Role 2: Teacher / Coach / Mentor (`Professional Mode`)

Users verified as qualified trainers switch seamlessly into `Professional Mode` (`Overview`, `Athletes`, `Plans`, `Content`, `Workspace`).

* **Creator Profile & Trust Verification (`P1–P3`):** Displays bio, posts, videos, programmes, and admin-verified trust badges (`Identity Verified`, `Qualification Verified`, `Technique Reviewed`).
* **Course & Programme Builder (`P1–P3`):** Create reusable `ExerciseVersions` (video + cues + regressions/substitutions) and assemble multi-week `Programmes` with prescribed sets, reps, rest, and load methods.
* **Client Coaching via `ScopedGrant` (`P3`):**
  * Coaches invite athletes; athletes explicitly approve which data categories (`Training Logs`, `Food Logs`, `Recovery`) the coach can view and for how long.
  * Sensitive domains (`Religion/Fasting`, `Cycle`, `Pregnancy`, `Raw AI Chat`) are **excluded by default**.
  * Coaches submit **Programme Proposals**; athletes must preview and accept before their active schedule changes.
* **Academy & Marketplace (`P2–P4`):** Create structured micro-lessons/assessments (`P2–P3`) and offer paid coaching subscriptions or live sessions via Stripe Connect (`P4`).

---

### 5.3 Role 3: University / Club Team Administrator (`P3`)

* **Institutional Workspace:** Manage club/university team rosters, seat assignments, and institutional billing.
* **Strict Data Firewall:** University or club administrators have **zero automatic visibility** into students' private `Performance Passports`, health logs, or workout histories. Institutions cannot confiscate personal history when a student leaves.

---

### 5.4 Role 4: Web Admin Command Centre (`Super Admin`)

Admin operations enforce strict **Role-Based Access Control (RBAC)**, MFA, and immutable audit logs (`actor`, `timestamp`, `reason`, `before/after version`).

| Admin Role | Permitted Responsibilities | Security Boundaries |
| :--- | :--- | :--- |
| **Super Admin (`SUPER_ADMIN`)** | Complete centralized platform command: **Safety Kill Switches** (instantly disable unsafe exercises, AI chat, locales, or campaigns), exercise and media rights management, user dispute & report triage, Stripe billing & entitlement overrides, and immutable audit inspection. | All sensitive administrative actions require multi-factor authentication (MFA) and write cryptographically-chained records to the immutable audit log. |

---

## 6. Canonical MongoDB Collections & Core API Contracts

### 6.1 Primary MongoDB Collections (Mongoose Models)
1. `accounts` & `profiles`: Auth credentials, `18+` eligibility, mode flags (`personal`, `professional`), and public creator profile fields.
2. `consent_records` & `scoped_grants`: Purpose-bound GDPR consents and time-bound coach-athlete access grants (`subject_id`, `grantee_id`, `scopes[]`, `expires_at`, `revoked_at`).
3. `passport_facts` & `twin_snapshots`: Typed, versioned user facts (`domain`, `typed_value`, `unit`, `source_kind`, `confirmation_state`) and immutable derived `TwinSnapshots`.
4. `exercises` & `exercise_versions`: Canonical movement ID (`EX-XXXX`), movement pattern, muscles, equipment, cues, regressions, and immutable version state.
5. `video_assets` & `rights_records`: HLS manifest references, checksums, territory/expiry licences, and reverse-dependency takedown indexes.
6. `programmes`, `plan_versions` & `session_events`: Coach templates, user-accepted weekly schedule revisions, and deduplicated `UUID` set logs.
7. `food_entries` & `recovery_checkins`: Dated meal logs (with `unknown` macro preservation) and subjective readiness check-ins.
8. `knowledge_sources` & `knowledge_items`: Approved PubMed/Crossref/Substack connectors, DOI/PMID deduplication, and reviewed educational cards.
9. `entitlements` & `audit_events`: Server-authoritative subscription states and immutable admin/safety audit logs.

### 6.2 Core REST API Endpoints (`/v1`)

| Method & Route | Purpose | Key Contract Guarantees |
| :--- | :--- | :--- |
| `GET /v1/home` | Fetch `Daily Home v4` snapshot & `Your Next Move` | Scoped to user revision & locale; deterministic fallback if LLM times out. |
| `PATCH /v1/passport/facts/{id}` | Update confirmed Passport fact | Optimistic concurrency (`expected_revision`); recomputes Twin snapshot. |
| `POST /v1/plan-previews` | Request `Adapt` / `Change Today` preview | Non-mutating; returns before/after diff, `reason_codes`, and expiry. |
| `POST /v1/plan-previews/{id}/accept` | Commit adapted schedule | Requires `Idempotency-Key` & `expected_revision`; atomic MongoDB transaction. |
| `POST /v1/session-events/batch` | Sync offline workout set logs from MMKV | Per-event `UUID` deduplication; returns accepted/duplicate/conflict status per item. |
| `POST /v1/food-entries` | Log meal & ingredient portions | Preserves unknown nutrients as `null`; recomputes daily macro aggregates. |
| `POST /v1/smack` | Send message to `Ask SMACK AI` | Allowlisted tool intents only (`draft_plan_change`, `explain_recommendation`). |
| `POST /v1/workspaces/{id}/grants` | Athlete grants data scope to Coach | Server-enforced ACL; immediate cache/token invalidation upon revocation. |
| `POST /v1/account/export` & `DELETE /v1/account` | UK GDPR Data Portability & Erasure | Requires step-up re-authentication; purges derived caches & search indexes. |

---

## 7. Non-Functional Requirements (NFRs), Compliance & Localisation

### 7.1 Performance & Reliability Targets (SLOs)
* **Core API Availability:** `99.9%` monthly uptime.
* **Offline Set-Save Latency:** `< 100ms` (p95) local write to `react-native-mmkv`.
* **Home Screen Load (`GET /v1/home`):** `< 2.0s` (p95) on standard mobile networks.
* **Standard API Reads:** `< 500ms` (p95) excluding media/LLM generation.
* **LLM Timeout & Fallback:** `10s` strict timeout; automatically falls back to deterministic rule-based explanations and cached workouts without blocking user execution.
* **Backup & Recovery:** Automated encrypted MongoDB backups (`RPO ≤ 24h`, `RTO ≤ 8h`) with deletion tombstone replay on restore.

### 7.2 Security & UK GDPR Compliance
* **Special Category Data Isolation:** Health, injury, fasting/religious preferences, and cycle data are encrypted at rest and segregated from general analytics and default coach projections under UK GDPR Article 9 standards.
* **SSRF & Upload Protection:** Knowledge connectors enforce HTTPS allowlists, DNS/IP validation, and HTML sanitisation; media uploads pass through quarantine and malware checks before transcoding.

### 7.3 Phased Localisation Rules
* **P1:** English UK (`en-GB`, LTR).
* **P3:** Bangla (`bn`, LTR), Hindi (`hi`, LTR), Urdu (`ur`, RTL).
* **P4:** Arabic (`ar`, RTL).
* **RTL Mirroring Rule:** Navigation and text align right-to-left in `ur` and `ar`, but **exercise demonstration videos and anatomical left/right cues must never be mirrored**.

---

## 8. Phased Delivery Milestones & QA Acceptance Gate

### 8.1 Delivery Milestones
* **M0 (Baseline & Design):** Lock scope, database schemas, OpenAPI spec, and interactive `Daily Home v4` prototype.
* **M1 (Foundations):** Auth, `18+` gate, GDPR consents, `Performance Passport`, `Exercise/Rights` catalogue, and Admin RBAC shell.
* **M2 (Complete Personal Loop):** Fast signup, starter plan, `Daily Home v4`, iFIT-style workout player, `MMKV` offline sync, and Food/Recovery logging.
* **M3 (Intelligence & Content):** `Digital Performance Twin`, Decision Engine (`Adapt` + `Why this?`), `Ask SMACK AI`, HLS streaming, Discover feed, and PubMed/Substack ingestion.
* **M4 (Growth & Operations):** Safe streaks, Share cards, Invite links, Stripe UK billing (`£`), GDPR export/delete, and Safety Kill Switches.
* **M5 (University Pilot Launch):** Load testing, WCAG 2.2 AA accessibility audit, security review, and closed UK university pilot.
* **M6 (Expansion Releases):** Activate P2–P4 modules (Ramadan mode, Coach `ScopedGrants`, University workspaces, South Asian/Arabic locales).

### 8.2 Mandatory Staging Release Gate (`T01–T16`)
Production launch requires passing all 16 automated and human QA verification suites:
* **`T01` Onboarding Parity:** Chat and manual setup produce identical valid Passports.
* **`T02` Profile Correction:** Deleting a Passport fact immediately removes it from Twin/AI context.
* **`T03` Safe Adaptation:** Reducing session time from 45m to 20m produces an eligible alternative or honest no-match state.
* **`T04` Safety Bypass Prevention:** `Something hurts` hold cannot be bypassed via AI chat, original plan, or deep links.
* **`T05` AI Outage Resilience:** Disabling the LLM provider leaves plans, Home, and workout logging 100% functional.
* **`T06` Offline Durability:** Logging sets in Airplane Mode, force-closing the app, and reconnecting syncs every set exactly once.
* **`T07` Concurrent Edit Conflict:** Simultaneous edits across two devices trigger `409 stale_revision` without data loss.
* **`T08` Localisation & DST:** Expanded text, RTL pseudolocale, and Daylight Saving Time transitions preserve schedule accuracy.
* **`T09` Rights Expiry Takedown:** Expired video licences immediately disappear from search, Discover, and new playback tokens.
* **`T10` Cross-Account & Staff Isolation:** ID enumeration cannot expose another user's records; staff without break-glass clearance are blocked.
* **`T11` Billing Replay Protection:** Duplicate or refunded Stripe webhooks produce accurate server entitlements.
* **`T12` GDPR Export & Erasure:** User export is readable/complete; account deletion survives database backup restoration.
* **`T13` Accessibility:** Full core journey completable via screen reader, keyboard, and 200% zoom.
* **`T14` Progress Integrity:** Edited or deduplicated logs accurately recompute adherence and PBs.
* **`T15` Operations & Kill Switch Drill:** Disabling a risky feature, rolling back a release, and restoring backups succeed cleanly.
* **`T16` Food Log Integrity:** Retrying or editing meals prevents duplicates and keeps unknown nutrients as `unknown`.