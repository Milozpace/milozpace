# 公开版发行流程

Milozpace 的公开版本独立维护。一个版本只有在源码、公开内容、文档、验证结果、Git tag 和 GitHub Release 相互一致后，才算完成发行；部署是另一项独立操作。

## 准备版本

1. 明确版本目标，只纳入本次公开发行需要的变化。
2. 更新 `package.json`、`package-lock.json` 与 `CHANGELOG.md` 中的版本信息。
3. 检查 `content/demo/`、`public/` 和 `docs/screenshots/`，确保只有获准公开的内容与素材。
4. 更新 README、相关文档和 `docs/releases/<version>.md`。
5. 确认仓库不包含环境变量、凭据、私人路径、生产服务地址或部署配置。

## 验证候选

在干净依赖环境中运行：

```bash
npm ci
npm run check
npm test
npm run build
npm run test:e2e
npm run release:check
npm audit
```

`test:e2e` 会重拍 `docs/screenshots/` 中的公开预览图。提交前必须人工查看图片内容，并确认截图变化符合预期；若只是验证且不准备更新截图，应恢复这些文件后再继续。

自动检查通过不代替人工验收。至少检查首页、Notes、文章阅读、Life、Says、About 与 404 的桌面/移动端、浅色/深色及 reduced-motion 行为。

## 创建发行

1. 复核 `git diff`、`git status` 和即将发布的提交。
2. 将版本准备改动提交到 `main`。
3. 创建指向该提交的 annotated tag，例如 `git tag -a v1.0.0 -m "Milozpace v1.0.0"`。
4. 原子推送 `main` 与 tag，避免远端短暂出现版本文档与 tag 不一致。
5. 使用 `docs/releases/<version>.md` 创建 GitHub Release，并再次核对 tag、标题、正文和附件。
6. 更新仓库简介与 topics；只有存在稳定公开演示地址时才设置 homepage。

GitHub 自动生成的源码归档即可作为默认发行附件。若未来需要提供预构建静态包，应在发行说明中记录构建命令、Node.js 版本和 SHA-256；不要把本地 `out/` 直接提交进 Git。

## v1.0.0

首个公开稳定版本的说明见 [`docs/releases/v1.0.0.md`](releases/v1.0.0.md)。
