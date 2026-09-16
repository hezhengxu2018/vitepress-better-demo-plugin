# markdown-it-container 写法支持

现在你可以用 markdown-it-container 的写法来使用 `vitepress-better-demo-plugin`。当然，在使用前你需要先安装 markdown-it-container，引入 `createDemoContainer` 并将其注册为markdown-it-container的一个插件。

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

注册完成后可以用markdown-it-container的写法来替换原来的写法。比如：

```md
::: demo
vue="../demos/demo.vue"
:::
```

渲染效果如下

::: demo
vue="../demos/demo.vue"
:::

所有的配置项都可以用`=`或者空格进行分割，两种写法是等效的，如果配置项的属性值中没有空格那么连引号也可以省略。

```md
::: demo
vue ../demos/demo.vue
:::
```

::: demo
vue "../demos/demo.vue"
:::

本插件特别的与element-plus文档中的写法做了对齐，容器内的第一行如果没有`=`或者空格进行分割，则会被当做是vue的demo的路径，而且可以省略vue后缀。上面的写法可以简写为:

```md
::: demo
../demos/demo
:::
```

React TSX 示例也支持首行路径简写，保留 `.tsx` 扩展名即可，等价于 `react="../demos/demo.tsx"`。不带扩展名的路径仍默认补全 `.vue`。

```md
::: demo
../demos/demo.tsx
:::
```

::: demo
../demos/demo.tsx
:::

::: demo
../demos/demo
:::

## 多文件与复杂属性

首行路径（或 `vue` 属性）指定预览组件；`vueFiles` 只指定源码切换 tab，不会自动选择预览入口。文件 tab 位于默认折叠的源码区内。本例通过 `:codeFold="false"` 默认展开源码区，让 tab 直接可见；其他示例可以点击「查看源码」按钮展开。

```md
:::demo 多文件示例
../demos/multiple

:codeFold="false"
:vueFiles="{
  'multiple.vue': '../demos/multiple.vue',
  'constant/students.ts': '../demos/constant/students.ts',
}"
:::
```

:::demo 多文件示例
../demos/multiple

:codeFold="false"
:vueFiles="{
  'multiple.vue': '../demos/multiple.vue',
  'constant/students.ts': '../demos/constant/students.ts',
}"
:::

- `key=value` 与 `key value` 均可使用；包含空格的普通字符串需要引号。
- `:prop` 与 `v-bind:prop` 接受 JSON5 字面量：字符串、数字、布尔值、数组、对象、`null`，并额外支持 `undefined`。支持单/双引号、转义字符和尾逗号，数组和对象可以跨行；不支持页面变量、函数调用或其他 JavaScript 表达式。
- 除布尔开关外，不带绑定前缀的属性保持字符串；`vueFiles` / `reactFiles` / `htmlFiles` 也接受字符串形式的数组或对象，文件路径必须是非空字符串。
- 容器中的下划线、星号、链接样式文本及 `&quot;` 均按原文处理。只有 `<demo>` HTML 写法会解码 HTML 实体。
- 重复属性以后者为准。显式 `vue` / `react` 优先于对应类型的首行简写，显式 `description` 优先于容器标题，空字符串也会覆盖标题。
- 所有文件路径相对 `demoDir`；没有配置时相对当前 Markdown 文件。空源码文件仍保留 tab。

## 错误提示与升级说明

现在，未闭合引号、非法绑定表达式、错误属性类型、文件不存在或不可读都会终止构建，错误包含 Markdown 文件位置、属性名，以及文件读取失败时的绝对路径。不会再静默丢弃错误的多文件配置。

平台开关支持布尔绑定（如 `:stackblitz="true"`），也兼容 `true/false`、`yes/no`、`1/0` 的普通属性写法。`ssg`、`codeFold` 同样支持布尔配置，并支持 `code-fold`、`code-meta` 等插件属性的短横线写法。容器内部不能嵌套其他 demo 容器。插件注册方式和主题组件接口保持不变。
