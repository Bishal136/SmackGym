# SMACKGYM — Complete User Flows & Role Architecture (`01_USER_FLOWS_AND_ROLES.md`)

> **Authority:** Derived from `docs/PRD.md` (v5.1), `docs/design.md`, and **SMACKGYM Developer Handover v5.1** (Chapters 04, 05, 06, 08, 10, 13, 25, 34).

---

## 1. System Role Hierarchy & Permissions Matrix

SMACKGYM operates under a **"One Account, Two Modes"** architecture. Users authenticate once and switch modes based on verified entitlements and permissions.

```
+---------------------------------------------------------------------------------------------------------------+
|                                            SMACKGYM IDENTITY SYSTEM                                           |
|                                         (Unified 18+ Account Identity)                                        |
+-------------------------------------------------------+-------------------------------------------------------+
                                                        |
                            +---------------------------+---------------------------+
                            |                                                       |
                            v                                                       v
            +-------------------------------+                       +-------------------------------+
            |         PERSONAL MODE         |                       |       PROFESSIONAL MODE       |
            |   (100% Athlete Data Ownership)   |                       |    (Verified Coach / Mentor)   |
            +---------------+---------------+                       +---------------+---------------+
                            |                                                       |
                            |                                                       | ScopedGrant
                            +-------------------< Grant ACL >-----------------------+ (Athlete-Approved,
                            |                 (Time-Bound Access)                     Category-Restricted)
                            v
            +-------------------------------+
            |      PERFORMANCE PASSPORT     |
            | - Training Logs               |
            | - Food & Macro Logs           |
            | - Recovery Wellbeing Scores   |
            | [FIREWALL: Religion/Cycle/    |
            |  Pregnancy/Raw AI Chat BLOCKED|
            +-------------------------------+
```

### 1.1 Complete Role Matrix & Permission Boundaries

| Role Name | Platform | Core Permissions | Strictly Prohibited / Firewalled |
| :--- | :--- | :--- | :--- |
| **1. Personal User (Athlete)** | Web, Android, iOS | Owns Passport, edits memory facts, accepts/rejects plan adaptations, logs workouts & food, creates revocable `ScopedGrants`, exports/erases data under UK GDPR. | Accessing other users' private profiles or modifying unaccepted coach proposals directly into active schedules. |
| **2. Professional User (Coach/PT)** | Web, Android, iOS | Builds exercise variations, creates multi-week programmes, invites athletes, views granted client data, submits proposed plans. | Viewing unconsented athlete data; viewing religion, cycle, pregnancy, or raw AI chat; forcing plan changes without athlete acceptance. |
| **3. Team / Club Administrator** | Web Admin / Dashboard | Manages team rosters, invites students/club members, purchases seat licenses, views aggregate attendance/seat status. | **Zero visibility** into personal health data, private Passports, food logs, or individual workout performance. |
| **4. Super Administrator (`SUPER_ADMIN`)** | Web Command Centre | Full centralized administration: toggles system feature flags, triggers **Safety Kill Switches**, manages exercise and video rights, handles user moderation and disputes, oversees Stripe billing and entitlements, and audits immutable system logs. | Bypassing MFA for critical mutations or modifying system state without writing to the immutable audit log. |

---

## 2. End-to-End User Flow State Machines

### 2.1 Flow A: Personal User Onboarding & Progressive Profiling

This journey enforces the **"Fast Signup $\rightarrow$ Immediate Starter Value"** mandate. Users are never blocked behind an invasive 20-question intake form.

```mermaid
stateDiagram-v2
    [*] --> WelcomeScreen: App Launch / Visit Web
    WelcomeScreen --> AgeAndAuth: Select "Get Started"
    AgeAndAuth --> TermsConsent: Enter Email/Password or OAuth (Google/Apple)
    
    state AgeAndAuth {
        [*] --> Check18Plus: "Are you 18 or older?"
        Check18Plus --> MinorExit: Under 18
        Check18Plus --> AuthProceed: 18+ Confirmed
        MinorExit --> [*]: Route to Youth Guidance (UK Children's Code)
    }

    state TermsConsent {
        [*] --> MandatoryTerms: Terms of Service & Privacy Policy [Mandatory]
        MandatoryTerms --> OptionalConsents: [Optional] Personalised Coaching & Analytics
    }

    TermsConsent --> MinimalContext: Account Created
    
    state MinimalContext {
        [*] --> Step1Goal: "What is your primary goal?" (Strength, Fitness, Sport, Health)
        Step1Goal --> Step2Days: "How many days per week can you train?" (2, 3, 4, 5+)
        Step2Days --> Step3Equipment: "What equipment do you have?" (Full Gym, Dumbbells, Bodyweight)
    }

    MinimalContext --> StarterPlanGeneration: Decision Engine Run (Deterministic)
    StarterPlanGeneration --> DailyHomeV4: Present "Your Daily Snapshot" & "Your Next Move"
    DailyHomeV4 --> ProgressiveProfilingCard: Post-Workout / Natural Trigger (e.g. "Add Injury History")
```

#### Progressive Fact Confirmation Flow:
1. Contextual prompt appears only when relevant to a specific user goal (e.g. adding dumbbells unlocks heavier strength options).
2. Displays transparent value proposition: *"Adding movement restrictions helps SMACKGYM filter out exercises that cause discomfort."*
3. Actions: **`Confirm Fact`**, **`Edit`**, or **`Snooze (7 days)`**.
4. Deleting any fact in `Performance Passport` immediately invalidates derived `TwinSnapshot` recommendations.

---

### 2.2 Flow B: The Daily Coaching Loop (`Daily Home v4`)

The signed-in daily cycle anchors the user experience.

```mermaid
flowchart TD
    A[Open SMACKGYM Home] --> B{Check Daily Snapshot}
    B -->|Check-in Ring| C[Optional Wellbeing Check-in\nSleep, Stress, Fatigue, Soreness]
    B -->|Progress Ring| D[View Weekly Plan Adherence Arc\nCompleted vs. Planned Sessions]
    B -->|Next Move Card| E[Review Primary Action Card\nTitle, Duration, Equipment, Level]
    
    E --> F{User Decision}
    F -->|Start Session| G[Launch Follow-Along Workout Player]
    F -->|Adapt / Change Today| H[Open Before/After Diff Sheet\nTime, Equipment, Low Energy]
    F -->|Why this?| I[Open Transparency Drawer\nRules & Confirmed Facts Used]
    
    H --> J{Accept Diff?}
    J -->|Yes| K[Commit Atomic Plan Revision\nPOST /v1/plan-previews/id/accept]
    J -->|No / Keep Original| E
    K --> G
    
    G --> L[Execute Sets & Log Reps/Weight]
    L --> M{Something Hurts?}
    M -->|Yes| N[Activate Injury Safety Hold]
    M -->|No| O[Complete Workout]
    
    O --> P[Private Usefulness Feedback\nWas this useful? Yes / Not for me]
    P --> Q[Update Safe Streak & Adherence]
    Q --> R[Optional Share Card Preview]
```

---

### 2.3 Flow C: Follow-Along Workout Player & Injury Safety Hold

Governed by the **iFIT-style** execution paradigm and strict clinical safety invariants (`SAFE-01` to `SAFE-04`).

```mermaid
stateDiagram-v2
    [*] --> WorkoutPreview: Select "Start Session ->"
    WorkoutPreview --> ActiveSession: "Begin Workout"
    
    state ActiveSession {
        [*] --> SetExecution: Stream HLS Video / 3D Animation
        SetExecution --> CheckmarkSet: Check Set 1 Completed
        CheckmarkSet --> MMKVLocalSave: Write JSON Event to MMKV (<100ms)
        MMKVLocalSave --> RestTimer: Auto-start 60s Rest Timer
        RestTimer --> NextSet: Timer Finishes / Tap "Skip"
        
        state InSessionModifications {
            NextSet --> SubstituteExercise: Tap "Substitute"
            SubstituteExercise --> EquipmentMatches: Select Reviewed Alternative
            EquipmentMatches --> NextSet: Replace Movement
        }
    }

    ActiveSession --> SomethingHurtsModal: Tap "Something Hurts" (Safety Hold)
    
    state SomethingHurtsModal {
        [*] --> PauseTimers: Immediately Freeze All Session Clocks
        PauseTimers --> CapturePain: Pain Location & Severity (1-10)
        CapturePain --> RedFlagCheck: Check Critical Symptoms (Sharp, Numbness, Joint Lock)
        RedFlagCheck --> EmergencyGuidance: Red Flag Triggered -> NHS/Local Help
        RedFlagCheck --> StandardSafetyHold: Non-Critical -> Deload & Rest Guidance
    }

    StandardSafetyHold --> ExitToHome: Halt Session Safely
    ActiveSession --> SessionSummary: Complete All Sets
    SessionSummary --> SyncMMKVQueue: Trigger POST /v1/session-events/batch
```

---

### 2.4 Flow D: Coach-Athlete Collaboration (`ScopedGrant` Protocol)

Ensures athlete data sovereignty: coaches cannot access private records without deliberate, revocable athlete consent.

```mermaid
sequenceDiagram
    autonumber
    actor Coach as Professional Coach
    actor Athlete as Personal Athlete
    participant App as SMACKGYM API
    participant DB as MongoDB (ScopedGrants)

    Coach->>App: POST /v1/workspaces/invites (Send Athlete Invite via Email/Link)
    Athlete->>App: GET /v1/invites/{token}
    App-->>Athlete: Display ScopedGrant Request Modal
    Note over Athlete: Athlete chooses data permissions:<br/>[x] Training Logs<br/>[x] Recovery Scores<br/>[ ] Food & Nutrition<br/>[LOCKED OFF] Religion, Cycle, Raw AI Chat
    Athlete->>App: POST /v1/workspaces/{id}/grants (Approve 90-Day Grant)
    App->>DB: Store ScopedGrant with TTL & allowed_categories
    Coach->>App: GET /v1/workspace/athletes/{id}
    App->>DB: Verify Grant Validity & Filter Excluded Categories
    App-->>Coach: Return Authorized Athlete Dashboard
    Coach->>App: POST /v1/programmes/proposals (Submit Adapted Plan)
    App-->>Athlete: Notification: "Coach Maya proposed a plan change"
    Athlete->>App: GET /v1/plan-previews/{proposal_id}
    Note over Athlete: Athlete previews before/after diff
    Athlete->>App: POST /v1/plan-previews/{proposal_id}/accept
    App->>DB: Atomically commit new PlanVersion (Revision incremented)
    Athlete-->>Coach: Status: Proposal Accepted
```

---

### 2.5 Flow E: Admin Safety Kill Switch Execution

When an exercise, LLM anomaly, or copyright breach is identified, the Super Admin can instantly kill the feature across all mobile and web clients.

```mermaid
flowchart TD
    A[Alert / Triage Incident] --> B[Super Admin opens Command Centre]
    B --> C[Navigate to Safety Kill Switches]
    C --> D{Select Kill Scope}
    
    D -->|AI Chat Kill Switch| E[Disable /v1/smack endpoint\nFallback to Deterministic Rules]
    D -->|Exercise Kill Switch| F[Disable EX-XXXX by ID\nInstantly revokes HLS playback tokens]
    D -->|Locale Kill Switch| G[Temporarily suspend unreviewed language\nFallback to en-GB]
    
    E & F & G --> H[Supply Mandatory Reason Code & Ticket Ref]
    H --> I[Submit MFA Step-Up Authentication]
    I --> J[Atomic Write to SystemFlags in MongoDB]
    J --> K[Redis Pub/Sub Eviction Event]
    K --> L[Clients show Reviewed Safe Fallback Message]
    J --> M[Append Immutable AuditEvent with Before/After Diff]
```

---

## 3. Screen Inventory by Role & Platform

```
====================================================================================================
SCREEN ID     SCREEN NAME                        PLATFORMS          PRIMARY ROLE / PURPOSE
====================================================================================================
SCR-ATH-01    Welcome & Value Intro              Web, Mobile        Unauthenticated Visitor
SCR-ATH-02    18+ Age Gate & Auth                Web, Mobile        New / Returning User
SCR-ATH-03    Minimal Context Intake             Web, Mobile        Onboarding Athlete
SCR-ATH-04    Signed-In Daily Home v4            Web, Mobile        Personal Athlete (Core Hub)
SCR-ATH-05    Why This? Transparency Drawer      Web, Mobile        Personal Athlete
SCR-ATH-06    Adapt (Change Today) Diff Sheet    Web, Mobile        Personal Athlete
SCR-ATH-07    Active Workout Follow-Along Player Web, Mobile        Personal Athlete (Execution)
SCR-ATH-08    Exercise Substitution Drawer       Web, Mobile        Personal Athlete (Execution)
SCR-ATH-09    Something Hurts Safety Sheet       Web, Mobile        Personal Athlete (Safety)
SCR-ATH-10    Session Summary & Feedback         Web, Mobile        Personal Athlete
SCR-ATH-11    Manual Food Intelligence Log       Web, Mobile        Personal Athlete (Fuel)
SCR-ATH-12    Recovery Wellbeing Check-In        Web, Mobile        Personal Athlete (Recovery)
SCR-ATH-13    Discover & Research Feed           Web, Mobile        Personal Athlete (Learn)
SCR-ATH-14    Universal Search & Results         Web, Mobile        Personal Athlete
SCR-ATH-15    Progress & Personal Bests (PBs)    Web, Mobile        Personal Athlete
SCR-ATH-16    Privacy-Safe Share Card Generator  Web, Mobile        Personal Athlete
SCR-ATH-17    Performance Passport Memory View   Web, Mobile        Personal Athlete (Data Control)
SCR-ATH-18    Privacy & ScopedGrant Manager      Web, Mobile        Personal Athlete (GDPR)
----------------------------------------------------------------------------------------------------
SCR-PRO-01    Coach Workspace Dashboard          Web, Mobile Tablet Professional Coach
SCR-PRO-02    Athlete Roster & Grant Status      Web, Mobile Tablet Professional Coach
SCR-PRO-03    Consented Athlete View             Web, Mobile Tablet Professional Coach
SCR-PRO-04    Programme & Course Builder         Web (Desktop)      Professional Coach
SCR-PRO-05    Plan Proposal Creator              Web (Desktop)      Professional Coach
----------------------------------------------------------------------------------------------------
SCR-INS-01    Team / University Dashboard        Web (Desktop)      Team / Club Administrator
SCR-INS-02    Roster & Seat Allocation           Web (Desktop)      Team / Club Administrator
----------------------------------------------------------------------------------------------------
SCR-ADM-01    Admin Command Centre Shell         Web (Desktop)      Super Admin
SCR-ADM-02    Operations & Kill Switches         Web (Desktop)      Super Admin
SCR-ADM-03    Content & Rights Catalogue         Web (Desktop)      Super Admin
SCR-ADM-04    Safety & Biomechanics Review       Web (Desktop)      Super Admin
SCR-ADM-05    Moderation & Triage Queue          Web (Desktop)      Super Admin
SCR-ADM-06    Billing & Entitlements Manager     Web (Desktop)      Super Admin
SCR-ADM-07    Support & System Audit Log         Web (Desktop)      Super Admin
====================================================================================================
```
