import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import dts from 'unplugin-dts/vite'
import { defineConfig } from 'vite'
import { libInjectCss } from 'vite-plugin-lib-inject-css'
import { DEFAULT_NAMESPACE, EP_NAMESPACE } from './src/shared/constant/style-prefix'

const themes = ['element-plus', 'default']

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
  plugins: [vue(), libInjectCss(), dts({ processor: 'vue', entryRoot: 'src', exclude: ['src/markdown/**'], bundleTypes: true, tsconfigPath: resolve(__dirname, 'tsconfig.json') })],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: {
    outDir: 'dist/theme',
    emptyOutDir: true,
    cssCodeSplit: true,
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
        assetFileNames: '[name]/style[extname]',
      },
    },
  },
})
