# Quick Start

This section of the documentation is identical to `vitepress-demo-plugin`.

## Installation

Choose your preferred package manager for installation:

```bash
npm install vitepress-better-demo-plugin -D
```

```bash
yarn add vitepress-better-demo-plugin -D
```

```bash
pnpm add vitepress-better-demo-plugin -D
```

## Import Plugin

Add the following code to `.vitepress/config.ts` to import the `vitepressDemoPlugin`:

```ts
import { defineConfig } from 'vitepress';
import { vitepressDemoPlugin } from 'vitepress-better-demo-plugin'; // [!code ++]
import path from 'path';

export default defineConfig({
  // other configs...
  markdown: { // [!code ++]
    config(md) { // [!code ++]
      md.use(vitepressDemoPlugin); // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
});
```

## Vue Demo

You can set the path of a `.vue` file using `<demo vue="xxx/path" />` in an `.md` file; this renders the Vue component and displays its source code.

```html
<demo vue="../demos/demo.vue" />
```

The corresponding rendering result is as follows:

<demo vue="../demos/demo.vue" />

## HTML Demo

You can set the path of an `.html` file using `<demo html="xxx/path" />` in a `.md` file; this renders the HTML and displays its source code.

```html
<demo html="../demos/demo.html" />
```

The corresponding rendering result is as follows:

<demo html="../demos/demo.html" />

## React Demo

::: tip Tip
If you want to display React demos in your VitePress site, install the required dependencies using the following command


```bash
npm install react react-dom -D
```
:::

You can set the path of a `.jsx`/`.tsx` file using `<demo react="xxx/path" />` in an `.md` file; this renders the React component and displays its source code.

```html
<demo react="../demos/demo.tsx" />
```

The corresponding rendering result is as follows:

<demo react="../demos/demo.tsx" />

<hr />

## Mixed Demo

::: tip Tip
Same as above, to display React demos in your VitePress site, run the following command to install the required dependencies:

```bash
npm install react react-dom -D
```

:::

You can specify multiple syntaxes (e.g. `vue`, `react`, `html`) in a single `<demo />` to display different demo formats in one block.

```html
<demo
  vue="../demos/demo.vue"
  react="../demos/demo.tsx"
  html="../demos/demo.html"
/>
```

The corresponding rendering result is as follows:

<demo
  vue="../demos/demo.vue"
  react="../demos/demo.tsx"
  html="../demos/demo.html"
/>

## Title And Description

Set the demo title and description using `title` and `description`:

```html
<demo
  vue="../demos/demo.vue"
  react="../demos/demo.tsx"
  html="../demos/demo.html"
  title="Multiple Syntax DEMO"
  description="This is an example of a mixed demo. You can use title and description to specify the title and description of the demo."
/>
```

The corresponding rendering result is as follows:

<demo
  vue="../demos/demo.vue"
  react="../demos/demo.tsx"
  html="../demos/demo.html"
  title="Multiple Syntax DEMO"
  description="This is an example of a mixed demo. You can use title and description to specify the title and description of the demo."
/>

## Open on GitHub and GitLab

You can add a `github` or `gitlab` link to `<demo />` that navigates to the corresponding address.

```html
<demo
  vue="../demos/demo.vue"
  github="https://github.com/hezhengxu2018/vitepress-better-demo-plugin/blob/main/docs/demos/demo.vue" 
/>  
```

The corresponding rendering result is as follows:

<demo
  vue="../demos/demo.vue"
  github="https://github.com/hezhengxu2018/vitepress-better-demo-plugin/blob/main/docs/demos/demo.vue" 
/>

For GitLab, the usage is the same as GitHub. Simply replace `github` with `gitlab`.
