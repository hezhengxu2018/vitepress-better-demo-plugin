import ElementPlus from 'element-plus'
import { VitepressEpDemoBox } from 'vitepress-ep-demo-plugin/theme'
// https://vitepress.dev/guide/custom-theme
import Theme from 'vitepress/theme'
import './style.scss'
import 'element-plus/dist/index.css'

export default {
  ...Theme,
  enhanceApp({ app }) {
    app.use(ElementPlus)
    app.component('vitepress-demo-box', VitepressEpDemoBox)
  },
}
