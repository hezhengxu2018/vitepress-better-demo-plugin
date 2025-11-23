import type { ComponentType } from '@/types'
import { COMPONENT_TYPE } from '@/shared/constant'

const vueViteConfig = `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
export default defineConfig({
  plugins: [vue(), vueJsx()],
});
`

const reactViteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
});
`

export function genViteConfig(type: ComponentType) {
  if (type === COMPONENT_TYPE.VUE) {
    return vueViteConfig
  }
  if (type === COMPONENT_TYPE.REACT) {
    return reactViteConfig
  }
  return ''
}
