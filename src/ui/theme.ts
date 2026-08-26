import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePref = "system" | "light" | "dark";

interface ThemeState {
  pref: ThemePref;
  setPref: (pref: ThemePref) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist((set) => ({ pref: "system", setPref: (pref) => set({ pref }) }), {
    name: "proxychain-theme",
  }),
);

const media = window.matchMedia("(prefers-color-scheme: dark)");

/** Resolved dark/light after applying the user's preference over the system's. */
export function useEffectiveDark(): boolean {
  const pref = useThemeStore((s) => s.pref);
  const [systemDark, setSystemDark] = useState(media.matches);
  useEffect(() => {
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return pref === "system" ? systemDark : pref === "dark";
}

/** Mirrors the preference onto <html data-theme>, where the CSS palettes key off it. */
export function useApplyTheme() {
  const pref = useThemeStore((s) => s.pref);
  useEffect(() => {
    if (pref === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = pref;
  }, [pref]);
}
