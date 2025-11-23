import type { PlatformParams } from '@/types'
import { COMPONENT_TYPE } from '@/shared/constant'
import { getHtmlCodeSandboxParams } from './html'
import { getReactCodeSandboxParams } from './react'
import { getVueCodeSandboxParams } from './vue'

export function getCodeSandboxParams(params: PlatformParams) {
  const globalFiles = (params.templates || []).find(
    item => item.scope === 'global',
  )?.files
  const typeFiles = (params.templates || []).find(
    item => item.scope === params.type,
  )?.files
  const scopeFiles = (params.templates || []).find(
    item => item.scope === params.scope,
  )?.files
  params.customFiles = {
    ...globalFiles,
    ...typeFiles,
    ...scopeFiles,
  }
  for (const file in params.customFiles) {
    (params.customFiles[file] as unknown as { content: string }) = {
      content: (params.customFiles[file] as string) || '',
    }
  }

  if (params.type === COMPONENT_TYPE.VUE) {
    return getVueCodeSandboxParams(params)
  }
  if (params.type === COMPONENT_TYPE.REACT) {
    return getReactCodeSandboxParams(params)
  }
  if (params.type === COMPONENT_TYPE.HTML) {
    return getHtmlCodeSandboxParams(params)
  }
}
