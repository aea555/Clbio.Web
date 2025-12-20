"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useBoards, useWorkspace } from "@/hooks/use-queries";
import { CreateBoardModal } from "@/components/dashboard/create-board-modal";
import { CreateWorkspaceModal } from "@/components/dashboard/create-workspace-modal";
import { ArchivedBanner } from "@/components/dashboard/archived-banner";
import { usePermissions } from "@/providers/permission-provider";
import { useWorkspacePermissions } from "@/hooks/use-workspace-permissions"; 
import { Permission } from "@/lib/rbac/permissions";

type SortOption = "Most Recent" | "Alphabetical" | "Last Updated";

export default function DashboardPage() {
    const { activeWorkspaceId } = useWorkspaceStore();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>("Most Recent");

    const { can } = usePermissions();
    const { isArchived } = useWorkspacePermissions(activeWorkspaceId || "");

    const { data: boards, isLoading } = useBoards(activeWorkspaceId || "");
    const { data: workspace } = useWorkspace(activeWorkspaceId || "");

    const canCreateBoard = can(Permission.CreateBoard) && !isArchived;

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
            <CreateBoardModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
            <CreateWorkspaceModal
                isOpen={isCreateWorkspaceModalOpen}
                onClose={() => setIsCreateWorkspaceModalOpen(false)}
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
                            /* FIX: Dynamic Focus Ring and Hover Border */
                            className="appearance-none bg-white dark:bg-[#1a2430] border border-[#e8edf3] dark:border-[#2d3a4a] text-[#0e141b] dark:text-[#e8edf3] text-sm rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:border-primary/50 transition-colors"
                        >
                            <option value="Most Recent">Most Recent</option>
                            <option value="Alphabetical">Alphabetical</option>
                            <option value="Last Updated">Last Updated</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#507395] pointer-events-none text-[20px]">expand_more</span>
                    </div>
                    
                    {/* Header Button */}
                    {canCreateBoard && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            /* FIX: Dynamic Background and Hover */
                            className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary hover:bg-primary-hover hover:cursor-pointer text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span>Create Board</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Boards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                {/* Grid Tile Button */}
                {canCreateBoard && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        /* FIX: Dynamic Border, Background, and Hover States */
                        className="group flex flex-col items-center justify-center min-h-[160px] rounded-xl border-2 border-dashed hover:cursor-pointer border-[#e8edf3] dark:border-[#2d3a4a] hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200 cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#f8fafb] dark:bg-[#1a2430] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            {/* FIX: Dynamic Icon Color */}
                            <span className="material-symbols-outlined text-[#507395] group-hover:text-primary transition-colors text-[28px]">add</span>
                        </div>
                        {/* FIX: Dynamic Text Color */}
                        <span className="text-sm font-medium text-[#507395] group-hover:text-primary transition-colors">Create new board</span>
                    </button>
                )}

                {/* Loading Skeletons */}
                {isLoading && Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col bg-white dark:bg-[#1a2430] rounded-xl border border-[#e8edf3] dark:border-[#2d3a4a] overflow-hidden animate-pulse min-h-[160px]">
                        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700"></div>
                        <div className="p-5 flex-1">
                            <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                            <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded"></div>
                        </div>
                    </div>
                ))}

                {/* Real Boards */}
                {!isLoading && sortedBoards.map((board) => (
                    <Link
                        key={board.id}
                        href={`/w/${activeWorkspaceId}/b/${board.id}`}
                        className="group relative flex flex-col bg-white dark:bg-[#1a2430] rounded-xl border border-[#e8edf3] dark:border-[#2d3a4a] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                    >
                        {/* Random Color Header (Kept for content differentiation) */}
                        <div className={`h-3 w-full bg-gradient-to-r ${getRandomGradient(board.id)}`}></div>

                        <div className="p-5 flex flex-col h-full justify-between gap-4">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    {/* FIX: Dynamic Title Hover Color */}
                                    <h3 className="font-bold text-lg text-[#0e141b] dark:text-[#e8edf3] group-hover:text-primary transition-colors truncate">
                                        {board.name}
                                    </h3>
                                    
                                    {can(Permission.UpdateBoard) && !isArchived && (
                                        <button
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#f8fafb] dark:hover:bg-[#111921] rounded text-[#507395]"
                                            onClick={(e) => { 
                                                e.preventDefault(); 
                                                e.stopPropagation();
                                                // Handle menu
                                            }}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-[#507395] dark:text-[#94a3b8] line-clamp-2">
                                    {board.description || "No description provided."}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex -space-x-2">
                                    <div className="bg-gray-300 rounded-full size-7 border-2 border-white dark:border-[#1a2430]"></div>
                                </div>
                                <span className="text-xs text-[#507395] opacity-0 group-hover:opacity-100 transition-opacity">
                                    {new Date(board.updatedAt || board.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
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