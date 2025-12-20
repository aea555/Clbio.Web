"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useBoards, useWorkspace, useOnlinePresence, useWorkspaceMembers } from "@/hooks/use-queries"; // Added presence hook
import { useBoardMutations } from "@/hooks/use-mutations";
import { CreateBoardModal } from "@/components/dashboard/create-board-modal";
import { CreateWorkspaceModal } from "@/components/dashboard/create-workspace-modal";
import { ArchivedBanner } from "@/components/dashboard/archived-banner";
import { EditBoardModal } from "@/components/dashboard/edit-board-modal";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { UserAvatar } from "@/components/ui/user-avatar"; // Added component
import { usePermissions } from "@/providers/permission-provider";
import { useWorkspacePermissions } from "@/hooks/use-workspace-permissions";
import { Permission } from "@/lib/rbac/permissions";
import { ReadBoardDto } from "@/types/dtos";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-utils";

type SortOption = "Most Recent" | "Alphabetical" | "Last Updated";

export default function DashboardPage() {
    const { activeWorkspaceId } = useWorkspaceStore();
    const [sortBy, setSortBy] = useState<SortOption>("Most Recent");

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);

    // Board Action States
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [editingBoard, setEditingBoard] = useState<ReadBoardDto | null>(null);
    const [deletingBoard, setDeletingBoard] = useState<ReadBoardDto | null>(null);

    const { can } = usePermissions();
    const { isArchived } = useWorkspacePermissions(activeWorkspaceId || "");

    const { data: boards, isLoading } = useBoards(activeWorkspaceId || "");
    const { data: workspace } = useWorkspace(activeWorkspaceId || "");
    const { data: members } = useWorkspaceMembers(activeWorkspaceId || ""); // Fetch members for lookup
    const { deleteBoard } = useBoardMutations(activeWorkspaceId || "");

    // 1. Extract Owner IDs for Presence (Assuming board has ownerId/createdById)
    const ownerIds = useMemo(() => {
        return boards?.map((b: any) => b.ownerId || b.createdById).filter(Boolean) || [];
    }, [boards]);

    // 2. Poll for Online Status
    const { data: onlineUserIds } = useOnlinePresence(ownerIds);

    // Click outside handler for closing dropdowns
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    const canCreateBoard = can(Permission.CreateBoard) && !isArchived;

    const handleDeleteConfirm = () => {
        if (!deletingBoard) return;
        deleteBoard.mutate(deletingBoard.id, {
            onSuccess: () => {
                toast.success("Board deleted successfully");
                setDeletingBoard(null);
            },
            onError: (err) => toast.error(getErrorMessage(err))
        });
    };

    const sortedBoards = useMemo(() => {
        if (!boards) return [];
        const sorted = [...boards];
        switch (sortBy) {
            case "Alphabetical":
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case "Last Updated":
                return sorted.sort((a, b) => {
                    const dateA = new Date(a.updatedAt || a.createdAt).getTime();
                    const dateB = new Date(b.updatedAt || b.createdAt).getTime();
                    return dateB - dateA;
                });
            case "Most Recent":
            default:
                return sorted.sort((a, b) => {
                    const dateA = new Date(a.createdAt).getTime();
                    const dateB = new Date(b.createdAt).getTime();
                    return dateB - dateA;
                });
        }
    }, [boards, sortBy]);

    if (!activeWorkspaceId) {
        return (
            <>
                <CreateWorkspaceModal
                    isOpen={isCreateWorkspaceModalOpen}
                    onClose={() => setIsCreateWorkspaceModalOpen(false)}
                />
                <div className="flex flex-col items-center justify-center h-full text-[#507395]">
                    <span className="material-symbols-outlined text-[48px] mb-4">workspaces</span>
                    <p>Please select or create a workspace to get started.</p>
                </div>
            </>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Create Modal */}
            <CreateBoardModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
            {/* Create Workspace Modal (Fallback) */}
            <CreateWorkspaceModal
                isOpen={isCreateWorkspaceModalOpen}
                onClose={() => setIsCreateWorkspaceModalOpen(false)}
            />

            {/* Edit Board Modal */}
            <EditBoardModal
                isOpen={!!editingBoard}
                onClose={() => setEditingBoard(null)}
                board={editingBoard}
                workspaceId={activeWorkspaceId}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!deletingBoard}
                onClose={() => setDeletingBoard(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Board?"
                description={`Are you sure you want to delete "${deletingBoard?.name}"? This action cannot be undone and all tasks inside will be lost.`}
                confirmText="Delete"
                variant="danger"
                isLoading={deleteBoard.isPending}
            />

            {/* Archived Banner */}
            {isArchived && workspace && (
                <div className="mb-6 -mx-4 md:-mx-8 md:-mt-4">
                    <ArchivedBanner workspaceId={workspace.id} workspaceName={workspace.name} />
                </div>
            )}

            {/* Page Heading & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-[#0e141b] dark:text-[#e8edf3] mb-2 tracking-tight">Your Boards</h2>
                    <p className="text-[#507395] dark:text-[#94a3b8]">Manage your projects, track tasks, and collaborate.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="appearance-none bg-white dark:bg-[#1a2430] border border-[#e8edf3] dark:border-[#2d3a4a] text-[#0e141b] dark:text-[#e8edf3] text-sm rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:border-primary/50 transition-colors"
                        >
                            <option value="Most Recent">Most Recent</option>
                            <option value="Alphabetical">Alphabetical</option>
                            <option value="Last Updated">Last Updated</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#507395] pointer-events-none text-[20px]">expand_more</span>
                    </div>

                    {canCreateBoard && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary hover:bg-primary-hover hover:cursor-pointer text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span>Create Board</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Boards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">

                {/* Grid Tile Button */}
                {canCreateBoard && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="group flex flex-col items-center justify-center min-h-[180px] rounded-xl border-2 border-dashed hover:cursor-pointer border-[#e8edf3] dark:border-[#2d3a4a] hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200 cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#f8fafb] dark:bg-[#1a2430] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-[#507395] group-hover:text-primary transition-colors text-[28px]">add</span>
                        </div>
                        <span className="text-sm font-medium text-[#507395] group-hover:text-primary transition-colors">Create new board</span>
                    </button>
                )}

                {/* Loading Skeletons */}
                {isLoading && Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col bg-white dark:bg-[#1a2430] rounded-xl border border-[#e8edf3] dark:border-[#2d3a4a] overflow-hidden animate-pulse min-h-[180px]">
                        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700"></div>
                        <div className="p-5 flex-1">
                            <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                            <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded"></div>
                        </div>
                    </div>
                ))}

                {/* Real Boards */}
                {!isLoading && sortedBoards.map((board: any) => {
                    const hasEditPerm = can(Permission.UpdateBoard) && !isArchived;
                    const hasDeletePerm = can(Permission.DeleteBoard) && !isArchived;
                    const showMenu = hasEditPerm || hasDeletePerm;
                    const isMenuOpen = activeMenuId === board.id;

                    // Owner logic
                    const owner = members?.find(m => m.userId === board.createdById);
                    const isOwnerOnline = onlineUserIds?.includes(board.createdById);

                    return (
                        <Link
                            key={board.id}
                            href={`/dashboard/workspaces/${activeWorkspaceId}/boards/${board.id}`}
                            className="group relative flex flex-col bg-white dark:bg-[#1a2430] rounded-xl border border-[#e8edf3] dark:border-[#2d3a4a] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer min-h-[180px]"
                        >
                            {/* Random Color Header */}
                            <div className={`h-3 w-full bg-gradient-to-r ${getRandomGradient(board.id)}`}></div>

                            <div className="p-5 flex flex-col h-full justify-between gap-4">
                                <div>
                                    <div className="flex justify-between items-start mb-2 relative">
                                        <h3 className="font-bold text-lg text-[#0e141b] dark:text-[#e8edf3] group-hover:text-primary transition-colors truncate pr-6">
                                            {board.name}
                                        </h3>

                                        {/* Context Menu Trigger */}
                                        {showMenu && (
                                            <div className="absolute right-[-8px] top-[-8px]">
                                                <button
                                                    className={`p-1.5 rounded-lg transition-all ${isMenuOpen
                                                        ? "bg-gray-100 dark:bg-[#2d3a4a] text-primary opacity-100"
                                                        : "text-[#507395] hover:bg-gray-50 dark:hover:bg-[#111921] hover:text-primary opacity-0 group-hover:opacity-100"
                                                        }`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setActiveMenuId(isMenuOpen ? null : board.id);
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                                                </button>

                                                {/* Dropdown Menu */}
                                                {isMenuOpen && (
                                                    <div
                                                        className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-[#1a2430] rounded-lg shadow-xl border border-[#e8edf3] dark:border-[#2d3a4a] z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                                                        onClick={(e) => e.stopPropagation()} // Stop click from hitting Link
                                                    >
                                                        <div className="py-1">
                                                            {hasEditPerm && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        setEditingBoard(board);
                                                                        setActiveMenuId(null);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 text-sm text-[#0e141b] dark:text-[#e8edf3] hover:bg-[#f8fafb] dark:hover:bg-[#2d3a4a] flex items-center gap-2"
                                                                >
                                                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                                                    Edit
                                                                </button>
                                                            )}
                                                            {hasDeletePerm && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        setDeletingBoard(board);
                                                                        setActiveMenuId(null);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                                                >
                                                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-[#507395] dark:text-[#94a3b8] line-clamp-3">
                                        {board.description || "No description provided."}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-xs text-[#507395] opacity-60 group-hover:opacity-100 transition-opacity">
                                        {new Date(board.updatedAt || board.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

function getRandomGradient(id: string) {
    const gradients = [
        "from-blue-400 to-indigo-500",
        "from-emerald-400 to-green-500",
        "from-red-400 to-pink-500",
        "from-purple-400 to-violet-500",
        "from-orange-400 to-amber-500"
    ];
    const index = id.charCodeAt(0) % gradients.length;
    return gradients[index];
}