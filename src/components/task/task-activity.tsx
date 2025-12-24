"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl"; //
import { useComments, useOnlinePresence } from "@/hooks/use-queries";
import { useCommentMutations } from "@/hooks/use-mutations";
import { useAuthStore } from "@/store/use-auth-store";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale"; //
import { UserAvatar } from "@/components/ui/user-avatar";
import { ConfirmationModal } from "../ui/confirmation-modal";
import { usePermissions } from "@/providers/permission-provider";

export function TaskActivity({ taskId, workspaceId, isArchived = false }: { taskId: string, workspaceId: string, isArchived?: boolean }) {
   const t = useTranslations("TaskActivity"); //
   const locale = useLocale(); //
   const { user } = useAuthStore();
   const { can } = usePermissions();
   const { data: comments, isLoading } = useComments(workspaceId, taskId);
   const { createComment, deleteComment } = useCommentMutations(workspaceId, taskId);
   const [newComment, setNewComment] = useState("");
   const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] = useState(false);
   const [commentIdToDelete, setCommentIdToDelete] = useState("");

   // Date-fns locale selector
   const dateLocale = locale === "tr" ? tr : enUS;

   const authorIds = useMemo(() => {
      const ids = comments?.map(c => c.authorId).filter(Boolean) || [];
      return Array.from(new Set(ids));
   }, [comments]);

   const { data: onlineUserIds } = useOnlinePresence(authorIds);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim()) return;
      createComment.mutate({ body: newComment }, {
         onSuccess: () => setNewComment("")
      });
   };

   const handleDeleteCommentModalClick = (id: string) => {
      setIsDeleteCommentModalOpen(prev => !prev);
      setCommentIdToDelete(prev => (prev == id ? "" : id));
   }

   const handleDelete = () => {
      if (isArchived) return;
      if (commentIdToDelete){
         deleteComment.mutate(commentIdToDelete);
         handleDeleteCommentModalClick("");
      }
   }

   return (
      <div className="space-y-6">
         <ConfirmationModal 
            isOpen={isDeleteCommentModalOpen} 
            onClose={() => handleDeleteCommentModalClick("")} 
            onConfirm={handleDelete} 
            title={t("delete_modal.title")} 
            description={t("delete_modal.description")} 
            confirmText={t("delete_modal.confirm")} 
            variant="warning" 
            isLoading={deleteComment.isPending} 
         />

         <div className="flex justify-between items-center">
            <h3 className="font-bold text-[#0e141b] dark:text-[#e8edf3] flex items-center gap-2">
               <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
               {t("title")}
            </h3>
         </div>

         {/* Input Area */}
         {!isArchived && (
            <div className="flex gap-3">
               <div className="flex-shrink-0">
                  <UserAvatar
                     workspaceId={workspaceId}
                     src={user?.avatarUrl}
                     name={user?.displayName || t("me")}
                     size="md"
                  />
               </div>

               <form onSubmit={handleSubmit} className="flex-1 space-y-2">
                  <div className="relative">
                     <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={t("input_placeholder")}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#1a2430] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-sm resize-none"
                     />
                  </div>
                  {newComment.length > 0 && (
                     <button
                        type="submit"
                        disabled={createComment.isPending}
                        className="hover:cursor-pointer px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-md transition-colors"
                     >
                        {t("save")}
                     </button>
                  )}
               </form>
            </div>
         )}


         {/* Comment List */}
         <div className="space-y-4">
            {comments?.map((comment) => (
               <div key={comment.id} className="flex gap-3 group">
                  <div className="flex-shrink-0">
                     <UserAvatar
                        workspaceId={workspaceId}
                        src={comment.authorAvatarUrl}
                        name={comment.authorDisplayName}
                        isOnline={onlineUserIds?.includes(comment.authorId)}
                        size="md"
                     />
                  </div>

                  <div className="flex-1">
                     <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-[#0e141b] dark:text-[#e8edf3]">
                           {comment.authorDisplayName}
                        </span>
                        <span className="text-xs text-[#507395]">
                           {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: dateLocale })}
                        </span>
                     </div>
                     <div className="text-sm text-[#0e141b] dark:text-[#e8edf3] bg-white dark:bg-[#1a2430] p-3 rounded-lg border border-[#e8edf3] dark:border-[#2d3a4a] shadow-sm whitespace-pre-wrap">
                        {comment.body}
                     </div>
                     <div className="flex items-center gap-2 mt-1">
                        {!isArchived && user?.id === comment.authorId && (
                           <button
                              onClick={() => handleDeleteCommentModalClick(comment.id)}
                              className="hover:cursor-pointer text-xs text-[#507395] hover:text-red-500 underline opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                              {t("delete")}
                           </button>
                        )}
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}