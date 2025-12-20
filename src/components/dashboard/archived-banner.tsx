"use client";

import { useWorkspaceMutations } from "@/hooks/use-mutations";
import { useState } from "react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useWorkspaceStore } from "@/store/use-workspace-store";

interface ArchivedBannerProps {
  workspaceId: string;
  workspaceName: string;
}

export function ArchivedBanner({ workspaceId, workspaceName }: ArchivedBannerProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { activeWorkspaceId } = useWorkspaceStore();
  
  const { unarchiveWorkspace } = useWorkspaceMutations(activeWorkspaceId || "");

  const handleUnarchive = () => {
    unarchiveWorkspace.mutate(workspaceId, {
      onSuccess: () => setIsConfirmOpen(false),
    });
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleUnarchive}
        title="Unarchive Workspace?"
        description={`Do you want to restore "${workspaceName}"? You will be able to edit boards and members again.`}
        confirmText="Restore Workspace"
        variant="primary"
        isLoading={unarchiveWorkspace.isPending}
      />

      <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-6 py-3 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-600 dark:text-amber-500 text-[24px]">archive</span>
          <div>
            <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
              This workspace is archived.
            </p>
            <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
              You cannot edit boards, tasks, or settings while archived.
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsConfirmOpen(true)}
          className="px-4 hover:cursor-pointer py-1.5 bg-white dark:bg-transparent border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors shadow-sm"
        >
          Restore Workspace
        </button>
      </div>
    </>
  );
}