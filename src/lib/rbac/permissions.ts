import { WorkspaceRole } from "@/types/enums";

// 1. Define all available permissions (Mirroring your C# Enum)
export enum Permission {
  // Workspace
  ViewWorkspace = "ViewWorkspace",
  ManageWorkspace = "ManageWorkspace",
  ArchiveWorkspace = "ArchiveWorkspace",
  DeleteWorkspace = "DeleteWorkspace",

  // Board
  ViewBoard = "ViewBoard",
  CreateBoard = "CreateBoard",
  UpdateBoard = "UpdateBoard",
  ReorderBoard = "ReorderBoard",
  DeleteBoard = "DeleteBoard",

  // Column
  ViewColumn = "ViewColumn",
  CreateColumn = "CreateColumn",
  UpdateColumn = "UpdateColumn",
  ReorderColumn = "ReorderColumn",
  DeleteColumn = "DeleteColumn",

  // Task
  ViewTask = "ViewTask",
  CreateTask = "CreateTask",
  AssignTask = "AssignTask",
  MoveTask = "MoveTask",
  UpdateTask = "UpdateTask",
  CommentOnTask = "CommentOnTask",
  UpdateTaskStatus = "UpdateTaskStatus",
  MarkTaskAsComplete = "MarkTaskAsComplete",
  DisapproveTask = "DisapproveTask",
  ReopenTask = "ReopenTask",
  DeleteTask = "DeleteTask",

  // Member Management
  ViewMember = "ViewMember",
  AddMember = "AddMember",
  RemoveMember = "RemoveMember",

  // Role
  ViewRole = "ViewRole",
  UpdateRole = "UpdateRole",

  // Attachments & Comments
  ViewAttachment = "ViewAttachment",
  CreateAttachment = "CreateAttachment",
  ViewComment = "ViewComment",
  CreateComment = "CreateComment",

  // Notifications
  ViewNotification = "ViewNotification",
  MarkNotificationAsRead = "MarkNotificationAsRead",
}

// 2. Define the Mapping (Mirroring RolePermissionMap.cs)
export const ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  // Owner: Has (almost) everything
  [WorkspaceRole.Owner]: Object.values(Permission), // Simplified: Owners typically have all workspace permissions
  
  // Privileged Member (Admin): Can manage content/members, but not archive/delete workspace
  [WorkspaceRole.PrivilegedMember]: [
    Permission.ViewWorkspace,
    Permission.ViewBoard, Permission.CreateBoard, Permission.UpdateBoard, Permission.ReorderBoard, Permission.DeleteBoard,
    Permission.ViewColumn, Permission.CreateColumn, Permission.UpdateColumn, Permission.ReorderColumn, Permission.DeleteColumn,
    Permission.ViewTask, Permission.CreateTask, Permission.AssignTask, Permission.MoveTask, Permission.UpdateTask, 
    Permission.CommentOnTask, Permission.UpdateTaskStatus, Permission.MarkTaskAsComplete, Permission.DisapproveTask, 
    Permission.ReopenTask, Permission.DeleteTask,
    Permission.ViewMember, Permission.AddMember, Permission.RemoveMember,
    Permission.ViewAttachment, Permission.CreateAttachment,
    Permission.ViewComment, Permission.CreateComment,
    Permission.ViewNotification, Permission.MarkNotificationAsRead
  ],

  // Regular Member: Can only work on tasks
  [WorkspaceRole.Member]: [
    Permission.ViewWorkspace,
    Permission.ViewMember,
    Permission.ViewBoard,
    Permission.ViewColumn,
    Permission.ViewTask,
    Permission.UpdateTaskStatus,
    Permission.CommentOnTask,
    Permission.MarkTaskAsComplete,
    Permission.CreateTask, 
    Permission.AssignTask, 
    Permission.MoveTask,   
    Permission.UpdateTask,
    Permission.ViewAttachment, Permission.CreateAttachment,
    Permission.ViewComment, Permission.CreateComment,
    Permission.ViewNotification, Permission.MarkNotificationAsRead
  ]
};

/**
 * Helper to check if a specific role has a permission
 */
export function hasPermission(role: WorkspaceRole | undefined | null, permission: Permission): boolean {
  if (role === undefined || role === null) return false;
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}