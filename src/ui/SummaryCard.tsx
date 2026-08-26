import { useTranslation } from "react-i18next";
import type { NormalizedConfig } from "../core/parser";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
        {label}
      </div>
      <div className="mt-0.5 font-display text-lg font-medium text-fg">{value}</div>
    </div>
  );
}

export default function SummaryCard({ config }: { config: NormalizedConfig }) {
  const { t } = useTranslation();
  const full = config.inputType === "FULL_CONFIG";
  return (
    <div className="rounded-xl border border-line bg-raised p-4 shadow-card">
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <Stat
          label={t("import.detectedFormat")}
          value={full ? t("import.clashMeta") : t("import.clash")}
        />
        <Stat label={t("import.inputType")} value={config.inputType} />
        <Stat label={t("import.proxyNodes")} value={config.proxies.length} />
        <Stat label={t("import.proxyGroups")} value={config.proxyGroups.length} />
        {full ? (
          <Stat label={t("import.rules")} value={config.ruleCount} />
        ) : (
          <Stat
            label={t("import.otherConfig")}
            value={
              config.otherKeys.length === 0
                ? t("import.none")
                : t("import.fields", { count: config.otherKeys.length })
            }
          />
        )}
      </div>
    </div>
  );
}
