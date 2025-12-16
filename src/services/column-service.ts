import { get, post, put, del } from "@/lib/service-factory";
import { CreateColumnDto, UpdateColumnDto } from "@/lib/schemas/schemas";
import { ReadColumnDto } from "@/types/dtos";

export const columnService = {
  /**
   * GET /api/workspaces/{workspaceId}/boards/{boardId}/columns
   */
  getAll: (workspaceId: string, boardId: string) => 
    get<ReadColumnDto[]>(`/api/proxy/workspaces/${workspaceId}/boards/${boardId}/columns`),

  /**
   * POST /api/workspaces/{workspaceId}/boards/{boardId}/columns
   */
  create: (workspaceId: string, boardId: string, data: CreateColumnDto) => 
    post<ReadColumnDto>(`/api/proxy/workspaces/${workspaceId}/boards/${boardId}/columns`, data),

  /**
   * PUT /api/workspaces/{workspaceId}/boards/{boardId}/columns/{columnId}
   */
  update: (workspaceId: string, boardId: string, columnId: string, data: UpdateColumnDto) => 
    put<ReadColumnDto>(`/api/proxy/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}`, data),

  /**
   * DELETE /api/workspaces/{workspaceId}/boards/{boardId}/columns/{columnId}
   */
  delete: (workspaceId: string, boardId: string, columnId: string) => 
    del(`/api/proxy/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}`),

  /**
   * POST /api/workspaces/{workspaceId}/boards/{boardId}/columns/reorder
   */
  reorder: (workspaceId: string, boardId: string, columnOrder: string[]) => 
    post<void>(`/api/proxy/workspaces/${workspaceId}/boards/${boardId}/columns/reorder`, columnOrder),
};