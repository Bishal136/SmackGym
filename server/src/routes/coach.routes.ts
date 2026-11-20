import { Router } from 'express';
import { coachController } from '../controllers/coach.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { z } from 'zod';

const assignAthleteSchema = z.object({
  athleteId: z.string().min(1, 'athleteId is required'),
  notes: z.string().max(1000).optional(),
});

const createGroupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  description: z.string().max(1000).optional(),
  athleteIds: z.array(z.string()).optional(),
  programId: z.string().optional(),
});

const addAthleteToGroupSchema = z.object({
  athleteId: z.string().min(1, 'athleteId is required'),
});

const createProgramSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().min(5).max(2000),
  weeksCount: z.number().int().min(1).max(52),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'elite']).optional(),
  weeklySchedule: z.array(
    z.object({
      dayNumber: z.number().int().min(1).max(7),
      focus: z.string().min(1),
      exerciseIds: z.array(z.string()).default([]),
    })
  ),
});

const adjustPlanSchema = z.object({
  rationale: z.string().min(5, 'Rationale must be at least 5 characters').max(1000),
  proposedExercises: z.array(
    z.object({
      exerciseId: z.string().min(1),
      name: z.string().min(1),
      targetSets: z.number().int().min(1).max(20),
      targetReps: z.number().int().min(1).max(100),
      targetWeightKg: z.number().min(0),
      movementPattern: z.string().optional(),
      restSeconds: z.number().int().min(0).optional(),
    })
  ).min(1, 'At least one exercise prescription must be provided'),
});

const router = Router();

// Protect all coach routes: require COACH or SUPER_ADMIN
router.use(requireAuth);
router.use(requireRole('COACH', 'SUPER_ADMIN'));

// Roster Management
router.post(
  '/roster/assign',
  validateRequest({ body: assignAthleteSchema }),
  coachController.assignAthlete
);
router.get('/roster', coachController.getRoster);
router.delete('/roster/:athleteId', coachController.removeAthlete);

// Training Cohorts / Groups
router.post(
  '/groups',
  validateRequest({ body: createGroupSchema }),
  coachController.createGroup
);
router.get('/groups', coachController.getGroups);
router.post(
  '/groups/:id/athletes',
  validateRequest({ body: addAthleteToGroupSchema }),
  coachController.addAthleteToGroup
);

// Course & Program Authoring
router.post(
  '/programs',
  validateRequest({ body: createProgramSchema }),
  coachController.createProgram
);
router.get('/programs', coachController.getPrograms);

// Athlete Plan Adjustments & Audit Trail
router.post(
  '/athletes/:athleteId/plans/:planId/adjust',
  validateRequest({ body: adjustPlanSchema }),
  coachController.adjustAthletePlan
);
router.get('/athletes/:athleteId/plans/:planId/audit-logs', coachController.getAdjustmentAuditLogs);

// UK GDPR Article 9 Athlete Passport View (Gate T13)
router.get('/athletes/:athleteId/passport', coachController.getAthletePassport);

export const coachRouter = router;
