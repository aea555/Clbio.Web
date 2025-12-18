"use client";

import { useState } from "react";
import { useNotifications } from "@/hooks/use-queries";
import { useNotificationMutations } from "@/hooks/use-mutations";
import { formatDistanceToNow } from "date-fns";
import { PaginationMeta } from "@/types/dtos";

export default function NotificationsPage() {
   const [page, setPage] = useState(1);
   const [filter, setFilter] = useState<"all" | "unread">("all");

   const pageSize = 20;
   const unreadOnly = filter === "unread";

   const { data: result, isLoading } = useNotifications(page, pageSize, unreadOnly);
   const { markAsReadMutation, markAllReadMutation, deleteNotificationMutation } = useNotificationMutations();

   const notifications = result?.items || [];
   const totalPages = result?.total && result?.pageSize ? result?.total / result?.pageSize : 0;

   const handlePageChange = (newPage: number) => {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
   };

   return (
      <div className="max-w-4xl mx-auto w-full py-6">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
               <h2 className="text-2xl font-bold text-[#0e141b] dark:text-[#e8edf3]">Notifications</h2>
               <p className="text-[#507395] dark:text-[#94a3b8]">Stay updated with your workspace activity.</p>
            </div>

            <div className="flex items-center gap-3">
               {/* Filter Tabs */}
               <div className="bg-[#f8fafb] dark:bg-[#111921] p-1 rounded-lg border border-[#e8edf3] dark:border-[#2d3a4a] flex">
                  <button
                     onClick={() => setFilter("all")}
                     className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === "all" ? "bg-white dark:bg-[#1a2430] text-[#0e141b] dark:text-white shadow-sm" : "text-[#507395]"
                        }`}
                  >
                     All
                  </button>
                  <button
                     onClick={() => setFilter("unread")}
                     className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === "unread" ? "bg-white dark:bg-[#1a2430] text-[#0e141b] dark:text-white shadow-sm" : "text-[#507395]"
                        }`}
                  >
                     Unread
                  </button>
               </div>

               <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-[#1a2430] border border-[#e8edf3] dark:border-[#2d3a4a] text-sm font-bold text-[#507395] hover:text-[#4c99e6] hover:bg-gray-50 transition-colors shadow-sm"
               >
                  Mark all as read
               </button>
            </div>
         </div>

         <div className="bg-white dark:bg-[#1a2430] rounded-xl border border-[#e8edf3] dark:border-[#2d3a4a] overflow-hidden shadow-sm">
            {isLoading ? (
               <div className="p-12 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4c99e6]"></div>
               </div>
            ) : notifications.length === 0 ? (
               <div className="p-12 text-center text-[#507395]">
                  <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">notifications_off</span>
                  <p>No notifications found.</p>
               </div>
            ) : (
               <div className="divide-y divide-[#e8edf3] dark:divide-[#2d3a4a]">
                  {notifications.map((notif: any) => (
                     <div key={notif.id} className={`p-4 flex gap-4 hover:bg-[#f8fafb] dark:hover:bg-[#111921]/50 transition-colors group ${!notif.isRead ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}>
                        {/* Icon */}
                        <div className="mt-1">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!notif.isRead ? "bg-[#4c99e6]/10 text-[#4c99e6]" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                              <span className="material-symbols-outlined text-[20px]">
                                 {notif.type === "Mention" ? "alternate_email" : "notifications"}
                              </span>
                           </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                           <div className="flex justify-between items-start">
                              <h4 className="text-sm font-semibold text-[#0e141b] dark:text-[#e8edf3]">
                                 {notif.title}
                              </h4>
                              <span className="text-xs text-[#507395] dark:text-[#94a3b8]">
                                 {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                              </span>
                           </div>
                           <p className="text-sm text-[#507395] dark:text-[#94a3b8] mt-1">
                              {notif.messageText}
                           </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           {!notif.isRead && (
                              <button
                                 onClick={() => markAsReadMutation.mutate(notif.id)}
                                 // FIX: Added 'flex items-center justify-center' and 'leading-none'
                                 className="w-8 h-8 flex items-center justify-center text-[#4c99e6] hover:bg-[#4c99e6]/10 rounded-full transition-colors"
                                 title="Mark as read"
                              >
                                 <span className="material-symbols-outlined text-[20px] leading-none">check_circle</span>
                              </button>
                           )}
                           <button
                              onClick={() => deleteNotificationMutation.mutate(notif.id)}
                              // FIX: Added 'flex items-center justify-center' and 'leading-none'
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                              title="Delete"
                           >
                              <span className="material-symbols-outlined text-[20px] leading-none">delete</span>
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
               <div className="p-4 border-t border-[#e8edf3] dark:border-[#2d3a4a] flex items-center justify-between">
                  <button
                     onClick={() => handlePageChange(page - 1)}
                     disabled={page === 1}
                     className="px-3 py-1.5 text-sm font-medium border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                     Previous
                  </button>
                  <span className="text-sm text-[#507395]">Page {page} of {totalPages}</span>
                  <button
                     onClick={() => handlePageChange(page + 1)}
                     disabled={page === totalPages}
                     className="px-3 py-1.5 text-sm font-medium border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                     Next
                  </button>
               </div>
            )}
         </div>
      </div>
   );
}