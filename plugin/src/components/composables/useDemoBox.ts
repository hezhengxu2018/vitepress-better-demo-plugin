import type { Platform } from '../../markdown/preview'
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue'
import { ComponentType } from '../../constant/type'
import { initI18nData, observeI18n, unobserveI18n } from '../../locales/i18n'
import { useCodeCopy } from '../utils/copy'
import { useCodeFold } from '../utils/fold'
import { genHtmlCode } from '../utils/template'

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

interface UseDemoBoxOptions {
  onCopySuccess?: () => void
}

export function useDemoBox(
  props: VitepressDemoBoxProps,
  emit: (event: 'mount') => void,
  options: UseDemoBoxOptions = {},
) {
  const stackblitz = computed<Platform>(() => {
    return JSON.parse(decodeURIComponent(props.stackblitz || '{}'))
  })
  const codesandbox = computed<Platform>(() => {
    return JSON.parse(decodeURIComponent(props.codesandbox || '{}'))
  })
  const codeplayer = computed<Platform>(() => {
    return JSON.parse(decodeURIComponent(props.codeplayer || '{}'))
  })

  const parsedFiles = computed<
    Record<string, Record<string, { code: string, filename: string, html?: string }>>
  >(() => {
    try {
      return JSON.parse(decodeURIComponent(props.files || '{}'))
    }
    catch (error) {
      console.error(error)
      return {}
    }
  })

  const activeFile = ref<string>('')
  const type = ref<ComponentType>(ComponentType.VUE)

  const currentFiles = computed<
    Record<string, { code: string, filename: string, html?: string }>
  >(() => {
    const result = parsedFiles.value?.[type.value] || {}
    if (Object.keys(result).length && !result[activeFile.value]) {
      activeFile.value = Object.keys(result)?.[0] || ''
    }
    else if (!Object.keys(result).length) {
      activeFile.value = ''
    }
    return result
  })

  const tabOrders = computed(() => {
    return props.order.split(',').map((item: string) => item.trim())
  })

  const { isCodeFold, setCodeFold } = useCodeFold()
  const { clickCopy } = useCodeCopy()

  const currentCode = computed(() => {
    if (currentFiles.value && currentFiles.value[activeFile.value]) {
      return currentFiles.value[activeFile.value].code
    }
    return props[`${type.value}Code` as keyof VitepressDemoBoxProps]
  })

  const displayCode = ref('')

  const tabs = computed<ComponentType[]>(() => {
    const files = parsedFiles.value || {}
    return [ComponentType.VUE, ComponentType.REACT, ComponentType.HTML]
      .filter((item) => {
        const hasInlineCode = !!props[`${item}Code` as keyof VitepressDemoBoxProps]
        const hasExtraFiles = Object.keys(files[item] || {}).length > 0
        return hasInlineCode || hasExtraFiles
      })
      .sort((a: string, b: string) => {
        return tabOrders.value.indexOf(a) - tabOrders.value.indexOf(b)
      })
  })

  const openGithub = () => {
    window.open(props.github, '_blank')
  }

  const openGitlab = () => {
    window.open(props.gitlab, '_blank')
  }

  watch(
    () => (type as any).value,
    (val: any) => {
      if (!val) {
        return
      }

      if (val === 'html') {
        setHTMLWithScript()
      }
      else if (val === 'react') {
        renderReactComponent()
      }
    },
    {
      immediate: true,
    },
  )

  const clickCodeCopy = () => {
    clickCopy(currentCode.value || '')
    options.onCopySuccess?.()
  }

  const htmlContainerRef = ref<HTMLElement | null>(null)
  let iframeObserver: (() => void) | null = null
  function setHTMLWithScript() {
    nextTick(() => {
      if (!htmlContainerRef.value || !props.htmlCode) {
        return
      }
      const iframe = htmlContainerRef.value.querySelector(
        'iframe',
      ) as HTMLIFrameElement | null
      if (!iframe) {
        return
      }
      const styles = document.head.querySelectorAll('style')
      const styleLinks = document.head.querySelectorAll('link[as="style"]')
      const fontLinks = document.head.querySelectorAll('link[as="font"]')
      const styleString = Array.from(styles)
        .map(style => `<style replace="true">${style.textContent}</style>`)
        .join('\n')
      const styleLinkString = Array.from(styleLinks)
        .map(link => link.outerHTML)
        .join('\n')
      const fontLinkString = Array.from(fontLinks)
        .map(link => link.outerHTML)
        .join('\n')
      let iframeDocument
        = iframe.contentDocument || iframe.contentWindow?.document
      if (
        typeof iframeDocument?.write === 'function'
        && props.htmlWriteWay === 'write'
      ) {
        iframeDocument.open()
        iframeDocument.write(
          genHtmlCode({
            code: props.htmlCode || '',
            styles: styleString,
            links: `${styleLinkString}\n${fontLinkString}`,
          }),
        )
        iframeDocument.close()
      }
      else {
        iframe.srcdoc = genHtmlCode({
          code: props.htmlCode || '',
          styles: styleString,
          links: `${styleLinkString}\n${fontLinkString}`,
        })
        iframe.onload = () => {
          iframeDocument
            = iframe.contentDocument || iframe.contentWindow?.document
        }
      }

      const originObserver = (iframeObserver = function loop() {
        requestAnimationFrame(() => {
          if (!iframeDocument) {
            return
          }
          const height = `${iframeDocument.documentElement.offsetHeight}px`
          iframe.style.height = height
          if (htmlContainerRef.value) {
            htmlContainerRef.value.style.height = height
          }
          if (iframeDocument.documentElement) {
            iframeDocument.documentElement.className
              = document.documentElement.className
          }
          if (originObserver === iframeObserver) {
            iframeObserver?.()
          }
        })
      })
      iframeObserver?.()
    })
  }

  const reactContainerRef = ref<HTMLElement | null>(null)
  let root: any = null
  function renderReactComponent() {
    nextTick(() => {
      if (props.reactComponent && type.value === 'react' && props.reactCode) {
        if (!root) {
          root = props.reactCreateRoot(reactContainerRef.value)
        }
        root.render(props.reactCreateElement(props.reactComponent, {}, null))
      }
    })
  }

  watch(
    () => [reactContainerRef.value, props.reactComponent],
    () => {
      if (reactContainerRef.value) {
        renderReactComponent()
      }
      else if (root) {
        root.unmount()
        root = null
      }
    },
    { immediate: true, deep: true },
  )

  watch(
    () => props.reactCode,
    (val?: string, prevVal?: string) => {
      if (val && val !== prevVal && root) {
        root.render(props.reactCreateElement(props.reactComponent, {}, null))
      }
    },
    { immediate: true, deep: true },
  )

  watch(
    () => props.select,
    (val?: ComponentType) => {
      if (val && props[`${val}Code` as keyof VitepressDemoBoxProps]) {
        type.value = val
      }
    },
    {
      immediate: true,
    },
  )

  watch(
    () => tabs.value,
    () => {
      if (!props[`${type.value}Code` as keyof VitepressDemoBoxProps]) {
        type.value = tabs.value[0]
      }
    },
    { immediate: true, deep: true },
  )

  const sourceRef = ref<HTMLElement | null>(null)
  const sourceContentRef = ref<HTMLElement | null>(null)

  function initI18n(locale?: string) {
    if (locale) {
      try {
        initI18nData(JSON.parse(decodeURIComponent(locale)))
      }
      catch (error) {
        console.error(error)
      }
    }
  }

  onMounted(() => {
    emit('mount')
    initI18n(props.locale)
    observeI18n()
  })

  onUnmounted(() => {
    unobserveI18n()
    if (root) {
      root.unmount()
      root = null
    }
    iframeObserver = null
  })

  return {
    stackblitz,
    codesandbox,
    codeplayer,
    activeFile,
    currentFiles,
    tabOrders,
    type,
    tabs,
    isCodeFold,
    setCodeFold,
    currentCode,
    displayCode,
    openGithub,
    openGitlab,
    clickCodeCopy,
    htmlContainerRef,
    reactContainerRef,
    sourceRef,
    sourceContentRef,
  }
}
