import { reactive } from 'vue'

export interface Filters {
  theater: string
  rating: string
  date: string
  version: string
}

const defaultFilters: Filters = {
  theater: '',
  rating: 'all',
  date: '不限',
  version: '不限',
}

// 放在模組層級：所有 import 的元件拿到的都是同一份
// 為什麼用 reactive 而不是 ref：三個值放在同一個物件裡，
// 用 reactive 就能直接寫 filters.rating，不用多一層 .value
export const filters = reactive<Filters>({ ...defaultFilters })

export function resetFilters() {
  Object.assign(filters, defaultFilters)
}
