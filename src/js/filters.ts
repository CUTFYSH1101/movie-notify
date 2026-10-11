import { computed, reactive } from 'vue'
import options from '@/js/filterOptions.ts'


export class Filters {
  theater: string = ''
  movie: string = ''
  rating: string = ''
  date: string = ''
  version: string = ''
  city: string = ''

  // ES6 class 內不能寫 function name
  toString(): string {
    return [
      `theater=${this.toLabel(options.theaters, this.theater)}`,
      `rating=${this.toLabel(options.ratings, this.rating)}`,
      `date=${this.toLabel(options.dates, this.date)}`
    ].join('\n')
  }

  toLabel(from: { value: string; label: string }[], value: string): string | undefined {
    return from.find(v => v.value === value)?.label
  }

  notDefault(colName: FilterKey): boolean {
    return this[colName] != null && this[colName] !== DEFAULTS[colName]
  }

  reset() {
    Object.assign(this, DEFAULTS)
  }
}

type FilterKey = 'theater' | 'movie' | 'rating' | 'date' | 'version' | 'city'
const DEFAULTS = new Filters()

// 放在模組層級：所有 import 的元件拿到的都是同一份
// 為什麼用 reactive 而不是 ref：三個值放在同一個物件裡，
// 用 reactive 就能直接寫 filters.rating，不用多一層 .value
export const filters = reactive<Filters>(new Filters())

// region Nuxt UI 的 <option> 的 value 屬性不能為 ''，但如果設定為''以外的字，SQL會以為有參數
// v-model 其實就是 :model-value 加上 @update:model-value，可以拆開來寫
const ALL = 'all'

const theater_get_set = computed({
  get: () => withAll(filters.theater),
  set: (newValue: string) => { filters.theater = fromAll(newValue) },
})
const rating_get_set = computed({
  get: () => withAll(filters.rating),
  set: (newValue: string) => { filters.rating = fromAll(newValue) },
})
const date_get_set = computed({
  get: () => withAll(filters.date),
  set: (newValue: string) => { filters.date = fromAll(newValue) },
})
const version_get_set = computed({
  get: () => withAll(filters.version),
  set: (newValue: string) => { filters.version = fromAll(newValue) },
})
export const filters_get_set = reactive({
  theater: theater_get_set,
  rating: rating_get_set,
  date: date_get_set,
  version: version_get_set
})

// `T[]`相當於`{ value: string; label: string }[]`
// 或`{ value: string; label: string, img: string }[]`
// withAll 表示把 '' 翻譯成 ALL
// fromAll 表示把 ALL 翻譯回 ''
export function withAlls<T extends { value: string }>(from: T[]): T[] {
  return from.map(el => ({ ...el, value: el.value || ALL }))
}

export function fromAlls<T extends { value: string }>(from: T[]): T[] {
  return from.map(el => ({ ...el, value: el.value === ALL ? '' : el.value }))
}

function withAll(value: string): string {
  return value || ALL
}

function fromAll(value: string): string {
  return value === ALL ? '' : value
}

// endregion