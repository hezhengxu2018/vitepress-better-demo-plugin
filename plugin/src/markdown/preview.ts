import type Token from 'markdown-it/lib/token'
import type { MarkdownRenderer } from 'vitepress'
import type { DefaultProps, VitepressDemoBoxConfig } from '@/types'
import fs from 'node:fs'
import path from 'node:path'
import { composeComponentName, injectComponentImportScript } from './utils'

// 支持两种写法: key="value" 或 key value，使用单一命名捕获组 `value`（可能包含引号）
const titleRegex = /title(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const vuePathRegex = /vue(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const htmlPathRegex = /html(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const reactPathRegex = /react(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const descriptionRegex = /description(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const orderRegex = /order(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const selectRegex = /select(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const githubRegex = /github(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const gitlabRegex = /gitlab(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const stackblitzRegex = /stackblitz(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const codesandboxRegex = /codesandbox(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const codeplayerRegex = /codeplayer(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const scopeRegex = /scope(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const ssgRegex = /ssg(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const htmlWriteWayRegex = /htmlWriteWay(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const backgroundRegex = /background(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const wrapperComponentNameRegex = /wrapperComponentName(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const placeholderComponentNameRegex = /placeholderComponentName(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
// 保持 files 的正则组结构，仅允许 = 或 空格 分割；把整体值放到命名捕获组 value 中（包含两侧引号）
const vueFilesRegex = /vueFiles(?:=|\s+)(?<value>"(?:\{(?:.|\n)*?\}|\[(?:.|\n)*?\])")/
const reactFilesRegex = /reactFiles(?:=|\s+)(?<value>"(?:\{(?:.|\n)*?\}|\[(?:.|\n)*?\])")/
const htmlFilesRegex = /htmlFiles(?:=|\s+)(?<value>"(?:\{(?:.|\n)*?\}|\[(?:.|\n)*?\])")/

/**
 * 从内容中使用正则提取命名捕获组 `value` 的值并去除外层引号，支持默认值
 * @param content 待匹配的字符串
 * @param regex 包含命名捕获组 `value` 的正则
 * @param defaultValue 匹配不到时的默认值
 */
function extractValue(content: string, regex: RegExp, defaultValue = ''): string {
  const m = content.match(regex)
  const raw = m?.groups?.value ?? ''
  if (!raw)
    return defaultValue
  const first = raw[0]
  const last = raw[raw.length - 1]
  let val = raw
  if ((first === '"' && last === '"') || (first === '\'' && last === '\''))
    val = raw.slice(1, -1)
  return val || defaultValue
}

/**
 * 解析布尔型开关（例如 ssg），当匹配到且不为 'false' 时视为 true
 */
function extractFlag(content: string, regex: RegExp): boolean {
  const v = extractValue(content, regex)
  return v !== '' && v !== 'false'
}

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
    tab = {},
    stackblitz = { show: false },
    codesandbox = { show: false },
    codeplayer = { show: false },
    wrapperComponentName = 'vitepress-demo-box',
    placeholderComponentName = 'vitepress-demo-placeholder',
    autoImportWrapper = true,
  } = config || {}
  let {
    order = 'vue,react,html',
    visible = true,
    select = (tab.order || 'vue,react,html').split(',')[0] || 'vue',
  } = tab

  const componentProps: DefaultProps = {
    vue: '',
    title: '',
    description: '',
    html: '',
    react: '',
  }

  // 获取Props相关参数（先匹配再提取值，兼容 key="value" 与 key value）
  const titleValue = extractValue(token.content, titleRegex)
  const vuePathValue = extractValue(token.content, vuePathRegex)
  const htmlPathValue = extractValue(token.content, htmlPathRegex)
  const reactPathValue = extractValue(token.content, reactPathRegex)
  const descriptionValue = extractValue(token.content, descriptionRegex)
  const orderValue = extractValue(token.content, orderRegex)
  const selectValue = extractValue(token.content, selectRegex)
  const githubValue = extractValue(token.content, githubRegex)
  const gitlabValue = extractValue(token.content, gitlabRegex)
  const stackblitzValue = extractValue(token.content, stackblitzRegex)
  const codesandboxValue = extractValue(token.content, codesandboxRegex)
  const codeplayerValue = extractValue(token.content, codeplayerRegex)
  const vueFilesValue = extractValue(token.content, vueFilesRegex)
  const reactFilesValue = extractValue(token.content, reactFilesRegex)
  const htmlFilesValue = extractValue(token.content, htmlFilesRegex)
  const wrapperComponentNameValue = extractValue(token.content, wrapperComponentNameRegex)
  const placeholderComponentNameValue = extractValue(token.content, placeholderComponentNameRegex)
  const wrapperName = wrapperComponentNameValue || wrapperComponentName
  const placeholderName = placeholderComponentNameValue || placeholderComponentName
  const scopeValue = extractValue(token.content, scopeRegex) || ''
  const ssgValue = extractFlag(token.content, ssgRegex)
  const htmlWriteWayValue = extractValue(token.content, htmlWriteWayRegex, 'write')
  const backgroundValue = extractValue(token.content, backgroundRegex)
  const mdFilePath = mdFile.realPath ?? mdFile.path
  const dirPath = demoDir || path.dirname(mdFilePath)

  if (orderValue) {
    order = orderValue
  }
  if (selectValue) {
    select = selectValue
  }
  let github = ''
  let gitlab = ''
  if (githubValue) {
    github = githubValue
  }
  if (gitlabValue) {
    gitlab = gitlabValue
  }
  if (stackblitzValue) {
    stackblitz.show = stackblitzValue === 'true'
  }
  if (codesandboxValue) {
    codesandbox.show = codesandboxValue === 'true'
  }
  if (codeplayerValue) {
    codeplayer.show = codeplayerValue === 'true'
  }

  if (vuePathValue) {
    componentProps.vue = path
      .join(dirPath, vuePathValue)
      .replace(/\\/g, '/')
  }

  if (htmlPathValue) {
    componentProps.html = path
      .join(dirPath, htmlPathValue)
      .replace(/\\/g, '/')
  }
  if (reactPathValue) {
    componentProps.react = path
      .join(dirPath, reactPathValue)
      .replace(/\\/g, '/')
  }

  componentProps.title = titleValue || ''
  componentProps.description = descriptionValue || ''

  const componentVuePath = componentProps.vue
    ? path
        .resolve(
          demoDir || path.dirname(mdFilePath),
          vuePathValue || '.',
        )
        .replace(/\\/g, '/')
    : ''
  const componentHtmlPath = componentProps.html
    ? path
        .resolve(
          demoDir || path.dirname(mdFilePath),
          htmlPathValue || '.',
        )
        .replace(/\\/g, '/')
    : ''
  const componentReactPath = componentProps.react
    ? path
        .resolve(
          demoDir || path.dirname(mdFilePath),
          reactPathValue || '.',
        )
        .replace(/\\/g, '/')
    : ''

  // 组件名

  const absolutePath = path
    .resolve(
      dirPath,
      componentProps.vue || componentProps.react || componentProps.html || '.',
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
  if (componentProps.vue) {
    injectComponentImportScript(
      mdFile,
      componentVuePath,
      componentName,
      ssgValue ? undefined : 'dynamicImport',
    )
  }
  if (componentProps.react) {
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
  const htmlCodeTempVariable = componentProps.html
    ? `TempCodeHtml${componentName}`
    : `''`
  const reactCodeTempVariable = componentProps.react
    ? `TempCodeReact${componentName}`
    : `''`
  const vueCodeTempVariable = componentProps.vue
    ? `TempCodeVue${componentName}`
    : `''`
  if (componentProps.html) {
    injectComponentImportScript(
      mdFile,
      `${componentHtmlPath}?raw`,
      htmlCodeTempVariable,
    )
  }
  if (componentProps.react) {
    injectComponentImportScript(
      mdFile,
      `${componentReactPath}?raw`,
      reactCodeTempVariable,
    )
  }
  if (componentProps.vue) {
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

  const fallbackLangMap: Record<'vue' | 'react' | 'html', string> = {
    vue: 'vue',
    react: 'tsx',
    html: 'html',
  }

  const resolveLangByFile = (filePath: string, fallback: string) => {
    const ext = path.extname(filePath || '').replace('.', '').toLowerCase()
    if (!ext)
      return fallback
    const alias: Record<string, string> = {
      htm: 'html',
      mjs: 'js',
      cjs: 'js',
    }
    return alias[ext] || ext || fallback
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
        resolveLangByFile(absPath, fallbackLangMap[type]),
      )
    }
    catch (_error) {
      highlightedCode[type] = ''
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

  const inputFiles = {
    vue: formatString(vueFilesValue || ''),
    react: formatString(reactFilesValue || ''),
    html: formatString(htmlFilesValue || ''),
  }

  for (const key in inputFiles) {
    const value = inputFiles[key as keyof typeof inputFiles]
    if (value) {
      try {
        const codeFiles = JSON.parse(value)
        if (Array.isArray(codeFiles)) {
          (codeFiles as string[]).forEach((file) => {
            const fileName = path.basename(file)
            files[key as keyof typeof files][fileName] = {
              filename: file,
              code: '',
            }
          })
        }
        else if (typeof codeFiles === 'object') {
          for (const file in codeFiles) {
            files[key as keyof typeof files][file] = {
              filename: codeFiles[file],
              code: '',
            }
          }
        }
        for (const file in files[key as keyof typeof files]) {
          const filePath = files[key as keyof typeof files][file].filename
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
                delete files[key as keyof typeof files][file]
              }
              else {
                files[key as keyof typeof files][file].code = code
                files[key as keyof typeof files][file].html = renderHighlightedCode(
                  code,
                  resolveLangByFile(
                    filePath,
                    fallbackLangMap[key as keyof typeof fallbackLangMap],
                  ),
                )
              }
            }
            else {
              delete files[key as keyof typeof files][file]
            }
          }
          else {
            delete files[key as keyof typeof files][file]
          }
        }
      }
      catch (_error) {
        // 格式错误，则不展示该文件
      }
    }
  }

  // 国际化
  let locale = ''
  if (config?.locale && typeof config.locale === 'object') {
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
      title="${componentProps.title}"
      description="${componentProps.description}"
      locale="${locale}"
      select="${select}"
      order="${order}"
      github="${github}"
      gitlab="${gitlab}"
      theme="${config?.theme || ''}"
      lightTheme="${config?.lightTheme || ''}"
      darkTheme="${config?.darkTheme || ''}"
      stackblitz="${encodeURIComponent(JSON.stringify(stackblitz))}"
      codesandbox="${encodeURIComponent(JSON.stringify(codesandbox))}"
      codeplayer="${encodeURIComponent(JSON.stringify(codeplayer))}"
      files="${encodeURIComponent(JSON.stringify(files))}"
      codeHighlights="${encodedCodeHighlights}"
      scope="${scopeValue || ''}"
      htmlWriteWay="${htmlWriteWayValue}"
      background="${backgroundValue}"
      :visible="!!${visible}"
      @mount="() => { ${placeholderVisibleKey} = false; }"
      ${
        componentProps.html
          ? `
            :htmlCode="${htmlCodeTempVariable}"
            `
          : ''
      }
      ${
        componentProps.vue
          ? `
            :vueCode="${vueCodeTempVariable}"
            `
          : ''
      }
      ${
        componentProps.react
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
        componentProps.vue
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
