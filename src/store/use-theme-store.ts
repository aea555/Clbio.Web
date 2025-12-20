import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AccentColor = "blue" | "emerald" | "violet" | "amber" | "rose";

interface ThemeState {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      accentColor: "blue", // Default
      setAccentColor: (color) => {
        set({ accentColor: color });
        // Update DOM immediately
        document.documentElement.setAttribute("data-accent", color);
      },
    }),
    {
      name: "clbio-theme-storage",
      onRehydrateStorage: () => (state) => {
        // Apply theme on page load/hydrate
        if (state) {
            document.documentElement.setAttribute("data-accent", state.accentColor);
        }
      }
    }
  )
);