# SMACKGYM Web Application — Engineering Rules & Guardrails (`rules.md`)

> **Applies To:** All human contributors and AI coding agents working on `@smackgym/web`  
> **Status:** Active & Enforced Baseline  
> **Companion Docs:** [`apps/web/docs/PRD.md`](file:///home/bishal/BishalHome/Cours/Ecommarce/SMACKGYM/apps/web/docs/PRD.md), [`apps/web/docs/Architecture.md`](file:///home/bishal/BishalHome/Cours/Ecommarce/SMACKGYM/apps/web/docs/Architecture.md), and [`docs/design.md`](file:///home/bishal/BishalHome/Cours/Ecommarce/SMACKGYM/docs/design.md)

---

## 1. Non-Negotiable Rules (Never Violate)

1. **No Direct Database or SQL Logic (`RULE-WEB-01`):**  
   The web application MUST NOT import SQL libraries, ORMs (Prisma, TypeORM), or direct MongoDB drivers. All data access MUST flow through the backend Express REST API (`/v1`) via RTK Query in `@smackgym/shared`.
2. **Deterministic-First AI Rule (`RULE-WEB-02`):**  
   All workout adjustments, plan modifications, and deload decisions MUST be derived deterministically by the 6-step Decision Engine. Generative AI (`Ask SMACK AI`) is an optional natural-language formatter. UI views MUST NEVER break or hang if AI chat is disabled or times out.
3. **Non-Bypassable Pain Safety Freeze (`RULE-WEB-03`):**  
   When an athlete triggers "Something hurts", the client MUST immediately freeze all rest countdown timers and lock the "Complete Set" action on loaded compound movements in $< 16\text{ms}$. This state MUST NOT be dismissible without active resolution or cleared medical clearance.
4. **Zod Validation at the Edge (`RULE-WEB-04`):**  
   Every user-facing form (Auth, 18+ gate, Food log, Coach course builder) MUST validate payloads using canonical Zod schemas from `@smackgym/shared/schemas` before dispatching network mutations.
5. **No Secrets in Client Code (`RULE-WEB-05`):**  
   API keys, Stripe private keys, JWT secrets, or internal IPs MUST NOT exist in client code. Only public client environment variables prefixed with `VITE_` are permitted.
6. **Zero `any` TypeScript Policy (`RULE-WEB-06`):**  
   `"strict": true` and `"noImplicitAny": true` MUST be maintained. The use of `any` is strictly forbidden. Use typed domain interfaces from `@smackgym/shared/types` or `unknown` with type guards.

---

## 2. Tech Stack & Dependency Rules

* **Approved Core Stack:** React 19, TypeScript 5.8+, Vite 6, Tailwind CSS v4 (`@tailwindcss/vite`), Redux Toolkit & RTK Query (`@smackgym/shared`), React Router v7, Lucide React.
* **Package Management:** Use root `npm` exclusively within the Turborepo monorepo. MUST NOT run rogue `yarn` or `pnpm` commands that create mismatched lockfiles.
* **Prohibited Dependencies:**
  - CSS-in-JS libraries (Styled Components, Emotion) -> Banned in favor of Tailwind CSS v4.
  - Alternate state management (Zustand, MobX, Recoil) -> Banned; all global state MUST reside in Redux Toolkit via `@smackgym/shared`.
  - Direct Axios/Fetch calls in components -> Banned; all remote mutations MUST use RTK Query hooks.

---

## 3. Folder & Architectural Boundaries

### 3.1 Strict Import Hierarchy
```text
src/app/ (Root Router & Providers)
    └── src/layouts/ (DesktopSidebar, Public, Admin)
         └── src/features/ (Domain Feature Modules)
              ├── src/components/ui/ (Reusable Primitives)
              ├── src/hooks/ (Web-specific Custom Hooks)
              └── packages/shared/ (Store, Schemas, Types, Constants)
```

### 3.2 Forbidden Crossings
* **No Sibling Feature Imports:** A feature module (`features/daily-home/`) MUST NOT import components or private helpers directly from a sibling module (`features/workout-player/`). Cross-feature communication MUST pass through shared Redux state or URL parameters.
* **Pure UI Components:** Files in `src/components/ui/` MUST NOT import the Redux store or RTK Query hooks. They MUST be pure, presentational components driven strictly by props.
* **No Direct Video Hosting:** The web client MUST NOT bundle or serve MP4/WebM video files directly from `public/` or `assets/`. Video streaming MUST resolve through Bunny Stream HLS `.m3u8` playlists via signed tokens.

### 3.3 File & Symbol Naming Standards
* React Components & Layouts: `PascalCase.tsx` (e.g., `DailyHomeView.tsx`, `DesktopSidebarLayout.tsx`).
* Custom Hooks: `camelCase.ts` prefixed with `use` (e.g., `useAuthSession.ts`, `useHlsPlayer.ts`).
* Services & Utils: `camelCase.ts` (e.g., `hlsStream.service.ts`, `formatters.ts`).
* Feature Folders: `kebab-case/` (e.g., `workout-player/`, `coach-workspace/`).

---

## 4. Coding, State Management & UI Standards

### 4.1 Daily Home v4 & 3-Zone Desktop Layout
* The desktop interface MUST default to the **3-Zone Layout** (`DesktopSidebarLayout`):
  1. *Left Rail (Navigation & Mode Switcher):* Pinned at 260px; collapses to bottom tab bar on mobile (`< 640px`).
  2. *Central Canvas (Core Action Zone):* Fluid max-width ($1152\text{px}$ `max-w-6xl`) hosting Daily Home v4, workout player, or builder.
  3. *Right Context Drawer:* Collapsible 360px panel for "Why this?", meal breakdown, or coach notes.

### 4.2 Mandatory 9 Component States
Every interactive component or page view MUST explicitly handle the 9 standard states specified in `UI/04_INTERACTIVE_STATES_AND_EDGE_CASES.md`:
1. **Default:** Clean idle presentation.
2. **Hover:** Smooth background/border tint transition ($150\text{ms}$).
3. **Active / Pressed:** Subtle scale down (`active:scale-95`).
4. **Focus-Visible:** Accessible lime focus ring (`focus-visible:ring-2 focus-visible:ring-[#C7FF00]`).
5. **Loading:** Skeleton placeholder or pulse indicator; buttons disable and show spinner.
6. **Empty State:** High-contrast graphic, clear copy, and single primary recovery CTA.
7. **Error State:** RFC 7807 problem details message in alert banner with retry button.
8. **Disabled:** Visual 40% opacity with `cursor-not-allowed` and `pointer-events-none`.
9. **Success:** Green confirmation flash (`#22C55E`) or checkmark indicator.

### 4.3 Design System & Token Enforcements
* **Primary Action Accent (`#C7FF00`):** Exclusively reserved for primary action triggers (e.g. "START WORKOUT", "ACCEPT ADAPTATION", active readiness ring). Text on `#C7FF00` buttons MUST be `#101212` font-bold to satisfy WCAG 2.2 AA contrast ($\ge 7:1$).
* **Dark Canvas Surface (`#101212`):** Background MUST be dark neutral; card containers MUST use `#1A1D1D` with `#2E3434` borders.
* **Typography:**
  - Headlines & Metric Numbers: MUST use font class `font-anton` (`letter-spacing: 0.05em`).
  - Body Text & Form Labels: MUST use font class `font-sans` (`Inter`).

---

## 5. Security & UK GDPR Article 9 Guardrails

1. **UK GDPR Article 9 Special Category Isolation:**  
   The web application MUST NOT store sensitive Article 9 health data (fasting calendar dates, menstrual cycle records, pregnancy status, raw AI chat) in unencrypted browser storage (`localStorage` or `sessionStorage`).
2. **Coach View Data Redaction:**  
   When rendering athlete views for coaches (`/coach/athletes/:id`), the UI MUST NOT display sensitive tabs (faith, cycle, pregnancy) unless the athlete has granted an unexpired `ScopedGrant`.
3. **Silent Token Refresh Mutex:**  
   JWT access tokens MUST reside in Redux memory (`authSlice`). When an API call returns `401 Unauthorized`, an RTK Query baseQuery mutex MUST halt subsequent requests, request `/v1/auth/refresh`, update the access token, and replay the pending requests transparently.
4. **18+ Age Invariant Gate:**  
   Users under 18 years of age MUST NOT be permitted into active training or plan generation workflows. The client MUST enforce redirect to youth safety guidance.

---

## 6. Verification & Definition of Done

Before declaring any web task or feature complete, the following commands MUST execute with zero errors:

```bash
# 1. Verify TypeScript compiles without any type errors
npm --prefix apps/web run typecheck

# 2. Verify production bundle builds cleanly
npm --prefix apps/web run build

# 3. Verify monorepo pipeline builds all packages
npm run build
```

### Definition of Done (DoD) Checklist
- [ ] TypeScript typecheck passes cleanly with zero errors (`tsc --noEmit`).
- [ ] Production Vite build generates clean static assets in `apps/web/dist/`.
- [ ] All 9 UI component states (especially Empty, Loading, and Error) are implemented.
- [ ] Responsive design verified across Mobile ($< 640\text{px}$), Tablet ($768\text{px}$), and Desktop ($\ge 1024\text{px}$).
- [ ] WCAG 2.2 AA contrast ratios validated ($\ge 7:1$ for Electric Lime buttons).
- [ ] No private secrets or credentials exist in the committed code.

---

## 7. Git & Change Hygiene

* **Atomic Diffs:** Keep changes strictly scoped to the requested web task; do not modify server or mobile code unless shared packages require updates.
* **Conventional Commits:** Format commit messages matching `GIT_COMMIT.md`:
  - `feat(web): implement daily home v4 five animated rings`
  - `fix(web): resolve timer freeze on something hurts safety hold`
  - `style(web): align button typography to anton uppercase`
* **Documentation Sync:** If a code change alters a route path, component state, or architectural boundary, immediately update [`apps/web/docs/Architecture.md`](file:///home/bishal/BishalHome/Cours/Ecommarce/SMACKGYM/apps/web/docs/Architecture.md) and [`apps/web/docs/PRD.md`](file:///home/bishal/BishalHome/Cours/Ecommarce/SMACKGYM/apps/web/docs/PRD.md).

---

## 8. AI Agent Behavioral Rules

1. **Inspect Before Editing:** Always inspect existing components and `@smackgym/shared` exports before creating new types, constants, or mock data.
2. **No Mock Data Duplication:** When an API contract or schema exists in `@smackgym/shared`, import and use it directly instead of creating local mock interfaces.
3. **Root-Cause Bug Resolution:** When fixing UI bugs or build failures, resolve the underlying TypeScript or layout issue directly. Never suppress errors with `// @ts-ignore`, `any`, or `eslint-disable`.
4. **Honest Verification:** Never report that a web feature is working or verified without executing `npm --prefix apps/web run typecheck` and `npm --prefix apps/web run build`.
