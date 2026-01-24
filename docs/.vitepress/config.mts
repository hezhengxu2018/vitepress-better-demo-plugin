import type MarkdownIt from 'markdown-it'
import type { VitepressDemoBoxConfig } from 'vitepress-better-demo-plugin'
import path, { dirname } from 'node:path'
import process from 'node:process'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import mdContainer from 'markdown-it-container'
import { defineConfig } from 'vitepress'
import { createDemoContainer, vitepressDemoPlugin } from 'vitepress-better-demo-plugin'

function fileURLToPath(fileURL: string) {
  let filePath = fileURL
  if (process.platform === 'win32') {
    filePath = filePath.replace(/^file:\/\/\//, '')
    filePath = decodeURIComponent(filePath)
    filePath = filePath.replace(/\//g, '\\')
  }
  else {
    filePath = filePath.replace(/^file:\/\//, '')
    filePath = decodeURIComponent(filePath)
  }
  return filePath
}

const currentDir = dirname(fileURLToPath(import.meta.url))
const siteUrl = 'https://vitepress-better-demo-plugin.silver-fe.dev'
const defaultTitle = 'Vitepress Better Demo Plugin'
const defaultDescription = '在 VitePress 中用一个 demo 组件统一展示 Vue、React、HTML 示例，并一键跳转到 StackBlitz / CodeSandbox。'
const socialImage = `${siteUrl}/logo.svg`
const srcMain = `import { createApp } from "vue";
import Demo from "./Demo.vue";
import 'element-plus/dist/index.css'

const app = createApp(Demo);
app.mount("#app");`

const vitepressDemoPluginConfig: VitepressDemoBoxConfig = {
  demoDir: path.resolve(currentDir, '../demos'),
  stackblitz: {
    show: true,
    templates: [
      {
        scope: 'element',
        files: {
          'src/main.ts': srcMain,
        },
      },
    ],
  },
  codesandbox: {
    show: false,
    templates: [
      {
        scope: 'element',
        files: {
          'src/main.ts': srcMain,
        },
      },
    ],
  },
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: defaultTitle,
  titleTemplate: ':title | Vitepress Better Demo Plugin',
  description: defaultDescription,
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: siteUrl,
  },
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' }],
    ['link', { rel: 'apple-touch-icon', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#2563eb' }],
    ['meta', { name: 'author', content: 'Hezhengxu' }],
    ['meta', { name: 'description', content: defaultDescription }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: defaultTitle }],
    ['meta', { property: 'og:title', content: defaultTitle }],
    ['meta', { property: 'og:description', content: defaultDescription }],
    ['meta', { property: 'og:url', content: siteUrl }],
    ['meta', { property: 'og:image', content: socialImage }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: defaultTitle }],
    ['meta', { name: 'twitter:description', content: defaultDescription }],
    ['meta', { name: 'twitter:image', content: socialImage }],
  ],
  themeConfig: {
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '快速开始', link: '/guide/start' },
          { text: '进阶配置', link: '/guide/advance' },
          { text: '第三方平台', link: '/guide/preset' },
        ],
      },
      {
        text: '组件库展示',
        items: [
          { text: 'Ant Design', link: '/components/antd' },
          { text: 'Element Plus', link: '/components/element-plus' },
        ],
      },
      {
        text: '增强功能',
        items: [
          { text: 'Typescript 类型提示', link: '/what-is-new/typescript-hint' },
          { text: 'Vitepress的代码染色', link: '/what-is-new/vitepress-code-renderer' },
          { text: '多主题支持', link: '/what-is-new/multiple-themes' },
          { text: '开发自己的容器', link: '/what-is-new/develop-your-own-wrapper' },
          { text: 'Markdown-It-Container 支持', link: '/what-is-new/markdown-it-container-support' },
        ],
      },
    ],

    outline: [2, 4],

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/hezhengxu2018/vitepress-better-demo-plugin',
      },
    ],
    footer: {
      message: 'Released under the MIT License.',
    },
  },
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en',
      themeConfig: {
        sidebar: [
          {
            text: 'Guide',
            items: [
              { text: 'Quick Start', link: '/en/guide/start' },
              { text: 'Advanced Configuration', link: '/en/guide/advance' },
              { text: 'Third Party Platform', link: '/en/guide/preset' },
            ],
          },
          {
            text: 'Component Library',
            items: [
              { text: 'Ant Design', link: '/en/components/antd' },
              { text: 'Element Plus', link: '/en/components/element-plus' },
            ],
          },
          {
            text: 'Enhancements',
            items: [
              { text: 'TypeScript Intellisense', link: '/en/what-is-new/typescript-hint' },
              { text: 'VitePress Code Highlighting', link: '/en/what-is-new/vitepress-code-renderer' },
              { text: 'Multiple Themes', link: '/en/what-is-new/multiple-themes' },
              { text: 'Build Your Own Wrapper', link: '/en/what-is-new/develop-your-own-wrapper' },
              { text: 'markdown-it-container Support', link: '/en/what-is-new/markdown-it-container-support' },
            ],
          },
        ],
        outline: [2, 4],
        socialLinks: [
          {
            icon: 'github',
            link: 'https://github.com/hezhengxu2018/vitepress-better-demo-plugin',
          },
        ],
      },
    },
  },
  markdown: {
    config(md: MarkdownIt) {
      md.use(mdContainer, 'demo', createDemoContainer(md, vitepressDemoPluginConfig))
      md.use<VitepressDemoBoxConfig>(vitepressDemoPlugin, vitepressDemoPluginConfig)
    },
    codeTransformers: [
      transformerTwoslash(),
    ],
  },
})
