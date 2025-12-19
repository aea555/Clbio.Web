import { useWorkspace } from "@/hooks/use-queries";
import { WorkspaceStatus } from "@/types/dtos";

export function useWorkspacePermissions(workspaceId: string) {
  const { data: workspace, isLoading } = useWorkspace(workspaceId);
  
  const isArchived = workspace?.status === WorkspaceStatus.Archived;

  return {
    isLoading,
    isArchived,
    canEdit: !isArchived, 
    
    canDeleteWorkspace: true, 
    canUnarchiveWorkspace: isArchived,
    canRemoveMember: true, // Specifically allowed
    canInviteMember: !isArchived, // Invite is NOT allowed
  };
}