# ProxyChain v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Browser-only Clash chain-proxy builder: parse full/partial/loose Clash YAML, select nodes, add residential proxies, generate dialer-proxy chain nodes, export YAML losslessly.

**Architecture:** Pure-TS core (`src/core/`) with zero UI deps, fully unit-tested with Vitest; React five-step wizard (`src/ui/`) on top via a zustand store. `yaml` (eemeli) Document API for lossless FULL_CONFIG round-trip.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, CodeMirror 6, yaml, zustand, react-i18next, Vitest.

## Global Constraints

- Proxy `type` is a dynamic string — never a hard-coded union or if/else chain of protocols.
- Never reject valid YAML for missing Clash fields; only syntax errors are errors.
- Never fabricate mixed-port / rules / dns / tun in output.
- FULL_CONFIG output preserves comments, unknown fields, dns/tun/sniffer verbatim (Document API, not load/dump).
- UI copy in English per spec, with zh translation via react-i18next.
- Chain node naming: `Chain | <node> → <residential>`; default group name `🛡️ 住宅链式代理`.
- Commit after every task.

---

### Task 1: Scaffold

**Files:** Create Vite project in repo root (`package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, Tailwind config, `src/index.css`).

- [x] `npm create vite@latest . -- --template react-ts`; add deps: `yaml zustand react-i18next i18next @codemirror/lang-yaml @codemirror/state @codemirror/view @codemirror/search codemirror`; dev deps: `vitest tailwindcss @tailwindcss/vite`.
- [x] Wire Tailwind v4 via `@tailwindcss/vite` plugin + `@import "tailwindcss"` in index.css; add `"test": "vitest run"` script.
- [x] Verify `npm run build` and `npm test` (empty) pass. Commit.

### Task 2: Core types + syntax parser

**Files:** Create `src/core/types.ts`, `src/core/parser/syntax.ts`, Test `src/core/parser/syntax.test.ts`.

**Produces:**
```typescript
// types.ts
export type InputType = "FULL_CONFIG" | "PROXIES_SECTION" | "PROXY_LIST" | "SINGLE_PROXY" | "UNKNOWN";
export interface ProxyNode { id: string; name: string; type: string; server?: string; port?: number; raw: Record<string, unknown>; }
export interface SyntaxError_ { line: number; column: number; message: string; }
// syntax.ts
export function parseSyntax(input: string): { ok: true; document: Document; value: unknown } | { ok: false; error: SyntaxError_ }
```
- [x] Tests: valid YAML → ok with value; broken YAML (`a:\n  - b\n c: d` style) → error with correct line/column; empty input → ok:false with message. Implement with `yaml` `parseDocument`, map `doc.errors[0].linePos`. Commit.

### Task 3: Input type detection

**Files:** Create `src/core/parser/detect.ts`, Test `src/core/parser/detect.test.ts`.

**Produces:** `export function detectInputType(value: unknown): InputType`

Rules: object with any Clash top-level key beyond `proxies` (`proxy-groups`, `rules`, `mixed-port`, `port`, `socks-port`, `dns`, `tun`, `sniffer`, `mode`, `allow-lan`, `external-controller`, …) → FULL_CONFIG; object with `proxies` array → PROXIES_SECTION; array of proxy-like items (`name`+`type` or `server`+`port`) → PROXY_LIST; object that is itself proxy-like → SINGLE_PROXY; else UNKNOWN.

- [x] Tests = spec §19 Cases 1–5 verbatim (Case 5 inline flow-style anytls → PROXY_LIST), plus scalars/empty → UNKNOWN. Commit.

### Task 4: Normalization

**Files:** Create `src/core/parser/normalize.ts`, `src/core/parser/index.ts` (public `parseInput(input: string)` pipeline), Test `src/core/parser/normalize.test.ts`.

**Produces:**
```typescript
export interface NormalizedConfig { format: "clash"; inputType: InputType; proxies: ProxyNode[]; proxyGroups: unknown[]; ruleCount: number; otherKeys: string[]; originalDocument?: Document; }
export function normalize(value: unknown, inputType: InputType, doc: Document): NormalizedConfig
export type ParseResult = { ok: true; config: NormalizedConfig } | { ok: false; error: SyntaxError_ } | { ok: true; config: NormalizedConfig & { inputType: "UNKNOWN" } }
export function parseInput(input: string): ParseResult   // syntax → detect → normalize
```
- [x] Proxy extraction keeps every raw field in `raw`; skips non-object entries; `id` = stable index-based. Tests: PROXIES_SECTION auto-completes model (proxyGroups: []), anytls raw fields preserved, FULL_CONFIG counts groups/rules/otherKeys. Commit.

### Task 5: Residential proxies

**Files:** Create `src/core/residential.ts`, Test `src/core/residential.test.ts`.

**Produces:**
```typescript
export interface ResidentialProxy { id: string; name: string; type: string; server: string; port: number; username?: string; password?: string; extra: Record<string, unknown>; }
export function parseBatch(text: string, defaultType?: string): { proxies: ResidentialProxy[]; errors: { line: number; text: string }[] }
```
- [x] Batch accepts `host:port:user:pass` and `host:port` per line, ignores blanks/comments, reports bad lines. Commit.

### Task 6: Chain generator

**Files:** Create `src/core/chain.ts`, Test `src/core/chain.test.ts`.

**Produces:**
```typescript
export interface ChainNode { name: string; config: Record<string, unknown>; nodeId: string; residentialId: string; }
export function generateChains(nodes: ProxyNode[], residentials: ResidentialProxy[], existingNames: string[]): ChainNode[]
export function buildProxyGroup(name: string, chainNames: string[]): Record<string, unknown>
```
- [x] Cartesian product; config = residential fields + `dialer-proxy: node.name`; name `Chain | ${node.name} → ${resi.name}` deduped vs existingNames with ` (2)` suffixes; group = `{ name, type: "select", proxies: chainNames }`. Tests: counts (3×2=6), dialer-proxy correctness, dedup. Commit.

### Task 7: Emit

**Files:** Create `src/core/emit.ts`, Test `src/core/emit.test.ts`.

**Produces:**
```typescript
export type OutputMode = "FULL" | "PROXIES_ONLY" | "PROXIES_AND_GROUPS";
export interface EmitOptions { mode: OutputMode; chains: ChainNode[]; group?: { name: string } | null; config: NormalizedConfig; }
export function emit(opts: EmitOptions): string
```
- [x] FULL + originalDocument: append chain configs to `proxies` seq, append group to `proxy-groups` (create seq only if group requested and key missing) via Document mutation → `doc.toString()`; comments/dns/tun/unknown keys survive (assert `# comment` and `sniffer` in output). FULL + partial input: emit only provided sections + generated. PROXIES_ONLY → `proxies:` with original? No — chains only, per spec §17. PROXIES_AND_GROUPS → chains + group. Round-trip: output re-parses, node count = original + chains. Commit.

### Task 8: Store + i18n

**Files:** Create `src/store.ts`, `src/i18n.ts`, `src/locales/en.json`, `src/locales/zh.json`.

**Produces:** zustand store: `{ step, inputMode, rawInput, fileName, parseResult, selectedIds, residentials, chainSelection, createGroup, groupName, outputMode, setX…, reset }` with derived defaults (outputMode defaults FULL for FULL_CONFIG else PROXIES_AND_GROUPS when group enabled).

- [x] All UI strings in locale files (en per spec copy; zh translations); language toggle persisted to localStorage. Commit.

### Task 9: UI — invoke frontend-design skill, build wizard shell + Step 1 Import

**Files:** Create `src/ui/Layout.tsx`, `src/ui/Stepper.tsx`, `src/ui/steps/ImportStep.tsx`, `src/ui/YamlEditor.tsx` (CodeMirror wrapper: highlighting, line numbers, search, fullscreen, clear, format, error line decoration), `src/ui/SummaryCard.tsx`.

- [x] Invoke `superpowers:frontend-design` before building; design: refined, professional, minimal.
- [x] Landing hero + Input Mode radio (Upload File / Paste Configuration); drag-drop zone (.yaml/.yml) → parse → `✓ name — N proxies / N groups / N rules [Continue]`; paste mode: YamlEditor + Parse button + 500ms debounce auto-parse; syntax error panel (line/col/message + editor marker); partial-config success notice per spec §11. Commit.

### Task 10: UI — Step 2 Select Proxies

**Files:** Create `src/ui/steps/SelectStep.tsx`, `src/ui/TypeBadge.tsx`.

- [x] Checkbox list: name, TYPE badge, `server:port`; toolbar Search / Select All / Clear / Invert / Filter by Type (dynamic types from data); count header `Proxy Nodes (N)`. Commit.

### Task 11: UI — Step 3 Residential

**Files:** Create `src/ui/steps/ResidentialStep.tsx`.

- [x] Form (type select socks5/http/ss + free text, server, port, username, password, name auto-default) + batch paste textarea with per-line error report; list with remove. Commit.

### Task 12: UI — Step 4 Generate Chain

**Files:** Create `src/ui/steps/ChainStep.tsx`.

- [x] Combo preview (all cartesian pairs, checkbox each, default all on), Create Proxy Group toggle + editable group name, live count. Commit.

### Task 13: UI — Step 5 Export

**Files:** Create `src/ui/steps/ExportStep.tsx`.

- [x] Output Mode radios (Full Configuration / Generated Proxies Only / Proxies + Proxy Groups) with input-type-aware default; read-only YamlEditor preview; Copy / Download `proxychain.yaml`. Commit.

### Task 14: Final verification

- [x] `npm test` all green; `npm run build` clean; run dev server and manually execute spec §19 Cases 1–5 end-to-end; fix findings; final commit.
