# Use VitePress' Built-in Code Highlighting

The plugin now relies on the Shiki instance that ships with VitePress, so demo snippets use the same highlighting style as the rest of your documentation with zero extra setup. You can also use every transformer that VitePress enables by default without registering Shiki transformers yourself.

For example:

<demo vue="../demos/demo-shiki.vue" />

If you need to extend Shiki (for example to enable `twoslash`), configure it directly in the VitePress options. Refer to the [official Shiki documentation](https://shiki.zhcndoc.com/packages/vitepress) for more details.

## Code Block Meta (e.g. twoslash)

If you have enabled `@shikijs/vitepress-twoslash` in VitePress, you can append meta to the code fence language via `codeMeta` / `vueMeta` / `reactMeta` / `htmlMeta` so the `twoslash` suffix is passed through.

### Global config

```ts
import { defineConfig } from 'vitepress';
import { vitepressDemoPlugin } from 'vitepress-better-demo-plugin';

export default defineConfig({
  markdown: {
    config(md) {
      md.use(vitepressDemoPlugin, {
        codeMeta: 'twoslash',
        // vueMeta/reactMeta/htmlMeta override codeMeta
      });
    },
  },
});
```

### Local override

```html
<demo vue="demo.vue" vue-meta="twoslash" />
<demo react="demo.tsx" code-meta="twoslash" />
```

<demo vue="demo.vue" vue-meta="twoslash" :codeFold="false" />
