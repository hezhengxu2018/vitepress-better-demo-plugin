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

const ENCODED_MARKDOWN_ASYNC_PLACEHOLDER_RE
  = /%3Cpre%3E%3C!--%3A%3Amarkdown-it-async%3A%3A(\w+)%3A%3A--%3E%3Ccode%3E[\s\S]*?%3C%2Fcode%3E%3C%2Fpre%3E/g

type MarkdownItAsyncPlaceholderEntry = [
  Promise<string> | string,
  string,
  string,
  string,
]

type MarkdownItAsyncRenderer = MarkdownRenderer & {
  renderAsync?: (src: string, env?: Record<string, any>) => Promise<string>
  placeholderMap?: Map<string, MarkdownItAsyncPlaceholderEntry>
}

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

  enhanceMarkdownItAsyncRenderer(md)
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

export type { VitepressDemoBoxConfig, VitepressDemoBoxProps } from '../types'

export { useDemoBox } from '@/shared/composables/useDemoBox'

export { COMPONENT_TYPE } from '@/shared/constant'

export { i18n } from '@/shared/locales/i18n'

function enhanceMarkdownItAsyncRenderer(md: MarkdownRenderer) {
  if (!isMarkdownItAsyncRenderer(md))
    return

  const asyncMd = md as MarkdownItAsyncRenderer
  const originalRenderAsync = asyncMd.renderAsync!.bind(asyncMd)

  asyncMd.renderAsync = async (...args) => {
    let html = await originalRenderAsync(...args)
    if (!asyncMd.placeholderMap?.size)
      return html

    html = await replaceAsync(
      html,
      ENCODED_MARKDOWN_ASYNC_PLACEHOLDER_RE,
      async (_match, id: string) => {
        if (!asyncMd.placeholderMap?.has(id))
          return ''

        const [promise, _raw, lang] = asyncMd.placeholderMap.get(id)!
        asyncMd.placeholderMap.delete(id)

        let resolved = await promise || ''
        if (!resolved.startsWith('<pre'))
          resolved = `<pre><code class="language-${lang}">${resolved}</code></pre>`

        return encodeURIComponent(resolved)
      },
    )

    return html
  }
}

function isMarkdownItAsyncRenderer(md: MarkdownRenderer): md is MarkdownItAsyncRenderer {
  return typeof (md as MarkdownItAsyncRenderer).renderAsync === 'function'
    && (md as MarkdownItAsyncRenderer).placeholderMap instanceof Map
}

async function replaceAsync(
  str: string,
  regex: RegExp,
  replacer: (...args: any[]) => Promise<string>,
) {
  const promises: Promise<string>[] = []
  str.replace(regex, (...args) => {
    promises.push(replacer(...args))
    return ''
  })

  const results = await Promise.all(promises)
  let index = 0

  return str.replace(regex, () => results[index++] ?? '')
}
