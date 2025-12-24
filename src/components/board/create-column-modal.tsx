"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useColumnMutations } from "@/hooks/use-mutations"; // Assume this exists or needs creating
import { toast } from "sonner";
import { CreateColumnDto, createColumnSchema } from "@/lib/schemas/schemas";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
// You might need to create useColumnMutations if not exists

export function CreateColumnModal({ isOpen, onClose, workspaceId, boardId }: { isOpen: boolean; onClose: () => void; workspaceId: string; boardId: string }) {
   const { createColumn } = useColumnMutations(workspaceId, boardId);
   const [mounted, setMounted] = useState(false);

   const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
   } = useForm<CreateColumnDto>({
      resolver: zodResolver(createColumnSchema),
      defaultValues: {
         name: "",
         boardId: boardId
      }
   });

   useEffect(() => {
      setMounted(true);
      if (isOpen) reset({ name: "", boardId });
   }, [isOpen, boardId, reset]);

   const onSubmit = (data: CreateColumnDto) => {
      createColumn.mutate(data, {
         onSuccess: () => {
            toast.success("Column created!");
            onClose();
         }
      });
   };

   if (!isOpen || !mounted) return null;

   return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
         <div className="bg-white dark:bg-[#1a2430] rounded-xl shadow-2xl w-full max-w-sm border border-[#e8edf3] dark:border-[#2d3a4a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e8edf3] dark:border-[#2d3a4a] bg-[#f8fafb] dark:bg-[#111921] flex justify-between items-center">
               <h3 className="font-bold text-[#0e141b] dark:text-[#e8edf3]">Add List</h3>
               <button onClick={onClose}><span className="hover:cursor-pointer material-symbols-outlined text-[#507395]">close</span></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-semibold text-[#0e141b] dark:text-[#e8edf3] mb-1">List Name</label>
                  <input
                     {...register("name")}
                     autoFocus
                     className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                     placeholder="e.g. To Do"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
               </div>

               <div className="flex justify-end gap-2">
                  <button type="button" onClick={onClose} className="hover:cursor-pointer px-3 py-2 text-sm text-[#507395] hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button
                     type="submit"
                     disabled={createColumn.isPending}
                     className="hover:cursor-pointer px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-bold"
                  >
                     {createColumn.isPending ? "Adding..." : "Add List"}
                  </button>
               </div>
            </form>
         </div>
      </div>, document.body
   );
}