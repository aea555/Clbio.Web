"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl"; //
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useBoardMutations } from "@/hooks/use-mutations";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { CreateBoardDto, createBoardSchema } from "@/lib/schemas/schemas";
import { createPortal } from "react-dom";

export function CreateBoardModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const t = useTranslations("CreateBoardModal"); //
  const { activeWorkspaceId } = useWorkspaceStore();
  const { createBoard } = useBoardMutations(activeWorkspaceId || "");
  const [mounted, setMounted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBoardDto>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      name: "",
      description: "",
      workspaceId: activeWorkspaceId || "", 
    }
  });
  
  useEffect(() => {
    setMounted(true);
    if (isOpen && activeWorkspaceId) {
      reset({
        name: "",
        description: "",
        workspaceId: activeWorkspaceId 
      });
    }
  }, [isOpen, reset, activeWorkspaceId]);

  const onSubmit = (data: CreateBoardDto) => {
    if (!activeWorkspaceId) {
      toast.error(t("errors.no_workspace"));
      return;
    }

    createBoard.mutate(
      {
        workspaceId: activeWorkspaceId,
        name: data.name,
        description: data.description,
      },
      {
        onSuccess: () => {
          toast.success(t("success"));
          onClose();
        },
      }
    );
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#1a2430] rounded-xl shadow-2xl w-full max-w-md border border-[#e8edf3] dark:border-[#2d3a4a] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e8edf3] dark:border-[#2d3a4a] bg-[#f8fafb] dark:bg-[#111921] flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#0e141b] dark:text-[#e8edf3]">{t("title")}</h3>
          <button 
            onClick={onClose}
            className="text-[#507395] hover:text-[#0e141b] dark:hover:text-white transition-colors hover:cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#0e141b] dark:text-[#e8edf3]" htmlFor="name">
              {t("board_title_label")} <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              id="name"
              type="text"
              placeholder={t("board_title_placeholder")}
              autoFocus
              className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] py-2.5 px-4 text-[#0e141b] dark:text-white placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-sm"
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#0e141b] dark:text-[#e8edf3]" htmlFor="description">
              {t("description_label")} <span className="text-[#507395] font-normal text-xs">{t("optional_hint")}</span>
            </label>
            <textarea
              {...register("description")}
              id="description"
              rows={3}
              placeholder={t("description_placeholder")}
              className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] py-2.5 px-4 text-[#0e141b] dark:text-white placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-sm resize-none"
            />
            {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#507395] hover:bg-gray-100 dark:hover:bg-[#2d3a4a] transition-colors hover:cursor-pointer"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={createBoard.isPending}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-hover transition-colors disabled:opacity-70 disabled:cursor-not-allowed hover:cursor-pointer"
            >
              {createBoard.isPending ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  {t("creating")}
                </>
              ) : (
                t("submit")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>, document.body
  );
}