"use client";

export function ThemeInitializer() {
  const script = `
    (function() {
      try {
        const storageKey = 'clbio-theme-storage';
        const persisted = localStorage.getItem(storageKey);
        if (persisted) {
          const parsed = JSON.parse(persisted);
          const state = parsed.state;
          if (state) {
            // 1. Apply Accent Color
            if (state.accentColor) {
              document.documentElement.setAttribute('data-accent', state.accentColor);
            }
            // 2. Apply Background Theme (Crucial for Dark Mode variants)
            if (state.backgroundTheme) {
              document.documentElement.setAttribute('data-bg', state.backgroundTheme);
            }
            // 3. Apply High Contrast
            document.documentElement.setAttribute('data-contrast', state.highContrast ? 'high' : 'normal');
          }
        }
      } catch (e) {}
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