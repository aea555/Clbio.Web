"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useWorkspaceMutations } from "@/hooks/use-mutations";
import { toast } from "sonner";
import { useEffect } from "react";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { CreateWorkspaceDto, createWorkspaceSchema } from "@/lib/schemas/schemas";

export function CreateWorkspaceModal({ isOpen, onClose}: { isOpen: boolean; onClose: () => void }) {
  const { createWorkspace } = useWorkspaceMutations();
  const setActiveWorkspaceId = useWorkspaceStore((state) => state.setActiveWorkspaceId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkspaceDto>({
    resolver: zodResolver(createWorkspaceSchema),
  });

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = (data: CreateWorkspaceDto) => {
    createWorkspace.mutate(
      {
        name: data.name,
        description: data.description,
      },
      {
        onSuccess: (newWorkspace) => {
          toast.success("Workspace created successfully!");
          console.log("New workspace created:", newWorkspace);
          // Automatically switch to the new workspace 
          if (newWorkspace?.id) {
            setActiveWorkspaceId(newWorkspace.id);
          }
          onClose();
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#1a2430] rounded-xl shadow-2xl w-full max-w-md border border-[#e8edf3] dark:border-[#2d3a4a] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e8edf3] dark:border-[#2d3a4a] flex justify-between items-center bg-[#f8fafb] dark:bg-[#111921]">
          <h3 className="text-lg font-bold text-[#0e141b] dark:text-[#e8edf3]">Create New Workspace</h3>
          <button 
            onClick={onClose}
            className="text-[#507395] hover:text-[#0e141b] dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#0e141b] dark:text-[#e8edf3]" htmlFor="ws-name">
              Workspace Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              id="ws-name"
              type="text"
              placeholder="e.g. Acme Corp"
              autoFocus
              className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] py-2.5 px-4 text-[#0e141b] dark:text-white placeholder-gray-400 focus:border-[#4c99e6] focus:ring-1 focus:ring-[#4c99e6] outline-none transition-colors text-sm"
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#0e141b] dark:text-[#e8edf3]" htmlFor="ws-desc">
              Description <span className="text-[#507395] font-normal text-xs">(Optional)</span>
            </label>
            <textarea
              {...register("description")}
              id="ws-desc"
              rows={3}
              placeholder="What is this team working on?"
              className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] py-2.5 px-4 text-[#0e141b] dark:text-white placeholder-gray-400 focus:border-[#4c99e6] focus:ring-1 focus:ring-[#4c99e6] outline-none transition-colors text-sm resize-none"
            />
            {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#507395] hover:bg-gray-100 dark:hover:bg-[#2d3a4a] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createWorkspace.isPending}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#4c99e6] text-white text-sm font-bold shadow-sm hover:bg-[#3b7ec4] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {createWorkspace.isPending ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Creating...
                </>
              ) : (
                "Create Workspace"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}