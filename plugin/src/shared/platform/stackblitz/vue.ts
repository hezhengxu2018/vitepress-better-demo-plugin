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

export function openVueStackblitz(params: PlatformParams) {
  const { code, title, description } = params

  stackblitz.openProject(
    {
      title: title!,
      description: description!,
      template: 'node',
      files: {
        'src/Demo.vue': code,
        'src/main.ts': genMainTs(COMPONENT_TYPE.VUE),
        'index.html': genHtmlTemplate({ src: '/src/main.ts' }),
        'package.json': genPackageJson({
          type: COMPONENT_TYPE.VUE,
          platform: PLATFORM_TYPE.STACKBLITZ,
          code,
        }),
        'vite.config.js': genViteConfig(COMPONENT_TYPE.VUE),
        '.stackblitzrc': genStackblitzRc(),
        'tsconfig.json': genTsConfig(COMPONENT_TYPE.VUE),
        ...params.customFiles,
      },
    },
    {
      openFile: 'src/Demo.vue',
    },
  )
}
