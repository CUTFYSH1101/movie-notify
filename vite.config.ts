import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  // 相對路徑，部署到 GitHub Pages 的 /<repo>/ 子路徑也能載入
  // base 是 Vite 的設定，意思是「網站部署在網域底下的哪個路徑」。
  // Vite build 時會把它加在所有資源路徑的前面
  base: './',
  plugins: [vue(), ui({ router: true })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
    }
  },
})
