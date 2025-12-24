"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl"; ///dashboard/settings/notifications/page.tsx]
import { useThemeStore } from "@/store/use-theme-store";

const SOUND_OPTIONS = [
  { id: "chime.mp3", key: "chime" },
  { id: "pop.mp3", key: "pop" },
];

export default function NotificationSettingsPage() {
  const t = useTranslations("NotificationSettings"); ///dashboard/settings/notifications/page.tsx]
  const { 
    notificationSound, setNotificationSound, 
    notificationVolume, setNotificationVolume,
    notificationSoundFile, setNotificationSoundFile
  } = useThemeStore();
  
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    audioRef.current = new Audio();
  }, []);

  if (!mounted) return null;

  const playPreview = (fileName: string) => {
    if (!audioRef.current) return;

    audioRef.current.src = `${window.location.origin}/sounds/${fileName}`;
    audioRef.current.volume = notificationVolume;
    audioRef.current.currentTime = 0;
    
    audioRef.current.play().catch(e => {
        console.warn("Playback blocked by browser. Interact with the page first.", e);
    });
  };

  const handleSoundSelect = (file: string) => {
    setNotificationSoundFile(file);
    playPreview(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-border-base pb-4">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <section className="bg-card rounded-xl border border-border-base p-6 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
            <div className="space-y-0.5">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="material-symbols-outlined text-muted-foreground">volume_up</span>
                    {t("sounds_title")}
                </h3>
                <p className="text-sm text-muted-foreground">{t("sounds_subtitle")}</p>
            </div>
            <button
                onClick={() => setNotificationSound(!notificationSound)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors hover:cursor-pointer ${
                notificationSound ? "bg-primary" : "bg-border-base"
                }`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSound ? "translate-x-6" : "translate-x-1"
                }`} />
            </button>
        </div>

        {notificationSound && (
          <div className="space-y-8 animate-in slide-in-from-top-2 duration-300">
            {/* Volume Slider */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">{t("volume_label")}</label>
                    <span className="text-xs font-bold text-primary">{Math.round(notificationVolume * 100)}%</span>
                </div>
                <input
                    type="range" min="0" max="1" step="0.01"
                    value={notificationVolume}
                    onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setNotificationVolume(val);
                        if(audioRef.current) audioRef.current.volume = val;
                    }}
                    className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>

            {/* Sound Choice */}
            <div className="space-y-4">
                <label className="text-sm font-medium text-foreground">{t("select_sound_label")}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SOUND_OPTIONS.map((sound) => (
                        <button
                            key={sound.id}
                            onClick={() => handleSoundSelect(sound.id)}
                            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all hover:cursor-pointer ${
                                notificationSoundFile === sound.id 
                                ? "border-primary bg-primary-light text-primary" 
                                : "border-border-base hover:border-primary/30"
                            }`}
                        >
                            <span className="text-sm font-medium">{t(`sounds.${sound.key}`)}</span>
                            <span className="material-symbols-outlined text-[20px]">
                                {notificationSoundFile === sound.id ? 'check_circle' : 'play_circle'}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}