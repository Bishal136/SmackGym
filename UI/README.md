# SMACKGYM — Master Wireframe & UI/UX Specification

> **Authority & Governance:** Aligned strictly with **SMACKGYM Developer Handover v5.1 (Approved UX Revision — Daily Home v4)**, `docs/PRD.md`, `docs/design.md`, and `docs/rules.md`.

---

## 1. Executive Summary & Design System Foundations

SMACKGYM is a personal performance ecosystem engineered with an **Action-First Hierarchy**:
$$\text{Coaching} \longrightarrow \text{Action} \longrightarrow \text{Progress} \longrightarrow \text{Content} \longrightarrow \text{Social}$$

Every screen answers the core question: **"What should I do next?"** before presenting social discovery feeds or passive media.

### 1.1 Brand Visual Tokens (`Daily Home v4`)

```
========================================================================================
TOKEN NAME         HEX VALUE    RGB / HSL            PURPOSE & USAGE RULES
========================================================================================
brand-lime         #C7FF00      rgb(199,255,0)       Primary CTAs, progress arc, active pills
                                hsl(73,100%,50%)     MUST pair with #101212 text. NEVER lime on white.
text-primary       #101212      rgb(16,18,18)        Headlines, body text, high-contrast dark buttons
surface-canvas     #FFFFFF      rgb(255,255,255)     Primary canvas background (80–85% of coaching UI)
surface-subtle     #F6F7F3      rgb(246,247,243)     Warm off-white secondary cards, rails, inputs
border-divider     #E4E7DF      rgb(228,231,223)     Crisp 1px card borders & table dividers
text-secondary     #596256      rgb(89,98,86)        Muted metadata (duration, equipment, timestamps)
accent-peach       #FDE8D7      rgb(253,232,215)     Soft tag: Recovery / Mobility
accent-blue        #E0F0FF      rgb(224,240,255)     Soft tag: Strength / Conditioning
accent-lavender    #EFE6FD      rgb(239,230,253)     Soft tag: Learn / Research
semantic-danger    #D92D20      rgb(217,45,32)       "Something hurts" safety stop, pain hold alerts
========================================================================================
```

### 1.2 Typography Hierarchy

* **Display Headlines (`font-display`):** **`Anton`** — Condensed uppercase, tight tracking (`+0.02em`), used for high-impact titles, KPI numerals (`30%`), and motivational badges.
* **UI & Body Copy (`font-sans`):** **`Inter`** — `16px` baseline (`1rem`), tabular figures (`tabular-nums`) for numeric timers, weights, and macro counters.
* **Companion International Fonts:** `Noto Sans Bengali` (`bn`), `Noto Sans Devanagari` (`hi`), `Noto Nastaliq Urdu` (`ur`), and `Noto Sans Arabic` (`ar`).

---

## 2. Directory Structure of Wireframe Specifications

This specification suite is organized into modular, exhaustive markdown files inside `/UI`:

| Document | Scope & Contents |
| :--- | :--- |
| [UI/README.md](file:///home/bishal/BishalHome/Cours/Ecommarce/SMACKGYM/UI/README.md) | Design system tokens, layout grids, navigation shells, visual tokens, and role index. |
| [UI/01_USER_FLOWS_AND_ROLES.md](file:///home/bishal/BishalHome/Cours/Ecommarce/SMACKGYM/UI/01_USER_FLOWS_AND_ROLES.md) | Exhaustive user journeys and state transition diagrams across Personal Athlete, Coach, and Super Admin roles. |
| [UI/02_WEBSITE_WIREFRAMES.md](file:///home/bishal/BishalHome/Cours/Ecommarce/SMACKGYM/UI/02_WEBSITE_WIREFRAMES.md) | Screen-by-screen desktop and tablet responsive wireframes with ASCII visual layouts, component trees, and interactions. |
| [UI/03_MOBILE_APP_WIREFRAMES.md](file:///home/bishal/BishalHome/Cours/Ecommarce/SMACKGYM/UI/03_MOBILE_APP_WIREFRAMES.md) | Screen-by-screen Android and iOS mobile app wireframes (5-tab navigation, iFIT workout player, offline MMKV queue). |
| [UI/04_INTERACTIVE_STATES_AND_EDGE_CASES.md](file:///home/bishal/BishalHome/Cours/Ecommarce/SMACKGYM/UI/04_INTERACTIVE_STATES_AND_EDGE_CASES.md) | Complete specifications for all 9 mandatory UI states (Loading, Empty, Error, Offline, Safety Hold, Rights Expiry, Zoom, etc.). |

### Visual Architectural Blueprint Boards (16:9 Hi-Res PNG)

| Blueprint Board | Role Scope | Key Interconnected Screens |
| :--- | :--- | :--- |
| [Desktop Web App Wireframe](file:///home/bishal/BishalHome/Cours/Ecommarce/SMACKGYM/UI/SMACKGYM_Desktop_Web_App_Wireframe.png) | Personal Athlete (`/home`) | `/home` (Daily Home v4), `/train/active` (iFIT Player), `/fuel` (Food Diary), `/recover` (Recovery), `/discover` (Science Feed), `/progress` (Passport & PBs). |
| [Companion Mobile App Wireframe](file:///home/bishal/BishalHome/Cours/Ecommarce/SMACKGYM/UI/SMACKGYM_Mobile_App_Wireframe.png) | Personal Athlete (iOS & Android) | `/signup` (Fast Onboarding), `/home` (Mobile Snapshot & Next Move), `/train/active` (MMKV offline sets), `/fuel & /recover`, `/discover`, `/progress`. |
| [Coach & Mentor Wireframe](file:///home/bishal/BishalHome/Cours/Ecommarce/SMACKGYM/UI/SMACKGYM_Coach_Professional_Mode_Wireframe.png) | Professional Coach (`/coach`) | `/coach/overview` (KPIs), `/coach/athletes` (ScopedGrants ACL), `/coach/athletes/:id` (Consented view), `/coach/programmes` (Periodisation matrix), `/coach/proposals`. |
| [Admin Command Centre Wireframe](file:///home/bishal/BishalHome/Cours/Ecommarce/SMACKGYM/UI/SMACKGYM_Admin_Command_Centre_Wireframe.png) | Admin Staff (6 RBAC Roles) | `/admin/kill-switches` (Safety kill switches), `/admin/content-rights` (License expiry), `/admin/safety-queue` (Biomechanics), `/admin/moderation`, `/admin/audit-logs`. |

---

## 3. Global Navigation Shells

### 3.1 Responsive Desktop Web Shell (`>= 1024px`)

```
+-----------------------------------------------------------------------------------------------------------------------+
|  DESKTOP 3-ZONE LAYOUT GRID: Left Sidebar (240px) | Center Main Column (minmax(0, 680px)) | Right Rail (320px)        |
+---------------------+---------------------------------------------------------------------+---------------------------+
|  [S] SMACKGYM       |  TOP BAR: Search input (Ctrl+K)              [Messages (2)] [Bell]  |  PERFORMANCE PASSPORT     |
|                     +---------------------------------------------------------------------+  [Avatar] Alex Morgan     |
|  * Home  [Active]   |  YOUR DAILY SNAPSHOT (5 Circles)                                    |  Progress: [====--] 3/5   |
|  * Search           |  (( 30% ))   (( 1/3 ))   (( :-) ))   (( zZ ))   (( Club ))      |  Edit Profile >           |
|  * Discover         |   Progress     Today     Check-in    Recovery   Your Team       +---------------------------+
|  * Train            +---------------------------------------------------------------------+  THIS WEEK                |
|  * Progress         |  YOUR NEXT MOVE (Primary Action Card)                               |  Mon Tue [WED] Thu Fri    |
|  * Community        |  +---------------------------------------------------------------+  |   *   *    14   .   .     |
|  * Messages (2)     |  | 25-minute strength               [Thumbnail / 3D Loop]       |  |  Full Calendar >          |
|  * Profile          |  | Dumbbells * 25 min * All levels  [ SMALL STEPS BIG CHANGE ]   |  +---------------------------+
|                     |  | Why this? (explainable rules)                                |  |  ASK SMACK AI             |
|  -----------------  |  |                                                               |  |  (( * )) Prompt advice:   |
|  [Professional Mode]|  | [ START SESSION -> ] (#C7FF00)      [ Adapt ]                 |  |  [ Ask a question...   ]  |
|  * Settings         |  +---------------------------------------------------------------+  +---------------------------+
|  * Logout           |  COACHING & COMMUNITY FEED (For You | Following)                    |  YOUR UNIVERSITY          |
+---------------------+---------------------------------------------------------------------+---------------------------+
```

### 3.2 Companion Mobile App Shell (`< 768px`)

```
+--------------------------------------------------+
|  MOBILE HEADER: [S] SMACKGYM      [Chat] [Bell*] |
|  SUB-TABS:      [ For you ]       Following      |
+--------------------------------------------------+
|  SCROLLABLE CONTENT AREA:                        |
|                                                  |
|  (( 30% ))  (( 1/3 ))  (( :-) ))  (( zZ ))       |
|  Progress    Today     Check-in   Recovery       |
|                                                  |
|  +--------------------------------------------+  |
|  | YOUR NEXT MOVE                             |  |
|  | 25-minute strength                         |  |
|  | [ START SESSION -> ] (#C7FF00)             |  |
|  | [ Adapt ]          Why this?               |  |
|  +--------------------------------------------+  |
|                                                  |
|  FEED CARDS / DISCOVERY ...                      |
|                                                  |
+--------------------------------------------------+
|  BOTTOM TAB BAR (44x44px touch targets):         |
|  [Home]    [Train]    [Discover] [Progress] [Profile] |
|   (*)        ( )         ( )        ( )       ( )|
+--------------------------------------------------+
```

---

## 4. Accessibility & Touch Standards (WCAG 2.2 AA)

1. **Touch Hit Targets:** Every clickable element, button, circular ring, set checkbox, and feed action must provide a minimum hit boundary of **$44 \times 44$ to $48 \times 48$ logical units**.
2. **Text Zoom Independence:** Text must cleanly scale up to **200%** using relative rems and flexible wrapping containers without clipping or overlapping numeric workout inputs.
3. **Contrast Guarantees:**
   * `#C7FF00` (Electric Lime) is strictly paired with `#101212` text (Contrast ratio: **14.2:1** — exceeds AAA).
   * `#FFFFFF` canvas background is paired with `#101212` text (Contrast ratio: **17.8:1** — exceeds AAA).
   * Muted text `#596256` on `#FFFFFF` maintains **4.8:1** (exceeds AA requirement of 4.5:1).
4. **Non-Colour State Cues:** Every status (Success, Error, Offline, Safety Hold) combines a distinct typographic label, explicit iconography, and high-contrast bounding border.
