import { get } from "@/lib/service-factory";
import { ReadActivityLogDto } from "@/types/dtos";

export const activityLogService = {
  /**
   * GET /api/workspaces/{workspaceId}/activity-logs
   */
  getAll: (workspaceId: string) => 
    get<ReadActivityLogDto[]>(`/api/proxy/workspaces/${workspaceId}/activity-logs`),
};