# Multiple Themes

Two themes are built in, so you can switch between the default theme and the Element Plus theme. The default theme requires no extra dependency, while the Element Plus theme mirrors the official Element Plus documentation style. Make sure Element Plus is installed before enabling its theme.

The default container may feel less polished and not fully aligned with a customized documentation style, but it requires zero additional setup and is good enough for most scenarios.

## Quick Start

To use the `Element Plus` theme, first register the container components inside the VitePress theme entry:

```ts title="theme/index.ts"
import ElementPlus from 'element-plus'
import {
  VitepressEpDemoBox,
  VitepressEpDemoPlaceholder
} from 'vitepress-better-demo-plugin/theme/element-plus'
import Theme from 'vitepress/theme'
import './style.scss'
import 'element-plus/dist/index.css'

export default {
  ...Theme,
  enhanceApp({ app }) {
    app.use(ElementPlus)
    app.component('VitepressEpDemoBox', VitepressEpDemoBox)
    app.component('VitepressEpDemoPlaceholder', VitepressEpDemoPlaceholder)
  },
} as typeof Theme
```

Then pass the related props to switch the theme on any demo:

```html
<demo
  react="../demos/demo.tsx"
  wrapperComponentName="VitepressEpDemoBox"
  placeholderComponentName="VitepressEpDemoPlaceholder"
/>
```

Rendered output:

<demo react="../demos/demo.tsx" wrapperComponentName="VitepressEpDemoBox" placeholderComponentName="VitepressEpDemoPlaceholder" code-meta="twoslash" />

With this configuration you can mix both container styles on the same documentation site. When no props are supplied the default container is used:

```html
<demo react="../demos/demo.tsx" />
```

<demo react="../demos/demo.tsx" />

## Use It Globally

To avoid repeating the props, set up the container components globally inside the plugin config:

```ts
md.use<VitepressDemoBoxConfig>(vitepressDemoPlugin, {
  // ...
  wrapperComponentName: 'vitepress-ep-demo-box',
  placeholderComponentName: 'vitepress-ep-demo-placeholder',
  // ...
})
```

## Disable Default Container Registration

For convenience the plugin registers the default container automatically. If you are sure it will never be used you can disable the auto import:

```ts
md.use<VitepressDemoBoxConfig>(vitepressDemoPlugin, {
  // ...
  autoImportWrapper: false,
  // ...
})
```

This slightly reduces the final bundle size. An extra benefit is that a custom component registered as `vitepress-demo-box` and `vitepress-demo-placeholder` can take over seamlessly when auto import is off, so you no longer need to configure component names manually.

## Custom Containers

You can always build your own container components, register them in VitePress, and pass their names to the plugin so they match the visual language of your documentation.
