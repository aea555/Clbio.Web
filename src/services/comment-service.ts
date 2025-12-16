import { get, post, del } from "@/lib/service-factory";
import { CreateCommentDto } from "@/lib/schemas/schemas";
import { ReadCommentDto } from "@/types/dtos";

export const commentService = {
  /**
   * GET /api/workspaces/{workspaceId}/tasks/{taskId}/comments
   */
  getAll: (workspaceId: string, taskId: string) => 
    get<ReadCommentDto[]>(`/api/proxy/workspaces/${workspaceId}/tasks/${taskId}/comments`),

  /**
   * POST /api/workspaces/{workspaceId}/tasks/{taskId}/comments
   */
  create: (workspaceId: string, taskId: string, data: CreateCommentDto) => 
    post<ReadCommentDto>(`/api/proxy/workspaces/${workspaceId}/tasks/${taskId}/comments`, data),

  /**
   * DELETE /api/workspaces/{workspaceId}/comments/{commentId}
   * Note: Delete path is slightly different (not nested under tasks)
   */
  delete: (workspaceId: string, commentId: string) => 
    del(`/api/proxy/workspaces/${workspaceId}/comments/${commentId}`),
};