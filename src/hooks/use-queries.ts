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

// --- WORKSPACES ---
export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => workspaceService.getAll(),
  });
}

export function useWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: ["workspaces", "workspaceById", workspaceId],
    queryFn: () => workspaceService.getById(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: ["workspaces", "workspace-members", workspaceId],
    queryFn: () => workspaceService.getMembers(workspaceId),
    enabled: !!workspaceId,
  });
}

// --- BOARDS ---
export function useBoards(workspaceId: string) {
  return useQuery({
    queryKey: ["boards", workspaceId],
    queryFn: () => boardService.getAll(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useBoard(workspaceId: string, boardId: string) {
  return useQuery({
    queryKey: ["boards", workspaceId, boardId],
    queryFn: () => boardService.getById(workspaceId, boardId),
    enabled: !!workspaceId && !!boardId,
  });
}

export function useBoardSearch(workspaceId: string, q?: string | null, limit?: 10){
  return useQuery({
    queryKey: ["boardSearchResults", workspaceId, q],
    queryFn: () => boardService.search(workspaceId, q, limit),
    enabled: !!workspaceId,
    staleTime: 1000 * 5
  })
}

// --- COLUMNS ---
export function useColumns(workspaceId: string, boardId: string) {
  return useQuery({
    queryKey: ["columns", boardId], // BoardId is unique enough
    queryFn: () => columnService.getAll(workspaceId, boardId),
    enabled: !!workspaceId && !!boardId,
  });
}

// --- TASKS ---
export function useTask(workspaceId: string, taskId: string) {
  return useQuery({
    queryKey: ["tasks", taskId],
    queryFn: () => taskService.getById(workspaceId, taskId),
    enabled: !!workspaceId && !!taskId,
  });
}

// --- INTERACTIONS (Comments / Attachments) ---
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

// --- NOTIFICATIONS ---
export function useNotifications(page: number = 1, pageSize: number = 10, unreadOnly: boolean = false) {
  return useQuery({
    queryKey: ["notifications", page, pageSize, unreadOnly],
    queryFn: () => notificationService.getAll(page, pageSize, unreadOnly),
    placeholderData: keepPreviousData,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 60000, // Sync every minute just in case
  });
}

// --- USERS ---
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
      // FIX: Wait for the call, then return 'true' so data is not undefined
      await presenceService.heartbeat(); 
      return true; 
    },
    // Only run if we are authenticated
    enabled: isAuthenticated,
    // Poll every 30 seconds
    refetchInterval: 30 * 1000, 
    // Do not retry on failure (if 401, the global error handler or session sync will catch it)
    retry: false, 
    // Keep running even if window is in background (to maintain presence)
    refetchIntervalInBackground: true, 
  });
}

// --- WORKSPACE AUDIT LOGS ---
export function useActivityLogs(workspaceId: string, page: number, pageSize: number = 10) {
  return useQuery({
    queryKey: ["activity-logs", workspaceId, page, pageSize],
    queryFn: () => activityLogService.getLogs(workspaceId, page, pageSize),
    enabled: !!workspaceId,
    placeholderData: keepPreviousData, // Keeps showing page 1 data while page 2 is loading
  });
}

export function useWorkspaceInvitations(){
  return useQuery({
    queryKey: ["workspaceInvitations"],
    queryFn: () => workspaceInvitationService.getMyInvitations(),
    placeholderData: keepPreviousData
  })
}