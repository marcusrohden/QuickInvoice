/**
 * Validation Utilities
 * Functions for validating user inputs
 */

/**
 * Validate that a number is positive
 * @param value - The value to validate
 * @param fieldName - Name of the field for error message
 * @throws Error if validation fails
 */
export function validatePositiveNumber(value: number, fieldName: string): void {
  if (isNaN(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive number`);
  }
}

/**
 * Validate that a number is in a specific range
 * @param value - The value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param fieldName - Name of the field for error message
 * @throws Error if validation fails
 */
export function validateNumberInRange(value: number, min: number, max: number, fieldName: string): void {
  if (isNaN(value) || value < min || value > max) {
    throw new Error(`${fieldName} must be between ${min} and ${max}`);
  }
}

/**
 * Validate that a string is not empty
 * @param value - The string to validate
 * @param fieldName - Name of the field for error message
 * @throws Error if validation fails
 */
export function validateNotEmpty(value: string, fieldName: string): void {
  if (!value || value.trim() === '') {
    throw new Error(`${fieldName} cannot be empty`);
  }
}

/**
 * Validate that slots don't exceed available slots
 * @param slots - The number of slots to allocate
 * @param availableSlots - The number of available slots
 * @throws Error if validation fails
 */
export function validateSlots(slots: number, availableSlots: number): void {
  if (slots > availableSlots) {
    throw new Error(`Cannot allocate more than ${availableSlots} slots`);
  }
}
