"use client";

import { useState, useEffect } from "react";
import { useViewFile } from "@/hooks/use-queries";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  workspaceId: string | null;
  src?: string | null;
  name: string;
  isOnline?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ workspaceId, src, name, isOnline = false, className, size = "md" }: UserAvatarProps) {
  // const [showPreview, setShowPreview] = useState(false);
  // const { data: presignedUrl, isLoading } = useViewFile(workspaceId || "", src ? encodeURIComponent(src) : "");
  // console.log("PRESIGNED: " + presignedUrl);
  // const shouldShowImage = src && presignedUrl && !isLoading;

  // useEffect(() => {
  //   if (showPreview) {
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = "unset";
  //   }
  // }, [showPreview]);

  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
  };

  return (
    <>
      <div className={cn("relative inline-block shrink-0", className)}>
        {/* {shouldShowImage ? (
          <img
            src={null}
            alt={name}
            onClick={() => setShowPreview(true)}
            className={cn(
              "rounded-full object-cover border border-gray-200 dark:border-gray-700 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all",
              sizeClasses[size]
            )}
          />
        ) : (
          <div
            className={cn(
              "rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm",
              sizeClasses[size],
              isLoading && "animate-pulse"
            )}
          >
            {name?.charAt(0).toUpperCase()}
          </div>
        )} */}

        <div
            className={cn(
              "rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm",
              sizeClasses[size]
            )}
          >
            {name?.charAt(0).toUpperCase()}
          </div>

        {isOnline && (
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-[#111921] bg-green-500 transform translate-x-1/4 translate-y-1/4" />
        )}
      </div>

      {/* {showPreview && shouldShowImage && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setShowPreview(false)}
        >
          <div 
            className="relative p-2 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreview(false)}
              className="absolute hover:cursor-pointer -top-12 -right-4 text-white hover:text-gray-300 transition-colors p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-100">
              <img
                src={presignedUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="text-center mt-4">
              <p className="text-white font-medium text-lg">{name}</p>
            </div>
          </div>
        </div>
      )} */}
    </>
  );
}