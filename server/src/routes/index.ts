import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { passportRouter } from './passport.routes.js';
import { planRouter, safetyRouter } from './plan.routes.js';
import { syncRouter } from './sync.routes.js';
import { contentRouter } from './content.routes.js';
import { foodRouter, recoveryRouter } from './foodRecovery.routes.js';
import { billingRouter } from './billing.routes.js';
import { adminRouter } from './admin.routes.js';
import { fastingRouter } from './fasting.routes.js';
import { cycleRouter } from './cycle.routes.js';
import { researchRouter } from './research.routes.js';
import { aiRouter } from './ai.routes.js';
import { coachRouter } from './coach.routes.js';
import { grantRouter } from './grant.routes.js';
import { institutionRouter } from './institution.routes.js';
import { i18nRouter } from './i18n.routes.js';

const apiV1Router = Router();

// Subsystem 1: Identity & Authentication
apiV1Router.use('/auth', authRouter);

// Subsystem 2: Performance Passport & Digital Twin
apiV1Router.use('/passport', passportRouter);

// Subsystem 3: Deterministic Decision Engine & Clinical Safety
apiV1Router.use('/plans', planRouter);
apiV1Router.use('/safety', safetyRouter);

// Subsystem 4: Offline Training Session Sync
apiV1Router.use('/session-events', syncRouter);

// Subsystem 5: Content Catalogue & HLS Media Streaming
apiV1Router.use('/', contentRouter);

// Subsystem 6: Food Intelligence & Recovery Logging
apiV1Router.use('/food', foodRouter);
apiV1Router.use('/recovery', recoveryRouter);

// Subsystem 7: Stripe UK Billing & Subscriptions
apiV1Router.use('/billing', billingRouter);

// Subsystem 8: Admin Command Centre & Kill Switches
apiV1Router.use('/admin', adminRouter);

// Subsystem 9: Ramadan Fasting & Circadian Hydration (Gate T09)
apiV1Router.use('/fasting', fastingRouter);

// Subsystem 10: Menstrual Cycle Load Modulation (Gate T10)
apiV1Router.use('/cycle', cycleRouter);

// Subsystem 11: Scientific Research Ingestion & SSRF Guard (Gate T11)
apiV1Router.use('/research', researchRouter);

// Subsystem 12: Ask SMACK AI Coaching & Clinical Triage (Gate T12)
apiV1Router.use('/ai', aiRouter);

// Subsystem 13: Coach & Mentor Professional Mode (Milestone M5)
apiV1Router.use('/coach', coachRouter);

// Subsystem 14: UK GDPR Article 9 ScopedGrants (Gate T13)
apiV1Router.use('/grants', grantRouter);

// Subsystem 15: Institutional University Licensing & Bulk Seats (Gate T14)
apiV1Router.use('/institutions', institutionRouter);

// Subsystem 16: Regional Language Localization (Milestone M5)
apiV1Router.use('/i18n', i18nRouter);

export { apiV1Router };
