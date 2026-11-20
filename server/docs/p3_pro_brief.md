# Phase P3: Professional Mode & Multi-Tenant Expansion Architecture Brief

## 1. Executive Summary & Objective
Phase P3 unlocks institutional and commercial capabilities for SMACKGYM, transitioning the platform into high-trust multi-tenancy. It introduces dedicated Coach & Mentor workspaces, strict UK GDPR Article 9 special-category privacy firewalls, enterprise institutional licensing for UK university athletic departments, and multilingual South Asian regional localization.

Phase P3 operationalizes Milestone **M5** and delivers verification gates **T13 and T14**:
- **Gate T13 (Privacy - ScopedGrant Article 9 Firewall):** Granular consent management protecting special-category data. Without an active `ScopedGrant` from the athlete, queries by a coach strictly redact religious fasting windows, menstrual symptoms, pregnancy notes, and raw AI coaching conversations.
- **Gate T14 (Billing - Institutional University Bulk Seats):** Domain-pattern enterprise provisioning allowing UK universities (`@*.ac.uk`) to provision 500 active student-athlete seats in a single atomic transaction.

---

## 2. Architecture Map & Subsystems

```
+---------------------------------------------------------------------------------------------------------+
|                                    PHASE P3 MULTI-TENANT ARCHITECTURE                                   |
+---------------------------------------------------------------------------------------------------------+
                                                     │
        ┌───────────────────┬────────────────────────┼───────────────────────┬──────────────────┐
        ▼                   ▼                        ▼                       ▼                  ▼
┌──────────────┐    ┌──────────────┐         ┌──────────────┐        ┌──────────────┐   ┌──────────────┐
│ Coach Worksp │    │ GDPR Art 9   │         │ University   │        │ SSO / SAML   │   │ i18n Reg Loc │
│ /v1/coach/*  │    │ ScopedGrant  │         │ Licensing    │        │ /v1/auth/sso │   │ Bengali/Hindi│
│ Roster/Groups│    │ Projection   │         │ 500 Seats    │        │ Institution  │   │ Urdu/English │
│ Plan Adjust  │    │ Firewall T13 │         │ Domain Reg T14        │ Integration  │   │ Translations │
└──────────────┘    └──────────────┘         └──────────────┘        └──────────────┘   └──────────────┘
```

---

## 3. Subsystem Technical Specifications

### 3.1 Coach & Mentor Professional Workspace Subsystem
- **Coach Roster & Groups (`CoachRosterModel`, `TrainingGroupModel`):**
  - Coach-to-athlete roster assignment with compound index `{ coachId: 1, athleteId: 1 }`.
  - Group clustering for university teams, athletic cohorts, and training squads.
- **Course & Program Authoring (`CoachProgramModel`):**
  - Multi-week progressive overload templates with movement patterns, target RPE, and volume prescriptions.
- **Athlete Plan Adjustments & Audit Trail (`PlanAdjustmentAuditModel`):**
  - Structured athlete plan proposals with immutable audit logging (`previousExercises`, `proposedExercises`, `rationale`, `coachId`, `timestamp`).

### 3.2 UK GDPR Article 9 `ScopedGrant` Firewall (Gate T13)
- **Grant Lifecycle (`ScopedGrantModel`):**
  - Granular scopes:
    - Standard: `'training_logs'`, `'recovery_scores'`
    - Special Category (GDPR Article 9): `'fasting_data'`, `'cycle_data'`, `'pregnancy_notes'`, `'ai_chat'`
- **Projection Firewall (`src/middlewares/gdprFirewall.ts` & `src/services/grant.service.ts`):**
  - When a coach inspects an athlete's passport via `GET /v1/coach/athletes/:athleteId/passport`:
    - Evaluates active grants issued by `athleteId` to `coachId`.
    - If `fasting_data` is absent: `fasting_config` and Ramadan daylight fasting status are redacted (`{ redacted: true, reason: 'REDACTED_GDPR_ARTICLE_9_NO_GRANT' }`).
    - If `cycle_data` is absent: `menstrual_cycle_status` is redacted.
    - If `pregnancy_notes` is absent: pregnancy status is redacted.
    - If `ai_chat` is absent: raw AI conversation telemetry is omitted.
  - Revocation: `DELETE /v1/grants/:id` immediately invalidates the coach's projection rights.

### 3.3 Institutional University Licensing & Bulk Seat Provisioning (Gate T14)
- **Institution Domain Engine (`InstitutionModel`, `InstitutionalSeatModel`):**
  - Configurable regex domain validation (e.g. `@([a-zA-Z0-9-]+\.)*ac\.uk$`, `kcl.ac.uk`, `ox.ac.uk`).
  - Atomic bulk provisioning: `POST /v1/institutions/:id/provision-bulk` adds 500 active enterprise seats.
  - Auto-licensing seat claim: `POST /v1/institutions/claim-seat` matches user email against verified institution domain pattern, validates capacity, increments `usedSeats`, and grants `institutional` tier.
- **SAML 2.0 / OIDC Enterprise Single Sign-On Stub (`/v1/auth/sso/saml`):**
  - Validates university institutional assertions and creates/links student-athlete profile.

### 3.4 Regional Language Localization (`src/services/i18n.service.ts`)
- **Supported Locales:** English (`en`), Bengali (`bn`), Hindi (`hi`), Urdu (`ur`).
- **Header Parsing:** Evaluates `Accept-Language` header and query parameter `?lang=...`.
- **Integrated Error & Notification Localization:**
  - RFC 7807 error problem details localized according to caller's language preference.
  - Public translation endpoint: `GET /v1/i18n/translations?lang=...`.
