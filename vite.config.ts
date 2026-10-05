import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { API_PORT } from './shared/paths.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), ui({ router: true })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
    }
  },
  server: {
    proxy: {
      '/api': `http://localhost:${API_PORT}`,
    },
  },
})
