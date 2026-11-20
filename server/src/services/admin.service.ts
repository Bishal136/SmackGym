import { getRedisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';
import { KILL_SWITCH_SCOPES } from '@smackgym/shared';

export interface KillSwitchStatus {
  GLOBAL_AI_KILL_SWITCH: boolean;
  CONTENT_TAKEDOWN_SWITCH: boolean;
  NEW_REGISTRATIONS_PAUSE: boolean;
  lastUpdated: string;
}

export class AdminService {
  /**
   * Toggle safety kill switch via Redis (< 100ms SLA, Gate T08, PRD-ADM-01)
   */
  public async setKillSwitch(scope: string, enabled: boolean): Promise<boolean> {
    const redis = getRedisClient();
    const key = `killswitch:${scope}`;

    await redis.set(key, enabled ? '1' : '0');
    logger.warn(`Safety Kill Switch '${scope}' state changed to ${enabled}`);

    return enabled;
  }

  /**
   * Get all active kill switches status
   */
  public async getKillSwitches(): Promise<KillSwitchStatus> {
    const redis = getRedisClient();

    const [aiKill, contentKill, regPause] = await Promise.all([
      redis.get(`killswitch:${KILL_SWITCH_SCOPES.AI_CHAT}`),
      redis.get(`killswitch:${KILL_SWITCH_SCOPES.EXERCISE_STREAM}`),
      redis.get(`killswitch:${KILL_SWITCH_SCOPES.NEW_REGISTRATIONS}`),
    ]);

    return {
      GLOBAL_AI_KILL_SWITCH: aiKill === '1' || aiKill === 'true',
      CONTENT_TAKEDOWN_SWITCH: contentKill === '1' || contentKill === 'true',
      NEW_REGISTRATIONS_PAUSE: regPause === '1' || regPause === 'true',
      lastUpdated: new Date().toISOString(),
    };
  }
}

export const adminService = new AdminService();
