import type Token from 'markdown-it/lib/token'
import type { MarkdownRenderer } from 'vitepress'
import type {
  MarkdownRule,
  VitepressDemoBoxConfig,
} from '@/types'
import { transformPreview } from './preview'
import {
  collectDemoAttributeLines,
  DEMO_ATTR_PLACEHOLDER,
  demoReg,
  escapeAttributeValue,
  extractContainerDescription,
  hasDescriptionAttr,
  normalizeDemoAttributeLines,
} from './utils'

export function vitepressDemoPlugin(md: MarkdownRenderer, params?: VitepressDemoBoxConfig) {
  const defaultHtmlInlineRender = md.renderer.rules.html_inline!
  const defaultHtmlBlockRender = md.renderer.rules.html_block!

  const htmlInlineRule: MarkdownRule = (tokens, idx, options, mdFile, self) => {
    const token = tokens[idx]
    // 删除注释使注释的 demo 不生效
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

interface ContainerOptions {
  marker?: string | undefined
  validate?: (params: string) => boolean
  render?: (
    tokens: Token[],
    index: number,
    options: any,
    env: any,
    self: MarkdownRenderer,
  ) => string
}

export function createDemoContainer(md: MarkdownRenderer, pluginConfig?: VitepressDemoBoxConfig): ContainerOptions {
  if (!md.renderer.rules[DEMO_ATTR_PLACEHOLDER])
    md.renderer.rules[DEMO_ATTR_PLACEHOLDER] = () => ''
  return {
    validate(params) {
      return !!/^demo.*$/.test(params.trim())
    },

    render(tokens, idx, _options, env) {
      if (tokens[idx].nesting === 1 /* means the tag is opening */) {
        const attributeLines = normalizeDemoAttributeLines(
          collectDemoAttributeLines(tokens, idx),
        )
        const descriptionFromInfo = extractContainerDescription(
          tokens[idx].info,
        )
        if (descriptionFromInfo && !hasDescriptionAttr(attributeLines)) {
          attributeLines.push(
            `description="${escapeAttributeValue(descriptionFromInfo)}"`,
          )
        }
        const attrs = attributeLines.length ? ` ${attributeLines.join(' ')}` : ''
        const token = tokens[idx]
        const previousContent = token.content
        token.content = `<demo${attrs} />`
        try {
          return transformPreview(md, token, env, pluginConfig)
        }
        finally {
          token.content = previousContent
        }
      }
      return ''
    },

  }
}

export type { VitepressDemoBoxConfig } from '../types'

export { useDemoBox } from '@/shared/composables/useDemoBox'
