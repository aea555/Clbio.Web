import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AccentColor = "blue" | "emerald" | "violet" | "amber" | "rose";
export type BackgroundTheme = "default" | "zinc" | "midnight" | "darkcrimson" | "darkblue";

interface ThemeState {
  // --- State ---
  accentColor: AccentColor;
  backgroundTheme: BackgroundTheme;
  highContrast: boolean;
  notificationSound: boolean;
  notificationVolume: number;
  notificationSoundFile: string;

  // --- Actions ---
  setAccentColor: (color: AccentColor) => void;
  setBackgroundTheme: (bg: BackgroundTheme) => void;
  setHighContrast: (enabled: boolean) => void;
  setNotificationSound: (enabled: boolean) => void;
  setNotificationVolume: (volume: number) => void;
  setNotificationSoundFile: (file: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      accentColor: "blue",
      backgroundTheme: "default",
      highContrast: false,
      notificationSound: true, // Default to on
      notificationVolume: 0.5, // Default to 50%
      notificationSoundFile: "pop.mp3",

      setAccentColor: (color) => {
        set({ accentColor: color });
        document.documentElement.setAttribute("data-accent", color);
      },
      setBackgroundTheme: (bg) => {
        set({ backgroundTheme: bg });
        document.documentElement.setAttribute("data-bg", bg);
      },
      setHighContrast: (enabled) => {
        set({ highContrast: enabled });
        document.documentElement.setAttribute("data-contrast", enabled ? "high" : "normal");
      },
      setNotificationSound: (enabled) => set({ notificationSound: enabled }),
      setNotificationVolume: (volume) => set({ notificationVolume: volume }),
      setNotificationSoundFile: (file) => set({ notificationSoundFile: file }),
    }),
    {
      name: "clbio-theme-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute("data-accent", state.accentColor);
          document.documentElement.setAttribute("data-bg", state.backgroundTheme);
          document.documentElement.setAttribute("data-contrast", state.highContrast ? "high" : "normal");
        }
      },
    }
  )
);