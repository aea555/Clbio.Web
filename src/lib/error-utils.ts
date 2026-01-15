import { AxiosError, isAxiosError } from "axios";

// Map of known technical error messages to user-friendly i18n keys
// These will be caught and returned as-is (the UI should handle them)
const TECHNICAL_ERROR_PATTERNS: Record<string, string> = {
  "Proxy Error": "Something went wrong. Please try again later.",
  "Network Error": "Network error. Please check your connection.",
  "Session Expired": "Your session has expired. Please log in again.",
  "Session Expired. Please login again.": "Your session has expired. Please log in again.",
  "ECONNREFUSED": "Cannot connect to server. Please try again later.",
  "timeout": "Request timed out. Please try again.",
  "Request failed": "Something went wrong. Please try again.",
};

// Get user-friendly message based on HTTP status code
function getHttpStatusMessage(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "Please log in to continue.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "A conflict occurred. Please refresh and try again.";
    case 422:
      return "Invalid data provided. Please check your input.";
    case 429:
      return "Too many requests. Please wait a moment.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "Server is temporarily unavailable. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// Check if an error message matches known technical patterns
function matchesTechnicalPattern(message: string): string | null {
  // Exact match check
  if (TECHNICAL_ERROR_PATTERNS[message]) {
    return TECHNICAL_ERROR_PATTERNS[message];
  }

  // Partial match check for patterns that might be embedded in longer messages
  for (const [pattern, friendlyMessage] of Object.entries(TECHNICAL_ERROR_PATTERNS)) {
    if (message.toLowerCase().includes(pattern.toLowerCase())) {
      return friendlyMessage;
    }
  }

  return null;
}

export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;

    // Network error - no response received
    if (!axiosError.response) {
      return "Network error. Please check your connection.";
    }

    const data = axiosError.response?.data;
    const status = axiosError.response?.status;

    // 1. Check if the error field exists and is a string
    if (data && typeof data.error === "string") {
      // Check if it's a known technical error pattern
      const friendlyMessage = matchesTechnicalPattern(data.error);
      if (friendlyMessage) {
        return friendlyMessage;
      }
      // Return the error as-is if it seems user-friendly (doesn't match technical patterns)
      return data.error;
    }

    // 2. Check for 'message' field
    if (data && typeof data.message === "string") {
      const friendlyMessage = matchesTechnicalPattern(data.message);
      if (friendlyMessage) {
        return friendlyMessage;
      }
      return data.message;
    }

    // 3. Check axios error message for technical patterns
    if (axiosError.message) {
      const friendlyMessage = matchesTechnicalPattern(axiosError.message);
      if (friendlyMessage) {
        return friendlyMessage;
      }
    }

    // 4. Fall back to HTTP status-based message
    if (status) {
      return getHttpStatusMessage(status);
    }

    return "Something went wrong. Please try again.";
  }

  // Non-Axios errors
  if (error instanceof Error) {
    const friendlyMessage = matchesTechnicalPattern(error.message);
    if (friendlyMessage) {
      return friendlyMessage;
    }
    return error.message;
  }

  return "Something went wrong. Please try again.";
}