import { apiClient } from "@/lib/axios-client";
import { ActivityLogDto, PaginatedResult, ApiResponse } from "@/types/dtos";

export const activityLogService = {
  getLogs: async (workspaceId: string, page: number = 1, pageSize: number = 20) => {
    const response = await apiClient.get<ApiResponse<PaginatedResult<ActivityLogDto>>>(
      `/api/proxy/workspaces/${workspaceId}/activity-logs`,
      {
        params: { page, pageSize },
      }
    );
    // Unwrap the generic ApiResponse to return the PaginatedResult (items + meta)
    return response.data.data;
  },
};