import type MarkdownIt from 'markdown-it'
import type { VitepressDemoBoxConfig } from 'vitepress-better-demo-plugin'
import path, { dirname } from 'node:path'
import process from 'node:process'
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

const srcMain = `import { createApp } from "vue";
import Demo from "./Demo.vue";
import 'element-plus/dist/index.css'

const app = createApp(Demo);
app.mount("#app");`

const vitepressDemoPluginConfig: VitepressDemoBoxConfig = {
  demoDir: path.resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../demos',
  ),
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
  title: 'Vitepress Better Demo Plugin',
  description: 'The docs of vitepress-better-demo-plugin',
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
  },
})
