import type { MarkdownRenderer } from 'vitepress'
import type { DemoDefinition } from './parsers/definition'
import type { VitepressDemoBoxConfig } from '@/types'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import { demoError } from './parsers/definition'
import {
  composeComponentName,
  escapeAttributeValue,
  injectComponentImportScript,
  isPlainObject,
  normalizeDemoConfig,
} from './utils'

/**
 * 编译预览组件
 * @param md
 * @param definition
 * @param mdFile
 * @param config
 * @return string
 */
export function transformPreview(md: MarkdownRenderer, definition: DemoDefinition, mdFile: any, config?: VitepressDemoBoxConfig) {
  const demoIndexKey = '__vp_demo_index__'
  const demoIndex = (mdFile[demoIndexKey] = (mdFile[demoIndexKey] || 0) + 1)

  const normalizedConfig = normalizeDemoConfig(config)
  const {
    demoDir,
    stackblitz: stackblitzConfig,
    codesandbox: codesandboxConfig,
    wrapperComponentName,
    placeholderComponentName,
    autoImportWrapper,
    ssg: configSsgValue,
    codeFold: configCodeFold,
    codeMeta: configCodeMeta,
    vueMeta: configVueMeta,
    reactMeta: configReactMeta,
    htmlMeta: configHtmlMeta,
    locale: configLocale,
  } = normalizedConfig

  const { vue: vuePathValue, html: htmlPathValue, react: reactPathValue } = definition.entries
  const ssgAttr = definition.ssg ?? configSsgValue
  const {
    codeMeta: codeMetaAttr,
    vueMeta: vueMetaAttr,
    reactMeta: reactMetaAttr,
    htmlMeta: htmlMetaAttr,
    ...restProps
  } = definition.props
  if (restProps.codeFold === undefined && configCodeFold !== undefined)
    restProps.codeFold = configCodeFold
  const wrapperName = definition.wrapperComponentName || wrapperComponentName
  const placeholderName = definition.placeholderComponentName || placeholderComponentName
  const mdFilePath = mdFile.realPath ?? mdFile.path
  const dirPath = demoDir || path.dirname(mdFilePath)
  const mergePlatform = (defaults: typeof stackblitzConfig, value: DemoDefinition['platforms']['stackblitz']) => ({
    ...defaults,
    ...(typeof value === 'boolean' ? { show: value } : value),
  })
  const stackblitz = mergePlatform(stackblitzConfig, definition.platforms.stackblitz)
  const codesandbox = mergePlatform(codesandboxConfig, definition.platforms.codesandbox)

  const readSource = (absolutePath: string, attribute: string) => {
    try {
      return fs.readFileSync(absolutePath, 'utf-8')
    }
    catch (error) {
      return demoError(definition.locations[attribute] || definition.location, attribute, `Cannot read file "${absolutePath}": ${(error as Error).message}`)
    }
  }

  const normalizeMeta = (value: unknown) => {
    if (typeof value !== 'string')
      return ''
    return value.trim()
  }

  const resolveMetaByType = (type: 'vue' | 'react' | 'html') => {
    const attrMeta = type === 'vue'
      ? vueMetaAttr
      : type === 'react'
        ? reactMetaAttr
        : htmlMetaAttr
    const configMeta = type === 'vue'
      ? configVueMeta
      : type === 'react'
        ? configReactMeta
        : configHtmlMeta
    return normalizeMeta(
      attrMeta ?? codeMetaAttr ?? configMeta ?? configCodeMeta,
    )
  }

  const metaByType = {
    vue: resolveMetaByType('vue'),
    react: resolveMetaByType('react'),
    html: resolveMetaByType('html'),
  }

  const isTwoslashMeta = (meta?: string) => {
    return !!meta && meta.includes('twoslash')
  }

  const componentVuePath = vuePathValue
    ? path
        .resolve(
          demoDir || path.dirname(mdFilePath),
          vuePathValue as string || '.',
        )
        .replace(/\\/g, '/')
    : ''
  const componentHtmlPath = htmlPathValue
    ? path
        .resolve(
          demoDir || path.dirname(mdFilePath),
          htmlPathValue as string || '.',
        )
        .replace(/\\/g, '/')
    : ''
  const componentReactPath = reactPathValue
    ? path
        .resolve(
          demoDir || path.dirname(mdFilePath),
          reactPathValue as string || '.',
        )
        .replace(/\\/g, '/')
    : ''

  const absolutePath = path
    .resolve(
      dirPath,
      componentVuePath || componentHtmlPath || componentReactPath || '.',
    )
    .replace(/\\/g, '/')

  const componentAlias = composeComponentName(absolutePath)
  const componentName = ssgAttr ? `${componentAlias}Ssg` : componentAlias
  const reactComponentName = `react${componentName}`

  // 启用自动导入包装组件
  if (autoImportWrapper) {
    injectComponentImportScript(
      mdFile,
      'vitepress-better-demo-plugin/theme/default',
      `{ VitepressDemoPlaceholder, VitepressDemoBox }`,
    )
    injectComponentImportScript(mdFile, 'vitepress-better-demo-plugin/theme/default/style')
  }

  injectComponentImportScript(mdFile, 'vue', '{ ref, shallowRef, onMounted }')

  // 注入组件导入语句
  if (componentVuePath) {
    injectComponentImportScript(
      mdFile,
      componentVuePath,
      componentName,
      ssgAttr ? undefined : 'dynamicImport',
    )
  }
  if (componentReactPath) {
    injectComponentImportScript(
      mdFile,
      'react',
      '{ createElement as reactCreateElement, useLayoutEffect as reactUseLayoutEffect }',
    )
    injectComponentImportScript(
      mdFile,
      'react-dom/client',
      '{ createRoot as reactCreateRoot }',
    )
    injectComponentImportScript(
      mdFile,
      componentReactPath,
      reactComponentName,
      ssgAttr ? undefined : 'dynamicImport',
    )
  }

  const placeholderVisibleKey = ssgAttr
    ? null
    : `__placeholder_visible_${componentName}_${demoIndex}__`

  // 控制 placeholder 的显示
  if (placeholderVisibleKey) {
    injectComponentImportScript(
      mdFile,
      placeholderVisibleKey,
      `const ${placeholderVisibleKey} = ref(true);`,
      'inject',
    )
  }

  // 组件代码，动态引入以便实时更新
  const htmlCodeTempVariable = componentHtmlPath
    ? `TempCodeHtml${componentName}`
    : `''`
  const reactCodeTempVariable = componentReactPath
    ? `TempCodeReact${componentName}`
    : `''`
  const vueCodeTempVariable = componentVuePath
    ? `TempCodeVue${componentName}`
    : `''`
  if (componentHtmlPath) {
    injectComponentImportScript(
      mdFile,
      `${componentHtmlPath}?raw`,
      htmlCodeTempVariable,
    )
  }
  if (componentReactPath) {
    injectComponentImportScript(
      mdFile,
      `${componentReactPath}?raw`,
      reactCodeTempVariable,
    )
  }
  if (componentVuePath) {
    injectComponentImportScript(
      mdFile,
      `${componentVuePath}?raw`,
      vueCodeTempVariable,
    )
  }

  // 多文件展示
  const files = {
    vue: Object.create(null) as Record<string, { code: string, filename: string, html?: string, htmlDomKey?: string }>,
    react: Object.create(null) as Record<string, { code: string, filename: string, html?: string, htmlDomKey?: string }>,
    html: Object.create(null) as Record<string, { code: string, filename: string, html?: string, htmlDomKey?: string }>,
  }

  const highlightedCode: Record<'vue' | 'react' | 'html', string> = {
    vue: '',
    react: '',
    html: '',
  }

  const inlineHighlightDomKeys: Partial<Record<'vue' | 'react' | 'html', string>> = {}
  const highlightDomSnippets: string[] = []

  const createHighlightDomId = (
    lang: 'vue' | 'react' | 'html',
    scope: string,
  ) => {
    const base = `${componentName}_${demoIndex}_${lang}_${scope}`
    return `vp_demo_highlight_${Buffer.from(base)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')}`
  }

  const registerHighlightDom = (
    lang: 'vue' | 'react' | 'html',
    html: string,
    fileKey?: string,
  ) => {
    if (!html)
      return ''
    const domId = createHighlightDomId(lang, fileKey ? `file_${fileKey}` : 'inline')
    const attrs = [
      `id="${domId}"`,
      `data-vp-demo-lang="${lang}"`,
      fileKey ? `data-vp-demo-file="${escapeAttributeValue(fileKey)}"` : '',
    ]
      .filter(Boolean)
      .join(' ')
    highlightDomSnippets.push(`<div ${attrs} style="display:none;">${html}</div>`)
    if (!fileKey)
      inlineHighlightDomKeys[lang] = domId
    return domId
  }

  const resolveLangByFile = (filePath: string) => {
    const ext = path.extname(filePath || '').replace('.', '').toLowerCase()
    const alias: Record<string, string> = {
      htm: 'html',
      mjs: 'js',
      cjs: 'js',
    }
    return alias[ext] || ext
  }

  const buildFenceInfo = (lang: string, meta?: string) => {
    const normalizedMeta = meta?.trim()
    return normalizedMeta ? `${lang} ${normalizedMeta}` : lang
  }

  const renderHighlightedCode = (code: string, lang: string, meta?: string) => {
    if (!code)
      return ''
    try {
      const info = buildFenceInfo(lang, meta)
      const fencedCode = `\`\`\`${info}\n${code}\n\`\`\``
      return md.render(fencedCode)
    }
    catch (_error) {
      return ''
    }
  }

  const collectHighlightedCode = (
    type: 'vue' | 'react' | 'html',
    absPath: string,
  ) => {
    if (!absPath)
      return
    highlightedCode[type] = renderHighlightedCode(readSource(absPath, type), resolveLangByFile(absPath), metaByType[type])
  }

  const inputFiles = definition.files

  for (const key of Object.keys(inputFiles) as Array<'vue' | 'react' | 'html'>) {
    const value = inputFiles[key]
    if (!value)
      continue
    if (Array.isArray(value)) {
      value.forEach((file) => {
        const fileName = path.basename(file)
        files[key][fileName] = {
          filename: file,
          code: '',
        }
      })
    }
    else if (isPlainObject(value)) {
      for (const file in value) {
        files[key][file] = {
          filename: value[file],
          code: '',
        }
      }
    }
    for (const file in files[key]) {
      const filePath = files[key][file].filename
      const absPath = path.resolve(dirPath, filePath).replace(/\\/g, '/')
      const code = readSource(absPath, `${key}Files`)
      files[key][file].code = code
      const highlighted = renderHighlightedCode(code, resolveLangByFile(filePath), metaByType[key])
      files[key][file].html = highlighted
      const domKey = isTwoslashMeta(metaByType[key]) ? '' : registerHighlightDom(key, highlighted, file)
      if (domKey)
        files[key][file].htmlDomKey = domKey
    }
  }

  // 国际化
  let locale = ''
  if (isPlainObject(configLocale)) {
    locale = encodeURIComponent(JSON.stringify(configLocale))
  }

  if (componentVuePath) {
    collectHighlightedCode('vue', componentVuePath)
    if (!isTwoslashMeta(metaByType.vue))
      registerHighlightDom('vue', highlightedCode.vue)
  }
  if (componentReactPath) {
    collectHighlightedCode('react', componentReactPath)
    if (!isTwoslashMeta(metaByType.react))
      registerHighlightDom('react', highlightedCode.react)
  }
  if (componentHtmlPath) {
    collectHighlightedCode('html', componentHtmlPath)
    if (!isTwoslashMeta(metaByType.html))
      registerHighlightDom('html', highlightedCode.html)
  }

  const useSlotByType = {
    vue: !Object.keys(files.vue).length && isTwoslashMeta(metaByType.vue) && !!highlightedCode.vue,
    react: !Object.keys(files.react).length && isTwoslashMeta(metaByType.react) && !!highlightedCode.react,
    html: !Object.keys(files.html).length && isTwoslashMeta(metaByType.html) && !!highlightedCode.html,
  }

  const codeSlotTemplates = [
    useSlotByType.vue ? `<template #code-vue>${highlightedCode.vue}</template>` : '',
    useSlotByType.react ? `<template #code-react>${highlightedCode.react}</template>` : '',
    useSlotByType.html ? `<template #code-html>${highlightedCode.html}</template>` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const encodedCodeHighlights = encodeURIComponent(
    JSON.stringify(highlightedCode),
  )
  const encodedInlineHighlightDomKeys = encodeURIComponent(
    JSON.stringify(inlineHighlightDomKeys),
  )

  const hiddenHighlightBlocks = highlightDomSnippets.join('\n')
  const placeholderBlock = placeholderVisibleKey
    ? `<${placeholderName} v-show="${placeholderVisibleKey}" />`
    : ''
  const clientOnlyOpen = ssgAttr ? '' : '<ClientOnly>'
  const clientOnlyClose = ssgAttr ? '' : '</ClientOnly>'
  const wrapperVisibilityAttr = placeholderVisibleKey
    ? `\n      v-show="!${placeholderVisibleKey}"`
    : ''
  const mountHandlerAttr = placeholderVisibleKey
    ? `\n      @mount="() => { ${placeholderVisibleKey} = false; }"`
    : ''
  const vueMountedAttr = placeholderVisibleKey
    ? ` @vue:mounted="() => { ${placeholderVisibleKey} = false; }"`
    : ''

  const sourceCode = `
  ${hiddenHighlightBlocks}
  ${placeholderBlock}
  ${clientOnlyOpen}
    <${wrapperName}
      ${wrapperVisibilityAttr}
      v-bind="${escapeAttributeValue(JSON.stringify(restProps))}"
      stackblitz="${encodeURIComponent(JSON.stringify(stackblitz))}"
      codesandbox="${encodeURIComponent(JSON.stringify(codesandbox))}"
      files="${encodeURIComponent(JSON.stringify(files))}"
      codeHighlights="${encodedCodeHighlights}"
      codeHighlightDomKeys="${encodedInlineHighlightDomKeys}"
      locale="${locale}"${mountHandlerAttr}
      ${
        componentHtmlPath
          ? `
            :htmlCode="${htmlCodeTempVariable}"
            `
          : ''
      }
      ${
        componentVuePath
          ? `
            :vueCode="${vueCodeTempVariable}"
            `
          : ''
      }
      ${
        componentReactPath
          ? `
            :reactCode="${reactCodeTempVariable}"
            :reactComponent="${reactComponentName}"
            :reactCreateRoot="reactCreateRoot"
            :reactCreateElement="reactCreateElement"
            :reactUseLayoutEffect="reactUseLayoutEffect"
            `
          : ''
      }
      >
      ${
        componentVuePath
          ? `
            <template v-if="${componentName}" #vue>
              <${componentName}${vueMountedAttr}></${componentName}>
            </template>
            `
          : ''
      }
      ${codeSlotTemplates}
    </${wrapperName}>
  ${clientOnlyClose}`.trim()

  return sourceCode
}
