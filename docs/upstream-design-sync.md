# 正式站设计同步指南

公开版与私有正式站是两条独立版本线。需要吸收新版设计时，只迁移已经正式确认的页面结构、样式和交互，不直接复制整站目录。

## 同步范围

| 私有正式结果 | 公开版位置 | 保留方式 |
|---|---|---|
| 页面框架、导航、页脚和主题 | `src/components/site-frame.tsx`、`site-header.tsx`、`site-footer.tsx`、`src/styles` | 手工对齐 DOM、属性、CSS 与交互参数 |
| 首页版式与动效 | `src/app/page.tsx`、`home-narrative-refined-v3-motion.tsx`、`home.css` | 保留公开版文字、头像和站内入口 |
| 手记列表与阅读页 | `src/app/notes`、`reading-tools.tsx`、`notes.css`、`reader.css` | 保留 Markdown 加载器和本地图片 |
| Life、Says、About | 对应页面、组件与样式文件 | 保留 `content/demo` 数据和本地资产 |

## 操作顺序

1. 记录要参考的私有正式版本号，并确认它是不可变的正式快照。
2. 在隔离目录中逐页比较 DOM、计算样式、明暗主题、移动端和 reduced-motion。
3. 只把结构、样式与交互差异移入公开版；内容字段继续通过 `src/lib/content.ts` 和本地适配器提供。
4. 新增资源前先确认许可，再放入 `public`；页面不得引用私有路径或远程生产资源。
5. 检查首页、Notes、文章、Life、Says、About、404，以及导航菜单、主题、滚动、查看器和阅读工具。
6. 运行 `npm run check`、`npm test`、`npm run build`、`npm run test:e2e` 与 `npm run release:check`。
7. 人工检查生成的 `out` 和截图，确认没有私人文字、图片、链接、凭据、服务地址或部署配置。

同步完成只代表生成了新的公开版候选。版本号、提交、发布与部署应分别决定。
