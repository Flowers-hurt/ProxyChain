# Agent Guide

Guidance for AI agents (and humans) working in this repo. This is the single
source of truth; `CLAUDE.md` links here.

## What this is

ProxyChain is a **browser-only** Clash chain-proxy config builder. It parses full
or partial Clash YAML, lets the user select nodes and add residential exits, and
generates chained-proxy configuration via Clash Meta's `dialer-proxy`. No backend —
everything runs in the browser.

## Architecture

Strict separation between logic and UI:

- `src/core/` — **pure TypeScript, zero UI dependencies, fully unit-tested.** All
  parsing, chaining, and emitting lives here.
  - `parser/syntax.ts` — YAML → value/Document or `{line, column, message}` error
  - `parser/detect.ts` — input type detection
  - `parser/normalize.ts` — build `NormalizedConfig`, auto-complete partial input
  - `parser/index.ts` — `parseInput()` pipeline (public entry point)
  - `residential.ts` — residential proxy model; `parseResidential()` accepts both
    `host:port:user:pass` lines and YAML proxy entries
  - `chain.ts` — cartesian-product chain generation + proxy group
  - `emit.ts` — three output modes; lossless full-config round-trip
- `src/ui/` — React five-step wizard on top of a `zustand` store (`src/store.ts`)
- `src/i18n.ts` + `src/locales/{en,zh}.json` — bilingual UI

Pipeline: `Input → Syntax Parse → Structure Detection → Normalization → Proxy Extraction → Chain Engine`

## Non-negotiable rules

These are product requirements, not style preferences — do not violate them:

1. **Proxy `type` is a dynamic string.** Never hard-code a protocol union or an
   `if (type === "ss") … else if …` chain. Unknown protocols must pass through with
   all fields preserved in `raw`.
2. **Never reject valid YAML for missing Clash fields.** Only syntax errors are
   errors. A partial config (`proxies:` only, a bare list, a single node) is a
   first-class input, not a failure.
3. **Full-config output is lossless.** Preserve comments, `dns`, `tun`, `sniffer`,
   and unknown keys by mutating the original `yaml` Document — never load/dump. Only
   append.
4. **Never fabricate** `mixed-port` / `rules` / `dns` / `tun` in output.
5. **Stay local.** No network calls, no analytics, no uploading user config.

## Workflow

- **TDD.** Core changes start with a failing Vitest test. Acceptance cases live in
  `src/core/**/*.test.ts` (spec §19 Cases 1–5 are encoded there).
- Run `npm test` and `npm run build` before considering a change done.
- Commit in small, focused steps.

## Commands

```bash
npm install
npm run dev      # local dev server
npm test         # Vitest (run once)
npm run build    # tsc -b + vite build
npm run lint     # oxlint
```

## Deployment

Push to `main` → GitHub Actions builds and deploys to GitHub Pages
(`.github/workflows/deploy.yml`). Vite `base` defaults to `/ProxyChain/`; override
with `VITE_BASE` for other hosts.

## Reference docs

- Design spec: `docs/superpowers/specs/2026-08-19-proxychain-v1-design.md`
- Implementation plan: `docs/superpowers/plans/2026-08-19-proxychain-v1.md`
