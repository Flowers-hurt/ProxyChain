import { useTranslation } from "react-i18next";
import { useAppStore } from "../store";

const STEP_KEYS = ["import", "select", "residential", "generate", "export"] as const;

type StepState = "done" | "active" | "todo";

function stateFor(n: number, step: number): StepState {
  return n < step ? "done" : n === step ? "active" : "todo";
}

const NODE_GLOW =
  "shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent)_20%,transparent)]";

function Node({ n, state }: { n: number; state: StepState }) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 font-mono text-[11px] transition-colors ${
        state === "active"
          ? `border-accent bg-accent/10 text-accent ${NODE_GLOW}`
          : state === "done"
            ? "border-accent bg-accent text-on-accent"
            : "border-line bg-surface text-fg-faint"
      }`}
    >
      {state === "done" ? "✓" : n}
    </span>
  );
}

/* The wizard drawn as the thing it builds: a chain. Done segments are live
 * cable, upcoming ones dashed. */
function VerticalStepper() {
  const { t } = useTranslation();
  const step = useAppStore((s) => s.step);
  const setStep = useAppStore((s) => s.setStep);

  return (
    <nav aria-label="Steps" className="flex flex-col">
      {STEP_KEYS.map((key, index) => {
        const n = index + 1;
        const state = stateFor(n, step);
        return (
          <div key={key} className="flex flex-col">
            {index > 0 && (
              <div
                aria-hidden
                className={`ml-[13px] h-5 w-0 border-l-2 ${
                  n <= step
                    ? "border-accent/70"
                    : "border-dashed border-line-strong/50"
                }`}
              />
            )}
            <button
              type="button"
              disabled={n >= step}
              onClick={() => setStep(n)}
              className={`group flex items-center gap-3 text-left ${
                state === "done" ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <Node n={n} state={state} />
              <span className="flex flex-col">
                <span
                  className={`font-mono text-[9px] uppercase tracking-[0.18em] ${
                    state === "active" ? "text-accent" : "text-fg-faint"
                  }`}
                >
                  Step {String(n).padStart(2, "0")}
                </span>
                <span
                  className={`text-sm transition-colors ${
                    state === "active"
                      ? "font-medium text-fg"
                      : state === "done"
                        ? "text-fg-muted group-hover:text-fg"
                        : "text-fg-faint"
                  }`}
                >
                  {t(`steps.${key}`)}
                </span>
              </span>
            </button>
          </div>
        );
      })}
    </nav>
  );
}

function HorizontalStepper() {
  const { t } = useTranslation();
  const step = useAppStore((s) => s.step);
  const setStep = useAppStore((s) => s.setStep);

  return (
    <nav aria-label="Steps" className="flex items-center">
      {STEP_KEYS.map((key, index) => {
        const n = index + 1;
        const state = stateFor(n, step);
        return (
          <div key={key} className="flex items-center">
            {index > 0 && (
              <div
                aria-hidden
                className={`mx-1.5 h-0 w-4 border-t-2 sm:w-7 ${
                  n <= step
                    ? "border-accent/70"
                    : "border-dashed border-line-strong/50"
                }`}
              />
            )}
            <button
              type="button"
              disabled={n >= step}
              onClick={() => setStep(n)}
              className={`group flex items-center gap-2 rounded-full ${
                state === "done" ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 font-mono text-[10px] ${
                  state === "active"
                    ? `border-accent bg-accent/10 text-accent ${NODE_GLOW}`
                    : state === "done"
                      ? "border-accent bg-accent text-on-accent"
                      : "border-line bg-surface text-fg-faint"
                }`}
              >
                {state === "done" ? "✓" : n}
              </span>
              <span
                className={`text-xs ${
                  state === "active"
                    ? "block font-medium text-fg"
                    : state === "done"
                      ? "hidden text-fg-muted group-hover:text-fg sm:block"
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

export default function Stepper({
  orientation = "horizontal",
}: {
  orientation?: "horizontal" | "vertical";
}) {
  return orientation === "vertical" ? <VerticalStepper /> : <HorizontalStepper />;
}
