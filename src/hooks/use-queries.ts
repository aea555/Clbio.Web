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

// --- WORKSPACES ---
export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => workspaceService.getAll(),
  });
}

export function useWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: ["workspaces", workspaceId],
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
export function useGetMe(query: string) {
  return useQuery({
    queryKey: ["users", "search", query],
    queryFn: () => authService.getMe(),
    enabled: !!query, 
  });
}