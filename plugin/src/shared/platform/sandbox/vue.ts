import type { PlatformParams } from '@/types'
import { getParameters } from 'codesandbox/lib/api/define'
import { COMPONENT_TYPE, PLATFORM_TYPE } from '@/shared/constant'
import {
  genHtmlTemplate,
  genMainTs,
  genPackageJson,
  genTsConfig,
} from '../templates'

export function getVueCodeSandboxParams(params: PlatformParams) {
  const { code } = params
  return (getParameters as any)({
    files: {
      'package.json': {
        content: genPackageJson({
          type: COMPONENT_TYPE.VUE,
          platform: PLATFORM_TYPE.CODESANDBOX,
          code,
        }),
      },
      'tsconfig.json': {
        content: genTsConfig(COMPONENT_TYPE.VUE),
      },
      'index.html': {
        content: genHtmlTemplate(),
      },
      'src/main.ts': {
        content: genMainTs(COMPONENT_TYPE.VUE),
      },
      'src/Demo.vue': {
        content: code,
      },
      ...params.customFiles,
    },
  })
}
