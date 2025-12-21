"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 transition-colors duration-300 relative overflow-hidden">
      {/* Subtle background decorative element */}
      <div className="absolute inset-0 bg-black/[0.02] dark:bg-black/[0.15] pointer-events-none" />
      
      <div className="relative z-10 text-center max-w-md">
        {/* Animated Icon Container */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-primary-light rounded-3xl flex items-center justify-center text-primary rotate-12 animate-in zoom-in duration-500">
            <span className="material-symbols-outlined text-[48px] fill-1">
              extension_off
            </span>
          </div>
        </div>

        <h1 className="text-6xl font-black text-foreground mb-4 tracking-tighter">
          404
        </h1>
        
        <h2 className="text-xl font-bold text-foreground mb-3">
          Lost in the workspace?
        </h2>
        
        <p className="text-muted-foreground mb-10 leading-relaxed">
          The page you're looking for doesn't exist or has been moved to a different coordinate.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-border-base text-foreground font-bold hover:bg-card transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Go Back
          </button>
          
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            Dashboard
          </Link>
        </div>
      </div>

      {/* Subtle branding at the bottom */}
      <div className="absolute bottom-8 text-muted-foreground/30 font-bold text-sm tracking-widest uppercase">
        Clbio by aea555
      </div>
    </div>
  );
}