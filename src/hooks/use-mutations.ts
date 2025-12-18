import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "@/services/task-service";
import { toast } from "sonner";
import { attachmentService } from "@/services/attachment-service";
import { commentService } from "@/services/comment-service";
import { workspaceService } from "@/services/workspace-service";
import { boardService } from "@/services/board-service";
import { columnService } from "@/services/column-service";
import { authService } from "@/services/auth-service";
import { getErrorMessage } from "@/lib/error-utils";
import { useAuthStore } from "@/store/use-auth-store";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { notificationService } from "@/services/notification-service";

export function useWorkspaceMutations() {
  const queryClient = useQueryClient();

  const createWorkspace = useMutation({
    mutationFn: workspaceService.create,
    onSuccess: (newWorkspace) => {
      console.log("Create Workspace Response:", newWorkspace);
      queryClient.setQueryData(["workspaces"], (oldData: any) => {
        const currentList = Array.isArray(oldData) ? oldData : [];
        if (currentList.find((w: any) => w.id === newWorkspace?.id)) {
          return currentList;
        }
        return [...currentList, newWorkspace];
      });
      toast.success("Workspace created successfully");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const updateWorkspace = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      workspaceService.update(id, data),
    onSuccess: (updatedWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ["workspaceById", updatedWorkspace?.id] });
      toast.success("Workspace updated");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const deleteWorkspace = useMutation({
    mutationFn: workspaceService.delete,
    onSuccess: (works) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspaceById"] });
      toast.success("Workspace deleted");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  // --- Members ---
  const inviteMember = useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: any }) =>
      workspaceService.inviteMember(workspaceId, data),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspaceById"] });
      toast.success("Member invited");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const removeMember = useMutation({
    mutationFn: ({ workspaceId, userId }: { workspaceId: string; userId: string }) =>
      workspaceService.removeMember(workspaceId, userId),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspaceById"] });
      toast.success("Member removed");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const archiveWorkspace = useMutation({
    mutationFn: workspaceService.archive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspaceById"] });
      toast.success("Workspace archived successfully");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const unarchiveWorkspace = useMutation({
    mutationFn: workspaceService.unarchive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspaceById"] });
      toast.success("Workspace unarchived successfully");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  return { createWorkspace, updateWorkspace, deleteWorkspace, inviteMember, removeMember, archiveWorkspace, unarchiveWorkspace };
}

// ============================================================================
// BOARD MUTATIONS
// ============================================================================
export function useBoardMutations(workspaceId: string) {
  const queryClient = useQueryClient();

  const createBoard = useMutation({
    mutationFn: (data: any) => boardService.create(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", workspaceId] });
      toast.success("Board created");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const updateBoard = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      boardService.update(workspaceId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", workspaceId] });
      toast.success("Board updated");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const deleteBoard = useMutation({
    mutationFn: (id: string) => boardService.delete(workspaceId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", workspaceId] });
      toast.success("Board deleted");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  // ⚡ Optimistic Reorder
  const reorderBoards = useMutation({
    mutationFn: (boardIds: string[]) => boardService.reorder(workspaceId, boardIds),
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ["boards", workspaceId] });
      const previous = queryClient.getQueryData(["boards", workspaceId]);

      queryClient.setQueryData(["boards", workspaceId], (old: any[]) => {
        if (!old) return [];
        return [...old].sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
      });

      return { previous };
    },
    onError: (error, __, context) => {
      if (context?.previous) queryClient.setQueryData(["boards", workspaceId], context.previous);
      toast.error(getErrorMessage(error));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["boards", workspaceId] }),
  });

  return { createBoard, updateBoard, deleteBoard, reorderBoards };
}

// ============================================================================
// COLUMN MUTATIONS
// ============================================================================
export function useColumnMutations(workspaceId: string, boardId: string) {
  const queryClient = useQueryClient();

  const createColumn = useMutation({
    mutationFn: (data: any) => columnService.create(workspaceId, boardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
      toast.success("Column created");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const updateColumn = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      columnService.update(workspaceId, boardId, id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["columns", boardId] }),
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const deleteColumn = useMutation({
    mutationFn: (id: string) => columnService.delete(workspaceId, boardId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
      toast.success("Column deleted");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  // Optimistic Reorder
  const reorderColumns = useMutation({
    mutationFn: (columnIds: string[]) => columnService.reorder(workspaceId, boardId, columnIds),
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ["columns", boardId] });
      const previous = queryClient.getQueryData(["columns", boardId]);

      queryClient.setQueryData(["columns", boardId], (old: any[]) => {
        if (!old) return [];
        return [...old].sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
      });

      return { previous };
    },
    onError: (error, __, context) => {
      if (context?.previous) queryClient.setQueryData(["columns", boardId], context.previous);
      toast.error(getErrorMessage(error));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["columns", boardId] }),
  });

  return { createColumn, updateColumn, deleteColumn, reorderColumns };
}

// ============================================================================
// TASK MUTATIONS
// ============================================================================
export function useTaskMutations(workspaceId: string) {
  const queryClient = useQueryClient();

  const createTask = useMutation({
    mutationFn: ({ columnId, data }: { columnId: string; data: any }) =>
      taskService.create(workspaceId, columnId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns"] });
      toast.success("Task created");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      taskService.update(workspaceId, id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(["tasks", data?.id], data);
      queryClient.invalidateQueries({ queryKey: ["columns"] });
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => taskService.delete(workspaceId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns"] });
      toast.success("Task deleted");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  // Optimistic Move
  const moveTask = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: any }) =>
      taskService.move(workspaceId, taskId, data),

    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["columns"] });
      const previousColumns = queryClient.getQueryData(["columns"]);

      queryClient.setQueriesData({ queryKey: ["columns"] }, (old: any[] | undefined) => {
        if (!old) return [];
        const newCols = JSON.parse(JSON.stringify(old));

        const sourceCol = newCols.find((c: any) => c.items.some((t: any) => t.id === taskId));
        const targetCol = newCols.find((c: any) => c.id === data.targetColumnId);

        if (!sourceCol || !targetCol) return old;

        const taskIdx = sourceCol.items.findIndex((t: any) => t.id === taskId);
        const [task] = sourceCol.items.splice(taskIdx, 1);

        task.position = data.newPosition;
        targetCol.items.splice(data.newPosition, 0, task);

        return newCols;
      });

      return { previousColumns };
    },
    onError: (error, __, ctx) => {
      if (ctx?.previousColumns) queryClient.setQueryData(["columns"], ctx.previousColumns);
      toast.error(getErrorMessage(error));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["columns"] }),
  });

  return { createTask, updateTask, deleteTask, moveTask };
}

// ============================================================================
// INTERACTION MUTATIONS
// ============================================================================
export function useInteractionMutations(workspaceId: string) {
  const queryClient = useQueryClient();

  const createComment = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: any }) =>
      commentService.create(workspaceId, taskId, data),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: string) => commentService.delete(workspaceId, commentId),
    onSuccess: (_, commentId) => {
      // Invalidation strategy handled elsewhere or via SignalR
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const uploadAttachment = useMutation({
    mutationFn: ({ taskId, file }: { taskId: string; file: File }) =>
      attachmentService.upload(workspaceId, taskId, file),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["attachments", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
      toast.success("File uploaded");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const deleteAttachment = useMutation({
    mutationFn: (attachmentId: string) => attachmentService.delete(workspaceId, attachmentId),
    onSuccess: () => toast.success("Attachment deleted"),
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  return { createComment, deleteComment, uploadAttachment, deleteAttachment };
}

export function useAuthMutations() {
  const { logout: clearAuthStore } = useAuthStore();
  const { clear: clearWorkspaceStore } = useWorkspaceStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearAuthStore();
      clearWorkspaceStore();
      queryClient.clear();
      router.replace("/auth/login");
      toast.success("Logged out successfully");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authService.resetPassword,
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const verifyEmailMutation = useMutation({
    mutationFn: authService.verifyEmail,
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const resendVerificationMutation = useMutation({
    mutationFn: authService.resendVerification,
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  return {
    loginMutation,
    logoutMutation,
    registerMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
    verifyEmailMutation,
    resendVerificationMutation
  };
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.setQueryData(["notifications-unread-count"], 0);
      toast.success("All notifications marked as read");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: notificationService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  return { 
    markAsReadMutation, 
    markAllReadMutation,
    deleteNotificationMutation
  };
}