import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { parseInput } from "../../core/parser";
import { useAppStore, type InputMode } from "../../store";
import YamlEditor from "../YamlEditor";
import SummaryCard from "../SummaryCard";
import StepShell from "../StepShell";

function ModeSwitch() {
  const { t } = useTranslation();
  const inputMode = useAppStore((s) => s.inputMode);
  const setInputMode = useAppStore((s) => s.setInputMode);
  const modes: { key: InputMode; label: string }[] = [
    { key: "upload", label: t("import.uploadFile") },
    { key: "paste", label: t("import.pasteConfig") },
  ];
  return (
    <div role="radiogroup" aria-label={t("import.inputMode")} className="inline-flex rounded-lg border border-ink-700 bg-ink-900 p-0.5">
      {modes.map((m) => (
        <button
          key={m.key}
          type="button"
          role="radio"
          aria-checked={inputMode === m.key}
          onClick={() => setInputMode(m.key)}
          className={`rounded-md px-4 py-1.5 text-sm transition-colors ${
            inputMode === m.key
              ? "bg-ink-800 font-medium text-ink-100"
              : "text-ink-300 hover:text-ink-100"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

function UploadZone() {
  const { t } = useTranslation();
  const setInput = useAppStore((s) => s.setInput);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const readFile = useCallback(
    (file: File) => {
      if (!/\.(ya?ml)$/i.test(file.name)) {
        setFileError(t("import.invalidExtension"));
        return;
      }
      setFileError(null);
      file.text().then((text) => setInput(text, file.name, parseInput(text)));
    },
    [setInput, t],
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) readFile(file);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
          dragging
            ? "border-amber-glow bg-amber-glow/5"
            : "border-ink-700 bg-ink-900 hover:border-ink-500"
        }`}
      >
        <div className="font-display text-lg font-medium text-ink-100">
          {t("import.dropHere")}
        </div>
        <div className="mt-1 text-sm text-ink-300">{t("import.orBrowse")}</div>
        <div className="mt-3 font-mono text-[11px] text-ink-500">
          {t("import.extensions")}
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".yaml,.yml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) readFile(file);
          e.target.value = "";
        }}
      />
      {fileError && <p className="mt-3 text-sm text-signal-red">{fileError}</p>}
    </div>
  );
}

function ParseStatus() {
  const { t } = useTranslation();
  const parseResult = useAppStore((s) => s.parseResult);
  const fileName = useAppStore((s) => s.fileName);
  if (!parseResult) return null;

  if (!parseResult.ok) {
    return (
      <div className="rounded-lg border border-signal-red/40 bg-signal-red/5 p-4">
        <div className="font-mono text-xs font-semibold uppercase tracking-widest text-signal-red">
          {t("import.syntaxError")}
        </div>
        <div className="mt-2 font-mono text-sm text-ink-100">
          {t("import.line")} {parseResult.error.line} · {t("import.column")}{" "}
          {parseResult.error.column}
        </div>
        <div className="mt-1 text-sm text-ink-300">{parseResult.error.message}</div>
      </div>
    );
  }

  const config = parseResult.config;

  if (config.inputType === "UNKNOWN") {
    return (
      <div className="rounded-lg border border-ink-700 bg-ink-850 p-4">
        <div className="text-sm font-medium text-signal-green">{t("import.validYaml")}</div>
        <div className="mt-1 text-sm text-ink-100">{t("import.unknownInput")}</div>
        <div className="mt-1 text-sm text-ink-300">{t("import.unknownHint")}</div>
      </div>
    );
  }

  const partial = config.inputType !== "FULL_CONFIG";
  return (
    <div className="space-y-3">
      {fileName && (
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-sm text-signal-green">✓ {fileName}</span>
          <span className="font-mono text-xs text-ink-300">
            {t("import.proxiesShort", { count: config.proxies.length })}
            {config.proxyGroups.length > 0 &&
              ` · ${t("import.groupsShort", { count: config.proxyGroups.length })}`}
            {config.ruleCount > 0 &&
              ` · ${t("import.rulesShort", { count: config.ruleCount })}`}
          </span>
        </div>
      )}
      {partial && !fileName && (
        <div className="rounded-lg border border-signal-green/30 bg-signal-green/5 p-3 text-sm">
          <span className="font-medium text-signal-green">{t("import.validYaml")}</span>{" "}
          <span className="text-ink-100">{t("import.partialDetected")}</span>{" "}
          <span className="text-ink-100">
            {t("import.nodesDetected", { count: config.proxies.length })}
          </span>{" "}
          <span className="text-ink-300">{t("import.youCanContinue")}</span>
        </div>
      )}
      <SummaryCard config={config} />
    </div>
  );
}

export default function ImportStep() {
  const { t } = useTranslation();
  const inputMode = useAppStore((s) => s.inputMode);
  const rawInput = useAppStore((s) => s.rawInput);
  const parseResult = useAppStore((s) => s.parseResult);
  const setInput = useAppStore((s) => s.setInput);
  const setStep = useAppStore((s) => s.setStep);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [draft, setDraft] = useState(rawInput);

  const parse = useCallback(
    (text: string) => {
      setInput(text, null, text.trim() === "" ? null : parseInput(text));
    },
    [setInput],
  );

  // Debounced auto-parse while typing in paste mode.
  useEffect(() => {
    if (inputMode !== "paste") return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => parse(draft), 500);
    return () => clearTimeout(debounceRef.current);
  }, [draft, inputMode, parse]);

  const canContinue =
    parseResult?.ok === true &&
    parseResult.config.inputType !== "UNKNOWN" &&
    parseResult.config.proxies.length > 0;

  const errorLine = parseResult?.ok === false ? parseResult.error.line : null;

  return (
    <StepShell
      step={1}
      title={t("app.tagline")}
      intro={t("app.privacy")}
      onContinue={canContinue ? () => setStep(2) : undefined}
    >
      <div className="space-y-5">
        <div>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-300">
            {t("import.inputMode")}
          </div>
          <ModeSwitch />
        </div>

        {inputMode === "upload" ? (
          <UploadZone />
        ) : (
          <div className="space-y-3">
            <YamlEditor value={draft} onChange={setDraft} errorLine={errorLine} />
            <button
              type="button"
              onClick={() => parse(draft)}
              className="rounded-lg bg-amber-glow px-4 py-2 text-sm font-medium text-ink-950 transition-colors hover:bg-amber-bright"
            >
              {t("import.parse")}
            </button>
          </div>
        )}

        <ParseStatus />
      </div>
    </StepShell>
  );
}
