import { useQueryClient } from "@tanstack/react-query";
import { useSocketEventListener } from "./use-socket-event-listener";
import { ReadNotificationDto } from "@/types/dtos";
import { toast } from "sonner"; 

export function useUserRealtime() {
  const queryClient = useQueryClient();

  // 1. Notifications
  useSocketEventListener("ReceiveNotification", (notification: ReadNotificationDto) => {
    // Show a popup toast
    toast.info(notification.title, {
        description: notification.messageText,
    });

    // Refresh notification list
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  });

  // 2. Presence (User came online/offline)
  useSocketEventListener("ReceivePresenceUpdate", (userId: string, isOnline: boolean) => {
    // Optimistically update any "Member List" currently visible
    queryClient.setQueriesData({ queryKey: ["workspace-members"] }, (oldData: any) => {
        if (!oldData) return oldData;
        // Logic to toggle the 'isOnline' flag in your list
        return oldData.map((member: any) => 
            member.userId === userId ? { ...member, isOnline } : member
        );
    });
  });
}