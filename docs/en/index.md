---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: VitePress Better Demo Plugin
  tagline: A better demo experience for VitePress
  actions:
    - theme: brand
      text: Quick Start
      link: /en/guide/start
    - theme: alt
      text: Demo Showcase
      link: /en/components/antd
  image:
      src: /logo.svg
      alt: ChoDocs
features:
  - title: Full TS Support
    details: Complete configuration hints that streamline your development experience.
  - title: Multi-Theme Support
    details: Supports custom themes and bundles both Default and Element-Plus themes out of the box.
  - title: markdown-it-container Support
    details: Adds an extended markdown-it-container syntax for composing your demo documentation.
  - title: Built-In Code Rendering
    details: Reuses the Shiki configuration from VitePress so demo code renders consistently across the site.
---


::: tip Tip
This plugin is forked from `vitepress-demo-plugin` v1.5.0. If you don't need these additional features or prefer to configure Shiki separately for rendering, you can use the original [vitepress-demo-plugin](https://github.com/zh-lx/vitepress-demo-plugin).
:::
