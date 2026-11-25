import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: 'apps/web',
  build: { outDir: '../../dist', emptyOutDir: true },
  test: { root: projectRoot, include: ['tests/**/*.test.{ts,tsx}'] }
})
