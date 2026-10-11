import { filters, Filters, ALL, type FilterKey } from '@/js/filters.ts'
import { allJoinShowings } from '@/js/datasLifecycle.ts'
import type { JoinShowing } from '@/js/showings.ts';

// region 不能選的選項 設定 disable
// { value: 't02a11', label: 'MUVIE CINEMAS台北松仁威秀', disabled: true },
// filters 欄位 → JoinShowing 欄位
const showingField = {
  theater: 'theater_id',
  movie: 'movie_title',
  rating: 'movie_rating_system',
  date: 'date',
  version: 'version',
  city: 'theater_city',
} as const satisfies Record<FilterKey, keyof JoinShowing>

// 用 f 的條件篩場次（同步，不打 API）
function filterJoinShowings(f: Filters): JoinShowing[] {
  const keyword = f.movie.trim()
  return allJoinShowings.value.filter(j =>
    (!f.theater || j.theater_id === f.theater) &&
    (!keyword || j.movie_title.includes(keyword)) &&
    (!f.rating || j.movie_rating_system === f.rating) &&
    (!f.date || j.date === f.date) &&
    (!f.version || j.version === f.version) &&
    (!f.city || j.theater_city === f.city)
  )
}

export function withDisabled<T extends { value: string }>(from: T[], colName: FilterKey): (T & { disabled: boolean })[] {
  // 將 filters 的 colName 欄位還原，用「其他」條件篩場次
  const filters_copy = Object.assign(new Filters(), filters)
  filters_copy.resetCol(colName)

  // 篩完的場次裡有出現的值
  const has = new Set<string | null>(filterJoinShowings(filters_copy).map(j => j[showingField[colName]]))

  // 沒出現的就 disable；「不限」永遠可選
  return from.map(item => ({ ...item, disabled: !!item.value && item.value !== ALL && !has.has(item.value) }))
}

// endregion
