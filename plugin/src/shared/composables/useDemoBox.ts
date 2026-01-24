import type { ComponentType, Platform, VitepressDemoBoxProps } from '@/types'
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue'
import { COMPONENT_TYPE } from '@/shared/constant'
import { initI18nData, observeI18n, unobserveI18n } from '../locales/i18n'
import { useCodeCopy } from '../utils/copy'
import { useCodeFold } from '../utils/fold'
import { genHtmlCode } from '../utils/template'

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

  const parsedFiles = computed<
    Record<string, Record<string, { code: string, filename: string, html?: string, htmlDomKey?: string }>>
  >(() => {
    try {
      return JSON.parse(decodeURIComponent(props.files || '{}'))
    }
    catch (error) {
      console.error(error)
      return {}
    }
  })

  const parsedInlineHighlightDomKeys = computed<
    Partial<Record<ComponentType, string>>
  >(() => {
    if (!props.codeHighlightDomKeys) {
      return {}
    }
    try {
      return JSON.parse(decodeURIComponent(props.codeHighlightDomKeys))
    }
    catch (error) {
      console.error(error)
      return {}
    }
  })

  const inlineDomHighlightHtml = ref<Partial<Record<ComponentType, string>>>({})
  const fileDomHighlightHtml = ref<Record<ComponentType, Record<string, string>>>({
    vue: {},
    react: {},
    html: {},
  })

  const activeFile = ref<string>('')
  const type = ref<ComponentType>(COMPONENT_TYPE.VUE)

  const currentFiles = computed<
    Record<string, { code: string, filename: string, html?: string, htmlDomKey?: string }>
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

  const { isCodeFold, setCodeFold } = useCodeFold(props.codeFold)
  const { clickCopy } = useCodeCopy()

  const currentCode = computed(() => {
    if (currentFiles.value && currentFiles.value[activeFile.value]) {
      return currentFiles.value[activeFile.value].code
    }
    return props[`${type.value}Code` as keyof VitepressDemoBoxProps]
  })

  const parsedCodeHighlights = computed<Record<string, string>>(() => {
    if (!props.codeHighlights) {
      return {}
    }
    try {
      return JSON.parse(decodeURIComponent(props.codeHighlights))
    }
    catch (error) {
      console.error(error)
      return {}
    }
  })

  const currentCodeHtml = computed(() => {
    if (currentFiles.value && currentFiles.value[activeFile.value]) {
      return (
        currentFiles.value[activeFile.value].html
        || fileDomHighlightHtml.value?.[type.value]?.[activeFile.value]
        || ''
      )
    }
    return (
      inlineDomHighlightHtml.value[type.value]
      || parsedCodeHighlights.value?.[type.value]
      || ''
    )
  })

  const tabs = computed<ComponentType[]>(() => {
    const files = parsedFiles.value || {}
    return [COMPONENT_TYPE.VUE, COMPONENT_TYPE.REACT, COMPONENT_TYPE.HTML]
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

  const readDomHtmlById = (id?: string) => {
    if (typeof window === 'undefined' || !id) {
      return ''
    }
    const el = document.getElementById(id)
    if (!el) {
      return ''
    }
    const html = el.innerHTML
    el.remove()
    return html
  }

  const syncDomHighlights = () => {
    if (typeof window === 'undefined') {
      return
    }
    nextTick(() => {
      const inlineKeys = parsedInlineHighlightDomKeys.value || {}
      const inlineResult: Partial<Record<ComponentType, string>> = {
        ...inlineDomHighlightHtml.value,
      }
      ;(Object.keys(inlineKeys) as ComponentType[]).forEach((lang) => {
        if (inlineResult[lang]) {
          return
        }
        const html = readDomHtmlById(inlineKeys[lang])
        if (html) {
          inlineResult[lang] = html
        }
      })
      inlineDomHighlightHtml.value = inlineResult

      const fileResult: Record<ComponentType, Record<string, string>> = {
        vue: { ...(fileDomHighlightHtml.value.vue || {}) },
        react: { ...(fileDomHighlightHtml.value.react || {}) },
        html: { ...(fileDomHighlightHtml.value.html || {}) },
      }
      const files = parsedFiles.value || {}
      ;(Object.keys(files) as ComponentType[]).forEach((lang) => {
        const entries = files[lang] || {}
        Object.keys(entries).forEach((filename) => {
          if (fileResult[lang]?.[filename]) {
            return
          }
          const domKey = entries[filename]?.htmlDomKey
          if (!domKey) {
            return
          }
          const html = readDomHtmlById(domKey)
          if (!html) {
            return
          }
          if (!fileResult[lang]) {
            fileResult[lang] = {}
          }
          fileResult[lang][filename] = html
        })
      })
      fileDomHighlightHtml.value = fileResult
    })
  }

  watch(
    () => props.codeHighlightDomKeys,
    () => {
      syncDomHighlights()
    },
    { flush: 'post' },
  )

  watch(
    () => props.files,
    () => {
      syncDomHighlights()
    },
    { flush: 'post' },
  )

  const dispatchTwoslashRecompute = () => {
    if (typeof window === 'undefined') {
      return
    }
    window.dispatchEvent(new Event('vitepress:codeGroupTabActivate'))
  }

  const scheduleTwoslashRecompute = () => {
    nextTick(() => {
      dispatchTwoslashRecompute()
    })
  }

  watch(
    type,
    () => {
      if (!isCodeFold.value)
        scheduleTwoslashRecompute()
    },
    { flush: 'post' },
  )

  watch(
    activeFile,
    () => {
      if (!isCodeFold.value)
        scheduleTwoslashRecompute()
    },
    { flush: 'post' },
  )

  watch(
    isCodeFold,
    (folded) => {
      if (!folded)
        scheduleTwoslashRecompute()
    },
    { flush: 'post' },
  )
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
      let htmlMounted = false
      const markHtmlMounted = () => {
        if (htmlMounted) {
          return
        }
        htmlMounted = true
        emit('mount')
      }
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
        markHtmlMounted()
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
          markHtmlMounted()
        }
      }

      const originObserver = (iframeObserver = function loop() {
        requestAnimationFrame(() => {
          if (!iframeDocument) {
            return
          }
          markHtmlMounted()
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

  interface ReactDemoBridgeProps {
    component: any
    reactCreateElement?: (...args: any[]) => any
    reactUseLayoutEffect?: (effect: () => void, deps?: any[]) => void
    onReady?: () => void
  }

  const ReactDemoBridge = (bridgeProps: ReactDemoBridgeProps) => {
    const {
      component,
      reactCreateElement,
      reactUseLayoutEffect,
      onReady,
    } = bridgeProps
    const notifyReady = () => {
      onReady?.()
    }
    if (reactUseLayoutEffect) {
      reactUseLayoutEffect(() => {
        notifyReady()
      }, [])
    }
    else {
      notifyReady()
    }
    return reactCreateElement
      ? reactCreateElement(component, {})
      : null
  }

  const reactContainerRef = ref<HTMLElement | null>(null)
  let root: any = null
  function renderReactComponent(): Promise<void> {
    return new Promise((resolve) => {
      nextTick(() => {
        if (
          !props.reactComponent
          || type.value !== COMPONENT_TYPE.REACT
          || !props.reactCode
          || !reactContainerRef.value
          || !props.reactCreateRoot
          || !props.reactCreateElement
        ) {
          resolve()
          return
        }
        if (!root) {
          root = props.reactCreateRoot(reactContainerRef.value)
        }
        let resolved = false
        const handleReady = () => {
          if (resolved) {
            return
          }
          resolved = true
          resolve()
          emit('mount')
        }
        try {
          root.render(
            props.reactCreateElement(ReactDemoBridge, {
              component: props.reactComponent,
              reactCreateElement: props.reactCreateElement,
              reactUseLayoutEffect: props.reactUseLayoutEffect,
              onReady: handleReady,
            }),
          )
        }
        catch (error) {
          console.error(error)
          resolve()
        }
      })
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
      if (val && val !== prevVal) {
        renderReactComponent()
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
    initI18n(props.locale)
    observeI18n()
    syncDomHighlights()
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
    activeFile,
    currentFiles,
    tabOrders,
    type,
    tabs,
    isCodeFold,
    setCodeFold,
    currentCode,
    currentCodeHtml,
    openGithub,
    openGitlab,
    clickCodeCopy,
    htmlContainerRef,
    reactContainerRef,
    sourceRef,
    sourceContentRef,
  }
}
