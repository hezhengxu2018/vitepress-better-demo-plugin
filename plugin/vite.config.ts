import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { EP_NAMESPACE } from './src/constant/style-prefix'

const entries = {
  index: resolve(__dirname, 'src/index.ts'),
  theme: resolve(__dirname, 'src/theme.ts'),
}

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$epPrefix: '${EP_NAMESPACE}';`,
      },
    },
  },
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    emptyOutDir: true,
    lib: {
      entry: entries,
      formats: ['es'],
      fileName: (_format, entryName) => {
        if (entryName === 'theme')
          return 'theme/index.js'
        return `${entryName}.js`
      },
    },
    rollupOptions: {
      external: [
        'vue',
        'vitepress',
        /^vitepress\/.*/,
        'element-plus',
      ],
      output: {
        exports: 'named',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css'))
            return 'theme/[name][extname]'
          return '[name][extname]'
        },
      },
    },
  },
})
