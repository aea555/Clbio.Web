"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "warning";
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
}: ConfirmationModalProps) {
  const [mounted, setMounted] = useState(false);
  // Close on Escape key
  useEffect(() => {
    setMounted(true);
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  // Variant Styles
  const confirmBtnStyles = {
    /* FIX: Replaced hardcoded hex values with dynamic primary classes */
    primary: "bg-primary hover:bg-primary-hover text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-amber-500 hover:bg-amber-600 text-white",
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#1a2430] rounded-xl shadow-2xl w-full max-w-sm border border-[#e8edf3] dark:border-[#2d3a4a] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          {/* Icon based on variant */}
          <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
              variant === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                /* FIX: Replaced bg-blue-100/text-blue-600 with dynamic primary theme */
                'bg-primary-light text-primary'
            }`}>
            <span className="material-symbols-outlined text-[28px]">
              {variant === 'danger' ? 'warning' : variant === 'warning' ? 'priority_high' : 'info'}
            </span>
          </div>

          <h3 className="text-lg font-bold text-[#0e141b] dark:text-[#e8edf3] mb-2">{title}</h3>
          <p className="text-sm text-[#507395] dark:text-[#94a3b8] leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="hover:cursor-pointer flex-1 px-4 py-2.5 rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] text-sm font-medium text-[#507395] hover:bg-gray-50 dark:hover:bg-[#111921] transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`hover:cursor-pointer flex-1 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${confirmBtnStyles[variant]}`}
          >
            {isLoading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
            {confirmText}
          </button>
        </div>
      </div>
    </div>, document.body);
}