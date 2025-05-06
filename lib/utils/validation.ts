/**
 * Validation Utilities
 * Provides functions for validating user input
 */

/**
 * Validate a number is within a range
 * @param value - The value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Whether the value is valid
 */
export function validateNumberInRange(value: number, min: number, max?: number): boolean {
  if (isNaN(value)) return false;
  if (value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

/**
 * Validate a string is not empty and within a length range
 * @param value - The string to validate
 * @param minLength - Minimum length (default: 1)
 * @param maxLength - Maximum length (default: 100)
 * @returns Whether the string is valid
 */
export function validateString(value: string, minLength = 1, maxLength = 100): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length < minLength) return false;
  if (trimmed.length > maxLength) return false;
  return true;
}

/**
 * Sanitize a number input to ensure it's within range
 * @param value - The value to sanitize
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param defaultValue - Default value if invalid
 * @returns Sanitized number value
 */
export function sanitizeNumber(value: any, min: number, max?: number, defaultValue = min): number {
  // Parse the value to a number if it's a string
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if the result is a valid number
  if (isNaN(num)) return defaultValue;
  
  // Enforce min/max bounds
  if (num < min) return min;
  if (max !== undefined && num > max) return max;
  
  return num;
}

/**
 * Sanitize a string input
 * @param value - The string to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string
 */
export function sanitizeString(value: string, maxLength = 100): string {
  if (!value) return '';
  
  // Trim whitespace and limit length
  let sanitized = value.trim();
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Validate a prize configuration
 * @param name - Prize name
 * @param value - Prize value
 * @param slots - Number of slots
 * @param availableSlots - Number of available slots
 * @returns Object with validation result and error message
 */
export function validatePrizeConfig(
  name: string,
  value: number,
  slots: number,
  availableSlots: number
): { isValid: boolean; errorMessage?: string } {
  if (!validateString(name, 1, 50)) {
    return { isValid: false, errorMessage: 'Prize name is required and must be between 1-50 characters' };
  }
  
  if (!validateNumberInRange(value, 0)) {
    return { isValid: false, errorMessage: 'Prize value must be a non-negative number' };
  }
  
  if (!validateNumberInRange(slots, 1)) {
    return { isValid: false, errorMessage: 'Prize slots must be at least 1' };
  }
  
  if (slots > availableSlots) {
    return { 
      isValid: false, 
      errorMessage: `Cannot add ${slots} slots. Only ${availableSlots} slots available.` 
    };
  }
  
  return { isValid: true };
}
