import { useTranslation } from "react-i18next";
import { useAppStore } from "../../store";
import { chainKey, useChains } from "../useChains";
import StepShell from "../StepShell";

export default function ChainStep() {
  const { t } = useTranslation();
  const { config, allChains, includedChains } = useChains();
  const excludedChainKeys = useAppStore((s) => s.excludedChainKeys);
  const toggleChain = useAppStore((s) => s.toggleChain);
  const createGroup = useAppStore((s) => s.createGroup);
  const setCreateGroup = useAppStore((s) => s.setCreateGroup);
  const groupName = useAppStore((s) => s.groupName);
  const setGroupName = useAppStore((s) => s.setGroupName);
  const setStep = useAppStore((s) => s.setStep);

  const nodeName = (id: string) =>
    config?.proxies.find((p) => p.id === id)?.name ?? id;

  return (
    <StepShell
      step={4}
      title={t("generate.title")}
      intro={t("generate.subtitle")}
      onContinue={includedChains.length > 0 ? () => setStep(5) : undefined}
    >
      {allChains.length === 0 ? (
        <p className="text-sm text-ink-500">{t("generate.empty")}</p>
      ) : (
        <>
          <div className="mb-3 font-mono text-xs text-amber-glow">
            {t("generate.combos", { count: includedChains.length })}
          </div>
          <ul className="max-h-[22rem] divide-y divide-ink-800 overflow-auto rounded-lg border border-ink-700 bg-ink-900">
            {allChains.map((chain) => {
              const key = chainKey(chain);
              const included = !excludedChainKeys.includes(key);
              return (
                <li key={key}>
                  <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-ink-850">
                    <input
                      type="checkbox"
                      checked={included}
                      onChange={() => toggleChain(key)}
                      className="h-4 w-4 accent-[#e8a33d]"
                    />
                    {/* Route line: airport hop → residential exit */}
                    <div className="flex min-w-0 flex-1 items-center gap-2 font-mono text-[13px]">
                      <span className="truncate text-ink-100">
                        {nodeName(chain.nodeId)}
                      </span>
                      <span aria-hidden className="shrink-0 text-amber-glow">
                        ──→
                      </span>
                      <span className="truncate text-signal-blue">
                        {String(chain.config.server)}:{String(chain.config.port)}
                      </span>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 rounded-lg border border-ink-700 bg-ink-850 p-4">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={createGroup}
                onChange={(e) => setCreateGroup(e.target.checked)}
                className="h-4 w-4 accent-[#e8a33d]"
              />
              <span className="text-sm font-medium text-ink-100">
                {t("generate.createGroup")}
              </span>
            </label>
            {createGroup && (
              <label className="mt-3 block">
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-ink-300">
                  {t("generate.groupName")}
                </span>
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full max-w-sm rounded-lg border border-ink-700 bg-ink-900 px-3 py-1.5 text-sm text-ink-100 focus:border-amber-glow/60 focus:outline-none"
                />
              </label>
            )}
          </div>
        </>
      )}
    </StepShell>
  );
}
