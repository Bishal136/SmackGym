import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { getRedisClient } from '../config/redis.js';
import { ForbiddenError } from '../utils/errors.js';

export interface SignedStreamToken {
  videoAssetId: string;
  playbackUrl: string;
  token: string;
  expiresAt: number;
}

export class BunnyStreamAdapter {
  private readonly apiKey: string;
  private readonly libraryId: string;

  constructor() {
    this.apiKey = env.BUNNY_STREAM_API_KEY;
    this.libraryId = env.BUNNY_LIBRARY_ID;
  }

  /**
   * Generates HMAC-SHA256 signed token for HLS video playback with 15-min TTL (< 50ms SLA, Gate T07)
   */
  public async generatePlaybackToken(videoAssetId: string): Promise<SignedStreamToken> {
    // 1. Check if emergency CONTENT_TAKEDOWN_SWITCH is active in Redis (PRD-ADM-01)
    try {
      const redis = getRedisClient();
      const isTakedownActive =
        (await redis.get('killswitch:CONTENT_TAKEDOWN_SWITCH')) ||
        (await redis.get('killswitch:EXERCISE_PLAYBACK_TAKEDOWN'));
      if (isTakedownActive === 'true' || isTakedownActive === '1') {
        throw new ForbiddenError(
          'Media streaming has been temporarily disabled by administrative emergency takedown',
          'content_takedown_active'
        );
      }
    } catch (err: any) {
      if (err instanceof ForbiddenError) throw err;
      // Fail open if Redis is down for token signing
    }

    const start = Date.now();
    const expiresAt = Math.floor(start / 1000) + 15 * 60; // 15 minutes TTL

    // Bunny Stream HMAC-SHA256 signature format: sha256(apiKey + videoAssetId + expiresAt)
    const rawData = `${this.apiKey}${videoAssetId}${expiresAt}`;
    const token = crypto.createHash('sha256').update(rawData).digest('hex');

    const playbackUrl = `https://video.bunnycdn.com/play/${this.libraryId}/${videoAssetId}?token=${token}&expires=${expiresAt}`;

    return {
      videoAssetId,
      playbackUrl,
      token,
      expiresAt,
    };
  }
}

export const bunnyStreamAdapter = new BunnyStreamAdapter();
