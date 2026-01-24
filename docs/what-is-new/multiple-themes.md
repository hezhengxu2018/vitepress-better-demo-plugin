# 多主题

目前内置了两套主题，可以在默认主题和 Element-Plus 主题间进行切换。默认主题不需要安装任何额外依赖；Element-Plus 主题基本与Element-Plus 官方文档中的风格保持一致。

使用 Element-Plus 主题前请确保已经安装了 Element-Plus。

默认的容器在交互细节上不够完美，与文档的风格可能也不是非常的契合，但是不需要再额外安装组件库，大部分情况下也可以满足需求。

## 快速开始

想要使用 `Element-Plus` 的主题先要在 Vitepress 的主题配置文件中注册相应的容器组件：

``` ts theme/index.ts
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

然后就可以在demo中传入相应的参数来启用这个主题：

```html
<demo
  react="../demos/demo.tsx"
  wrapperComponentName="VitepressEpDemoBox"
  placeholderComponentName="VitepressEpDemoPlaceholder"
/>
```

渲染效果如下：

<demo react="../demos/demo.tsx" wrapperComponentName="VitepressEpDemoBox" placeholderComponentName="VitepressEpDemoPlaceholder" code-meta="twoslash" />

这样配置可以在同一个文档网站中使用两种风格的demo容器，当不指定时就会使用默认容器：

```html
<demo react="../demos/demo.tsx" />
```

<demo react="../demos/demo.tsx" />

## 全局使用

当然为每个组件写一遍相应的配置有些麻烦，可以在插件的配置中统一添加已经注册的容器组件：

```ts
md.use<VitepressDemoBoxConfig>(vitepressDemoPlugin, {
  // ...
  wrapperComponentName: 'vitepress-ep-demo-box',
  placeholderComponentName: 'vitepress-ep-demo-placeholder',
  // ...
})
```

## 关闭默认的容器组件注册

为了方便使用插件会默认注册默认的容器组件。如果确定不会用到默认容器，可以关闭默认容器组件的引入：

```ts
md.use<VitepressDemoBoxConfig>(vitepressDemoPlugin, {
  // ...
  autoImportWrapper: false,
  // ...
})
```

理论上可以减小最后产物的体积，当然还有另外一个好处是如果关闭自动引入的同时将自定义组件注册为`vitepress-demo-box`和`vitepress-demo-placeholder`可以无缝接替原有组件，不需要再额外配置组件名。

## 自定义容器

当然你也可以自己开发符合自己文档风格的容器组件，将其注册到Vitepress中并提供相应的组件名称即可。
