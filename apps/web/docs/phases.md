# SMACKGYM Web Application — Frontend Build Roadmap & Phases (`phases.md`)

> **Document Version:** 1.0.0  
> **Status:** Active Execution Roadmap (Phase 0 Complete — Awaiting Phase 1 Approval)  
> **Target Package:** `@smackgym/web` (React 19 + TypeScript 5.8+ + Vite 6 + Tailwind CSS v4 + Redux Toolkit / RTK Query)  
> **Design Direction:** Dark Canvas (`#101212`), Electric Lime Action Accent (`#C7FF00`), Clinical Alert Red (`#FF4B4B`), `Anton` Display Headlines + `Inter` Body UI (WCAG 2.2 AA)  
> **Companion Docs:** [`apps/web/docs/PRD.md`](file:///home/bishal/BishalHome/Cours/Ecommarce/SMACKGYM/apps/web/docs/PRD.md), [`apps/web/docs/Architecture.md`](file:///home/bishal/BishalHome/Cours/Ecommarce/SMACKGYM/apps/web/docs/Architecture.md), [`apps/web/docs/rules.md`](file:///home/bishal/BishalHome/Cours/Ecommarce/SMACKGYM/apps/web/docs/rules.md)

---

## 1. Golden Rules of Phase-by-Phase Execution

1. **Roadmap First, Code Second:** No page code is written until the master phase plan is approved.
2. **One Page / Module = One Phase:** Never build multiple unrelated pages in a single pass. Build one focused vertical slice at a time.
3. **Sequential Panel Priority:**
   - **Track A (Phases 3–11):** Personal Athlete Panel (`ATHLETE` — Core MVP & Daily Home v4)
   - **Track B (Phases 12–14):** Teacher / Coach Professional Panel (`COACH` — Roster & Course Builder)
   - **Track C (Phases 15–17):** Super Admin Command Centre (`SUPER_ADMIN` — Safety Kill Switches & Audit Trail)
4. **Production-Complete Pages Only:** Every page MUST include live RTK Query wiring to the Express `/v1` API, realistic domain copy (zero "Lorem ipsum"), full responsive layout (`< 640px`, `768px`, `1024px+`), and all **9 mandatory UI states** (Default, Hover, Active, Focus, Loading, Empty, Error, Disabled, Success).
5. **Hard Checkpoint Gate:** At the end of every phase:
   - Run `npm --prefix apps/web run typecheck` and `npm --prefix apps/web run build`.
   - Check off the completed phase (`[x]`) in this document.
   - Stop and request explicit user approval before starting the next phase.

---

## 2. Master Phase Checklist

### Foundation & Core Architecture
- [x] **Phase 0:** Discovery, Specifications (`PRD.md`, `Architecture.md`, `rules.md`) & Master Page Roadmap (`phases.md`)
- [ ] **Phase 1:** Design System Tokens, Shared RTK Query API Slices & Core UI Primitives (`src/components/ui/`)
- [ ] **Phase 2:** React Router v7 Registry, Role Guards & Persistent Layout Shells (`PublicLayout`, `DesktopSidebarLayout`, `AdminLayout`, `404` & `ErrorBoundary`)

### Track A — Personal Athlete Panel (`1st Priority`)
- [ ] **Phase 3:** Landing & Value Intro Page (`/`) — `SCR-ATH-01`
- [ ] **Phase 4:** Auth, 18+ Age Verification Gate & GDPR Consent (`/login`, `/register`) — `SCR-ATH-02`
- [ ] **Phase 5:** Minimal Context Onboarding Intake (`/onboarding`) — `SCR-ATH-03`
- [ ] **Phase 6:** Signed-In Daily Home v4 Core Hub, "Why This?" Drawer & "Change Today" Adapt Diff (`/home`) — `SCR-ATH-04`, `SCR-ATH-05`, `SCR-ATH-06`
- [ ] **Phase 7:** Active Workout Follow-Along Player, Substitution Drawer, "Something Hurts" Safety Hold & Summary (`/workout/session`, `/workout/summary`) — `SCR-ATH-07`, `SCR-ATH-08`, `SCR-ATH-09`, `SCR-ATH-10`
- [ ] **Phase 8:** Manual Food Intelligence Log & Recovery Check-In with Fasting/Cycle Context (`/fuel`, `/recovery`) — `SCR-ATH-11`, `SCR-ATH-12`
- [ ] **Phase 9:** Performance Passport Memory Facts & `ScopedGrant` Privacy Manager (`/passport`, `/passport/privacy`) — `SCR-ATH-17`, `SCR-ATH-18`
- [ ] **Phase 10:** Discover Feed, Universal Search & PubMed/Crossref Research Cards (`/learn`, `/search`) — `SCR-ATH-13`, `SCR-ATH-14`
- [ ] **Phase 11:** Progress Analytics, Personal Bests & Privacy-Safe Share Card Generator (`/progress`, `/progress/share`) — `SCR-ATH-15`, `SCR-ATH-16`

### Track B — Teacher / Coach Professional Panel (`2nd Priority`)
- [ ] **Phase 12:** Coach Workspace Dashboard & Athlete Roster with Grant Badges (`/coach`, `/coach/roster`) — `SCR-PRO-01`, `SCR-PRO-02`
- [ ] **Phase 13:** Consented Athlete View with UK GDPR Article 9 Redaction (`/coach/athletes/:id`) — `SCR-PRO-03`
- [ ] **Phase 14:** Multi-Week Programme & Course Builder + Plan Proposal Creator (`/coach/builder`, `/coach/proposals/new`) — `SCR-PRO-04`, `SCR-PRO-05`

### Track C — Super Admin Command Centre (`3rd Priority`)
- [ ] **Phase 15:** Super Admin Shell, System Health & Real-Time Safety Kill Switches (`/admin`, `/admin/kill-switches`) — `SCR-ADM-01`, `SCR-ADM-02`
- [ ] **Phase 16:** Exercise & Rights CMS, Biomechanics Safety Review & Moderation Queue (`/admin/exercises`, `/admin/safety-review`, `/admin/moderation`) — `SCR-ADM-03`, `SCR-ADM-04`, `SCR-ADM-05`
- [ ] **Phase 17:** Stripe Billing & Entitlement Overrides + Immutable Cryptographic Audit Trail (`/admin/billing`, `/admin/audit`) — `SCR-ADM-06`, `SCR-ADM-07`

### Final Quality Gate
- [ ] **Phase 18:** Cross-Page E2E Navigation Audit, WCAG 2.2 AA Contrast & Keyboard Audit, Performance Budget Verification (`LCP < 2.0s`, `< 150KB` gzipped) & Release Sign-Off

---

## 3. Master Phase Table

| Phase | Track | Target Module / Page | Route(s) | Screen ID(s) | Backend API Integration (`/v1`) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 0** | Core | Master Specs & Roadmap | — | — | — | **Done** |
| **Phase 1** | Core | Design Tokens, RTK Query & UI Primitives | — | — | `baseApi` + Silent Refresh Mutex | Pending |
| **Phase 2** | Core | Router v7, Role Guards & Layout Shells | `*` | Global Shell | `/v1/auth/me`, `/v1/auth/refresh` | Pending |
| **Phase 3** | Athlete | Landing & Value Intro | `/` | `SCR-ATH-01` | Public Health / Pricing Info | Pending |
| **Phase 4** | Athlete | 18+ Age Gate, Login & Register | `/login`, `/register` | `SCR-ATH-02` | `/v1/auth/*`, `/v1/consent/*` | Pending |
| **Phase 5** | Athlete | Minimal Context Intake | `/onboarding` | `SCR-ATH-03` | `/v1/passport/facts` | Pending |
| **Phase 6** | Athlete | Daily Home v4, Why This?, Adapt Diff | `/home` | `SCR-ATH-04..06` | `/v1/daily-home`, `/v1/plans/*` | Pending |
| **Phase 7** | Athlete | Workout Player, Pain Hold & Summary | `/workout/*` | `SCR-ATH-07..10` | `/v1/sync/*`, `/v1/content/*`, `/v1/plans/*` | Pending |
| **Phase 8** | Athlete | Food Intelligence & Recovery Check-In | `/fuel`, `/recovery` | `SCR-ATH-11..12` | `/v1/food-recovery/*`, `/v1/fasting/*`, `/v1/cycle/*` | Pending |
| **Phase 9** | Athlete | Passport Memory & ScopedGrant Manager | `/passport/*` | `SCR-ATH-17..18` | `/v1/passport/*`, `/v1/grants/*` | Pending |
| **Phase 10** | Athlete | Discover, Search & Research Cards | `/learn`, `/search` | `SCR-ATH-13..14` | `/v1/research/*`, `/v1/content/*`, `/v1/ai/*` | Pending |
| **Phase 11** | Athlete | Progress, PBs & Share Card Generator | `/progress/*` | `SCR-ATH-15..16` | `/v1/daily-home`, `/v1/sync/*` | Pending |
| **Phase 12** | Coach | Coach Dashboard & Athlete Roster | `/coach`, `/coach/roster` | `SCR-PRO-01..02` | `/v1/coach/*`, `/v1/grants/*` | Pending |
| **Phase 13** | Coach | Consented Athlete Detail (Art. 9 Redacted) | `/coach/athletes/:id` | `SCR-PRO-03` | `/v1/coach/athletes/:id` | Pending |
| **Phase 14** | Coach | Programme Builder & Plan Proposals | `/coach/builder`, `/coach/proposals/new` | `SCR-PRO-04..05` | `/v1/coach/programmes`, `/v1/coach/proposals` | Pending |
| **Phase 15** | Admin | Command Centre & Safety Kill Switches | `/admin`, `/admin/kill-switches` | `SCR-ADM-01..02` | `/v1/admin/kill-switches`, `/v1/admin/health` | Pending |
| **Phase 16** | Admin | Content/Rights CMS & Safety Moderation | `/admin/exercises`, `/admin/moderation` | `SCR-ADM-03..05` | `/v1/content/*`, `/v1/admin/moderation` | Pending |
| **Phase 17** | Admin | Billing Overrides & Immutable Audit Log | `/admin/billing`, `/admin/audit` | `SCR-ADM-06..07` | `/v1/billing/*`, `/v1/commerce/*`, `/v1/admin/audit` | Pending |
| **Phase 18** | QA | E2E Navigation, WCAG 2.2 AA & Perf Audit | All | All | Full Staging Verification | Pending |

---

## 4. Detailed Phase Execution Blueprints

### Phase 1: Design System Tokens, Shared RTK Query Endpoints & Core UI Primitives
* **Objective:** Establish reusable, zero-Redux pure UI primitives and wire RTK Query endpoints with automatic 401 silent refresh.
* **Files to Create:**
  - `apps/web/src/styles/index.css` (Tailwind v4 theme variables, `Anton`/`Inter`, focus ring utility)
  - `apps/web/src/components/ui/Button.tsx` (Primary `#C7FF00` w/ `#101212` text, Secondary, Danger `#FF4B4B`, Ghost, Loading spinner)
  - `apps/web/src/components/ui/Input.tsx`, `Select.tsx`, `Checkbox.tsx` (with inline Zod validation error display)
  - `apps/web/src/components/ui/Card.tsx`, `Badge.tsx`, `RingGauge.tsx` (animated SVG progress ring)
  - `apps/web/src/components/ui/Modal.tsx`, `Drawer.tsx` (accessible Escape-key & focus trap)
  - `apps/web/src/components/feedback/Skeleton.tsx`, `Toast.tsx`, `ErrorBanner.tsx` (RFC 7807 Problem Details renderer)
  - `packages/shared/src/store/api/` (feature-injected RTK Query endpoints: `authApi.ts`, `dailyHomeApi.ts`, `workoutApi.ts`, `passportApi.ts`, `coachApi.ts`, `adminApi.ts`)
* **Verification Gate:** Every primitive supports all 9 UI states; `npm run build` passes cleanly across monorepo.

---

### Phase 2: App Shell, React Router v7 & Role-Based Layouts
* **Objective:** Wire complete route registry with lazy-loaded views, role guards, and 3 structural layout shells.
* **Files to Create:**
  - `apps/web/src/app/routes.tsx` (React Router v7 nested routes with `React.lazy`)
  - `apps/web/src/app/guards/AuthGuard.tsx`, `AgeGateGuard.tsx`, `RoleGuard.tsx` (`ATHLETE`, `COACH`, `SUPER_ADMIN`)
  - `apps/web/src/layouts/PublicLayout.tsx` (Header + Mobile Drawer + Footer)
  - `apps/web/src/layouts/DesktopSidebarLayout.tsx` (3-Zone Desktop Shell: 260px Left Rail + Fluid 1152px Canvas + 360px Right Context Drawer; collapses to bottom tabs `< 640px`)
  - `apps/web/src/layouts/AdminLayout.tsx` (Super Admin shell with MFA verification badge & live system status indicator)
  - `apps/web/src/components/feedback/NotFoundPage.tsx`, `GlobalErrorBoundary.tsx`
  - `apps/web/src/hooks/useNetworkStatus.ts` (offline banner detector)
* **Verification Gate:** Unauthorized access to `/home`, `/coach`, or `/admin` redirects accurately; zero horizontal scroll on 375px mobile width.

---

### Phase 3: Landing & Value Intro Page (`/` — `SCR-ATH-01`)
* **Objective:** High-conversion public entry page introducing SMACKGYM's deterministic coaching, 18+ UK pilot, and Personal vs. Professional modes.
* **Key Sections:** Hero banner (`Anton` uppercase + Electric Lime CTA), 5-Ring Readiness preview, Clinical Safety ("Something hurts") showcase, Coach & University institutional highlights, transparent pricing cards (Free, Pro £9.99, Student £4.99).
* **Verification Gate:** `< 1.0s` FCP, mobile-responsive layout, direct navigation to `/register` and `/login`.

---

### Phase 4: Auth, 18+ Age Gate & GDPR Consent (`/login`, `/register` — `SCR-ATH-02`)
* **Objective:** Implement complete authentication flow backed by `registerSchema` and `loginSchema` from `@smackgym/shared/schemas`.
* **Key Features:**
  - Strict 18+ age verification checkbox & birth date validation (blocks underage users with `403 forbidden_underage` guidance screen).
  - Granular UK GDPR consent toggles (Terms/Privacy mandatory; Article 9 health tracking explicit opt-in).
  - Connected to `POST /v1/auth/register`, `POST /v1/auth/login`, and `POST /v1/consent`.
* **Verification Gate:** Invalid inputs show field-level errors without losing form state; valid login populates `authSlice` and navigates to `/home` or `/onboarding`.

---

### Phase 5: Minimal Context Onboarding Intake (`/onboarding` — `SCR-ATH-03`)
* **Objective:** Fast, 3-step progressive profiling ("Fast Signup $\rightarrow$ Immediate Starter Value") without bloated 20-question intake forms.
* **Key Features:** Primary goal selector (Hypertrophy, Strength, Conditioning, Fat Loss), available gym equipment chips, weekly schedule selector (2–6 days), optional injury restriction notice.
* **API Integration:** Writes atomic facts to `POST /v1/passport/facts` and triggers initial plan generation.

---

### Phase 6: Signed-In Daily Home v4 Core Hub (`/home` — `SCR-ATH-04`, `SCR-ATH-05`, `SCR-ATH-06`)
* **Objective:** Replace prototype with live, API-connected Daily Home v4 experience.
* **Key Features:**
  - **5 Interactive SVG Rings:** Readiness, Weekly Work, Safe Streak, Fuel/Macros, Habit/Recovery — clicking opens the 360px Right Context Drawer (`SCR-ATH-05` "Why This?").
  - **Next Move Hero Card:** Displays active session from `GET /v1/daily-home` with high-contrast `#C7FF00` "START WORKOUT" CTA.
  - **Adapt (Change Today) Diff Sheet (`SCR-ATH-06`):** Allows time shortage (20/30/45 min), equipment swap, or high-fatigue adjustment via `POST /v1/plans/:id/adapt`, rendering before/after diff with reason codes and atomic acceptance (`expectedRevision` + `409 stale_revision` conflict recovery).
  - **Ask SMACK AI Inline Explanation:** Displays deterministic rule card immediately; overlays AI natural-language explanation with graceful 10s fallback.

---

### Phase 7: Active Workout Follow-Along Player & Safety Hold (`/workout/session`, `/workout/summary` — `SCR-ATH-07` to `SCR-ATH-10`)
* **Objective:** Deliver the signature split-screen workout execution interface.
* **Key Features:**
  - **HLS Video Player (`useHlsPlayer.ts`):** Requests 15-min HMAC signed token from `/v1/content/:id/stream-token` and plays adaptive Bunny Stream `.m3u8` video with fallback cues.
  - **Set & Rep Logger:** Weight (kg), Actual Reps, RPE slider, and client-generated RFC 4122 UUIDv4 per completed set pushed to `POST /v1/sync/batch`.
  - **Rest Countdown Timer:** Auto-triggers on set completion with audible chime and skip/+30s controls.
  - **Exercise Substitution Drawer (`SCR-ATH-08`):** Instant equipment-matched swaps.
  - **Non-Bypassable "Something Hurts" Safety Sheet (`SCR-ATH-09`):** Pinned `#FF4B4B` trigger; freezes rest timers in $< 16\text{ms}$, locks loaded compound sets, persists `ActiveMedicalHold`, survives browser refresh.
  - **Session Summary (`SCR-ATH-10`):** Total volume lifted, new Personal Bests, session RPE feedback.

---

### Phase 8: Manual Food Intelligence & Recovery Check-In (`/fuel`, `/recovery` — `SCR-ATH-11`, `SCR-ATH-12`)
* **Objective:** Low-friction nutrition and morning readiness logging.
* **Key Features:**
  - **Food Intelligence Log (`/fuel`):** Null-safe macro fields (`foodEntrySchema`), meal type selector (`breakfast`, `lunch`, `dinner`, `snack`, `suhoor`, `iftar`), daily hydration bar.
  - **Ramadan / Fasting Mode Integration:** Connects to `/v1/fasting/*`; suppresses daytime hydration prompts and shifts targets to Iftar–Suhoor window.
  - **Recovery Check-In (`/recovery`):** 1–5 sliders for Sleep, Soreness, Energy, Stress, and optional Menstrual Cycle symptom logging (`/v1/cycle/*`), recomputing the 0–100 Readiness Index live.

---

### Phase 9: Performance Passport & `ScopedGrant` Privacy Manager (`/passport`, `/passport/privacy` — `SCR-ATH-17`, `SCR-ATH-18`)
* **Objective:** Full athlete data sovereignty under UK GDPR.
* **Key Features:**
  - **Memory Fact Explorer (`/passport`):** Categorized fact list with origin badges (`user_declared`, `session_derived`, `coach_submitted`), inline edit with optimistic `revision`, and instant fact deletion.
  - **`ScopedGrant` Manager (`/passport/privacy`):** View active coach access grants, issue time-bound scoped grants (Article 9 domains unchecked by default), one-click instant revocation (`DELETE /v1/grants/:id`), and UK GDPR Article 20 JSON data export button.

---

### Phase 10: Discover Feed, Universal Search & Research Cards (`/learn`, `/search` — `SCR-ATH-13`, `SCR-ATH-14`)
* **Objective:** Evidence-linked exercise education and scientific discovery.
* **Key Features:**
  - **Discover Feed (`/learn`):** Filterable feed of exercise technique videos and PubMed/Crossref/Substack research cards (`/v1/research/*`) with DOI citations and linked exercise previews.
  - **Universal Search (`/search`):** Debounced search across exercises, programmes, and research cards with muscle group & equipment filters.

---

### Phase 11: Progress Analytics, Personal Bests & Share Cards (`/progress`, `/progress/share` — `SCR-ATH-15`, `SCR-ATH-16`)
* **Objective:** Visual progress tracking and privacy-safe social sharing.
* **Key Features:**
  - Adherence charts (weekly work & Safe Streak calendar heatmap), Exercise Personal Bests (1RM estimates & volume trends).
  - **Privacy-Safe Share Card Generator (`/progress/share`):** Generates downloadable branded `#101212`/`#C7FF00` summary cards that strictly strip medical holds, weight/body metrics, and private Article 9 data.

---

### Phase 12: Coach Workspace Dashboard & Athlete Roster (`/coach`, `/coach/roster` — `SCR-PRO-01`, `SCR-PRO-02`)
* **Objective:** Professional Mode entry hub for coaches and mentors.
* **Key Features:**
  - Coaching overview KPIs (Active athletes, pending plan proposals, expiring `ScopedGrants`, Stripe Connect payout summary).
  - Searchable Athlete Roster displaying grant status badges (`Active`, `Expiring Soon`, `Revoked`) and invite-athlete modal.

---

### Phase 13: Consented Athlete View (`/coach/athletes/:id` — `SCR-PRO-03`)
* **Objective:** Deep athlete performance review strictly governed by the UK GDPR Article 9 firewall.
* **Key Features:**
  - Displays granted training history, adherence, readiness trends, and active injury holds (read-only; coaches cannot override medical holds).
  - **Strict UI Redaction:** Faith/Ramadan, menstrual cycle, pregnancy, and raw AI chat tabs are completely absent from the DOM unless explicitly present in the athlete's active `ScopedGrant` scopes.

---

### Phase 14: Programme & Course Builder + Plan Proposals (`/coach/builder`, `/coach/proposals/new` — `SCR-PRO-04`, `SCR-PRO-05`)
* **Objective:** Desktop-optimized multi-week periodization authoring studio.
* **Key Features:**
  - Multi-week grid builder (Weeks 1–12, Days 1–7), exercise library drawer with search/equipment filters, sets/reps/RPE/rest editors, and deload week flagging.
  - **Plan Proposal Creator (`SCR-PRO-05`):** Drafts structured adaptation proposals sent to an athlete's inbox for explicit athlete acceptance (coaches never mutate live athlete schedules directly).

---

### Phase 15: Super Admin Shell & Real-Time Safety Kill Switches (`/admin`, `/admin/kill-switches` — `SCR-ADM-01`, `SCR-ADM-02`)
* **Objective:** Mission-critical emergency operations console restricted exclusively to `SUPER_ADMIN`.
* **Key Features:**
  - Real-time system health telemetry (API latency, MongoDB replica status, Redis queue depth, multi-region sync markers).
  - **Safety Kill Switches (`SCR-ADM-02`):** Instant toggle controls for `GLOBAL_AI_KILL_SWITCH`, `EXERCISE_PLAYBACK_TAKEDOWN` (by canonical `EX-XXXX`), and `NEW_REGISTRATIONS_PAUSED`.
  - Mandatory reason code + ticket reference + step-up MFA modal before committing any toggle.

---

### Phase 16: Content & Rights CMS + Safety Moderation (`/admin/exercises`, `/admin/safety-review`, `/admin/moderation` — `SCR-ADM-03` to `SCR-ADM-05`)
* **Objective:** Exercise catalogue administration, video license expiry management, and safety/report triage.
* **Key Features:**
  - Exercise version editor, Bunny Stream asset linker, license territory/expiry date tracker with automated warning badges.
  - Biomechanical safety review queue and user/coach moderation triage queue with approve/reject/suspend actions.

---

### Phase 17: Billing Overrides & Immutable Audit Trail (`/admin/billing`, `/admin/audit` — `SCR-ADM-06`, `SCR-ADM-07`)
* **Objective:** Financial administration and cryptographic compliance auditing.
* **Key Features:**
  - Subscription entitlement inspector (`free`, `trial`, `paid`, `grace`, `expired`, `refunded`), university institutional seat allocation manager (`/v1/institution/*`), Stripe Connect coach payout overview (`/v1/commerce/*`).
  - **Immutable Audit Trail (`SCR-ADM-07`):** Filterable, read-only table of all administrative actions showing actor, timestamp, reason code, before/after JSON diff, and cryptographic hash-chain verification status.

---

### Phase 18: Final Cross-Page QA, Accessibility & Performance Release Gate
* **Objective:** Certify production readiness across all 3 roles and 28 screens.
* **Verification Tasks:**
  1. Full cross-page navigation & role-switching walkthrough (`Guest` $\rightarrow$ `Athlete` $\rightarrow$ `Coach` $\rightarrow$ `Super Admin`).
  2. WCAG 2.2 AA audit (keyboard tab order, focus rings, ARIA labels, `#C7FF00`/`#101212` contrast $\ge 7:1$).
  3. Responsive viewport verification (`375px` mobile, `768px` tablet, `1440px` desktop — zero horizontal overflow).
  4. Bundle size verification (`< 150KB` gzipped initial JS) and clean monorepo build (`npm run build`).

---

## 5. Standard 6-Step Micro-Workflow (Applied to Every Build Phase)

For every phase from **Phase 1 to Phase 17**, execution strictly follows:
1. **Blueprint Announcement:** State target route(s), layout shell, API hooks, and UI sections.
2. **Modular Subcomponents:** Create scoped subcomponents inside `src/features/<feature>/components/`.
3. **Full View Assembly:** Wire layout, Redux/RTK Query hooks, and Zod validation schemas from `@smackgym/shared`.
4. **9-State Verification:** Verify Default, Hover, Active, Focus, Loading (skeleton), Empty, Error (RFC 7807), Disabled, and Success states.
5. **Responsive & Build Check:** Run `npm --prefix apps/web run typecheck` and `npm --prefix apps/web run build`.
6. **Checkpoint Gate:** Update `[x]` in this file, list modified files, and stop for user approval before moving to Phase $N+1$.
