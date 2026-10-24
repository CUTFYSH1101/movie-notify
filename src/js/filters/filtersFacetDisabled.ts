import { API } from '@shared/paths.ts'
import { ALL, FILTER_KEYS, type Filters, type FilterKey } from '@/js/filters/filters.ts'
import type { Option } from '@/js/filters/Option.ts'

// region ※AI※ facet：向後端取得每個篩選欄位「還可以選」的值
// 例如 { date: ['2026/09/29 (二)'], theater: ['台北信義威秀', '大巨蛋秀泰影城'], ... }
// 影城回傳的是名稱，不是 id
export type Facets = Record<FilterKey, (string | null)[]>

// 後端算某一欄時，會用「其他」欄位的條件篩，所以前端直接把全部條件送出去就好
export async function fetchFacets(f?: Filters): Promise<Facets> {
  const params = new URLSearchParams()
  if (f) {
    for (const key of FILTER_KEYS) {
      if (f.notDefault(key)) params.append(key, f[key])
    }
  }
  const res = await fetch(`${API.facet}?${params}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// endregion

// region ※AI※ 不能選的選項 設定 disable
// { value: 't02a11', label: 'MUVIE CINEMAS台北松仁威秀', disabled: true },
// 哪些值還可以選，由後端 /api/facet 算好（facets），前端只負責比對
export function withDisabled<T extends Option>(from: T[], colName: FilterKey, facets?: Facets): (T & {
  disabled: boolean
})[] {
  // facets 還沒載入前，全部都可以選
  if (!facets) return from.map(item => ({ ...item, disabled: false }))

  // 後端已經用「其他」欄位的條件，算好這一欄還有出現的值
  const has = new Set<string | null>(facets[colName])  // 傳入 'date' 回傳 API 中的 date_list

  // 影城後端回傳的是名稱，所以拿選項的 label 比對；其他欄位拿 value 比對
  const compareKey = colName === 'theater' ? 'label' : 'value'

  // 沒出現的就 disable；「不限」永遠可選
  // 回傳舉例：
  /*[
    { value: '', label: '不限', disabled: false },
    { value: '2026/09/29 (二)', label: '2026/09/29 (二)', disabled: false },
    { value: '2026/10/21 (三)', label: '2026/10/21 (三)', disabled: true },
  ]*/
  // disabled: 非空值 && 跳過'不限' && date_list.has()
  // item[compareKey] 如果是影城回傳 label ，其他的回傳 value 的值
  return from.map(item => ({ ...item, disabled: !!item.value && item.value !== ALL && !has.has(item[compareKey]) }))
}

export function withVisibility<T extends Option>(from: T[], colName: FilterKey, facets?: Facets): T[] {
  return withDisabled(from, colName, facets).sort((a, b) => Number(a.disabled) - Number(b.disabled))
}

// endregion
