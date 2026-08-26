# Contributing

Thanks for your interest in ProxyChain! This is a small project with a strict
architecture — please read [AGENTS.md](./AGENTS.md) first; it is the single
source of truth for how the codebase is organized and the non-negotiable
product rules (dynamic proxy types, never rejecting partial configs, lossless
output, no network calls).

## Setup

```bash
nvm use          # Node 22
npm install
npm run dev
```

## Workflow

- **TDD for core changes.** Anything under `src/core/` starts with a failing
  Vitest test next to the code it covers.
- Run `npm test` and `npm run build` before opening a PR; `npm run lint` keeps
  oxlint happy.
- Keep commits small and focused.

## UI changes

The UI must work in both light and dark themes — colors come from the semantic
tokens in `src/index.css`, never hard-coded values. User-facing strings go
through i18n (`src/locales/en.json` + `zh.json`), both languages.
