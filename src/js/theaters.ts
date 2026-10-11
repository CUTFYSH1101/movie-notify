import { API } from '@shared/paths.ts'
import { type Filters } from '@/js/filters.ts'

export async function fetch_theaters(f: Filters) {
  const params = new URLSearchParams()
  if (f.notDefault('city')) params.append('city', f.city)
  const res = await fetch(`${API.theaters}?${params}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}