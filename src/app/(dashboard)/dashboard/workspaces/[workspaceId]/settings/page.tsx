"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useWorkspace } from "@/hooks/use-queries";
import { useWorkspaceMutations } from "@/hooks/use-mutations";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { SettingsTabs } from "@/components/dashboard/settings-tabs";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ArchivedBanner } from "@/components/dashboard/archived-banner";
import { useWorkspacePermissions } from "@/hooks/use-workspace-permissions"; 
import { usePermissions } from "@/providers/permission-provider"; 
import { Permission } from "@/lib/rbac/permissions"; 
import { useAuthStore } from "@/store/use-auth-store";

const updateWorkspaceSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(200).optional(),
});
type UpdateWorkspaceFormData = z.infer<typeof updateWorkspaceSchema>;

export default function WorkspaceGeneralSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const { user: currentUser } = useAuthStore();

  const { can, isOwner } = usePermissions();
  const { isArchived } = useWorkspacePermissions(workspaceId);
  const canEditWorkspace = can(Permission.ManageWorkspace) && !isArchived;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isUnarchiveModalOpen, setIsUnarchiveModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  const { data: workspace, isLoading } = useWorkspace(workspaceId);
  const { updateWorkspace, deleteWorkspace, archiveWorkspace, unarchiveWorkspace, leaveWorkspace } = useWorkspaceMutations(workspaceId);
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateWorkspaceFormData>({
    resolver: zodResolver(updateWorkspaceSchema),
  });

  useEffect(() => {
    if (workspace) {
      reset({
        name: workspace.name,
        description: workspace.description || "",
      });
    }
  }, [workspace, reset]);

  const onUpdate = (data: UpdateWorkspaceFormData) => {
    if (!canEditWorkspace) return;
    updateWorkspace.mutate({ id: workspaceId, data });
  };

  const handleArchiveConfirm = () => {
    archiveWorkspace.mutate(workspaceId, {
      onSuccess: () => setIsArchiveModalOpen(false),
    });
  };

  const handleUnarchiveConfirm = () => {
    unarchiveWorkspace.mutate(workspaceId, {
      onSuccess: () => setIsUnarchiveModalOpen(false),
    });
  };

  const handleDeleteConfirm = () => {
    deleteWorkspace.mutate(workspaceId, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        if (activeWorkspaceId === workspaceId) setActiveWorkspaceId(null as any);
        router.push("/dashboard");
      }
    });
  };

  const handleLeave = () => {
    leaveWorkspace.mutate();
  }

  if (isLoading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="flex flex-col min-h-full">
      {isArchived && workspace && (
        <div className="-mt-4 -mx-4 md:-mx-8 mb-6">
          <ArchivedBanner workspaceId={workspace.id} workspaceName={workspace.name} />
        </div>
      )}

      {/* Modals */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Workspace?"
        description={`Are you sure you want to permanently delete "${workspace?.name}"?`}
        confirmText="Yes, Delete"
        variant="danger"
        isLoading={deleteWorkspace.isPending}
      />

      <ConfirmationModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={handleArchiveConfirm}
        title="Archive Workspace?"
        description={`Archive "${workspace?.name}" to hide it and make it read-only.`}
        confirmText="Archive"
        variant="warning"
        isLoading={archiveWorkspace.isPending}
      />

      <ConfirmationModal
        isOpen={isUnarchiveModalOpen}
        onClose={() => setIsUnarchiveModalOpen(false)}
        onConfirm={handleUnarchiveConfirm}
        title="Restore Workspace?"
        description={`Restore "${workspace?.name}" to active status?`}
        confirmText="Restore"
        variant="primary"
        isLoading={unarchiveWorkspace.isPending}
      />

      <ConfirmationModal
        isOpen={!!isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirm={handleLeave}
        title="Leave the Workspace?"
        description={`Are you sure you want to leave this workspace? You will lose access to all boards and tasks.`}
        confirmText="Leave the Workspace"
        variant="danger"
        isLoading={leaveWorkspace.isPending}
      />

      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#0e141b] dark:text-[#e8edf3] mb-2">Workspace Settings</h2>
        <p className="text-[#507395] dark:text-[#94a3b8] mb-6">Manage your workspace preferences.</p>

        <SettingsTabs workspaceId={workspaceId} />

        <div className="space-y-8">

          {/* General Information Form */}
          <section className={`bg-white dark:bg-[#1a2430] rounded-xl border border-[#e8edf3] dark:border-[#2d3a4a] p-6 shadow-sm transition-opacity duration-300 ${isArchived ? "bg-gray-50/50" : ""}`}>

            <h3 className="text-lg font-bold text-[#0e141b] dark:text-[#e8edf3] mb-4">General Information</h3>

            <form onSubmit={handleSubmit(onUpdate)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[#0e141b] dark:text-[#e8edf3]" htmlFor="name">
                    Workspace Name
                  </label>
                  <input
                    {...register("name")}
                    disabled={!canEditWorkspace}
                    id="name"
                    type="text"
                    /* FIX: Dynamic Focus Colors */
                    className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-[#f8fafb] dark:bg-[#111921] py-2.5 px-4 text-[#0e141b] dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-sm disabled:text-gray-500 disabled:cursor-text"
                  />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[#0e141b] dark:text-[#e8edf3]" htmlFor="description">
                    Description
                  </label>
                  <input
                    {...register("description")}
                    disabled={!canEditWorkspace}
                    id="description"
                    type="text"
                    /* FIX: Dynamic Focus Colors */
                    className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-[#f8fafb] dark:bg-[#111921] py-2.5 px-4 text-[#0e141b] dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-sm disabled:text-gray-500 disabled:cursor-text"
                  />
                </div>
              </div>

              {canEditWorkspace && (
                <div className="flex justify-end border-t border-[#e8edf3] dark:border-[#2d3a4a] pt-4 mt-2">
                  <button
                    type="submit"
                    disabled={!isDirty || updateWorkspace.isPending}
                    /* FIX: Dynamic Background and Hover */
                    className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateWorkspace.isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </section>

          {/* Actions Zone */}
          { (can(Permission.ArchiveWorkspace) || can(Permission.DeleteWorkspace) || !isOwner) && (
          <section className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 p-6">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Workspace Actions</h3>
            <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-6">
              Manage the visibility and existence of this workspace.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
              
              {/* Archive / Restore Button */}
              {can(Permission.ArchiveWorkspace) && (
                isArchived ? (
                  <button
                    type="button"
                    onClick={() => setIsUnarchiveModalOpen(true)}
                    /* FIX: Dynamic Border and Text Colors for Restore Action */
                    className="w-full hover:cursor-pointer sm:w-auto px-5 py-2 rounded-lg bg-white border border-primary text-primary text-sm font-bold shadow-sm hover:bg-blue-50 transition-colors dark:bg-transparent dark:border-primary dark:text-primary dark:hover:bg-blue-900/20"
                  >
                    Restore Workspace
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsArchiveModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-2 hover:cursor-pointer rounded-lg bg-white border border-amber-200 text-amber-600 text-sm font-bold shadow-sm hover:bg-amber-50 transition-colors dark:bg-transparent dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20"
                  >
                    Archive Workspace
                  </button>
                )
              )}

              {/* Delete Button */}
              {can(Permission.DeleteWorkspace) && (
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full hover:cursor-pointer sm:w-auto px-5 py-2 rounded-lg bg-white border border-red-200 text-red-600 text-sm font-bold shadow-sm hover:bg-red-50 transition-colors dark:bg-transparent dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Delete Workspace
                </button>
              )}

              {/* Leave Button */}
              {!isOwner && (
                <button
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-transparent border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 font-bold text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Leave Workspace
                </button>
              )}

            </div>
          </section>
          )}
        </div>
      </div>
    </div>
  );
}