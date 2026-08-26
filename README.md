# ProxyChain

Build Clash proxy chains in your browser. Point your traffic through an airport
node **and** a residential exit — flow → airport node → residential proxy →
destination — with a five-step wizard and zero server upload.

**→ [flowers-hurt.github.io/ProxyChain](https://flowers-hurt.github.io/ProxyChain/)**

Everything is processed locally in the browser. Your configs never leave your machine.

## Why

Most tools only accept a complete, valid Clash config file. ProxyChain is a
config *transformer*, not a validator: it recognizes proxy nodes from a full
config, a partial `proxies:` section, a bare proxy list, or even a single pasted
node — and turns them into chained-proxy configuration.

> Parse as much as possible. Recognize proxies without rejecting input for
> missing fields. Generate accurately. Keep the user in control.

## Features

- **Three ways to import** — upload `.yaml`/`.yml`, paste into a YAML editor, or
  drop in a few loose proxy lines.
- **Automatic input detection** — `FULL_CONFIG`, `PROXIES_SECTION`, `PROXY_LIST`,
  `SINGLE_PROXY`, or `UNKNOWN`. Partial configs are a first-class input, not an error.
- **Any protocol** — proxy `type` is never hard-coded. ss, vmess, vless, trojan,
  hysteria2, tuic, anytls, wireguard… all pass through, unknown fields preserved.
- **Chained proxies** — selected nodes × residential exits, combined via Clash
  Meta's `dialer-proxy`.
- **Lossless full-config output** — the original document (comments, `dns`, `tun`,
  `sniffer`, unknown keys) is preserved; ProxyChain only appends. Never fabricates
  `mixed-port` / `rules` / `dns` / `tun`.
- **Flexible export** — full configuration, generated proxies only, or proxies +
  proxy group. Copy or download.
- **Bilingual UI** — English / 中文.

## How it works

```
Full config ──┐
Partial config┤
Proxy list ───┼──▶ Parser ──▶ ProxyChain Engine ──▶ YAML
Pasted node ──┘

Input → Syntax Parse → Structure Detection → Normalization → Proxy Extraction → Chain Engine
```

## Wizard

1. **Import** — upload, paste, or drop your config

   <img src="static/images/step1.png" alt="Step 1 — Import" width="760" />

2. **Select Proxies** — pick the airport nodes to chain

   <img src="static/images/step2.png" alt="Step 2 — Select Proxies" width="760" />

3. **Residential Proxy** — add exits by form, `host:port:user:pass`, or YAML

   <img src="static/images/step3.png" alt="Step 3 — Residential Proxy" width="760" />

4. **Generate Chain** — preview the `dialer-proxy` nodes and optional proxy group

   <img src="static/images/step4.png" alt="Step 4 — Generate Chain" width="760" />

5. **Export** — copy or download the result

   <img src="static/images/step5.png" alt="Step 5 — Export" width="760" />

## Development

```bash
npm install
npm run dev      # local dev server
npm test         # Vitest — parser, chain generator, emitter
npm run build    # production build
```

The core (`src/core/`) is pure TypeScript with no UI dependencies and full test
coverage; the wizard (`src/ui/`) is a React app on top.

## Tech Stack

React · Vite · TypeScript · Tailwind CSS · CodeMirror 6 · [`yaml`](https://github.com/eemeli/yaml) · zustand · react-i18next · Vitest

## Deployment

Pushing to `main` builds and publishes to GitHub Pages via GitHub Actions. The
Vite `base` defaults to `/ProxyChain/`; override it with `VITE_BASE` for other
hosts (e.g. `VITE_BASE=/ npm run build` for a root domain or Vercel).

## Privacy

No backend. No upload. No analytics. Proxy credentials and configs stay in your browser.
