# ProxyChain v1 — Design

Date: 2026-08-19
Status: Approved

## Product

A browser-only Clash chain-proxy configuration builder. No server upload — everything is
processed locally. Five-step wizard:

```
Step 1 Import → Step 2 Select Proxies → Step 3 Residential Proxy → Step 4 Generate Chain → Step 5 Export
```

Core value: accept **full Clash configs, partial configs, or loose proxy snippets**, extract
proxy nodes, combine them with residential proxies via Clash Meta's `dialer-proxy`
mechanism, and emit valid YAML while preserving everything the user provided.

## Tech Stack

- React 18 + Vite + TypeScript + Tailwind CSS
- CodeMirror 6 — paste editor (YAML highlighting, line numbers, search, fullscreen, format, error line marking)
- `yaml` (eemeli/yaml) — Document API preserves comments/unknown fields for lossless
  round-trip; syntax errors carry line/column
- zustand — wizard state
- react-i18next — Chinese/English UI toggle
- Vitest — unit tests for core

## Architecture

Strict separation: `src/core/` is pure TypeScript with zero UI dependencies, fully unit-tested.

```
src/core/
  parser/syntax.ts     YAML syntax parse → Document | {line, col, message} error
  parser/detect.ts     input type detection
  parser/normalize.ts  build NormalizedConfig, auto-complete internal model
  residential.ts       residential proxy model + batch "ip:port:user:pass" parsing
  chain.ts             cartesian product chain-node generation + proxy group
  emit.ts              three output modes; FULL_CONFIG appends in-place on the Document
src/ui/                five-step wizard components
```

### Data model — proxy `type` is dynamic, never hard-coded

```typescript
interface ProxyNode {
  id: string;
  name: string;
  type: string;          // ss / vmess / anytls / hysteria2 / any future type
  server?: string;
  port?: number;
  raw: Record<string, unknown>;   // all other fields preserved verbatim
}

type InputType = "FULL_CONFIG" | "PROXIES_SECTION" | "PROXY_LIST" | "SINGLE_PROXY" | "UNKNOWN";

interface NormalizedConfig {
  format: "clash";
  inputType: InputType;
  proxies: ProxyNode[];
  proxyGroups: unknown[];
  originalDocument?: Document;    // kept for FULL_CONFIG lossless output
}
```

## Input Type Detection (detect.ts)

Pipeline: `Input → Syntax Parse → Structure Detection → Normalization → Proxy Extraction → Chain Engine`.

1. Top-level object with Clash top-level fields beyond `proxies` (proxy-groups / rules /
   mixed-port / dns / tun / sniffer / …) → **FULL_CONFIG**
2. Top-level object with `proxies` as the (dominant) key → **PROXIES_SECTION**
3. Top-level array whose items look like proxies (name+type, or server+port) → **PROXY_LIST**
4. Top-level object that itself looks like a single proxy → **SINGLE_PROXY**
5. Otherwise → **UNKNOWN** (informative message, never a hard rejection)

Principles:

- Parse as much as possible; never reject because proxy-groups / rules / mixed-port are missing.
- Only YAML syntax errors are errors (shown with line/column + editor marker).
- Valid-but-partial YAML shows: `✓ Valid YAML — Detected partial configuration. N proxy
  nodes detected. You can continue.`

## Residential Proxies (Step 3)

- Form entry: type (socks5/http/ss), server, port, username, password, display name.
- Batch paste: one `ip:port:user:pass` per line (also accepts `ip:port`).
- Multiple residential proxies supported, listed and removable.

## Chain Generation (chain.ts)

- Mechanism: **dialer-proxy** (Clash Meta / mihomo).
- Combination: selected nodes × residential proxies **cartesian product**. Each combo →
  a full copy of the residential proxy + `dialer-proxy: <airport node name>`, named
  `Chain | <node> → <residential>`.
- Preview list before generation; user can untick combos.
- Optional `Create Proxy Group`: appends a `type: select` group (default name
  "🛡️ 住宅链式代理", editable) containing all chain nodes.
- Name collisions auto-deduplicated with suffixes.

## Output (emit.ts)

```
● Full Configuration        default for FULL_CONFIG input: append proxies, append/patch
                            proxy-groups on the original Document; dns/tun/rules/unknown
                            fields/comments preserved verbatim
○ Generated Proxies Only    chain nodes only
○ Proxies + Proxy Groups    chain nodes + group
```

- Partial input defaults to emitting only sections the user provided plus generated content.
- Never fabricate mixed-port / rules / dns / tun.
- Export: copy to clipboard + download `.yaml`.

## UI

- Landing: "ProxyChain — Build proxy chains in your browser." / "No server upload.
  Everything is processed locally."
- Step 1: Input Mode radio (Upload File / Paste Configuration). Drag-and-drop zone
  (.yaml/.yml) showing `✓ file.yaml — N proxies / N groups / N rules [Continue]`.
  Paste mode: CodeMirror editor, `Parse Configuration` button + debounced auto-parse.
  Success summary card: Detected Format / Input Type / Proxy Nodes / Proxy Groups / Rules.
- Step 2: node list with checkbox, name, type badge, `server:port`; Search / Select All /
  Clear / Invert / Filter by Type.
- Step 4: combo preview with checkboxes, Create Proxy Group toggle, group name editor.
- Step 5: output mode selector, read-only CodeMirror preview, Copy / Download.
- Bilingual (zh/en) via react-i18next; UI copy follows the spec's English strings.

## Testing (acceptance)

Vitest cases for spec §19 Cases 1–5 (FULL_CONFIG / PROXIES_SECTION / PROXY_LIST /
SINGLE_PROXY / inline flow-style YAML with anytls), plus:

- arbitrary proxy `type` extraction (no hard-coded type list)
- FULL_CONFIG round-trip fidelity: dns / tun / sniffer / unknown fields / comments survive
- batch residential parsing, name dedup, cartesian product counts
- syntax error line/column assertions
