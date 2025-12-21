"use client";

import { useEffect, useState, useRef } from "react";
import { useThemeStore } from "@/store/use-theme-store";

const SOUND_OPTIONS = [
  { id: "chime.mp3", name: "Chime" },
  { id: "pop.mp3", name: "Pop" },
];

export default function NotificationSettingsPage() {
  const { 
    notificationSound, setNotificationSound, 
    notificationVolume, setNotificationVolume,
    notificationSoundFile, setNotificationSoundFile
  } = useThemeStore();
  
  const [mounted, setMounted] = useState(false);
  
  // 1. Initialize the Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    // Create the persistent audio instance
    audioRef.current = new Audio();
  }, []);

  if (!mounted) return null;

  // 2. Play preview using the Ref
  const playPreview = (fileName: string) => {
    if (!audioRef.current) return;

    // Update source and volume to latest settings
    audioRef.current.src = `/sounds/${fileName}`;
    audioRef.current.volume = notificationVolume;
    
    // Reset to start so rapid clicks play the start of the sound every time
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
        <h1 className="text-2xl font-bold text-foreground">Notification Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your workspace alerts and sounds.</p>
      </div>

      <section className="bg-card rounded-xl border border-border-base p-6 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
            <div className="space-y-0.5">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="material-symbols-outlined text-muted-foreground">volume_up</span>
                    Notification Sounds
                </h3>
                <p className="text-sm text-muted-foreground">Hear an alert when you receive a notification.</p>
            </div>
            <button
                onClick={() => setNotificationSound(!notificationSound)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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
                    <label className="text-sm font-medium text-foreground">Alert Volume</label>
                    <span className="text-xs font-bold text-primary">{Math.round(notificationVolume * 100)}%</span>
                </div>
                <input
                    type="range" min="0" max="1" step="0.01"
                    value={notificationVolume}
                    onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setNotificationVolume(val);
                        // Sync existing audio ref volume immediately for feedback
                        if(audioRef.current) audioRef.current.volume = val;
                    }}
                    className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>

            {/* Sound Choice */}
            <div className="space-y-4">
                <label className="text-sm font-medium text-foreground">Select Alert Sound</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SOUND_OPTIONS.map((sound) => (
                        <button
                            key={sound.id}
                            onClick={() => handleSoundSelect(sound.id)}
                            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                                notificationSoundFile === sound.id 
                                ? "border-primary bg-primary-light text-primary" 
                                : "border-border-base hover:border-primary/30"
                            }`}
                        >
                            <span className="text-sm font-medium">{sound.name}</span>
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