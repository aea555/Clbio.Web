import { z } from "zod";
import {
	TaskCompletionStatus,
	TaskProgressStatus,
	WorkspaceRole,
} from "../../types/enums";

// Mirror of CreateActivityLogDto.cs
export const createActivityLogSchema = z.object({
	workspaceId: z.string().guid({ message: "Invalid Workspace ID" }),
	actorId: z.string().guid({ message: "Invalid Actor ID" }),
	actionType: z
		.string()
		.min(1, { message: "Action Type is required" })
		.max(100, { message: "Action Type cannot exceed 100 chars" }),
	entityType: z
		.string()
		.min(1, { message: "Entity Type is required" })
		.max(100, { message: "Entity Type cannot exceed 100 chars" }),
	entityId: z.string().guid({ message: "Invalid Entity ID" }),
	metadata: z.string().min(1, { message: "Metadata is required" }).max(1000, { message: "Metadata cannot exceed 1000 chars" }),
	ipAddress: z.string().max(50, { message: "IP Address too long" }).nullish(),
	userAgent: z.string().max(1024, { message: "User Agent too long" }).nullish(),
});
export type CreateActivityLogDto = z.infer<typeof createActivityLogSchema>;

// Attachment
export const createAttachmentSchema = z.object({
	fileName: z.string().min(1, { message: "File name is required" }).max(255, { message: "File name too long" }),
	url: z.string().url({ message: "Invalid URL" }).max(2048, { message: "URL too long" }),
	sizeBytes: z.number().int().min(1, { message: "Size must be at least 1" }),
	taskId: z.string().guid({ message: "Invalid Task ID" }),
	uploadedById: z.string().guid({ message: "Invalid UploadedBy ID" }),
});
export type CreateAttachmentDto = z.infer<typeof createAttachmentSchema>;

// Comment
export const createCommentSchema = z.object({
	body: z.string().min(1, { message: "Body is required" }).max(2000, { message: "Body too long" }),
	taskId: z.string().guid({ message: "Invalid Task ID" }),
	authorId: z.string().guid({ message: "Invalid Author ID" }),
});
export type CreateCommentDto = z.infer<typeof createCommentSchema>;

// Notification
export const createNotificationSchema = z.object({
	userId: z.string().guid({ message: "Invalid User ID" }),
	messageText: z.string().min(1, { message: "Message is required" }).max(500, { message: "Message too long" }),
	title: z.string().min(1, { message: "Title is required" }).max(200, { message: "Title too long" }),
});
export type CreateNotificationDto = z.infer<typeof createNotificationSchema>;

// Board
export const createBoardSchema = z.object({
	name: z.string().min(3, { message: "Name must be at least 3 characters" }).max(100, { message: "Name too long" }),
	description: z.string().max(500, { message: "Description too long" }).nullish(),
	workspaceId: z.string().guid({ message: "Invalid Workspace ID" }),
});
export type CreateBoardDto = z.infer<typeof createBoardSchema>;

export const updateBoardSchema = z.object({
	id: z.string().guid({ message: "Invalid Board ID" }),
	name: z.string().min(3, { message: "Name must be at least 3 characters" }).max(100, { message: "Name too long" }),
	description: z.string().max(500, { message: "Description too long" }).nullish(),
});
export type UpdateBoardDto = z.infer<typeof updateBoardSchema>;

// Column
export const createColumnSchema = z.object({
	name: z.string().min(1, { message: "Name is required" }).max(100, { message: "Name too long" }),
	position: z.number().int().optional(),
	boardId: z.string().guid({ message: "Invalid Board ID" }),
});
export type CreateColumnDto = z.infer<typeof createColumnSchema>;

export const updateColumnSchema = z.object({
	id: z.string().guid({ message: "Invalid Column ID" }),
	name: z.string().min(1, { message: "Name is required" }).max(100, { message: "Name too long" }),
	position: z.number().int(),
});
export type UpdateColumnDto = z.infer<typeof updateColumnSchema>;

// Task
export const createTaskItemSchema = z.object({
	title: z.string().min(1, { message: "Title is required" }).max(200, { message: "Title too long" }),
	description: z.string().max(2000, { message: "Description too long" }).nullish(),
	position: z.number().int().optional(),
	columnId: z.string().guid({ message: "Invalid Column ID" }),
});
export type CreateTaskItemDto = z.infer<typeof createTaskItemSchema>;

export const updateTaskItemSchema = z.object({
	id: z.string().guid({ message: "Invalid Task ID" }),
	title: z.string().min(1, { message: "Title is required" }).max(200, { message: "Title too long" }),
	description: z.string().max(2000, { message: "Description too long" }).nullish(),
	position: z.number().int(),
	columnId: z.string().guid({ message: "Invalid Column ID" }),
	assigneeId: z.string().guid({ message: "Invalid Assignee ID" }).nullish(),
	progressStatus: z.nativeEnum(TaskProgressStatus).optional(),
	completionStatus: z.nativeEnum(TaskCompletionStatus).optional(),
});
export type UpdateTaskItemDto = z.infer<typeof updateTaskItemSchema>;

export const moveTaskItemSchema = z.object({
    targetColumnId: z.string().guid({ message: "Invalid Target Column ID" }),
    targetPosition: z.number().int(),
});

export type MoveTaskItemDto = z.infer<typeof moveTaskItemSchema>;

// User
export const createUserSchema = z.object({
	email: z.string().email({ message: "Invalid email" }).max(100, { message: "Email too long" }),
	password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100, { message: "Password too long" }),
	displayName: z.string().min(3, { message: "Display name must be at least 3 characters" }).max(50, { message: "Display name too long" }),
	avatarUrl: z.string().url({ message: "Invalid URL" }).max(2048, { message: "URL too long" }).nullish(),
});
export type CreateUserDto = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
	displayName: z.string().min(3, { message: "Display name must be at least 3 characters" }).max(50, { message: "Display name too long" }),
	avatarUrl: z.string().url({ message: "Invalid URL" }).max(2048, { message: "URL too long" }).nullish(),
});
export type UpdateUserDto = z.infer<typeof updateUserSchema>;

// Workspace
export const createWorkspaceSchema = z.object({
	name: z.string().min(3, { message: "Name must be at least 3 characters" }).max(100, { message: "Name too long" }),
	description: z.string().max(500, { message: "Description too long" }).nullish(),
});
export type CreateWorkspaceDto = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = z.object({
	name: z.string().min(3, { message: "Name must be at least 3 characters" }).max(100, { message: "Name too long" }),
	description: z.string().max(500, { message: "Description too long" }).nullish(),
});
export type UpdateWorkspaceDto = z.infer<typeof updateWorkspaceSchema>;

// Workspace Member
export const createWorkspaceMemberSchema = z.object({
	workspaceId: z.string().guid({ message: "Invalid Workspace ID" }),
	email: z.string().email({ message: "Invalid email" }).max(100, { message: "Email too long" }),
	role: z.nativeEnum(WorkspaceRole),
});
export type CreateWorkspaceMemberDto = z.infer<typeof createWorkspaceMemberSchema>;

export const updateWorkspaceMemberSchema = z.object({
	id: z.string().guid({ message: "Invalid ID" }),
	role: z.nativeEnum(WorkspaceRole),
});
export type UpdateWorkspaceMemberDto = z.infer<typeof updateWorkspaceMemberSchema>;

// Auth
export const loginSchema = z.object({
	email: z.string().email({ message: "Invalid email" }).max(100, { message: "Email too long" }),
	password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100, { message: "Password too long" }),
});
export type LoginRequestDto = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
	email: z.string().email({ message: "Invalid email" }).max(150, { message: "Email too long" }),
	password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100, { message: "Password too long" }),
	displayName: z.string().min(2, { message: "Display name must be at least 2 characters" }).max(50, { message: "Display name too long" }),
	avatarUrl: z.string().url({ message: "Invalid URL" }).max(2048, { message: "URL too long" }).nullish(),
});
export type RegisterRequestDto = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
	email: z.string().email({ message: "Invalid email" }).max(100, { message: "Email too long" }),
});
export type ForgotPasswordRequestDto = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
	email: z.string().email({ message: "Invalid email" }).max(150, { message: "Email too long" }),
	code: z.string().max(6, { message: "Code too long" }),
	newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100, { message: "Password too long" }),
});
export type ResetPasswordRequestDto = z.infer<typeof resetPasswordSchema>;

export const verifyEmailOtpSchema = z.object({
	email: z.email({ message: "Invalid email" }).max(320, { message: "Email too long" }),
	otp: z.string().max(6, { message: "OTP too long" }),
});
export type VerifyEmailOtpRequestDto = z.infer<typeof verifyEmailOtpSchema>;

export const resendVerificationOtpSchema = z.object({
	email: z.email({ message: "Invalid email" }).max(320, { message: "Email too long" }),
});
export type ResendVerificationOtpRequestDto = z.infer<typeof resendVerificationOtpSchema>;

export const verifyEmailSchema = z.object({
	token: z.string().max(200, { message: "Token too long" }),
});
export type VerifyEmailRequestDto = z.infer<typeof verifyEmailSchema>;

export const googleLoginSchema = z.object({
	idToken: z.string().max(4000, { message: "IdToken too long" }).optional(),
});
export type GoogleLoginRequestDto = z.infer<typeof googleLoginSchema>;

