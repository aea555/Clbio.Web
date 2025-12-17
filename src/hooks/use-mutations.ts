import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "@/services/task-service";
import { MoveTaskItemDto } from "@/lib/schemas/schemas";
import { ReadColumnDto } from "@/types/dtos";
import { toast } from "sonner";
import { attachmentService } from "@/services/attachment-service";
import { commentService } from "@/services/comment-service";
import { workspaceService } from "@/services/workspace-service";
import { boardService } from "@/services/board-service";
import { columnService } from "@/services/column-service";
import { authService } from "@/services/auth-service";
import { getErrorMessage } from "@/lib/error-utils";

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
  });

  const updateWorkspace = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      workspaceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("Workspace updated");
    },
  });

  const deleteWorkspace = useMutation({
    mutationFn: workspaceService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("Workspace deleted");
    },
  });

  // --- Members ---
  const inviteMember = useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: any }) =>
      workspaceService.inviteMember(workspaceId, data),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
      toast.success("Member invited");
    },
  });

  const removeMember = useMutation({
    mutationFn: ({ workspaceId, userId }: { workspaceId: string; userId: string }) =>
      workspaceService.removeMember(workspaceId, userId),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
      toast.success("Member removed");
    },
  });

  return { createWorkspace, updateWorkspace, deleteWorkspace, inviteMember, removeMember };
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
  });

  const updateBoard = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      boardService.update(workspaceId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", workspaceId] });
      toast.success("Board updated");
    },
  });

  const deleteBoard = useMutation({
    mutationFn: (id: string) => boardService.delete(workspaceId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", workspaceId] });
      toast.success("Board deleted");
    },
  });

  // ⚡ Optimistic Reorder
  const reorderBoards = useMutation({
    mutationFn: (boardIds: string[]) => boardService.reorder(workspaceId, boardIds),
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ["boards", workspaceId] });
      const previous = queryClient.getQueryData(["boards", workspaceId]);

      queryClient.setQueryData(["boards", workspaceId], (old: any[]) => {
        if (!old) return [];
        // Sort the local cache based on the new ID array order
        return [...old].sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
      });

      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) queryClient.setQueryData(["boards", workspaceId], context.previous);
      toast.error("Failed to reorder boards");
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
  });

  const updateColumn = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      columnService.update(workspaceId, boardId, id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["columns", boardId] }),
  });

  const deleteColumn = useMutation({
    mutationFn: (id: string) => columnService.delete(workspaceId, boardId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
      toast.success("Column deleted");
    },
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
    onError: (_, __, context) => {
      if (context?.previous) queryClient.setQueryData(["columns", boardId], context.previous);
      toast.error("Failed to reorder columns");
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
      queryClient.invalidateQueries({ queryKey: ["columns"] }); // Refresh board view
      toast.success("Task created");
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      taskService.update(workspaceId, id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(["tasks", data?.id], data); // Update Detail View
      queryClient.invalidateQueries({ queryKey: ["columns"] }); // Update Board View
    },
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => taskService.delete(workspaceId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns"] });
      toast.success("Task deleted");
    },
  });

  // Optimistic Move (The complex drag & drop logic)
  const moveTask = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: any }) =>
      taskService.move(workspaceId, taskId, data),
    
    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["columns"] });
      const previousColumns = queryClient.getQueryData(["columns"]);

      queryClient.setQueriesData({ queryKey: ["columns"] }, (old: any[] | undefined) => {
        if (!old) return [];
        const newCols = JSON.parse(JSON.stringify(old)); // Deep clone
        
        // Find Source & Target
        const sourceCol = newCols.find((c: any) => c.items.some((t: any) => t.id === taskId));
        const targetCol = newCols.find((c: any) => c.id === data.targetColumnId);

        if (!sourceCol || !targetCol) return old;

        // Remove from Source
        const taskIdx = sourceCol.items.findIndex((t: any) => t.id === taskId);
        const [task] = sourceCol.items.splice(taskIdx, 1);

        // Update Position
        task.position = data.newPosition;

        // Add to Target
        targetCol.items.splice(data.newPosition, 0, task);
        
        return newCols;
      });

      return { previousColumns };
    },
    onError: (_, __, ctx) => {
      if (ctx?.previousColumns) queryClient.setQueryData(["columns"], ctx.previousColumns);
      toast.error("Failed to move task");
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

  // --- Comments ---
  const createComment = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: any }) =>
      commentService.create(workspaceId, taskId, data),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", taskId] }); // Update counts
    },
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: string) => commentService.delete(workspaceId, commentId),
    onSuccess: (_, commentId) => {
      // We need to know taskId to invalidate, but we don't have it here easily.
      // Usually, we just invalidate specific keys if possible, or refetch the comments list if open.
      // Strategy: Invalidate all comments queries? Or just rely on SignalR?
      // Simple approach: SignalR will handle it for others, local invalidation best effort.
    },
  });

  // --- Attachments ---
  const uploadAttachment = useMutation({
    mutationFn: ({ taskId, file }: { taskId: string; file: File }) =>
      attachmentService.upload(workspaceId, taskId, file),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["attachments", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
      toast.success("File uploaded");
    },
  });

  const deleteAttachment = useMutation({
    mutationFn: (attachmentId: string) => attachmentService.delete(workspaceId, attachmentId),
    onSuccess: () => toast.success("Attachment deleted"),
  });

  return { createComment, deleteComment, uploadAttachment, deleteAttachment };
}

export function useAuthMutations() {
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    }
  });

  // 1. Forgot Password (Send Email)
  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    }
  });

  // 2. Reset Password (Submit Code + New Password)
  const resetPasswordMutation = useMutation({
    mutationFn: authService.resetPassword,
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    }
  });

  const verifyEmailMutation = useMutation({
    mutationFn: authService.verifyEmail,
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: authService.resendVerification,
    onSuccess: () => {
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  return { 
    loginMutation, 
    registerMutation, 
    forgotPasswordMutation, 
    resetPasswordMutation,
    verifyEmailMutation,
    resendVerificationMutation
  };
}