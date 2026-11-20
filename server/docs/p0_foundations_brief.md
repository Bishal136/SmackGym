# Phase P0 Architecture & Security Baseline Brief

* **Author:** SMACKGYM Engineering Team
* **Date:** 2026-11-19
* **Scope:** Phase P0 Core Foundations & Security Baseline (Milestone M0)

## Overview

Phase P0 establishes the foundation for the SMACKGYM backend: a zero-SQL containerized runtime on Node.js 26 LTS, MongoDB 8.0, and Redis 7.4. It introduces strict 18+ age verification, UK GDPR Article 9 consent collection, RS256/Argon2id authentication, Redis token blacklisting, structured Winston logging with automated PII redaction, distributed rate limiting, and RFC 7807 Problem Details error handling.

## Analysis

### 1. Architectural Alignment & Constraints
- **Zero-SQL (RULE-DB-01):** MongoDB 8.0 replica set with Mongoose ODM handles all persistent state. Redis 7.4 handles sliding-window rate limiting, token revocation blacklisting, and session storage.
- **Offline Primary Keys (RULE-DB-02):** All documents use RFC 4122 UUIDv4 strings as `_id` to prevent collision during offline mobile synchronization.
- **Optimistic Concurrency Control (RULE-DB-03):** All mutable records store an integer `revision` field initialized to 1 and incremented conditionally on mutations.
- **Layer Separation:** Strict boundary isolation:
  - Controllers contain zero database queries and zero business logic.
  - Services receive and return domain primitives, without Express `req` or `res` dependencies.
  - Edge validation via Zod schemas intercepts invalid payloads before controller execution.

### 2. Critique & Security Trade-offs
- **Argon2id vs. Bcrypt:** Argon2id provides memory-hard protection against ASIC/GPU cracking. In high-concurrency scenarios, Argon2id CPU and memory usage must be bounded (default 19MB memory cost, 2 iterations, 1 parallelism).
- **RS256 JWT vs. Symmetric HS256:** RS256 enables downstream verification by edge nodes or microservices without exposing the private signing key. Keys are managed via PKCS#8 PEM strings in environment configuration with dynamic fallback in development.
- **18+ Age Verification Invariant:** Enforced at both DTO schema validation and edge middleware (`ageGateMiddleware`). Underage attempts terminate with HTTP `403` (`code: "forbidden_underage"`).

## Goals vs. Non-Goals

### In-Scope Goals (Phase P0)
- Zod-validated environment configuration (`src/config/env.ts`).
- Mongoose connection manager with reconnection backoff and replica-set health checks (`src/config/database.ts`).
- Redis connection manager (`src/config/redis.ts`).
- Winston structured logger with automatic PII sanitization (`src/utils/logger.ts`).
- RFC 7807 Problem Details error classes and global handler (`src/utils/errors.ts`, `src/middlewares/errorHandler.ts`).
- Correlation ID middleware with `X-Correlation-ID` header propagation (`src/middlewares/correlationId.ts`).
- Zod DTO validation middleware (`src/middlewares/validateRequest.ts`).
- Redis sliding-window distributed rate limiter (`src/middlewares/rateLimiter.ts`).
- Mandatory 18+ Age Gate middleware (`src/middlewares/ageGate.ts`).
- JWT RS256 signing/verification and Argon2id password utilities (`src/utils/jwt.ts`, `src/utils/argon.ts`).
- Mongoose `UserModel` and `ConsentRecordModel` with compound indexes (ESR compliance).
- Authentication service, controller, and routes (`/v1/auth/register`, `/v1/auth/login`, `/v1/auth/refresh`, `/v1/auth/logout`, `/v1/auth/me`).
- Express application harness and server entrypoint with graceful shutdown (`src/app.ts`, `src/server.ts`).
- Unit and integration test suite verifying Gates T01 and T02.

### Out-of-Scope Non-Goals (Reserved for P1–P4)
- Deterministic 6-step Decision Engine (Phase P1).
- Offline batch workout set synchronization (Phase P1).
- Bunny HLS video token signing (Phase P1).
- Stripe UK subscription webhooks (Phase P1).
- PubMed / Crossref literature ingestion workers (Phase P2).
- Coach workspace and ScopedGrant Article 9 firewall (Phase P3).

## Alternatives Weighed

1. **Symmetric HS256 for Access Tokens:** Rejected. While faster to set up, HS256 forces every verifying service or edge worker to hold the secret, increasing blast radius in multi-service or serverless environments. RS256 allows distribution of the public key only.
2. **Memory-Based Rate Limiting:** Rejected. Single-process memory rate limiting breaks under horizontal scaling and multi-process clustering. Distributed Redis sliding-window provides accurate cluster-wide accounting.
3. **Soft Age Verification via Client-Side Checkbox Only:** Rejected. Violates UK clinical and GDPR compliance mandates; verified server-side via both DTO and `ageGateMiddleware`.

## Staging Verification Gates Alignment
- **Gate T01 (Auth):** Argon2id hash verified; valid RS256 JWT issued; refresh token stored in Redis; instant revocation on logout.
- **Gate T02 (Safety):** Registration under 18 returns HTTP `403 forbidden_underage`.
