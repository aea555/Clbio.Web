"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl"; //
import { useTaskMutations } from "@/hooks/use-mutations";
import { CreateTaskItemDto, createTaskItemSchema } from "@/lib/schemas/schemas";
import { createPortal } from "react-dom";

interface CreateTaskModalProps {
   isOpen: boolean;
   onClose: () => void;
   workspaceId: string;
   boardId: string;
   columnId: string;
}

export function CreateTaskModal({ isOpen, onClose, workspaceId, boardId, columnId }: CreateTaskModalProps) {
   const t = useTranslations("Board.create_task"); //
   const { createTask } = useTaskMutations(workspaceId, boardId);
   const [mounted, setMounted] = useState(false);

   const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
   } = useForm<CreateTaskItemDto>({
      resolver: zodResolver(createTaskItemSchema),
      defaultValues: {
         title: "",
         description: "",
         columnId: columnId,
      }
   });

   useEffect(() => {
      setMounted(true);
      if (isOpen) reset({ title: "", description: "", columnId: columnId });
   }, [isOpen, columnId, reset]);

   const onSubmit = (data: CreateTaskItemDto) => {
      createTask.mutate({ columnId, data }, {
         onSuccess: () => {
            onClose();
         }
      });
   };

   if (!isOpen || !mounted) return null;

   return createPortal(
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
         <div
            className="bg-white dark:bg-[#1a2430] rounded-xl shadow-2xl w-full max-w-md border border-[#e8edf3] dark:border-[#2d3a4a] overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
         >
            <div className="px-6 py-4 border-b border-[#e8edf3] dark:border-[#2d3a4a] bg-[#f8fafb] dark:bg-[#111921] flex justify-between items-center">
               <h3 className="font-bold text-[#0e141b] dark:text-[#e8edf3]">{t("title")}</h3>
               <button onClick={onClose} className="text-[#507395] hover:text-[#0e141b] dark:hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
               </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
               {/* Hidden Column ID */}
               <input type="hidden" {...register("columnId")} />

               <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[#0e141b] dark:text-[#e8edf3]">{t("task_title_label")}</label>
                  <textarea
                     {...register("title")}
                     autoFocus
                     rows={2}
                     className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] py-2 px-3 text-sm text-[#0e141b] dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-colors"
                     placeholder={t("task_title_placeholder")}
                  />
                  {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
               </div>

               <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[#0e141b] dark:text-[#e8edf3]">{t("description_label")} <span className="font-normal text-[#507395]">{t("optional_hint")}</span></label>
                  <textarea
                     {...register("description")}
                     rows={3}
                     className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] py-2 px-3 text-sm text-[#0e141b] dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-colors"
                     placeholder={t("description_placeholder")}
                  />
               </div>

               <div className="flex justify-end gap-3 pt-2">
                  <button
                     type="button"
                     onClick={onClose}
                     className="px-4 py-2 text-sm font-medium text-[#507395] hover:bg-gray-100 dark:hover:bg-[#2d3a4a] rounded-lg transition-colors hover:cursor-pointer"
                  >
                     {t("cancel_button")}
                  </button>
                  <button
                     type="submit"
                     disabled={createTask.isPending}
                     className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2 hover:cursor-pointer"
                  >
                     {createTask.isPending && <span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>}
                     {t("create_button")}
                  </button>
               </div>
            </form>
         </div>
      </div>, document.body
   );
}