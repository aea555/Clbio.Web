import { CreateWorkspaceInvitationDto } from "@/lib/schemas/schemas";
import { get, post } from "@/lib/service-factory";
import { PaginatedResult, ReadWorkspaceInvitationDto } from "@/types/dtos";

export const workspaceInvitationService = {
    getMyInvitations: () => 
        get<PaginatedResult<ReadWorkspaceInvitationDto>>(`/api/proxy/invitations/my`),

    sendInvitation: (workspaceId: string, data: CreateWorkspaceInvitationDto) =>
        post<void>(`/api/proxy/workspaces/${workspaceId}/invitations`, data),

    respondToInvitation: (invitationId: string, accept: boolean) => 
        post<void>(`/api/proxy/invitations/${invitationId}/respond?accept=${accept}`, {})
};