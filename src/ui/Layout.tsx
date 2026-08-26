import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../store";
import Stepper from "./Stepper";

function ChainMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden>
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

export default function Layout({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();
  const reset = useAppStore((s) => s.reset);
  const step = useAppStore((s) => s.step);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line-soft">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
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
            <button
              type="button"
              onClick={() => i18n.changeLanguage(i18n.language === "en" ? "zh" : "en")}
              className="rounded border border-line px-2 py-1 font-mono text-[11px] text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
            >
              {t("language")}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl flex-1 px-4">
        <div className="flex justify-center py-6">
          <Stepper />
        </div>
        <main className="pb-16">{children}</main>
      </div>

      <footer className="border-t border-line-soft py-4 text-center font-mono text-[11px] text-fg-faint">
        {t("app.privacy")}
      </footer>
    </div>
  );
}
