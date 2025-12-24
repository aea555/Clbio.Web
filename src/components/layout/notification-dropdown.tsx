"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl"; //
import { useNotifications } from "@/hooks/use-queries";
import { useNotificationMutations } from "@/hooks/use-mutations";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale"; //

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const t = useTranslations("NotificationDropdown"); //
  const locale = useLocale(); //
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data: result, isLoading } = useNotifications(1, 5);
  const { markAsReadMutation, markAllReadMutation } = useNotificationMutations();
  
  const notifications = result?.items || [];

  // Date-fns locale selector
  const dateLocale = locale === "tr" ? tr : enUS;

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
      className="absolute right-0 top-12 mt-2 w-80 bg-card rounded-xl shadow-2xl border border-border-base z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-base bg-background">
        <h3 className="text-sm font-bold text-foreground">{t("title")}</h3>
        {notifications.length > 0 && (
          <button 
            onClick={() => markAllReadMutation.mutate()}
            className="text-xs text-primary hover:cursor-pointer hover:text-primary-hover font-bold transition-colors"
          >
            {t("mark_all_read")}
          </button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {isLoading && (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            {t("empty")}
          </div>
        )}

        {!isLoading && notifications.map((notif: any) => (
          <div 
            key={notif.id}
            className={`px-4 py-4 border-b border-border-base hover:bg-background transition-colors flex gap-3 group ${
              !notif.isRead ? "bg-primary-light/30" : ""
            }`}
          >
            <div className="flex flex-col items-center gap-3 mt-0.5">
               <div className="w-9 h-9 flex-shrink-0 rounded-full bg-primary-light text-primary flex items-center justify-center border border-primary/10">
                 <span className="material-symbols-outlined text-[20px] leading-none">
                   {notif.type === "Mention" ? "alternate_email" : "notifications"}
                 </span>
               </div>

               {!notif.isRead && (
                 <button 
                   onClick={(e) => { e.stopPropagation(); markAsReadMutation.mutate(notif.id); }}
                   className="w-6 h-6 flex items-center justify-center rounded-full text-primary hover:bg-primary hover:text-white transition-all bg-card border border-border-base shadow-sm hover:cursor-pointer"
                   title={t("mark_as_read")}
                 >
                   <span className="material-symbols-outlined text-[14px] leading-none">check</span>
                 </button>
               )}
            </div>
            
            <div className="flex-1 min-w-0">
               <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-sm font-bold text-foreground leading-tight">
                    {notif.title}
                  </span>
                  {!notif.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-1 shadow-[0_0_8px_var(--accent-color)]"></span>
                  )}
               </div>
               
               <p className="text-sm text-foreground/80 leading-snug">
                 {notif.messageText}
               </p>
               <p className="text-[11px] font-medium text-muted-foreground mt-2 uppercase tracking-wider">
                 {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: dateLocale })}
               </p>
            </div>
          </div>
        ))}
      </div>

      <Link 
        href="/dashboard/settings/account/notifications"
        onClick={onClose}
        className="block w-full py-3.5 text-center text-sm font-bold text-muted-foreground hover:text-primary hover:bg-background transition-colors border-t border-border-base bg-card hover:cursor-pointer"
      >
        {t("view_all")}
      </Link>
    </div>
  );
}