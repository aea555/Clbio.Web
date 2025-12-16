
import { get, del } from "@/lib/service-factory";
import { ReadAttachmentDto, ApiResponse } from "@/types/dtos";
import { apiClient } from "@/lib/axios-client";

export const attachmentService = {
  /**
   * GET /api/workspaces/{workspaceId}/tasks/{taskId}/attachments
   */
  getAll: (workspaceId: string, taskId: string) => 
    get<ReadAttachmentDto[]>(`/api/proxy/workspaces/${workspaceId}/tasks/${taskId}/attachments`),

  /**
   * POST /api/workspaces/{workspaceId}/tasks/{taskId}/attachments
   */
  upload: async (workspaceId: string, taskId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post<ApiResponse<ReadAttachmentDto>>(
      `/api/proxy/workspaces/${workspaceId}/tasks/${taskId}/attachments`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return data.data!;
  },

  /**
   * DELETE /api/workspaces/{workspaceId}/attachments/{attachmentId}
   */
  delete: (workspaceId: string, attachmentId: string) => 
    del(`/api/proxy/workspaces/${workspaceId}/attachments/${attachmentId}`),
};