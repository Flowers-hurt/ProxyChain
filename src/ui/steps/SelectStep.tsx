import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../store";
import TypeBadge from "../TypeBadge";
import StepShell from "../StepShell";

export default function SelectStep() {
  const { t } = useTranslation();
  const parseResult = useAppStore((s) => s.parseResult);
  const selectedIds = useAppStore((s) => s.selectedIds);
  const setSelectedIds = useAppStore((s) => s.setSelectedIds);
  const setStep = useAppStore((s) => s.setStep);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const proxies = parseResult?.ok ? parseResult.config.proxies : [];

  const types = useMemo(
    () => [...new Set(proxies.map((p) => p.type))].sort(),
    [proxies],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return proxies.filter(
      (p) =>
        (typeFilter === "" || p.type === typeFilter) &&
        (q === "" ||
          p.name.toLowerCase().includes(q) ||
          (p.server ?? "").toLowerCase().includes(q)),
    );
  }, [proxies, search, typeFilter]);

  const toggle = (id: string) =>
    setSelectedIds(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );

  const visibleIds = visible.map((p) => p.id);
  const toolButton =
    "rounded border border-line px-2.5 py-1 text-xs text-fg-muted transition-colors hover:border-line-strong hover:text-fg";

  return (
    <StepShell
      step={2}
      title={t("select.title", { count: proxies.length })}
      intro={t("select.selected", { count: selectedIds.length })}
      onContinue={selectedIds.length > 0 ? () => setStep(3) : undefined}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("select.search")}
          className="w-48 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-fg placeholder:text-fg-faint focus:border-accent/60 focus:outline-none"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label={t("select.filterByType")}
          className="rounded-lg border border-line bg-surface px-2 py-1.5 font-mono text-xs text-fg-muted focus:border-accent/60 focus:outline-none"
        >
          <option value="">{t("select.allTypes")}</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <div className="ml-auto flex gap-1.5">
          <button
            type="button"
            className={toolButton}
            onClick={() => setSelectedIds([...new Set([...selectedIds, ...visibleIds])])}
          >
            {t("select.selectAll")}
          </button>
          <button type="button" className={toolButton} onClick={() => setSelectedIds([])}>
            {t("select.clear")}
          </button>
          <button
            type="button"
            className={toolButton}
            onClick={() =>
              setSelectedIds(
                proxies.map((p) => p.id).filter((id) => !selectedIds.includes(id)),
              )
            }
          >
            {t("select.invert")}
          </button>
        </div>
      </div>

      <ul className="max-h-[26rem] divide-y divide-line-soft overflow-auto rounded-xl border border-line bg-surface shadow-card">
        {visible.map((proxy) => (
          <li key={proxy.id}>
            <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-raised">
              <input
                type="checkbox"
                checked={selectedIds.includes(proxy.id)}
                onChange={() => toggle(proxy.id)}
                className="h-4 w-4"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-fg">{proxy.name}</div>
                <div className="mt-0.5 flex items-center gap-2">
                  <TypeBadge type={proxy.type} />
                  {proxy.server && (
                    <span className="truncate font-mono text-[11px] text-fg-muted">
                      {proxy.server}
                      {proxy.port !== undefined && `:${proxy.port}`}
                    </span>
                  )}
                </div>
              </div>
            </label>
          </li>
        ))}
        {visible.length === 0 && (
          <li className="px-3 py-8 text-center text-sm text-fg-faint">
            {t("select.empty")}
          </li>
        )}
      </ul>
    </StepShell>
  );
}
