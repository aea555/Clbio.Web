"use client";

export function ThemeInitializer() {
  // This script runs instantly on the client, before React hydrates.
  // It reads the Zustand persist store from localStorage and applies the attribute.
  const script = `
    (function() {
      try {
        const storageKey = 'clbio-theme-storage';
        const persisted = localStorage.getItem(storageKey);
        if (persisted) {
          const parsed = JSON.parse(persisted);
          // Zustand persist structure is { state: { ... }, version: 0 }
          const color = parsed.state && parsed.state.accentColor;
          if (color) {
            document.documentElement.setAttribute('data-accent', color);
          }
        }
      } catch (e) {
        // If JSON parse fails or storage is blocked, fail silently (defaults to blue CSS)
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: script,
      }}
    />
  );
}