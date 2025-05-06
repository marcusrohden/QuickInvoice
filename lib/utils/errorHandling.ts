/**
 * Error Handling Utilities
 * Functions for consistent error handling
 */

/**
 * Type for structured error response
 */
export interface ErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Create a standardized error response
 * @param message - Error message
 * @param code - Optional error code
 * @param details - Optional error details
 * @returns Structured error response
 */
export function createErrorResponse(message: string, code?: string, details?: unknown): ErrorResponse {
  return {
    message,
    code,
    details
  };
}

/**
 * Handle errors consistently
 * @param error - The error to handle
 * @returns Structured error response
 */
export function handleError(error: unknown): ErrorResponse {
  // If it's already our error type, return it
  if (error && typeof error === 'object' && 'message' in error) {
    return createErrorResponse(
      error.message as string,
      'code' in error ? error.code as string : 'UNKNOWN_ERROR',
      'details' in error ? error.details : undefined
    );
  }
  
  // For generic errors
  return createErrorResponse(
    error instanceof Error ? error.message : 'An unknown error occurred',
    'UNKNOWN_ERROR'
  );
}

/**
 * Try to execute a function and handle any errors
 * @param fn - Function to execute
 * @returns Result of the function or error response
 */
export async function tryCatch<T>(fn: () => Promise<T>): Promise<T | ErrorResponse> {
  try {
    return await fn();
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Check if a result is an error response
 * @param result - Result to check
 * @returns Whether the result is an error
 */
export function isErrorResponse(result: unknown): result is ErrorResponse {
  return (
    result !== null &&
    typeof result === 'object' &&
    'message' in result
  );
}
