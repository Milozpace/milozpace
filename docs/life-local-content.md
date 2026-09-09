# 生活页本地内容与交互

生活页从 `content/demo/life.json` 读取现有示例内容，图片只使用 `public/demo/` 的本地资产。数据适配位于 `src/app/life/page.tsx`：示例只有日期，因此统一补充 12:00（UTC+8）作为示例时刻；不会联网读取内容。

- `src/components/life-template.ts`：可编辑的时间线结构模板；不包含个人记录。
- `src/lib/life-runtime.ts`：按月份克隆记录、横竖图片布局、记录计数与入场动画。
- `src/lib/life-readiness.ts`：首屏显示时机；加载提示至少显示 900ms，等待本地字体，预算为 2000ms。
- `src/components/life-timeline.tsx`：把本地数据、时间统计和首屏动画连接到页面。
- `src/components/life-viewer.tsx`：照片弹层、关闭按钮、Esc、浏览器返回、遮罩点击、焦点约束与焦点恢复。
- `src/styles/life.css`：生活页样式及仅在生活页生效的容器、主题与按钮补充样式。

年度统计使用浏览器当地日期，记录展示使用 UTC+8。开启系统“减少动态效果”后，时间线和查看器不播放位移入场。

运行：`npm install`、`npm run build`、`npm run preview -- --port 41832`。访问 `/life/`。开发时使用 `npm run dev`。

本目录为独立全站候选；生活页继续使用本地适配器，与其它页面共享同一主题、导航和页脚框架。
