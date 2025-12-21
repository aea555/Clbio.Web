import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSocketEventListener } from "./use-socket-event-listener";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { useThemeStore } from "@/store/use-theme-store";

// 1. Added "InvitationAccepted" to the type
type WorkspaceSignalType = "Invitation" | "Removal" | "Leave" | "RoleUpdate" | "InvitationAccepted";

export function useUserRealtime() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { notificationSound, notificationVolume, notificationSoundFile } = useThemeStore();
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore();

  // --- Audio Logic ---
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize the audio object only on the client side
    audioRef.current = new Audio();
  }, []);

  const playNotificationSound = () => {
    if (!audioRef.current || !notificationSound) return;

    audioRef.current.src = `/sounds/${notificationSoundFile}`;
    audioRef.current.volume = notificationVolume;
    
    audioRef.current.currentTime = 0;
    
    audioRef.current.play().catch((err) => {
      console.warn("Notification sound playback failed:", err);
    });
  };

  const handleNotificationEvent = (data: any) => {
    // 1. Play the sound effect
    playNotificationSound();

    queryClient.setQueryData(["notifications-unread-count"], (old: number | undefined) => {
      return (old || 0) + 1;
    });

    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });

    if (data && data.type !== "RemovedFromWorkspace") {
        const message = data.messageText || data.title || "New notification";
        toast.info(message);
    }
  };

  const handleWorkspaceSignal = (type: WorkspaceSignalType, data: any) => {
    console.log(`Workspace signal received [${type}]:`, data);

    // Case A: New Invitation Received
    if (type === "Invitation") {
      queryClient.invalidateQueries({ queryKey: ["workspace-invitations"] });
      handleNotificationEvent(data);
      return;
    }

    // Case B: Invitation Accepted 
    if (type === "InvitationAccepted") {
      // 2. Refresh Invitations List (Remove the pending invite)
      queryClient.invalidateQueries({ queryKey: ["workspace-invitations"] });

      // 3. Standard Notification behavior
      handleNotificationEvent(data);
      return;
    }

    // Case C: Context-Sensitive Events
    const targetWorkspaceId = data.entityId || data.workspaceId || data.WorkspaceId;

    let activeMsg = "";
    let inactiveMsg = "";
    let isError = false;

    switch (type) {
      case "Removal":
        activeMsg = "You have been removed from the active workspace.";
        inactiveMsg = `You have been removed from workspace: ${data.title || "Unknown"}`;
        isError = true;
        break;
      case "Leave":
        activeMsg = "You have left the active workspace.";
        inactiveMsg = `You have left the workspace: ${data.title || "Unknown"}`;
        break;
      case "RoleUpdate":
        activeMsg = "Your role in this workspace has been updated.";
        inactiveMsg = `Your role changed in workspace: ${data.title || "Unknown"}`;
        break;
    }

    if (activeWorkspaceId && activeWorkspaceId === targetWorkspaceId && type != "RoleUpdate") {
      setActiveWorkspaceId(null as any); 
      router.replace("/dashboard"); 
      
      queryClient.removeQueries({ queryKey: ["workspaces"] }); 
      queryClient.removeQueries({ queryKey: ["workspaceById", targetWorkspaceId] });
      queryClient.removeQueries({ queryKey: ["boards", targetWorkspaceId] });

      if (isError) toast.error(activeMsg);
      else toast.warning(activeMsg);
    } else {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast.warning(inactiveMsg);
    }
    
    handleNotificationEvent(data);
  };

  // --- Event Listeners ---
  useSocketEventListener("NotificationReceived", handleNotificationEvent);
  
  // Logic for Declined is usually just notification + invitation list refresh 
  useSocketEventListener("WorkspaceInvitationDeclined", (data) => {
    queryClient.invalidateQueries({ queryKey: ["workspaceInvitations"] });
    handleNotificationEvent(data);
  });

  // FIX: Route Accepted event to the Signal Handler
  useSocketEventListener("WorkspaceInvitationAccepted", (data) => handleWorkspaceSignal("InvitationAccepted", data));
  
  // Other Signals
  useSocketEventListener("WorkspaceInvitationReceived", (data) => handleWorkspaceSignal("Invitation", data));
  useSocketEventListener("RemovedFromWorkspace", (data) => handleWorkspaceSignal("Removal", data));
  useSocketEventListener("LeftWorkspace", (data) => handleWorkspaceSignal("Leave", data));
  useSocketEventListener("WorkspaceRoleUpdated", (data) => handleWorkspaceSignal("RoleUpdate", data));
}