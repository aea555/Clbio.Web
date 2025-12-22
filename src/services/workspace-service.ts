import { get, post, put, del } from "@/lib/service-factory";
import { 
  CreateWorkspaceDto, 
  UpdateWorkspaceDto,
  UpdateWorkspaceMemberDto
} from "@/lib/schemas/schemas";
import { ReadWorkspaceDto, ReadWorkspaceMemberDto } from "@/types/dtos";

export const workspaceService = {
  getAll: () => 
    get<ReadWorkspaceDto[]>("/api/proxy/workspaces"),

  getById: (id: string) => 
    get<ReadWorkspaceDto>(`/api/proxy/workspaces/${id}`),

  create: (data: CreateWorkspaceDto) => 
    post<ReadWorkspaceDto>("/api/proxy/workspaces", data),

  update: (id: string, data: UpdateWorkspaceDto) => 
    put<ReadWorkspaceDto>(`/api/proxy/workspaces/${id}`, data),

  archive: (id: string,) =>
    post<void>(`/api/proxy/workspaces/${id}/archive`, {}),

  unarchive: (id: string,) =>
    post<void>(`/api/proxy/workspaces/${id}/unarchive`, {}),

  delete: (id: string) => 
    del(`/api/proxy/workspaces/${id}`),

  // --- MEMBERS ---

  getMyWorkspaceMembership: (workspaceId: string) => 
    get<ReadWorkspaceMemberDto>(`/api/proxy/workspaces/${workspaceId}/members/me`),

  getMembers: (workspaceId: string) => 
    get<ReadWorkspaceMemberDto[]>(`/api/proxy/workspaces/${workspaceId}/members`),

  removeMember: (workspaceId: string, userId: string) => 
    del(`/api/proxy/workspaces/${workspaceId}/members/${userId}`),

  leave: (workspaceId: string) => 
    del(`/api/proxy/workspaces/${workspaceId}/members/me`),

  updateMemberRole: (workspaceId: string, userId: string, data: UpdateWorkspaceMemberDto) => 
    put<void>(`/api/proxy/workspaces/${workspaceId}/members/${userId}`, data),
};