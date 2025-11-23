import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: {
    outDir: 'dist/markdown',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/markdown/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue', 'vitepress', /^vitepress\/.*/, 'node:fs', 'node:path'],
      output: {
        exports: 'named',
      },
    },
  },
})
