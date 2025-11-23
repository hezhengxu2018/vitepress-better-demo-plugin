import type { PlatformParams } from '@/types'
import { getParameters } from 'codesandbox/lib/api/define'
import { COMPONENT_TYPE, PLATFORM_TYPE } from '@/shared/constant'
import {
  genHtmlTemplate,
  genMainTs,
  genPackageJson,
  genTsConfig,
} from '../templates'

export function getReactCodeSandboxParams(params: PlatformParams) {
  const { code } = params
  return (getParameters as any)({
    files: {
      'package.json': {
        content: genPackageJson({
          type: COMPONENT_TYPE.REACT,
          platform: PLATFORM_TYPE.CODESANDBOX,
          code,
        }),
      },
      'tsconfig.json': {
        content: genTsConfig(COMPONENT_TYPE.REACT),
      },
      'index.html': {
        content: genHtmlTemplate(),
      },
      'src/main.tsx': {
        content: genMainTs(COMPONENT_TYPE.REACT),
      },
      'src/Demo.tsx': {
        content: code,
      },
      ...params.customFiles,
    },
  })
}
