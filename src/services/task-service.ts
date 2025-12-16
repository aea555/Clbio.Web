import { get, post, put, del } from "@/lib/service-factory";
import { CreateTaskItemDto, UpdateTaskItemDto, MoveTaskItemDto } from "@/lib/schemas/schemas";
import { ReadTaskItemDto } from "@/types/dtos";

export const taskService = {
  /**
   * GET /api/workspaces/{workspaceId}/tasks/{taskId}
   */
  getById: (workspaceId: string, taskId: string) => 
    get<ReadTaskItemDto>(`/api/proxy/workspaces/${workspaceId}/tasks/${taskId}`),

  /**
   * POST /api/workspaces/{workspaceId}/columns/{columnId}/tasks
   * Note: Creation is scoped to a Column
   */
  create: (workspaceId: string, columnId: string, data: CreateTaskItemDto) => 
    post<ReadTaskItemDto>(`/api/proxy/workspaces/${workspaceId}/columns/${columnId}/tasks`, data),

  /**
   * PUT /api/workspaces/{workspaceId}/tasks/{taskId}
   */
  update: (workspaceId: string, taskId: string, data: UpdateTaskItemDto) => 
    put<ReadTaskItemDto>(`/api/proxy/workspaces/${workspaceId}/tasks/${taskId}`, data),

  /**
   * DELETE /api/workspaces/{workspaceId}/tasks/{taskId}
   */
  delete: (workspaceId: string, taskId: string) => 
    del(`/api/proxy/workspaces/${workspaceId}/tasks/${taskId}`),

  /**
   * POST /api/workspaces/{workspaceId}/tasks/{taskId}/move
   */
  move: (workspaceId: string, taskId: string, data: MoveTaskItemDto) => 
    post<void>(`/api/proxy/workspaces/${workspaceId}/tasks/${taskId}/move`, data),
};