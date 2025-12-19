import { get, post, put, del } from "@/lib/service-factory";
import { CreateBoardDto, UpdateBoardDto } from "@/lib/schemas/schemas";
import { ReadBoardDto } from "@/types/dtos";

export const boardService = {
  getAll: (workspaceId: string) => 
    get<ReadBoardDto[]>(`/api/proxy/workspaces/${workspaceId}/boards`),

  getById: (workspaceId: string, boardId: string) => 
    get<ReadBoardDto>(`/api/proxy/workspaces/${workspaceId}/boards/${boardId}`),

  create: (workspaceId: string, data: CreateBoardDto) => 
    post<ReadBoardDto>(`/api/proxy/workspaces/${workspaceId}/boards`, data),

  update: (workspaceId: string, boardId: string, data: UpdateBoardDto) => 
    put<string>(`/api/proxy/workspaces/${workspaceId}/boards/${boardId}`, data), 

  delete: (workspaceId: string, boardId: string) => 
    del(`/api/proxy/workspaces/${workspaceId}/boards/${boardId}`),

  reorder: (workspaceId: string, boardIds: string[]) => 
    post<void>(`/api/proxy/workspaces/${workspaceId}/boards/reorder`, boardIds),

  search: (workspaceId: string, q?: string | null, limit?: Number | null) =>
    get<ReadBoardDto[]>(`/api/proxy/workspaces/${workspaceId}/boards/search?q=${encodeURIComponent(q || "")}&limit=${limit}`)
};