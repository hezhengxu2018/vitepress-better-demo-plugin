import type { PlatformParams } from '@/types'
import stackblitz from '@stackblitz/sdk'
import { COMPONENT_TYPE, PLATFORM_TYPE } from '@/shared/constant'
import {
  genHtmlTemplate,
  genMainTs,
  genPackageJson,
  genStackblitzRc,
  genTsConfig,
  genViteConfig,
} from '../templates'

export function openReactStackblitz(params: PlatformParams) {
  const { code, title, description } = params

  stackblitz.openProject(
    {
      title: title!,
      description: description!,
      template: 'node',
      files: {
        'src/Demo.tsx': code,
        'src/main.tsx': genMainTs(COMPONENT_TYPE.REACT),
        'index.html': genHtmlTemplate({ src: '/src/main.tsx' }),
        'package.json': genPackageJson({
          type: COMPONENT_TYPE.REACT,
          platform: PLATFORM_TYPE.STACKBLITZ,
          code,
        }),
        'vite.config.js': genViteConfig(COMPONENT_TYPE.REACT),
        '.stackblitzrc': genStackblitzRc(),
        'tsconfig.json': genTsConfig(COMPONENT_TYPE.REACT),
        ...params.customFiles,
      },
    },
    {
      openFile: 'src/Demo.tsx',
    },
  )
}
