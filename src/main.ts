import { createApp } from 'vue'
import './style.scss'
import './forImport.css'
import App from './App.vue'
import ui from '@nuxt/ui/vue-plugin'
import { loadTracks } from '@/js/state/tracks.ts'
import './js/state/title.ts'

createApp(App).use(ui).mount('#app')

// 啟動後載入這位訂閱者已追蹤的電影（失敗不影響頁面）
loadTracks()
