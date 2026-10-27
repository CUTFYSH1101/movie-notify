import { watch } from 'vue'
import { activeTab } from '@/js/state/activeTab.ts'
import { theater } from '@/js/state/theaterPageDatasLifecycle.ts'

function switchTitle() {
  switch (activeTab.value) {
    case '首頁':
    case '上映中電影':
      document.title = '上映中電影 - 影訊'
      break
    case '影城地圖':
      document.title = '影城地圖 - 影訊'
      break
    case '影城電影':
      if (theater.value)
        document.title = `${theater.value.name} - 影訊`
      break
    default:
      document.title = '影訊'
      console.warn('未知頁面')
      break
  }
}

// 不用 onMounted 因為該方法不隸屬於 <script setup> 底下
document.addEventListener('DOMContentLoaded', switchTitle)

watch([activeTab, theater], switchTitle)
