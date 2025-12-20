"use client";

import { useState } from "react";
import { ReadBoardDto } from "@/types/dtos";
import { usePermissions } from "@/providers/permission-provider";
import { Permission } from "@/lib/rbac/permissions";
import { EditBoardModal } from "../dashboard/edit-board-modal"; // Reusing your existing modal

interface BoardHeaderProps {
  board: ReadBoardDto;
  workspaceId: string;
  isArchived: boolean;
}

export function BoardHeader({ board, workspaceId, isArchived }: BoardHeaderProps) {
  const { can } = usePermissions();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const canEdit = !isArchived && can(Permission.UpdateBoard);

  return (
    <div className="flex-shrink-0 h-16 border-b border-[#e8edf3] dark:border-[#2d3a4a] bg-white dark:bg-[#1a2430] flex items-center justify-between px-6 z-10">

      <EditBoardModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        board={board}
        workspaceId={workspaceId}
      />

      {/* Left: Title & Info */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-[#0e141b] dark:text-[#e8edf3]">
          {board.name}
        </h1>

        {board.description && (
          <div className="relative">
            <button
              onClick={() => setShowDescription(!showDescription)}
              className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${showDescription ? "bg-primary-light text-primary" : "text-[#507395] hover:bg-gray-100 dark:hover:bg-[#2d3a4a]"}`}
              title="Toggle Description"
            >
              <span className="material-symbols-outlined text-[20px] leading-none">info</span>
            </button>
            {showDescription && (
              <div className="absolute top-full left-0 mt-2 w-64 p-4 bg-white dark:bg-[#1a2430] rounded-xl shadow-xl border border-[#e8edf3] dark:border-[#2d3a4a] z-50 text-sm text-[#507395] dark:text-[#94a3b8] animate-in fade-in zoom-in-95">
                {board.description}
              </div>
            )}
          </div>
        )}

        {/* Edit Button (Permission Check) */}
        {canEdit && (
          <>
            {/* Separator */}
            <div className="h-6 w-px bg-[#e8edf3] dark:border-[#2d3a4a]"></div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-bold text-[#507395] hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Edit Board
            </button>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Filter / Search placeholders could go here */}
      </div>
    </div>
  );
}