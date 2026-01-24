# VitePress Better Demo Plugin

> 为 VitePress 提供更顺手的 Demo 体验：Vue / React / HTML 同步渲染、代码面板实时同步，并能一键跳进在线沙盒。

[English README](./README.en.md) · [文档（中文）](https://vitepress-better-demo-plugin.silver-fe.dev/) · [Docs (English)](https://vitepress-better-demo-plugin.silver-fe.dev/en/)

从 `vitepress-demo-plugin@1.5.0` fork，并在 2026-01-23 发布 `0.4.0`（最新版本，SSG 渲染全面回归）。License: MIT。

## 核心特性

- 在同一个 `<demo />` 中混排 Vue、React、HTML，同时共享标题、描述和仓库跳转按钮。
- 默认提供 StackBlitz / CodeSandbox 按钮，可扩展模板或自定义 scope，满足任意在线沙盒需求。
- 开箱支持默认主题与 Element Plus 主题，也可以以同名组件替换为你的自定义包装。
- TypeScript-first：`VitepressDemoBoxConfig` / `markdown-it` 插件参数均有完整类型提示，沿用 VitePress 里的 Shiki 渲染器。
- 允许按目录映射 Demo、自由排序 Tab、一次展示多文件、定制背景 / 初始 Tab / locale 等细项。
- 内置双语文档与更新日志，覆盖 TS 提示、主题、渲染器、SSG 等进阶特性。

## 安装

```bash
npm install vitepress-better-demo-plugin -D
# 或
yarn add vitepress-better-demo-plugin -D
# 或
pnpm add vitepress-better-demo-plugin -D
```

- React Demo 需要额外安装 `react react-dom`。
- 使用 Element 主题时，请自行安装 `element-plus`。
- Peer dependencies：`vitepress`、`vue@^3.2`、（可选）`element-plus`。

## 快速开始

1. 在 `.vitepress/config.ts` 注册插件：

   ```ts
   import { defineConfig } from 'vitepress';
   import { vitepressDemoPlugin } from 'vitepress-better-demo-plugin';
   import path from 'path';

   export default defineConfig({
     markdown: {
       config(md) {
         md.use(vitepressDemoPlugin, {
           demoDir: path.resolve(__dirname, '../demos'),
         });
       },
     },
   });
   ```

2. 在任意 Markdown 中插入 `<demo />`：

   ```html
   <demo vue="demo.vue" />
   ```

3. 跑起来：

   ```bash
   pnpm dev
   pnpm build:doc
   ```

## Demo 语法示例

- **单框架渲染**

  ```html
  <demo vue="../demos/demo.vue" />
  <demo react="../demos/demo.tsx" />
  <demo html="../demos/demo.html" />
  ```

- **多框架 + 元信息**

  ```html
  <demo
    vue="../demos/demo.vue"
    react="../demos/demo.tsx"
    html="../demos/demo.html"
    title="多语法示例"
    description="一次渲染三类运行时"
    github="https://github.com/hezhengxu2018/vitepress-better-demo-plugin/blob/main/docs/demos/demo.vue"
  />
  ```

- **多文件展示**

  ```html
  <demo
    vue="multiple.vue"
    :vueFiles="['multiple.vue', 'constant/students.ts']"
  />
  ```

- **控制外观**

  ```html
  <demo vue="demo.vue" background="#f0ffff" order="html,react,vue" select="react" />
  ```

- **跳转到仓库**

  ```html
  <demo vue="demo.vue" github="https://github.com/..." gitlab="https://gitlab.com/..." />
  ```

更多实战可参考 `docs/components/` 中的 Ant Design / Element Plus 指南。

## 在线沙盒 / Playground

- 在单个 Demo 上开启按钮：

  ```html
  <demo vue="../demos/demo.vue" stackblitz="true" codesandbox="true" />
  ```

- 在全局配置模板：

  ```ts
  md.use(vitepressDemoPlugin, {
    stackblitz: {
      show: true,
      templates: [
        {
          scope: 'global',
          files: {
            'print.js': `console.log("Hello VitePress")`,
            'index.html': `<!DOCTYPE html><html><body><div id="app"></div></body><script src="print.js"></script></html>`,
          },
        },
        {
          scope: 'vue',
          files: {
            'src/main.ts': `import { createApp } from "vue";\nimport Demo from "./Demo.vue";\ncreateApp(Demo).mount("#app");`,
          },
        },
        {
          scope: 'myScope',
          files: {
            'src/main.ts': `console.log("custom scope")`,
          },
        },
      ],
    },
    codesandbox: { show: true },
  });
  ```

  通过 `<demo scope="myScope" />` 精确匹配模板。

## 高级配置

- `demoDir`：统一缩短路径。
- `background`：设置容器背景色。
- `order` / `select`：控制 Tab 顺序与默认激活，可在单个 Demo 或 `tabs` 中统一配置。
- `github` / `gitlab`：放置仓库 CTA 按钮。
- `vueFiles` / `reactFiles` / `htmlFiles`：展示多文件，可用数组或命名对象。
- `scope`：与模板或主题 scope 匹配。
- `htmlWriteWay`：在 HTML Demo 中选择 `write` 或 `srcdoc`。
- 静态资源：统一放在 `docs/public`，HTML 里使用绝对路径加载。
- 样式隔离：在 `postcss.config.mjs` 中添加 `postcssIsolateStyles`。
- `locale`：映射 `zh`、`en-US` 等 locale，覆盖内置文案或自定义文本。
- `ssg`：自 0.4.0 起重新引入，构建阶段即可直出 Demo。

## 主题

- 默认 Demo Box：零依赖即可使用。
- Element Plus 主题：在 `enhanceApp` 中注册 `VitepressEpDemoBox` / `VitepressEpDemoPlaceholder`，并安装 Element Plus。

```ts
import Theme from 'vitepress/theme';
import ElementPlus from 'element-plus';
import {
  VitepressEpDemoBox,
  VitepressEpDemoPlaceholder,
} from 'vitepress-better-demo-plugin/theme/element-plus';
import 'element-plus/dist/index.css';

export default {
  ...Theme,
  enhanceApp({ app }) {
    app.use(ElementPlus);
    app.component('VitepressEpDemoBox', VitepressEpDemoBox);
    app.component('VitepressEpDemoPlaceholder', VitepressEpDemoPlaceholder);
  },
};
```

通过 `wrapperComponentName`、`placeholderComponentName`、`autoImportWrapper` 进行全局配置，也可用自定义组件覆盖默认主题。

## TypeScript 与 DX

```ts
import type MarkdownIt from 'markdown-it';
import type { VitepressDemoBoxConfig } from 'vitepress-better-demo-plugin';

md.use<VitepressDemoBoxConfig>(vitepressDemoPlugin, {
  // 完整类型提示
});
```

插件共用 VitePress 配置的 Shiki 实例，使 Demo 高亮风格保持一致；若需要 `twoslash` 等扩展，可在 VitePress 中统一配置。

## 文档与示例

- `docs/guide/start.md`（中 / 英）：安装、基础概念。
- `docs/guide/preset.md`：StackBlitz / CodeSandbox 预设、模板 scope。
- `docs/guide/advance.md`：目录、排序、多文件、HTML 渲染、locale、样式隔离等高级用法。
- `docs/components/*.md`：Ant Design、Element Plus 的逐步示例。
- `docs/demos/`：演示所需的所有代码。
- `docs/what-is-new/`：主题、TS 提示、渲染器与版本更新记录。

运行 `pnpm dev` 即可在本地查看文档。

## 开发脚本

- `pnpm dev`：监听模式下启动文档。
- `pnpm build`：构建插件 + 文档。
- `pnpm build:doc`：仅构建文档站点。
- `pnpm -C plugin build`：仅构建插件；`pnpm -C plugin release` 走 `release-it`。
- `pnpm lint` / `pnpm -C plugin lint`：分别在根目录或子包内执行 ESLint。

## License

[MIT](./LICENSE)。如果只需要更轻量的 baseline，可以使用 [`vitepress-demo-plugin`](https://github.com/zh-lx/vitepress-demo-plugin)。
