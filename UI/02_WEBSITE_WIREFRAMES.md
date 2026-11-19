# SMACKGYM — Website Screen-by-Screen Wireframes (`02_WEBSITE_WIREFRAMES.md`)

> **Authority & Governance:** Aligned with **SMACKGYM Developer Handover v5.1 (Approved UX Revision — Daily Home v4)**, `docs/PRD.md`, and `docs/design.md`.

---

## 1. Global Responsive Grid Specifications (Web)

```
========================================================================================================================
BREAKPOINT         VIEWPORT RANGE     GRID TOPOLOGY & CONTAINER CONSTRAINTS
========================================================================================================================
Desktop (xl)       >= 1280px          Approved 3-Zone Layout:
                                      - Left Sidebar: Fixed 240px width
                                      - Center Main Column: minmax(0, 680px), centered
                                      - Right Context Rail: Fixed 320px width
                                      - Page Canvas: #FFFFFF (80–85% coaching canvas), dividers #E4E7DF
Desktop (lg)       1024px – 1279px    2-Zone Layout:
                                      - Left Sidebar: Fixed 220px width
                                      - Center Main Column: 1fr (Right rail collapses to expandable drawer)
Tablet (md)        768px – 1023px     Adaptive Column:
                                      - Left Nav: Collapsible 64px icon rail
                                      - Content: Single fluid column with bottom sticky action bar
Mobile Web (sm)    < 768px            Full Mobile Responsive Shell (mirrors Companion App structure)
========================================================================================================================
```

---

## 2. Unauthenticated & Onboarding Journey Wireframes

### SCR-ATH-01: Public Welcome & Landing Page (Desktop Web)

```
+-----------------------------------------------------------------------------------------------------------------------+
|  [S] SMACKGYM                                               [Features]  [Science]  [Universities]  [Sign In]  [JOIN NOW]  |
+-----------------------------------------------------------------------------------------------------------------------+
|                                                                                                                       |
|   TAGLINE (Anton Uppercase, Near-Black #101212):                                                                     |
|   ALL SPORTS PERFORMANCE TRAINING IN ONE PLACE.                                                                      |
|                                                                                                                       |
|   Subhead (Inter 18px, #596256):                                                                                     |
|   Know what to do next. Personalised, schedule-aware training, recovery intelligence, and reviewed sports science.     |
|                                                                                                                       |
|   [ START YOUR JOURNEY -> ] (Electric Lime #C7FF00, Text #101212, 48px hit target)   [ WATCH 2-MIN DEMO > ]           |
|                                                                                                                       |
|   -----------------------------------------------------------------------------------------------------------------   |
|   HERO MEDIA FRAME (Believable UK University / Athletic Track Photo or 3D Loop):                                      |
|   +---------------------------------------------------------------------------------------------------------------+   |
|   |                                                                                                               |   |
|   |   [ Real-World Athlete Execution / Dynamic Sprint Pose / 3D Graphite Biomechanical Overlay ]                  |   |
|   |                                                                                                               |   |
|   |   Card Overlay (Bottom-Left):                                                                                 |   |
|   |   +-------------------------------------------------------------+                                             |   |
|   |   | (( * )) Next Move: 25-Min Explosive Power                  |                                             |   |
|   |   | Adapted for tomorrow's BUCS University Rugby fixture         |                                             |   |
|   |   +-------------------------------------------------------------+                                             |   |
|   +---------------------------------------------------------------------------------------------------------------+   |
|                                                                                                                       |
|   TRUST & ACCREDITATION BANNER:                                                                                       |
|   PILOTED WITH UK UNIVERSITY ATHLETES  *  100% ATHLETE DATA SOVEREIGNTY  *  WCAG 2.2 AA ACCESSIBLE                   |
|                                                                                                                       |
|   3-PILLAR FOUNDATIONS (White Cards, 1px #E4E7DF border):                                                             |
|   +-----------------------------+ +-----------------------------+ +-----------------------------+                     |
|   | 01. DETERMINISTIC COACHING  | | 02. ATHLETE SOVEREIGNTY     | | 03. REVIEWED SCIENCE        |                     |
|   | Schedule & fixture-aware    | | You own your data. Coaches  | | Plain-English summaries of  |                     |
|   | adaptive loads that adjust  | | only view what you grant via| | PubMed and sports journals. |                     |
|   | when your match moves.      | | ScopedGrants. Revoke anytime| | Zero bro-science hype.      |                     |
|   +-----------------------------+ +-----------------------------+ +-----------------------------+                     |
|                                                                                                                       |
|   FOOTER:                                                                                                             |
|   (c) 2026 SMACKGYM Ltd. Registered in England & Wales. Adults 18+ only.   [Privacy]  [Terms]  [UK GDPR]  [Cookies]  |
+-----------------------------------------------------------------------------------------------------------------------+
```

* **Component Tree:** `PublicHeader` $\rightarrow$ `HeroSection` (`DisplayHeadline`, `CtaGroup`, `HeroMediaStage`) $\rightarrow$ `TrustBanner` $\rightarrow$ `FeaturePillarsGrid` $\rightarrow$ `FooterNav`.
* **Interactive States:**
  * `Default`: High-contrast, clean whitespace.
  * `Hover [JOIN NOW]`: Dark shadow expand, scale 1.02.
  * `Mobile Drawer`: Hamburger icon replaces top links on `< 768px`.

---

### SCR-ATH-02: 18+ Age Gate & Auth Modal (Desktop Modal)

```
+-----------------------------------------------------------------------+
|  [x] Close                                                            |
|                                                                       |
|                          [S] SMACKGYM                                 |
|                      JOIN THE PERFORMANCE ECOSYSTEM                   |
|                                                                       |
|   STEP 1 OF 2: ELIGIBILITY & AUTHENTICATION                           |
|   -----------------------------------------------------------------   |
|                                                                       |
|   [ ! ] AGE VERIFICATION (UK Children's Code & Safety Gate):          |
|   +---------------------------------------------------------------+   |
|   |  [ ] I confirm that I am 18 years of age or older.            |   |
|   |      (SMACKGYM adult coaching is designed for adults 18+).     |   |
|   +---------------------------------------------------------------+   |
|   * Error state if unchecked: "You must be 18+ to access adult coaching"|
|                                                                       |
|   FAST SIGNUP OPTIONS:                                                |
|   [  G  Continue with Google          ] (#FFFFFF, 1px #E4E7DF, 44px)  |
|   [    Continue with Apple           ] (#101212, White Text, 44px)   |
|                                                                       |
|   -- OR WITH EMAIL --                                                 |
|                                                                       |
|   Email Address:                                                      |
|   [ alex.morgan@university.ac.uk                                  ]   |
|                                                                       |
|   Password:                                                           |
|   [ **********                                                [Show] ]|
|   (Minimum 8 characters, 1 number, 1 symbol)                          |
|                                                                       |
|   CONSENT & LEGAL CHOICES:                                            |
|   [x] I agree to the Terms of Service & Privacy Policy [Mandatory]    |
|   [ ] Enable personalised training & recovery insights [Optional]     |
|   [ ] Receive product updates and science articles via email [Optional|
|                                                                       |
|   [ CREATE ACCOUNT & CONTINUE -> ] (Disabled until 18+ & Terms checked|
|   Background: #C7FF00, Text: #101212, Bold, 48px height)              |
|                                                                       |
|   Already have an account? [Sign In]                                  |
+-----------------------------------------------------------------------+
```

* **Interaction & Logic:**
  * Checking `Under 18` or unchecking the box triggers a friendly diversion modal: *"SMACKGYM currently only supports adults 18+. Check out our youth sports development guidelines."*
  * Passwords validated client-side via Zod schema (`packages/shared/src/schemas/auth.ts`).

---

### SCR-ATH-03: Minimal Context Intake & First Recommendation Setup

```
+-----------------------------------------------------------------------------------------------------------------------+
|  [S] SMACKGYM                                                            [ Step 2 of 2: Quick Calibration ]  [Skip >] |
+-----------------------------------------------------------------------------------------------------------------------+
|                                                                                                                       |
|   BUILDING YOUR STARTER PLAN                                                                                          |
|   Help SMACKGYM understand your week. You can edit or delete this anytime in your Passport.                           |
|                                                                                                                       |
|   QUESTION 1: What is your primary athletic goal?                                                                     |
|   +--------------------+  +--------------------+  +--------------------+  +--------------------+                      |
|   | [*] SPORTS POWER   |  | [ ] STRENGTH & HYP |  | [ ] AEROBIC FITNESS|  | [ ] GENERAL HEALTH |                      |
|   | Speed, agility &   |  | Compound strength  |  | Conditioning, runs |  | Consistency, energy|                      |
|   | explosive power    |  | & muscular balance |  | & match stamina    |  | & joint mobility   |                      |
|   +--------------------+  +--------------------+  +--------------------+  +--------------------+                      |
|                                                                                                                       |
|   QUESTION 2: How many days this week can you train?                                                                  |
|   ( ) 2 Days         (*) 3 Days (Recommended)         ( ) 4 Days         ( ) 5+ Days                                  |
|                                                                                                                       |
|   QUESTION 3: What equipment do you have access to today?                                                             |
|   [x] Full Gym (Barbells, Dumbbells, Cables, Racks)                                                                   |
|   [ ] Dumbbells & Bench Only                                                                                          |
|   [ ] Bodyweight & Resistance Bands Only                                                                              |
|                                                                                                                       |
|   QUESTION 4: Any current movement restrictions or pain? (Optional)                                                   |
|   [ None / Clear to train                                         v ]                                                 |
|                                                                                                                       |
|   -----------------------------------------------------------------------------------------------------------------   |
|   [ GENERATE MY FIRST PLAN -> ] (#C7FF00 Button, 48px target)                                                         |
|   Transparent Note: This runs our deterministic Performance Decision Engine. Zero ungrounded AI guesswork.            |
+-----------------------------------------------------------------------------------------------------------------------+
```

---

## 3. Core Signed-In Desktop Experience (`Daily Home v4`)

### SCR-ATH-04: Signed-In Homepage (Approved 3-Zone Desktop Grid)

```
+-----------------------------------------------------------------------------------------------------------------------------------------------+
|  LEFT SIDEBAR (240px) |  CENTER COACHING & FEED COLUMN (minmax(0, 680px))                   |  RIGHT CONTEXT RAIL (320px)                     |
+-----------------------+---------------------------------------------------------------------+-------------------------------------------------+
|  [S] SMACKGYM         |  SEARCH BAR: [ Q Search exercises, articles, coaches... (Ctrl+K) ]  |  YOUR PERFORMANCE PASSPORT                      |
|                       +---------------------------------------------------------------------+  +-------------------------------------------+  |
|  * Home      [Active] |  YOUR DAILY SNAPSHOT                                                |  | [Avatar] Alex Morgan                      |  |
|  * Search             |  +---------------------------------------------------------------+  |  | Varsity Rugby & Strength                  |  |
|  * Discover           |  |  (( 30% ))     (( 1/3 ))    (( :-) ))    (( zZ ))   (( Club ))|  |  | Profile Completion: 3 of 5             |  |
|  * Train              |  |   Progress       Today      Check-in     Recovery   Your Team |  |  | [===========---------] (Lime Arc #C7FF00) |  |
|  * Progress           |  |  (2 of 6 sess) (1 action)  (Log mood)   (Rest day) (BUCS Win) |  |  | Complete Profile >                     |  |
|  * Community          |  +---------------------------------------------------------------+  |  +-------------------------------------------+  |
|  * Messages       (2) |                                                                     |                                                 |
|  * Profile            |  YOUR NEXT MOVE                                                     |  THIS WEEK                                      |
|                       |  +---------------------------------------------------------------+  |  +-------------------------------------------+  |
|  -------------------- |  | YOUR NEXT MOVE                       [SMALL STEPS BIG CHANGE] |  |  | Mon  Tue [WED] Thu  Fri  Sat  Sun        |  |
|  MODE SWITCH:         |  | 25-minute strength                   +----------------------+ |  |  |  *    *   [14]   .    .    .    .         |  |
|  [x] Personal Mode    |  | Dumbbells (optional) * 25 min * All  | [ 16:9 Thumbnail /   | |  |  | (*)  (*)  (Today)                     |  |
|  [ ] Professional Mode|  |                                      |   Looping 3D Demo]   | |  |  | View Full 7-Day Plan >                    |  |
|                       |  | Why this? (explainable inputs)       +----------------------+ |  |  +-------------------------------------------+  |
|  * Settings           |  |                                                               |  |                                                 |
|  * Sign Out           |  | [ START SESSION -> ] (#C7FF00, #101212)    [ Adapt ]          |  |  ASK SMACK AI                                   |
|                       |  +---------------------------------------------------------------+  |  +-------------------------------------------+  |
|                       |                                                                     |  | (( * )) Coach Assistant                      |  |
|                       |  FEED TABS: [ For you ] (Lime Underline)   |   Following            |  | Get training advice or workout tweaks.       |  |
|                       |  -----------------------------------------------------------------  |  | [ Ask a question...                     ]    |  |
|                       |                                                                     |  +-------------------------------------------+  |
|                       |  FEED CARD 1: EXERCISE BREAKDOWN                                    |                                                 |
|                       |  +---------------------------------------------------------------+  |  YOUR UNIVERSITY CLUB                           |
|                       |  | [Avatar] SMACKGYM Coaching [Lime S Badge]    Strength * 4 min |  |  +-------------------------------------------+  |
|                       |  |                                                         [•••] |  |  [ Campus Sports Banner ]                     |  |
|                       |  | OVERLAY HEADLINE: BUILD YOUR FOUNDATION                       |  |  | "Real people. Real progress.                |  |
|                       |  | [ 16:9 High-Contrast Video: Barbell Hip Hinge Execution ]     |  |  |  Train together with Loughborough Rugby."    |  |
|                       |  |                                                               |  |  [ View Team Updates -> ]                    |  |
|                       |  | [Heart 142]  [Comment 18]  [Share]  [Save]                    |  +-------------------------------------------+  |
|                       |  |                                                               |                                                 |
|                       |  | PRIVATE USEFULNESS FEEDBACK:                                  |                                                 |
|                       |  | Was this useful?   [ Yes ]   [ Not for me ]                   |                                                 |
|                       |  | (If Yes: [Clear explanation] [Fits my goal] [Easy to apply])  |                                                 |
|                       |  |                                                               |                                                 |
|                       |  | [ + Add to my plan ] (#F6F7F3 button, 44px hit target)         |                                                 |
|                       |  +---------------------------------------------------------------+  |                                                 |
+-----------------------------------------------------------------------------------------------------------------------------------------------+
```

* **Visual & Spatial Structure:**
  * **Surfaces:** Center area `#FFFFFF`, side panels `#F6F7F3`, borders `#E4E7DF`.
  * **5 Daily Circles:** Progress circle displays actual completion arc (`completed / planned`). Tapping opens modal breakdown. Check-in, Today, Recovery, and Your Team are outlined shortcut rings.
  * **`Your Next Move` Primary Card:** 20px padding, 16px radius, clear visual weight.

---

### SCR-ATH-05: `Why This?` Transparency Modal / Drawer

```
+-----------------------------------------------------------------------+
|  [x] Close                                                            |
|                                                                       |
|  WHY THIS SESSION WAS RECOMMENDED                                     |
|  Transparent Performance Decision Engine Trace                        |
|  -----------------------------------------------------------------   |
|                                                                       |
|  CONFIRMED PASSPORT FACTS USED:                                       |
|  * Goal: Explosive Rugby Power & Agility (Confirmed 12 Oct 2026)      |
|  * Available Equipment: Dumbbells & Bodyweight                        |
|  * Target Session Duration: 25 Minutes                                |
|  * Scheduled Fixture: BUCS Championship Match on Saturday (3 days away|
|                                                                       |
|  DETERMINISTIC RULES APPLIED:                                         |
|  1. RULE-LOAD-04: Match minus 3 days requires sub-maximal intensity   |
|     (RPE <= 7.5) to avoid lingering central nervous system fatigue.   |
|  2. RULE-TIME-02: 25-minute duration limit triggers high-density       |
|     paired supersets with fixed 60-second rest intervals.             |
|  3. RULE-SAFETY-01: Zero active pain flags detected on knee or ankle. |
|                                                                       |
|  DATA CONFIDENCE SCORE:                                               |
|  [ HIGH CONFIDENCE ] (Based on 14 logged sessions over past 28 days)  |
|                                                                       |
|  Need to adjust?                                                      |
|  [ CLOSE & PROCEED ]                  [ ADAPT THIS SESSION -> ]       |
+-----------------------------------------------------------------------+
```

---

### SCR-ATH-06: `Adapt` (Change Today) Before/After Diff Sheet

```
+-------------------------------------------------------------------------------------------------------+
|  [x] Cancel Adaptation                                                                                |
|                                                                                                       |
|  ADAPT TODAY'S WORKOUT ("CHANGE TODAY")                                                               |
|  Tell us what changed. The engine will generate an instant before/after plan revision.                |
|  -------------------------------------------------------------------------------------------------   |
|                                                                                                       |
|  SELECT TODAY'S CONSTRAINT CHIPS:                                                                     |
|  [x] Only 15-20 Mins   [ ] No Gym (Bodyweight)   [x] Low Energy / Poor Sleep   [ ] Sore Shoulders     |
|                                                                                                       |
|  ===================================================================================================  |
|  PLAN PREVIEW DIFF (Generated in 120ms):                                                              |
|                                                                                                       |
|  BEFORE (Original Session)               AFTER (Adapted Revision)                                     |
|  ------------------------------------    ----------------------------------------------------------   |
|  * Duration: 40 Minutes                  * Duration: 20 Minutes (-20 min)                             |
|  * Total Sets: 14 Sets                   * Total Sets: 8 High-Efficiency Sets                         |
|  * Exercises:                            * Exercises:                                                 |
|    1. Barbell Back Squat (4 sets)   -->    1. Goblet Squat (3 sets @ RPE 6.5) [Joint-friendly load]   |
|    2. Romanian Deadlift (4 sets)    -->    2. Dumbbell Single-Leg RDL (3 sets)                         |
|    3. Plyo Box Jumps (3 sets)       -->    [REMOVED: High CNS impact deloaded]                        |
|    4. Core Hanging Knee Raises      -->    3. Pallof Press Isometric Hold (2 sets)                    |
|                                                                                                       |
|  REASON FOR CHANGE:                                                                                   |
|  "Reduced time and poor sleep score triggered deload rule DELOAD-02: Volume reduced by 42% while      |
|   preserving movement pattern integrity."                                                             |
|  ===================================================================================================  |
|                                                                                                       |
|  [ CONFIRM PLAN UPDATE -> ] (Electric Lime #C7FF00, Bold Text #101212)         [ KEEP ORIGINAL PLAN ] |
+-------------------------------------------------------------------------------------------------------+
```

---

## 4. Workout Execution & iFIT-Style Player Wireframes

### SCR-ATH-07: Follow-Along Workout Player (Desktop Split Screen)

```
+-----------------------------------------------------------------------------------------------------------------------+
|  [ < End Session ]       25-MINUTE EXPLOSIVE STRENGTH       [ Offline Cached: 7-Day Lease ]       [ Settings / Sound ]|
+-----------------------------------------------------------+-----------------------------------------------------------+
|  LEFT STAGE: MEDIA & BIOMECHANICAL DEMO (50% Width)       |  RIGHT STAGE: COACHING CUES & SET LOGGING (50% Width)     |
|                                                           |                                                           |
|  +-----------------------------------------------------+  |  EXERCISE 2 OF 4:                                         |
|  | [Adaptive HLS Video / Looping 3D Rig]               |  |  DUMBBELL BULGARIAN SPLIT SQUAT                           |
|  |                                                     |  |  Target: 3 Sets x 10 Reps per leg @ RPE 7                 |
|  |                                                     |  |                                                           |
|  |                                                     |  |  COACHING CUES (Inter 16px):                              |
|  |                                                     |  |  * Elevate rear foot on bench; maintain upright torso.    |
|  |                                                     |  |  * Drive through front heel to engage glute & quad.       |
|  |                                                     |  |  * Inhale down, exhale driving up. Keep knee aligned.     |
|  |                                                     |  |                                                           |
|  | Camera Angle: [Frontal] [(*) Side] [Oblique]         |  |  -------------------------------------------------------  |
|  | Speed: [0.75x] [(*) 1.0x]   Captions: [ON]           |  |  REST TIMER:                                              |
|  +-----------------------------------------------------+  |  +-----------------------------------------------------+  |
|                                                           |  |  00:48  (Auto-starts on set checkmark)               |  |
|  PROGRESS TRACKER:                                        |  |  [ +15s ]       [ SKIP REST > ]                     |  |
|  Exercise: [====--------] 2/4  |  Overall: 45% Completed  |  +-----------------------------------------------------+  |
|                                                           |                                                           |
|  SAFETY & SUBSTITUTION ACTIONS:                           |  NUMERIC SET LOGGING TABLE:                               |
|  +-----------------------------------------------------+  |  SET   PREVIOUS       TARGET        KG     REPS   COMPLETED |
|  | [ SUBSTITUTE EXERCISE ] (Swap equipment/variation)  |  |  ---   ------------   -----------   ----   ----   --------- |
|  |                                                     |  |  1     14kg x 10      14kg x 10     [14]   [10]   [ [x] ]*  |
|  | [ ! SOMETHING HURTS ] (#D92D20 Red Alert Button)    |  |  2     14kg x 10      14kg x 10     [16]   [10]   [ [x] ]*  |
|  | (Immediately pauses session & locks safety hold)    |  |  3     --             16kg x 10     [16]   [10]   [ [  ] ]  |
|  +-----------------------------------------------------+  |                                                           |
|                                                           |  * Completed sets saved to MMKV local queue in < 100ms.   |
|                                                           |  [ + ADD EXTRA SET ]                                      |
+-----------------------------------------------------------+-----------------------------------------------------------+
```

* **Interactive Features:**
  * Clicking set checkmark updates local MMKV queue immediately with client-generated `UUID`.
  * Rest timer starts automatically with subtle haptic/audio chime.
  * Tapping `Something hurts` halts all timers and opens the safety hold modal immediately.

---

### SCR-ATH-09: Injury Safety Hold Sheet (`Something Hurts`)

```
+-------------------------------------------------------------------------------------------------------+
|  [ ! ] SESSION PAUSED — SAFETY & INJURY HOLD                                                          |
|  Your safety is our absolute priority. Training with sharp pain causes setbacks.                      |
|  -------------------------------------------------------------------------------------------------   |
|                                                                                                       |
|  WHAT WERE YOU EXPERIENCING?                                                                          |
|  Pain Location:                                                                                       |
|  [ Right Knee Anterior / Patellar Tendon                           v ]                                |
|                                                                                                       |
|  Onset & Quality:                                                                                     |
|  (*) Sharp / Sudden        ( ) Dull Ache / Fatigue        ( ) Pinching / Joint Click                  |
|                                                                                                       |
|  Pain Severity Rating (1 to 10 Scale):                                                                |
|  [ 1 ]  [ 2 ]  [ 3 ]  [ 4 ]  [ 5 ]  [(*) 6 ]  [ 7 ]  [ 8 ]  [ 9 ]  [ 10 - Severe ]                    |
|                                                                                                       |
|  RED-FLAG TRIAGE CHECK:                                                                               |
|  [ ] Inability to bear weight on the leg                                                              |
|  [ ] Visible rapid swelling or joint deformity                                                        |
|  [ ] Numbness, tingling, or radiating nerve sensation                                                |
|                                                                                                       |
|  ===================================================================================================  |
|  CLINICAL GUIDANCE:                                                                                   |
|  "Because this is a sharp pain rated 6/10 at the knee joint, stop today's lower body exercises.        |
|   We have flagged your Knee Movement Restriction in your Performance Passport. Lower body loading     |
|   will remain on hold until you confirm you are pain-free."                                           |
|                                                                                                       |
|  * If any red flags are checked: Displays NHS 111 UK / University Health Centre escalation guidance.  |
|  ===================================================================================================  |
|                                                                                                       |
|  [ END WORKOUT SAFELY -> ] (Saves completed sets, deloads plan)     [ SUBSTITUTE PAIN-FREE UPPER BODY]|
+-------------------------------------------------------------------------------------------------------+
```

---

## 5. Nutrition, Recovery & Discover Wireframes

### SCR-ATH-11: Manual Food Intelligence Log (Desktop Web)

```
+-----------------------------------------------------------------------------------------------------------------------+
|  [S] SMACKGYM       |  FOOD INTELLIGENCE & RECOVERY FUEL                              Date: [ < Wednesday 14 Oct > ]  |
+---------------------+-------------------------------------------------------------------------------------------------+
|                     |                                                                                                 |
|  * Home             |  DAILY NUTRITION ESTIMATES (Estimates Only — Unknowns Remain Unknown):                          |
|  * Search           |  +--------------------+  +--------------------+  +--------------------+  +--------------------+ |
|  * Discover         |  | CALORIES           |  | PROTEIN            |  | CARBS              |  | FAT                | |
|  * Train            |  | 2,140 kcal         |  | 142g               |  | 220g               |  | 64g                | |
|  * Fuel & Food [Act]|  | (Target: ~2,300)   |  | (Target: ~150g)    |  | (Target: ~250g)    |  | (Target: ~70g)     | |
|  * Progress         |  +--------------------+  +--------------------+  +--------------------+  +--------------------+ |
|  * Profile          |  * Note: We never show "0g" for unmeasured nutrients. Unlisted micronutrients display "Unknown".|
|                     |                                                                                                 |
|  ------------------ |  LOGGED MEALS TODAY:                                                                            |
|  [Personal Mode]    |  +-------------------------------------------------------------------------------------------+  |
|                     |  | MEAL 1: BREAKFAST (08:30)                                           480 kcal | 32g Protein|  |
|                     |  | * 3 Large Eggs (Poached) — 210 kcal, 18g P, 1g C, 15g F                                   |  |
|                     |  | * 2 Slices Sourdough Bread — 190 kcal, 8g P, 38g C, 2g F                                   |  |
|                     |  | * 1 Medium Banana — 80 kcal, 1g P, 20g C, 0g F                                            |  |
|                     |  | [ Edit Meal ]  [ Delete ]                                                                 |  |
|                     |  +-------------------------------------------------------------------------------------------+  |
|                     |  | MEAL 2: POST-TRAINING LUNCH (13:15)                                 650 kcal | 48g Protein|  |
|                     |  | * Grilled Chicken Breast (180g) — 300 kcal, 42g P, 0g C, 6g F                             |  |
|                     |  | * White Basmati Rice (200g cooked) — 260 kcal, 5g P, 58g C, 1g F                          |  |
|                     |  | * Steamed Broccoli & Olive Oil (10g) — 90 kcal, 1g P, 4g C, 10g F                         |  |
|                     |  | [ Edit Meal ]  [ Delete ]                                                                 |  |
|                     |  +-------------------------------------------------------------------------------------------+  |
|                     |                                                                                                 |
|                     |  [ + LOG A NEW MEAL OR SNACK ] (Opens modal: Ingredient search, custom grams, unit selection)   |
|                     |                                                                                                 |
|                     |  DIETARY CONTEXT FILTERS (From Passport):                                                       |
|                     |  [x] Halal Friendly    [ ] Vegetarian    [ ] Dairy-Free    [ ] Ramadan Fasting Window (P2)      |
+---------------------+-------------------------------------------------------------------------------------------------+
```

---

### SCR-ATH-13: Discover Feed & Reviewed Research Library (Desktop Web)

```
+-----------------------------------------------------------------------------------------------------------------------+
|  [S] SMACKGYM       |  DISCOVER & REVIEWED SCIENCE                                   [ Filter by Tag / Sport v ]      |
+---------------------+-------------------------------------------------------------------------------------------------+
|                     |  UNIVERSAL SEARCH:                                                                              |
|  * Home             |  [ Q Search PubMed studies, exercises, technique breakdowns...                     (Ctrl+K) ]   |
|  * Discover  [Act]  |                                                                                                 |
|  * Train            |  CATEGORY TABS: [ All ]  [ (*) Sports Science ]  [ Biomechanics ]  [ Recovery ]  [ Nutrition ]  |
|  * Progress         |  ---------------------------------------------------------------------------------------------  |
|  * Community        |                                                                                                 |
|  * Profile          |  FEATURED RESEARCH SUMMARY CARD (Peer-Reviewed Paper):                                          |
|                     |  +-------------------------------------------------------------------------------------------+  |
|  ------------------ |  | TAG: SPORTS SCIENCE (PubMed PMID: 38291024)                    Reviewed: 15 Sep 2026       |  |
|  [Personal Mode]    |  | PAPER TITLE:                                                                              |  |
|                     |  | OPTIMAL REST PERIODS FOR EXPLOSIVE POWER IN COLLEGIATE CONTACT-SPORT ATHLETES             |  |
|                     |  | Lead Author: Dr. E. Davies (Loughborough Univ) | Reviewer: SMACKGYM Clinical Board         |  |
|                     |  |                                                                                           |  |
|                     |  | PLAIN-ENGLISH SUMMARY:                                                                    |  |
|                     |  | Resting 2.5 to 3 minutes between maximal effort clean-and-jerks preserved sprint speed   |  |
|                     |  | and velocity significantly better than 60-second rest intervals in 48 university athletes. |  |
|                     |  |                                                                                           |  |
|                     |  | EVIDENCE LIMITATIONS:                                                                     |  |
|                     |  | * Study conducted exclusively with male collegiate rugby players aged 18–22.              |  |
|                     |  | * Results may vary for endurance-focused training or female athletes.                     |  |
|                     |  |                                                                                           |  |
|                     |  | [ Read Original PubMed Paper -> ] (External DOI Link)     [ + Apply Rule to My Plan ]      |  |
|                     |  +-------------------------------------------------------------------------------------------+  |
|                     |                                                                                                 |
|                     |  SUBSTACK / COACHING BREAKDOWN CARD:                                                            |
|                     |  +-------------------------------------------------------------------------------------------+  |
|                     |  | TAG: SUBSTACK ARTICLE (Coach Maya Torres — UK Athletics Level 3)                          |  |
|                     |  | WHY SQUAT DEPTH MATTERS MORE THAN SQUAT WEIGHT FOR FIELD VELOCITY                         |  |
|                     |  | 4 min read * 18 Comments * 240 Saves                                                      |  |
|                     |  | [ Read Article ]                                                                          |  |
|                     |  +-------------------------------------------------------------------------------------------+  |
+---------------------+-------------------------------------------------------------------------------------------------+
```

---

## 6. Progress Intelligence & Passport Memory Wireframes

### SCR-ATH-15: Performance Passport & Memory Management (`What SMACK Knows`)

```
+-----------------------------------------------------------------------------------------------------------------------+
|  [S] SMACKGYM       |  PERFORMANCE PASSPORT & MEMORY CONTROLS                        [ Download Data ]  [ Delete All ]|
+---------------------+-------------------------------------------------------------------------------------------------+
|                     |  WHAT SMACKGYM KNOWS ABOUT YOU                                                                  |
|  * Home             |  Every fact below directly shapes your training recommendations. You can edit, snooze, or       |
|  * Discover         |  permanently delete any item. Deletion immediately recalculates your coaching twin.             |
|  * Train            |  ---------------------------------------------------------------------------------------------  |
|  * Progress         |                                                                                                 |
|  * Profile   [Act]  |  ACTIVE PERFORMANCE FACTS:                                                                      |
|  * Settings         |  +-------------------------------------------------------------------------------------------+  |
|                     |  | FACT: Primary Goal = "Explosive Rugby Power"                                              |  |
|  ------------------ |  | Source: Confirmed during onboarding on 12 Oct 2026. Status: Active.                        |  |
|  [Personal Mode]    |  | [ Edit Goal ]   [ Snooze 30 Days ]   [ Delete Fact ]                                       |  |
|                     |  +-------------------------------------------------------------------------------------------+  |
|                     |  | FACT: Equipment = "Dumbbells + Barbells + Bench"                                          |  |
|                     |  | Source: Self-reported gym inventory. Status: Active.                                      |  |
|                     |  | [ Edit Equipment ]   [ Delete Fact ]                                                       |  |
|                     |  +-------------------------------------------------------------------------------------------+  |
|                     |  | FACT: Movement Restriction = "Right Knee Patellar Tendon Pain"                             |  |
|                     |  | Source: Triggered via 'Something Hurts' hold on 14 Oct 2026. Status: Active Safety Hold.   |  |
|                     |  | [ View Safety Notes ]   [ Mark Pain Resolved ]                                            |  |
|                     |  +-------------------------------------------------------------------------------------------+  |
|                     |                                                                                                 |
|                     |  ISOLATED SENSITIVE CONTEXT (Never shared with coaches or general analytics):                   |
|                     |  * Halal Food Preference: [Active]                                                              |
|                     |  * Cycle / Symptom Tracking: [Not Enrolled / Optional]                                          |
|                     |  * Faith / Ramadan Fasting Mode: [Off]                                                          |
|                     |                                                                                                 |
|                     |  DATA SOVEREIGNTY ACTIONS (UK GDPR Art 15 & 17):                                                |
|                     |  [ EXPORT MY FULL PERFORMANCE PASSPORT (JSON / CSV) ]    [ REQUEST PERMANENT ERASURE ]          |
+---------------------+-------------------------------------------------------------------------------------------------+
```

---

## 7. Professional Mode & Admin Command Centre Wireframes

### SCR-PRO-01: Coach Workspace Dashboard (Desktop Web)

```
+-----------------------------------------------------------------------------------------------------------------------+
|  [S] SMACKGYM COACH  |  WORKSPACE: LOUGHBOROUGH ATHLETIC PERFORMANCE                   [ Coach Maya Torres (L3) ]     |
+----------------------+------------------------------------------------------------------------------------------------+
|                      |  OVERVIEW METRICS:                                                                             |
|  * Overview   [Act]  |  +--------------------+  +--------------------+  +--------------------+  +--------------------+|
|  * Athletes   (14)   |  | ACTIVE CLIENTS     |  | PENDING PROPOSALS  |  | AVG ADHERENCE      |  | SAFETY HOLDS       ||
|  * Programmes (6)    |  | 14 Athletes        |  | 3 Awaiting Review  |  | 88.4% This Week    |  | 1 Active (Knee)    ||
|  * Content Studio    |  +--------------------+  +--------------------+  +--------------------+  +--------------------+|
|  * Workspace Grants  |                                                                                                |
|                      |  CLIENT ROSTER & SCOPED GRANT STATUS:                                                          |
|  ------------------- |  +-------------------------------------------------------------------------------------------+ |
|  MODE SWITCH:        |  | ATHLETE         SPORT / GOAL      SCOPED GRANT PERMISSIONS         EXPIRY       ACTIONS       | |
|  [ ] Personal Mode   |  | --------------- ----------------- -------------------------------- ------------ ----------- | |
|  [x] Professional    |  | Alex Morgan     Varsity Rugby     [Training Logs] [Recovery]       In 45 Days   [View Profile]| |
|                      |  | Marcus Bell     Sprint 100m       [Training Logs]                  In 12 Days   [View Profile]| |
|  * Settings          |  | Sarah Chen      Rowing            [Training Logs] [Food] [Recovery]In 80 Days   [View Profile]| |
|                      |  +-------------------------------------------------------------------------------------------+ |
|                      |  * Note: Sensitive domains (Religion, Cycle, Pregnancy, Raw AI Chat) are strictly firewalled.  |
|                      |                                                                                                |
|                      |  [ + INVITE NEW ATHLETE ] (Generates ScopedGrant invite link with category consent request)    |
+----------------------+------------------------------------------------------------------------------------------------+
```

---

### SCR-ADM-02: Admin Command Centre — Operations & Safety Kill Switches

```
+-----------------------------------------------------------------------------------------------------------------------+
|  [S] SMACKGYM ADMIN  |  COMMAND CENTRE: OPERATIONS & SAFETY KILL SWITCHES              [ Role: Super Admin ]          |
+----------------------+------------------------------------------------------------------------------------------------+
|                      |  [ ! ] SAFETY KILL SWITCHES (Affects All Live APIs, HLS Playback & Mobile Apps Instantly):      |
|  * System Health     |  ---------------------------------------------------------------------------------------------  |
|  * Kill Switches[Act]|                                                                                                |
|  * Content & Rights  |  1. SMACK AI CONVERSATIONAL ENDPOINT (/v1/smack):                                              |
|  * Safety Review     |     Status: [ ONLINE / NORMAL ]                                                                |
|  * Moderation Queue  |     Action: [ TRIGGER KILL SWITCH: DISABLE AI CHAT ]                                           |
|  * Billing Ops       |     (Instantly falls back to 100% deterministic rule explanations across mobile & web)         |
|  * System Audit      |                                                                                                |
|                      |  2. EXERCISE KILL SWITCH (BY CANONICAL ID):                                                    |
|  ------------------- |     Enter Exercise ID: [ EX-0482 (Barbell Jefferson Squat) ]                                  |
|  Staff MFA: Verified |     Reason: [ Biomechanical safety review flag - risk of spinal shear               ]        |
|  Session TTL: 42 min |     Action: [ REVOKE PLAYBACK TOKENS & HIDE FROM SEARCH ]                                      |
|                      |                                                                                                |
|                      |  3. REGIONAL / LOCALE KILL SWITCH:                                                             |
|                      |     Locale: [ ur (Urdu RTL) v ]   Status: [ IN STAGING REVIEW ]                                |
|                      |     Action: [ SUSPEND LOCALE (Fallback to en-GB) ]                                             |
|                      |                                                                                                |
|                      |  =============================================================================================  |
|                      |  RECENT IMMUTABLE AUDIT LOG EVENTS:                                                            |
|                      |  * 2026-10-14 09:12:04 | Actor: admin.dave | Action: KILL_SWITCH_EXERCISE (EX-0192) | Reason: #T-402 |
|                      |  * 2026-10-13 14:45:10 | Actor: admin.sarah| Action: LOCALE_ACTIVATED (hi)         | Reason: #QA-88 |
|                      |  =============================================================================================  |
+----------------------+------------------------------------------------------------------------------------------------+
```
