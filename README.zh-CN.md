# ProxyChain

[English](./README.md) | **简体中文**

在浏览器中构建 Clash 链式代理。让流量先经过机场节点、再从住宅代理出口——
流量 → 机场节点 → 住宅代理 → 目标网站——五步向导完成配置，全程无服务器上传。

**→ [flowers-hurt.github.io/ProxyChain](https://flowers-hurt.github.io/ProxyChain/)**

所有处理都在浏览器本地完成，你的配置不会离开你的设备。

## 为什么做这个

大多数工具只接受一份完整、合法的 Clash 配置文件。ProxyChain 是配置的
*转换器*，而不是校验器：无论是完整配置、只有 `proxies:` 的片段、一段裸的
代理列表，还是粘贴的单个节点，它都能识别其中的代理节点，并生成链式代理配置。

> 尽可能地解析。识别代理节点而不因缺字段拒绝输入。精确地生成。把控制权留给用户。

## 功能

- **三种导入方式** —— 上传 `.yaml`/`.yml`、粘贴到 YAML 编辑器，或直接丢几行代理进来。
- **自动识别输入类型** —— `FULL_CONFIG`、`PROXIES_SECTION`、`PROXY_LIST`、
  `SINGLE_PROXY` 或 `UNKNOWN`。不完整的配置是一等公民，不是错误。
- **协议无关** —— 代理 `type` 从不硬编码。ss、vmess、vless、trojan、
  hysteria2、tuic、anytls、wireguard……全部透传，未知字段原样保留。
- **链式代理** —— 选中的节点 × 住宅出口，笛卡尔积组合，通过 Clash Meta 的
  `dialer-proxy` 实现。
- **完整配置无损输出** —— 原始文档（注释、`dns`、`tun`、`sniffer`、未知键）
  全部保留，ProxyChain 只做追加。绝不凭空生成 `mixed-port` / `rules` / `dns` / `tun`。
- **灵活导出** —— 完整配置、仅生成的代理，或代理 + 代理组。可复制或下载。
- **双语界面** —— English / 中文。

## 工作原理

```
完整配置 ─────┐
配置片段 ─────┤
代理列表 ─────┼──▶ 解析器 ──▶ ProxyChain 引擎 ──▶ YAML
粘贴的节点 ───┘

输入 → 语法解析 → 结构检测 → 归一化 → 代理提取 → 链式引擎
```

## 五步向导

1. **导入** —— 上传、粘贴或拖入你的配置

   <img src="static/images/step1.png" alt="第 1 步 —— 导入" width="760" />

2. **选择节点** —— 挑选要参与组链的机场节点

   <img src="static/images/step2.png" alt="第 2 步 —— 选择节点" width="760" />

3. **住宅代理** —— 通过表单、`host:port:user:pass` 或 YAML 添加出口

   <img src="static/images/step3.png" alt="第 3 步 —— 住宅代理" width="760" />

4. **生成链** —— 预览 `dialer-proxy` 节点和可选的代理组

   <img src="static/images/step4.png" alt="第 4 步 —— 生成链" width="760" />

5. **导出** —— 复制或下载结果

   <img src="static/images/step5.png" alt="第 5 步 —— 导出" width="760" />

## 项目结构

```
src/
├── core/                    # 纯 TypeScript —— 零 UI 依赖，单元测试全覆盖
│   ├── parser/
│   │   ├── syntax.ts        # YAML → Document，或 {line, column, message} 错误
│   │   ├── detect.ts        # 输入类型检测（完整 / 片段 / 列表 / 单节点）
│   │   ├── normalize.ts     # 构建 NormalizedConfig，自动补全不完整输入
│   │   └── index.ts         # parseInput() 流水线 —— 对外入口
│   ├── residential.ts       # 住宅代理模型；解析 host:port:user:pass 和 YAML
│   ├── chain.ts             # 笛卡尔积链式生成 + 代理组
│   ├── emit.ts              # 三种输出模式；完整配置无损往返
│   └── types.ts             # 核心共享类型
├── ui/                      # React 五步向导
│   ├── steps/               # 导入 · 选择节点 · 住宅代理 · 生成链 · 导出
│   ├── Layout.tsx           # 应用外壳：头部、主题切换、链路导轨步骤条
│   ├── YamlEditor.tsx       # CodeMirror 6 编辑器，主题自适应 YAML 高亮
│   ├── theme.ts             # 浅色 / 跟随系统 / 深色偏好（持久化）
│   └── …                    # Stepper、StepShell、SummaryCard、TypeBadge、useChains
├── store.ts                 # zustand 应用状态
├── i18n.ts + locales/       # English / 中文
└── index.css                # 设计 token：明暗两套调色板、环境光晕
public/                      # 原样拷贝的静态资源（favicon）
static/images/               # README 截图
docs/                        # 设计规格与实现计划
.github/workflows/deploy.yml # 推送 main 后构建并部署到 GitHub Pages
index.html                   # 入口页面：字体、theme-color meta、首屏前主题脚本
vite.config.ts               # Vite + React + Tailwind 插件；GitHub Pages base 路径
tsconfig.json                # 项目引用（project references）根配置，拆分为：
tsconfig.app.json            #   · 浏览器代码（src/）
tsconfig.node.json           #   · Node 环境（vite.config.ts）
.oxlintrc.json               # oxlint：React hooks 正确性、TS 规则
.editorconfig                # 2 空格缩进 · LF · UTF-8，编辑器无关
.nvmrc                       # Node 22（与 package.json engines 一致）
.gitignore                   # node_modules、dist、编辑器与本地 agent 文件
package.json                 # 脚本、依赖、项目元数据
AGENTS.md                    # 唯一事实来源：架构与硬性规则
CLAUDE.md                    # Claude Code 入口 —— 链接到 AGENTS.md
CONTRIBUTING.md              # 贡献指南（TDD 工作流、主题/国际化规则）
SECURITY.md                  # 漏洞报告政策
LICENSE                      # MIT
```

测试与被测代码放在一起（`src/core/**` 下的 `*.test.ts`），并编码了规格中的验收用例。

## 本地开发

```bash
npm install
npm run dev      # 本地开发服务器
npm test         # Vitest —— 解析器、链式生成器、输出器
npm run build    # 生产构建
```

核心逻辑（`src/core/`）是零 UI 依赖、测试全覆盖的纯 TypeScript；
向导界面（`src/ui/`）是其上的 React 应用。

## 技术栈

React · Vite · TypeScript · Tailwind CSS · CodeMirror 6 · [`yaml`](https://github.com/eemeli/yaml) · zustand · react-i18next · Vitest

## 部署

推送到 `main` 分支即由 GitHub Actions 构建并发布到 GitHub Pages。
Vite 的 `base` 默认为 `/ProxyChain/`，部署到其他环境时用 `VITE_BASE`
覆盖（例如根域名或 Vercel 用 `VITE_BASE=/ npm run build`）。

## 隐私

没有后端。没有上传。没有统计埋点。代理凭据和配置只存在于你的浏览器里。

## 许可证

[MIT](./LICENSE)
