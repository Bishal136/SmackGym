import { CoachRosterModel, type ICoachRoster } from '../models/coachRoster.model.js';
import { TrainingGroupModel, type ITrainingGroup } from '../models/trainingGroup.model.js';
import { CoachProgramModel, type ICoachProgram } from '../models/coachProgram.model.js';
import { PlanAdjustmentAuditModel, type IPlanAdjustmentAudit } from '../models/planAdjustmentAudit.model.js';
import { PlanModel, type IPlan, type IPlanExercise } from '../models/plan.model.js';
import { UserModel } from '../models/user.model.js';
import { passportService } from './passport.service.js';
import { grantService, type SanitizedPassportPayload } from './grant.service.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface AssignAthleteInput {
  athleteId: string;
  notes?: string;
}

export interface CreateGroupInput {
  name: string;
  description?: string;
  athleteIds?: string[];
  programId?: string;
}

export interface CreateProgramInput {
  title: string;
  description: string;
  weeksCount: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  weeklySchedule: Array<{
    dayNumber: number;
    focus: string;
    exerciseIds: string[];
  }>;
}

export interface AdjustPlanInput {
  rationale: string;
  proposedExercises: Array<{
    exerciseId: string;
    name: string;
    targetSets: number;
    targetReps: number;
    targetWeightKg: number;
    movementPattern?: string;
    restSeconds?: number;
  }>;
}

export class CoachService {
  /**
   * Assigns an athlete to a coach's active roster
   */
  public async assignAthlete(coachId: string, input: AssignAthleteInput): Promise<ICoachRoster> {
    const athlete = await UserModel.findById(input.athleteId);
    if (!athlete || athlete.role !== 'ATHLETE') {
      throw new NotFoundError(`Athlete with ID '${input.athleteId}' not found`);
    }

    let roster = await CoachRosterModel.findOne({ coachId, athleteId: input.athleteId });
    if (roster) {
      roster.status = 'active';
      if (input.notes) roster.notes = input.notes;
      await roster.save();
    } else {
      roster = await CoachRosterModel.create({
        coachId,
        athleteId: input.athleteId,
        status: 'active',
        notes: input.notes,
        assignedAt: new Date(),
      });
    }

    logger.info(`Athlete ${input.athleteId} assigned to Coach ${coachId} roster`);
    return roster;
  }

  /**
   * Retrieves all athletes on a coach's active roster with user details
   */
  public async getRoster(coachId: string): Promise<any[]> {
    const rosterEntries = await CoachRosterModel.find({ coachId, status: 'active' }).lean();
    const athleteIds = rosterEntries.map((r) => r.athleteId);

    const athletes = await UserModel.find({ _id: { $in: athleteIds } }).lean();
    const athleteMap = new Map(athletes.map((a) => [a._id.toString(), a]));

    return rosterEntries.map((entry) => ({
      rosterId: entry._id,
      athleteId: entry.athleteId,
      status: entry.status,
      assignedAt: entry.assignedAt,
      notes: entry.notes,
      athlete: athleteMap.get(entry.athleteId)
        ? {
            id: entry.athleteId,
            fullName: athleteMap.get(entry.athleteId)!.fullName,
            email: athleteMap.get(entry.athleteId)!.email,
            mode: athleteMap.get(entry.athleteId)!.mode,
          }
        : null,
    }));
  }

  /**
   * Removes an athlete from the coach's roster (archives relationship)
   */
  public async removeAthlete(coachId: string, athleteId: string): Promise<void> {
    const roster = await CoachRosterModel.findOne({ coachId, athleteId });
    if (!roster) {
      throw new NotFoundError('Athlete is not on this coach roster');
    }

    roster.status = 'archived';
    await roster.save();
    logger.info(`Athlete ${athleteId} archived from Coach ${coachId} roster`);
  }

  /**
   * Creates a training cohort / group
   */
  public async createGroup(coachId: string, input: CreateGroupInput): Promise<ITrainingGroup> {
    return await TrainingGroupModel.create({
      coachId,
      name: input.name,
      description: input.description || '',
      athleteIds: input.athleteIds || [],
      programId: input.programId || null,
    });
  }

  /**
   * Retrieves all training groups for a coach
   */
  public async getGroups(coachId: string): Promise<any[]> {
    return await TrainingGroupModel.find({ coachId }).sort({ createdAt: -1 }).lean();
  }

  /**
   * Adds an athlete to a training group
   */
  public async addAthleteToGroup(coachId: string, groupId: string, athleteId: string): Promise<ITrainingGroup> {
    const group = await TrainingGroupModel.findOne({ _id: groupId, coachId });
    if (!group) {
      throw new NotFoundError('Training group not found');
    }

    if (!group.athleteIds.includes(athleteId)) {
      group.athleteIds.push(athleteId);
      await group.save();
    }

    return group;
  }

  /**
   * Authors a structured training program
   */
  public async createProgram(coachId: string, input: CreateProgramInput): Promise<ICoachProgram> {
    return await CoachProgramModel.create({
      coachId,
      title: input.title,
      description: input.description,
      weeksCount: input.weeksCount,
      difficulty: input.difficulty || 'intermediate',
      weeklySchedule: input.weeklySchedule,
      isPublished: true,
    });
  }

  /**
   * Lists programs authored by coach
   */
  public async getPrograms(coachId: string): Promise<any[]> {
    return await CoachProgramModel.find({ coachId }).sort({ createdAt: -1 }).lean();
  }

  /**
   * Adjusts athlete plan and writes immutable audit log entry
   */
  public async adjustAthletePlan(
    coachId: string,
    athleteId: string,
    planId: string,
    input: AdjustPlanInput
  ): Promise<{ plan: IPlan; auditLog: IPlanAdjustmentAudit }> {
    // 1. Verify roster connection
    const onRoster = await CoachRosterModel.findOne({ coachId, athleteId, status: 'active' });
    if (!onRoster) {
      throw new ForbiddenError('Coach does not have an active roster relationship with this athlete');
    }

    // 2. Fetch existing athlete plan
    const plan = await PlanModel.findOne({ _id: planId, userId: athleteId });
    if (!plan) {
      throw new NotFoundError(`Plan with ID '${planId}' not found for this athlete`);
    }

    const previousExercises = plan.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      name: ex.name,
      targetSets: ex.targetSets,
      targetReps: ex.targetReps,
      targetWeightKg: ex.targetWeightKg,
    }));

    // 3. Construct updated plan exercises
    const updatedExercises: IPlanExercise[] = input.proposedExercises.map((p) => ({
      exerciseId: p.exerciseId,
      name: p.name,
      targetSets: p.targetSets,
      targetReps: p.targetReps,
      targetWeightKg: p.targetWeightKg,
      movementPattern: p.movementPattern || 'compound',
      restSeconds: p.restSeconds || 90,
    }));

    // 4. Record audit log
    const auditLog = await PlanAdjustmentAuditModel.create({
      coachId,
      athleteId,
      planId,
      previousExercises,
      proposedExercises: input.proposedExercises.map((p) => ({
        exerciseId: p.exerciseId,
        name: p.name,
        targetSets: p.targetSets,
        targetReps: p.targetReps,
        targetWeightKg: p.targetWeightKg,
      })),
      rationale: input.rationale,
      status: 'accepted',
      appliedAt: new Date(),
    });

    // 5. Update and save plan
    plan.exercises = updatedExercises as any;
    plan.status = 'adapted';
    plan.revision += 1;
    await plan.save();

    logger.info(`Coach ${coachId} adjusted plan ${planId} for Athlete ${athleteId}: ${input.rationale}`);
    return { plan, auditLog };
  }

  /**
   * Retrieves adjustment audit logs for an athlete plan
   */
  public async getAdjustmentAuditLogs(athleteId: string, planId: string): Promise<any[]> {
    return await PlanAdjustmentAuditModel.find({ athleteId, planId }).sort({ appliedAt: -1 }).lean();
  }

  /**
   * Retrieves athlete passport sanitized via UK GDPR Article 9 Firewall (Gate T13)
   */
  public async getAthletePassport(coachId: string, athleteId: string): Promise<SanitizedPassportPayload> {
    const rawFacts = await passportService.getUserFacts(athleteId);
    const rawTwin = await passportService.compileDigitalTwin(athleteId);

    return await grantService.applyArticle9Firewall(athleteId, coachId, rawFacts, rawTwin);
  }
}

export const coachService = new CoachService();
