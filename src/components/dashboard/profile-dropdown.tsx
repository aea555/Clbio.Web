"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/use-auth-store";
import { useAuthMutations } from "@/hooks/use-mutations";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileDropdown({ isOpen, onClose }: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const { logoutMutation } = useAuthMutations();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (!showLogoutConfirm) {
          onClose();
        }
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, showLogoutConfirm]);

  if (!isOpen) return null;

  return (
    <>
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => logoutMutation.mutate()}
        title="Sign Out"
        description="Are you sure you want to sign out?"
        confirmText="Sign Out"
        variant="primary"
        isLoading={logoutMutation.isPending}
      />

      <div
        ref={dropdownRef}
        // FIX: Using bg-card and border-border-base for theme syncing
        className="absolute top-full right-0 mt-3 w-72 bg-card rounded-xl shadow-xl border border-border-base overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-100 origin-top-right"
      >
        {/* 1. Avatar & User Info - Using bg-background for subtle contrast */}
        <div className="p-6 flex flex-col items-center border-b border-border-base bg-background">
            <Link
                href="/dashboard/settings/account"
                onClick={onClose}
                className="relative group mb-3 cursor-pointer"
            >
                {user?.avatarUrl ? (
                    <img
                        src={user.avatarUrl}
                        alt="Profile"
                        // FIX: ring color now matches the background theme
                        className="size-20 rounded-full object-cover shadow-sm ring-4 ring-background group-hover:brightness-75 transition-all"
                    />
                ) : (
                    <div className="size-20 rounded-full bg-primary flex items-center justify-center text-white font-bold text-3xl shadow-sm ring-4 ring-background group-hover:opacity-90 transition-opacity">
                        {user?.displayName?.charAt(0) || "U"}
                    </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white drop-shadow-md text-[28px]">edit</span>
                </div>
            </Link>

            <h3 className="font-bold text-foreground text-lg text-center truncate w-full px-2 leading-tight">
                {user?.displayName || "User"}
            </h3>
            <p className="text-sm text-muted-foreground truncate w-full text-center px-2 mt-1">
                {user?.email}
            </p>
        </div>

        {/* 2. Navigation Links */}
        <div className="p-2 space-y-1">
            <Link
                href="/dashboard/settings/account"
                onClick={onClose}
                // FIX: Hover matches the background variable
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-background transition-colors"
            >
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </div>
                My Profile
            </Link>
             <Link
                href="/dashboard/settings/theme"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-background transition-colors"
            >
                {/* FIX: Using muted-foreground logic for secondary icons */}
                <div className="w-8 h-8 rounded-full bg-border-base/50 flex items-center justify-center text-muted-foreground">
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                </div>
                Appearance
            </Link>
        </div>

        {/* 3. Logout Button */}
        <div className="p-2 border-t border-border-base">
            <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full hover:cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
            >
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </div>
                Sign Out
            </button>
        </div>
      </div>
    </>
  );
}