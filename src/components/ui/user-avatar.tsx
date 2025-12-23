"use client";

import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name: string;
  isOnline?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ src, name, isOnline = false, className, size = "md" }: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
  };

  return (
    <div className={cn("relative inline-block shrink-0", className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn("rounded-full object-cover border border-gray-200 dark:border-gray-700", sizeClasses[size])}
        />
      ) : (
        <div
          className={cn(
            "rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm",
            sizeClasses[size]
          )}
        >
          {name?.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Online Status Dot */}
      {isOnline && (
        <span 
            className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-[#111921] bg-green-500 transform translate-x-1/4 translate-y-1/4" 
            title="Online"
        />
      )}
    </div>
  );
}