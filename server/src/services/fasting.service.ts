import { passportService } from './passport.service.js';
import { ADAPT_REASON_CODES } from '@smackgym/shared';

export interface FastingConfig {
  isActive: boolean;
  fastingType: 'RAMADAN' | 'INTERMITTENT_FASTING';
  fajrTime?: string; // HH:mm format, e.g. "04:30"
  maghribTime?: string; // HH:mm format, e.g. "18:45"
  fastingStartHour?: number; // for intermittent fasting, e.g. 20 (8pm)
  fastingEndHour?: number; // for intermittent fasting, e.g. 12 (12pm)
}

export interface FastingStatusResult {
  userId: string;
  isActive: boolean;
  isFastingRamadan: boolean;
  fastingType: 'RAMADAN' | 'INTERMITTENT_FASTING';
  isCurrentlyFast: boolean;
  daylightFastingActive: boolean;
  hydrationSuppressed: boolean;
  nextAllowedMeal: 'suhoor' | 'iftar' | 'window_open' | 'normal';
  hydrationSchedule: {
    daytimeMl: number;
    daytimeTargetMl: number;
    suhoorTargetMl: number;
    postSunsetTargetMl: number;
    iftarTargetMl: number;
    totalTargetMl: number;
  };
  adaptationReasonCode: string;
}

export class FastingService {
  /**
   * Configures an athlete's fasting mode and records fact in Passport (Gate T09)
   */
  public async setFastingConfig(userId: string, config: FastingConfig): Promise<FastingStatusResult> {
    await passportService.addOrUpdateFact(userId, {
      domain: 'dietary_nutrition',
      key: 'fasting_config',
      value: config,
      sourceKind: 'user_declared',
    });

    return await this.getFastingStatus(userId, config);
  }

  /**
   * Calculates current real-time fasting window status and hydration distribution (Gate T09)
   */
  public async getFastingStatus(userId: string, overrideConfig?: FastingConfig): Promise<FastingStatusResult> {
    let config = overrideConfig;
    if (!config) {
      const facts = await passportService.getUserFacts(userId);
      const fact = facts.find((f) => f.key === 'fasting_config' && f.isActive);
      config = (fact?.value as FastingConfig) || {
        isActive: false,
        fastingType: 'RAMADAN',
        fajrTime: '04:30',
        maghribTime: '18:30',
      };
    }

    if (!config.isActive) {
      return {
        userId,
        isActive: false,
        isFastingRamadan: false,
        fastingType: config.fastingType,
        isCurrentlyFast: false,
        daylightFastingActive: false,
        hydrationSuppressed: false,
        nextAllowedMeal: 'normal',
        hydrationSchedule: {
          daytimeMl: 2500,
          daytimeTargetMl: 2500,
          suhoorTargetMl: 0,
          postSunsetTargetMl: 0,
          iftarTargetMl: 0,
          totalTargetMl: 2500,
        },
        adaptationReasonCode: 'NONE',
      };
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let isCurrentlyFast = false;
    let nextAllowedMeal: 'suhoor' | 'iftar' | 'window_open' | 'normal' = 'iftar';

    if (config.fastingType === 'RAMADAN') {
      const fajrParts = (config.fajrTime || '04:30').split(':').map(Number);
      const maghribParts = (config.maghribTime || '18:30').split(':').map(Number);
      const fajrH = fajrParts[0] ?? 4;
      const fajrM = fajrParts[1] ?? 30;
      const maghribH = maghribParts[0] ?? 18;
      const maghribM = maghribParts[1] ?? 30;

      const fajrTotalMin = fajrH * 60 + fajrM;
      const maghribTotalMin = maghribH * 60 + maghribM;

      // Daylight fasting: between Fajr and Maghrib
      isCurrentlyFast = currentMinutes >= fajrTotalMin && currentMinutes < maghribTotalMin;
      nextAllowedMeal = isCurrentlyFast ? 'iftar' : 'suhoor';
    } else {
      // Intermittent Fasting (e.g. 16:8)
      const startHour = config.fastingStartHour ?? 20;
      const endHour = config.fastingEndHour ?? 12;
      const currentHour = now.getHours();

      if (startHour > endHour) {
        isCurrentlyFast = currentHour >= startHour || currentHour < endHour;
      } else {
        isCurrentlyFast = currentHour >= startHour && currentHour < endHour;
      }
      nextAllowedMeal = isCurrentlyFast ? 'window_open' : 'normal';
    }

    // Hydration targets: 0ml daytime, 30% Suhoor (~900ml), 70% Iftar/post-sunset (~2100ml)
    const totalMl = 3000;
    const suhoorTargetMl = Math.round(totalMl * 0.3);
    const postSunsetTargetMl = Math.round(totalMl * 0.7);

    return {
      userId,
      isActive: true,
      isFastingRamadan: config.fastingType === 'RAMADAN',
      fastingType: config.fastingType,
      isCurrentlyFast,
      daylightFastingActive: isCurrentlyFast,
      hydrationSuppressed: isCurrentlyFast,
      nextAllowedMeal,
      hydrationSchedule: {
        daytimeMl: config.fastingType === 'RAMADAN' ? 0 : (isCurrentlyFast ? 0 : 500),
        daytimeTargetMl: config.fastingType === 'RAMADAN' ? 0 : (isCurrentlyFast ? 0 : 500),
        suhoorTargetMl,
        postSunsetTargetMl,
        iftarTargetMl: postSunsetTargetMl,
        totalTargetMl: totalMl,
      },
      adaptationReasonCode: ADAPT_REASON_CODES.RAMADAN_FASTING_WINDOW,
    };
  }
}

export const fastingService = new FastingService();
