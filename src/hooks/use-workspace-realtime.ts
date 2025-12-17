import { useRouter } from "next/navigation";
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
  const router = useRouter();

  // 1. Connection Management
  useSocketEventListener("JoinWorkspace", () => {}); 

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
    queryClient.invalidateQueries({ queryKey: ["workspaceById", data.id] });
    toast.success("New workspace created");
  });

  useSocketEventListener("WorkspaceUpdated", (data: ReadWorkspaceDto) => {
    // Update the specific workspace cache
    queryClient.setQueryData(["workspaces", data.id], data);
    // Update the sidebar list
    queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    toast.success("Workspace updated");
  });

  useSocketEventListener("WorkspaceArchived", (data: { Id: string }) => {
    queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    if (data.Id === workspaceId) {
       toast.warning("This workspace has been archived.");
    }
  });

  useSocketEventListener("WorkspaceDeleted", (data: { Id: string }) => {
    queryClient.removeQueries({ queryKey: ["workspaces", data.Id] });
    queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    
    if (data.Id === workspaceId) {
       toast.error("This workspace has been deleted.");
       router.push("/dashboard");
    }
  });

  // =========================================================
  // MEMBER EVENTS
  // =========================================================

  useSocketEventListener("MemberAdded", (member: ReadWorkspaceMemberDto) => {
     queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
     toast.info(`${member.userDisplayName} joined the workspace.`);
  });

  useSocketEventListener("MemberUpdated", (member: ReadWorkspaceMemberDto) => {
     queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
  });

  useSocketEventListener("MemberRemoved", (data: { userId: string }) => {
     queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
  });

  // =========================================================
  // BOARD & COLUMN EVENTS
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

  useSocketEventListener("ColumnCreated", (col: ReadColumnDto) => {
    queryClient.invalidateQueries({ queryKey: ["columns"] }); // BoardId is usually implicit in query key
  });

  // The NEW signal we added
  useSocketEventListener("ColumnUpdated", (col: ReadColumnDto) => {
    queryClient.invalidateQueries({ queryKey: ["columns"] }); 
  });

  useSocketEventListener("ColumnReordered", () => {
    queryClient.invalidateQueries({ queryKey: ["columns"] });
  });

  useSocketEventListener("ColumnDeleted", () => {
    queryClient.invalidateQueries({ queryKey: ["columns"] });
  });

  // =========================================================
  // TASK EVENTS
  // =========================================================

  useSocketEventListener("TaskCreated", (task: ReadTaskItemDto) => {
    queryClient.invalidateQueries({ queryKey: ["columns"] }); // To update task counts/lists
    queryClient.setQueryData(["tasks", task.id], task);
  });

  useSocketEventListener("TaskUpdated", (task: ReadTaskItemDto) => {
    queryClient.setQueryData(["tasks", task.id], task);
    queryClient.invalidateQueries({ queryKey: ["columns"] });
  });

  useSocketEventListener("TaskMoved", () => {
    queryClient.invalidateQueries({ queryKey: ["columns"] });
  });

  useSocketEventListener("TaskDeleted", (data: { Id: string }) => {
    queryClient.removeQueries({ queryKey: ["tasks", data.Id] });
    queryClient.invalidateQueries({ queryKey: ["columns"] });
  });

  useSocketEventListener("TaskAssigned", (data: any) => {
    queryClient.invalidateQueries({ queryKey: ["tasks", data.TaskId] });
    toast.info(`Task assigned to ${data.AssigneeName || "Unassigned"}`);
  });

  // =========================================================
  // COMMENT EVENTS
  // =========================================================

  useSocketEventListener("CommentAdded", (comment: ReadCommentDto) => {
    // 1. Add comment to the list
    queryClient.setQueryData(["comments", comment.taskId], (old: ReadCommentDto[] = []) => {
      return [...old, comment];
    });
    // 2. Update task (comment count)
    queryClient.invalidateQueries({ queryKey: ["tasks", comment.taskId] });
  });
}