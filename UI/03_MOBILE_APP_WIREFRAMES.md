# SMACKGYM — Companion Mobile App Screen-by-Screen Wireframes (`03_MOBILE_APP_WIREFRAMES.md`)

> **Authority & Governance:** Aligned with **SMACKGYM Developer Handover v5.1 (Approved UX Revision — Daily Home v4)**, `docs/PRD.md`, and `docs/design.md`. Built for **React Native (Expo SDK 58) + NativeWind v4 (Android & iOS)**.

---

## 1. Mobile Shell & Viewport Architecture

```
========================================================================================================================
SPECIFICATION              VALUE / BEHAVIOUR
========================================================================================================================
Target Platforms           Apple iOS 17+ (iPhone) & Android 14+ (AOSP / Material 3)
Primary Viewport Base      390 x 844 pt (iPhone 14/15/16) and 412 x 915 dp (Google Pixel 8/9)
Touch Target Size          Strictly >= 44 x 44 pt (WCAG 2.2 AA target size) with >= 8pt margins
Layout Surface Ratio       80–85% Pure White (#FFFFFF) & Warm Off-White (#F6F7F3) on signed-in coaching views
Primary Brand Accent       Electric Lime (#C7FF00) paired with Near-Black (#101212) text
Typography Base            Anton (Condensed Uppercase Display) & Inter (16px Baseline Body/UI)
Navigation Topology        Expo Router (File-based):
                           - app/(auth)/: Onboarding, 18+ gate, OAuth
                           - app/(tabs)/: Home, Train, Discover, Progress, Profile
                           - app/workout/active: Fullscreen follow-along player with gesture controls
                           - app/modals/: Adapt diff sheet, Why this?, Something hurts safety modal
========================================================================================================================
```

---

## 2. Mobile Authentication & Onboarding Screens

### MOB-01: Welcome, 18+ Verification & Fast Auth (Mobile Stack)

```
+--------------------------------------------------+
|  10:42 AM                        [5G] [Battery]  |
|                                                  |
|                   [S] SMACKGYM                   |
|                                                  |
|   ALL SPORTS PERFORMANCE                         |
|   TRAINING IN ONE PLACE.                         |
|                                                  |
|   Know what to do next. Personalised,            |
|   fixture-aware athletic coaching.               |
|                                                  |
|   +------------------------------------------+   |
|   | [ 16:9 Dynamic Video / Athlete Hero Loop] |   |
|   +------------------------------------------+   |
|                                                  |
|   [ ! ] AGE ELIGIBILITY (UK Children's Code):    |
|   +------------------------------------------+   |
|   | [*] I confirm I am 18 years or older.    |   |
|   +------------------------------------------+   |
|                                                  |
|   FAST SIGN IN:                                  |
|   +------------------------------------------+   |
|   |    Continue with Apple                  |   |  (#101212, White Text, 48pt)
|   +------------------------------------------+   |
|   +------------------------------------------+   |
|   |  G  Continue with Google                 |   |  (#FFFFFF, 1px #E4E7DF, 48pt)
|   +------------------------------------------+   |
|                                                  |
|   [ Sign In with Email ]                         |
|                                                  |
|   By continuing, you agree to our Terms of       |
|   Service and Privacy Policy.                    |
+--------------------------------------------------+
```

---

### MOB-02: 3-Step Calibration Intake (Swipeable Card Stack)

```
+--------------------------------------------------+
|  10:42 AM           [ Progress: 2/3 ]    [Skip]  |
|                                                  |
|   STEP 2: TRAINING DAYS & TIME                   |
|   How many days can you commit to this week?     |
|                                                  |
|   +------------------------------------------+   |
|   | ( ) 2 Sessions / Week                    |   |
|   |     Focus: Full body recovery & maintenance |
|   +------------------------------------------+   |
|   +------------------------------------------+   |
|   | (*) 3 Sessions / Week (Recommended)      |   |  (Selected: #C7FF00 border)
|   |     Focus: High power, agility & strength|   |
|   +------------------------------------------+   |
|   +------------------------------------------+   |
|   | ( ) 4 Sessions / Week                    |   |
|   +------------------------------------------+   |
|   +------------------------------------------+   |
|   | ( ) 5+ Sessions / Week                   |   |
|   +------------------------------------------+   |
|                                                  |
|   AVERAGE TIME AVAILABLE PER SESSION:            |
|   [ 20 Mins ]    [(*) 30-45 Mins]    [ 60+ Mins ]|
|                                                  |
|   +------------------------------------------+   |
|   | [ CONTINUE TO EQUIPMENT -> ] (#C7FF00)   |   |
|   +------------------------------------------+   |
+--------------------------------------------------+
```

---

## 3. Approved Mobile Homepage (`Daily Home v4`)

### MOB-03: Signed-In Home Screen (Primary Mobile Dashboard)

```
+--------------------------------------------------+
|  10:42 AM                        [5G] [Battery]  |
|  [S] SMACKGYM                 [Chat (2)]  [Bell*]|
|  FEED TABS: [ For you ] (Lime Line)  Following   |
+--------------------------------------------------+
|  SCROLLABLE CONTENT CONTAINER:                   |
|                                                  |
|  YOUR DAILY SNAPSHOT (Horizontal Carousel):      |
|  +----------------------------------------------+|
|  |  (( 30% ))   (( 1/3 ))  (( :-) ))  (( zZ ))  ||
|  |   Progress    Today     Check-in   Recovery  ||
|  |  (2 of 6)    (Action)   (Mood)     (Rest)    ||
|  +----------------------------------------------+|
|                                                  |
|  YOUR NEXT MOVE (Primary Action Card):           |
|  +------------------------------------------+   |
|  | YOUR NEXT MOVE    [SMALL STEPS BIG CHANGE]|   |
|  | 25-minute strength                        |   |
|  | Dumbbells (optional) * 25 min * All levels|   |
|  |                                           |   |
|  | [ Why this? ] (Transparent rule trace)    |   |
|  |                                           |   |
|  | +--------------------------------------+  |   |
|  | | [ START SESSION -> ] (#C7FF00 CTA)   |  |   | (48pt height, Bold Near-Black text)
|  | +--------------------------------------+  |   |
|  | +--------------------------------------+  |   |
|  | | [ Adapt ] (Change time/equipment)    |  |   | (#FFFFFF, 1px #E4E7DF, 44pt)
|  | +--------------------------------------+  |   |
|  +------------------------------------------+   |
|                                                  |
|  THIS WEEK CALENDAR STRIP:                       |
|  +------------------------------------------+   |
|  |  Mon   Tue  [WED]  Thu   Fri   Sat   Sun |   |
|  |   *     *   [14]    .     .     .     .  |   |
|  |  (*)   (*)  (Today)                      |   | (Wed 14 filled in solid #C7FF00 pill)
|  +------------------------------------------+   |
|                                                  |
|  ASK SMACK AI BAR:                               |
|  +------------------------------------------+   |
|  | (( * )) Ask SMACK for training advice... >|   | (#F6F7F3 pill, sparkle orb)
|  +------------------------------------------+   |
|                                                  |
|  COACHING & COMMUNITY FEED:                      |
|  +------------------------------------------+   |
|  | [Avatar] SMACKGYM Coaching     Strength   |   |
|  |                                     [•••] |   |
|  | OVERLAY: BUILD YOUR FOUNDATION            |   |
|  | +--------------------------------------+  |   |
|  | | [ 4:5 High-Contrast Vertical Video:  |  |   |
|  | |   Barbell Hip Hinge Execution ]      |  |   |
|  | +--------------------------------------+  |   |
|  | [Heart 142]  [Comment 18]  [Share]  [Save]|   |
|  |                                           |   |
|  | Was this useful?   [ Yes ]   [ Not for me]|   |
|  |                                           |   |
|  | +--------------------------------------+  |   |
|  | | [ + Add to my plan ] (#F6F7F3)        |  |   |
|  | +--------------------------------------+  |   |
|  +------------------------------------------+   |
+--------------------------------------------------+
|  FIXED BOTTOM TAB BAR (Expo Router Tabs):        |
|  [Home]     [Train]   [Discover]  [Progress] [Profile]|
|   (*)        ( )         ( )         ( )       ( )|
+--------------------------------------------------+
```

---

### MOB-04: `Adapt` (Change Today) Mobile Bottom Sheet

```
+--------------------------------------------------+
|  === (Drag Handle) ============================  |
|  CHANGE TODAY'S PLAN                             |
|  Select constraints to recalculate your workout: |
|                                                  |
|  QUICK CHIPS (Touch to toggle):                  |
|  [ [x] Only 15-20 Mins ]  [ [ ] Bodyweight Only ]|
|  [ [x] Low Energy ]       [ [ ] Sore Knees ]     |
|                                                  |
|  BEFORE VS. AFTER DIFF:                          |
|  +------------------------------------------+    |
|  | ORIGINAL: 40 Mins * 14 Sets * Barbell    |    |
|  | ADAPTED:  20 Mins * 8 Sets * Dumbbells   |    |
|  |                                          |    |
|  | Key Changes:                             |    |
|  | * Back Squat replaced with Goblet Squat  |    |
|  | * Removed Box Jumps to deload joints     |    |
|  | * Paired core holds with minimal rest    |    |
|  +------------------------------------------+    |
|                                                  |
|  +------------------------------------------+    |
|  | [ CONFIRM PLAN UPDATE -> ] (#C7FF00)     |    | (48pt height, #101212 text)
|  +------------------------------------------+    |
|  +------------------------------------------+    |
|  | [ Keep Original Plan ]                   |    |
|  +------------------------------------------+    |
+--------------------------------------------------+
```

---

## 4. Mobile Workout Execution & Offline Gym Mode

### MOB-05: Follow-Along Workout Player (`/workout/active`)

```
+--------------------------------------------------+
|  10:45 AM                                        |
|  [ < Pause ]     25-MIN STRENGTH     [Sound/Cam] |
|  [ Offline Cached: 7-Day Rights Lease Active ]   |
+--------------------------------------------------+
|  TOP MEDIA STAGE (45% Viewport Height):          |
|  +------------------------------------------+   |
|  | [ Adaptive HLS Video / Looping 3D Rig ]   |   |
|  |                                          |   |
|  | Angle: [Front] [(*) Side] [3D Free Orbit]|   |
|  +------------------------------------------+   |
|                                                  |
|  CURRENT EXERCISE:                               |
|  DUMBBELL BULGARIAN SPLIT SQUAT                  |
|  Target: 3 Sets x 10 Reps per leg @ RPE 7        |
|  "Drive through front heel; keep torso tall."    |
|                                                  |
|  REST TIMER STRIP (Persists in Background):      |
|  +------------------------------------------+   |
|  |  REST: 00:45   [ +15s ]   [ SKIP REST > ]|   | (Auto-starts on set checkmark)
|  +------------------------------------------+   |
|                                                  |
|  SET LOGGING TABLE (Stored directly to MMKV):    |
|  SET   PREV       TARGET     KG     REPS   DONE  |
|  ---   --------   --------   ----   ----   ----  |
|  1     14kg x 10  14kg x 10  [14]   [10]   [x]*  |
|  2     14kg x 10  16kg x 10  [16]   [10]   [x]*  |
|  3     --         16kg x 10  [16]   [10]   [  ]  |
|                                                  |
|  * Each check writes to MMKV in < 100ms.         |
|                                                  |
|  STICKY BOTTOM ACTIONS:                          |
|  +------------------------------------------+   |
|  | [ SUBSTITUTE EXERCISE ]                  |   |
|  +------------------------------------------+   |
|  +------------------------------------------+   |
|  | [ ! SOMETHING HURTS ] (#D92D20 Red Alert)|   |
|  +------------------------------------------+   |
+--------------------------------------------------+
```

---

### MOB-07: Injury Safety Hold Sheet (`Something Hurts`)

```
+--------------------------------------------------+
|  === (Drag Handle) ============================  |
|  [ ! ] SESSION PAUSED — SAFETY INJURY HOLD       |
|  Stop training immediately if you feel pain.     |
|                                                  |
|  WHERE DOES IT HURT?                             |
|  [ Right Knee (Patellar)                     v ] |
|                                                  |
|  PAIN TYPE:                                      |
|  (*) Sharp / Sudden        ( ) Dull Muscle Ache  |
|                                                  |
|  PAIN SEVERITY (1–10):                           |
|  [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [(*) 6 ] [ 7 ]... |
|                                                  |
|  RED FLAGS:                                      |
|  [ ] Joint locking or unable to bear weight      |
|  [ ] Visible rapid swelling                      |
|                                                  |
|  CLINICAL ADVICE:                                |
|  "Sharp 6/10 knee pain detected. We have paused  |
|   lower body exercises and added a temporary     |
|   hold to your Performance Passport."            |
|                                                  |
|  +------------------------------------------+    |
|  | [ END SESSION SAFELY -> ] (#D92D20 Red)  |    |
|  +------------------------------------------+    |
|  +------------------------------------------+    |
|  | [ Switch to Upper Body (Pain-Free) ]      |    |
|  +------------------------------------------+    |
+--------------------------------------------------+
```

---

## 5. Nutrition, Recovery & Discover Mobile Screens

### MOB-09: Mobile Food Intelligence Log (Fuel)

```
+--------------------------------------------------+
|  10:45 AM                        [5G] [Battery]  |
|  FOOD INTELLIGENCE & FUEL       [ < Today, 14 > ]|
+--------------------------------------------------+
|  MACRO SUMMARY (Estimates Only):                 |
|  +------------------------------------------+   |
|  | 2,140 kcal  |  142g Pro  | 220g Carb |64g Fat|   |
|  +------------------------------------------+   |
|  * Missing nutrients remain "Unknown", never 0.  |
|                                                  |
|  LOGGED MEALS:                                   |
|  +------------------------------------------+   |
|  | BREAKFAST (08:30)       480 kcal | 32g P |   |
|  | * 3 Poached Eggs                              |   |
|  | * 2 Slices Sourdough                          |   |
|  | * 1 Medium Banana                             |   |
|  | [ Edit ]                          [ Delete ]  |   |
|  +------------------------------------------+   |
|  +------------------------------------------+   |
|  | LUNCH (13:15)           650 kcal | 48g P |   |
|  | * Grilled Chicken (180g)                      |   |
|  | * Basmati Rice (200g)                         |   |
|  | [ Edit ]                          [ Delete ]  |   |
|  +------------------------------------------+   |
|                                                  |
|  +------------------------------------------+   |
|  | [ + LOG A MEAL OR INGREDIENT ] (#C7FF00) |   |
|  +------------------------------------------+   |
+--------------------------------------------------+
|  [Home]     [Train]   [Discover]  [Progress] [Profile]|
|   ( )        (*)         ( )         ( )       ( )|
+--------------------------------------------------+
```

---

### MOB-11: Mobile Discover & Fullscreen Vertical Video

```
+--------------------------------------------------+
|  10:45 AM                                        |
|  DISCOVER & LEARN              [ Q Search ]      |
|  TABS: [ All ]  [ Biomechanics ]  [ Science ]    |
+--------------------------------------------------+
|  FULLSCREEN VERTICAL CARD (TikTok/Reels Style):  |
|  +------------------------------------------+   |
|  | [ 4:5 Looping Technique Demo / HLS ]     |   |
|  |                                          |   |
|  | Floating Overlay Right:                  |   |
|  | (( Heart 320 ))                          |   |
|  | (( Comment 24 ))                         |   |
|  | (( Bookmark ))                           |   |
|  | (( Share ))                              |   |
|  |                                          |   |
|  | Bottom Coaching Caption:                 |   |
|  | Coach Maya Torres [Verified L3]          |   |
|  | "Barbell Deadlift: Pin lats back before  |   |
|  |  breaking the floor to protect spine."   |   |
|  |                                          |   |
|  | Was this useful?   [ Yes ]   [ Not for me]|   |
|  |                                          |   |
|  | +--------------------------------------+  |   |
|  | | [ + ADD TO MY PLAN ] (#C7FF00 Button) |  |   |
|  | +--------------------------------------+  |   |
|  +------------------------------------------+   |
+--------------------------------------------------+
|  [Home]     [Train]   [Discover]  [Progress] [Profile]|
|   ( )        ( )         (*)         ( )       ( )|
+--------------------------------------------------+
```

---

## 6. Progress Intelligence, Passport & Share Cards

### MOB-13: Mobile Progress & Personal Bests (PBs)

```
+--------------------------------------------------+
|  10:45 AM                                        |
|  YOUR PROGRESS INTELLIGENCE                      |
+--------------------------------------------------+
|  WEEKLY ADHERENCE ARC:                           |
|  +------------------------------------------+   |
|  |             ((  85%  ))                  |   | (Circular Lime Arc: 5 of 6 Sessions)
|  |      TRUE ADHERENCE (NO GUILT)           |   |
|  |  Planned rest days do not break streak.  |   |
|  +------------------------------------------+   |
|                                                  |
|  SAFE STREAKS:                                   |
|  CURRENT STREAK: 14 WEEKS CONSISTENT             |
|  [ M ] [ T ] [ W ] [ T ] [ F ] [ S ] [ S ]       |
|  (*)   (*)   (*)   (R)   (*)   (M)   (R)         |
|  * (R) = Planned Rest Day (Preserves Streak)     |
|                                                  |
|  PERSONAL BESTS (PBs):                           |
|  +------------------------------------------+   |
|  | TRAP BAR DEADLIFT: 160 kg (+5kg on Tue)  |   |
|  | CHIN-UP: Bodyweight + 20kg x 5 reps      |   |
|  | 10m SPRINT SPLIT: 1.62 seconds           |   |
|  +------------------------------------------+   |
|                                                  |
|  +------------------------------------------+   |
|  | [ CREATE PRIVACY-SAFE SHARE CARD -> ]    |   |
|  +------------------------------------------+   |
+--------------------------------------------------+
|  [Home]     [Train]   [Discover]  [Progress] [Profile]|
|   ( )        ( )         ( )         (*)       ( )|
+--------------------------------------------------+
```

---

### MOB-14: Privacy-Safe Share Card Generator (Native Share Sheet)

```
+--------------------------------------------------+
|  === (Drag Handle) ============================  |
|  SHARE YOUR PROGRESS                             |
|  Generate a milestone card to share with friends.|
|                                                  |
|  CARD PREVIEW (Sanitised for Privacy):           |
|  +------------------------------------------+    |
|  |  SMACKGYM   *   PERSONAL PERFORMANCE     |    |
|  |                                          |    |
|  |  14 WEEKS CONSISTENT TRAINING            |    |
|  |  NEW PB: TRAP BAR DEADLIFT               |    |
|  |  160 KG  (3RM)                           |    |
|  |                                          |    |
|  |  Loughborough University Rugby Club      |    |
|  +------------------------------------------+    |
|                                                  |
|  AUTOMATIC PRIVACY STRIPPING:                    |
|  [x] Stripped exact bodyweight                   |
|  [x] Stripped health & injury notes              |
|  [x] Stripped age and precise geolocation        |
|                                                  |
|  +------------------------------------------+    |
|  | [ SHARE VIA NATIVE SHARE SHEET -> ]      |    | (Triggers iOS / Android share sheet)
|  +------------------------------------------+    |
|  +------------------------------------------+    |
|  | [ Copy Revocable Web Link ]              |    |
|  +------------------------------------------+    |
+--------------------------------------------------+
```
