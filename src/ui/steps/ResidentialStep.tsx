import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../store";
import { nextResidentialId, parseResidential } from "../../core/residential";
import TypeBadge from "../TypeBadge";
import StepShell from "../StepShell";

const inputClass =
  "w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-1.5 text-sm text-ink-100 placeholder:text-ink-500 focus:border-amber-glow/60 focus:outline-none";

function AddForm() {
  const { t } = useTranslation();
  const addResidentials = useAppStore((s) => s.addResidentials);
  const [type, setType] = useState("socks5");
  const [server, setServer] = useState("");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const portNumber = Number(port);
  const valid =
    server.trim() !== "" && Number.isInteger(portNumber) && portNumber > 0 && portNumber < 65536;

  const add = () => {
    if (!valid) return;
    addResidentials([
      {
        id: nextResidentialId(),
        name: name.trim() || `${server.trim()}:${port}`,
        type,
        server: server.trim(),
        port: portNumber,
        username: username || undefined,
        password: password || undefined,
        extra: {},
      },
    ]);
    setServer("");
    setPort("");
    setUsername("");
    setPassword("");
    setName("");
  };

  const field = (label: string, node: React.ReactNode, optional = false) => (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-ink-300">
        {label}
        {optional && <span className="ml-1 text-ink-500">· {t("residential.optional")}</span>}
      </span>
      {node}
    </label>
  );

  return (
    <div className="rounded-lg border border-ink-700 bg-ink-850 p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {field(
          t("residential.type"),
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
            <option value="socks5">socks5</option>
            <option value="http">http</option>
            <option value="ss">ss</option>
          </select>,
        )}
        {field(
          t("residential.server"),
          <input value={server} onChange={(e) => setServer(e.target.value)} placeholder="1.2.3.4" className={inputClass} />,
        )}
        {field(
          t("residential.port"),
          <input value={port} onChange={(e) => setPort(e.target.value)} placeholder="1080" inputMode="numeric" className={inputClass} />,
        )}
        {field(
          t("residential.username"),
          <input value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} />,
          true,
        )}
        {field(
          t("residential.password"),
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className={inputClass} />,
          true,
        )}
        {field(
          t("residential.name"),
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("residential.nameHint")} className={inputClass} />,
          true,
        )}
      </div>
      <button
        type="button"
        onClick={add}
        disabled={!valid}
        className="mt-4 rounded-lg bg-amber-glow px-4 py-2 text-sm font-medium text-ink-950 transition-colors hover:bg-amber-bright disabled:cursor-not-allowed disabled:bg-ink-800 disabled:text-ink-500"
      >
        {t("residential.add")}
      </button>
    </div>
  );
}

function BatchForm() {
  const { t } = useTranslation();
  const addResidentials = useAppStore((s) => s.addResidentials);
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<{ line: number; text: string }[]>([]);

  const importBatch = () => {
    const { proxies, errors } = parseResidential(text);
    if (proxies.length > 0) addResidentials(proxies);
    setErrors(errors);
    if (errors.length === 0) setText("");
  };

  return (
    <div className="rounded-lg border border-ink-700 bg-ink-850 p-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("residential.batchHint")}
        rows={4}
        className={`${inputClass} resize-y font-mono text-[13px]`}
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={importBatch}
          disabled={text.trim() === ""}
          className="rounded-lg bg-amber-glow px-4 py-2 text-sm font-medium text-ink-950 transition-colors hover:bg-amber-bright disabled:cursor-not-allowed disabled:bg-ink-800 disabled:text-ink-500"
        >
          {t("residential.import")}
        </button>
        <span className="font-mono text-[11px] text-ink-500">{t("residential.batchHint")}</span>
      </div>
      {errors.length > 0 && (
        <div className="mt-3 rounded-lg border border-signal-red/40 bg-signal-red/5 p-3 text-sm">
          <div className="text-signal-red">
            {t("residential.batchErrors", { count: errors.length })}
          </div>
          <ul className="mt-1 space-y-0.5 font-mono text-xs text-ink-300">
            {errors.map((e) => (
              <li key={e.line}>
                L{e.line}: {e.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ResidentialStep() {
  const { t } = useTranslation();
  const residentials = useAppStore((s) => s.residentials);
  const removeResidential = useAppStore((s) => s.removeResidential);
  const setStep = useAppStore((s) => s.setStep);
  const [tab, setTab] = useState<"form" | "batch">("form");

  return (
    <StepShell
      step={3}
      title={t("residential.title")}
      intro={t("residential.subtitle")}
      onContinue={residentials.length > 0 ? () => setStep(4) : undefined}
    >
      <div className="mb-3 inline-flex rounded-lg border border-ink-700 bg-ink-900 p-0.5">
        {(["form", "batch"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-md px-4 py-1.5 text-sm transition-colors ${
              tab === key ? "bg-ink-800 font-medium text-ink-100" : "text-ink-300 hover:text-ink-100"
            }`}
          >
            {key === "form" ? t("residential.addProxy") : t("residential.batchPaste")}
          </button>
        ))}
      </div>

      {tab === "form" ? <AddForm /> : <BatchForm />}

      <div className="mt-5">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-300">
          {t("residential.listTitle", { count: residentials.length })}
        </div>
        {residentials.length === 0 ? (
          <p className="text-sm text-ink-500">{t("residential.empty")}</p>
        ) : (
          <ul className="divide-y divide-ink-800 rounded-lg border border-ink-700 bg-ink-900">
            {residentials.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-ink-100">{r.name}</div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <TypeBadge type={r.type} />
                    <span className="font-mono text-[11px] text-ink-300">
                      {r.server}:{r.port}
                    </span>
                    {r.username && (
                      <span className="font-mono text-[11px] text-ink-500">{r.username}</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeResidential(r.id)}
                  className="text-xs text-ink-500 transition-colors hover:text-signal-red"
                >
                  {t("residential.remove")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </StepShell>
  );
}
