import { useQuery } from "@tanstack/react-query";
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

// --- WORKSPACES ---
export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => workspaceService.getAll(),
  });
}

export function useWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: ["workspaceById", workspaceId],
    queryFn: () => workspaceService.getById(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: () => workspaceService.getMembers(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useActivityLogs(workspaceId: string) {
  return useQuery({
    queryKey: ["activity-logs", workspaceId],
    queryFn: () => activityLogService.getAll(workspaceId),
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
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getAll(),
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