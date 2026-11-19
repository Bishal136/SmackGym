# SMACKGYM — Programming & Localisation Languages Specification

## 1. Core Programming & Technical Languages (Web, Mobile & Backend)

SMACKGYM uses a unified **TypeScript-first MERN + React Native (Expo)** architecture so business logic, Redux state slices, and API types are shared across Web, Android, Apple (iOS), and Backend services.

| Layer / Platform | Primary Languages | Frameworks & Libraries | Purpose |
| :--- | :--- | :--- | :--- |
| **Shared Core** | **TypeScript (`.ts`)**, **JSON** | Zod, Redux Toolkit (RTK Query) | Shared data models, API contracts, and deterministic rule types |
| **Web App & Admin** | **TypeScript (`.tsx`)**, **HTML5**, **CSS3** | React, Tailwind CSS v4 | Responsive user web app (`Daily Home v4`), `iFIT`-style player & Admin Command Centre |
| **Android & Apple (iOS)** | **TypeScript (`.tsx`)**, **JSON (NoSQL)** | React Native (Expo SDK 58), NativeWind v4, `expo-video`, `react-native-mmkv` | Cross-platform iOS/Android apps, HLS video streaming & encrypted NoSQL offline workout queue |
| **Backend Server** | **TypeScript** | Node.js 26 LTS, Express.js | Modular REST API, Performance Decision Engine & RBAC security |
| **Database & Search** | **MQL (MongoDB Query Language)**, **BSON** | MongoDB, Mongoose ODM | Versioned `Passport`, `ExerciseVersion`, `PlanVersion`, and `FoodEntry` storage |
| **API & DevOps** | **OpenAPI (YAML/JSON)**, **Bash**, **Dockerfile** | Docker, GitHub Actions, EAS Build | API documentation, Linux VPS deployment, and cloud iOS/Android builds |

---

### Platform-Specific Language Breakdown

#### A. Web App & Admin Panel (Frontend)
- **TypeScript (`.tsx`):** Main application logic, type-safe components, and state management.
- **HTML5:** Semantic structure with WCAG 2.2 AA accessibility attributes (`aria-*` labels, keyboard focus).
- **CSS3 (Tailwind CSS v4):** Utility-first styling implementing SMACKGYM brand tokens:
  - Primary Action: `#C7FF00` (Electric Lime)
  - Primary Text / Dark Surface: `#101212` (Near-Black)
  - Clean Coaching Canvas: `#FFFFFF` (White) & `#F6F7F3` (Warm Off-White)
  - Fonts: `Anton` (Display Headlines) & `Inter` (UI/Body)

#### B. Android & Apple iOS Apps (Mobile)
- **TypeScript (`.tsx`):** 90%+ code reuse with the React web application.
- **NativeWind (Tailwind CSS syntax):** Identical styling classes across Web and Mobile.
- **Encrypted NoSQL / JSON Storage (`react-native-mmkv`):** Ultra-fast local append-only JSON event queue (`UUID` per logged set) for **Offline Gym Mode** when mobile data is unavailable—syncing seamlessly with backend **MongoDB** collections without any SQL dependency.
- **Native Bridges (Managed by Expo):** Kotlin/Java (Android) and Swift/Objective-C (iOS) handled automatically via Expo Prebuild & EAS Build without manual native coding.

#### C. Backend & Database
- **TypeScript on Node.js (Express.js):** Modular backend handling authentication, `ScopedGrant` permissions, and batch offline sync (`POST /v1/session-events/batch`).
- **MongoDB Query Language (MQL):** Aggregation pipelines for weekly progress consistency, personal bests (PBs), and nutrition macro rollups.
- **YAML / JSON:** OpenAPI v1 route contracts and Docker container orchestration.

---

## 2. Human & UI Localisation Languages (SMACKGYM Rollout Plan)

Per **SMACKGYM Developer Handover v5.1 (Chapter 17: Localisation)**, interface languages are stored separately from user nationality or religion and roll out in three gated phases:

| Release Phase | Language | Locale Code | Script & Layout Direction | Key Requirements |
| :--- | :--- | :--- | :--- | :--- |
| **Phase P1 (MVP Launch)** | **English (UK)** | `en-GB` | Latin — Left-to-Right (LTR) | Primary UK university pilot launch language (`Anton` + `Inter`) |
| **Phase P3 (South Asian Expansion)** | **Bangla** | `bn` | Bengali — Left-to-Right (LTR) | Shaping-capable companion font + native-reader safety review |
| **Phase P3 (South Asian Expansion)** | **Hindi** | `hi` | Devanagari — Left-to-Right (LTR) | Shaping-capable companion font + reviewed exercise cues |
| **Phase P3 (South Asian Expansion)** | **Urdu** | `ur` | Nastaliq/Arabic — Right-to-Left (RTL) | Full RTL UI mirroring (without mirroring exercise demo videos) |
| **Phase P4 (Global Expansion)** | **Arabic** | `ar` | Arabic — Right-to-Left (RTL) | Full RTL layout support + territory rights & legal readiness |

### Localisation Engineering Rules
1. **No Unreviewed Machine Translation for Safety:** Critical injury/pain warnings (`SAFE-01`) must use human-reviewed locale packs, falling back to clearly labelled English if unavailable.
2. **Never Mirror Exercise Media in RTL:** When switching to Urdu (`ur`) or Arabic (`ar`), flip navigation bars and text alignment, but keep anatomical left/right instructions and demonstration videos unmirrored.

---

## 3. Recommended Monorepo Structure

```text
SMACKGYM/
├── apps/
│   ├── web/                 # React + TypeScript + Tailwind CSS (User & Admin Web)
│   └── mobile/              # React Native (Expo SDK 58) + NativeWind (Android & iOS)
├── packages/
│   └── shared/              # Shared TypeScript types, Redux slices, Zod schemas & i18n keys
└── server/                  # Node.js + Express + TypeScript + MongoDB API
 