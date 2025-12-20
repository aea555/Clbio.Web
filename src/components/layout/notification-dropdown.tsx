"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { useNotifications, useUnreadNotificationCount } from "@/hooks/use-queries";
import { useNotificationMutations } from "@/hooks/use-mutations";
import { formatDistanceToNow } from "date-fns";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data: result, isLoading } = useNotifications(1, 5);
  const { markAsReadMutation, markAllReadMutation } = useNotificationMutations();
  
  const notifications = result?.items || [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-12 mt-2 w-80 bg-white dark:bg-[#1a2430] rounded-xl shadow-2xl border border-[#e8edf3] dark:border-[#2d3a4a] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8edf3] dark:border-[#2d3a4a] bg-[#f8fafb] dark:bg-[#111921]">
        <h3 className="text-sm font-bold text-[#0e141b] dark:text-[#e8edf3]">Notifications</h3>
        {notifications.length > 0 && (
          <button 
            onClick={() => markAllReadMutation.mutate()}
            /* FIX: Dynamic Primary Color */
            className="text-xs text-primary hover:text-primary-hover font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        {isLoading && (
          <div className="p-4 flex justify-center">
            {/* FIX: Dynamic Spinner Color */}
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="p-6 text-center text-[#507395] dark:text-[#94a3b8] text-sm">
            No notifications yet.
          </div>
        )}

        {!isLoading && notifications.map((notif: any) => (
          <div 
            key={notif.id}
            className={`px-4 py-3 border-b border-[#e8edf3] dark:border-[#2d3a4a] hover:bg-[#f8fafb] dark:hover:bg-[#111921] transition-colors flex gap-3 group ${!notif.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
          >
            {/* Left Column: Icon + Mark Read Button */}
            <div className="flex flex-col items-center gap-2 mt-1">
               {/* Icon */}
               {/* FIX: Dynamic Background (primary-light) and Text (primary) */}
               <div className="w-8 h-8 flex-shrink-0 rounded-full bg-primary-light text-primary flex items-center justify-center">
                 <span className="material-symbols-outlined text-[18px] leading-none">
                   {notif.type === "Mention" ? "alternate_email" : "notifications"}
                 </span>
               </div>

               {/* Mark Read Button */}
               {!notif.isRead && (
                 <button 
                   onClick={(e) => { e.stopPropagation(); markAsReadMutation.mutate(notif.id); }}
                   /* FIX: Dynamic Hover State */
                   className="w-6 h-6 flex items-center justify-center rounded-full text-primary hover:bg-primary hover:text-white transition-all bg-white dark:bg-[#1a2430] border border-[#e8edf3] dark:border-[#3e4d5d] shadow-sm"
                   title="Mark as read"
                 >
                   <span className="material-symbols-outlined text-[14px] leading-none">check</span>
                 </button>
               )}
            </div>
            
            {/* Right Column: Text Content */}
            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-[#0e141b] dark:text-[#e8edf3]">
                    {notif.title}
                  </span>
                  {!notif.isRead && (
                    /* FIX: Dynamic Unread Badge */
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                  )}
               </div>
               
               <p className="text-sm text-[#0e141b] dark:text-[#e8edf3] leading-snug opacity-90">
                 {notif.messageText}
               </p>
               <p className="text-xs text-[#507395] dark:text-[#94a3b8] mt-1.5">
                 {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
               </p>
            </div>
          </div>
        ))}
      </div>

      <Link 
        href="/dashboard/settings/account/notifications"
        onClick={onClose}
        /* FIX: Dynamic Footer Link Hover */
        className="block w-full py-3 text-center text-sm font-medium text-[#507395] hover:text-primary hover:bg-[#f8fafb] dark:hover:bg-[#111921] transition-colors border-t border-[#e8edf3] dark:border-[#2d3a4a]"
      >
        View all notifications
      </Link>
    </div>
  );
}