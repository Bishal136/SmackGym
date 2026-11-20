import { SessionEventModel } from '../models/sessionEvent.model.js';
import type { SessionEventInput } from '@smackgym/shared';

export interface BatchSyncResult {
  totalReceived: number;
  insertedCount: number;
  duplicateCount: number;
  processingTimeMs: number;
}

export class SyncService {
  /**
   * High-throughput batch ingestion of offline sets with UUIDv4 deduplication (< 100ms SLA, Gate T03)
   */
  public async ingestBatch(
    athleteId: string,
    events: SessionEventInput[]
  ): Promise<BatchSyncResult> {
    const startTime = Date.now();

    if (events.length === 0) {
      return {
        totalReceived: 0,
        insertedCount: 0,
        duplicateCount: 0,
        processingTimeMs: Date.now() - startTime,
      };
    }

    // Ultra high-throughput batch insert using unordered insertMany (< 100ms SLA, Gate T03)
    const docs = events.map((event) => ({
      _id: event.eventId,
      sessionId: event.sessionId,
      athleteId,
      exerciseId: event.exerciseId,
      setData: event.setData,
      eventTimestamp: new Date(event.eventTimestamp),
    }));

    let insertedCount = 0;
    try {
      const result = await SessionEventModel.insertMany(docs, {
        ordered: false,
        rawResult: true,
      });
      insertedCount = (result as any).insertedCount ?? docs.length;
    } catch (err: any) {
      if (err.name === 'MongoBulkWriteError' || err.code === 11000) {
        insertedCount = err.result?.nInserted ?? (docs.length - (err.writeErrors?.length || 0));
      } else {
        throw err;
      }
    }

    const duplicateCount = events.length - insertedCount;
    const processingTimeMs = Date.now() - startTime;

    return {
      totalReceived: events.length,
      insertedCount,
      duplicateCount,
      processingTimeMs,
    };
  }
}

export const syncService = new SyncService();
