import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import ElementPlus from 'element-plus'
import { VitepressEpDemoBox, VitepressEpDemoPlaceholder } from 'vitepress-better-demo-plugin/theme/element-plus'
import Theme from 'vitepress/theme'
import './style.scss'
import 'element-plus/dist/index.css'
import '@shikijs/vitepress-twoslash/style.css'

export default {
  ...Theme,
  enhanceApp({ app }) {
    app.use(ElementPlus)
    app.use(TwoslashFloatingVue)
    app.component('VitepressEpDemoBox', VitepressEpDemoBox)
    app.component('VitepressEpDemoPlaceholder', VitepressEpDemoPlaceholder)
  },
} as typeof Theme
