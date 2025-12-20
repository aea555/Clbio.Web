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
import { UpdateWorkspaceMemberDto } from "@/lib/schemas/schemas";
import { workspaceInvitationService } from "@/services/workspace-invitation-service";
import { WorkspaceRole } from "@/types/enums";
import { userService } from "@/services/user-service";
import { ReadCommentDto, ReadTaskItemDto, ReadUserDto, ReadWorkspaceMemberDto } from "@/types/dtos";

export function useUserMutations() {
  const queryClient = useQueryClient();

  const setUser = useAuthStore((s) => s.setUser);
  const setAvatarUpdating = useAuthStore((s) => s.setAvatarUpdating);

  /**
   * =========================
   * UPLOAD AVATAR
   * =========================
   */
  const uploadAvatar = useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),

    // 🔒 Lock sync + cancel in-flight /me refetches
    onMutate: async () => {
      setAvatarUpdating(true);

      await queryClient.cancelQueries({
        queryKey: ["users", "me"],
      });
    },

    onSuccess: (data) => {
      console.log("🟢 Upload Success. Backend URL:", data.url);

      const newAvatarUrl = data.url;

      const currentUser =
        useAuthStore.getState().user ??
        queryClient.getQueryData<ReadUserDto>(["users", "me"]);

      if (!currentUser) {
        console.error("🔴 No user found to update avatar");
        return;
      }

      const updatedUser: ReadUserDto = {
        ...currentUser,
        avatarUrl: newAvatarUrl,
        updatedAt: new Date().toISOString(), // 🔥 ensures timestamp dominance
      };

      // Update React Query cache (prevents immediate rollback)
      queryClient.setQueryData(["users", "me"], updatedUser);

      // Update Zustand store (authoritative for UI)
      setUser(updatedUser);

      toast.success("Profile picture uploaded!");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },

    // Unlock sync after everything settles
    onSettled: () => {
      setAvatarUpdating(false);
    },
  });

  /**
   * =========================
   * DELETE AVATAR
   * =========================
   */
  const deleteAvatar = useMutation({
    mutationFn: () => userService.deleteAvatar(),

    onMutate: async () => {
      setAvatarUpdating(true);

      await queryClient.cancelQueries({
        queryKey: ["users", "me"],
      });
    },

    onSuccess: () => {
      const currentUser =
        useAuthStore.getState().user ??
        queryClient.getQueryData<ReadUserDto>(["users", "me"]);

      if (!currentUser) {
        console.error("🔴 No user found to delete avatar");
        return;
      }

      const updatedUser: ReadUserDto = {
        ...currentUser,
        avatarUrl: null,
        updatedAt: new Date().toISOString(), // timestamp wins over server
      };

      queryClient.setQueryData(["users", "me"], updatedUser);
      setUser(updatedUser);

      toast.success("Profile picture removed!");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },

    onSettled: () => {
      setAvatarUpdating(false);
    },
  });

  return {
    uploadAvatar,
    deleteAvatar,
  };
}

export function useWorkspaceMutations(workspaceId: string) {
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
    mutationFn: ({ email, role }: { email: string; role: WorkspaceRole }) =>
      workspaceInvitationService.sendInvitation(workspaceId, { email, role }),
    onSuccess: (_, { }) => {
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
      toast.success("Member removed");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const updateMemberRole = useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: UpdateWorkspaceMemberDto }) =>
      workspaceService.updateMemberRole(workspaceId!, memberId, data),
    onSuccess: () => {
      toast.success("Member role updated");
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const leaveWorkspace = useMutation({
    mutationFn: () => workspaceService.leave(workspaceId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("You have left the workspace");
      window.location.href = "/dashboard";
    },
    onError: (error) => toast.error(getErrorMessage(error)),
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

  return { createWorkspace, updateWorkspace, deleteWorkspace, inviteMember, removeMember, archiveWorkspace, unarchiveWorkspace, updateMemberRole, leaveWorkspace };
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
    onSuccess: (_, variables) => {
      // 1. Invalidate the list (for Dashboard)
      queryClient.invalidateQueries({ queryKey: ["boards", workspaceId] });
      // 2. Invalidate the specific board detail (for Board Page header)
      // FIX: Added this line
      queryClient.invalidateQueries({ queryKey: ["boards", "detail", variables.id] });

      toast.success("Board updated");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const deleteBoard = useMutation({
    mutationFn: (id: string) => boardService.delete(workspaceId, id),
    onSuccess: (_, boardId) => {
      queryClient.invalidateQueries({ queryKey: ["boards", workspaceId] });
      queryClient.removeQueries({ queryKey: ["boards", "detail", boardId] });
      toast.success("Board deleted");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

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
export function useTaskMutations(workspaceId: string, boardId?: string) {
  const queryClient = useQueryClient();

  const createTask = useMutation({
    mutationFn: ({ columnId, data }: { columnId: string; data: any }) =>
      taskService.create(workspaceId, columnId, data),
    onSuccess: () => {
      // FIX: Invalidate the specific board's task list
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", "board", boardId] });
      } else {
        // Fallback or invalidate all tasks if widely used (less efficient)
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
      toast.success("Task created");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const updateTask = useMutation({
    // We expect 'data' to contain the FULL UpdateTaskItemDto structure 
    // or at least the required fields + changes.
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      taskService.update(workspaceId, id, data),

    onMutate: async ({ id, data }) => {
      // 1. Cancel Refetches
      await queryClient.cancelQueries({ queryKey: ["tasks", "detail", id] });
      if (boardId) await queryClient.cancelQueries({ queryKey: ["tasks", "board", boardId] });

      // 2. Snapshot Previous Data
      const previousTask = queryClient.getQueryData<ReadTaskItemDto>(["tasks", "detail", id]);

      // 3. Optimistic Update (Detail View)
      if (previousTask) {
        queryClient.setQueryData<ReadTaskItemDto>(["tasks", "detail", id], {
          ...previousTask,
          ...data
        });
      }

      // 4. Optimistic Update (Board List View)
      if (boardId) {
        queryClient.setQueryData<ReadTaskItemDto[]>(["tasks", "board", boardId], (old) => {
          if (!old) return [];
          return old.map(t => t.id === id ? { ...t, ...data } : t);
        });
      }

      return { previousTask };
    },
    onError: (err, variables, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(["tasks", "detail", variables.id], context.previousTask);
      }
      toast.error(getErrorMessage(err));
    },
    onSettled: (data, err, variables) => {
      // Always invalidate to ensure consistency with backend
      queryClient.invalidateQueries({ queryKey: ["tasks", "detail", variables.id] });
      if (boardId) queryClient.invalidateQueries({ queryKey: ["tasks", "board", boardId] });
    }
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => taskService.delete(workspaceId, id),
    onSuccess: (_, taskId) => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", "board", boardId] });
      }
      queryClient.removeQueries({ queryKey: ["tasks", "detail", taskId] });
      toast.success("Task deleted");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const moveTask = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: any }) =>
      taskService.move(workspaceId, taskId, data),

    onMutate: async ({ taskId, data }) => {
      if (!boardId) return;

      const queryKey = ["tasks", "board", boardId];
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<ReadTaskItemDto[]>(queryKey);

      if (previousTasks) {
        queryClient.setQueryData<ReadTaskItemDto[]>(queryKey, (old) => {
          if (!old) return [];
          const newTasks = [...old];
          const taskIndex = newTasks.findIndex(t => t.id === taskId);

          if (taskIndex === -1) return old;

          const updatedTask = {
            ...newTasks[taskIndex],
            columnId: data.targetColumnId,
            position: data.newPosition
          };

          newTasks[taskIndex] = updatedTask;
          return newTasks;
        });
      }

      return { previousTasks };
    },

    onError: (error, __, context) => {
      if (boardId && context?.previousTasks) {
        queryClient.setQueryData(["tasks", "board", boardId], context.previousTasks);
      }
      toast.error(getErrorMessage(error));
    },

    onSettled: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", "board", boardId] });
      }
    },
  });

  const assignTask = useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string | null }) =>
      taskService.assign(workspaceId, taskId, userId),

    onMutate: async ({ taskId, userId }) => {
      // 1. Cancel Refetches
      await queryClient.cancelQueries({ queryKey: ["tasks", "detail", taskId] });
      if (boardId) await queryClient.cancelQueries({ queryKey: ["tasks", "board", boardId] });

      const previousTask = queryClient.getQueryData<ReadTaskItemDto>(["tasks", "detail", taskId]);

      // 2. Find Member Info for Optimistic UI (Avatar/Name)
      const members = queryClient.getQueryData<ReadWorkspaceMemberDto[]>(["workspaces", "members", workspaceId]);
      const targetMember = members?.find(m => m.userId === userId);

      const optimisticUpdate = {
        assigneeId: userId,
        assigneeDisplayName: targetMember?.userDisplayName || (userId ? "Loading..." : null),
        assigneeAvatarUrl: targetMember?.userAvatarUrl
      };

      // 3. Update Detail View
      if (previousTask) {
        queryClient.setQueryData(["tasks", "detail", taskId], { ...previousTask, ...optimisticUpdate });
      }

      // 4. Update Board List View
      if (boardId) {
        queryClient.setQueryData<ReadTaskItemDto[]>(["tasks", "board", boardId], (old) => {
          if (!old) return [];
          return old.map(t => t.id === taskId ? { ...t, ...optimisticUpdate } : t);
        });
      }

      return { previousTask };
    },
    onError: (err, variables, context) => {
      if (context?.previousTask) queryClient.setQueryData(["tasks", "detail", variables.taskId], context.previousTask);
      toast.error(getErrorMessage(err));
    },
    onSettled: (data, err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "detail", variables.taskId] });
      if (boardId) queryClient.invalidateQueries({ queryKey: ["tasks", "board", boardId] });
    }
  });

  return { createTask, updateTask, deleteTask, moveTask, assignTask };
}

// ============================================================================
// COMMENT MUTATIONS
// ============================================================================
export function useCommentMutations(workspaceId: string, taskId: string) {
  const queryClient = useQueryClient();

  const createComment = useMutation({
    mutationFn: (data: any) => commentService.create(workspaceId, taskId, data),
    onSuccess: (newComment) => {
      // FIX: Check for duplicates before adding
      queryClient.setQueryData(["comments", taskId], (old: ReadCommentDto[] = []) => {
        if (old.some(c => c.id === newComment?.id)) return old; // Already added by socket? Skip.
        return [...old, newComment];
      });
      queryClient.invalidateQueries({ queryKey: ["tasks", "detail", taskId] });
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: string) => commentService.delete(workspaceId, commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["comments", taskId] });
      const previous = queryClient.getQueryData(["comments", taskId]);

      // Optimistically remove
      queryClient.setQueryData(["comments", taskId], (old: ReadCommentDto[] | undefined) => {
        if (!old) return [];
        return old.filter(c => c.id !== commentId);
      });

      return { previous };
    },
    onError: (err, _, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["comments", taskId], ctx.previous);
      toast.error(getErrorMessage(err));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "detail", taskId] });
    }
  });

  return { createComment, deleteComment };
}

// ============================================================================
// ATTACHMENT MUTATIONS
// ============================================================================
export function useAttachmentMutations(workspaceId: string, taskId: string) {
  const queryClient = useQueryClient();

  const uploadAttachment = useMutation({
    mutationFn: (files: File[]) => attachmentService.upload(workspaceId, taskId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "detail", taskId] });
      toast.success("File uploaded");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const deleteAttachment = useMutation({
    mutationFn: (attachmentId: string) => attachmentService.delete(workspaceId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "detail", taskId] });
      toast.success("File deleted");
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  return { uploadAttachment, deleteAttachment };
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

export function useInvitationMutations() {
  const queryClient = useQueryClient();

  const respondToInvitation = useMutation({
    mutationFn: ({ invitationId, accept }: { invitationId: string; accept: boolean }) =>
      workspaceInvitationService.respondToInvitation(invitationId, accept),

    onSuccess: (_, variables) => {
      // 1. Invalidate Invitations (to remove the pending card)
      queryClient.invalidateQueries({ queryKey: ["workspaceInvitations"] });

      if (variables.accept) {
        queryClient.invalidateQueries({ queryKey: ["workspaces"] });

        toast.success("Invitation accepted! You have joined the workspace.");
      } else {
        toast.warning("Invitation declined.");
      }
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  return { respondToInvitation };
}