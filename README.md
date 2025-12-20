# VitePress Better Demo Plugin

> A better demo experience for VitePress - render Vue/React/HTML demos, keep code in sync, and jump into online sandboxes with one tag.

Docs (Chinese): https://vitepress-better-demo-plugin.pages.dev/
Docs (English): https://vitepress-better-demo-plugin.pages.dev/en/
Forked from `vitepress-demo-plugin@1.5.0`, currently `0.0.1` (released 2025-11-29). Licensed MIT.

## Features

- Mix Vue, React, and HTML demos in one block with shared tabs, titles, descriptions, and repo links.
- StackBlitz and CodeSandbox buttons per demo or globally, backed by extensible templates.
- Default and Element Plus demo wrappers, or plug in your own components.
- TypeScript-first DX via `VitepressDemoBoxConfig`, markdown-it-container support, and Shiki reuse.
- Fine-grained controls for demo directories, ordering, multiple files, HTML rendering, locale, and style isolation.
- Bilingual docs plus change logs covering TS hints, themes, and renderer updates.

## Installation

```bash
npm install vitepress-better-demo-plugin -D
# or
yarn add vitepress-better-demo-plugin -D
# or
pnpm add vitepress-better-demo-plugin -D
```

React demos also need `react react-dom`. Element Plus components are optional but required for the Element theme.

Peer dependencies: `vitepress`, `vue@^3.2`, optional `element-plus`.

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

2. Use the `<demo />` component anywhere in Markdown:

   ```html
   <demo vue="demo.vue" />
   ```

3. Run the docs site:

   ```bash
   pnpm dev
   pnpm build:doc
   ```

## Usage Examples

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
    title="Multiple Syntax DEMO"
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

See `docs/components/` for Ant Design and Element Plus cookbooks.

## Playground Integrations

Per demo:

```html
<demo vue="../demos/demo.vue" stackblitz="true" codesandbox="true" />
```

Global config with templates:

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

Match scopes with `<demo scope="myScope" />`.

## Advanced Configuration

- `demoDir` - shorten relative paths.
- `background` - container background color.
- `order` / `select` - control tab order and the default selection (per demo or via `tabs`).
- `github` / `gitlab` - add CTA buttons.
- `vueFiles` / `reactFiles` / `htmlFiles` - show multiple files (arrays or named objects).
- `scope` - pair demos with template or theme scopes.
- `htmlWriteWay` - choose `write` vs `srcdoc` for HTML demos.
- Local assets - keep static files under `docs/public` and reference them via absolute paths in HTML.
- Style isolation - add `postcssIsolateStyles` in `postcss.config.mjs`.
- `locale` - map VitePress locale keys (`zh`, `en-US`, etc.) to built-in translations or custom strings.

## Themes

Two wrappers:

1. Default theme (no extra dependency).
2. Element Plus theme (register `VitepressEpDemoBox` and `VitepressEpDemoPlaceholder`).

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

Set `wrapperComponentName`, `placeholderComponentName`, and `autoImportWrapper` globally for consistent theming. Provide your own components under the default names to replace the built-ins.

## TypeScript and DX

```ts
import type MarkdownIt from 'markdown-it';
import type { VitepressDemoBoxConfig } from 'vitepress-better-demo-plugin';

md.use<VitepressDemoBoxConfig>(vitepressDemoPlugin, {
  // fully typed options
});
```

The plugin reuses the Shiki instance configured by VitePress so demo code matches your site automatically. Extend Shiki via VitePress config if you need transformers such as `twoslash`.

## Docs and Examples

- `docs/guide/start.md` (ZH/EN) - installation and basics.
- `docs/guide/preset.md` - StackBlitz and CodeSandbox presets plus template scopes.
- `docs/guide/advance.md` - directories, ordering, multi-file tabs, HTML strategies, locale, isolation.
- `docs/components/*.md` - Ant Design and Element Plus walk-throughs.
- `docs/demos/` - the actual sample code.
- `docs/what-is-new/` - multi-theme, TypeScript hints, and Shiki renderer updates.

Run `pnpm dev` to browse docs locally.

## Development

Monorepo scripts:

- `pnpm dev` - run docs in watch mode.
- `pnpm build` - build plugin plus docs.
- `pnpm build:doc` - docs only.
- `pnpm -C plugin build` - build the library; `pnpm -C plugin release` runs `release-it`.
- `pnpm lint` / `pnpm -C plugin lint` - lint root or package.

## License

[MIT](./LICENSE). Prefer the leaner baseline? Use [`vitepress-demo-plugin`](https://github.com/zh-lx/vitepress-demo-plugin).
