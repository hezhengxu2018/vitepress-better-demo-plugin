import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { DEFAULT_NAMESPACE, EP_NAMESPACE } from './src/shared/constant/style-prefix'

const themes = ['element-plus']

const entries = {
  ...Object.fromEntries(
    themes.map(name => [name, resolve(__dirname, `src/theme/${name}/index.ts`)]),
  ),
}

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$defaultPrefix: '${DEFAULT_NAMESPACE}';$epPrefix: '${EP_NAMESPACE}';`,
      },
    },
  },
  plugins: [vue()],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: {
    outDir: 'dist/theme',
    emptyOutDir: true,
    lib: {
      entry: entries,
      formats: ['es'],
      // 入口 JS 路径按名字映射
      fileName: (_fmt, name) => `${name}/index.js`,
    },
    rollupOptions: {
      external: ['vue', 'vitepress', /^vitepress\/.*/, 'element-plus', 'node:fs', 'node:path'],
      output: {
        exports: 'named',
        assetFileNames: (asset) => {
          const name = asset.names[0] || ''
          for (const theme of themes) {
            if (name.includes(theme)) {
              return `${theme}/style[extname]`
            }
          }
          return `element-plus/style[extname]` // 默认+核心 CSS
        },
      },
    },
  },
})
