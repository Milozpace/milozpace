# Milozpace

Milozpace 是一个从真实个人站点中提纯出的公开静态站源码。它保留首页、手记、生活、一言、关于五个页面，以及浅深色主题、响应式排版、文章阅读控件和克制的入场动效；私人内容、内容后台、生产凭据和部署配置不在本仓库中。

> 当前状态：`v1.0.0` 公开源码版已整理完成，可按上传清单提交到云仓库。本仓库尚未自动上传或部署，公开版也不会自动跟随私人正式站更新。

## 预览

![Milozpace 首页浅色桌面预览](docs/screenshots/home-light-desktop.png)

更多桌面、移动端与深色预览见 [`docs/screenshots`](docs/screenshots)。这些截图只展示公开 demo 页面，不包含私人内容或后台界面。

## 快速开始

需要 Node.js 20.9 或更高版本与 npm。

```bash
npm ci
npm run dev
```

打开终端显示的本地地址即可。项目不需要 `.env`、账号、数据库或外部内容服务。

构建并预览完整静态站：

```bash
npm run build
npm run preview
```

默认预览地址为 `http://127.0.0.1:4173`。`npm run preview` 需要先生成 `out`。

## 从哪里开始修改

- `src/site.config.ts`：站点名称、简介、导航和链接。
- `content/demo/articles`：Markdown 手记；文件名就是 URL slug。
- `content/demo/life.json`：生活片段。
- `content/demo/says.json`：原创短句。
- `public/demo`：本地示例图片。
- `src/styles`：已选视觉体系的壳层、页面、阅读与响应式样式。

文章 frontmatter 需要 `title`、`summary`、`date`，可选 `cover`、`topic`、`weather`、`mood`、`place`。内容加载会检查重复 slug、缺失字段和不存在的本地图片。替换 demo 内容时，请确认新图片仍然属于公开授权范围，并在本地完成手机与桌面端检查。

## 目录

```text
content/demo/       可直接替换的本地示例内容
public/demo/        原创示例图片
src/app/            页面与路由
src/components/     导航、主题与阅读控件
src/lib/            内容读取和发行边界
src/styles/         正式视觉壳层与逐页样式
tests/              内容、逻辑和浏览器验收
docs/               架构、定制、隐私边界与截图
scripts/             本地预览与发行检查
```

## 命令

| 命令 | 用途 |
|---|---|
| `npm ci` | 按锁文件安装依赖 |
| `npm run dev` | 启动开发站 |
| `npm run build` | 生成 `out` 完整静态站 |
| `npm run preview` | 本地预览 `out` |
| `npm run check` | TypeScript 与 ESLint 检查 |
| `npm test` | 内容与关键逻辑测试 |
| `npm run test:e2e` | 页面、主题、动效与网络隔离验收 |
| `npm run release:check` | 路由、资源、许可证与公开边界检查 |

提交云仓库前，建议至少运行：

```bash
npm ci
npm run check
npm test
npm run build
npm run test:e2e
npm run release:check
```

## 设计与架构

页面只在构建期读取本地 demo。浏览器拿到完整静态 HTML 后，由小型客户端组件接管主题、导航、首页/Life/Says 入场动效、照片查看器和文章阅读工具；所有动效都尊重 `prefers-reduced-motion`。运行时不依赖 CMS、数据库、CloudBase、生产域名或外部内容 API。

详细关系见 [架构说明](docs/architecture.md)，内容替换见 [定制指南](docs/customization.md)，公开边界见 [内容与隐私](docs/content-and-privacy.md)，版本整理与上传前检查见 [发行流程](docs/release-process.md)，后续视觉同步见 [正式站设计同步指南](docs/upstream-design-sync.md)。

## 上传清单与发行边界

本版本的实际上传文件以 [`UPLOAD_MANIFEST_1.0.0.md`](UPLOAD_MANIFEST_1.0.0.md) 为准。清单是在检查源码、图片、文档和测试文件后生成的，不只依赖 `.gitignore`；上传前还应重新确认工作区没有临时文件。

应上传的内容包括应用源码、公开 demo 内容、本地 demo 图片、正式文档、截图、测试、脚本、许可证文件以及 `package.json` / `package-lock.json`。以下内容明确排除在仓库之外：

- 依赖和构建产物：`node_modules/`、`.next/`、`out/`、`coverage/`。
- 测试与调试产物：`artifacts/`、`playwright-report/`、`test-results/`、`.playwright-cli/`、`*.log`、`*.tsbuildinfo`。
- 本地配置和系统文件：`.env`、`.env.*`、`.DS_Store`、`Thumbs.db`。

该公开版本与私人正式站保持独立。不要把私人文章、照片、头像、社交账号、后台代码、云端凭据、生产环境配置或未获授权的第三方素材加入本仓库。

## 许可

源代码与本仓库专门制作的 demo 内容、demo 插画采用 MIT License。Milozpace 名称与字标、未包含在本仓库中的个人内容和身份资产不因代码开源而授权。修改并公开自己的版本前，建议在 `src/site.config.ts` 中更换名称与标识。

详见 [MIT License](LICENSE)、[内容与品牌权利声明](CONTENT_LICENSE.md)、[第三方声明](THIRD_PARTY_NOTICES.md)、[安全说明](SECURITY.md) 与 [变更记录](CHANGELOG.md)。
