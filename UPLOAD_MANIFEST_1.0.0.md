# Milozpace Public v1.0.0 上传清单

审计时间：2026-09-09（Asia/Shanghai）  
候选目录：`C:\MATEBOOK_D\01_Projects\Milozpace-Life-Candidate-20260908`  
版本依据：`package.json` 与 `package-lock.json` 均为 `1.0.0`

这份清单来自对磁盘实际文件的检查，不依赖 `.gitignore` 推断。当前上传集合包含本清单本身，共 92 个文件；其中 91 个为候选原有的源码、内容、资源、文档和配置文件。本清单不代表已经创建 Git、提交、上传或部署。

## 应上传文件

以下路径全部保留并上传。目录项按递归方式包含其列出的文件；未列出的文件不属于上传集合。

### 根目录文件

```text
.gitignore
CHANGELOG.md
CONTENT_LICENSE.md
eslint.config.mjs
LICENSE
next-env.d.ts
next.config.ts
package-lock.json
package.json
playwright.config.ts
README.md
SECURITY.md
THIRD_PARTY_NOTICES.md
tsconfig.json
vitest.config.ts
UPLOAD_MANIFEST_1.0.0.md
```

### CI

```text
.github/workflows/ci.yml
```

### 示例内容

```text
content/demo/articles/quiet-morning.md
content/demo/articles/small-collection.md
content/demo/articles/walking-after-rain.md
content/demo/life.json
content/demo/says.json
```

### 文档与正式预览图

```text
docs/architecture.md
docs/content-and-privacy.md
docs/customization.md
docs/life-local-content.md
docs/release-process.md
docs/upstream-design-sync.md
docs/screenshots/about-light-desktop.png
docs/screenshots/article-light-desktop.png
docs/screenshots/home-dark-desktop.png
docs/screenshots/home-light-desktop.png
docs/screenshots/life-dark-mobile.png
docs/screenshots/life-light-desktop.png
docs/screenshots/notes-light-desktop.png
docs/screenshots/says-light-desktop.png
```

`docs/screenshots/` 中 8 张图是 README 引用的正式公开预览资产，不是调试记录。已逐张查看，内容为公开 demo 页面、公开版 `miloz` 标识和本地页面状态，没有私人照片、邮箱、账号、生产地址或调试面板。

### 公开图片、字体与许可证

```text
public/favicon.svg
public/demo/after-rain.svg
public/demo/avatar.svg
public/demo/evening-field.svg
public/demo/morning-window.svg
public/fonts/AlexBrush-Regular.ttf
public/fonts/lxgw-neo-zhisong.woff2
public/fonts/noto-serif-sc.woff2
public/fonts/licenses/Alex-Brush-OFL.txt
public/fonts/licenses/LXGW-Neo-ZhiSong-LICENSE-CHS.md
public/fonts/licenses/LXGW-Neo-ZhiSong-LICENSE.md
public/fonts/licenses/Noto-Serif-SC-LICENSE.txt
```

5 个 SVG 已读取源文本，均为公开抽象插画、favicon 或头像；字体文件与许可证一并上传。候选中没有 JPG、PNG、GIF、WebP 或 ICO 运行时图片，截图仅位于 `docs/screenshots/`。

### 应用源码与配置

```text
src/app/about/page.tsx
src/app/globals.css
src/app/layout.tsx
src/app/life/page.tsx
src/app/not-found.tsx
src/app/notes/[slug]/page.tsx
src/app/notes/page.tsx
src/app/page.tsx
src/app/says/page.tsx
src/components/confirmed-ambient.tsx
src/components/home-narrative-refined-v3-motion.tsx
src/components/life-template.ts
src/components/life-timeline.tsx
src/components/life-viewer.tsx
src/components/note-reading-experience.tsx
src/components/page-heading.tsx
src/components/says-page-animation-effect.tsx
src/components/site-footer.tsx
src/components/site-frame.tsx
src/components/site-header.tsx
src/components/theme-toggle.tsx
src/lib/content.ts
src/lib/life-readiness.ts
src/lib/life-runtime.ts
src/lib/release-policy.ts
src/site.config.ts
src/styles/.gitkeep
src/styles/about-motion.css
src/styles/about.css
src/styles/home-shell.css
src/styles/home.css
src/styles/life.css
src/styles/nav.css
src/styles/notes.css
src/styles/reader.css
src/styles/says.css
src/styles/shell.css
```

### 本地工具与测试

```text
scripts/preview.mjs
scripts/release-check.ts
tests/content.test.ts
tests/e2e/screenshots.spec.ts
tests/e2e/site.spec.ts
tests/release-policy.test.ts
tests/visual-contract.test.ts
```

## 明确排除

以下目录或文件已从磁盘上传集合中清理，或在本次审计时确认不存在：

```text
.git/
node_modules/
.next/
out/
artifacts/
coverage/
playwright-report/
test-results/
.playwright-cli/
tsconfig.tsbuildinfo
.env
.env.*
*.log
*.trace
*.tmp
*.bak
```

其中 `.next/`、`out/`、`node_modules/`、`artifacts/` 和 `tsconfig.tsbuildinfo` 在审计开始时确实存在；它们已按目录或文件逐一确认后清理。`artifacts/` 内原有的 `release-manifest.json` 与 Playwright `.last-run.json` 属于构建/调试记录，不上传。`docs/screenshots/` 单独保留，因为它们是 README 需要的正式预览图，且已完成视觉检查。

## 实际检查结论

- `src/`、`content/`、`public/`、`docs/`、`scripts/`、`tests/`、`.github/` 和根目录配置均已逐项盘点。
- 源码和文档扫描没有发现 CloudBase、生产域名、私有账号、私有凭据、私人工作簿标识或私有 Windows 路径。`src/lib/release-policy.ts` 中的敏感词只用于发布扫描器规则；`tests/release-policy.test.ts` 是对应测试夹具；`scripts/preview.mjs` 的 `127.0.0.1` 只用于本地静态预览。
- `content/demo/` 仅包含 3 篇本地 Markdown、6 条 Life 示例和 6 条 Says 示例；没有私有 CMS bootstrap、在线内容接口或生产数据文件。
- `public/demo/` 的 SVG 均为原创抽象示例；本地字体许可证随资源保留。
- `package.json` 的版本为 `1.0.0`，`package-lock.json` 顶层版本同步；候选没有 `.git`，尚未创建公开 Git 历史。

## 下一步

README 已完成并链接本清单。上传前重新运行 `npm ci`、`npm run check`、`npm test`、`npm run build`、`npm run release:check` 与必要的 E2E，然后再次删除 `.next/`、`out/`、`node_modules/`、`artifacts/` 和 `tsconfig.tsbuildinfo`，按本清单上传文件。创建 Git、提交、创建云端仓库、上传和部署仍是后续单独动作。
