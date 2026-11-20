# Phase P2: Scale, Retention & Research Ingestion Architecture Brief

## 1. Executive Summary & Objective
Phase P2 extends the SMACKGYM platform from MVP pilot capabilities into personalized, culturally responsive training architectures, continuous scientific research ingestion, resilient conversational AI orchestration, and telemetry observability.

Phase P2 operationalizes Milestones **M3** and **M4** while delivering the verification gates **T09 through T12**:
- **Gate T09 (Engine - Ramadan Fasting Mode):** Meal reminders suppressed during daylight; hydration shifted to night (Suhoor / Iftar windows).
- **Gate T10 (Engine - Menstrual Cycle Load):** Automatic deload and volume adjustment during high-symptom luteal phase.
- **Gate T11 (Security - Ingestion SSRF Guard):** Pre-flight DNS resolution and CIDR filtering blocking RFC 1918, loopback, and cloud metadata targets (`10.0.0.1`, `127.0.0.1`, `169.254.169.254`).
- **Gate T12 (Resilience - AI 10s Fallback):** Strict 10,000ms circuit-breaker fallback to deterministic Decision Engine templates, clinical red-flag triage, and 5,000 tokens/day rate-limiting.

---

## 2. Capability Register & Technical Specifications

```
+---------------------------------------------------------------------------------------------------------+
|                                        PHASE P2 ARCHITECTURE MAP                                        |
+---------------------------------------------------------------------------------------------------------+
                                                     │
        ┌───────────────────┬────────────────────────┼───────────────────────┬──────────────────┐
        ▼                   ▼                        ▼                       ▼                  ▼
┌──────────────┐    ┌──────────────┐         ┌──────────────┐        ┌──────────────┐   ┌──────────────┐
│Fast/Cycle Svc│    │ Research Ingest│        │ Ask SMACK AI │        │SSRF Guard Clt│   │ Observability│
│/v1/fasting   │    │/v1/research  │         │/v1/ai/ask    │        │dns.lookup +  │   │/metrics      │
│/v1/cycle     │    │PubMed/Crossref│        │10s CircuitBrk│        │CIDR Range Blk│   │Prometheus    │
└──────────────┘    └──────────────┘         └──────────────┘        └──────────────┘   └──────────────┘
```

### 2.1 Fasting & Cultural Physiology Subsystem (`Gate T09`)
- **Fasting Model & Calculator (`src/services/fasting.service.ts`):**
  - Configurable athlete fasting window (`RAMADAN` or `INTERMITTENT_FASTING`).
  - Daytime calculation: Computes whether local timestamp falls between `fajr` (dawn) and `maghrib` (sunset).
  - Hydration suppression: Suppresses daytime water notifications; shifts targets to Suhoor ($30\%$) and Iftar/Post-sunset ($70\%$).
  - Decision Engine Integration: Generates plan adjustments applying `ADAPT_REASON_CODES.RAMADAN_FASTING_WINDOW` (`'ADAPT_RAMADAN_HYDRATION_SHIFT'`).

### 2.2 Menstrual Cycle Physiology Subsystem (`Gate T10`)
- **Menstrual Tracking Service (`src/services/cycle.service.ts`):**
  - Tracks `cycleDay` (1–35) and phases: `follicular`, `ovulatory`, `luteal`, `menstrual`.
  - Symptom logger: Cramps, fatigue, bloating, mood (1–5 scale).
  - Autonomic Load Adaptation: High-symptom luteal phase (symptom level $\ge 3$) automatically drops exercise target volume ($15\%\text{--}25\%$ reduction in sets/intensity) with reason code `ADAPT_REASON_CODES.MENSTRUAL_LUTEAL_FATIGUE` (`'ADAPT_MENSTRUAL_LUTEAL_DELOAD'`).

### 2.3 SSRF-Safe Ingestion Pipeline (`Gate T11`)
- **SSRF Guard Adapter (`src/adapters/ssrfGuard.adapter.ts`):**
  - Resolves domain names using `node:dns/promises`.
  - Blocks RFC 1918 private IPv4 (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
  - Blocks Loopback (`127.0.0.0/8`, `::1`), Link-Local (`169.254.0.0/16`), Carrier-grade NAT (`100.64.0.0/10`), and Broadcast addresses.
  - Throws RFC 7807 `400 Bad Request` (`code: "ssrf_target_blocked"`).
- **Research Ingestion Service (`src/services/research.service.ts`):**
  - Ingests verified studies from PubMed, Crossref, and Substack exercise science RSS.
  - Persists evidence-backed cards (`ResearchCardModel`) linked to canonical `exerciseIds`.

### 2.4 Ask SMACK AI Orchestrator (`Gate T12`)
- **AI Orchestrator Service (`src/services/aiOrchestrator.service.ts`):**
  - **Clinical Safety Filter:** Scans prompts for eating disorder patterns (`laxative`, `vomit`, `starve`, `purge`, `anorexi`, `bulimi`) and self-harm keywords (`suicide`, `cut myself`, `kill myself`, `end my life`). Immediately flags emergency assistance resources without running LLM.
  - **Token Budget Guard:** Tracks daily token usage in Redis (`ai:budget:{userId}:{YYYY-MM-DD}`). Hard cap at 5,000 tokens/day; rejects excess with HTTP `429 token_budget_exceeded`.
  - **Hard 10-Second Fallback:** Wraps LLM adapter in `Promise.race([llmCall, timeout(10000)])`. Upon timeout or upstream failure, returns deterministic Decision Engine template in $\le 10.1\text{s}$ with `fallbackApplied: true`.
  - **Safety Kill Switch:** Respects `GLOBAL_AI_KILL_SWITCH` in Redis.

### 2.5 Observability & Telemetry (`GET /metrics`)
- Exposes Prometheus-compatible plain-text metrics:
  - `smackgym_http_requests_total{method, path, status}`
  - `smackgym_http_request_duration_ms_bucket{le}`
  - `smackgym_active_connections`
  - `smackgym_process_memory_bytes`
