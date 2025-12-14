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

仅会对vue的demo做这样的简化，一方面是与element-plus文档的写法对齐，另外一方面是Vue类型的demo展示应该是本插件的主要应用场景。

::: demo
../demos/demo
:::
