import { computed, ref } from 'vue'
import HomePage from '@/components/HomePage.vue'
import TaiwanPage from '@/components/TaiwanPage.vue'
import TheaterPage from '@/components/TheaterPage.vue'

export type Tab = '首頁' | '上映中電影' | '影城地圖' | '影城電影'
export const activeTab = ref<Tab>('首頁')
export const isTab = (tab: Tab) => activeTab.value == tab
export const switchTab = (tab: Tab) => activeTab.value = tab
export const activeComponent = computed(() => {
  switch (activeTab.value) {
    case '首頁':
    case '上映中電影':
      return HomePage
    case '影城地圖':
      return TaiwanPage
    case '影城電影':
      return TheaterPage
  }
})