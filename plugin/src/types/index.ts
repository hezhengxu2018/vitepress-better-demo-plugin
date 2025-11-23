import type { COMPONENT_TYPE, PLATFORM_TYPE } from '@/shared/constant'

export interface LocaleText {
  openInStackblitz: string
  openInCodeSandbox: string
  openInGithub: string
  openInGitlab: string
  collapseCode: string
  expandCode: string
  copyCode: string
  copySuccess: string
}

export interface Locale {
  [key: string]: 'zh-CN' | 'en-US' | LocaleText
}

export interface PlatformTemplate {
  scope: 'global' | 'vue' | 'react' | 'html' | string
  files: Record<string, string>
}
export type PlatformType = (typeof PLATFORM_TYPE)[keyof typeof PLATFORM_TYPE]

export type ComponentType = (typeof COMPONENT_TYPE)[keyof typeof COMPONENT_TYPE]

export interface PlatformParams {
  title?: string
  description?: string
  code: string
  type?: ComponentType
  platform?: PlatformType
  templates?: PlatformTemplate[]
  scope?: string
  customFiles?: Record<string, string> | Record<string, { content: string }>
}

export interface VitepressDemoBoxProps {
  title?: string
  description?: string
  reactComponent?: any
  vueCode?: string
  reactCode?: string
  htmlCode?: string
  order: string
  visible?: boolean
  select?: ComponentType
  github?: string
  gitlab?: string
  reactCreateElement?: any
  reactCreateRoot?: any
  stackblitz?: string
  codesandbox?: string
  codeplayer?: string
  scope?: string
  files: string
  codeHighlights?: string
  lightTheme?: string
  darkTheme?: string
  theme?: string
  locale?: string
  htmlWriteWay?: 'write' | 'srcdoc'
  background?: string
}

export interface DefaultProps {
  title?: string
  description?: string
  vue?: string
  html?: string
  react?: string
}

export interface TabConfig {
  /**
   * @cn 代码切换 tab 的展示顺序
   * @en The order of the code switch tab
   */
  order?: string
  /**
   * @cn 是否显示 tab
   * @en Whether to show the tab
   */
  visible?: boolean
  /**
   * @cn 默认选中的 tab
   * @en The default selected tab
   */
  select?: string
}

export type Files = Record<
  string,
  { code: string, filename: string, html?: string }
>

export interface Platform {
  show: boolean
  templates?: PlatformTemplate[]
}

export type CodeFiles = string[] | Record<string, string>

export interface VitepressDemoBoxConfig {
  /**
   * @cn demo所在目录
   * @en The directory of the demo
   */
  demoDir?: string
  /**
   * @cn 代码切换 tab 的配置
   * @en The configuration of the code switch tab
   */
  tab?: TabConfig
  /**
   * @cn stackblitz 平台配置
   * @en The configuration of the stackblitz platform
   */
  stackblitz?: Platform
  /**
   * @cn codesandbox 平台配置
   * @en The configuration of the codesandbox platform
   */
  codesandbox?: Platform
  /**
   * @cn codeplayer 平台配置
   * @en The configuration of the codeplayer platform
   */
  codeplayer?: Platform
  /**
   * @cn vue 展示的代码文件
   * @en The code files of the vue
   */
  vueFiles?: CodeFiles
  /**
   * @cn react 展示的代码文件
   * @en The code files of the react
   */
  reactFiles?: CodeFiles
  /**
   * @cn html 展示的代码文件
   * @en The code files of the html
   */
  htmlFiles?: CodeFiles
  /**
   * @cn 亮色模式主题，参考 https://shiki.style/themes#bundled-themes
   * @en The light theme, reference https://shiki.style/themes#bundled-themes
   */
  lightTheme?: string
  /**
   * @cn 暗色模式主题，参考 https://shiki.style/themes#bundled-themes
   * @en The dark theme, reference https://shiki.style/themes#bundled-themes
   */
  darkTheme?: string
  /**
   * @cn 亮色/暗色模式统一的主题(建议使用 lightTheme 和 darkTheme 分开)，参考 https://shiki.style/themes#bundled-themes
   * @en The light/dark theme, reference https://shiki.style/themes#bundled-themes
   */
  theme?: string
  /**
   * @cn 国际化配置 'zh-CN' | 'en-US'
   * @en The locale configuration 'zh-CN' | 'en-US'
   */
  locale?: Locale
  /**
   * @cn 是否自动导入默认的包裹组件，如关闭则需自行注册包裹组件
   * @en Whether to automatically import the default wrapper component. If closed, you need to register the wrapper component by yourself
   */
  autoImportWrapper?: boolean
  /**
   * @cn 自定义包裹组件的组件名称，需自行注册，仅在启用 isCustomWrapper 时有效
   * @en The custom component name of the preview component， need to be registered by yourself, only valid when isCustomWrapper is enabled
   */
  wrapperComponentName?: string
}
