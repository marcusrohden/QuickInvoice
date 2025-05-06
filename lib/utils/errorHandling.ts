/**
 * Error Handling Utilities
 * Provides standardized error handling functions
 */

/**
 * Custom error with additional properties for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  errorCode?: string;
  
  constructor(message: string, statusCode: number, errorCode?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    
    // Ensure instanceof works correctly in ES5
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Log an error with standardized format
 * @param error - The error to log
 * @param context - Additional context information
 */
export function logError(error: unknown, context?: string): void {
  if (error instanceof ApiError) {
    console.error(
      `API Error [${error.statusCode}]${error.errorCode ? ` (${error.errorCode})` : ''}: ` +
      `${error.message}${context ? ` | Context: ${context}` : ''}`
    );
  } else if (error instanceof Error) {
    console.error(
      `Error [${error.name}]: ${error.message}${context ? ` | Context: ${context}` : ''}`
    );
  } else {
    console.error(`Unknown error: ${String(error)}${context ? ` | Context: ${context}` : ''}`);
  }
}

/**
 * Safely handle API responses
 * @param response - The fetch response
 * @param errorMessage - Custom error message
 * @returns The parsed JSON response
 * @throws ApiError if response is not OK
 */
export async function handleApiResponse<T>(response: Response, errorMessage?: string): Promise<T> {
  if (!response.ok) {
    let errorText: string;
    try {
      const errorData = await response.json();
      errorText = errorData.message || errorData.error || String(errorData);
    } catch (e) {
      errorText = errorMessage || `API request failed with status ${response.status}`;
    }
    
    throw new ApiError(errorText, response.status);
  }
  
  return await response.json() as T;
}

/**
 * Create a safe API request wrapper
 * @param apiFunc - Async function that makes the API request
 * @param errorHandler - Function to handle errors
 * @returns A wrapped function that handles errors
 */
export function createSafeApiRequest<T, Args extends any[]>(
  apiFunc: (...args: Args) => Promise<T>,
  errorHandler?: (error: unknown) => void
): (...args: Args) => Promise<T | null> {
  return async (...args: Args) => {
    try {
      return await apiFunc(...args);
    } catch (error) {
      logError(error, `API request failed: ${apiFunc.name}`);
      
      if (errorHandler) {
        errorHandler(error);
      }
      
      return null;
    }
  };
}

/**
 * Parse an API error into a user-friendly message
 * @param error - The error to parse
 * @returns User-friendly error message
 */
export function parseErrorForUser(error: unknown): string {
  if (error instanceof ApiError) {
    // Map specific status codes to user-friendly messages
    if (error.statusCode === 401 || error.statusCode === 403) {
      return 'You need to be logged in to perform this action. Please sign in and try again.';
    } else if (error.statusCode === 404) {
      return 'The requested resource was not found. Please check your input and try again.';
    } else if (error.statusCode === 429) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    
    // Return the error message from the API if available
    return error.message || 'An error occurred while communicating with the server.';
  } else if (error instanceof Error) {
    // For network errors or other general errors
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return 'Could not connect to the server. Please check your internet connection and try again.';
    }
    
    return error.message;
  }
  
  // Fallback for unknown errors
  return 'An unexpected error occurred. Please try again later.';
}
