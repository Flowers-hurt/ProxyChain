import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../store";

const STEP_KEYS = ["import", "select", "residential", "generate", "export"];

interface StepShellProps {
  step: number;
  title: string;
  intro?: string;
  onContinue?: () => void;
  continueLabel?: string;
  children: ReactNode;
}

export default function StepShell({
  step,
  title,
  intro,
  onContinue,
  continueLabel,
  children,
}: StepShellProps) {
  const { t } = useTranslation();
  const setStep = useAppStore((s) => s.setStep);

  return (
    <section>
      <div className="mb-6">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-glow">
          Step {String(step).padStart(2, "0")} — {t(`steps.${STEP_KEYS[step - 1]}`)}
        </div>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink-100">
          {title}
        </h1>
        {intro && <p className="mt-1 text-sm text-ink-300">{intro}</p>}
      </div>

      {children}

      <div className="mt-8 flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="rounded-lg border border-ink-700 px-4 py-2 text-sm text-ink-300 transition-colors hover:border-ink-500 hover:text-ink-100"
          >
            ← {t("nav.back")}
          </button>
        ) : (
          <span />
        )}
        {onContinue !== undefined ? (
          <button
            type="button"
            onClick={onContinue}
            className="rounded-lg bg-amber-glow px-5 py-2 text-sm font-medium text-ink-950 transition-colors hover:bg-amber-bright"
          >
            {continueLabel ?? t("nav.continue")} →
          </button>
        ) : step < 5 ? (
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-lg bg-ink-800 px-5 py-2 text-sm text-ink-500"
          >
            {continueLabel ?? t("nav.continue")} →
          </button>
        ) : (
          <span />
        )}
      </div>
    </section>
  );
}
