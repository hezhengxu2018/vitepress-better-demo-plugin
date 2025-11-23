import { resolve } from 'node:path'
import dts from 'unplugin-dts/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  plugins: [
    dts({
      entryRoot: 'src',
      exclude: ['src/theme/**'],
      bundleTypes: true,
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
    }),
  ],
  build: {
    outDir: 'dist/markdown',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
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
