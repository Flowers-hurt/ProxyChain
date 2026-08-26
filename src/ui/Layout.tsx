import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../store";
import { useApplyTheme, useThemeStore, type ThemePref } from "./theme";
import Stepper from "./Stepper";

function ChainMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden>
      <circle cx="8" cy="16" r="3" fill="none" stroke="var(--accent)" strokeWidth="2" />
      <line x1="11" y1="16" x2="18" y2="16" stroke="var(--accent)" strokeWidth="2" />
      <circle cx="21" cy="16" r="3" fill="none" stroke="var(--accent)" strokeWidth="2" />
      <line
        x1="24"
        y1="16"
        x2="30"
        y2="16"
        stroke="var(--fg-faint)"
        strokeWidth="2"
        strokeDasharray="2 2"
      />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1.5" y="2.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 1v1.8M8 13.2V15M15 8h-1.8M2.8 8H1M12.95 3.05l-1.27 1.27M4.32 11.68l-1.27 1.27M12.95 12.95l-1.27-1.27M4.32 4.32L3.05 3.05"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ThemeToggle() {
  const { t } = useTranslation();
  const pref = useThemeStore((s) => s.pref);
  const setPref = useThemeStore((s) => s.setPref);
  const options: { key: ThemePref; label: string; icon: ReactNode }[] = [
    { key: "light", label: t("theme.light"), icon: <SunIcon /> },
    { key: "system", label: t("theme.system"), icon: <SystemIcon /> },
    { key: "dark", label: t("theme.dark"), icon: <MoonIcon /> },
  ];
  return (
    <div
      role="radiogroup"
      aria-label={t("theme.label")}
      className="flex items-center rounded-full border border-line bg-surface p-0.5 shadow-card"
    >
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="radio"
          aria-checked={pref === o.key}
          title={o.label}
          aria-label={o.label}
          onClick={() => setPref(o.key)}
          className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
            pref === o.key
              ? "bg-accent text-on-accent"
              : "text-fg-faint hover:text-fg"
          }`}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();
  const reset = useAppStore((s) => s.reset);
  const step = useAppStore((s) => s.step);
  useApplyTheme();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line-soft bg-page/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-2.5">
            <ChainMark />
            <span className="font-display text-lg font-bold tracking-tight">
              ProxyChain
            </span>
          </div>
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={reset}
                className="text-xs text-fg-muted transition-colors hover:text-fg"
              >
                {t("app.startOver")}
              </button>
            )}
            <ThemeToggle />
            <button
              type="button"
              onClick={() => i18n.changeLanguage(i18n.language === "en" ? "zh" : "en")}
              className="rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-[11px] text-fg-muted shadow-card transition-colors hover:border-line-strong hover:text-fg"
            >
              {t("language")}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 lg:px-6">
        <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-24 pt-10">
              <Stepper orientation="vertical" />
            </div>
          </aside>
          <div>
            <div className="flex justify-center py-5 lg:hidden">
              <Stepper />
            </div>
            <main className="pb-16 lg:pt-10">{children}</main>
          </div>
        </div>
      </div>

      <footer className="border-t border-line-soft py-4 text-center font-mono text-[11px] text-fg-faint">
        {t("app.privacy")}
      </footer>
    </div>
  );
}
