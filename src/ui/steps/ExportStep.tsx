import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { emit, type OutputMode } from "../../core/emit";
import { defaultOutputMode, useAppStore } from "../../store";
import { useChains } from "../useChains";
import YamlEditor from "../YamlEditor";
import StepShell from "../StepShell";

export default function ExportStep() {
  const { t } = useTranslation();
  const { config, includedChains } = useChains();
  const outputMode = useAppStore((s) => s.outputMode);
  const setOutputMode = useAppStore((s) => s.setOutputMode);
  const createGroup = useAppStore((s) => s.createGroup);
  const groupName = useAppStore((s) => s.groupName);
  const [copied, setCopied] = useState(false);

  const mode: OutputMode = outputMode ?? defaultOutputMode();
  const isFullConfig = config?.inputType === "FULL_CONFIG";

  const output = useMemo(() => {
    if (!config) return "";
    return emit({
      mode,
      chains: includedChains,
      group: createGroup && groupName.trim() !== "" ? { name: groupName.trim() } : null,
      config,
    });
  }, [config, mode, includedChains, createGroup, groupName]);

  const options: { key: OutputMode; label: string; hint: string }[] = [
    {
      key: "FULL",
      label: t("export.fullConfig"),
      hint: isFullConfig
        ? t("export.fullConfigHintFull")
        : t("export.fullConfigHintPartial"),
    },
    { key: "PROXIES_ONLY", label: t("export.proxiesOnly"), hint: t("export.proxiesOnlyHint") },
    {
      key: "PROXIES_AND_GROUPS",
      label: t("export.proxiesAndGroups"),
      hint: t("export.proxiesAndGroupsHint"),
    },
  ];

  const copy = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const download = () => {
    const blob = new Blob([output], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "proxychain.yaml";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <StepShell step={5} title={t("export.title")}>
      <div className="mb-4">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-fg-muted">
          {t("export.outputMode")}
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {options.map((option) => (
            <label
              key={option.key}
              className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                mode === option.key
                  ? "border-accent/70 bg-accent/5"
                  : "border-line bg-surface hover:border-line-strong"
              }`}
            >
              <input
                type="radio"
                name="output-mode"
                checked={mode === option.key}
                onChange={() => setOutputMode(option.key)}
                className="sr-only"
              />
              <div className="text-sm font-medium text-fg">{option.label}</div>
              <div className="mt-0.5 text-xs text-fg-muted">{option.hint}</div>
            </label>
          ))}
        </div>
      </div>

      <YamlEditor value={output} readOnly minHeight="16rem" />

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={copy}
          className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
        >
          {copied ? t("export.copied") : t("export.copy")}
        </button>
        <button
          type="button"
          onClick={download}
          className="rounded-lg border border-line px-5 py-2 text-sm text-fg transition-colors hover:border-line-strong"
        >
          {t("export.download")}
        </button>
      </div>
    </StepShell>
  );
}
