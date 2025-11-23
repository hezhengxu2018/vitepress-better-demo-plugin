import type { MarkdownRenderer } from 'vitepress'
import type {
  MarkdownRule,
  VitepressDemoBoxConfig,
} from '@/types'
import { transformPreview } from './preview'
import { demoReg } from './utils'

export function vitepressDemoPlugin(md: MarkdownRenderer, params?: VitepressDemoBoxConfig) {
  const defaultHtmlInlineRender = md.renderer.rules.html_inline!
  const defaultHtmlBlockRender = md.renderer.rules.html_block!

  const htmlInlineRule: MarkdownRule = (tokens, idx, options, mdFile, self) => {
    const token = tokens[idx]
    // 删除注释使注释的 demo 不生�?
    token.content = token.content.replace(/<!--[\s\S]*?-->/g, '')
    if (demoReg.some(reg => reg.test(token.content))) {
      return transformPreview(md, token, mdFile, params)
    }
    return defaultHtmlInlineRender(tokens, idx, options, mdFile, self)
  }

  md.renderer.rules.html_inline = htmlInlineRule

  const htmlBlockRule: MarkdownRule = (tokens, idx, options, mdFile, self) => {
    const token = tokens[idx]
    // 删除注释使注释的 demo 不生效
    token.content = token.content.replace(/<!--[\s\S]*?-->/g, '')
    if (demoReg.some(reg => reg.test(token.content))) {
      return transformPreview(md, token, mdFile, params)
    }
    return defaultHtmlBlockRender(tokens, idx, options, mdFile, self)
  }

  md.renderer.rules.html_block = htmlBlockRule
}

// export function createDemoContainer(md: MarkdownRenderer): ContainerOptions {
// }
