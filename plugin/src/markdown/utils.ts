import type Token from 'markdown-it/lib/token'
import type { CodeFiles, Platform, VitepressDemoBoxConfig } from '@/types'

export type AttributeMap = Record<string, unknown>

export interface ParseDemoAttributesOptions {
  defaults?: {
    ssg?: boolean
    codeFold?: boolean
  }
}

export function parseDemoAttributes(
  content: string,
  options: ParseDemoAttributesOptions = {},
): AttributeMap {
  const attributes: AttributeMap = {}
  const source = extractDemoAttributeSource(content)
  if (!source)
    return applyDemoAttributeDefaults(attributes, options)
  const fragments = mergeAttributeTokens(splitAttributeTokens(source))
  for (const fragment of fragments) {
    // eslint-disable-next-line regexp/no-super-linear-backtracking
    const match = /^([^\s=]+)(?:\s*=\s*([\s\S]+))?$/.exec(fragment)
    if (!match)
      continue
    let [, rawKey, rawValue = 'true'] = match
    rawKey = rawKey.trim()
    if (!rawKey)
      continue
    let isBound = false
    if (rawKey.startsWith('v-bind:')) {
      rawKey = rawKey.slice(7)
      isBound = true
    }
    else if (rawKey.startsWith(':')) {
      rawKey = rawKey.slice(1)
      isBound = true
    }
    if (!rawKey)
      continue
    const normalizedKey = normalizeDemoAttributeKey(rawKey)
    if (!normalizedKey)
      continue
    const normalizedValue = stripOuterQuotes((rawValue ?? '').trim())
    attributes[normalizedKey] = isBound
      ? coerceBoundExpression(normalizedValue)
      : coerceLiteralAttribute(normalizedValue)
  }
  return applyDemoAttributeDefaults(attributes, options)
}

export function normalizeDemoConfig(config?: VitepressDemoBoxConfig) {
  const stackblitz: Platform = {
    ...(config?.stackblitz || {}),
    show: typeof config?.stackblitz?.show === 'boolean'
      ? config.stackblitz.show
      : false,
  }

  const codesandbox: Platform = {
    ...(config?.codesandbox || {}),
    show: typeof config?.codesandbox?.show === 'boolean'
      ? config.codesandbox.show
      : false,
  }

  return {
    ...(config || {}),
    stackblitz,
    codesandbox,
    wrapperComponentName: config?.wrapperComponentName ?? 'vitepress-demo-box',
    placeholderComponentName: config?.placeholderComponentName ?? 'vitepress-demo-placeholder',
    autoImportWrapper: config?.autoImportWrapper ?? true,
    ssg: config?.ssg ?? false,
  }
}

function applyDemoAttributeDefaults(
  attributes: AttributeMap,
  options: ParseDemoAttributesOptions,
) {
  const normalized: AttributeMap = { ...attributes }

  const rawSsg = normalized.ssg
  if (typeof rawSsg === 'number')
    normalized.ssg = Boolean(rawSsg)
  else if (typeof rawSsg !== 'boolean' && typeof options.defaults?.ssg === 'boolean')
    normalized.ssg = options.defaults.ssg

  const rawCodeFold = normalized.codeFold
  if (typeof rawCodeFold === 'number') {
    normalized.codeFold = Boolean(rawCodeFold)
  }
  else if (
    rawCodeFold === undefined
    && typeof options.defaults?.codeFold === 'boolean'
  ) {
    normalized.codeFold = options.defaults.codeFold
  }

  return normalized
}

function normalizeDemoAttributeKey(rawKey: string) {
  const trimmed = rawKey.trim()
  if (!trimmed)
    return ''
  if (!trimmed.includes('-'))
    return trimmed
  return trimmed.replace(/-([a-z0-9])/gi, (_, char: string) => char.toUpperCase())
}

export function parseFilesAttribute(input: unknown): CodeFiles | undefined {
  if (input == null || input === '')
    return undefined
  if (Array.isArray(input))
    return input as CodeFiles
  if (isPlainObject(input))
    return input as CodeFiles
  if (typeof input === 'string') {
    const { success, value } = tryParseJsonLike(input)
    if (success && (Array.isArray(value) || isPlainObject(value)))
      return value as CodeFiles
  }
  return undefined
}

export function applyPlatformValue(target: { show: boolean, [key: string]: any }, value: unknown) {
  if (value === undefined || value === null || Array.isArray(value))
    return
  if (isPlainObject(value)) {
    Object.assign(target, value)
    return
  }
  if (typeof value === 'boolean') {
    target.show = value
  }
}

export function isPlainObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function extractDemoAttributeSource(content: string) {
  if (!content)
    return ''
  const tagStart = content.indexOf('<demo')
  if (tagStart === -1)
    return ''
  const tagNameEnd = tagStart + '<demo'.length
  let quote: string | null = null
  for (let i = tagNameEnd; i < content.length; i++) {
    const char = content[i]
    if (quote) {
      if (char === quote)
        quote = null
      continue
    }
    if (char === '"' || char === '\'') {
      quote = char
      continue
    }
    if (char === '>') {
      let source = content.slice(tagNameEnd, i)
      source = source.replace(/\/\s*$/, '')
      return source.trim()
    }
  }
  return ''
}

function splitAttributeTokens(source: string) {
  const tokens: string[] = []
  let buffer = ''
  let quote: string | null = null
  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    if (quote) {
      if (char === quote)
        quote = null
      buffer += char
      continue
    }
    if (char === '"' || char === '\'') {
      quote = char
      buffer += char
      continue
    }
    if (/\s/.test(char)) {
      if (buffer) {
        tokens.push(buffer)
        buffer = ''
      }
      continue
    }
    buffer += char
  }
  if (buffer)
    tokens.push(buffer)
  return tokens
}

function mergeAttributeTokens(tokens: string[]) {
  const fragments: string[] = []
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]?.trim()
    if (!token)
      continue
    const eqIndex = token.indexOf('=')
    if (eqIndex !== -1) {
      const valuePart = token.slice(eqIndex + 1).trim()
      if (valuePart) {
        fragments.push(token)
        continue
      }
      const nextToken = tokens[i + 1]?.trim()
      if (nextToken && nextToken !== '=') {
        fragments.push(`${token}${nextToken}`)
        i++
        continue
      }
      if (nextToken === '=') {
        const valueToken = tokens[i + 2]?.trim()
        if (valueToken) {
          fragments.push(`${token}${valueToken}`)
          i += 2
        }
        else {
          fragments.push(`${token}true`)
          i += 1
        }
        continue
      }
      fragments.push(`${token}true`)
      continue
    }
    const next = tokens[i + 1]?.trim()
    if (next === '=') {
      const valueToken = tokens[i + 2]?.trim()
      if (valueToken) {
        fragments.push(`${token}=${valueToken}`)
        i += 2
      }
      else {
        fragments.push(`${token}=true`)
        i += 1
      }
      continue
    }
    if (next && !next.includes('=')) {
      fragments.push(`${token}=${next}`)
      i++
    }
    else {
      fragments.push(`${token}=true`)
    }
  }
  return fragments
}

function coerceBoundExpression(value: string): unknown {
  const trimmed = value.trim()
  if (!trimmed)
    return ''
  const lowered = trimmed.toLowerCase()
  if (lowered === 'true')
    return true
  if (lowered === 'false')
    return false
  if (lowered === 'null')
    return null
  if (lowered === 'undefined')
    return undefined
  if (lowered === 'nan')
    return Number.NaN
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed))
    return Number(trimmed)
  const { success, value: parsed } = tryParseJsonLike(trimmed)
  if (success)
    return parsed
  return trimmed
}

function coerceLiteralAttribute(value: string): unknown {
  const trimmed = value.trim()
  if (!trimmed)
    return ''
  const lowered = trimmed.toLowerCase()
  if (!lowered || lowered === 'true' || lowered === '1' || lowered === 'yes')
    return true
  if (lowered === 'false' || lowered === '0' || lowered === 'no')
    return false
  if (lowered === 'null')
    return null
  if (lowered === 'undefined')
    return undefined
  if (lowered === 'nan')
    return Number.NaN
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed))
    return Number(trimmed)
  return trimmed
}

function tryParseJsonLike(value: string) {
  const normalized = formatString(value)
  if (!normalized)
    return { success: false as const, value: undefined }
  try {
    return { success: true as const, value: JSON.parse(normalized) }
  }
  catch (_error) {
    return { success: false as const, value: undefined }
  }
}

function formatString(value: string) {
  return value
    .replace(/'/g, '"')
    .replace(/\\n/g, '')
    .trim()
    .replace(/^"/, '')
    .replace(/"$/, '')
    .replace(/,(\s)*\}$/, '}')
    .replace(/,(\s)*\]$/, ']')
}

/* eslint-disable regexp/no-contradiction-with-assertion */
// <demo></demo> or <demo />
export const demoReg = [
  /<demo(\s)((.|\n)*)><\/demo>/,
  /<demo(\s)((.|\n)*)\/>/,
]

const scriptLangTsReg = /<\s*script[^>]*\blang=['"]ts['"][^>]*/
const scriptSetupReg = /<\s*script[^>]*\bsetup\b[^>]*/
const scriptSetupCommonReg
  // eslint-disable-next-line regexp/no-super-linear-backtracking
  = /<\s*script\s+(?:(setup|lang='ts'|lang="ts")\s*)?(setup|lang='ts'|lang="ts")?\s*>/

/**
 * 注入 script 脚本
 * @param env mdInstance
 * @param path
 * @param name component name
 * @param type
 */
export function injectComponentImportScript(env: any, path: string, name?: string, type?: 'dynamicImport' | 'inject') {
  const scriptsCode = env.sfcBlocks.scripts as any[]

  // 判断MD文件内部是否本身就存在 <script setup> 脚本
  const scriptsSetupIndex = scriptsCode.findIndex((script: any) => {
    if (
      scriptSetupReg.test(script.tagOpen)
      || scriptLangTsReg.test(script.tagOpen)
    ) {
      return true
    }
    return false
  })

  // 统一处理组件名称为驼峰命名
  const componentName = name || ''

  let importCode = ''
  if (type === 'dynamicImport') {
    importCode = name
      ? `
      const ${componentName} = shallowRef();
      onMounted(async () => {
        ${componentName}.value = (await import('${path}')).default;
      });
      `.trim()
      : `
      onMounted(async () => {
        await import('${path}');
      });
      `.trim()
  }
  else if (type === 'inject') {
    importCode = `
      ${name}
    `.trim()
  }
  else {
    importCode = name
      ? `import ${componentName} from '${path}'`
      : `import '${path}'`
  }

  // MD文件中没有 <script setup> 或 <script setup lang='ts'> 脚本文件
  if (scriptsSetupIndex === -1) {
    const scriptBlockObj = {
      type: 'script',
      tagClose: '</script>',
      tagOpen: '<script setup lang=\'ts\'>',
      content: `<script setup lang='ts'>
        ${importCode}
        </script>`,
      contentStripped: importCode,
    }
    scriptsCode.push(scriptBlockObj)
  }
  else {
    // MD文件注入了 <script setup> 或 <script setup lang='ts'> 脚本
    const oldScriptsSetup = scriptsCode[0]
    // MD文件中存在已经引入了组件，直接替换组件的内容
    if (
      oldScriptsSetup.content.includes(path)
      && (!name || oldScriptsSetup.content.includes(componentName))
    ) {
      scriptsCode[0].content = oldScriptsSetup.content
    }
    else {
      // MD文件中不存在组件 添加组件 import ${_componentName} from '${path}'\n
      // 如果MD文件中存在 <script setup lang="ts">、<script lang="ts" setup>  或 <script setup> 代码块, 那么统一转换为 <script setup lang="ts">
      const scriptCodeBlock = '<script lang="ts" setup>\n'
      scriptsCode[0].content = scriptsCode[0].content.replace(
        scriptSetupCommonReg,
        scriptCodeBlock,
      )
      scriptsCode[0].content = scriptsCode[0].content.replace(
        scriptCodeBlock,
        `<script setup>\n
      ${importCode}\n`,
      )
    }
  }
}

/**
 * 根据组件路径组合组件引用名称
 * @param path
 * @returns string
 */
export function composeComponentName(path: string) {
  let isFlag = true
  const componentList: string[] = []
  while (isFlag) {
    const lastIndex = path.lastIndexOf('/')
    if (lastIndex === -1) {
      isFlag = false
    }
    else {
      const name = path.substring(lastIndex + 1)
      componentList.unshift(name)
      path = path.substring(0, lastIndex)
    }
  }
  return (
    `Temp${
      btoa(
        encodeURIComponent(
          componentList.join('-').split('.').slice(0, -1).join('.'),
        ),
      ).replace(/=/g, 'Equal')}`
  )
}

export const DEMO_ATTR_PLACEHOLDER = 'demo_attr_placeholder'

/**
 * Collects attribute-like text lines contained in a :::demo block.
 * @param tokens Markdown-it token list
 * @param startIdx Index of the opening container token
 */
export function collectDemoAttributeLines(tokens: Token[], startIdx: number) {
  const lines: string[] = []
  const closeIdx = findContainerCloseIndex(tokens, startIdx)
  if (closeIdx === -1)
    return lines
  for (let i = startIdx + 1; i < closeIdx; i++) {
    const token = tokens[i]
    if (token.type === 'inline') {
      const segments = token.children?.length
        ? token.children
            .filter(child => child.type === 'text')
            .map(child => child.content)
        : [token.content]
      segments
        .join('\n')
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .forEach(line => lines.push(line))
    }
    neutralizeToken(token)
  }
  return lines
}

/**
 * Normalizes collected lines into canonical `key="value"` attribute strings.
 * Supports shorthand vue paths and whitespace-delimited attributes.
 * @param lines Raw attribute lines
 */
export function normalizeDemoAttributeLines(lines: string[]) {
  const normalized = lines
    .map(line => line.trim())
    .filter(Boolean)
  if (!normalized.length)
    return normalized
  if (!looksLikeAttributeLine(normalized[0])) {
    const vuePath = ensureVuePath(normalized.shift() || '')
    if (vuePath)
      normalized.unshift(`vue="${escapeAttributeValue(vuePath)}"`)
  }
  return normalized.map(line => normalizeAttributeLine(line))
}

/**
 * Extracts the inline description that follows `demo` in the container info string.
 * @param info Markdown-it container info string
 */
export function extractContainerDescription(info: string) {
  const trimmed = (info || '').trim()
  if (!trimmed.toLowerCase().startsWith('demo'))
    return ''
  const description = trimmed.slice(4).trim()
  return description
}

/**
 * Checks whether description attribute already exists in the attribute list.
 * @param lines Normalized attribute lines
 */
export function hasDescriptionAttr(lines: string[]) {
  return lines.some(line => /^description(?:=|\s)/.test(line.trim()))
}

/**
 * Escapes characters that are unsafe in HTML attribute values.
 * @param value Attribute value to escape
 */
export function escapeAttributeValue(value: string) {
  const replacements: Record<string, string> = {
    '&': '&amp;',
    '"': '&quot;',
    '\'': '&#39;',
    '<': '&lt;',
    '>': '&gt;',
  }
  return value.replace(/[&"'<>]/g, char => replacements[char])
}

/**
 * Tests whether a line already looks like an attribute declaration.
 * Accepts both `key=value` and `key value` styles.
 * @param line Line to test
 */
function looksLikeAttributeLine(line: string) {
  const trimmed = line.trim()
  const keyPattern = /^(?:v-bind:|[:@])?[A-Z_][\w:-]*/i
  if (!keyPattern.test(trimmed))
    return false
  return /=/.test(trimmed) || /\s+.+/.test(trimmed)
}

/**
 * Ensures the shorthand path is treated as a Vue file path, appending `.vue` if needed.
 * @param raw Raw path text
 */
function ensureVuePath(raw: string) {
  const trimmed = raw.replace(/^['"]|['"]$/g, '').trim()
  if (!trimmed)
    return ''
  return trimmed.endsWith('.vue') ? trimmed : `${trimmed}.vue`
}

/**
 * Converts a raw attribute declaration into `key="value"` format with escaping applied.
 * @param line Raw attribute declaration line
 */
function normalizeAttributeLine(line: string) {
  const equalsMatch = /^((?:v-bind:|[:@])?[A-Z_][\w:-]*)\s*=(\S.*)$/i.exec(line)
  if (equalsMatch) {
    const [, key, rawValue] = equalsMatch
    return `${key}="${escapeAttributeValue(stripOuterQuotes(rawValue.trim()))}"`
  }
  const spaceMatch = /^((?:v-bind:|[:@])?[A-Z_][\w:-]*)\s+(\S.*)$/i.exec(line)
  if (spaceMatch) {
    const [, key, rawValue] = spaceMatch
    return `${key}="${escapeAttributeValue(stripOuterQuotes(rawValue.trim()))}"`
  }
  return line
}

/**
 * Removes wrapping quotes from a string if both ends match.
 * @param value Value that may contain surrounding quotes
 */
function stripOuterQuotes(value: string) {
  if (!value)
    return value
  const first = value[0]
  const last = value[value.length - 1]
  if ((first === '"' && last === '"') || (first === '\'' && last === '\''))
    return value.slice(1, -1)
  return value
}

/**
 * Finds the matching closing token index for a demo container, accounting for nesting.
 * @param tokens Markdown-it tokens
 * @param startIdx Index of the container open token
 */
function findContainerCloseIndex(tokens: Token[], startIdx: number) {
  if (!Array.isArray(tokens) || startIdx < 0 || startIdx >= tokens.length)
    return -1
  const startToken = tokens[startIdx]
  if (!startToken || startToken.type !== 'container_demo_open')
    return -1
  let depth = 0
  for (let i = startIdx + 1; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type === 'container_demo_open') {
      depth++
      continue
    }
    if (token.type === 'container_demo_close') {
      if (depth === 0)
        return i
      depth--
    }
  }
  return -1
}

/**
 * Replaces a token with a placeholder so it does not render output.
 * @param token Token to neutralize
 */
function neutralizeToken(token: Token) {
  token.type = DEMO_ATTR_PLACEHOLDER
  token.tag = ''
  token.nesting = 0
  token.block = false
  token.hidden = true
  token.content = ''
  token.children = []
}
