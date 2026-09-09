# 定制指南

1. 在 `src/site.config.ts` 更换名称、字标、简介、导航和链接。
2. 删除或替换 `content/demo/articles` 下的 Markdown；文件名必须是小写 kebab-case slug。
3. 替换 `life.json` 与 `says.json`，保持现有字段结构。
4. 将图片放入 `public`，内容中的路径从 `/` 开始。
5. 在 `src/styles/shell.css` 调整环境色彩和字体，在对应页面样式文件调整版式；再检查 390px 与 1440px。
6. 运行 `npm run check`、`npm test`、`npm run build`、`npm run test:e2e` 和 `npm run release:check`。

文章示例：

```md
---
title: 示例标题
summary: 用于列表页和页面描述的摘要
date: 2026-09-07
cover: /demo/example.svg
topic: 示例主题
weather: 晴
mood: 平静
place: 窗边
---

这里是正文。
```

公开部署自己的版本前，请同时复核内容、图片许可、站点身份和页面截图；自动扫描不能代替人工判断。

若要从自己的私有正式站同步后续视觉改动，请按 [正式站设计同步指南](upstream-design-sync.md) 逐页迁移，不要直接覆盖本地内容目录。
