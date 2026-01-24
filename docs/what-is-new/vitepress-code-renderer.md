# 使用Vitepress内置的代码染色

现在插件使用了Vitepress内置的shiki进行代码染色，即组件demo的代码渲染效果会和文档的代码渲染保持一致，不需要进行额外的配置。
这也意味着可以直接在代码中使用Vitepress已经默认启用的转换器，不需要额外配置shiki的[transformers](https://shiki.zhcndoc.com/packages/transformers)
例如：

<demo vue="../demos/demo-shiki.vue" />

同样的，如果需要扩展shiki（如`twoslash`）则需要在vitepress的配置项中进行配置。可以参考[shiki的官方文档](https://shiki.zhcndoc.com/packages/vitepress)

## 代码块 Meta（例：twoslash）

如果你已经在 VitePress 配置了 `@shikijs/vitepress-twoslash`，可以通过 `codeMeta` / `vueMeta` / `reactMeta` / `htmlMeta` 把对应的 meta 追加到代码块语言后，以便 `twoslash` 后缀正确传入。

### 全局配置

```ts
import { defineConfig } from 'vitepress';
import { vitepressDemoPlugin } from 'vitepress-better-demo-plugin';

export default defineConfig({
  markdown: {
    config(md) {
      md.use(vitepressDemoPlugin, {
        codeMeta: 'twoslash',
        // vueMeta/reactMeta/htmlMeta 会覆盖 codeMeta
      });
    },
  },
});
```

### 局部覆盖

```html
<demo vue="demo.vue" vue-meta="twoslash" />
<demo react="demo.tsx" code-meta="twoslash" />
```

<demo vue="demo.vue" vue-meta="twoslash" />
