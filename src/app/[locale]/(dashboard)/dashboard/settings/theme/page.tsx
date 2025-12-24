"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl"; ///dashboard/settings/page.tsx]
import { useThemeStore, AccentColor, BackgroundTheme } from "@/store/use-theme-store";

const ACCENT_COLORS: { id: AccentColor; color: string }[] = [
    { id: "blue", color: "#4c99e6" },
    { id: "emerald", color: "#10b981" },
    { id: "violet", color: "#8b5cf6" },
    { id: "amber", color: "#f59e0b" },
    { id: "rose", color: "#f43f5e" },
];

export default function GeneralSettingsPage() {
    const t = useTranslations("GeneralSettings"); ///dashboard/settings/page.tsx]
    const { theme, setTheme } = useTheme();
    const {
        accentColor, setAccentColor,
        backgroundTheme, setBackgroundTheme,
        highContrast, setHighContrast
    } = useThemeStore();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Configuration for background previews based on current theme mode (Logic preserved)
    const bgThemes = useMemo(() => {
        const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        const themes = [
            {
                id: "default" as BackgroundTheme,
                name: isDark ? t("bg_styles.themes.default.dark") : t("bg_styles.themes.default.light"),
                desc: isDark ? t("bg_styles.themes.default.dark_desc") : t("bg_styles.themes.default.light_desc"),
                bg: isDark ? "bg-[#0f172a]" : "bg-[#fdfdfd]",
                card: isDark ? "bg-[#1e293b]" : "bg-white",
                border: isDark ? "border-[#334155]" : "border-[#e2e8f0]"
            },
            {
                id: "zinc" as BackgroundTheme,
                name: isDark ? t("bg_styles.themes.zinc.dark") : t("bg_styles.themes.zinc.light"),
                desc: isDark ? t("bg_styles.themes.zinc.dark_desc") : t("bg_styles.themes.zinc.light_desc"),
                bg: isDark ? "bg-[#09090b]" : "bg-[#f4f1ea]",
                card: isDark ? "bg-[#18181b]" : "bg-[#f9f7f2]",
                border: isDark ? "border-[#27272a]" : "border-[#e4decb]"
            },
            {
                id: "midnight" as BackgroundTheme,
                name: isDark ? t("bg_styles.themes.midnight.dark") : t("bg_styles.themes.midnight.light"),
                desc: isDark ? t("bg_styles.themes.midnight.dark_desc") : t("bg_styles.themes.midnight.light_desc"),
                bg: isDark ? "bg-black" : "bg-[#f0f2ff]",
                card: isDark ? "bg-[#09090b]" : "bg-[#f8f9ff]",
                border: isDark ? "border-[#1a1a1a]" : "border-[#dbe0fe]"
            },
        ];

        if (isDark) {
            themes.push(
                {
                    id: "darkcrimson" as BackgroundTheme,
                    name: t("bg_styles.themes.darkcrimson.name"),
                    desc: t("bg_styles.themes.darkcrimson.desc"),
                    bg: "bg-[#1a0f0f]",
                    card: "bg-[#251616]",
                    border: "border-[#452a2a]"
                },
                {
                    id: "darkblue" as BackgroundTheme,
                    name: t("bg_styles.themes.darkblue.name"),
                    desc: t("bg_styles.themes.darkblue.desc"),
                    bg: "bg-[#0a0f1d]",
                    card: "bg-[#11192e]",
                    border: "border-[#1e293b]"
                }
            );
        }

        return themes;
    }, [theme, t]);

    if (!mounted) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-300 pb-20">
            {/* Header */}
            <div className="border-b border-border-base pb-4">
                <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
                <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
            </div>

            {/* 1. Theme Mode & High Contrast */}
            <section className="bg-card rounded-xl border border-border-base p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <span className="material-symbols-outlined text-muted-foreground">contrast</span>
                        {t("appearance.title")}
                    </h3>

                    <button
                        onClick={() => setHighContrast(!highContrast)}
                        className={`hover:cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all text-xs font-bold ${highContrast
                            ? "border-primary bg-primary text-white"
                            : "border-border-base text-muted-foreground hover:border-primary/50"
                            }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                        {t("appearance.high_contrast")} {highContrast ? t("appearance.on") : t("appearance.off")}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["light", "dark", "system"].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setTheme(mode)}
                            className={`hover:cursor-pointer group relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === mode ? "border-primary bg-primary-light" : "border-border-base hover:border-primary/30"
                                }`}
                        >
                            <div className={`w-full aspect-video rounded-lg border flex flex-col overflow-hidden shadow-sm ${mode === 'dark' ? 'bg-[#111921] border-[#2d3a4a]' : mode === 'system' ? 'bg-gradient-to-br from-[#f8fafb] to-[#111921] border-border-base' : 'bg-[#f8fafb] border-[#e8edf3]'
                                }`}>
                                {mode === 'system' ? (
                                    <div className="w-full h-full flex items-center justify-center bg-white/50 dark:bg-black/20">
                                        <span className="material-symbols-outlined text-4xl text-muted-foreground">computer</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className={`h-3 w-full border-b ${mode === 'dark' ? 'bg-[#1a2430] border-[#2d3a4a]' : 'bg-white border-[#e8edf3]'}`}></div>
                                        <div className="flex-1 flex p-2 gap-2">
                                            <div className={`w-1/4 h-full rounded ${mode === 'dark' ? 'bg-[#2d3a4a]' : 'bg-gray-200/50'}`}></div>
                                            <div className="w-3/4 h-full space-y-2">
                                                <div className={`w-full h-2 rounded ${mode === 'dark' ? 'bg-[#2d3a4a]' : 'bg-white border border-[#e8edf3]'}`}></div>
                                                <div className={`w-2/3 h-2 rounded ${mode === 'dark' ? 'bg-primary/40' : 'bg-primary/20'}`}></div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <span className="text-sm font-medium">{t(`appearance.modes.${mode}`)}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* 2. Background Styles */}
            <section className="bg-card rounded-xl border border-border-base p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-muted-foreground">palette</span>
                    {theme === 'light' ? t("bg_styles.light_title") : t("bg_styles.dark_title")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {bgThemes.map((bg) => (
                        <button
                            key={bg.id}
                            onClick={() => setBackgroundTheme(bg.id)}
                            className={`hover:cursor-pointer group relative flex flex-col gap-3 p-4 rounded-xl border-2 transition-all ${backgroundTheme === bg.id
                                    ? "border-primary bg-primary-light"
                                    : "border-border-base hover:border-primary/30"
                                }`}
                        >
                            <div className={`w-full aspect-video rounded-lg border-2 flex flex-col overflow-hidden shadow-sm ${bg.bg} ${bg.border}`}>
                                <div className={`h-3 w-full border-b ${bg.card} ${bg.border}`}></div>
                                <div className="flex-1 flex p-2 gap-2">
                                    <div className={`w-1/4 h-full rounded ${bg.card} border ${bg.border}`}></div>
                                    <div className="w-3/4 h-full space-y-2">
                                        <div className={`w-full h-2 rounded ${bg.card} border ${bg.border}`}></div>
                                        <div className="w-full h-2 rounded flex gap-1">
                                            <div className="w-2/3 h-full rounded bg-primary/40"></div>
                                            <div className="w-1/3 h-full rounded bg-primary/20"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold">{bg.name}</p>
                                <p className="text-[11px] text-muted-foreground">{bg.desc}</p>
                            </div>

                            {backgroundTheme === bg.id && (
                                <div className="absolute top-2 right-2 text-primary">
                                    <span className="material-symbols-outlined text-[18px] fill-1">check_circle</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </section>

            {/* 3. Accent Color */}
            <section className="bg-card rounded-xl border border-border-base p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-muted-foreground">colorize</span>
                    {t("accent.title")}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">{t("accent.subtitle")}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {ACCENT_COLORS.map((color) => (
                        <button
                            key={color.id}
                            onClick={() => setAccentColor(color.id)}
                            className={`hover:cursor-pointer relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all hover:bg-muted/50 ${accentColor === color.id ? "border-primary bg-primary-light" : "border-border-base"
                                }`}
                        >
                            <div className="w-12 h-12 rounded-full shadow-sm ring-4 ring-background flex items-center justify-center transition-transform active:scale-95" style={{ backgroundColor: color.color }}>
                                {accentColor === color.id && <span className="material-symbols-outlined text-white font-bold drop-shadow-md animate-in zoom-in">check</span>}
                            </div>
                            <span className={`text-sm font-medium ${accentColor === color.id ? "text-primary" : "text-foreground"}`}>
                                {t(`accent.colors.${color.id}`)}
                            </span>
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
}