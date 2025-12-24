// Auto-generated frontend DTOs based on backend Read/Response DTOs

import { InvitationStatus, TaskCompletionStatus, TaskProgressStatus, WorkspaceRole, WorkspaceStatus } from "./enums";

export type Id = string;

export interface ApiResponse<T = any> {
	data?: T | null;
	success: boolean;
	error?: string | null;
	code?: string | null;
	timestamp: string; // ISO 8601
}

export type ApiResponseMessage = ApiResponse<string | null>;

export interface ResponseDtoBase {
	id: string;
	correlationId?: string | null;
	createdAt: string; // ISO 8601
	updatedAt?: string | null;
	message?: string | null;
}

export interface ReadUserDto extends ResponseDtoBase {
	email: string;
	displayName: string;
	avatarUrl?: string | null;
}

export interface ReadBoardDto extends ResponseDtoBase {
	name: string;
	description?: string | null;
	workspaceId: string;
	columnCount?: number;
}

export interface ReadColumnDto extends ResponseDtoBase {
	name: string;
	boardId: string;
	taskCount?: number;
	position: number;
}

export interface ReadTaskItemDto extends ResponseDtoBase {
	title: string;
	description?: string | null;
	position: number;
	columnId: string;

	assigneeId?: string | null;
	assigneeDisplayName?: string | null;
	assigneeAvatarUrl?: string | null;
	progressStatus: TaskProgressStatus;
	completionStatus: TaskCompletionStatus;

	commentCount?: number;
	attachmentCount?: number;
}

export interface ReadAttachmentDto extends ResponseDtoBase {
	fileName: string;
	url: string;
	contentType?: string | null;
	sizeBytes: number;
	taskId: string;
	uploadedById?: string | null;
	uploadedByDisplayName?: string | null;
	uploadedByAvatarUrl?: string | null;
}

export interface UploadAvatarResponse extends ResponseDtoBase {
	url: string;
}

export interface ReadCommentDto extends ResponseDtoBase {
	body: string;
	taskId: string;
	authorId: string;
	authorDisplayName: string;
	authorAvatarUrl?: string | null;
}

export interface ReadNotificationDto extends ResponseDtoBase {
	messageText: string;
	title: string;
	isRead: boolean;
}

export interface NotificationUnreadCount extends ResponseDtoBase {
	count: number
}

export interface ReadWorkspaceDto extends ResponseDtoBase {
	name: string;
	description?: string | null;
	ownerId: string;
	ownerDisplayName: string;
	status: WorkspaceStatus;
	memberCount?: number;
	boardCount?: number;
}

export interface ReadWorkspaceMemberDto extends ResponseDtoBase {
	workspaceId: string;
	userId: string;
	userDisplayName: string;
	userAvatarUrl?: string | null;
	role: WorkspaceRole;
}

export interface ReadActivityLogDto extends ResponseDtoBase {
	workspaceId: string;
	actorId: string;
	actorDisplayName: string;
	actionType: string;
	entityType: string;
	entityId: string;
	metadata: string;
	ipAddress?: string | null;
	userAgent?: string | null;
}

export interface ReadRoleDto {
	displayName: string;
	description?: string | null;
	workspaceRoleValue?: number | null;
}

export interface TokenResponseDto extends ResponseDtoBase {
	accessToken: string;
	refreshToken: string;
	accessExpiresUtc: string;
	refreshExpiresUtc: string;
}

export interface ActivityLogDto extends ResponseDtoBase {
	workspaceId: string;
	actorId: string;
	actorDisplayName: string;
	actionType: string;   // e.g. "Create", "Assign"
	entityType: string;   // e.g. "Board", "Task"
	entityId: string;
	metadata: string;     // Description message
	ipAddress?: string | null;
	userAgent?: string | null;
	createdAt: string;
}

export interface ReadWorkspaceInvitationDto extends ResponseDtoBase
{
	workspaceId: string;
	workspaceName: string;
	inviterName: string;
	email: string;
	role: WorkspaceRole;
	invitationStatus: InvitationStatus
	expiresAt: string;
}

export interface ViewPresignedUrlDto {
	url: string;
}

export interface PaginationMeta {
	totalCount: number;
	page: number;
	pageSize: number;
	totalPages: number;
	unreadOnly?: boolean | null
}

export interface PaginatedResult<T> {
	items: T[];
	meta: PaginationMeta;
}

export { WorkspaceStatus };

