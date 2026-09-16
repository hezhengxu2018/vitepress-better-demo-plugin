# markdown-it-container Syntax Support

You can now use `vitepress-better-demo-plugin` through the markdown-it-container syntax. Install `markdown-it-container`, import `createDemoContainer`, and register it as a markdown-it plugin before using it.

```ts
import { defineConfig } from 'vitepress';
import mdContainer from 'markdown-it-container' // [!code ++]
import { createDemoContainer } from 'vitepress-better-demo-plugin'; // [!code ++]
import path from 'path';

export default defineConfig({
  // other configs...
  markdown: {
    config(md) {
      md.use(mdContainer, 'demo', createDemoContainer(md, { // [!code ++]
        // ...
        demoDir: path.resolve(
          dirname(fileURLToPath(import.meta.url)),
          '../demos',
        ),
      }))
    },
  },
});
```

After the registration you can switch from the old syntax to markdown-it-container blocks, for example:

```md
::: demo
vue="../demos/demo.vue"
:::
```

Rendered result:

::: demo
vue="../demos/demo.vue"
:::

All options can be separated with either `=` or a whitespace. Both forms are equivalent and quotes can be omitted when the value does not contain spaces.

```md
::: demo
vue ../demos/demo.vue
:::
```

::: demo
vue "../demos/demo.vue"
:::

The plugin aligns with the element-plus documentation. If the first line inside the container does not contain `=` or a whitespace separator, it is treated as the path to a Vue demo and the `.vue` suffix can be omitted. The snippet above can therefore be shortened to:

```md
::: demo
../demos/demo
:::
```

This simplification only applies to Vue demos. It matches the element-plus convention and optimizes for the most common use case of this plugin.

## Multiple files and structured attributes

The first path (or the `vue` attribute) selects the preview component. `vueFiles` only selects source tabs; it does not infer the preview entry. Source tabs are inside the code panel, which is collapsed by default. This example uses `:codeFold="false"` to show them immediately; otherwise, click the code icon to expand the panel.

```md
:::demo Multiple files
../demos/multiple

:codeFold="false"
:vueFiles="{
  'multiple.vue': '../demos/multiple.vue',
  'constant/students.ts': '../demos/constant/students.ts',
}"
:::
```

:::demo Multiple files
../demos/multiple

:codeFold="false"
:vueFiles="{
  'multiple.vue': '../demos/multiple.vue',
  'constant/students.ts': '../demos/constant/students.ts',
}"
:::

- Both `key=value` and `key value` work. Quote ordinary strings containing spaces.
- `:prop` and `v-bind:prop` accept JSON5 literals: strings, numbers, booleans, arrays, objects and `null`, plus explicit `undefined`. Single/double quotes, escapes, trailing commas and multiline arrays/objects are supported. Page variables, function calls and other JavaScript expressions are not supported.
- Unbound attributes remain strings, except for boolean switches. `vueFiles` / `reactFiles` / `htmlFiles` also accept string representations of arrays or objects; each file path must be a non-empty string.
- Underscores, asterisks, link-like text and `&quot;` remain literal in containers. Only HTML `<demo>` attributes decode HTML entities.
- The last duplicate attribute wins. Explicit `vue` overrides the shorthand entry; explicit `description` overrides the container heading, including an empty string.
- All paths resolve against `demoDir`, or the Markdown file's directory when it is unset. Empty source files retain their tabs.

## Errors and migration

Unclosed quotes, invalid binding expressions, incorrect attribute types and missing/unreadable files now fail the build. Errors identify the Markdown file, available line number and attribute; file errors also include the resolved absolute path. Invalid multi-file configuration is no longer silently discarded.

Platform switches accept bound booleans such as `:stackblitz="true"`, as well as plain `true/false`, `yes/no` and `1/0` values. Boolean `ssg` and `codeFold` options are also supported, including kebab-case plugin attributes such as `code-fold` and `code-meta`. Nested demo containers are not supported. Plugin registration and theme component interfaces remain unchanged.
