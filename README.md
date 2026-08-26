# ProxyChain

**English** · [中文](#proxychain-中文)

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
- **Bilingual UI + light/dark theme** — English / 中文, follows system or manual.

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
2. **Select Proxies** — pick the airport nodes to chain
3. **Residential Proxy** — add exits by form, `host:port:user:pass`, or YAML
4. **Generate Chain** — preview the `dialer-proxy` nodes and optional proxy group
5. **Export** — copy or download the result

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

---

# ProxyChain（中文）

[English](#proxychain) · **中文**

在浏览器里构建 Clash 链式代理。让流量依次经过机场节点**和**住宅出口——
流量 → 机场节点 → 住宅代理 → 目标网站——通过五步向导完成，全程不上传到任何服务器。

**→ [flowers-hurt.github.io/ProxyChain](https://flowers-hurt.github.io/ProxyChain/)**

所有处理都在浏览器本地完成，你的配置绝不离开本机。

## 为什么做这个

大多数工具只接受完整、合法的 Clash 配置文件。ProxyChain 是一个配置*转换器*，
而不是校验器：它能从完整配置、局部 `proxies:` 片段、裸代理数组，甚至单个粘贴的
节点中识别出代理，并转换成链式代理配置。

> 能解析就尽可能解析，能识别代理就不因缺字段而拒绝，准确生成，让用户可控。

## 功能

- **三种导入方式** —— 上传 `.yaml`/`.yml`、粘贴到 YAML 编辑器，或直接丢进几行零散代理。
- **自动识别输入类型** —— `FULL_CONFIG`、`PROXIES_SECTION`、`PROXY_LIST`、
  `SINGLE_PROXY`、`UNKNOWN`。部分配置是一等输入，不是错误。
- **任意协议** —— 代理 `type` 从不写死。ss、vmess、vless、trojan、hysteria2、
  tuic、anytls、wireguard…… 全部原样通过，未知字段完整保留。
- **链式代理** —— 选中节点 × 住宅出口，经 Clash Meta 的 `dialer-proxy` 串联。
- **完整配置无损输出** —— 原始文档（注释、`dns`、`tun`、`sniffer`、未知字段）
  全部保留，ProxyChain 只做追加，绝不伪造 `mixed-port` / `rules` / `dns` / `tun`。
- **灵活导出** —— 完整配置、仅生成的节点，或节点 + 代理组，可复制或下载。
- **中英双语 + 明暗主题** —— English / 中文，跟随系统或手动切换。

## 工作原理

```
完整配置 ──┐
部分配置 ──┤
代理数组 ──┼──▶ 解析器 ──▶ ProxyChain 引擎 ──▶ YAML
粘贴节点 ──┘

输入 → 语法解析 → 结构识别 → 归一化 → 代理提取 → 链式引擎
```

## 五步向导

1. **导入** —— 上传、粘贴或拖入你的配置
2. **选择节点** —— 挑选要串联的机场节点
3. **住宅代理** —— 用表单、`host:port:user:pass` 或 YAML 添加出口
4. **生成链** —— 预览 `dialer-proxy` 节点和可选的代理组
5. **导出** —— 复制或下载结果

## 开发

```bash
npm install
npm run dev      # 本地开发服务器
npm test         # Vitest —— 解析器、链式生成器、导出器
npm run build    # 生产构建
```

核心逻辑（`src/core/`）是纯 TypeScript，不依赖 UI，具备完整测试覆盖；
向导界面（`src/ui/`）是构建在其上的 React 应用。

## 技术栈

React · Vite · TypeScript · Tailwind CSS · CodeMirror 6 · [`yaml`](https://github.com/eemeli/yaml) · zustand · react-i18next · Vitest

## 部署

推送到 `main` 即由 GitHub Actions 自动构建并发布到 GitHub Pages。Vite 的 `base`
默认为 `/ProxyChain/`，可用 `VITE_BASE` 覆盖以适配其他托管（例如根域名或 Vercel 用
`VITE_BASE=/ npm run build`）。

## 隐私

无后端、无上传、无统计。代理凭据和配置始终留在你的浏览器里。
