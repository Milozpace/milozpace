# 架构说明

Milozpace Public Edition 是一个静态优先的 Next.js 项目。它保留个人站点的具体页面关系，同时主动切断私人内容与生产系统。

## 内容到页面

```text
content/demo/*.json ─┐
                     ├─ src/lib/content.ts ─ 页面组件 ─ next build ─ out/
articles/*.md ───────┘
public/demo/* ────────────────────────────────────────────────┘
```

`src/lib/content.ts` 在构建期解析内容、检查必填字段、slug 与本地图片。页面不会在浏览器中请求内容 API，也没有云端适配器占位。

## 页面与客户端行为

- `src/app` 定义首页、四个子页面、文章路由和 404；`src/components/site-frame.tsx` 按路由恢复各页对应的正式框架。
- 默认页面在构建期输出完整 HTML；Markdown 只在构建时转换。
- 主题按钮以 `light | system | dark` 读取与保存浏览器本地偏好；顶部快速切换，页尾提供三级选择。
- 阅读工具负责文章进度、阅读字体和回到顶部。
- 首页、Life 与 Says 的进入控制由小型客户端效果器配合 CSS 完成；reduced-motion 下立即呈现。

视觉事实来自私人正式站 1.3.1 已选中的 `cloud-breath` 环境、首页专用导航、`innei-boku` 子页导航、正式 Notes/Life/Says/About/阅读版式与页尾。公开版只移植这些已选结果，不包含候选选择逻辑。首屏不等待网络内容：HTML 与本地样式先完成，主题脚本在交互前应用偏好，客户端功能随后接管，因此不需要网络内容轮询或生产请求协调。

## 明确不包含

公开版没有 CMS、数据库 schema、数据迁移脚本、对象存储、生产域名、部署流水线或私人站点版本选择逻辑。CI 只验证代码、内容和静态构建。
