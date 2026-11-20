# Phase P1 MVP & University Pilot Core Services Brief

* **Author:** SMACKGYM Engineering Team
* **Date:** 2026-11-19
* **Scope:** Phase P1 MVP / University Pilot Core Services (Milestones M1–M2, Gates T03–T08)

## Overview

Phase P1 delivers the complete personal athlete loop, deterministic training adjustment engine, offline workout telemetry ingestion, content rights protection, food/recovery intelligence, Stripe UK subscription management, and administrative safety kill switches for the UK university pilot.

## Analysis & Architectural Mandates

### 1. High-Velocity Offline Workout Sync (< 100ms SLA, Gate T03)
- **Constraint:** Athletes logging workouts in basements or cellular dead-zones require client-side persistence in `react-native-mmkv` with idempotent background flushing.
- **Mechanism:** `POST /v1/session-events/batch` accepts arrays of completed sets (up to 100). Every event carries a client-generated RFC 4122 UUIDv4 as `_id`. Bulk writes use ordered: false and upsert-free deduplication to guarantee $< 100\text{ms}$ batch insertion.

### 2. Optimistic Concurrency Control (Gate T04)
- **Constraint:** Multi-device synchronization (e.g. mobile app and web portal) must never silently overwrite training plan revisions.
- **Mechanism:** Every plan mutation requires `expectedRevision`. Queries enforce `{ _id: planId, revision: expectedRevision }` and atomically increment `revision` by 1. Collisions terminate immediately with HTTP `409 stale_revision`.

### 3. Deterministic Decision Engine & Non-Bypassable Pain Hold (Gates T05 & T06)
- **Constraint:** Training adjustments must be 100% reproducible and safe from hallucination or unsafe coach overrides.
- **Mechanism:** 6-step deterministic hierarchy:
  1. *Clinical & Injury Holds:* Active `MedicalHold` facts freeze timers and block compound movements (e.g., knee pain blocks squats, deadlifts, and lunges).
  2. *Consent & Invariants:* Validates 18+ eligibility.
  3. *Equipment Constraints:* Intersects exercise database with athlete's declared equipment.
  4. *Periodisation & Fatigue:* High soreness/stress triggers automatic volume deload.
  5. *Primary Goals:* Hypertrophy/Strength progressions.
  6. *Modality Preferences:* Exercises substitutions.
- **Invariant:** Neither AI nor coaches can bypass an active medical hold (`RULE-SAFE-01`).

### 4. Media Streaming Rights & Kill Switches (Gates T07 & T08)
- **Mechanism:** Bunny Stream HMAC-SHA256 signed playback tokens generated with 15-minute TTL.
- **Kill Switches:** Redis-backed toggles for `GLOBAL_AI_KILL_SWITCH`, `CONTENT_TAKEDOWN_SWITCH`, and `NEW_REGISTRATIONS_PAUSE`. Sub-10ms query latency guarantees instant system-wide enforcement.

## Goals vs. Non-Goals

### In-Scope (Phase P1)
- `PassportFactModel` and `DigitalTwinSnapshot` compilation.
- Deterministic 6-step Decision Engine with plan generation, adaptation diffs, and optimistic concurrency.
- `Something hurts` pain hold engine with movement restrictions.
- Batch session events sync with UUIDv4 deduplication.
- Bunny HLS video token signer.
- Exercise and Content catalogue schemas.
- Food entry and morning recovery check-in logging with 0-100 Readiness Index.
- Stripe UK subscription webhook handler and entitlements.
- Super Admin RBAC and Redis safety kill switches.
- Staging Verification Gates T03 through T08.
- Postman Collection test coverage for all Phase P1 endpoints.

### Out-of-Scope (Phase P2–P4)
- PubMed/Crossref literature scraper (Phase P2).
- Ramadan daylight nutrition window calculator & Menstrual phase logic (Phase P2).
- Coach workspace & ScopedGrant Article 9 firewall (Phase P3).
- Stripe Connect split payouts (Phase P4).
