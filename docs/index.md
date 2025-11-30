---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: Vitepress Better Demo Plugin
  tagline: 更好的 Vitepress Demo Plugin
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/start
    - theme: alt
      text: DEMO 示例
      link: /components/antd
  image:
      src: /logo.svg
      alt: ChoDocs
features:
  - title: 完整的TS支持
    details: 完整的配置项提示，优化开发体验
  - title: 多主题支持
    details: 支持自定义主题，内置默认与Element-Plus两套主题
  - title: markdown-it-container 支持
    details: 新增 markdown-it-container 的书写方式
  - title: 使用内置的代码渲染
    details: 在Vitepress中配置的shiki也会用于本插件中的代码。
---

::: tip 提示
本插件fork自`vitepress-demo-plugin`的1.5.0版本。如果不需要这些特性，或者倾向于使用独立配置的shiki渲染也可以使用原版[vitepress-demo-plugin](https://github.com/zh-lx/vitepress-demo-plugin)
:::
