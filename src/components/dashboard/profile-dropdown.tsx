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

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Prevent closing if the confirmation modal is active
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
      {/* Logout Confirmation (Portalled) */}
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
        className="absolute top-full right-0 mt-3 w-72 bg-white dark:bg-[#1a2430] rounded-xl shadow-xl border border-[#e8edf3] dark:border-[#2d3a4a] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
      >
        {/* 1. Avatar & User Info */}
        <div className="p-6 flex flex-col items-center border-b border-[#e8edf3] dark:border-[#2d3a4a] bg-[#f8fafb] dark:bg-[#111921]">
            <Link
                href="/dashboard/account/profile"
                onClick={onClose}
                className="relative group mb-3 cursor-pointer"
            >
                {user?.avatarUrl ? (
                    <img
                        src={user.avatarUrl}
                        alt="Profile"
                        className="size-20 rounded-full object-cover shadow-sm ring-4 ring-white dark:ring-[#2d3a4a] group-hover:brightness-75 transition-all"
                    />
                ) : (
                    <div className="size-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-3xl shadow-sm ring-4 ring-white dark:ring-[#2d3a4a] group-hover:bg-blue-700 transition-colors">
                        {user?.displayName?.charAt(0) || "U"}
                    </div>
                )}

                {/* Edit Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white drop-shadow-md text-[28px]">edit</span>
                </div>
            </Link>

            <h3 className="font-bold text-[#0e141b] dark:text-[#e8edf3] text-lg text-center truncate w-full px-2">
                {user?.displayName || "User"}
            </h3>
            <p className="text-sm text-[#507395] dark:text-[#94a3b8] truncate w-full text-center px-2">
                {user?.email}
            </p>
        </div>

        {/* 2. Navigation Links */}
        <div className="p-2 space-y-1">
            <Link
                href="/dashboard/account/profile"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-[#0e141b] dark:text-[#e8edf3] hover:bg-[#f8fafb] dark:hover:bg-[#2d3a4a] transition-colors"
            >
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#4c99e6]">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </div>
                My Profile
            </Link>
             <Link
                href="/dashboard/settings"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-[#0e141b] dark:text-[#e8edf3] hover:bg-[#f8fafb] dark:hover:bg-[#2d3a4a] transition-colors"
            >
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#507395]">
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                </div>
                Settings
            </Link>
        </div>

        {/* 3. Logout Button */}
        <div className="p-2 border-t border-[#e8edf3] dark:border-[#2d3a4a]">
            <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
                <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </div>
                Sign Out
            </button>
        </div>
      </div>
    </>
  );
}