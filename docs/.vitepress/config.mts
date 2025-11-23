import path, { dirname } from 'node:path'
import process from 'node:process'
import { defineConfig } from 'vitepress'
import { vitepressDemoPlugin } from 'vitepress-ep-demo-plugin'

type VitepressDemoBoxConfig = Parameters<typeof vitepressDemoPlugin>[1]

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

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Vitepress EP Demo Plugin',
  description: 'The docs of vitepress-demo-plugin',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',

    sidebar: [
      {
        text: '指南',
        items: [
          { text: '快速开始', link: '/guide/start' },
        ],
      },
    ],

    outline: [2, 4],

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/zh-lx/vitepress-demo-plugin',
      },
    ],
  },
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
    },
  },
  markdown: {
    config(md) {
      md.use<VitepressDemoBoxConfig>(vitepressDemoPlugin, {
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
      })
    },
  },
})
