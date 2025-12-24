"use client";

import { useState, useRef } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTask, useAttachments, useWorkspace, useMyWorkspaceMembership } from "@/hooks/use-queries";
import { useTaskMutations, useAttachmentMutations } from "@/hooks/use-mutations";
import { usePermissions } from "@/providers/permission-provider";
import { Permission } from "@/lib/rbac/permissions";
import { TaskProgressStatus, WorkspaceRole } from "@/types/enums";
import { TaskDescription } from "@/components/task/task-description";
import { TaskActivity } from "@/components/task/task-activity";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { format, isValid } from "date-fns";
import { ReadAttachmentDto } from "@/types/dtos";
import { TaskAssignee } from "@/components/task/task-assignee";
import { toast } from "sonner";
import { useWorkspacePermissions } from "@/hooks/use-workspace-permissions";
import { ArchivedBanner } from "@/components/dashboard/archived-banner";
import { useAuthStore } from "@/store/use-auth-store";

const isImageFile = (file: ReadAttachmentDto) => {
    if (file.contentType?.startsWith("image/")) return true;
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.fileName);
};

const isPdfFile = (file: ReadAttachmentDto) => {
    if (file.contentType === "application/pdf") return true;
    return /\.pdf$/i.test(file.fileName);
};

export default function TaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.workspaceId as string;
    const boardId = params.boardId as string;
    const taskId = params.taskId as string;

    const { user } = useAuthStore();
    const { data: task, isLoading: isTaskLoading } = useTask(workspaceId, taskId);
    const { data: attachments } = useAttachments(workspaceId, taskId);
    const { data: workspace } = useWorkspace(workspaceId);
    const { data: myMembership } = useMyWorkspaceMembership(workspaceId);

    const { can } = usePermissions();
    const { isArchived } = useWorkspacePermissions(workspaceId);

    const { updateTask, deleteTask } = useTaskMutations(workspaceId, boardId);
    const { uploadAttachment, deleteAttachment } = useAttachmentMutations(workspaceId, taskId);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [attachmentToDelete, setAttachmentToDelete] = useState<ReadAttachmentDto | null>(null);
    const [previewAttachment, setPreviewAttachment] = useState<ReadAttachmentDto | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTitleSave = () => {
        if (titleDraft && titleDraft !== task?.title) {
            updateTask.mutate({
                id: taskId,
                data: { ...task, title: titleDraft }
            });
        }
        setIsEditingTitle(false);
    };

    const handleStatusChange = (newStatus: number) => {
        if (task && !isArchived) {
            updateTask.mutate({
                id: taskId,
                data: { ...task, progressStatus: newStatus }
            });
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isArchived || !can(Permission.CreateAttachment)) return;
        
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            uploadAttachment.mutate(files);
            e.target.value = "";
        }
    };

    const handleDownload = async (e: React.MouseEvent, file: ReadAttachmentDto) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const response = await fetch(file.url);
            if (!response.ok) throw new Error("Network response was not ok");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            window.open(file.url, '_blank');
        }
    };

    const handleFileClick = (e: React.MouseEvent, file: ReadAttachmentDto) => {
        e.preventDefault();
        if (isImageFile(file) || isPdfFile(file)) {
            setPreviewAttachment(file);
        } else {
            handleDownload(e, file);
        }
    };

    const handleDelete = () => {
        if (isArchived) return;
        deleteTask.mutate(taskId, {
            onSuccess: () => {
                router.push(`/dashboard/workspaces/${workspaceId}/boards/${boardId}`);
            }
        });
    };

    // Mirrors the backend DeleteAsync logic
    const canDeleteAttachment = (file: ReadAttachmentDto) => {
        if (isArchived) return false;
        if (!user) return false;

        if (file.uploadedById === user.id) return true;
        if (myMembership?.role === WorkspaceRole.Owner) return true;
        if (myMembership?.role === WorkspaceRole.PrivilegedMember) return true;

        return false;
    };

    const renderDate = (dateStr: string | undefined) => {
        if (!dateStr) return "Unknown date";
        const date = new Date(dateStr);
        return isValid(date) ? format(date, "MMM d, yyyy") : "Invalid date";
    };

    if (isTaskLoading) {
        return <div className="flex h-full items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    }

    if (!task) {
        notFound();
        return null;
    }

    return (
        <div className="min-h-full bg-background flex flex-col relative overflow-hidden transition-colors duration-300">

            {/* The Tint Overlay */}
            <div className="absolute inset-0 bg-black/[0.02] dark:bg-black/[0.15] pointer-events-none z-0" />

            {previewAttachment && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setPreviewAttachment(null)}
                >
                    <button onClick={() => setPreviewAttachment(null)} className="absolute top-4 right-4 text-white/70 hover:text-white z-50 hover:cursor-pointer">
                        <span className="material-symbols-outlined text-[32px]">close</span>
                    </button>
                    <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8" onClick={(e) => e.stopPropagation()}>
                        {isImageFile(previewAttachment) ? (
                            <img crossOrigin="anonymous" src={previewAttachment.url} alt={previewAttachment.fileName} className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain border border-white/10" />
                        ) : (
                            <iframe src={previewAttachment.url} className="w-full max-w-5xl h-[85vh] bg-white rounded-lg shadow-2xl" title="PDF Preview" />
                        )}
                    </div>
                </div>
            )}

            {isArchived && workspace && (
                <div className="relative z-20">
                    <ArchivedBanner workspaceId={workspaceId} workspaceName={workspace.name} />
                </div>
            )}

            <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar relative z-10">
                <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} title="Delete Task?" description="This will permanently delete the task, its comments, and attachments." confirmText="Delete Task" variant="danger" isLoading={deleteTask.isPending} />

                <ConfirmationModal isOpen={!!attachmentToDelete} onClose={() => setAttachmentToDelete(null)} onConfirm={() => { if (attachmentToDelete) { deleteAttachment.mutate(attachmentToDelete.id); setAttachmentToDelete(null); } }} title="Delete File?" description={`Are you sure you want to delete "${attachmentToDelete?.fileName}"?`} confirmText="Delete File" variant="danger" isLoading={deleteAttachment.isPending} />

                {/* Breadcrumb */}
                <div className="max-w-5xl mx-auto mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href={`/dashboard/workspaces/${workspaceId}/boards/${boardId}`} className="hover:text-primary transition-colors flex items-center gap-1 hover:cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back to Board
                    </Link>
                    <span className="opacity-40">/</span>
                    <span>{task?.id ? task.id.substring(0, 8) : "..."}</span>
                </div>

                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-3 space-y-8">

                        {/* Title Section */}
                        <div className="bg-card rounded-xl border border-border-base p-6 shadow-sm">
                            {isEditingTitle ? (
                                <input
                                    autoFocus
                                    className="w-full text-2xl font-bold bg-transparent border-b-2 border-primary outline-none pb-1 text-foreground"
                                    value={titleDraft}
                                    onChange={(e) => setTitleDraft(e.target.value)}
                                    onBlur={handleTitleSave}
                                    onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                                />
                            ) : (
                                <h1
                                    onClick={() => {
                                        if (!isArchived && can(Permission.UpdateTask)) {
                                            setTitleDraft(task.title);
                                            setIsEditingTitle(true);
                                        }
                                    }}
                                    className={`text-2xl font-bold text-foreground ${!isArchived && can(Permission.UpdateTask) ? "cursor-pointer hover:text-primary transition-colors hover:cursor-pointer" : ""}`}
                                >
                                    {task.title}
                                </h1>
                            )}

                            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Created {renderDate(task?.createdAt)}</span>
                                <span>•</span>
                                <span className="font-medium bg-background px-2 py-0.5 rounded border border-border-base">
                                    In List: <span className="text-foreground">
                                        Column {task?.columnId ? task.columnId.substring(0, 4) : "..."}
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-card rounded-xl border border-border-base p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-muted-foreground">description</span>
                                <h3 className="font-bold text-foreground">Description</h3>
                            </div>
                            <TaskDescription task={task} workspaceId={workspaceId} isArchived={isArchived} />
                        </div>

                        {/* Attachments */}
                        <div className="bg-card rounded-xl border border-border-base p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-muted-foreground">attachment</span>
                                    <h3 className="font-bold text-foreground">Attachments</h3>
                                </div>

                                {!isArchived && can(Permission.CreateAttachment) && (
                                    <>
                                        <button onClick={() => fileInputRef.current?.click()} className="hover:cursor-pointer text-xs font-bold text-primary hover:underline">
                                            Add File
                                        </button>
                                        <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                                    </>
                                )}
                            </div>

                            {attachments && attachments.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {attachments.map((file) => {
                                        const isImage = isImageFile(file);
                                        const isPdf = isPdfFile(file);
                                        return (
                                            <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border border-border-base hover:bg-background transition-colors group relative bg-card">
                                                <div onClick={(e) => handleFileClick(e, file)} className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:cursor-pointer">
                                                    <div className="w-10 h-10 bg-background rounded flex items-center justify-center text-muted-foreground font-bold text-xs uppercase flex-shrink-0 overflow-hidden relative border border-border-base">
                                                        {isImage ? (
                                                            <img crossOrigin="anonymous" src={file.url} alt="Thumbnail" className="w-full h-full object-cover" />
                                                        ) : isPdf ? (
                                                            <span className="material-symbols-outlined text-[20px] text-red-500">picture_as_pdf</span>
                                                        ) : (
                                                            file.fileName.split('.').pop()?.slice(0, 3)
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                                            {file.fileName}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{(file.sizeBytes / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                </div>

                                                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card shadow-md rounded border border-border-base">
                                                    <button onClick={(e) => handleDownload(e, file)} className="flex items-center justify-center hover:cursor-pointer p-1 text-muted-foreground hover:text-primary transition-colors" title="Download">
                                                        <span className="material-symbols-outlined text-[18px]">download</span>
                                                    </button>
                                                    {canDeleteAttachment(file) && (
                                                        <button onClick={() => setAttachmentToDelete(file)} className="flex items-center justify-center hover:cursor-pointer p-1 text-muted-foreground hover:text-red-500 transition-colors" title="Delete">
                                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No attachments yet.</p>
                            )}
                        </div>

                        <TaskActivity taskId={taskId} workspaceId={workspaceId} isArchived={isArchived} />
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">
                        <div className="bg-card rounded-xl border border-border-base p-4 shadow-sm">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Status</h4>
                            <select
                                value={task.progressStatus}
                                onChange={(e) => handleStatusChange(Number(e.target.value))}
                                disabled={isArchived}
                                className="hover:cursor-pointer w-full p-2 rounded-lg border border-border-base bg-background text-foreground text-sm font-medium focus:ring-2 focus:ring-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value={TaskProgressStatus.Assigned}>To Do</option>
                                <option value={TaskProgressStatus.InProgress}>In Progress</option>
                                <option value={TaskProgressStatus.ReadyForReview}>Review</option>
                                <option value={TaskProgressStatus.Received}>Done</option>
                            </select>
                        </div>

                        <div className="bg-card rounded-xl border border-border-base p-4 shadow-sm space-y-4">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Details</h4>
                            <TaskAssignee task={task} workspaceId={workspaceId} boardId={boardId} isArchived={isArchived} />
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Due Date</label>
                                <span className="text-sm text-foreground italic">No date set</span>
                            </div>
                        </div>

                        {can(Permission.DeleteTask) && !isArchived && (
                            <div className="bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/20 hover:border-red-500/30 transition-all duration-200 p-4 group">
                                <button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="hover:cursor-pointer w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-600 font-bold text-sm transition-all active:scale-[0.98]"
                                >
                                    <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6">
                                        delete
                                    </span>
                                    Delete Task
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}