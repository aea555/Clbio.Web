import { ApiResponse } from "@/types/dtos";
import { AxiosError, AxiosResponse } from "axios";

export function getErrorMessage(error: AxiosError<ApiResponse>): string {
  if (!error.response) {
    return "Network error. Please check your connection.";
  }

  const data = error.response?.data;

  if (data && typeof data.error === "string") {
    return data.error;
  }

  // 5. Fallback to HTTP Status Text (e.g., "Bad Request")
  return data.code || "An unexpected error occurred.";
}