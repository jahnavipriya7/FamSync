export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedValue?: any;
}

/**
 * Validates member display name (2 to 30 characters, non-empty)
 */
export function validateMemberName(name: string): ValidationResult {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return { valid: false, error: 'Name cannot be empty.' };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters.' };
  }
  if (trimmed.length > 30) {
    return { valid: false, error: 'Name cannot exceed 30 characters.' };
  }
  return { valid: true, sanitizedValue: trimmed };
}

/**
 * Validates optional nickname (up to 20 characters)
 */
export function validateNickname(nickname?: string): ValidationResult {
  if (!nickname) {
    return { valid: true, sanitizedValue: '' };
  }
  const trimmed = nickname.trim();
  if (trimmed.length > 20) {
    return { valid: false, error: 'Nickname cannot exceed 20 characters.' };
  }
  return { valid: true, sanitizedValue: trimmed };
}

/**
 * Validates family group name (2 to 50 characters, non-empty)
 */
export function validateGroupName(name: string): ValidationResult {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return { valid: false, error: 'Group name cannot be empty.' };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: 'Group name must be at least 2 characters.' };
  }
  if (trimmed.length > 50) {
    return { valid: false, error: 'Group name cannot exceed 50 characters.' };
  }
  return { valid: true, sanitizedValue: trimmed };
}

/**
 * Validates route title (2 to 60 characters, non-empty)
 */
export function validateRouteName(title: string): ValidationResult {
  const trimmed = (title || '').trim();
  if (!trimmed) {
    return { valid: false, error: 'Route name cannot be empty.' };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: 'Route name must be at least 2 characters.' };
  }
  if (trimmed.length > 60) {
    return { valid: false, error: 'Route name cannot exceed 60 characters.' };
  }
  return { valid: true, sanitizedValue: trimmed };
}

/**
 * Validates start/end location names (2 to 50 characters)
 */
export function validateLocation(location: string, fieldName: string = 'Location'): ValidationResult {
  const trimmed = (location || '').trim();
  if (!trimmed) {
    return { valid: false, error: `${fieldName} cannot be empty.` };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: `${fieldName} must be at least 2 characters.` };
  }
  if (trimmed.length > 50) {
    return { valid: false, error: `${fieldName} cannot exceed 50 characters.` };
  }
  return { valid: true, sanitizedValue: trimmed };
}

/**
 * Validates route distance (positive number, max 50,000 km)
 */
export function validateDistanceKm(distance: number | string): ValidationResult {
  const num = typeof distance === 'string' ? parseFloat(distance) : distance;
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: 'Distance must be a positive number greater than 0.' };
  }
  if (num > 50000) {
    return { valid: false, error: 'Distance cannot exceed 50,000 km.' };
  }
  return { valid: true, sanitizedValue: num };
}

/**
 * Validates landmark fun fact (max 250 characters)
 */
export function validateLandmarkFact(fact: string): ValidationResult {
  const trimmed = (fact || '').trim();
  if (trimmed.length > 250) {
    return { valid: false, error: 'Fun fact cannot exceed 250 characters.' };
  }
  return { valid: true, sanitizedValue: trimmed };
}
