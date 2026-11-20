import { ExerciseModel } from '../models/exercise.model.js';
import { bunnyStreamAdapter, type SignedStreamToken } from '../adapters/bunnyStream.adapter.js';
import { NotFoundError } from '../utils/errors.js';

export class ContentService {
  /**
   * Retrieves all licensed exercises in catalog
   */
  public async getExercises(): Promise<any[]> {
    let exercises = await ExerciseModel.find({ isLicensed: true }).lean();
    if (exercises.length === 0) {
      // Seed default exercises
      await ExerciseModel.create([
        {
          _id: 'EX-0001',
          name: 'Barbell Back Squat',
          movementPattern: 'squat',
          targetMuscles: ['quadriceps', 'glutes'],
          equipmentRequired: ['barbell', 'rack'],
          setupCues: ['Feet shoulder-width', 'Brace core'],
          videoAssetId: 'vid-squat-1',
          isLicensed: true,
          isCompound: true,
        },
        {
          _id: 'EX-0002',
          name: 'Barbell Romanian Deadlift',
          movementPattern: 'hinge',
          targetMuscles: ['hamstrings', 'glutes'],
          equipmentRequired: ['barbell'],
          setupCues: ['Hinge at hips', 'Keep spine neutral'],
          videoAssetId: 'vid-rdl-1',
          isLicensed: true,
          isCompound: true,
        },
        {
          _id: 'EX-0003',
          name: 'Dumbbell Bench Press',
          movementPattern: 'push',
          targetMuscles: ['pectorals', 'triceps'],
          equipmentRequired: ['dumbbell', 'bench'],
          setupCues: ['Retract scapulae', 'Drive through feet'],
          videoAssetId: 'vid-bench-1',
          isLicensed: true,
          isCompound: true,
        },
      ]);
      exercises = await ExerciseModel.find({ isLicensed: true }).lean();
    }
    return exercises as any[];
  }

  /**
   * Generates signed HMAC playback token for video streaming (< 50ms, Gate T07)
   */
  public async getStreamToken(exerciseId: string): Promise<SignedStreamToken> {
    const exercise = await ExerciseModel.findById(exerciseId);
    if (!exercise) {
      throw new NotFoundError(`Exercise '${exerciseId}' not found`);
    }

    return await bunnyStreamAdapter.generatePlaybackToken(exercise.videoAssetId);
  }
}

export const contentService = new ContentService();
