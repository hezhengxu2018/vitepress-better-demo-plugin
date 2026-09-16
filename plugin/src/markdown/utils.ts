import type { Platform, VitepressDemoBoxConfig } from '@/types'

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

export function isPlainObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

/* eslint-disable regexp/no-contradiction-with-assertion */
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
        ${componentName}.value = (await import(${JSON.stringify(path)})).default;
      });
      `.trim()
      : `
      onMounted(async () => {
        await import(${JSON.stringify(path)});
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
      ? `import ${componentName} from ${JSON.stringify(path)}`
      : `import ${JSON.stringify(path)}`
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
      oldScriptsSetup.content.includes(importCode)
    ) {
      scriptsCode[0].content = oldScriptsSetup.content
    }
    else {
      // MD文件中不存在组件 添加组件 import ${_componentName} from ${JSON.stringify(path)}\n
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
