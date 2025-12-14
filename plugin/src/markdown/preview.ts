import type Token from 'markdown-it/lib/token'
import type { MarkdownRenderer } from 'vitepress'
import type { CodeFiles, VitepressDemoBoxConfig } from '@/types'
import fs from 'node:fs'
import path from 'node:path'
import {
  applyPlatformValue,
  composeComponentName,
  injectComponentImportScript,
  isPlainObject,
  parseDemoAttributes,
  parseFilesAttribute,
} from './utils'

/**
 * 编译预览组件
 * @param md
 * @param token
 * @param mdFile
 * @param config
 * @return string
 */
export function transformPreview(md: MarkdownRenderer, token: Token, mdFile: any, config?: VitepressDemoBoxConfig) {
  const demoIndexKey = '__vp_demo_index__'
  const demoIndex = (mdFile[demoIndexKey] = (mdFile[demoIndexKey] || 0) + 1)
  const {
    demoDir,
    stackblitz = { show: false },
    codesandbox = { show: false },
    wrapperComponentName = 'vitepress-demo-box',
    placeholderComponentName = 'vitepress-demo-placeholder',
    autoImportWrapper = true,
  } = config || {}

  const attributes = parseDemoAttributes(token.content)
  const {
    vue: vuePathValue,
    html: htmlPathValue,
    react: reactPathValue,
    stackblitz: stackblitzAttr,
    codesandbox: codesandboxAttr,
    vueFiles: vueFilesAttr,
    reactFiles: reactFilesAttr,
    htmlFiles: htmlFilesAttr,
    wrapperComponentName: wrapperComponentNameValue,
    placeholderComponentName: placeholderComponentNameValue,
    ssg: ssgValue,
    ...restProps
  } = attributes

  const wrapperName = wrapperComponentNameValue || wrapperComponentName
  const placeholderName = placeholderComponentNameValue || placeholderComponentName
  const mdFilePath = mdFile.realPath ?? mdFile.path
  const dirPath = demoDir || path.dirname(mdFilePath)

  applyPlatformValue(stackblitz, stackblitzAttr)
  applyPlatformValue(codesandbox, codesandboxAttr)

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

  const componentName = composeComponentName(absolutePath)
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
      ssgValue ? undefined : 'dynamicImport',
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
      'dynamicImport',
    )
  }

  const placeholderVisibleKey = `__placeholder_visible_${componentName}_${demoIndex}__`

  // 控制 placeholder 的显示
  injectComponentImportScript(
    mdFile,
    placeholderVisibleKey,
    `const ${placeholderVisibleKey} = ref(true);`,
    'inject',
  )

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
    vue: {} as Record<string, { code: string, filename: string, html?: string }>,
    react: {} as Record<string, { code: string, filename: string, html?: string }>,
    html: {} as Record<string, { code: string, filename: string, html?: string }>,
  }

  const highlightedCode: Record<'vue' | 'react' | 'html', string> = {
    vue: '',
    react: '',
    html: '',
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

  const renderHighlightedCode = (code: string, lang: string) => {
    if (!code)
      return ''
    try {
      const fencedCode = `\`\`\` ${lang}\n${code}\n\`\`\``
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
    try {
      if (!fs.existsSync(absPath))
        return
      let source = ''
      try {
        source = fs.readFileSync(absPath, 'utf-8')
      }
      catch (_e) {
        source = ''
      }
      if (!source) {
        highlightedCode[type] = ''
        return
      }
      highlightedCode[type] = renderHighlightedCode(
        source,
        resolveLangByFile(absPath),
      )
    }
    catch (_error) {
      highlightedCode[type] = ''
    }
  }

  const inputFiles: Record<'vue' | 'react' | 'html', CodeFiles | undefined> = {
    vue: parseFilesAttribute(vueFilesAttr),
    react: parseFilesAttribute(reactFilesAttr),
    html: parseFilesAttribute(htmlFilesAttr),
  }

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
      if (filePath) {
        const absPath = path
          .resolve(demoDir || path.dirname(mdFilePath), filePath || '.')
          .replace(/\\/g, '/')
        if (fs.existsSync(absPath)) {
          let code = ''
          try {
            code = fs.readFileSync(absPath, 'utf-8')
          }
          catch (_e) {
            code = ''
          }
          if (!code) {
            delete files[key][file]
          }
          else {
            files[key][file].code = code
            files[key][file].html = renderHighlightedCode(
              code,
              resolveLangByFile(filePath),
            )
          }
        }
        else {
          delete files[key][file]
        }
      }
      else {
        delete files[key][file]
      }
    }
  }

  // 国际化
  let locale = ''
  if (isPlainObject(config?.locale)) {
    locale = encodeURIComponent(JSON.stringify(config.locale))
  }

  if (componentVuePath) {
    collectHighlightedCode('vue', componentVuePath)
  }
  if (componentReactPath) {
    collectHighlightedCode('react', componentReactPath)
  }
  if (componentHtmlPath) {
    collectHighlightedCode('html', componentHtmlPath)
  }

  const encodedCodeHighlights = encodeURIComponent(
    JSON.stringify(highlightedCode),
  )

  const sourceCode = `
  ${
    ssgValue
      ? ''
      : `<${placeholderName} v-show="${placeholderVisibleKey}" />`
  }
  ${ssgValue ? '' : '<ClientOnly>'}
    <${wrapperName}
      v-show="!${placeholderVisibleKey}"
      v-bind='${JSON.stringify(restProps)}'
      stackblitz="${encodeURIComponent(JSON.stringify(stackblitz))}"
      codesandbox="${encodeURIComponent(JSON.stringify(codesandbox))}"
      files="${encodeURIComponent(JSON.stringify(files))}"
      codeHighlights="${encodedCodeHighlights}"
      locale="${locale}"
      @mount="() => { ${placeholderVisibleKey} = false; }"
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
              <${componentName} @vue:mounted="() => { ${placeholderVisibleKey} = false; }"></${componentName}>
            </template>
            `
          : ''
      }
    </${wrapperName}>
  ${ssgValue ? '' : '</ClientOnly>'}`.trim()

  return sourceCode
}
