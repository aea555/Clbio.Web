import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSocketEventListener } from "./use-socket-event-listener";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { toast } from "sonner";

export function useUserRealtime() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore();

  // 1. Generic Notification Handler (Updates badge & list)
  const handleNotificationEvent = (data: any) => {
    // ⚡ Optimistic Update: Increment badge count immediately
    queryClient.setQueryData(["notifications-unread-count"], (old: number | undefined) => {
      return (old || 0) + 1;
    });

    // Invalidate to fetch latest server state (eventual consistency)
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });

    // Show toast (skip for specific types if handled elsewhere, but usually good to show)
    if (data && data.type !== "RemovedFromWorkspace") {
        const message = data.messageText || data.title || "New notification";
        toast.info(message);
    }
  };

  // 2. Specific Handler for Invitations
  const handleInvitation = (data: any) => {
    // FIX: Update the sidebar workspace list so the new workspace appears immediately
    queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    
    // Also trigger the standard notification behavior (badge + toast)
    handleNotificationEvent(data);
  };

  // 3. Specific Handler for Workspace Removal
  const handleRemovedFromWorkspace = (data: any) => {
    console.log("Removed from workspace event:", data);
    
    // Extract ID (Robust handling for various casing/payload structures)
    const removedWorkspaceId = data.entityId || data.workspaceId || data.WorkspaceId;

    // Check if we are currently inside the deleted/removed workspace
    if (activeWorkspaceId && activeWorkspaceId === removedWorkspaceId) {
      // A. Clear Active Context
      setActiveWorkspaceId(null as any); 
      
      // B. Force Navigation Safety
      router.replace("/dashboard"); 
      
      // C. THE CULPRIT FIX: Hard remove the queries to prevent stale data persistence
      queryClient.removeQueries({ queryKey: ["workspaces"] }); 
      queryClient.removeQueries({ queryKey: ["workspaceById", removedWorkspaceId] });
      queryClient.removeQueries({ queryKey: ["boards", removedWorkspaceId] });

      toast.error("You have been removed from the active workspace.");
    } else {
      // If we are elsewhere, just refresh the list to remove the old workspace item
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast.warning(`You have been removed from workspace: ${data.title || "Unknown"}`);
    }
    
    // Also trigger notification update (badge/dropdown)
    handleNotificationEvent(data); 
  };

  // --- Event Listeners ---
  useSocketEventListener("ReceiveNotification", handleNotificationEvent);
  
  // FIX: Use specific handler for invitations
  useSocketEventListener("WorkspaceInvitationReceived", handleInvitation);
  
  useSocketEventListener("RoleUpdated", handleNotificationEvent);
  useSocketEventListener("RemovedFromWorkspace", handleRemovedFromWorkspace);
}