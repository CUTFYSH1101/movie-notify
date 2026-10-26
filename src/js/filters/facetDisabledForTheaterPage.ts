import type { Option } from '@/js/filters/Option.ts'
import { ALL, type FilterKey } from '@/js/filters/filters.ts';
import type { Facets } from '@/js/state/theaterPageDatasLifecycle.ts'


export function withDisabled<T extends Option>(from: T[], colName: FilterKey, facets?: Facets): (T & {
  disabled: boolean
})[] {
  if (!facets) return from.map(item => ({ ...item, disabled: false }))
  const has = new Set<string | null>(facets[colName])
  return from.map(item => ({ ...item, disabled: !!item.value && item.value !== ALL && !has.has(item['value']) }))
}

export function withVisibility<T extends Option>(from: T[], colName: FilterKey, facets?: Facets): (T & {
  disabled: boolean
})[] {
  return withDisabled(from, colName, facets).sort((a, b) => Number(a.disabled) - Number(b.disabled))
}