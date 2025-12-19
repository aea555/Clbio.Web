
import { get, del, del_1 } from "@/lib/service-factory";
import { ReadAttachmentDto, ApiResponse, ReadTaskItemDto } from "@/types/dtos";
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
  upload: async (workspaceId: string, taskId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("Files", file);
    });

    // Backend artık tek obje değil, liste dönüyor (ReadAttachmentDto[])
    const { data } = await apiClient.post<ApiResponse<ReadAttachmentDto[]>>(
      `/api/proxy/workspaces/${workspaceId}/tasks/${taskId}/attachments`,
      formData
    );

    return data.data!;
  },

  /**
   * DELETE /api/workspaces/{workspaceId}/attachments/{attachmentId}
   */
  delete: (workspaceId: string, attachmentId: string) =>
    del_1<ReadTaskItemDto>(`/api/proxy/workspaces/${workspaceId}/attachments/${attachmentId}`),
};