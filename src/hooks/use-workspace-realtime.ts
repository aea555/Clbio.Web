import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/providers/socket-provider";
import { useSocketEventListener } from "./use-socket-event-listener";
import {
  ReadTaskItemDto,
  ReadColumnDto,
  ReadCommentDto,
  ReadWorkspaceDto,
  ReadWorkspaceMemberDto
} from "@/types/dtos";
import { toast } from "sonner";
import { useEffect } from "react";

export function useWorkspaceRealtime(workspaceId: string) {
  const { connection, isConnected } = useSocket();
  const queryClient = useQueryClient();

  // 1. Connection Management
  useSocketEventListener("JoinWorkspace", () => { });

  useEffect(() => {
    if (connection && isConnected && workspaceId) {
      connection.invoke("JoinWorkspace", workspaceId)
        .catch(err => console.error(`Failed to join workspace ${workspaceId}`, err));

      return () => {
        connection.invoke("LeaveWorkspace", workspaceId)
          .catch(err => console.error(`Failed to leave workspace ${workspaceId}`, err));
      };
    }
  }, [connection, isConnected, workspaceId]);

  // =========================================================
  // WORKSPACE EVENTS 
  // =========================================================

  useSocketEventListener("WorkspaceCreated", (data: ReadWorkspaceDto) => {
    queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    // Detail key: ["workspaces", "detail", id]
    queryClient.invalidateQueries({ queryKey: ["workspaces", "detail", data.id] });
    toast.success("New workspace created");
  });

  useSocketEventListener("WorkspaceUpdated", (data: ReadWorkspaceDto) => {
    // Detail key: ["workspaces", "detail", id]
    queryClient.setQueryData(["workspaces", "detail", data.id], data);
    queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    toast.success("Workspace updated");
  });

  useSocketEventListener("WorkspaceArchived", (data: { Id: string }) => {
    queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    queryClient.invalidateQueries({ queryKey: ["workspaces", "detail", data.Id] });
    if (data.Id === workspaceId) {
      toast.warning("This workspace has been archived.");
    }
  });

  useSocketEventListener("WorkspaceUnarchived", (data: { Id: string }) => {
    queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    queryClient.invalidateQueries({ queryKey: ["workspaces", "detail", data.Id] });
    if (data.Id === workspaceId) {
      toast.info("This workspace has been restored.");
    }
  });

  useSocketEventListener("WorkspaceDeleted", (data: { Id: string }) => {
    queryClient.removeQueries({ queryKey: ["workspaces", "detail", data.Id] });
    queryClient.invalidateQueries({ queryKey: ["workspaces"] });

    if (data.Id === workspaceId) {
      toast.error("This workspace has been deleted.");
    }
  });

  // =========================================================
  // ATTACHMENT EVENTS
  // =========================================================
  useSocketEventListener("WorkspaceAttachmentCreated", (data: { workspaceId: string, taskId: string }) => {
    queryClient.invalidateQueries({ queryKey: ["attachments", data.workspaceId, data.taskId] });
  });

  useSocketEventListener("WorkspaceAttachmentDeleted", (data: { workspaceId: string, taskId: string }) => {
    queryClient.invalidateQueries({ queryKey: ["attachments", data.workspaceId, data.taskId] });
  });

  // =========================================================
  // MEMBER EVENTS
  // =========================================================

  useSocketEventListener("MemberAdded", (member: ReadWorkspaceMemberDto) => {
    queryClient.invalidateQueries({ queryKey: ["workspaces", "members", workspaceId] });
    toast.info(`${member.userDisplayName} joined the workspace.`);
  });

  useSocketEventListener("MemberUpdated", (member: ReadWorkspaceMemberDto) => {
    queryClient.invalidateQueries({ queryKey: ["workspaces", "members", workspaceId] });
  });

  useSocketEventListener("MemberRemoved", (data: { userId: string }) => {
    queryClient.invalidateQueries({ queryKey: ["workspaces", "members", workspaceId] });
  });

  useSocketEventListener("UserLeftWorkspace", (data: { Id: string }) => {
    // Note: The event payload key seems to vary in your snippets (Id vs userId). 
    // I'm using the one from the "Workspace" section logic.
    queryClient.invalidateQueries({ queryKey: ["workspaces", "members", workspaceId] });
  });

  // =========================================================
  // BOARD EVENTS
  // =========================================================

  useSocketEventListener("BoardCreated", () => {
    queryClient.invalidateQueries({ queryKey: ["boards", workspaceId] });
  });

  useSocketEventListener("BoardUpdated", () => {
    queryClient.invalidateQueries({ queryKey: ["boards", workspaceId] });
  });

  useSocketEventListener("BoardDeleted", () => {
    queryClient.invalidateQueries({ queryKey: ["boards", workspaceId] });
  });

  // =========================================================
  // COLUMN EVENTS
  // =========================================================

  useSocketEventListener("ColumnCreated", (newColumn: ReadColumnDto) => {
    queryClient.setQueryData(["columns", newColumn.boardId], (oldData: ReadColumnDto[] | undefined) => {
      if (!oldData) return [newColumn];
      return [...oldData, newColumn];
    });
  });

  useSocketEventListener("ColumnUpdated", (updatedColumn: ReadColumnDto) => {
    queryClient.setQueryData(["columns", updatedColumn.boardId], (oldData: ReadColumnDto[] | undefined) => {
      if (!oldData) return [];
      return oldData.map((col) => (col.id === updatedColumn.id ? updatedColumn : col));
    });
  });

  useSocketEventListener("ColumnReordered", (data: { boardId: string; columnOrder: string[] }) => {
    queryClient.setQueryData(["columns", data.boardId], (oldData: ReadColumnDto[] | undefined) => {
      if (!oldData) return [];
      const colMap = new Map(oldData.map((c) => [c.id, c]));
      const reordered = data.columnOrder
        .map((id) => colMap.get(id))
        .filter((c): c is ReadColumnDto => !!c)
        .map((c, index) => ({ ...c, position: index }));
      return reordered;
    });
  });

  useSocketEventListener("ColumnDeleted", (data: { columnId: string; boardId: string }) => {
    queryClient.setQueryData(["columns", data.boardId], (oldData: ReadColumnDto[] | undefined) => {
      if (!oldData) return [];
      return oldData.filter((col) => col.id !== data.columnId);
    });
  });

  // =========================================================
  // TASK EVENTS (FIXED KEYS)
  // =========================================================

  // Note: Backend must send boardId for us to update the board list efficiently
  useSocketEventListener("TaskCreated", (task: ReadTaskItemDto, boardId: string) => {
    // 1. Update Board List: ["tasks", "board", boardId]
    queryClient.setQueryData(["tasks", "board", boardId], (oldData: ReadTaskItemDto[] | undefined) => {
      if (!oldData) return [task];
      if (oldData.some(t => t.id === task.id)) return oldData;
      return [...oldData, task];
    });

    // 2. Update Detail: ["tasks", "detail", taskId]
    queryClient.setQueryData(["tasks", "detail", task.id], task);
  });

  useSocketEventListener("TaskUpdated", (data: { task: ReadTaskItemDto; boardId: string }) => {
    // 1. Update Board List
    queryClient.setQueryData(["tasks", "board", data.boardId], (oldData: ReadTaskItemDto[] | undefined) => {
      if (!oldData) return [];
      return oldData.map((t) => (t.id === data.task.id ? data.task : t));
    });

    // 2. Update Detail
    queryClient.setQueryData(["tasks", "detail", data.task.id], data.task);
  });

  useSocketEventListener("TaskMoved", (data: { taskId: string; targetColumnId: string; newPosition: number; boardId: string }) => {
    queryClient.setQueryData(["tasks", "board", data.boardId], (oldData: ReadTaskItemDto[] | undefined) => {
      if (!oldData) return [];

      const newTaskList = [...oldData];
      const taskIndex = newTaskList.findIndex((t) => t.id === data.taskId);
      if (taskIndex === -1) return oldData;

      const updatedTask = {
        ...newTaskList[taskIndex],
        columnId: data.targetColumnId,
        position: Number(data.newPosition)
      };

      newTaskList[taskIndex] = updatedTask;
      return newTaskList;
    });

    // Invalidate to ensure consistency if multiple people move items
    queryClient.invalidateQueries({ queryKey: ["tasks", "board", data.boardId] });
  });

  useSocketEventListener("TaskDeleted", (data: { id: string; boardId: string }) => {
    // 1. Remove from Board List
    queryClient.setQueryData(["tasks", "board", data.boardId], (oldData: ReadTaskItemDto[] | undefined) => {
      if (!oldData) return [];
      return oldData.filter((t) => t.id !== data.id);
    });

    // 2. Remove Detail Cache
    queryClient.removeQueries({ queryKey: ["tasks", "detail", data.id] });
  });

  useSocketEventListener("TaskAssigned", (data: {
    taskId: string, boardId: string, assigneeId: string, assigneeName?: string | null,
    assigneeAvatar?: string | null
  }) => {

    const updateFn = (oldData: ReadTaskItemDto[] | undefined) => {
      if (!oldData) return [];
      return oldData.map(t => {
        if (t.id === data.taskId) {
          return {
            ...t,
            assigneeId: data.assigneeId,
            assigneeDisplayName: data.assigneeName,
            assigneeAvatarUrl: data.assigneeAvatar
          }
        }
        return t;
      })
    };

    // Update Board List
    queryClient.setQueryData(["tasks", "board", data.boardId], updateFn);

    // Update Detail if cached
    queryClient.setQueryData(["tasks", "detail", data.taskId], (old: ReadTaskItemDto) => {
      if (!old) return old;
      return {
        ...old,
        assigneeId: data.assigneeId,
        assigneeDisplayName: data.assigneeName,
        assigneeAvatarUrl: data.assigneeAvatar
      };
    });

    toast.info(`Task assigned to ${data.assigneeName || "User"}`);
  });

  useSocketEventListener("CommentAdded", (comment: ReadCommentDto) => {
    // FIX: Check for duplicates before adding
    queryClient.setQueryData(["comments", comment.taskId], (old: ReadCommentDto[] = []) => {
      if (old.some(c => c.id === comment.id)) return old; // Already added by mutation? Skip.
      return [...old, comment];
    });

    // Update task detail for comment count
    queryClient.invalidateQueries({ queryKey: ["tasks", "detail", comment.taskId] });
    // Also update board list for comment count badge if needed
    // queryClient.invalidateQueries({ queryKey: ["tasks", "board", boardId] }); 
  });
}