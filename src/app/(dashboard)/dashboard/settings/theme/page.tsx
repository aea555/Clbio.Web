"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useThemeStore, AccentColor } from "@/store/use-theme-store";

// Define our palette options
const ACCENT_COLORS: { id: AccentColor; name: string; color: string }[] = [
  { id: "blue", name: "Ocean", color: "#4c99e6" },
  { id: "emerald", name: "Forest", color: "#10b981" },
  { id: "violet", name: "Royal", color: "#8b5cf6" },
  { id: "amber", name: "Sunset", color: "#f59e0b" },
  { id: "rose", name: "Berry", color: "#f43f5e" },
];

export default function GeneralSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { accentColor, setAccentColor } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Ensure attribute is synced on mount
    document.documentElement.setAttribute("data-accent", accentColor);
  }, [accentColor]);

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="border-b border-[#e8edf3] dark:border-[#2d3a4a] pb-4">
        <h1 className="text-2xl font-bold text-[#0e141b] dark:text-[#e8edf3]">General Settings</h1>
        <p className="text-[#507395] dark:text-[#94a3b8] mt-1">Customize your workspace appearance and preferences.</p>
      </div>

      {/* 1. Theme Mode (Light/Dark) */}
      <section className="bg-white dark:bg-[#1a2430] rounded-xl border border-[#e8edf3] dark:border-[#2d3a4a] p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#0e141b] dark:text-[#e8edf3] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#507395]">contrast</span>
            Appearance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["light", "dark", "system"].map((mode) => (
             <button
                key={mode}
                onClick={() => setTheme(mode)}
                className={`group relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  theme === mode
                    ? "border-primary bg-primary-light" // Using new dynamic classes
                    : "border-[#e8edf3] dark:border-[#3e4d5d] hover:border-[#bcccdc] dark:hover:border-[#507395]"
                }`}
              >
                {/* Visual Preview */}
                <div className={`w-full aspect-video rounded-lg border flex flex-col overflow-hidden shadow-sm ${
                    mode === 'dark' 
                        ? 'bg-[#111921] border-[#2d3a4a]' 
                        : mode === 'system' 
                            ? 'bg-gradient-to-br from-[#f8fafb] to-[#111921] border-[#e8edf3] dark:border-[#3e4d5d]'
                            : 'bg-[#f8fafb] border-[#e8edf3]'
                }`}>
                    {mode === 'system' ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-[#507395]">computer</span>
                        </div>
                    ) : (
                        <>
                            <div className={`h-3 w-full border-b ${mode === 'dark' ? 'bg-[#1a2430] border-[#2d3a4a]' : 'bg-white border-[#e8edf3]'}`}></div>
                            <div className="flex-1 flex p-2 gap-2">
                                <div className={`w-1/4 h-full rounded ${mode === 'dark' ? 'bg-[#2d3a4a]' : 'bg-gray-200/50'}`}></div>
                                <div className="w-3/4 h-full space-y-2">
                                    <div className={`w-full h-2 rounded ${mode === 'dark' ? 'bg-[#1a2430]' : 'bg-white'}`}></div>
                                    <div className={`w-2/3 h-2 rounded ${mode === 'dark' ? 'bg-[#1a2430]' : 'bg-white'}`}></div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                
                <div className="flex items-center gap-2">
                   <span className="material-symbols-outlined fill-1" style={{ 
                       color: mode === 'light' ? '#f59e0b' : mode === 'dark' ? '#818cf8' : '#507395' 
                   }}>
                       {mode === 'light' ? 'light_mode' : mode === 'dark' ? 'dark_mode' : 'settings_system_daydream'}
                   </span>
                   <span className={`text-sm font-medium capitalize ${theme === mode ? "text-primary" : "text-[#507395] dark:text-[#94a3b8]"}`}>
                       {mode}
                   </span>
                </div>
                
                {theme === mode && (
                    <div className="absolute top-3 right-3 text-primary animate-in zoom-in">
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    </div>
                )}
             </button>
          ))}
        </div>
      </section>

      {/* 2. Accent Color */}
      <section className="bg-white dark:bg-[#1a2430] rounded-xl border border-[#e8edf3] dark:border-[#2d3a4a] p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#0e141b] dark:text-[#e8edf3] mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#507395]">palette</span>
            Accent Color
        </h3>
        <p className="text-sm text-[#507395] dark:text-[#94a3b8] mb-6">
            Choose a primary color for buttons, links, and active states.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {ACCENT_COLORS.map((color) => (
                <button
                    key={color.id}
                    onClick={() => setAccentColor(color.id)}
                    className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all hover:bg-gray-50 dark:hover:bg-[#111921] ${
                        accentColor === color.id 
                            ? "border-primary bg-primary-light" 
                            : "border-[#e8edf3] dark:border-[#3e4d5d]"
                    }`}
                >
                    {/* Color Swatch */}
                    <div 
                        className="w-12 h-12 rounded-full shadow-sm ring-4 ring-white dark:ring-[#2d3a4a] flex items-center justify-center transition-transform active:scale-95"
                        style={{ backgroundColor: color.color }}
                    >
                        {accentColor === color.id && (
                            <span className="material-symbols-outlined text-white font-bold drop-shadow-md animate-in zoom-in">check</span>
                        )}
                    </div>

                    <span className={`text-sm font-medium ${accentColor === color.id ? "text-primary" : "text-[#0e141b] dark:text-[#e8edf3]"}`}>
                        {color.name}
                    </span>
                </button>
            ))}
        </div>

        {/* Live Preview of Buttons */}
        <div className="mt-8 pt-6 border-t border-[#e8edf3] dark:border-[#2d3a4a]">
            <p className="text-xs font-bold text-[#507395] uppercase tracking-wider mb-4">Preview</p>
            <div className="flex flex-wrap gap-4 items-center">
                <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
                    Primary Button
                </button>
                <button className="px-4 py-2 rounded-lg bg-white dark:bg-[#111921] border border-primary text-primary text-sm font-bold shadow-sm hover:bg-primary-light transition-colors">
                    Secondary Button
                </button>
                <div className="text-sm">
                    <span className="text-[#0e141b] dark:text-[#e8edf3]">Links will look like </span>
                    <a href="#" className="text-primary hover:underline font-medium">this link</a>
                    <span className="text-[#0e141b] dark:text-[#e8edf3]">.</span>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}