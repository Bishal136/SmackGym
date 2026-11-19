# SMACKGYM — Design System & UX Specification (`design.md`)

> **Visual Authority:** Governed by **SMACKGYM Developer Handover v5.1 (Approved UX Revision — Daily Home v4)** and `docs/PRD.md`. Where earlier dark-mode brand boards differ, this specification takes precedence for all signed-in Web, Android, and Apple iOS interfaces.

---

## 1. Design Philosophy & Legacy Reconciliation

**SMACKGYM** is a calm, action-led Personal Performance Ecosystem built around the promise: **"Know What To Do Next."**

* **Action-First Hierarchy:** `Coaching → Action → Progress → Content → Social`. Every signed-in screen answers *"What is my next best action?"* before presenting social or discovery feeds.
* **Reconciling Legacy Brand Boards (`Brand_Identity.pdf` vs. `Handover v5.1`):**
  * **Surface Shift:** Early brand boards featured heavy dark surfaces (`#17161E` Jet Black, `#504F4F` Asphalt). Per Approved UX Revision `Daily Home v4`, core signed-in coaching screens use **80–85% White (`#FFFFFF`) and Warm Off-White (`#F6F7F3`)** to maximize gym legibility and reduce visual fatigue. Dark `#101212` surfaces are reserved for high-contrast typography, primary action buttons, and public marketing hero banners.
  * **Typography Update:** **`Anton`** remains locked for condensed display headlines, while **`Inter`** replaces *Oswald* and *Montserrat* as the unified UI and body typeface across Web and Mobile.
* **Three Visual Layers:**
  1. **Coaching Layer:** Calm, light, high-whitespace cards focused on the single next action.
  2. **Performance Layer:** Compact, high-legibility numeric logging (sets, reps, load, RPE, timers) usable mid-workout.
  3. **Discovery Layer:** Rich photography, HLS video, and 3D technique demos positioned *below* the primary action layer.

---

## 2. Brand Identity, Logo & Coaching Voice

### 2.1 Logo & Mark Usage
* **Master Brand:** `SMACKGYM` (paired with the geometric angular **`S`** mark).
* **Clear Space Rule:** Maintain unobstructed padding equal to at least **$1/4$ of the mark's height** around the full logo lockup at all screen sizes.
* **Contrast:** Use Near-Black (`#101212`) artwork on White (`#FFFFFF`) or Electric Lime (`#C7FF00`) surfaces, and pure White (`#FFFFFF`) artwork on Near-Black (`#101212`) surfaces. Never stretch, rotate, or add drop shadows to the mark.

### 2.2 Coaching Tone & Copywriting
* **Straight Coaching Language:** Be clear, calm, and non-punitive.
  * *Good:* `"Your match moved to Sunday. We've moved your harder gym session to Wednesday."`
  * *Avoid:* Guilt-inducing streak warnings, medical diagnoses, or exaggerated fitness claims.
* **Honest Uncertainty:** Label estimates clearly. Never display missing nutrition macros as `0` (show `Unknown`), and never display uncalibrated percentages as scientific certainty.

---

## 3. Color Tokens & Contrast System (Tailwind CSS v4 & NativeWind v4)

All colors are defined as shared design tokens in `packages/shared/src/constants/theme.ts` and mapped identically to Tailwind CSS (Web) and NativeWind (Android/iOS).

| Token Name | Hex Value | Usage & Component Mapping | Contrast & Safety Rule |
| :--- | :--- | :--- | :--- |
| **`brand-lime`** | `#C7FF00` | Primary CTAs (`Start session →`), active nav pill, weekly progress ring arc, `Ask SMACK` orb | **MUST pair with `#101212` text.** NEVER render `#C7FF00` text on white/light backgrounds. |
| **`surface-canvas`** | `#FFFFFF` | Primary page background (`80–85%` of coaching views) and elevated cards | Pair with `text-primary` (`#101212`). |
| **`surface-subtle`** | `#F6F7F3` | Warm off-white secondary panels, right-rail cards, and subtle input backgrounds | Pair with `text-primary` or `text-secondary`. |
| **`border-divider`** | `#E4E7DF` | Hairline card borders, table dividers, and inactive ring outlines | `1px` crisp separation without heavy drop shadows. |
| **`text-primary`** | `#101212` | Near-Black headlines, body text, icons, and foreground text on Electric Lime buttons | Exceeds WCAG 2.2 AA contrast on `#FFFFFF` and `#C7FF00`. |
| **`text-secondary`** | `#596256` | Muted metadata (duration, equipment tags, timestamps, helper copy) | Verified accessible contrast on `#FFFFFF` and `#F6F7F3`. |
| **`accent-peach`** | `#FDE8D7` | Soft secondary category pill (e.g., *Recovery / Mobility*) | Decorative grouping only; always pair with text label. |
| **`accent-blue`** | `#E0F0FF` | Soft secondary category pill (e.g., *Strength / Conditioning*) | Decorative grouping only; always pair with text label. |
| **`accent-lavender`** | `#EFE6FD` | Soft secondary category pill (e.g., *Learn / Research*) | Decorative grouping only; always pair with text label. |
| **`semantic-danger`** | `#D92D20` | `Something hurts` safety stop button, validation errors, and revoked rights alerts | Always accompany with an alert icon and explicit text. |

---

## 4. Typography & Localisation System

### 4.1 Locked Font Families
* **Display Headlines (`font-display`):** **`Anton`** — Uppercase, tight tracking (`+0.02em`), used for hero titles, KPI numbers (`30%`), and motivational overlay banners (`BUILD YOUR FOUNDATION`).
* **UI & Body Copy (`font-sans`):** **`Inter`** — `16px` (`1rem`) body baseline, `1.5` line-height, tabular numerals (`tabular-nums`) for workout timers, weights, and macro counters.

### 4.2 Type Scale

| Role | Font Family | Size (Web / Mobile) | Weight | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | `Anton` | `36px` / `32px` | `400` (Regular) | `1.1` |
| **Section Heading** | `Inter` | `22px` / `20px` | `700` (Bold) | `1.25` |
| **Card Title (`Next Move`)** | `Inter` | `18px` / `18px` | `700` (Bold) | `1.3` |
| **Body Default** | `Inter` | `16px` / `16px` | `400` (Regular) | `1.5` |
| **UI Button / Label** | `Inter` | `14px` / `14px` | `600` (SemiBold) | `1.2` |
| **Caption / Micro-Meta** | `Inter` | `12px` / `12px` | `500` (Medium) | `1.4` |

### 4.3 Multi-Script & RTL Layout Rules (`LOC-01` to `LOC-05`)
* **Phase P1 (`en-GB`):** English UK launches first (Left-to-Right).
* **Phase P3 (`bn`, `hi`, `ur`) & Phase P4 (`ar`):** Load shaping-capable companion fonts (`Noto Sans Bengali`, `Noto Sans Devanagari`, `Noto Nastaliq Urdu` / `Noto Sans Arabic`).
* **Strict RTL Mirroring Rule:** In Urdu (`ur`) and Arabic (`ar`), flip navigation sidebars, drawers, and text alignment right-to-left using logical CSS properties (`ms-*`, `me-*`, `ps-*`, `pe-*`), **but NEVER mirror exercise demonstration videos, 3D animations, media playback controls, or anatomical left/right instructions.**

---

## 5. Spacing, Layout Grid & Touch Accessibility

* **Spacing Scale:** Strictly adhere to the `4 / 8 / 12 / 16 / 24 / 32` (`px`) scale (`space-1` through `space-8` in Tailwind).
* **Touch Targets (`WCAG 2.2 AA`):** Every interactive button, daily circle, set checkbox, and feed control must have a minimum hit area of **$44 \times 44$ to $48 \times 48$ logical pixels** with at least `8px` separation.
* **Responsive Breakpoints:**
  * **Mobile (`< 768px`):** Single-column scroll view with bottom tab bar and top utility header.
  * **Tablet (`768px – 1023px`):** Collapsible rail sidebar + single/two-column adaptive content grid.
  * **Desktop (`>= 1024px`):** Approved 3-zone layout (Left Navigation Sidebar `240px` + Center Coaching & Feed Column `minmax(0, 680px)` + Right Context Rail `320px`).

---

## 6. Approved Signed-In Homepage (`Daily Home v4`) Specification

Per **UX 1 & UX 2 (Approved UX Revision)**, the signed-in homepage (`Home`) implements the following exact component structure:

### 6.1 Navigation Shell
* **Desktop Left Sidebar:**
  * Top Brand Mark: `SMACKGYM` wordmark in `Anton`.
  * Primary Links: `Home` (active pill filled with `#C7FF00`), `Search`, `Discover`, `Train`, `Progress`, `Community`, `Messages`, `Profile`.
  * Bottom Anchor: `Settings`.
* **Mobile Navigation:**
  * Top Header: `SMACKGYM` wordmark (left), `Messages` icon & `Notifications` bell with `#C7FF00` badge dot (right).
  * Top Sub-Tabs: `For you` (active underline in `#C7FF00`) | `Following`.
  * Bottom Tab Bar (5 fixed tabs): `Home`, `Train`, `Discover`, `Progress`, `Profile`.

### 6.2 Top Section: `YOUR DAILY SNAPSHOT` (5 Daily Circles)
Displayed horizontally across the top of the main column:
1. **`Progress` (Measured Arc):** Displays percentage (`30%`) inside a circular ring whose `#C7FF00` stroke arc reflects `completed / planned` weekly sessions. Tapping reveals exact counts (`2 of 6 sessions`). *If no plan exists, display `"Set a plan"` instead of `"0%"`.*
2. **`Today` (Shortcut Outline):** Displays daily action fraction (`1/3`) inside a crisp `#C7FF00` outline ring.
3. **`Check-in` (Shortcut Outline):** Smiley/wellness icon for optional daily sleep, fatigue, stress, and soreness logging.
4. **`Recovery` (Shortcut Outline):** Crescent moon/rest icon linking to today's mobility or rest action.
5. **`Your team` (Shortcut Outline):** Group icon linking to university/club updates (or `Find your team` if unlinked).
*(Note: Only `Progress` uses a measured completion arc; the other 4 rings are visual shortcut outlines, not completion scores).*

### 6.3 Primary Action Card: `YOUR NEXT MOVE`
* **Layout:** White card with `1px solid #E4E7DF` border, `16px` border-radius, and `20px` padding.
* **Left Content:**
  * Eyebrow label: `YOUR NEXT MOVE` (`12px` uppercase `Inter` SemiBold, `#596256`).
  * Session Headline: e.g., `25-minute strength` (`20px` Bold `#101212`).
  * Metadata Row: Equipment icon + `Dumbbells (optional)`, Clock icon + `25 min`, Signal icon + `All levels`.
  * Transparency Link: Underlined `Why this?` text button (opens explanation drawer showing confirmed Passport facts and rules).
* **Right Thumbnail & Actions:**
  * Compact `16:9` workout preview thumbnail with motivational badge (`SMALL STEPS BIG CHANGE`).
  * **Primary CTA:** Full-pill or rounded-lg `#C7FF00` button with `#101212` bold text: **`Start session →`**.
  * **Secondary CTA:** Outlined `#FFFFFF` button with `#E4E7DF` border: **`Adapt`** (opens `Change Today` constraint adjuster for less time, missing equipment, or low energy).

### 6.4 Right Context Rail (Desktop) / Contextual Cards (Mobile)
1. **`Your Performance Passport` Card:** User avatar, `2/5` incremental completion bar (`#C7FF00` fill on `#E4E7DF` track), and `Complete your profile >` link. *(Never includes sensitive health, faith, or cycle fields in the completion bar).*
2. **`This week` Calendar Strip:** 7-day selector (`Mon 12` to `Sun 18`) with current day highlighted in a solid `#C7FF00` pill and status dots beneath scheduled/completed days, plus `View all` link.
3. **`Your university` Card:** Photo banner with `Real people. Real progress. Find your team and train together.` and `Find your team →` CTA.
4. **`Ask SMACK AI` Widget:** Sparkle/orb icon, `Get training advice, workout tweaks or quick answers.`, and an inline text input (`Ask a question...`) with send button.

### 6.5 Coaching & Community Feed (`For you` / `Following`)
* **Card Header:** Creator avatar (e.g., `SMACKGYM Coaching` with lime `S` badge or verified athlete `Maya Torres`), category & duration (`Strength • 4 min`), and overflow menu (`•••`).
* **Media Frame:** High-contrast `16:9` or `4:5` action photo/video with clean condensed overlay headline (`BUILD YOUR FOUNDATION`).
* **Standard Social Bar:** `Like` (heart), `Comment` (bubble), `Share` (send), and `Save` (bookmark) icons.
* **Private Usefulness Feedback (`UX 2`):**
  * Inline prompt: **`Was this useful?`** with two pill buttons: **`Yes`** and **`Not for me`**.
  * Selecting `Yes` reveals optional tags: `Clear explanation`, `Fits my goal`, `Easy to apply`.
  * Selecting `Not for me` reveals optional tags: `Wrong level`, `Wrong equipment`, `Not relevant`, `Already know this`, plus a separate `Report concern` trigger.
* **Action Bridge:** Full-width subtle button below feedback: **`⊕ Add to my plan`** (opens schedule/load impact preview before inserting).

---

## 7. Core Screen Flows & iFIT-Style Workout Player UX

### 7.1 iFIT-Style Follow-Along Workout Player (`/workout/active`)
* **Top Media Stage (`45–55%` viewport height on mobile, split-screen on desktop):**
  * Plays adaptive HLS (`.m3u8`) trainer video or **SMACKGYM 3D** loopable demonstration.
  * Overlay controls: Camera angle toggle (Frontal / Side / Oblique), Audio/Captions toggle, and **Offline Cached Badge** when running from `react-native-mmkv` local storage.
* **Middle Coaching & Timer Strip:**
  * Current movement title (`Dumbbell Split Squat`), concise textual cues (`Keep torso upright; drive through front heel`), and target prescription (`3 sets × 10 reps @ RPE 7`).
  * Auto-starting **Rest Timer** (`01:00`) with `+15s` / `Skip Rest` controls that persist across app backgrounding.
* **Bottom Set Logging Table:**
  * Shows previous comparable session weight/reps (`Prev: 12kg × 10`) alongside editable inputs for current `kg` and `reps` and a large `#C7FF00` checkmark button per set.
  * First-class actions: `Substitute Exercise` (equipment-compatible swap) and **`Something hurts`** (high-visibility safety button).

### 7.2 Injury Safety Hold Modal (`Something hurts`)
* Tapping `Something hurts` immediately pauses the workout timer and opens a calm, high-contrast safety sheet:
  * Optional quick inputs: Pain location, onset, severity scale (`1–10`), and aggravating movement.
  * Immediate Action: Pauses affected movement, blocks load progression, and displays expert-reviewed stop/recovery guidance (plus local emergency help copy if urgent warning signs are selected).

### 7.3 `Adapt` (`Change Today`) Before/After Diff Sheet
* Triggered from `Your Next Move → Adapt`:
  * Quick constraint chips: `Only 20 mins`, `No gym / Bodyweight only`, `Poor sleep / Low energy`, `Match / Fixture moved`.
  * Displays a clear **Before vs. After** comparison card explaining *what* changed and *why*, with **`Confirm Plan Update`** (`#C7FF00`) and **`Keep Original`** buttons.

---

## 8. Photography, Video & SMACKGYM 3D Art Direction

* **Real-World Photography (`OWN-01`):** Shoot athletes in believable gyms, university tracks, pitches, and courts. Use tight movement crops with clean negative space so `Anton` headlines remain crisp.
* **SMACKGYM 3D Educational Athlete (`3D-01`):**
  * **Character Design:** Proprietary faceless athletic 3D model with a dark graphite/bronze finish, wearing pink/red athletic shorts.
  * **Biomechanical Overlays:** Highlight target muscle groups and joint angles using **Electric Lime (`#C7FF00`)** vector overlays.
  * **Exports:** Every 3D exercise asset must export a loopable demo, still thumbnail, frontal/side/oblique views, and a locale-neutral master with synced caption cues. Label all 3D anatomy clearly as stylised educational guides.

---

## 9. Mandatory UI Component States & Accessibility Checklist

Every screen and reusable component in `apps/web/src/components` and `apps/mobile/src/components` must explicitly implement all **9 required states** before PR approval:

1. **`Loading` State:** Skeleton placeholders matching exact card dimensions (`#F6F7F3` shimmer) to prevent layout shift (`CLS = 0`).
2. **`Empty` State:** Constructive coaching guidance and a single clear CTA (e.g., `"Set a plan"` on `Progress` circle when unscheduled).
3. **`Error` State:** Plain-English explanation + `Retry` button; never expose raw HTTP codes or stack traces.
4. **`Offline` State:** Subtle top status pill (`Offline Mode — Sets saved locally`) confirming that workout logging remains 100% active via `react-native-mmkv`.
5. **`Safety Hold` State:** Non-dismissible safety banner when an injury restriction or `Something hurts` pause is active.
6. **`Revoked Rights / Expired Media` State:** Automatically hides expired video streams and falls back to approved textual cues or a reviewed substitute exercise.
7. **`Expired Offer / Disabled Entitlement` State:** Clear explanation of free vs. paid tier boundaries without locking users out of their past workout history, safety guides, or GDPR account deletion.
8. **`200% Text Zoom` State:** Responsive flex wrapping so enlarged fonts never clip buttons or overlap numeric inputs.
9. **`Reduced Motion` State:** Respects OS `prefers-reduced-motion` by disabling decorative ring/orb animations while keeping functional timers intact.