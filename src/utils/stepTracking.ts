import { StepEntry } from '../types/stepRace';

export interface AntiCheatResult {
  valid: boolean;
  reason?: string;
  sanitizedSteps: number;
}

/**
 * Validates step additions against basic anti-cheat rules:
 * 1. Checks steps rate (rejects if > 150 steps/minute since last sync).
 * 2. Capped maximum single increment for manual entries (max 5,000 steps).
 * 3. Flagging manual entries.
 */
export function validateStepEntry(
  newSteps: number,
  lastSyncTimestamp?: string,
  isManual: boolean = false,
  currentTimestamp?: string
): AntiCheatResult {
  if (newSteps <= 0) {
    return { valid: false, reason: 'Steps must be greater than 0', sanitizedSteps: 0 };
  }

  // Maximum allowed steps in a single manual entry is 5,000 to prevent typing 50,000
  if (isManual && newSteps > 5000) {
    return { 
      valid: false, 
      reason: 'Manual entries are capped at 5,000 steps per log to ensure fair play.', 
      sanitizedSteps: 0 
    };
  }

  // If last sync timestamp is known, calculate rate
  if (lastSyncTimestamp) {
    const lastTime = new Date(lastSyncTimestamp).getTime();
    const now = currentTimestamp ? new Date(currentTimestamp).getTime() : Date.now();
    const diffSeconds = Math.max(1, (now - lastTime) / 1000);
    const diffMinutes = diffSeconds / 60;

    // Plausible human maximum is ~150-180 steps per minute during intense sprinting
    const MAX_STEPS_PER_MINUTE = 150;
    const maxPlausibleSteps = Math.max(300, Math.round(diffMinutes * MAX_STEPS_PER_MINUTE));

    if (newSteps > maxPlausibleSteps && !isManual) {
      return {
        valid: false,
        reason: `Rate of ${Math.round(newSteps / Math.max(0.1, diffMinutes))} steps/min exceeds plausible human limit (150 steps/min). Step jump rejected.`,
        sanitizedSteps: 0
      };
    }
  }

  return { valid: true, sanitizedSteps: newSteps };
}

/**
 * Applies active multipliers:
 * - Counterattack (Steal the Lead): 1.5x
 * - Walk-and-Talk: 1.2x
 */
export function applyStepMultipliers(
  rawSteps: number,
  isCounterattackActive: boolean,
  isWalkAndTalkActive: boolean
): { effectiveSteps: number; multiplierDescription?: string } {
  let multiplier = 1.0;
  const parts: string[] = [];

  if (isCounterattackActive) {
    multiplier *= 1.5;
    parts.push('⚡ 1.5x Counterattack');
  }

  if (isWalkAndTalkActive) {
    multiplier *= 1.2;
    parts.push('🤝 1.2x Walk & Talk');
  }

  const effectiveSteps = Math.round(rawSteps * multiplier);
  const multiplierDescription = parts.length > 0 ? parts.join(' + ') : undefined;

  return { effectiveSteps, multiplierDescription };
}

/**
 * Browser Pedometer / Accelerometer detector.
 * Checks for GenericSensor API or DeviceMotionEvent support.
 */
export function checkDevicePedometerSupport(): { supported: boolean; method: string } {
  if (typeof window === 'undefined') {
    return { supported: false, method: 'none' };
  }

  if ('DeviceMotionEvent' in window) {
    return { supported: true, method: 'DeviceMotionEvent' };
  }

  return { supported: false, method: 'manual-only' };
}

/**
 * Deduplicates step entries by ID or exact timestamp.
 */
export function isDuplicateStepSubmission(existingEntries: StepEntry[], newEntryId: string, timestamp: string): boolean {
  return existingEntries.some(e => e.id === newEntryId || e.timestamp === timestamp);
}
