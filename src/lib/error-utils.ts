import { ApiResponse } from "@/types/dtos";
import { AxiosError, isAxiosError } from "axios";

export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    
    if (!axiosError.response) {
      return "Network error. Please check your connection.";
    }

    const data = axiosError.response?.data;

    // 1. Check for specific string error field
    if (data && typeof data.error === "string") {
      return data.error;
    }
    
    // 2. Check for 'message' field (common convention)
    if (data && typeof data.message === "string") {
        return data.message;
    }

    // 3. Check for specific code field
    if (data && data.code) {
        return String(data.code);
    }
    
    return axiosError.message || "An unexpected error occurred.";
  }

  // Fallback for non-Axios errors
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}