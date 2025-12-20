import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { workspaceService } from "@/services/workspace-service";
import { boardService } from "@/services/board-service";
import { columnService } from "@/services/column-service";
import { taskService } from "@/services/task-service";
import { commentService } from "@/services/comment-service";
import { attachmentService } from "@/services/attachment-service";
import { notificationService } from "@/services/notification-service";
import { activityLogService } from "@/services/activity-log-service";
import { authService } from "@/services/auth-service";
import { presenceService } from "@/services/presence-service";
import { workspaceInvitationService } from "@/services/workspace-invitation-service";

// ============================================================================
// WORKSPACES
// ============================================================================
export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => workspaceService.getAll(),
  });
}

export function useWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: ["workspaces", "detail", workspaceId],
    queryFn: () => workspaceService.getById(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: ["workspaces", "members", workspaceId],
    queryFn: () => workspaceService.getMembers(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useWorkspaceInvitations(){
  return useQuery({
    queryKey: ["workspace-invitations"],
    queryFn: () => workspaceInvitationService.getMyInvitations(),
    placeholderData: keepPreviousData
  });
}

// ============================================================================
// BOARDS
// ============================================================================
export function useBoards(workspaceId: string) {
  return useQuery({
    queryKey: ["boards", workspaceId],
    queryFn: () => boardService.getAll(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useBoard(workspaceId: string, boardId: string) {
  return useQuery({
    queryKey: ["boards", "detail", boardId],
    queryFn: () => boardService.getById(workspaceId, boardId),
    enabled: !!workspaceId && !!boardId,
  });
}

export function useBoardSearch(workspaceId: string, q?: string | null, limit?: 10){
  return useQuery({
    queryKey: ["boards", "search", workspaceId, q],
    queryFn: () => boardService.search(workspaceId, q, limit),
    enabled: !!workspaceId,
    staleTime: 1000 * 5 // Keep search results fresh for 5 seconds
  });
}

// ============================================================================
// COLUMNS
// ============================================================================
export function useColumns(workspaceId: string, boardId: string) {
  return useQuery({
    queryKey: ["columns", boardId], 
    queryFn: () => columnService.getAll(workspaceId, boardId),
    enabled: !!workspaceId && !!boardId,
  });
}

// ============================================================================
// TASKS
// ============================================================================

// Fetch a single task details (for modals/pages)
export function useTask(workspaceId: string, taskId: string) {
  return useQuery({
    queryKey: ["tasks", "detail", taskId],
    queryFn: () => taskService.getById(workspaceId, taskId),
    enabled: !!workspaceId && !!taskId,
  });
}

// Fetch all tasks for a specific board (for the Kanban view)
export function useBoardTasks(workspaceId: string, boardId: string) {
  return useQuery({
    queryKey: ["tasks", "board", boardId],
    queryFn: () => taskService.getByBoard(workspaceId, boardId),
    enabled: !!workspaceId && !!boardId
  });
}

// ============================================================================
// INTERACTIONS (Comments / Attachments)
// ============================================================================
export function useComments(workspaceId: string, taskId: string) {
  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => commentService.getAll(workspaceId, taskId),
    enabled: !!workspaceId && !!taskId,
  });
}

export function useAttachments(workspaceId: string, taskId: string) {
  return useQuery({
    queryKey: ["attachments", taskId],
    queryFn: () => attachmentService.getAll(workspaceId, taskId),
    enabled: !!workspaceId && !!taskId,
  });
}

// ============================================================================
// NOTIFICATIONS & LOGS
// ============================================================================
export function useNotifications(page: number = 1, pageSize: number = 10, unreadOnly: boolean = false) {
  return useQuery({
    queryKey: ["notifications", page, pageSize, unreadOnly],
    queryFn: () => notificationService.getAll(page, pageSize, unreadOnly),
    placeholderData: keepPreviousData,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 60000, 
  });
}

export function useActivityLogs(workspaceId: string, page: number, pageSize: number = 10) {
  return useQuery({
    queryKey: ["activity-logs", workspaceId, page, pageSize],
    queryFn: () => activityLogService.getLogs(workspaceId, page, pageSize),
    enabled: !!workspaceId,
    placeholderData: keepPreviousData, 
  });
}

// ============================================================================
// USER & SYSTEM
// ============================================================================
export function useGetMe() {
  return useQuery({
    queryKey: ["me"], 
    queryFn: () => authService.getMe(),
    retry: 1, 
    staleTime: 1000 * 60 * 5, 
  });
}

export function usePresenceHeartbeat(isAuthenticated: boolean) {
  return useQuery({
    queryKey: ["presence-heartbeat"],
    queryFn: async () => {
      await presenceService.heartbeat(); 
      return true; 
    },
    enabled: isAuthenticated,
    refetchInterval: 30 * 1000, 
    retry: false, 
    refetchIntervalInBackground: true, 
  });
}

export function useOnlinePresence(userIds: string[]) {
  // Create a stable key so React Query doesn't refetch just because the array reference changed
  // We sort them so the order doesn't affect the cache key
  const stableKey = [...userIds].sort().join(",");

  return useQuery({
    queryKey: ["presence", stableKey], 
    queryFn: () => presenceService.check(userIds),
    
    // Polling Interval: 10 seconds
    refetchInterval: 10000, 
    
    // Only run if we have users to check
    enabled: userIds.length > 0, 
    
    // Keep data fresh-ish but allow background updates
    staleTime: 5000, 
  });
}