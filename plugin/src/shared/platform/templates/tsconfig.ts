import type { ComponentType } from '@/types'
import { COMPONENT_TYPE } from '@/shared/constant'

export function genTsConfig(type?: ComponentType): string {
  const additions: Record<string, any> = {}
  if (type === COMPONENT_TYPE.REACT) {
    additions.jsx = 'react'
  }
  const content = JSON.stringify(
    {
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        esModuleInterop: true,
        allowImportingTsExtensions: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        module: 'esnext',
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        ...additions,
      },
      include: ['src'],
    },
    null,
    2,
  )
  return content
}
