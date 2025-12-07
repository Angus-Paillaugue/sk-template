export const availableThemes = ['material', 'vercel', 'sleek-black', 'claude'] as const;
export type Theme = (typeof availableThemes)[number];
export const availableModes = ['light', 'dark', 'system'] as const;
export type Mode = (typeof availableModes)[number];
export const effectiveModes = ['light', 'dark'] as const;
export type EffectiveMode = (typeof effectiveModes)[number];

export class ThemingClass {
  theme = $state<Theme>(availableThemes[0]);
  mode = $state<Mode>('system');

  getTheme(wantedTheme: string | null | undefined): Theme {
    if (wantedTheme && availableThemes.includes(wantedTheme as Theme)) {
      return wantedTheme as Theme;
    }
    return availableThemes[0];
  }

  getMode(wantedMode: string | null | undefined): Mode {
    if (wantedMode && availableModes.includes(wantedMode as Mode)) {
      return wantedMode as Mode;
    }
    return 'system';
  }

  static saveAndApply(mode: Mode, theme: Theme) {
    const applyTheme = (theme: Theme) => {
      document.documentElement.setAttribute('data-theme', theme);
    };
    const applyMode = (mode: Mode) => {
      if (availableModes.indexOf(mode) === -1) {
        mode = 'system';
      }
      let effective = mode;
      document.documentElement.setAttribute('data-mode', mode);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.style.removeProperty('color-scheme');
      if (mode === 'light' || mode === 'dark') {
        document.documentElement.classList.add(mode);
        document.documentElement.style.setProperty('color-scheme', mode);
      }
      if (mode === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
        document.documentElement.style.setProperty('color-scheme', prefersDark ? 'dark' : 'light');
        effective = prefersDark ? 'dark' : 'light';
      }
      return { mode, effective };
    };
    const updatedMode = applyMode(mode);
    applyTheme(theme);
    fetch('/api/preferences/theming', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mode: updatedMode, theme }),
    });
  }

  setTheme(theme: Theme, mode?: Mode) {
    this.theme = theme;
    mode ??= this.mode;
    ThemingClass.saveAndApply(mode, theme);
  }

  setMode(mode: Mode, theme?: Theme) {
    this.mode = mode;
    theme ??= this.theme;
    ThemingClass.saveAndApply(mode, theme);
  }
}

const Theming = new ThemingClass();

export default Theming;
