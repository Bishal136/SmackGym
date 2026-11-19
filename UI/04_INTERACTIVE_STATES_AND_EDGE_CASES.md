# SMACKGYM — Interactive States & Edge Cases Specification (`04_INTERACTIVE_STATES_AND_EDGE_CASES.md`)

> **Authority & Governance:** Aligned with **SMACKGYM Developer Handover v5.1 (Chapter 03, Section 9; Chapter 17)**, `docs/PRD.md`, `docs/design.md`, and `docs/rules.md`.

---

## 1. Overview of the 9 Mandatory UI Component States

To prevent layout shifts, broken gym workouts, unhandled errors, or inaccessible scaling, every screen across Web (`apps/web`) and Mobile (`apps/mobile`) must implement the following **9 required states**:

```
========================================================================================================================
STATE #    STATE NAME                         TRIGGER CONDITION                      CORE UX BEHAVIOUR & INVARIANTS
========================================================================================================================
01         Loading (Shimmer Skeleton)         Network latency / cache fetch          #F6F7F3 geometric skeleton matching exact
                                                                                     card dimensions. Zero layout shift (CLS = 0).
02         Empty (Constructive Guidance)      No data / unscheduled state            Never show "0% fitness" or blank screens.
                                                                                     Displays constructive CTA: "Set a plan".
03         Error (Graceful Recovery)          API / network exception               Plain-English message + "Retry" button.
                                                                                     Never expose raw HTTP codes or stack traces.
04         Offline (Encrypted MMKV Queue)     Gym low-connectivity / Airplane mode   Top status pill: "Offline Mode — Sets saved
                                                                                     locally". Workout player stays 100% operational.
05         Safety Hold (Injury Restriction)   "Something hurts" or active injury     Non-dismissible safety banner. Pauses affected
                                                                                     movements; cannot be bypassed via AI or links.
06         Revoked Rights / Expired Media     Territory / license window expired     HLS video hides automatically; falls back to
                                                                                     approved textual cues or reviewed substitute.
07         Disabled Entitlement / Paywall     Subscription expired / free tier limit Free vs. paid tier explanation. Never locks
                                                                                     users out of past workout history or GDPR data.
08         200% Text Zoom Accessibility       User OS / browser font scaling >= 200% Flex wrapping and min-heights. Buttons and
                                                                                     numeric set inputs never clip or overlap.
09         Reduced Motion Accessibility       OS prefers-reduced-motion = reduce     Disables decorative ring and orb pulsing.
                                                                                     Preserves functional countdown rest timers.
========================================================================================================================
```

---

## 2. Screen-by-Screen ASCII Wireframes for Critical States

### 2.1 State 01: Loading (Shimmer Skeleton) — Daily Home v4

```
+-----------------------------------------------------------------------------------------------------------------------+
|  [S] SMACKGYM                                               [  Shimmer Search Bar                                ]    |
+---------------------+---------------------------------------------------------------------+---------------------------+
|  * Home  [Active]   |  YOUR DAILY SNAPSHOT                                                |  YOUR PERFORMANCE PASSPORT|
|  * Search           |  +---------------------------------------------------------------+  |  +---------------------+  |
|  * Discover         |  |  (( O ))     (( O ))     (( O ))     (( O ))     (( O ))      |  |  | [===] Shimmer       |  |
|  * Train            |  |  [ Shimmer ] [ Shimmer ] [ Shimmer ] [ Shimmer ] [ Shimmer ]  |  |  | [===========------] |  |
|  * Progress         |  +---------------------------------------------------------------+  |  +---------------------+  |
|  * Profile          |                                                                     |                           |
|                     |  YOUR NEXT MOVE (Skeleton Placeholder):                             |  THIS WEEK                |
|  -----------------  |  +---------------------------------------------------------------+  |  +---------------------+  |
|  [Personal Mode]    |  | [===============================]     +---------------------+ |  |  | [ o ] [ o ] [ o ] ... |  |
|                     |  | [======================]              |  [ 16:9 Skeleton    | |  |  +---------------------+  |
|                     |  | [==============]                       |    Media Shimmer ]  | |  |                           |
|                     |  |                                       +---------------------+ |  |  ASK SMACK AI             |
|                     |  | [========= Button ]     [========= Button ]                   |  |  +---------------------+  |
|                     |  +---------------------------------------------------------------+  |  | [ Shimmer Box ]     |  |
|                     |                                                                     |  +---------------------+  |
+---------------------+---------------------------------------------------------------------+---------------------------+
```

* **Engineering Rules:**
  * Background: `#F6F7F3` with subtle CSS pulse animation.
  * Preserves exact aspect ratios: 16:9 media box, 48px button heights, preventing layout shift.

---

### 2.2 State 02: Empty State — Progress Ring & Weekly Schedule

```
+-----------------------------------------------------------------------+
|  YOUR DAILY SNAPSHOT (No Scheduled Plan Yet):                         |
|  +-----------------------------------------------------------------+  |
|  |    (( Set a Plan ))         (( 0/1 ))         (( :-) ))         |  |
|  |        Progress               Today           Check-in          |  |
|  |     (Ready to start)      (Next action)     (Log wellbeing)     |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  PRIMARY ACTION CARD (Constructive Coaching):                         |
|  +-----------------------------------------------------------------+  |
|  | READY TO BUILD YOUR FIRST WEEK?                                 |  |
|  | You haven't scheduled workouts for this week yet.                |  |
|  | Answer 3 quick questions about your days and equipment to       |  |
|  | generate a calibrated plan.                                      |  |
|  |                                                                 |  |
|  | [ CHOOSE A STARTER PLAN -> ] (#C7FF00 Button, 48px height)      |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
```

* **Core Rule:** Never render `"0%"` or `"0/0"` when no plan exists. The `Progress` circle visibly displays `"Set a plan"`.

---

### 2.3 State 04: Offline Gym Mode (`react-native-mmkv` Active)

```
+-----------------------------------------------------------------------+
|  [ ! OFFLINE MODE — Sets saved locally to phone. Will sync automatically ]
|  25-MINUTE STRENGTH EXECUTION                 [ Rights Lease: 6 Days ]|
+-----------------------------------------------------------------------+
|                                                                       |
|  EXERCISE: DUMBBELL GOBLET SQUAT                                      |
|  Target: 3 Sets x 10 Reps                                             |
|                                                                       |
|  SET   PREVIOUS       TARGET        KG     REPS   SAVED STATUS        |
|  ---   ------------   -----------   ----   ----   -----------------   |
|  1     16kg x 10      16kg x 10     [16]   [10]   [ [x] SAVED LOCAL ] |
|  2     16kg x 10      16kg x 10     [18]   [10]   [ [x] SAVED LOCAL ] |
|  3     --             18kg x 10     [18]   [10]   [ [ ] PENDING     ] |
|                                                                       |
|  * Local latency: < 50ms write to encrypted MMKV key-value store.     |
|  * Reconnecting to 4G/Wi-Fi triggers POST /v1/session-events/batch    |
+-----------------------------------------------------------------------+
```

* **Durability Guarantee:** Reclosing the app or rebooting the phone does not lose logged sets.

---

### 2.4 State 05: Active Injury Safety Hold Banner

```
+-----------------------------------------------------------------------+
|  [ ! ] SAFETY HOLD ACTIVE: RIGHT KNEE RESTRICTION                     |
|  Lower body compound exercises are paused due to reported knee pain.   |
|  Coaching has been adapted to upper body and core movements.          |
|  [ View Safety Advice ]                     [ Mark Pain Resolved > ]  |
+-----------------------------------------------------------------------+
|                                                                       |
|  ADAPTED NEXT MOVE:                                                   |
|  Seated Dumbbell Overhead Press (Shoulders & Core)                    |
|  "Knee joint load completely removed; focus on seated stability."     |
|                                                                       |
|  [ START SESSION -> ] (#C7FF00)                    [ Why this? ]      |
+-----------------------------------------------------------------------+
```

* **Safety Invariant:** Neither `Ask SMACK AI` nor a deep link can bypass this banner. It requires explicit user resolution.

---

### 2.5 State 06: Revoked Rights / Expired Media Fallback

```
+-----------------------------------------------------------------------+
|  EXERCISE: BARBELL HIP THRUST (EX-0192)                               |
|  +-----------------------------------------------------------------+  |
|  | [ ! ] MEDIA UNAVAILABLE (Licensing Expiry Notice)               |  |
|  | The video demonstration for this movement is currently undergoing|  |
|  | review. Verified textual cues and biomechanical steps below.   |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  VERIFIED TECHNIQUE CUES:                                             |
|  1. Position upper back across bench just below shoulder blades.      |
|  2. Place barbell across hips with protective bar pad.                 |
|  3. Drive through heels to full hip extension; squeeze glutes at top.  |
|                                                                       |
|  [ SWAP FOR APPROVED 3D RIG DEMO ]       [ SUBSTITUTE EXERCISE ]      |
+-----------------------------------------------------------------------+
```

---

### 2.6 State 08: 200% Text Zoom Layout (WCAG 2.2 AA)

```
+-------------------------------------------------------+
|  25-MINUTE STRENGTH                                   |
|                                                       |
|  DUMBBELL BULGARIAN                                   |
|  SPLIT SQUAT                                          |
|                                                       |
|  TARGET:                                              |
|  3 SETS X 10 REPS                                     |
|  LOAD: 14 KG                                          |
|                                                       |
|  +-------------------------------------------------+  |
|  | [ START SESSION -> ]                            |  | (Button expands vertically to 64px)
|  +-------------------------------------------------+  |
|  +-------------------------------------------------+  |
|  | [ Adapt Session ]                               |  | (Stacks cleanly without overlapping)
|  +-------------------------------------------------+  |
|                                                       |
|  WHY THIS?                                            |
|  (Underlined link remains accessible)                 |
+-------------------------------------------------------+
```

* **Responsiveness Guarantee:** Buttons flex-wrap into single columns; font size increases without clipping or horizontal overflow.

---

### 2.7 State 10 (Special): Concurrency Conflict (`409 Stale Revision`)

```
+-----------------------------------------------------------------------+
|  [ ! ] PLAN UPDATE CONFLICT (Stale Revision)                          |
|  This plan was updated from another device (e.g., your iPhone at 10:30|
|  AM). To prevent overwriting your changes, please review the latest   |
|  schedule.                                                            |
|                                                                       |
|  [ REFRESH TO LATEST VERSION ]            [ KEEP LOCAL DRAFT AS COPY ]|
+-----------------------------------------------------------------------+
```
