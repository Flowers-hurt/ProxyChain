import { useTranslation } from "react-i18next";
import { useAppStore } from "../store";

const STEP_KEYS = ["import", "select", "residential", "generate", "export"] as const;

export default function Stepper() {
  const { t } = useTranslation();
  const step = useAppStore((s) => s.step);
  const setStep = useAppStore((s) => s.setStep);

  return (
    <nav aria-label="Steps" className="flex items-center">
      {STEP_KEYS.map((key, index) => {
        const n = index + 1;
        const state = n < step ? "done" : n === step ? "active" : "todo";
        return (
          <div key={key} className="flex items-center">
            {index > 0 && (
              <div
                aria-hidden
                className={`mx-1 h-px w-4 sm:mx-2 sm:w-8 ${
                  n <= step ? "bg-accent/60" : "bg-line"
                }`}
              />
            )}
            <button
              type="button"
              disabled={n >= step}
              onClick={() => setStep(n)}
              className={`group flex items-center gap-2 rounded-full py-1 pr-1 transition-colors ${
                n < step ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[11px] ${
                  state === "active"
                    ? "border-accent bg-accent/15 text-accent-hover"
                    : state === "done"
                      ? "border-accent/50 text-accent/80 group-hover:bg-overlay"
                      : "border-line text-fg-faint"
                }`}
              >
                {state === "done" ? "✓" : n}
              </span>
              <span
                className={`text-xs ${
                  state === "active"
                    ? "block font-medium text-fg"
                    : state === "done"
                      ? "hidden text-fg-muted sm:block"
                      : "hidden text-fg-faint sm:block"
                }`}
              >
                {t(`steps.${key}`)}
              </span>
            </button>
          </div>
        );
      })}
    </nav>
  );
}
