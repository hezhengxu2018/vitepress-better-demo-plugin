# VitePress Better Demo Plugin

> A better demo experience for VitePress—render Vue / React / HTML side by side, keep code panes in sync, and launch online sandboxes with a single tag.

[中文 README](./README.md) · [Docs (ZH)](https://vitepress-better-demo-plugin.silver-fe.dev/) · [Docs (EN)](https://vitepress-better-demo-plugin.silver-fe.dev/en/)

Forked from `vitepress-demo-plugin@1.5.0`, now released as `0.4.0` on 2026-01-23 (SSG rendering restored). Licensed MIT.

## Highlights

- Mix Vue, React, and HTML inside one `<demo />`, sharing titles, descriptions, and repo buttons.
- StackBlitz / CodeSandbox buttons out of the box, plus extensible templates and scopes for any sandbox workflow.
- Default and Element Plus wrappers are built in, or swap in your own components by reusing the same names.
- TypeScript-first DX: `VitepressDemoBoxConfig` and markdown-it options ship with full typings, reusing the same Shiki instance as VitePress.
- Fine control over demo directories, tab ordering, multi-file previews, background color, default tab, locale, and more.
- Bilingual docs with a detailed changelog covering TS hints, theming, renderer tweaks, and SSG options.

## Installation

```bash
npm install vitepress-better-demo-plugin -D
# or
yarn add vitepress-better-demo-plugin -D
# or
pnpm add vitepress-better-demo-plugin -D
```

- React demos need `react react-dom`.
- The Element theme requires `element-plus`.
- Peer deps: `vitepress`, `vue@^3.2`, optional `element-plus`.

## Quick Start

1. Register the plugin in `.vitepress/config.ts`:

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

2. Use `<demo />` anywhere in Markdown:

   ```html
   <demo vue="demo.vue" />
   ```

3. Run the docs site:

   ```bash
   pnpm dev
   pnpm build:doc
   ```

## Usage Patterns

- **Single framework**

  ```html
  <demo vue="../demos/demo.vue" />
  <demo react="../demos/demo.tsx" />
  <demo html="../demos/demo.html" />
  ```

- **Mixed block with metadata**

  ```html
  <demo
    vue="../demos/demo.vue"
    react="../demos/demo.tsx"
    html="../demos/demo.html"
    title="Multiple Syntax Demo"
    description="One block, three runtimes"
    github="https://github.com/hezhengxu2018/vitepress-better-demo-plugin/blob/main/docs/demos/demo.vue"
  />
  ```

- **Multiple files per syntax**

  ```html
  <demo
    vue="multiple.vue"
    :vueFiles="['multiple.vue', 'constant/students.ts']"
  />
  ```

- **Control appearance**

  ```html
  <demo vue="demo.vue" background="#f0ffff" order="html,react,vue" select="react" />
  ```

- **Link out**

  ```html
  <demo vue="demo.vue" github="https://github.com/..." gitlab="https://gitlab.com/..." />
  ```

See `docs/components/` for Ant Design and Element Plus walkthroughs.

## Playground Integrations

- Enable per demo:

  ```html
  <demo vue="../demos/demo.vue" stackblitz="true" codesandbox="true" />
  ```

- Configure global templates:

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

  Match scopes via `<demo scope="myScope" />`.

## Advanced Options

- `demoDir` – shorten relative paths.
- `background` – set container background color.
- `codeFold` – default collapsed/expanded state of the code panel.
- `order` / `select` – control tab order and default selection per demo or globally via `tabs`.
- `github` / `gitlab` – display CTA buttons.
- `vueFiles` / `reactFiles` / `htmlFiles` – show multiple files (arrays or maps).
- `scope` – attach demos to template/theme scopes.
- `htmlWriteWay` – choose between `write` and `srcdoc` for HTML demos.
- Static assets – keep them under `docs/public` and reference via absolute paths.
- Style isolation – add `postcssIsolateStyles` inside `postcss.config.mjs`.
- `locale` – map VitePress locale keys (`zh`, `en-US`, etc.) to built-in or custom strings.
- `ssg` – reintroduced in 0.4.0 to render demos directly during builds.

## Themes

- Default wrapper: zero extra dependency.
- Element Plus wrapper: register `VitepressEpDemoBox` / `VitepressEpDemoPlaceholder` in `enhanceApp` and install Element Plus.

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

Configure `wrapperComponentName`, `placeholderComponentName`, and `autoImportWrapper` to keep theming consistent, or override them with your own components.

## TypeScript & DX

```ts
import type MarkdownIt from 'markdown-it';
import type { VitepressDemoBoxConfig } from 'vitepress-better-demo-plugin';

md.use<VitepressDemoBoxConfig>(vitepressDemoPlugin, {
  // fully typed options
});
```

The plugin reuses the Shiki instance from VitePress so code highlighting stays consistent; extend Shiki in VitePress if you need transformers such as `twoslash`.

## Docs & Samples

- `docs/guide/start.md` (ZH/EN) – installation and fundamentals.
- `docs/guide/preset.md` – StackBlitz / CodeSandbox presets plus template scopes.
- `docs/guide/advance.md` – directories, ordering, multi-file tabs, HTML strategies, locale, isolation.
- `docs/components/*.md` – Ant Design and Element Plus cookbooks.
- `docs/demos/` – actual sample code.
- `docs/what-is-new/` – theming, TS hints, renderer updates, and release notes.

Run `pnpm dev` to explore the docs locally.

## Development Scripts

- `pnpm dev` – start the docs in watch mode.
- `pnpm build` – build plugin + docs.
- `pnpm build:doc` – docs only.
- `pnpm -C plugin build` – build the library; `pnpm -C plugin release` runs `release-it`.
- `pnpm lint` / `pnpm -C plugin lint` – lint the root or the package.

## License

[MIT](./LICENSE). Want a leaner baseline? Try [`vitepress-demo-plugin`](https://github.com/zh-lx/vitepress-demo-plugin).
